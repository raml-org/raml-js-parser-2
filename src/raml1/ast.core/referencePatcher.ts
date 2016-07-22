/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST");
import hl=require("../highLevelAST");
import hlimpl=require("../highLevelImpl");
import yaml=require("yaml-ast-parser");
import jsyaml=require("../jsyaml/jsyaml2lowLevel");
import util=require("../../util/index");
import proxy=require("./LowLevelASTProxy");
import universeDef=require("../tools/universe");
import _ = require("underscore");
import universeHelpers = require("../tools/universeHelpers");
import namespaceResolver = require("../ast.core/namespaceResolver");
import def = require("raml-definition-system");
import typeExpressions = def.rt.typeExpressions;
import expander=require("./expander");

export class ReferencePatcher{

    process(
        hlNode:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode=hlNode,
        removeUses:boolean=false,
        patchNodeName:boolean=false){
        var resolver = (<jsyaml.Project>hlNode.lowLevel().unit().project()).namespaceResolver();
        this.patchReferences(hlNode,rootNode,resolver);
        if(patchNodeName){
            this.patchNodeName(hlNode,rootNode.lowLevel().unit(),resolver);
        }
        if(removeUses){
            this.removeUses(hlNode.lowLevel());
        }
        else {
            this.patchUses(hlNode.lowLevel(), resolver);
        }
        this.resetTypes(hlNode);
        hlNode.resetChildren();
    }

