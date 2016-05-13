/// <reference path="../../../typings/main.d.ts" />

import jsyaml=require("../jsyaml/jsyaml2lowLevel")
import defs=require("raml-definition-system")
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")
import _=require("underscore")
import yaml=require("yaml-ast-parser")
import def=require( "raml-definition-system");
import high=require("../highLevelAST");
import hlimpl=require("../highLevelImpl")
import linterApi=require("./linterApi")
import core=require("../wrapped-ast/parserCore")
import path=require("path")
import fs=require("fs");
import universes=require("../tools/universe")
import universeHelpers=require("../tools/universeHelpers")
import services=defs
function findLastAttributeIndex(n:hl.IHighLevelNode): number {
    var last = -1;
    var children = n.lowLevel().children();
    for(var i=0; i<children.length; i++) {
        var node = <jsyaml.ASTNode>children[i];
        if(!node.isMapping()) continue;
        var name = node.asMapping().key.value;
        var property = n.definition().property(name);
        if(!property) continue;
        if((<defs.Property>property).isFromParentValue() || property.range().hasValueTypeInHierarchy()) {
            last = i;
        }
    }
    //console.log('last attr index1: ' + last);
    return last;
}
function findInsertionPointLowLevel(node:hl.IHighLevelNode,llnode: ll.ILowLevelASTNode, property: hl.IProperty, attr: boolean):ll.ILowLevelASTNode{
    //console.log('LL find insertion: node is attr: ' + attr);
    var insertionPoint = null;
    var embed = property && property.getAdapter(services.RAMLPropertyService).isEmbedMap();
    if (embed&&_.find(node.lowLevel().children(),x=>x.key()==property.nameId())){
        embed=false;
    }
    if (attr||embed) {
        var last = findLastAttribute(node);
        if (!last){
            //insertionPoint = new jsyaml.InsertionPoint(jsyaml.InsertionPointType.START);
            insertionPoint = jsyaml.InsertionPoint.atStart();
        } else {
            insertionPoint = last;
        }
        //insertionPoint.show('Insertion');
    }
    return insertionPoint;
}

