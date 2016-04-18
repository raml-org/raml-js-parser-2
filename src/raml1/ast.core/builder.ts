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
import search=require("./search")
import universes=require("../tools/universe")
import universeHelpers=require("../tools/universeHelpers")
import services=defs
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

export class BasicNodeBuilder implements hl.INodeBuilder{


    shouldDescriminate=false;

    process(node:hl.IHighLevelNode, childrenToAdopt:ll.ILowLevelASTNode[]):hl.IParseResult[] {
        var nn:any=node.lowLevel();
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
                    var t = doDescrimination(node);
                    if (t) {
                        ts.patchType(<hl.INodeDefinition>t);
                    }
                    var children = this.process(node, childrenToAdopt);
                    ts._children = children;
                }finally {
                    this.shouldDescriminate = false;
                }

            }
            if (node.definition().hasUnionInHierarchy()){
                if (true &&
                    (node.parent() && node.property().nameId()==universes.Universe10.RAMLLanguageElement.properties.annotations.name)){
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
                    u.type("FragmentDeclaration").allProperties().forEach(x=>km.add(x));
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
                        if (!isInsideTraitOrResourceType) {
                            var vl = aNode.computedValue(universes.Universe10.Api.properties.mediaType.name);
                            (<hlimpl.ASTPropImpl>keyAttr).overrideValue(vl);
                        }
                    }
                }
            }

            if (node.lowLevel().value()) {
                if (km.parentValue) {
                    res.push(new hlimpl.ASTPropImpl(node.lowLevel(), node, km.parentValue.range(), km.parentValue));
                }
                else if (km.canBeValue) {
                    var s = node.lowLevel().value();
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
                    } else if (node.definition().isAssignableFrom(universes.Universe10.Annotation.name) &&
                        node.definition().property("value")) {
                        //"value" is a magic property name we do not have reflected in serialized def. system, so have to use plain string

                        var lowLevelNode = node.lowLevel();

                        var valueAttribute = _.find(lowLevelNode.children(), child=>{

                            return child.kind() == yaml.Kind.MAPPING && child.key() && child.key() == "value";
                        });

                        if (!valueAttribute) {
                            //annotation reference is not a scalar and does not have value attribute, but has value defined in the annotation declaration
                            //that means user wants to use a shortcut and specify value object directly under annotation

                            var valueProperty = node.definition().property("value")

                            //creating "value" high-level node referencing the same low-level node so the children can be collected
                            var valueNode = new hlimpl.ASTNodeImpl(node.lowLevel(), node, valueProperty.range(), valueProperty);
                            return [valueNode];
                        }
                    }
                }
            }
            else {
                if (km.canBeValue && (km.canBeValue.range() instanceof def.NodeClass || (
                        km.canBeValue.range().hasUnionInHierarchy() && node.definition().isAssignableFrom(universes.Universe10.Annotation.name)))) {

                    //check check for annotation is just for safety, generally, imho, we should go inside for any unions
                    var ch = new hlimpl.ASTNodeImpl(node.lowLevel(), aNode, <hl.INodeDefinition>km.canBeValue.range(), km.canBeValue);
                    return [ch];
                }
            }

            aNode._children = res;
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

            return res;
        }finally{
            if (ch) {
                delete cha['currentChildren'];
                //delete cha['level'];
            }
        }
    }

    private isTypeDeclarationShortcut(node:hlimpl.ASTNodeImpl, property: hl.IProperty) {
        var isTypeDeclarationType = universeHelpers.isTypeProperty(property);
        var isTypeDeclaration = node.definition() && universeHelpers.isTypeDeclarationTypeOrDescendant(node.definition());

        if(isTypeDeclaration && isTypeDeclarationType && node.lowLevel() && node.lowLevel().valueKind() === yaml.Kind.SEQ) {
            return true;
        }

        return false;
    }

    private processChildren(childrenToAdopt:ll.ILowLevelASTNode[], aNode:hlimpl.ASTNodeImpl, res:hl.IParseResult[], allowsQuestion:boolean, km:KeyMatcher):hl.IParseResult[] {
        var typeDeclarationName = universes.Universe10.TypeDeclaration.name;

        var typePropertyName = universes.Universe10.TypeDeclaration.properties.type.name;

        if(aNode.definition() && aNode.definition().isAssignableFrom(typeDeclarationName) && aNode.lowLevel() && (km.canBeValue&&km.canBeValue.nameId() === typePropertyName) && (<any>aNode).lowLevel()._node && (<any>aNode).lowLevel()._node.value && (<any>aNode).lowLevel()._node.value.kind === yaml.Kind.SEQ) {
            childrenToAdopt.forEach(child => {
                var property = new hlimpl.ASTPropImpl(child, aNode, km.canBeValue.range(), km.canBeValue);
                res.push(property);
            });

            return res;
        }

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
                //TODO DESCRIMINATORS
                if (range.hasValueTypeInHierarchy()) {


                    var ch = x.children();
                    var seq = (x.valueKind() == yaml.Kind.SEQ);
                    if ((seq && ch.length > 0 || ch.length > 1) && multyValue) {

                        ch.forEach(y=> {
                            var pi = new hlimpl.ASTPropImpl(y, aNode, range, p)
                            res.push(pi)
                        });

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

                                    attrNode.errorMessage = "property '"+p.groupName() + "' must be a " + rng;

                                    if (x.children().length==0&&p.groupName()=="enum"){
                                        attrNode.errorMessage = "enum is empty";
                                        if (x.valueKind()==yaml.Kind.MAP){
                                            attrNode.errorMessage = "the value of enum must be an array"
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

                                var chld = x.children();
                                if (chld.length==0){
                                    if (p.range().key()==universes.Universe08.ResourceType){
                                        var error=new hlimpl.BasicASTNode(x, aNode);
                                        error.errorMessage="property: '"+p.nameId()+"' must be a map"
                                        res.push(error);
                                    }
                                    if (x.valueKind()==yaml.Kind.SCALAR){
                                        if (p.range().key()==universes.Universe08.AbstractSecurityScheme) {
                                            var error = new hlimpl.BasicASTNode(x, aNode);
                                            error.errorMessage = "property: '" + p.nameId() + "' must be a map"
                                            res.push(error);
                                        }
                                    }
                                }
                                chld.forEach(y=> {
                                    //TODO TRACK GROUP KEY
                                    var cld = y.children()
                                    if (!y.key() && cld.length == 1) {
                                        var node = new hlimpl.ASTNodeImpl(cld[0], aNode, <any> range, p);
                                        node._allowQuestion = allowsQuestion;
                                        rs.push(node);
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
                                })

                            }
                            else {
                                var filter:any = {}
                                var inherited:hlimpl.ASTNodeImpl[] = []
                                if (range instanceof defs.NodeClass) {
                                    var nc = <defs.NodeClass>range;

                                    if (nc.getAdapter(services.RAMLService).getCanInherit().length > 0) {
                                        nc.getAdapter(services.RAMLService).getCanInherit().forEach(v=> {
                                            var vl = aNode.computedValue(v);
                                            if (vl && p.nameId() == universes.Universe10.Response.properties.body.name) {
                                                if (!_.find(x.children(), x=>x.key() == vl)) {
                                                    //we can create inherited node;
                                                    var pc=aNode.parent().definition().key();
                                                    var node = new hlimpl.ASTNodeImpl(x, aNode, <any> range, p);
                                                    if (pc == universes.Universe10.MethodBase ||pc == universes.Universe08.MethodBase) {
                                                        node.setComputed("form", "true")//FIXME
                                                    }

                                                    var isInsideTraitOrResourceType = isInTtraitOrResourceType(aNode);
                                                    var t = descriminate(p, aNode, node);
                                                    if (t) {
                                                        if(!isInsideTraitOrResourceType) {
                                                            (<defs.NodeClass>t).setName(vl);
                                                        }
                                                        node.patchType(<any>t)
                                                    }
                                                    var ch = node.children();
                                                    //this are false unknowns actual unknowns will be reported by parent node
                                                    node._children = ch.filter(x=>!x.isUnknown())

                                                    node._allowQuestion = allowsQuestion;
                                                    inherited.push(node);
                                                    node.children().forEach(x=> {
                                                        if (x.property().getAdapter(services.RAMLPropertyService).isKey()) {
                                                            var atr = <ASTPropImpl>x;
                                                            atr._computed = true;
                                                            return;
                                                        }
                                                        if (x.isElement()) {
                                                            if (!x.property().getAdapter(services.RAMLPropertyService).isMerged()) {
                                                                filter[x.property().nameId()] = true;
                                                            }
                                                        }
                                                        if ((<defs.Property>x.property()).isAnnotation()){
                                                            var atr = <ASTPropImpl>x;
                                                            var vl=atr.value();
                                                            var strVal="";
                                                            if (vl instanceof hlimpl.StructuredValue){
                                                                strVal=(<hlimpl.StructuredValue>vl).valueName();
                                                            }
                                                            else{
                                                                strVal=""+vl;
                                                            }
                                                            filter["("+strVal+")"] = true;
                                                        }
                                                        else {
                                                            filter[x.name()] = true;
                                                        }
                                                    })
                                                    var ap=node.definition().allProperties();
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
                                        })
                                    }
                                }
                                var parsed:hlimpl.ASTNodeImpl[] = []
                                if (x.children().length==0){
                                    if (x.valueKind()==yaml.Kind.SEQ){

                                        if (p.range().key()==universes.Universe08.Parameter){
                                            var error=new hlimpl.BasicASTNode(x, aNode);
                                            error.errorMessage="property: '"+p.nameId()+"' must be a map"
                                            res.push(error);
                                        }


                                    }
                                }
                                x.children().forEach(y=> {
                                    if (filter[y.key()]) {
                                        return;
                                    }
                                    if (y.valueKind()==yaml.Kind.SEQ){
                                        y.children().forEach(z=>{
                                            var node = new hlimpl.ASTNodeImpl(z, aNode, <any> range, p);
                                            node._allowQuestion = allowsQuestion;
                                            node.setNamePatch(y.key());
                                            parsed.push(node);
                                        })
                                        if (y.children().length==0){
                                            var error=new hlimpl.BasicASTNode(y, aNode);
                                            if (p.range().key()==universes.Universe08.Parameter){
                                                error.errorMessage="named parameter needs at least one type"
                                            }
                                            else {
                                                error.errorMessage = "node should have at least one member value"
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

                                if (parsed.length > 0) {
                                    parsed.forEach(x=>rs.push(x));
                                }
                                else {
                                    inherited.forEach(x=>rs.push(x))
                                }
                            }
                        }
                        else {
                            //var y=x.children()[0];
                            rs.push(new hlimpl.ASTNodeImpl(x, aNode, <any> range, p));
                        }
                    }
                    else {
                        var node = new hlimpl.ASTNodeImpl(x, aNode, <any>range, p);
                        node._allowQuestion = allowsQuestion;
                        rs.push(node);
                    }
                    aNode._children = aNode._children.concat(rs);
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
                if(!(x instanceof proxy.LowLevelCompositeNode)
                    ||(<proxy.LowLevelCompositeNode>x).primaryNode()!=null) {

                    res.push(new hlimpl.BasicASTNode(x, aNode));
                    //error
                }
            }
        })
        return res;
    }
}
function getType(node:hl.IHighLevelNode,expression:string):hl.ITypeDefinition{
    if (!expression) {
        return node.definition().universe().type("StringTypeDeclaration");
    }
    var pt=node.parsedType();
    if (pt.isString()){
        return (node.definition().universe().type("StringTypeDeclaration"));
    }
    if (pt.isNumber()){
        return (node.definition().universe().type("NumberTypeDeclaration"));
    }
    if (pt.isObject()){
        return (node.definition().universe().type("ObjectTypeDeclaration"));
    }
    if (pt.isArray()){
        return (node.definition().universe().type("ArrayTypeDeclaration"));
    }
    if (pt.isFile()){
        return (node.definition().universe().type("FileTypeDeclaration"));
    }
    return (node.definition().universe().type("TypeDeclaration"));
}



function desc1(p:hl.IProperty, parent:hl.IHighLevelNode, x:hl.IHighLevelNode):hl.ITypeDefinition{
    var tp=x.attr("type");
    var value="";
    if (tp){
        var mn:{ [name:string]:hl.ITypeDefinition}={};
        var c=new def.NodeClass(x.name(),<def.Universe>x.definition().universe(),"")
        c.getAdapter(services.RAMLService).setDeclaringNode(x);
        c._superTypes.push(x.definition().universe().type(universes.Universe10.TypeDeclaration.name));
        mn[tp.value()]=c;
        var newType= getType(x,tp.value());
        if (newType) {
            if (newType.superTypes().length == 0) {
                (<def.NodeClass>newType)._superTypes.push(x.definition().universe().type(universes.Universe10.TypeDeclaration.name));

            }
        }

        return newType;
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
            if(node.definition().isAssignableFrom(universes.Universe10.AnnotationTypeDeclaration.name)) {
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
        if (range == universes.Universe10.TypeDeclaration.name
            ||range == universes.Universe10.AnnotationTypeDeclaration.name) {

            var res = desc1(p, parent, x);
            if (p || (!p && !parent && x.lowLevel())) {
                if (p && res != null && ((p.nameId() ==universes.Universe10.MethodBase.properties.body.name
                    || p.nameId() ==universes.Universe10.Response.properties.headers.name) ||
                    p.nameId() ==universes.Universe10.HasNormalParameters.properties.queryParameters.name)) {
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
                candidate = type.universe().type(universes.Universe10.UnionAnnotationTypeDeclaration.name);
                break;
            }
            if((<defs.AbstractType>t).isArray()){
                candidate = type.universe().type(universes.Universe10.ArrayAnnotationTypeDeclaration.name);
                break;
            }
            var subTypes = t.subTypes();
            for(var j = 0 ; j < subTypes.length ; j++){
                var st = subTypes[j];
                if(st.isAssignableFrom(universes.Universe10.AnnotationTypeDeclaration.name)){
                    if(candidate==null){
                        candidate = st;
                    }
                    else if(st.isAssignableFrom(candidate.nameId())){
                        candidate = st;
                    }
                }
            }
        }
        return candidate != null ? candidate : type.universe().type(universes.Universe10.AnnotationTypeDeclaration.name);
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