    patchReferences(
        node:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode = node,
        resolver:namespaceResolver.NamespaceResolver=new namespaceResolver.NamespaceResolver(),
        units:ll.ICompilationUnit[] = [ rootNode.lowLevel().unit() ]){

        if(node.definition().property(universeDef.Universe10.TypeDeclaration.properties.annotations.name)!=null){
            (<proxy.LowLevelCompositeNode>node.lowLevel()).preserveAnnotations();
            node.resetChildren();
        }

        var attrs = node.attrs();
        for(var attr of attrs){
            var appended = this.appendUnitIfNeeded(attr,units);
            this.patchReferenceAttr(attr,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }

        if(universeHelpers.isTypeDeclarationSibling(node.definition())){
            var appended = this.appendUnitIfNeeded(node,units);
            this.patchType(node,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }
        
        var childNodes = node.elements();
        for( var ch of childNodes) {
            var appended = this.appendUnitIfNeeded(ch,units);
            this.patchReferences(ch,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }
    }

    patchReferenceAttr(
        attr:hl.IAttribute,
        rootNode:hl.IHighLevelNode,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[]){

        var property = attr.property();
        if(!property.range().isAssignableFrom(universeDef.Universe10.Reference.name)){
            return;
        }
        var value = attr.value();
        if(value==null){
            return;
        }

        var llNode:proxy.LowLevelProxyNode = <proxy.LowLevelProxyNode>attr.lowLevel();
        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();
        
        var isAnnotation = universeHelpers.isAnnotationsProperty(property);
        if(typeof value == "string"){
            let stringToPatch = value;
            if(transformer!=null){
                var actualNode = this.toOriginal(llNode);
                stringToPatch = actualNode.value();
            }
            if(isAnnotation){
                stringToPatch = stringToPatch.substring(1,stringToPatch.length-1);
            }
            var newValue = this.patchTypeName(stringToPatch,rootNode.lowLevel().unit(),units,resolver,transformer,isAnnotation);
            if(newValue!=null){
                if(isAnnotation){
                    newValue = `(${newValue})`;
                }
                (<proxy.LowLevelProxyNode>attr.lowLevel()).setValueOverride(newValue);
            }
        }
        else{
            var sValue = <hlimpl.StructuredValue>value;
            var key = sValue.lowLevel().key();
            let stringToPatch = key;
            if(transformer!=null){
                var actualNode = this.toOriginal(sValue.lowLevel());
                stringToPatch = actualNode.key();
            }
            if(key!=null){
                if(isAnnotation){
                    stringToPatch = stringToPatch.substring(1,stringToPatch.length-1);
                }
                var newValue = this.patchTypeName(stringToPatch,rootNode.lowLevel().unit(),units,resolver,transformer,isAnnotation);
                if(newValue!=null) {
                    if(isAnnotation){
                        newValue = `(${newValue})`;
                    }
                    (<proxy.LowLevelProxyNode>sValue.lowLevel()).setKeyOverride(newValue);

                }
            }
        }

    }

    patchType(
        node:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[]){

        if(!node.localType().isExternal()) {

            var rootUnit = rootNode.lowLevel().unit();
            var localUnit = node.lowLevel().unit();
            var rootPath = rootUnit.absolutePath();
            var localPath = localUnit.absolutePath();

            if(rootPath != localPath) {
                var typeAttributes = node.attributes(universeDef.Universe10.TypeDeclaration.properties.type.name);
                for( var typeAttr of typeAttributes) {
                    var value = typeAttr.value();
                    if(typeof value == "string") {

                        var llNode:proxy.LowLevelProxyNode = <proxy.LowLevelProxyNode>typeAttr.lowLevel();
                        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();
                        var stringToPatch = value;
                        if(transformer!=null){
                            var actualNode = this.toOriginal(llNode);
                            stringToPatch = actualNode.value();
                        }
                        var gotExpression = false;
                        for(var i = 0 ; i < value.length ; i++ ) {
                            var ch = value.charAt(i);
                            if (ch == "|" || ch == "(" || ch == "[") {
                                gotExpression = true;
                                break;
                            }
                        }
                        var newValue:string;
                        if(gotExpression){
                            if(stringToPatch.indexOf("<<")>=0){
                                stringToPatch = escapeTemplateParameters(stringToPatch);
                            }
                            var expr = typeExpressions.parse(stringToPatch);
                            var gotPatch = false;
                            typeExpressions.visit(expr, x=> {
                                if (x.type == "name") {
                                    var lit = <typeExpressions.Literal>x;
                                    var typeName = unescapeTemplateParameters(lit.value);
                                    var patched = this.patchTypeName(typeName, rootUnit, units, resolver, transformer);
                                    if (patched != null) {
                                        lit.value = patched;
                                        gotPatch = true;
                                    }
                                }
                            });
                            if(gotPatch) {
                                newValue = typeExpressions.serializeToString(expr);
                            }
                            else{
                                newValue = value;                                
                            }
                        }
                        else{
                            newValue = this.patchTypeName(stringToPatch, rootUnit, units, resolver, transformer);
                        }
                        if (newValue != null) {
                            (<proxy.LowLevelProxyNode>typeAttr.lowLevel()).setValueOverride(newValue);
                            (<hlimpl.ASTPropImpl>typeAttr).overrideValue(null);
                        }
                    }
                    else{
                        var llTypeNode = _.find(node.lowLevel().children(),x=>x.key()=="type");
                        if(llTypeNode){
                            var def = node.definition().universe().type(universeDef.Universe10.TypeDeclaration.name);
                            var newNode = new hlimpl.ASTNodeImpl(llTypeNode,null,def,null);
                            var appended = this.appendUnitIfNeeded(newNode,units);
                            this.patchReferences(newNode,rootNode,resolver,units);
                            this.popUnitIfNeeded(units,appended);
                        }
                    }
                }
            }
        }
    }

    private patchTypeName(
        stringToPatch:string,
        rootUnit:ll.ICompilationUnit,
        units:ll.ICompilationUnit[],
        resolver:namespaceResolver.NamespaceResolver,
        transformer:expander.DefaultTransformer,
        isAnnotation=false)
    {
        var newValue:string;
        if (transformer) {
            if (stringToPatch && stringToPatch.indexOf("<<") >= 0) {
                var doContinue = true;
                var types = (<hlimpl.ASTNodeImpl>rootUnit.highLevel()).types();
                newValue = transformer.transform(stringToPatch, true, ()=>doContinue, (val, tr)=> {
                    var newVal = this.patchValue(val, rootUnit, resolver, tr.unitsChain);
                    if (newVal == null) {
                        newVal = val;
                    }
                    if(isAnnotation){
                        if (types.getAnnotationType(newVal) != null) {
                            doContinue = false;
                        }
                    }
                    else if (types.getType(newVal) != null) {
                        doContinue = false;
                    }
                    return newVal;
                }).value;
            }
        }
        if (newValue === undefined) {
            newValue = this.patchValue(stringToPatch, rootUnit, resolver, units);
        }
        return newValue;
    }

    patchNodeName(
        hlNode:hl.IHighLevelNode,
        rootUnit:ll.ICompilationUnit,
        resolver:namespaceResolver.NamespaceResolver){
        
        var llNode = <proxy.LowLevelProxyNode>hlNode.lowLevel();
        var key = llNode.key();
        var patched = this.patchValue(key,rootUnit,resolver,[llNode.unit()]);
        if(patched != null){
            llNode.setKeyOverride(patched);
        }
    }

    patchValue(
        value:string,
        rootUnit:ll.ICompilationUnit,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[]):string{

        var ind = value.lastIndexOf(".");

        var referencedUnit:ll.ICompilationUnit;
        var plainName:string;
        if (ind >= 0) {
            var oldNS = value.substring(0, ind);
            plainName = value.substring(ind + 1);

            for(var i = units.length ; i > 0 ; i--) {
                var localUnit = units[i-1];
                var nsMap = resolver.nsMap(localUnit);
                if(nsMap==null){
                    continue;
                }
                var info = nsMap[oldNS];
                if(info==null){
                    continue;
                }
                referencedUnit = info.unit;
                if(referencedUnit!=null){
                    break;
                }
            }
        }
        else {
            if(def.rt.builtInTypes().get(value)!=null){
                return null;
            }
            plainName = value;
            referencedUnit = units[units.length-1];
        }
        var newNS = resolver.resolveNamespace(rootUnit, referencedUnit);
        if(newNS==null){
            return null;
        }
        var newValue = newNS + "." + plainName;

        return newValue;
    }

    patchUses(node:ll.ILowLevelASTNode,resolver:namespaceResolver.NamespaceResolver){
        if(!(node instanceof proxy.LowLevelCompositeNode)){
            return;
        }
        var unit = node.unit();
        var extendedUnitMap = resolver.expandedPathMap(unit);
        if(extendedUnitMap==null){
            return;
        }
        var unitMap = resolver.pathMap(unit);
        if(!unitMap){
            unitMap = {};
        }

        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesNodes = originalChildren.filter(x=>
        x.key()==universeDef.Universe10.FragmentDeclaration.properties.uses.name);

        var oNode = this.toOriginal(node);
        var yamlNode = oNode;
        while(yamlNode instanceof proxy.LowLevelProxyNode){
            yamlNode = (<proxy.LowLevelProxyNode>yamlNode).originalNode();
        }

        var usesInfos = Object.keys(unitMap).map(x=>extendedUnitMap[x]);
        var extendedUsesInfos = Object.keys(extendedUnitMap).map(x=>extendedUnitMap[x])
            .filter(x=>!unitMap[x.absolutePath()]/*&&this.usedNamespaces[x.namespace()]*/);

        var u = node.unit();
        var unitPath = u.absolutePath();

        var newUses = jsyaml.createMapNode("uses");
        newUses["_parent"] = <jsyaml.ASTNode>yamlNode;
        newUses.setUnit(yamlNode.unit());
        for (var ui of usesInfos.concat(extendedUsesInfos)) {
            var up = ui.absolutePath();
            var ip = ui.includePath;
            var mapping = jsyaml.createMapping(ui.namespace(), ip);
            mapping.setUnit(yamlNode.unit());
            newUses.addChild(mapping);
        }

        if(usesNodes.length>0){
            cNode.replaceChild(usesNodes[0],newUses);
        }
        else{
            cNode.replaceChild(null,newUses);
        }

        while(node instanceof proxy.LowLevelProxyNode){
            node = (<proxy.LowLevelProxyNode>node).originalNode();
        }
        //node.actual()["usesNode"] = newUses;
    }

    removeUses(node:ll.ILowLevelASTNode){
        if(!(node instanceof proxy.LowLevelCompositeNode)){
            return;
        }
        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesNodes = originalChildren.filter(x=>
            x.key()==universeDef.Universe10.FragmentDeclaration.properties.uses.name);
        if(usesNodes.length>0){
            cNode.removeChild(usesNodes[0]);
        }
    }

    toOriginal(node:ll.ILowLevelASTNode){
        for(var i = 0; i<2 && node instanceof proxy.LowLevelProxyNode; i++){
            node = (<proxy.LowLevelProxyNode>node).originalNode();
        }
        return node;
    }


    resetTypes(hlNode:hl.IHighLevelNode) {
        for(var ch of hlNode.elements()){
            this.resetTypes(ch);
        }
        delete hlNode.lowLevel().actual().types;
        delete hlNode["_ptype"];
        delete hlNode["_types"];
        (<hlimpl.ASTNodeImpl>hlNode).setAssociatedType(null);
    };

    appendUnitIfNeeded(node:hl.IParseResult,units:ll.ICompilationUnit[]):boolean{
        var originalNode = this.toOriginal(node.lowLevel());
        var originalUnit = originalNode.unit();
        if(originalNode.valueKind()==yaml.Kind.INCLUDE_REF){
            var ref = originalNode.includePath();
            var includedUnit = originalUnit.resolve(ref);
            units.push(includedUnit);
            return true;
        }
        else {
            if (originalUnit.absolutePath() != units[units.length - 1].absolutePath()) {
                units.push(originalUnit);
                return true;
            }
            return false;
        }
    }
    popUnitIfNeeded(units:ll.ICompilationUnit[],appended:boolean) {
        if (appended) {
            units.pop();
        }
    }
}

var LEFT_PARAM_BOUND = "__LB__";
var LEFT_PARAM_BOUND_REGEXP = new RegExp(LEFT_PARAM_BOUND,"g");
var RIGHT_PARAM_BOUND = "__RB__";
var RIGHT_PARAM_BOUND_REGEXP = new RegExp(RIGHT_PARAM_BOUND,"g");
var MODIFICATOR_DELIMITER = "__MD__";
var MODIFICATOR_DELIMITER_REGEXP = new RegExp(MODIFICATOR_DELIMITER,"g");
var EXCLAMATION = "__EX__";
var EXCLAMATION_REGEXP = new RegExp(EXCLAMATION,"g");
var SPACE = "__SP__";
var SPACE_REGEXP = new RegExp(SPACE,"g");

function escapeTemplateParameters(str:string):string{
    var resultingString = "";
    var insideParam = 0;
    for(var i = 0 ; i < str.length; i++){
        if(util.stringStartsWith(str,"<<",i)){
            resultingString += LEFT_PARAM_BOUND;
            insideParam++;
            i++;
        }
        else if(util.stringStartsWith(str,">>",i)){
            resultingString += RIGHT_PARAM_BOUND;
            insideParam--;
            i++;
        }
        else if(insideParam>0){
            var ch = str.charAt(i);
            if(ch=="|"){
                resultingString += MODIFICATOR_DELIMITER;
            }
            else if(ch==" "){
                resultingString += SPACE;
            }
            else if(ch=="!"){
                resultingString += EXCLAMATION;
            }
            else {
                resultingString += ch;
            }
        }
        else{
            resultingString += str.charAt(i);
        }
    }
    return resultingString;
}

function unescapeTemplateParameters(str:string):string{
    if(str==null){
        return str;
    }
    var result = str.replace(LEFT_PARAM_BOUND_REGEXP, "<<")
                    .replace(RIGHT_PARAM_BOUND_REGEXP, ">>")
                    .replace(MODIFICATOR_DELIMITER_REGEXP, "|")
                    .replace(EXCLAMATION_REGEXP, "|")
                    .replace(SPACE_REGEXP, " ");

    return result;
}