function findInsertionPoint(where:hlimpl.ASTNodeImpl,node:hl.IHighLevelNode|hl.IAttribute):ll.ILowLevelASTNode{
    //console.log('find insertion point for node (HL): ' + node.property().name() + '; attr: ' + node.isAttr());
    //console.log('node1: ' + node.lowLevel().text());
    //always insert attributes at start
    if(!where.isStub()) {
        where.clearChildrenCache();
    }
    var ch=where.children();
    var embed=node.property()&&node.property().getAdapter(services.RAMLPropertyService).isEmbedMap();
    if (embed&&_.find(where.lowLevel().children(),x=>x.key()==node.property().nameId())){
        embed=false;
    }
    var uh = universeHelpers;

    if((node.isAttr()||embed) && !(universeHelpers.isMethodType(where.definition()) && node.property && universeHelpers.isIsProperty(node.property()))) {
        var toRet:ll.ILowLevelASTNode=null;
        for (var i = 0; i < ch.length; i++) {
            if (!ch[i].isAttr()){
                break;
            } else{
                toRet=ch[i].lowLevel();
            }
        }
        if (toRet==null){
            toRet=where.lowLevel();
        }
        return toRet;
    } else {
        var pname = node.property().nameId();
        var cls = <def.NodeClass>where.definition();
        var props = cls.allProperties();
        //console.log('class: ' + cls.name());
        //props.forEach(x=> console.log('  prop: ' + x.name()));
        var pindex = cls.propertyIndex(pname);
        if(pindex < 0) {
            return null;
            //throw 'unknown property: ' + cls.name() + '.' + pname;
        }
        var llchilds = where.lowLevel().children();
        //console.log('lookup: ' + pname + ' index: ' + pindex + ' childs: ' + llchilds.length);
        for(var i=0; i<llchilds.length; i++) {
            var llch = <jsyaml.ASTNode>llchilds[i];
            //console.log('  child: ' + llch.kindName());
            if(!llch.isMapping()) continue;
            var cpnme = llch.asMapping().key.value;
            var pi = cls.propertyIndex(cpnme);
            //console.log('  property: ' + cpnme + ' index: ' + pi + ' at pos: ' + i);
            if(pi > pindex) {
                //console.log('  property: ' + cpnme + ' - found');
                var lastok = i-1;
                //console.log('lastok: ' + lastok);
                if(lastok < 0) {
                    //TODO insert at the very beginning
                    //console.log('insert to very beginning');
                    return null;
                } else {
                    console.log('insert to node: ' + lastok);
                    return llchilds[lastok];
                }
            } else {

            }
        }
        return null;
    }
    //console.log('HL insertion: ' + toRet);
    //return toRet;
}
export function removeNodeFrom(source:hlimpl.ASTNodeImpl,node:hl.IParseResult){
    if (source.isStub()){
        if (node instanceof hlimpl.ASTNodeImpl){
            var cm=<hlimpl.ASTNodeImpl>node;
            if (cm.isInEdit){
                return
            }
        }
        if (!source._children){
            return;
        }
        source._children=source._children.filter(x=>x!=node);
        return;
    }
    var command=new ll.CompositeCommand();
    if (node instanceof hlimpl.ASTNodeImpl){
        var aNode=<hlimpl.ASTNodeImpl>node;
        if (!aNode.property().getAdapter(services.RAMLPropertyService).isMerged()){
            if (source.elementsOfKind(aNode.property().nameId()).length==1){
                command.commands.push(ll.removeNode(source.lowLevel(), aNode.lowLevel().parent().parent()))
            } else {
                command.commands.push(ll.removeNode(source.lowLevel(), aNode.lowLevel()))
            }
        } else {
            command.commands.push(ll.removeNode(source.lowLevel(), aNode.lowLevel()))
        }
    } else {
        command.commands.push(ll.removeNode(source.lowLevel(), node.lowLevel()))
    }
    source.lowLevel().execute(command)
}
export function initEmptyRAMLFile(node:hl.IHighLevelNode){
    var llroot = <jsyaml.ASTNode>(<jsyaml.ASTNode>node.lowLevel()).root();
    var command=new ll.CompositeCommand();
    var newroot = jsyaml.createMap([]);
    command.commands.push(ll.initRamlFile(node.lowLevel(), newroot));
    node.lowLevel().execute(command);
    var root = <hlimpl.ASTNodeImpl>node.root();
    //console.log('root: ' + root);
    (<any>root)._node = newroot;
    root.clearChildrenCache();
}
export function setValue(node:hlimpl.ASTPropImpl,value: string|hlimpl.StructuredValue) {
    if (value == node.value()) return;
    var c = new ll.CompositeCommand();
    if(typeof value === 'string') {
        var val = <string>value;
        //FIXME actually isFromParentKey should be enough in future does not changing it now for safety reasons
        if ((<def.Property>node.property()).isFromParentKey()||(<def.Property>node.property()).isAnnotation()) {
            if ((<def.Property>node.property()).isAnnotation()){
                val='('+val+')';
            }
            c.commands.push(ll.setKey(node.lowLevel(), val));
        } else {
            if ((!val || val.length == 0) && !node.isEmbedded()) {
                c.commands.push(ll.removeNode(node.lowLevel().parent(), node.lowLevel()));
                (<hlimpl.ASTNodeImpl>node.parent()).clearChildrenCache();
            } else {
                if(!val) val = '';
                c.commands.push(ll.setAttr(node.lowLevel(), val));
            }
        }
    } else {
        if ((<def.Property>node.property()).isFromParentKey()) {
            throw new Error("couldn't set structured value to a key: " + node.property().nameId());
        }
        var sval = <hlimpl.StructuredValue>value;
        c.commands.push(ll.setAttrStructured(node.lowLevel(), sval));
    }
    node.lowLevel().execute(c);
}
export function addStringValue(attr:hlimpl.ASTPropImpl,value: string) {
    var sc = jsyaml.createScalar(value);
    var target = <jsyaml.ASTNode>attr.lowLevel();
    //console.log('add to target: ' + target.kindName());
    if(target.isScalar()) {
        target = target.parent();
    } else if(target.isMapping()) {

    }
    var command = new ll.CompositeCommand();
    command.commands.push(ll.insertNode(target, sc, null, true));
    attr.lowLevel().execute(command);
    (<hlimpl.ASTNodeImpl>attr.parent()).clearChildrenCache();
}

