/// <reference path="../../../typings/main.d.ts" />

import jsyaml=require("../jsyaml/jsyaml2lowLevel")
import defs=require("raml-definition-system")
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")
import yaml=require("yaml-ast-parser")
import _=require("underscore")
import def=defs
import high=require("../highLevelAST");
import hlimpl=require("../highLevelImpl")
import proxy=require("./LowLevelASTProxy")
import search=require("../../search/search-interface")
import universes=require("../tools/universe")
import universeHelpers=require("../tools/universeHelpers")
import services=defs
import ramlTypes=defs.rt;
var messageRegistry = require("../../../resources/errorMessages");

var mediaTypeParser = require("media-typer");

type ASTNodeImpl=hlimpl.ASTNodeImpl;
type ASTPropImpl=hlimpl.ASTPropImpl;
class KeyMatcher{

    parentValue:hl.IProperty
    parentKey:hl.IProperty
    canBeValue:hl.IProperty

    constructor(private _props:hl.IProperty[]){
        this.parentValue=_.find(_props,x=>(<defs.Property>x).isFromParentValue());
        this.parentKey=_.find(_props,x=>(<defs.Property>x).isFromParentKey());
        this.canBeValue=_.find(_props,x=>(<defs.Property>x).canBeValue());
    }

    add(p:hl.IProperty){
        this._props.push(p);
    }

    match(key:string):def.Property{
        var _res:hl.IProperty=null;
        var lastPref=""

        this._props.forEach(p=>{
            if (p.getAdapter(services.RAMLPropertyService).isSystem()){
                return;
            }
            if (p!=this.parentValue&&p!=this.parentKey&&p.matchKey(key)){
                if (p.keyPrefix()!=null) {
                    if (p.keyPrefix().length >= lastPref.length) {
                        lastPref=p.keyPrefix();
                        _res = p;
                    }
                }
                else{
                    _res=p;
                    lastPref=p.nameId();
                }
            }
        })
        return <def.Property>_res;
    }
}

function getAllOptions(c:hl.IUnionType,deep:number=0){
    if (deep>20){
        return [];
    }
    try {
        var result:hl.ITypeDefinition[] = [];
        var tp = c.leftType();
        if (tp) {
            result.push(tp);
        }
        var r = c.rightType();
        if (r) {
            if (r.hasUnionInHierarchy()) {
                var options = getAllOptions(r.unionInHierarchy(),deep+1);
                result = result.concat(options);
            }
            else {
                result.push(r);
            }
        }
        return result;
    } finally{

    }
}
var ad=0;

/**
 * Checks if a node is type declaration by a type shortcut having multiple inheritance TE as a value
 * @param node
 */
function isMultipleInheritanceTypeExpressionTypeDeclaration(node:hl.IHighLevelNode) : boolean {
    var definition = node.definition();
    if(!definition || !universeHelpers.isTypeDeclarationDescendant(definition)) return false;

    var lowLevel = node.lowLevel();
    if (lowLevel.valueKind() !== yaml.Kind.SEQ) return false;

    var children = lowLevel.children()
    if (children == null) return false;

    for (var child of children) {
        if (child.kind() !== yaml.Kind.SCALAR) return false;
    }

    return true;
}

export class BasicNodeBuilder implements hl.INodeBuilder{


    shouldDescriminate=false;