export function addStructuredValue(attr:hlimpl.ASTPropImpl,sv: hlimpl.StructuredValue) {
    //var sc = jsyaml.createScalar(value);
    var target = <jsyaml.ASTNode>attr.lowLevel();
    //console.log('add to target: ' + target.kindName());
    if(target.isScalar()) {
        target = target.parent();
    } else if(target.isMapping()) {
        var ln = <jsyaml.ASTNode>attr.lowLevel();
        //target = new jsyaml.ASTNode(target.asMapping().value, <jsyaml.CompilationUnit>ln.unit(), ln, null, null);
    }
    var command=new ll.CompositeCommand();
    command.commands.push(ll.insertNode(target, sv.lowLevel(), null, true));
    attr.lowLevel().execute(command);
    (<hlimpl.ASTNodeImpl>attr.parent()).clearChildrenCache();
}
export function removeAttr(attr:hlimpl.ASTPropImpl) {
    var llparent = attr.lowLevel().parent();

    if(!attr.property().isMultiValue() && attr.isEmbedded()) {
        // it's embedded value, need to clean scalar instead
        //console.log('embedded!');
        attr.setValue('');
    } else {
        var command = new ll.CompositeCommand();

        command.commands.push(ll.removeNode(llparent, attr.lowLevel()));
        attr.lowLevel().execute(command);
        (<hlimpl.ASTNodeImpl>attr.parent()).clearChildrenCache();
    }
}

export function setValues(attr:hlimpl.ASTPropImpl,values: string[]) {
    if(!attr.property().isMultiValue()) throw new Error("setValue(string[]) only apply to multi-values properties");
    var node = attr.parent();
    if(attr.isEmpty()) {
        // nothing to remove so...
    } else {
        var llnode = <jsyaml.ASTNode>node.lowLevel();
        var attrs = node.attributes(attr.name());
        attrs.forEach(attr => attr.remove());
    }
    if (values.length == 1 && attr.property().isDescriminator()) {
        node.attrOrCreate(attr.name()).setValue(values[0])
    } else {
        values.forEach(val =>
            node.attrOrCreate(attr.name()).addValue(val)
        );
    }
}
export function setKey(node:hlimpl.ASTPropImpl,value: string) {
    if (value == node.name()) return;
    var c = new ll.CompositeCommand();
    c.commands.push(ll.setKey(node.lowLevel(), value));
    node.lowLevel().execute(c);
}
export function createAttr(node:hlimpl.ASTNodeImpl,n:string,v:string){
    var mapping = jsyaml.createMapping(n,v);

    var map;

    if(node.definition() && node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)) {
        if(node.lowLevel() && node.lowLevel().valueKind() === yaml.Kind.SCALAR) {
            var typePropertyName = universes.Universe10.TypeDeclaration.properties.type.name;

            var typeMapping = jsyaml.createMapping(typePropertyName, node.lowLevel().value());

            var command = new ll.CompositeCommand();

            command.commands.push(ll.setAttr(node.lowLevel(), ""));

            node.lowLevel().execute(command);

            command = new ll.CompositeCommand();

            var insertionPoint = findInsertionPointLowLevel(node, typeMapping, node.definition().property(typePropertyName), true);

            command.commands.push(ll.insertNode(node.lowLevel(), typeMapping, insertionPoint));

            node.lowLevel().execute(command);
        }
    }

    //console.log('create attribute: ' + n);
    if(node.isStub()) {
        //console.log('create-attr: stub case');
        var insertionIndex = findLastAttributeIndex(node);
        //console.log('stub insertion index: ' + insertionIndex);
        node.lowLevel().addChild(mapping, insertionIndex+1);
        //console.log('insertion: ' + insertionPoint);
        //insertionPoint.show("INSERTION");
        //node.lowLevel().show("ADDED");
    } else {
        //console.log('root: ' + llroot.kindName());
        if(node.isEmptyRamlFile()) {
            node.initRamlFile();
        }
        //console.log('create-attr: real node case');
        //node._node.addChild(mapping);
        //node.clearChildrenCache();
        var command=new ll.CompositeCommand();
        var insertionPoint = findInsertionPointLowLevel(node,mapping, node.definition().property(n), true);
        //command.commands.push(ll.insertNode(node.lowLevel(), mapping, null));
        //var toseq = node.property().isMultiValue();

        command.commands.push(ll.insertNode(node.lowLevel(), mapping, insertionPoint));
        node.lowLevel().execute(command);
        //insertionPoint.show("INSERTION");
        //node.lowLevel().show("ADDED");
    }
    node.clearChildrenCache();
}

function findLastAttribute(node:hl.IHighLevelNode): jsyaml.ASTNode {
    var childs = node.lowLevel().children();
    var index = findLastAttributeIndex(node);
    //console.log('last attr index2: ' + index);
    return (index< 0)? null : <jsyaml.ASTNode>childs[index];
}

export function addToNode(target:hlimpl.ASTNodeImpl,node:hl.IParseResult){
    if(!target.isStub() && target.isEmptyRamlFile()) {
        target.initRamlFile();
    }
    var llnode = <jsyaml.ASTNode>node.lowLevel();
    if (!target._children){
        target._children=[];
    }
    if (!node.property()){
        //now we should find correct property;
        var an=<hlimpl.ASTNodeImpl>node;
        var allProps=target.definition().allProperties()

        var cp:hl.IProperty=null;
        allProps.forEach(x=>{
            var r=x.range();
            if (r==an.definition()){
                cp=x;
            }
            var isOk=_.find(an.definition().allSuperTypes(),x=>x==r);
            if (isOk){
                cp=x;
            }
        });
        if (!cp){
            throw new Error("Unable to find correct child")
        }
        else{
            an.patchProp(cp);
        }
    }

    var insertionPoint = findInsertionPoint(target,<hl.IHighLevelNode|hl.IAttribute>node);

    //console.log('high level op: ' + target.property() + '.add ' + node.property().name());
    if(insertionPoint) {
        //insertionPoint.show('add: insertion point: ');
    }

    //var newLowLevel:ll.ILowLevelASTNode=null;
    var command=new ll.CompositeCommand();
    //now we need to understand to which low level node it should go
    //command.commands.push(ll.insertNode(target.lowLevel(), node.lowLevel()))
    var insertionTarget = null;
    if (node.property().getAdapter(services.RAMLPropertyService).isMerged()||node.property().range().hasValueTypeInHierarchy()){
        //console.log('CASE 1');
        //newLowLevel = node.lowLevel();
        command.commands.push(ll.insertNode(target.lowLevel(), node.lowLevel(), insertionPoint));
        insertionTarget = target.lowLevel();
    } else{
        //console.log('CASE 2');
        var name = node.property().nameId();
        var target2 = target.lowLevel();
        //target.show('TARGET:');
        //llnode.show('NODE:');

        var found = (<jsyaml.ASTNode>target.lowLevel()).find(name);
        insertionTarget = found;
        if (!found) {
            //console.log('node not found');
            var nn:jsyaml.ASTNode = null;
            //var nn: jsyaml.ASTNode = jsyaml.createSeqNode(name);
            //var mapping = <yaml.YAMLMapping>nn._actualNode();
            //var seq: yaml.YAMLSequence = <yaml.YAMLSequence>mapping.value;
            //if(!seq.items) seq.items = [];
            //seq.items.push((<jsyaml.ASTNode>node.lowLevel())._actualNode());
            if (node.property().getAdapter(services.RAMLPropertyService).isEmbedMap()){
                var v10 = target.definition().universe().version() == 'RAML10';
                if(llnode.isValueMap() && v10)
                    nn = jsyaml.createMapNode(name);
                else
                    nn = jsyaml.createSeqNode(name);
                //console.log('NN: ' + yaml.Kind[nn._actualNode().kind]);
                nn.addChild(node.lowLevel());
                //newLowLevel=nn;
            } else{
                nn=jsyaml.createNode(name);
                nn.addChild(node.lowLevel());
                //newLowLevel=nn;
            }
            //nn.show('WRAPPED NODE:');
            //target.show('INSERT WRAPPED NODE TO:');
            command.commands.push(ll.insertNode(target2, nn, insertionPoint));
            insertionTarget = target2;
        } else {
            //console.log('node found');
            //found.show('INSERT2: ');
            if (node.property().getAdapter(services.RAMLPropertyService).isEmbedMap()){
                //newLowLevel=node.lowLevel();
                command.commands.push(ll.insertNode(found, node.lowLevel(),insertionPoint,true));
            } else {
                //newLowLevel=node.lowLevel();
                command.commands.push(ll.insertNode(found, node.lowLevel(),insertionPoint,false));
            }
        }

    }
    if (target.isStub()){
        var insertionIndex = findLastAttributeIndex(target);
        if(insertionIndex < 0) {
            target._children.push(node);
        } else {
            //TODO behavior should be smarter we are ignoring insertion points now
            target._children.splice(insertionIndex, 0, node);
        }
        command.commands.forEach(x=>insertionTarget.addChild(<ll.ILowLevelASTNode>x.value));
        return;
    }
    target.lowLevel().execute(command)
    target._children.push(node);
    //now we need to add new child to our children;
    node.setParent(target);
}