    process(node:hl.IHighLevelNode, childrenToAdopt:ll.ILowLevelASTNode[]):hl.IParseResult[] {
        var nn:any=node.lowLevel();
        var cv=<any>node;
        cv._mergedChildren=null;
        var cha=nn._node?nn._node:nn;
        try {
            if (cha['currentChildren']){
                return cha['currentChildren'];
            }
            if (!node.definition()) {
                return;
            }
            if (node.parent()==null&&(!this.shouldDescriminate)){
                this.shouldDescriminate=true;
                try {
                    var children = this.process(node, childrenToAdopt);
                    var ts = (<hlimpl.ASTNodeImpl>node);
                    ts._children = children;
                    ts._mergedChildren = null;
                    var t = doDescrimination(node);
                    if (t) {
                        ts.patchType(<hl.INodeDefinition>t);
                    }
                    var children = this.process(node, childrenToAdopt);
                    ts._children = children;
                    ts._mergedChildren = null;
                }finally {
                    this.shouldDescriminate = false;
                }

            }
            if (node.definition().hasUnionInHierarchy()){
                if (true &&
                    (node.parent() && node.property().nameId()==universes.Universe10.LibraryBase.properties.annotations.name)){
                var optins=getAllOptions(node.definition().unionInHierarchy());
                var actualResult=null;
                var bestResult=null;
                var bestType=null;
                var bestCount=1000;
                var llnode = <hlimpl.ASTNodeImpl>node;

                optins.forEach(x=>{
                    if (!actualResult) {
                        //TODO ADD UNION + Descriminator
                        if (!(x).hasUnionInHierarchy()) {
                            var tp = llnode.patchType(<hl.INodeDefinition>x);
                            if (ad==0) {
                                ad++;
                                try {
                                    var result = this.process(node, childrenToAdopt);


                                    var uc = 0;
                                    for (var i = 0; i < result.length; i++) {
                                        if (result[i].isUnknown()) {
                                            uc++;
                                        }
                                    }
                                    if (uc == 0) {
                                        actualResult = result;
                                    }
                                    if (bestCount > uc) {
                                        bestCount = uc;
                                        bestResult = result;
                                        bestType = x;
                                    }
                                }finally{
                                    ad--
                                }
                            }

                        }
                    }
                })
                if (actualResult) {
                    llnode.patchType(<hl.INodeDefinition>bestType);
                    return actualResult;
                }
                if (bestResult){
                    llnode.patchType(<hl.INodeDefinition>bestType);
                }
                }
            }
            var km = new KeyMatcher(node.definition().allProperties());
            if (node.parent()==null||node.lowLevel().includePath()){
                var u=node.definition().universe();
                if (u.version()=="RAML10"){
                    if (!node.definition().property("uses")) {
                        u.type("FragmentDeclaration").allProperties().forEach(x=>km.add(x));
                    }
                }
            }
            var aNode = <ASTNodeImpl>node;

            var allowsQuestion = aNode._allowQuestion || node.definition().getAdapter(services.RAMLService).getAllowQuestion();
            var res:hl.IParseResult[] = []
            //cha['currentChildren']=res;
            if (km.parentKey) {
                if (node.lowLevel().key()) {
                    var keyAttr = new hlimpl.ASTPropImpl(node.lowLevel(), node, km.parentKey.range(), km.parentKey, true);
                    res.push(keyAttr);

                    var isDefaultMediaType = node.property()
                        && universeHelpers.isBodyProperty(node.property())
                        && node.lowLevel().key()==node.property().nameId();

                    if(isDefaultMediaType) {
                        var isInsideTraitOrResourceType = isInTtraitOrResourceType(aNode);
                        if (!isInsideTraitOrResourceType&&aNode._computedKey) {

                            (<hlimpl.ASTPropImpl>keyAttr).overrideValue(aNode._computedKey);
                        }
                    }
                }
                if (node.lowLevel().valueKind() === yaml.Kind.SEQ
                    && !isMultipleInheritanceTypeExpressionTypeDeclaration(node)){

                    var error=new hlimpl.BasicASTNode(node.lowLevel(), aNode);
                    error.errorMessage= {
                        entry: messageRegistry.DEFINITION_SHOULD_BE_A_MAP,
                        parameters: { typeName: node.definition().nameId() }
                    };
                    res.push(error);
                    return res;
                }
            }


            if (node.lowLevel().value(true)!=null) {
                if (km.parentValue) {
                    res.push(new hlimpl.ASTPropImpl(node.lowLevel(), node, km.parentValue.range(), km.parentValue));
                }
                else if (km.canBeValue) {
                    var s = node.lowLevel().value();
                    if(s==null){
                        s = node.lowLevel().value(true);
                    }
                    if (typeof s == 'string' && (<string>s).trim().length > 0) {
                        //if (km.canBeValue.nameId()==universes.Universe10.Resource.properties.signature.name){
                        //      if (s.trim().charAt(0)=='('){
                        //          //TODO BETTER DECITION current one prevents completion from working correctly
                        //          //in few other cases
                        //          res.push(new hlimpl.ASTPropImpl(node.lowLevel(), node, km.canBeValue.range(), km.canBeValue));
                        //      }
                        //}
                        //else {
                            res.push(new hlimpl.ASTPropImpl(node.lowLevel(), node, km.canBeValue.range(), km.canBeValue));
                        //}
                    }
                    // else if (node.definition().isAssignableFrom(universes.Universe10.Annotation.name) &&
                    //     node.definition().property("value")) {
                    //     //"value" is a magic property name we do not have reflected in serialized def. system, so have to use plain string
                    //
                    //     var lowLevelNode = node.lowLevel();
                    //
                    //     var valueAttribute = _.find(lowLevelNode.children(), child=>{
                    //
                    //         return child.kind() == yaml.Kind.MAPPING && child.key() && child.key() == "value";
                    //     });
                    //
                    //     if (!valueAttribute) {
                    //         //annotation reference is not a scalar and does not have value attribute, but has value defined in the annotation declaration
                    //         //that means user wants to use a shortcut and specify value object directly under annotation
                    //
                    //         var valueProperty = node.definition().property("value")
                    //
                    //         //creating "value" high-level node referencing the same low-level node so the children can be collected
                    //         var valueNode = new hlimpl.ASTNodeImpl(node.lowLevel(), node, valueProperty.range(), valueProperty);
                    //         return [valueNode];
                    //     }
                    // }
                }
            }
            else {
                // if (km.canBeValue && (km.canBeValue.range() instanceof def.NodeClass || (
                //         km.canBeValue.range().hasUnionInHierarchy() && node.definition().isAssignableFrom(universes.Universe10.Annotation.name)))) {
                //
                //     //check check for annotation is just for safety, generally, imho, we should go inside for any unions
                //     var ch = new hlimpl.ASTNodeImpl(node.lowLevel(), aNode, <hl.INodeDefinition>km.canBeValue.range(), km.canBeValue);
                //     return [ch];
                // }
            }

            aNode._children = res;
            aNode._mergedChildren = null;
            if (!aNode.definition().getAdapter(services.RAMLService).isUserDefined()){
                if (aNode.definition().key()==universes.Universe08.Api||aNode.definition().key()==universes.Universe10.Api){
                        var uses=childrenToAdopt.filter(x=>x.key()=="uses");
                        res = this.processChildren(uses, aNode, res, allowsQuestion, km);
                        var types=childrenToAdopt.filter(x=>x.key()=="types");
                        res = this.processChildren(types, aNode, res, allowsQuestion, km);
                        var other=childrenToAdopt.filter(x=>(x.key()!="types"&&x.key()!="uses"));
                        res = this.processChildren(other, aNode, res, allowsQuestion, km);

                }
                else{

                    res = this.processChildren(childrenToAdopt, aNode, res, allowsQuestion, km);
                }
            }
            else {
                res = this.processChildren(childrenToAdopt, aNode, res, allowsQuestion, km);
            }
            aNode._children = res;
            aNode._mergedChildren = null;

            return res;
        }finally{
            
        }
    }

    private isTypeDeclarationShortcut(node:hlimpl.ASTNodeImpl, property: hl.IProperty) {
        var isTypeDeclarationType = universeHelpers.isTypeOrSchemaProperty(property);
        var isTypeDeclaration = node.definition() && universeHelpers.isTypeDeclarationTypeOrDescendant(node.definition());

        if(isTypeDeclaration && isTypeDeclarationType && node.lowLevel() && node.lowLevel().valueKind() === yaml.Kind.SEQ) {
            return true;
        }

        return false;
    }

    private processChildren(childrenToAdopt:ll.ILowLevelASTNode[], aNode:hlimpl.ASTNodeImpl, res:hl.IParseResult[], allowsQuestion:boolean, km:KeyMatcher):hl.IParseResult[] {
        var typeDeclarationName = universes.Universe10.TypeDeclaration.name;

        var typePropertyName = universes.Universe10.TypeDeclaration.properties.type.name;
        var itemsPropertyName = universes.Universe10.ArrayTypeDeclaration.properties.items.name;

        if(aNode.definition() && aNode.definition().isAssignableFrom(typeDeclarationName) && aNode.lowLevel() && (km.canBeValue&&(km.canBeValue.nameId() === typePropertyName||km.canBeValue.nameId() === itemsPropertyName)) && (<any>aNode).lowLevel()._node && (<any>aNode).lowLevel()._node.value && (<any>aNode).lowLevel()._node.value.kind === yaml.Kind.SEQ) {
            childrenToAdopt.forEach(child => {
                var property = new hlimpl.ASTPropImpl(child, aNode, km.canBeValue.range(), km.canBeValue);
                res.push(property);
            });

            return res;
        }

        var rootUnit = aNode.root().lowLevel().unit();
        childrenToAdopt.forEach(x=> {
            if(km.canBeValue && this.isTypeDeclarationShortcut(aNode, km.canBeValue)) {
                res.push(new hlimpl.ASTPropImpl(x, aNode, km.canBeValue.range(), km.canBeValue));

                return;
            }

            var key:string = x.key();
            //if (x.optional()&&!allowsQuestion) {
            //    return;
            //}
            var p = key!=null?km.match(key):null;

            if (p != null) {
                var range = p.range();
                if (p.isAnnotation() && key != "annotations") {
                    var pi = new hlimpl.ASTPropImpl(x, aNode, range, p)
                    res.push(pi);
                    return;
                }
                var um = false;
                var multyValue = p.isMultiValue();
                if (range.isArray()) {
                    multyValue = true;
                    range =range.array().componentType();
                    um = true;
                }
                else if (range.hasArrayInHierarchy()) {
                    multyValue = true;
                    um = true;
                }
                var xChildren:ll.ILowLevelASTNode[];
                var gotReuse = false;
                if(aNode.reuseMode()&&x.valueKind()!=yaml.Kind.SEQ) {
                    var rNode = aNode.reusedNode();
                    if(rNode) {
                        var arr = [x];
                        var llParent = aNode.lowLevel();
                        if (!p.isMerged() && multyValue) {
                            xChildren = [];
                            arr = x.children();
                            llParent = x;
                        }
                        for(var ch1 of arr) {
                            var cUnit = ch1.containingUnit();
                            if (cUnit && cUnit.absolutePath() != rootUnit.absolutePath()) {
                                var rChild = _.find(rNode.children(), ch2=>ch2.lowLevel().key() == ch1.key());
                                if (rChild && rChild.lowLevel().unit().absolutePath()==cUnit.absolutePath()) {
                                    gotReuse = true;
                                    res.push(rChild);
                                    (<hlimpl.BasicASTNode>rChild).setReused(true);
                                    rChild.setParent(aNode);
                                    if(rChild.isElement()) {
                                        (<hlimpl.ASTNodeImpl>rChild).resetRuntimeTypes();
                                    }
                                    if (aNode.isExpanded()) {
                                        (<proxy.LowLevelCompositeNode>llParent)
                                            .replaceChild(ch1, rChild.lowLevel());

                                        (<proxy.LowLevelCompositeNode>rChild.lowLevel()).setTransformer(
                                            (<proxy.LowLevelCompositeNode>llParent).transformer());
                                    }
                                    continue;
                                }
                            }
                            if(xChildren) {
                                xChildren.push(ch1);
                            }
                        }
                    }
                }
                if(!xChildren){
                    if(gotReuse){
                        return;
                    }
                    xChildren = x.children();
                }
                //TODO DESCRIMINATORS
                if (range.hasValueTypeInHierarchy()) {


                    var ch = xChildren;
                    var seq = (x.valueKind() == yaml.Kind.SEQ);
                    if ((seq && ch.length > 0 || ch.length > 1) && multyValue) {
                        if(ch.length > 1 && universeHelpers.isTypeDeclarationDescendant(aNode.definition())
                            &&(universeHelpers.isTypeOrSchemaProperty(p)||universeHelpers.isItemsProperty(p)) && x.valueKind() != yaml.Kind.SEQ){
                            var pi = new hlimpl.ASTPropImpl(x, aNode, range, p)
                            res.push(pi);
                            aNode.setComputed(p.nameId(), pi);
                        }
                        else {
                            var values:any[] = []
                            ch.forEach(y=> {
                                var pi = new hlimpl.ASTPropImpl(y, aNode, range, p)
                                res.push(pi)
                                values.push(y.value());
                            });
                            if (p.isInherited()) {
                                aNode.setComputed(p.nameId(), values);
                            }
                        }
                    }
                    else {

                        if (p.isInherited()) {
                            aNode.setComputed(p.nameId(), x.value());
                        }
                        var attrNode=new hlimpl.ASTPropImpl(x, aNode, range, p);
                        if ((seq||x.valueKind()==yaml.Kind.MAP)){
                            var rng = p.range().nameId();
                            if (!p.getAdapter(services.RAMLPropertyService).isExampleProperty()) {
                                if (rng == 'StringType') {
                                    rng = "string"
                                }
                                if (rng == 'NumberType') {
                                    rng = "number"
                                }
                                if (rng == 'BooleanType') {
                                    rng = "boolean"
                                }

                                if (rng == "string" || rng == "number" || rng == "boolean") {
                                    if (!x.isAnnotatedScalar()){
                                        attrNode.errorMessage = {
                                            entry: messageRegistry.INVALID_PROPERTY_RANGE,
                                            parameters: {
                                                propName: p.groupName(),
                                                range: rng
                                            }
                                        }

                                        if (xChildren.length==0&&p.groupName()=="enum"){
                                            attrNode.errorMessage = {
                                                entry: messageRegistry.ENUM_IS_EMPTY,
                                                parameters: {}
                                            };
                                            if (x.valueKind()==yaml.Kind.MAP){
                                                attrNode.errorMessage = {
                                                    entry: messageRegistry.ENUM_MUST_BE_AN_ARRAY,
                                                    parameters: {}
                                                };
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        res.push(attrNode);
                    }

                    //}
                    return;
                }
                else {
                    var rs:ASTNodeImpl[] = [];
                    //now we need determine actual type
                    aNode._children = res;
                    aNode._mergedChildren = null;

                    if (x.value()!=null && (typeof x.value()=='string'||typeof x.value()=='boolean'||typeof x.value()=='number')){
                        if ((""+x.value()).trim().length>0){
                                var c=p.range();
                                if (!c.allProperties().some(x=>{
                                        var srv=<def.Property>x;
                                        if (srv){
                                            return srv.canBeValue()&&srv.isFromParentValue();
                                        }
                                        return false;
                                    }))
                                {
                                    var bnode = new hlimpl.BasicASTNode(x, aNode);
                                    bnode.getLowLevelEnd=function(){
                                        return -1;
                                    }
                                    bnode.getLowLevelStart=function(){
                                        return -1;
                                    }
                                    bnode.knownProperty = p;
                                    res.push(bnode);
                                }

                            //return res;
                        }
                    }
                    if (!p.isMerged()) {
                        if (multyValue) {
                            if (p.getAdapter(services.RAMLPropertyService).isEmbedMap()) {

                                var chld = xChildren;
                                var newChld:ll.ILowLevelASTNode[]=[];
                                var hasSequenceComposition=false;
                                chld.forEach(n=>{
                                    if (n.kind()==yaml.Kind.INCLUDE_REF) {
                                        if (aNode.universe().version() == "RAML08") {
                                            n.children().forEach(y=> {
                                                var node = new hlimpl.ASTNodeImpl(y, aNode, <any> range, p);
                                                node._allowQuestion = allowsQuestion;
                                                rs.push(node);
                                                hasSequenceComposition = true;
                                            })
                                        }
                                        else{
                                            newChld.push(n);
                                        }
                                    }
                                    else{
                                        newChld.push(n);
                                    }
                                });
                                chld=newChld;
                                if (chld.length==0){
                                    if (p.range().key()==universes.Universe08.ResourceType){
                                        if (!hasSequenceComposition) {
                                            var error = new hlimpl.BasicASTNode(x, aNode);
                                            error.errorMessage = {
                                                entry: messageRegistry.PROPERTY_MUST_BE_A_MAP,
                                                parameters: { propName: p.nameId() }
                                            }
                                            res.push(error);
                                        }
                                    }
                                    if (x.valueKind()==yaml.Kind.SCALAR){
                                        if (p.range().key()==universes.Universe08.AbstractSecurityScheme) {
                                            var error = new hlimpl.BasicASTNode(x.parent(), aNode);
                                            error.errorMessage = {
                                                entry: messageRegistry.PROPERTY_MUST_BE_A_MAP,
                                                parameters: { propName: p.nameId() }
                                            }
                                            res.push(error);
                                        }
                                    }
                                }
                                chld.forEach(y=> {
                                    //TODO TRACK GROUP KEY
                                    var cld = y.children()
                                    if (!y.key() && cld.length == 1) {
                                        if (aNode.universe().version() != "RAML10"||aNode.parent()) {
                                            var node = new hlimpl.ASTNodeImpl(cld[0], aNode, <any> range, p);
                                            node._allowQuestion = allowsQuestion;
                                            rs.push(node);
                                        }
                                    }
                                    else {
                                        if (aNode.universe().version() == "RAML10") {
                                            var node = new hlimpl.ASTNodeImpl(y, aNode, <any> range, p);
                                            node._allowQuestion = allowsQuestion;
                                            rs.push(node);
                                        }
                                        else {
                                            var bnode = new hlimpl.BasicASTNode(y, aNode);
                                            res.push(bnode);
                                            if (y.key()) {
                                                bnode.needSequence = true;
                                            }
                                        }
                                    }
                                });
                                if(aNode.universe().version() == "RAML10"&&x.valueKind()==yaml.Kind.SEQ){
                                    var bnode = new hlimpl.BasicASTNode(x, aNode);
                                    res.push(bnode);
                                    bnode.needMap = true;
                                    bnode.knownProperty=p;
                                }
                            }
                            else {
                                var filter:any = {}
                                var inherited:hlimpl.ASTNodeImpl[] = []
                                if (defs.NodeClass.isInstance(range)) {
                                    var nc = <defs.NodeClass>range;

                                    if (nc.getAdapter(services.RAMLService).getCanInherit().length > 0) {
                                        nc.getAdapter(services.RAMLService).getCanInherit().forEach(v=> {
                                            var originalValue = aNode.computedValue(v);
                                            var actualValue:any[]=Array.isArray(originalValue)?originalValue:[originalValue];
                                            for (var pos=0;pos<actualValue.length;pos++) {
                                                var vl=actualValue[pos];
                                                if (vl && p.nameId() == universes.Universe10.Response.properties.body.name) {
                                                    var exists=_.find(xChildren, x=>x.key() == vl);

                                                    var originalParent: any = x;
                                                    
                                                    while(originalParent.originalNode) {
                                                        originalParent = originalParent.originalNode();
                                                    }

                                                    var mediaTypeSibling = _.find(originalParent.children(), (sibling: any) => {
                                                        try {
                                                            mediaTypeParser.parse(sibling.key());

                                                            return true;
                                                        } catch (exception) {
                                                            return false;
                                                        }
                                                    });

                                                    if(!mediaTypeSibling) {
                                                        //we can create inherited node;
                                                        var pc = aNode.parent().definition().key();
                                                        var node = new hlimpl.ASTNodeImpl(x, aNode, <any> range, p);
                                                        (<any>node)._computedKey=vl;
                                                        if (pc == universes.Universe10.MethodBase || pc == universes.Universe08.MethodBase) {
                                                            node.setComputed("form", "true")//FIXME
                                                        }

                                                        var isInsideTraitOrResourceType = isInTtraitOrResourceType(aNode);
                                                        var t = descriminate(p, aNode, node);
                                                        if (t) {
                                                            if (!isInsideTraitOrResourceType) {
                                                                (<defs.NodeClass>t).setName(vl);
                                                            }
                                                            node.patchType(<any>t)
                                                        }
                                                        var ch = node.children();
                                                        //this are false unknowns actual unknowns will be reported by parent node
                                                        node._children = ch.filter(x=>!x.isUnknown())
                                                        node._mergedChildren = null;
                                                        node._allowQuestion = allowsQuestion;
                                                        if (!exists) {
                                                            inherited.push(node);
                                                        }
                                                        node.children().forEach(x=> {
                                                            var p = x.property();
                                                            if (p&&p.getAdapter(services.RAMLPropertyService).isKey()) {
                                                                var atr = <ASTPropImpl>x;
                                                                atr._computed = true;
                                                                return;
                                                            }
                                                            if (x.isElement()) {
                                                                if (!x.property().getAdapter(services.RAMLPropertyService).isMerged()) {
                                                                    filter[x.property().nameId()] = true;
                                                                }
                                                            }
                                                            if ((<defs.Property>x.property()).isAnnotation()) {
                                                                var atr = <ASTPropImpl>x;
                                                                var vl = atr.value();
                                                                var strVal = "";
                                                                if (hlimpl.StructuredValue.isInstance(vl)) {
                                                                    strVal = (<hlimpl.StructuredValue>vl).valueName();
                                                                }
                                                                else {
                                                                    strVal = "" + vl;
                                                                }
                                                                filter["(" + strVal + ")"] = true;
                                                            }
                                                            else {
                                                                filter[x.name()] = true;
                                                            }
                                                        })
                                                        var ap = node.definition().allProperties();
                                                        ap.forEach(p=> {
                                                            if (p.getAdapter(services.RAMLPropertyService).isKey()) {
                                                                return;
                                                            }
                                                            if (p.getAdapter(services.RAMLPropertyService).isSystem()) {
                                                                return;
                                                            }
                                                            if (node.lowLevel().children().some(x=>x.key() == p.nameId())) {
                                                                filter[p.nameId()] = true;
                                                            }
                                                        });
                                                        node._computed = true;
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }
                                var parsed:hlimpl.ASTNodeImpl[] = []
                                if (xChildren.length==0){
                                    if (x.valueKind()==yaml.Kind.SEQ){

                                        if (p.range().key()==universes.Universe08.Parameter){
                                            var error=new hlimpl.BasicASTNode(x, aNode);
                                            error.errorMessage = {
                                                entry: messageRegistry.PROPERTY_MUST_BE_A_MAP,
                                                parameters: { propName: p.nameId() }
                                            }
                                            res.push(error);
                                        }


                                    }
                                }
                                if (p.nameId()==="documentation"&&x.valueKind()!==yaml.Kind.SEQ){
                                        if (!aNode.definition().getAdapter(services.RAMLService).isUserDefined()) {
                                            var error = new hlimpl.BasicASTNode(x, aNode);
                                            error.errorMessage = {
                                                entry: messageRegistry.PROPERTY_MUST_BE_A_SEQUENCE,
                                                parameters: { propName: p.nameId() }
                                            }
                                            res.push(error);
                                        }

                                }
                                else {
                                    xChildren.forEach(y=> {
                                        if (filter[y.key()]) {
                                            return;
                                        }
                                        if (y.valueKind() == yaml.Kind.SEQ) {
                                            var isRaml1 = aNode.definition().universe().version()=="RAML10"
                                            y.children().forEach(z=> {
                                                var node = new hlimpl.ASTNodeImpl(z, aNode, <any> range, p);
                                                node._allowQuestion = allowsQuestion;
                                                node.setNamePatch(y.key());
                                                if(isRaml1){
                                                    (<hlimpl.ASTNodeImpl>node).invalidSequence = true;
                                                }
                                                parsed.push(node);
                                            })
                                            if (y.children().length == 0) {
                                                var error = new hlimpl.BasicASTNode(y, aNode);
                                                if (p.range().key() == universes.Universe08.Parameter) {
                                                    error.errorMessage = {
                                                        entry: messageRegistry.NAMED_PARAMETER_NEEDS_TYPE,
                                                        parameters: {}
                                                    }
                                                }
                                                else {
                                                    error.errorMessage = {
                                                        entry: messageRegistry.NODE_SHOULD_HAVE_VALUE,
                                                        parameters: {}
                                                    }
                                                }
                                                res.push(error);
                                            }
                                        }
                                        else {
                                            var node = new hlimpl.ASTNodeImpl(y, aNode, <any> range, p);
                                            var dc = p.domain().key();
                                            if (p.nameId() == "body" && ( dc == universes.Universe08.MethodBase || dc == universes.Universe10.MethodBase)) {
                                                node.setComputed("form", "true")//FIXME

                                            }
                                            node._allowQuestion = allowsQuestion;
                                            parsed.push(node);
                                        }
                                    })
                                }


                                if (parsed.length > 0) {
                                    parsed.forEach(x=>rs.push(x));
                                }
                                else {
                                    inherited.forEach(x=>rs.push(x))
                                }
                            }
                        }
                        else {
                            //var y=xChildren[0];
                            rs.push(new hlimpl.ASTNodeImpl(x, aNode, <any> range, p));
                        }
                    }
                    else {
                        var node = new hlimpl.ASTNodeImpl(x, aNode, <any>range, p);
                        node._allowQuestion = allowsQuestion;
                        rs.push(node);
                    }
                    aNode._children = aNode._children.concat(rs);
                    aNode._mergedChildren = null;
                    res = res.concat(rs);
                    rs.forEach(x=> {
                        var rt = descriminate(p, aNode, x);
                        if (rt && rt != x.definition()) {
                            x.patchType(<hl.INodeDefinition>rt);
                        }
                        x._associatedDef = null;
                        p.childRestrictions().forEach(y=> {
                            x.setComputed(y.name, y.value)
                        })
                        var def = <hl.INodeDefinition>x.definition();
                    });
                }
            }
            else {
                if(!(proxy.LowLevelCompositeNode.isInstance(x))
                    ||(<proxy.LowLevelCompositeNode>x).primaryNode()!=null) {

                    res.push(new hlimpl.BasicASTNode(x, aNode));
                    //error
                }
            }
        })
        var rNode = aNode.reusedNode();
        if(rNode&&aNode.lowLevel().valueKind()!=yaml.Kind.SEQ){
            var cObj = {};
            rNode.elements().forEach(x=>cObj[x.property().nameId()+"_"+x.lowLevel().key()]=x);
            rNode.attrs().forEach(x=>cObj[x.property().nameId()+"_"+x.lowLevel().key()]=x);
            res.filter(ch=>ch.isElement()||ch.isAttr()).forEach(ch=>{
                var rChild = cObj[ch.property().nameId()+"_"+ch.lowLevel().key()];
                if(rChild && rChild != ch){
                    if(ch.isElement()&&ch.lowLevel().parent().valueKind()!=yaml.Kind.SEQ) {
                        (<hlimpl.ASTNodeImpl>ch).setReusedNode(rChild);
                        (<hlimpl.ASTNodeImpl>ch).setReuseMode(aNode.reuseMode());
                    }
                }
            });
        }
        return res;
    }
}
function getBaseType(node:hl.IHighLevelNode,expression:string):hl.ITypeDefinition{
    if (!expression) {
        return node.definition().universe().type(universes.Universe10.StringTypeDeclaration.name);
    }
    var pt=node.parsedType();

    if (pt.isString()){
        return (node.definition().universe().type(universes.Universe10.StringTypeDeclaration.name));
    }
    else if (pt.isNumber()){
        if (pt.isInteger()){
            return (node.definition().universe().type(universes.Universe10.IntegerTypeDeclaration.name));
        }
        return (node.definition().universe().type(universes.Universe10.NumberTypeDeclaration.name));
    }
    else if (pt.isBoolean()){
        return (node.definition().universe().type(universes.Universe10.BooleanTypeDeclaration.name));
    }
    else if (pt.isObject()){
        return (node.definition().universe().type(universes.Universe10.ObjectTypeDeclaration.name));
    }
    else if (pt.isArray()){
        return (node.definition().universe().type(universes.Universe10.ArrayTypeDeclaration.name));
    }
    else if (pt.isFile()){
        return (node.definition().universe().type(universes.Universe10.FileTypeDeclaration.name));
    }
    else if (pt.isDateTime()){
        return (node.definition().universe().type(universes.Universe10.DateTimeTypeDeclaration.name));
    }
    else if (pt.isDateTimeOnly()){
        return (node.definition().universe().type(universes.Universe10.DateTimeOnlyTypeDeclaration.name));
    }
    else if (pt.isDateOnly()){
        return (node.definition().universe().type(universes.Universe10.DateOnlyTypeDeclaration.name));
    }
    else if (pt.isTimeOnly()){
        return (node.definition().universe().type(universes.Universe10.TimeOnlyTypeDeclaration.name));
    }
    if (pt.isUnion()){
        return (node.definition().universe().type(universes.Universe10.UnionTypeDeclaration.name));
    }
    return (node.definition().universe().type(universes.Universe10.TypeDeclaration.name));
}

function transform(u:hl.IUniverse){
    return function (x){
        var m=u.type(x);
        if (!m){
            var ut=new defs.UserDefinedClass("",<defs.Universe>u,null,"","");
        }
        return m;
    }
}

function findFacetInTypeNode(typeNode : hl.IParseResult, facetName: string) {
    var typeNodeElement = typeNode.asElement();
    if (typeNodeElement == null) return null;

    var facets : hl.IHighLevelNode[] =
        typeNodeElement.elementsOfKind(
            universes.Universe10.TypeDeclaration.properties.facets.name);

    if (facets == null || facets.length == 0) return null;

    return _.find(facets, facet => {
        return facetName == facet.attrValue(universes.Universe10.TypeDeclaration.properties.name.name);
    })
}

function findFacetDeclaration(facet : ramlTypes.ITypeFacet) : def.SourceProvider {
    var owner = facet.owner();
    if (owner == null) return null;

    var facetName = facet.facetName();
    if (!facetName) return null;

    var ownerSource : any = owner.getExtra(ramlTypes.SOURCE_EXTRA);

    if (ownerSource == null) return null;

    if (!def.isSourceProvider(ownerSource) && !hl.isParseResult(ownerSource)) {
        return null;
    }

    return {
        getSource() {
            if (def.isSourceProvider(ownerSource)) {

                var resolvedSource = ownerSource.getSource();
                if (resolvedSource && hl.isParseResult(resolvedSource)) {
                    return findFacetInTypeNode(resolvedSource, facetName);
                }
            } else if (hl.isParseResult(ownerSource)) {

                return findFacetInTypeNode(ownerSource, facetName);
            }

            return null;
        },
        getClassIdentifier() : string[] {
            return [defs.SourceProvider.CLASS_IDENTIFIER];
        }
    }
}

function patchTypeWithFacets(originalType: hl.ITypeDefinition, nodeReferencingType:hl.IHighLevelNode,
    parentOfReferencingNode:hl.IHighLevelNode) {
    if (originalType == null) return null;

    var patchedType=new defs.NodeClass(nodeReferencingType.name(),
        <def.Universe>nodeReferencingType.definition().universe(),"","");

    var parsedRType=nodeReferencingType.parsedType();
    patchedType.addAdapter(parsedRType);
    parsedRType.allFacets().forEach(facet=>{
        if (facet.kind() == defs.tsInterfaces.MetaInformationKind.FacetDeclaration) {

            var propertySource = findFacetDeclaration(facet);

            var facetBasedProperty = null;
            if (propertySource != null) {
                facetBasedProperty = new defs.UserDefinedProp(facet.facetName(), null);
                facetBasedProperty.setSourceProvider(propertySource);
            } else {
                facetBasedProperty = new defs.Property(facet.facetName(), "");
            }

            var currentUniverse = null;
            if (parentOfReferencingNode) {
                currentUniverse = parentOfReferencingNode.definition().universe()
            } else {
                currentUniverse = nodeReferencingType.definition().universe()
            }

            facetBasedProperty.withRange(currentUniverse.type("StringType"));
            facetBasedProperty.withDomain(patchedType);
            facetBasedProperty.withGroupName(facet.facetName());
            facetBasedProperty.withRequired(false);
            facet.value();

            ramlTypes.setPropertyConstructor(x=> {
                var v = new defs.Property(x, "");
                v.unmerge();
                return v;
            });
            facetBasedProperty.withRange(ramlTypes.toNominal(facet.value(),transform(nodeReferencingType.definition().universe())))
            

        }
    })

    patchedType._superTypes.push(originalType);
    return patchedType;

    // return originalType;
}

function desc1(p:hl.IProperty, parent:hl.IHighLevelNode, x:hl.IHighLevelNode):hl.ITypeDefinition{
    var tp=x.attr("type");
    var value="";
    if (tp){

        var baseType= getBaseType(x,tp.value());

        var patchedType = patchTypeWithFacets(baseType, x, parent);

        if (patchedType) {
            if (patchedType.superTypes().length == 0) {
                (<def.NodeClass>patchedType)._superTypes.push(x.definition().universe().type(universes.Universe10.TypeDeclaration.name));
            }
        }

        return patchedType;
    }
    else{
        var propertiesName = universes.Universe10.ObjectTypeDeclaration.properties.properties.name;

        if (p) {
            if (p.nameId() == "body" || _.find(x.lowLevel().children(), x=>x.key() === propertiesName)) {
                return x.definition().universe().type(universes.Universe10.ObjectTypeDeclaration.name);
            }
        } else {
            if(!parent && x.lowLevel() && _.find(x.lowLevel().children(), x=>x.key() === propertiesName)) {
                return x.definition().universe().type(universes.Universe10.ObjectTypeDeclaration.name);
            }
        }
        return x.definition().universe().type(universes.Universe10.StringTypeDeclaration.name);
    }
}
export function doDescrimination(node:hl.IHighLevelNode) {
    try {
        var nodeDefenitionName = node.definition().nameId();

        var isApi = nodeDefenitionName === universes.Universe10.Api.name || nodeDefenitionName === universes.Universe08.Api.name;

        if (!isApi && !node.property() && !node.parent() && node.definition().nameId() === hlimpl.getFragmentDefenitionName(node)) {
            if(node.property()&&node.property().nameId()===universes.Universe10.LibraryBase.properties.annotationTypes.name) {
                return descriminate(null, null, node);
            }

            var result = null;

            var subTypes = node.definition().allSubTypes();

            subTypes.forEach(subType => {
                if (!result && match(subType,node, null)) {
                    result = subType;
                }
            });

            return result;
        }
    } catch(exception) {

    }

    return descriminate(node.property(), node.parent(), node);
}
function descriminate (p:hl.IProperty, parent:hl.IHighLevelNode, x:hl.IHighLevelNode):hl.ITypeDefinition {
    var n:any=x.lowLevel()
    if (p) {

        if (p.nameId() == universes.Universe10.FragmentDeclaration.properties.uses.name &&
            p.range().nameId() == universes.Universe10.Library.name) {
            //return null;
        }
    }
    var range=p?p.range().nameId():x.definition().nameId();
    if(n._node&&n._node['descriminate']){
        return null;
    }
    if (n._node) {
        n._node['descriminate'] = 1;
    }
    try {
        if (range == universes.Universe10.TypeDeclaration.name) {

            var res = desc1(p, parent, x);
            if (p || (!p && !parent && x.lowLevel())) {
                if (p && res != null && ((p.nameId() ==universes.Universe10.MethodBase.properties.body.name
                    || p.nameId() ==universes.Universe10.ArrayTypeDeclaration.properties.items.name
                    || p.nameId() ==universes.Universe10.Response.properties.headers.name) ||
                    p.nameId() ==universes.Universe10.MethodBase.properties.queryParameters.name)) {
                    var ares = new defs.UserDefinedClass(x.lowLevel().key(), <defs.Universe>res.universe(), x, x.lowLevel().unit() ? x.lowLevel().unit().path() : "", "");
                    ares._superTypes.push(res);
                    return ares;
                }
                if (res != null && universeHelpers.isAnnotationTypeType(x.definition())) {
                    var annotationType = descriminateAnnotationType(res);
                    var ares = new defs.UserDefinedClass(x.lowLevel().key(), <defs.Universe>res.universe(), x, x.lowLevel().unit() ? x.lowLevel().unit().path() : "", "");
                    ares._superTypes.push(annotationType);
                    ares._superTypes.push(res);
                    return ares;
                }
            }
            if (res) {
                return res;
            }
        }
        //generic case;
        var rt:hl.ITypeDefinition = null;
        if (p&&parent) {
            var types = search.findAllSubTypes(p, parent);
            if (types.length > 0) {
                types.forEach(y=> {
                    if (!rt) {
                        if (match(y,x, rt)) {
                            rt = y;
                        }
                    }
                })
            }
            return rt;
        }
    }
    finally{
        if (n._node) {
            delete n._node['descriminate'];
        }
    }
};

function descriminateAnnotationType(type:defs.IType):defs.IType{

        var arr = [ type ].concat(type.allSuperTypes());

        var candidate:defs.IType;
        for(var i = 0 ; i < arr.length ; i++){

            var t = arr[i];
            if((<defs.AbstractType>t).isUserDefined()){
                continue;
            }
            if((<defs.AbstractType>t).isUnion()){
                var ut = <hl.IUnionType>t;
                var lt = ut.leftType();
                var rt = ut.leftType();
                var lat = descriminateAnnotationType(lt);
                var rat = descriminateAnnotationType(lt);
                if(lat.isAssignableFrom(rat.nameId())&&(candidate==null||lat.isAssignableFrom(candidate.nameId()))){
                    candidate = lat;
                    continue;
                }
                if(rat.isAssignableFrom(lat.nameId())&&(candidate==null||rat.isAssignableFrom(candidate.nameId()))){
                    candidate = rat;
                    continue;
                }
                candidate = type.universe().type(universes.Universe10.UnionTypeDeclaration.name);
                break;
            }
            if((<defs.AbstractType>t).isArray()){
                candidate = type.universe().type(universes.Universe10.ArrayTypeDeclaration.name);
                break;
            }
            var subTypes = t.subTypes();
            for(var j = 0 ; j < subTypes.length ; j++){
                var st = subTypes[j];
                if(st.isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
                    if(candidate==null){
                        candidate = st;
                    }
                    else if(st.isAssignableFrom(candidate.nameId())){
                        candidate = st;
                    }
                }
            }
        }
        return candidate != null ? candidate : type.universe().type(universes.Universe10.TypeDeclaration.name);
    }

var isInTtraitOrResourceType = function (aNode) {
    var isInsideTraitOrResourceType = false;
    var parent_:hl.IHighLevelNode = aNode;
    while (parent_) {
        var pDef = parent_.definition();
        if (universeHelpers.isTraitType(pDef)
            || universeHelpers.isResourceTypeType(pDef)) {
            isInsideTraitOrResourceType = true;
            break;
        }
        parent_ = parent_.parent();
    }
    return isInsideTraitOrResourceType;
};

function match(t:hl.ITypeDefinition, r:hl.IParseResult,alreadyFound:hl.ITypeDefinition):boolean{

    //this.vReqInitied=true;
    if( r.isAttr()||r.isUnknown()){
        return false;
    }
    var el:hl.IHighLevelNode=<hl.IHighLevelNode>r;
    var hasSuperType=_.find(t.superTypes(),x=>{
            var dp= _.find(x.allProperties(),x=>(x).isDescriminator())
            if (dp) {
                var a = el.attr(dp.nameId());
                if (a) {
                    if (a.value() == t.nameId()) {
                        return true;
                    }
                }
            }
            return false;
        }
    );
    if (hasSuperType){
        return true;
    }

    if (t.valueRequirements().length==0){
        return false;
    }
    var matches=true;

    //descriminating constraint
    t.valueRequirements().forEach(x=>{
        var a=el.attr(x.name);
        if (a){
            if (a.value()==x.value){
                //do nothing
            }
            else{
                if (t.getAdapter(services.RAMLService).getConsumesRefs()){
                    var vl=a.value();
                    var allSubs:hl.ITypeDefinition[]=[];
                    t.superTypes().forEach(x=>x.allSubTypes().forEach(y=>{
                        allSubs.push(<any>y);
                    }));
                    var allSubNames:string[]=[];
                    _.unique(allSubs).forEach(x=>{
                        allSubNames.push(x.nameId());
                        x.valueRequirements().forEach(y=>{
                            allSubNames.push(y.value)
                        });
                        x.getAdapter(services.RAMLService).getAliases().forEach(y=>allSubNames.push(y))
                    })
                    if (_.find(allSubNames,x=>x==vl)) {
                        matches = false;
                    }
                }
                else {
                    matches = false;
                }
            }
        }
        else{
            var m= t.getAdapter(services.RAMLService).getDefining();
            var ms=false;
            m.forEach(x=>{
                el.lowLevel().children().forEach(y=>{
                        if (y.key()==x) {
                            ms = true;
                        }

                    }
                )});
            if (ms){
                matches=true;
                return;
            }
            if (!alreadyFound) {
                var pr = t.property(x.name)
                if (pr && pr.defaultValue() == x.value) {
                    //do nothing
                }
                else {
                    matches = false;
                }
            }
            else {
                matches = false;
            }
        }
    })
    return matches;
}