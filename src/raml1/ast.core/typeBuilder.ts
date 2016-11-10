/// <reference path="../../../typings/main.d.ts" />

import defs=require("raml-definition-system")
import ramlTypes=defs.rt;
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")
import _=require("underscore")
import universes=require("../tools/universe");
import hlimpl=require("../highLevelImpl")
import search=require("../../search/search-interface")
type ASTNodeImpl=hlimpl.ASTNodeImpl;
type ASTPropImpl=hlimpl.ASTPropImpl;
import services=defs
import linter=require("./linter")
import universeHelpers = require("../tools/universeHelpers");
export interface TemplateApplication{
    tp:hl.ITypeDefinition
    attr:hl.IAttribute
}

ramlTypes.setPropertyConstructor(x=>{
    var v=new defs.Property(x);
    v.unmerge();
    return v;
});
export interface TemplateData{
    [name:string]:TemplateApplication[]
}
function templateFields(node:hl.IParseResult,d:TemplateData){

    var u=<defs.Universe>node.root().definition().universe();
    var key = node.lowLevel().key();
    if(key){
        handleValue(key, d, null,true,u);
    }
    node.children().forEach(x=>templateFields(x,d));
    if (node instanceof hlimpl.ASTPropImpl){
        var prop=<ASTPropImpl>node;
        //TODO RECURSIVE PARAMETERS
        var v=prop.value();
        if (typeof v=='string'){
            var strV=<string>v;
            handleValue(strV, d, prop,false,u);
        }
        else{
            node.lowLevel().visit(x=>{
                if (x.value()){
                    var strV=x.value()+"";
                    handleValue(strV,d,prop,true,u);

                }
                return true;
            })
        }
    }
    else if (node instanceof hlimpl.BasicASTNode){
        var v=node.lowLevel().value();
        if (typeof v=='string'){
            var strV=<string>v;
            handleValue(strV, d, null,false,u);
        }
        else{
            node.lowLevel().visit(x=>{
                if (x.value()){
                    var strV=x.value()+"";
                    handleValue(strV,d,null,true,u);

                }
                return true;
            })
        }
    }
}
var extractUsedParamNames = function (strV:string) {
    var parameterUsages:string[] = [];
    var ps = 0;
    while (true) {
        var pos = strV.indexOf("<<", ps);
        if (pos == -1) {
            break;
        }
        var end = strV.indexOf(">>", pos);
        var isFull = pos == 0 && end == strV.length - 2;
        var parameterUsage = strV.substring(pos + 2, end);
        ps = pos + 2;
        var directiveIndex = parameterUsage.indexOf("|");
        if (directiveIndex != -1) {
            parameterUsage = parameterUsage.substring(0, directiveIndex);
        }
        parameterUsage = parameterUsage.trim();
        parameterUsages.push(parameterUsage);
    }
    return {parameterUsages: parameterUsages, isFull: isFull};
};
var handleValue = function (
    strV:string,
    d:TemplateData,
    prop:ASTPropImpl,
    allwaysString:boolean,
    u:defs.Universe) {
    var __ret = extractUsedParamNames(strV);
    var parameterUsages = __ret.parameterUsages;
    var isFull = __ret.isFull;
    var r = (prop) ? prop.property().range() : null;
    if (prop) {
        if (prop.property().nameId() == universes.Universe10.TypeDeclaration.properties.type.name ||
            prop.property().nameId() == universes.Universe10.TypeDeclaration.properties.schema.name) {
            if (prop.property().domain().key() == universes.Universe10.TypeDeclaration) {
                r = <any>u.type(universes.Universe10.SchemaString.name);
            }
        }
    }
    if (!isFull || allwaysString) {
        r = <any>u.type(universes.Universe10.StringType.name);
    }
    else if(r==null&&u.version()=="RAML10"){
        r = <any>u.type(universes.Universe10.AnyType.name);
    }
    
    for(var parameterUsage of parameterUsages){
        if (linter.RESERVED_TEMPLATE_PARAMETERS[parameterUsage] != null) {
            //Handling reserved parameter names;
            continue;
        }

        var q = d[parameterUsage];
        //FIX ME NOT WHOLE TEMPLATES
        if (q) {
            q.push({
                tp: r,
                attr: prop
            });
        }
        else {
            d[parameterUsage] = [{
                tp: r,
                attr: prop
            }]
        }
    }
};
function fillParamPaths(node:ll.ILowLevelASTNode,paramPaths:{[key:string]:string[][]},path:string[]=[]){
    if(node.optional()){
        path = path.concat("/");
    }
    var v = node.value();
    if (typeof v=='string'){
        var strV=<string>v;
        var __ret = extractUsedParamNames(strV);
        var parameterUsages = __ret.parameterUsages;
        for( var pu of parameterUsages){
            var paths = paramPaths[pu];
            if(paths==null){
                paths = []
                paramPaths[pu] = paths;
            }
            paths.push(path);
        }
    }
    else{
        for( var ch of node.children()){
            fillParamPaths(ch,paramPaths,path.concat(ch.key()));
        }
    }

}

function fillTemplateType(result:defs.UserDefinedClass,node:hl.IHighLevelNode):hl.ITypeDefinition {
    var usages:TemplateData = {}
    var paramPaths:{[key:string]:string[][]} = {};
    templateFields(node, usages);
    fillParamPaths(node.lowLevel(),paramPaths);
    for(var pu of Object.keys(paramPaths)){
        paramPaths[pu] = _.unique(paramPaths[pu]);
    }
    result.getAdapter(services.RAMLService).setInlinedTemplates(true);
    Object.keys(usages).forEach(x=> {
        var propSource = null;
        if (usages[x].length > 0) {
            propSource = usages[x][0].attr;
        }

        var prop = new defs.UserDefinedProp(x, propSource);
        //prop._node=node;
        prop.withDomain(result);
        var paths:string[][] = paramPaths[x];
        prop.getAdapter(services.RAMLPropertyService).putMeta("templatePaths",paths);

        var defaultType:string;
        if(node.definition().universe().version()=="RAML10") {
            var hasString = usages[x].filter(y=>universeHelpers.isStringTypeType(y.tp)).length>0;
            defaultType = hasString ? universes.Universe10.StringType.name : universes.Universe10.AnyType.name;
        }
        else{
            defaultType = universes.Universe08.StringType.name;
        }
        
        var tp = _.unique(usages[x].map(x=>x.tp)).filter(x=>x && x.nameId() != defaultType);
        prop.withRange(tp.length == 1 ? tp[0] : <any>node.definition().universe().type(defaultType));
        prop.withRequired(true)

        if (tp.length==1&&node.definition().universe().version()=='RAML10'){
            if (tp[0].key()==universes.Universe10.SchemaString){
                prop.getAdapter(services.RAMLPropertyService).setTypeExpression(true);
            }
        }
        prop.unmerge();
    })
    var keyProp = new defs.UserDefinedProp("____key", node);
    //prop._node=node;
    keyProp.withDomain(result);
    keyProp.withKey(true);
    keyProp.withFromParentKey(true)
    keyProp.withRange(<any>node.definition().universe().type(universes.Universe08.StringType.name));
    return result;
}

function fillReferenceType(result:defs.UserDefinedClass,def:hl.ITypeDefinition):hl.ITypeDefinition {
    if (def.universe().version() == "RAML08") {
        result.getAdapter(services.RAMLService).withAllowAny();
    }
    var p = def.property(def.getAdapter(services.RAMLService).getReferenceIs());
    if (p) {
        p.range().properties().forEach(x=> {
            var prop = new defs.Property(x.nameId());
            prop.unmerge();
            prop.withDomain(result);
            prop.withRange(x.range());
            prop.withMultiValue(x.isMultiValue());
        });
    }
    return result;
}

class AnnotationType extends defs.UserDefinedClass{
    allProperties(ps:{[name:string]:defs.ITypeDefinition}={}):defs.Property[]{
        var rs=this.superTypes()[0].allProperties();
        if (rs.length==1&&rs[0].nameId()=="annotations"){
            var propertyNode = this.getAdapter(defs.RAMLService).getDeclaringNode();

            var property=new defs.UserDefinedProp("value", propertyNode);
            property.withDomain(this);
            property.withCanBeValue();
            property.withRequired(false);
            var tp=this.superTypes()[0];
            rs=[];
            property.withRange(property.node().asElement().definition().universe().type("string"));
            rs.push(property);

        }
        return <any>rs;
    }

    isAnnotationType(){
        return true;
    }
}
export  function typeFromNode(node:hl.IHighLevelNode):hl.ITypeDefinition{
    if (!node){
        return null;
    }
    if (node.associatedType()){
        return <hl.ITypeDefinition>node.associatedType()
    }
    var u=node.lowLevel().unit();
    var upath=u?u.path():"";
    ramlTypes.setPropertyConstructor(x=>{
        var propertySource = null;

        var rs=node.elementsOfKind("properties").filter(y=>y.name()==x);
        if (rs){
            propertySource=rs[0];
        }

        var v=new defs.UserDefinedProp(x, propertySource);


        v.unmerge();
        return v;
    });
    try {
        var def = <defs.NodeClass>node.definition();
        if (node.property() && node.property().nameId() == universes.Universe10.LibraryBase.properties.annotationTypes.name) {
            //var st=node.definition().getAdapter(services.RAMLService).toRuntime();

            var result:defs.UserDefinedClass = new AnnotationType(node.name(), <defs.Universe>node.definition().universe(), node, upath, "");
            var st = getSimpleType(node);
            result._superTypes.push(st);

            if (node.elementsOfKind(universes.Universe10.ObjectTypeDeclaration.properties.properties.name).length == 0) {
                result.getAdapter(services.RAMLService).withAllowAny();
            }

            var extType = def.getAdapter(services.RAMLService).getExtendedType();
            if (extType) {
                result._superTypes.push(extType);
            }
            return result;
        }
        else {
            var result = new defs.UserDefinedClass(node.name(), <defs.Universe>node.definition().universe(), node, upath, "");
        }
        (<ASTNodeImpl>node).setAssociatedType(result);
        //result.setDeclaringNode(node);
        if (def.getAdapter(services.RAMLService).isInlinedTemplates()) {
            return fillTemplateType(result, node);
        }
        else if (def.getAdapter(services.RAMLService).getReferenceIs()) {
            return fillReferenceType(result, def);
        }

        var rs = getSimpleType(node);
        rs.getAdapter(services.RAMLService).setDeclaringNode(node);

        (<ASTNodeImpl>node).setAssociatedType(rs);
    } finally{
        ramlTypes.setPropertyConstructor(null);
    }
    return rs;
}

function getSimpleType(node:hl.IHighLevelNode):hl.ITypeDefinition{
    return ramlTypes.toNominal(node.parsedType(),x=>{
        var m=node.definition().universe().type(x);
        if (!m){
            var ut=new defs.UserDefinedClass("",<defs.Universe>node.definition().universe(),node,"","");
        }
        return m;
    });
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


export function convertType(root:hl.IHighLevelNode,t:ramlTypes.IParsedType):hl.ITypeDefinition{
    var node= _.find(root.elementsOfKind("types"),x=>x.name()== t.name());
    if (node) {
        ramlTypes.setPropertyConstructor(x=> {

            var rs = node.elementsOfKind("properties").filter(y=>y.name() == x);

            var propertySource = null;

            if (rs&&rs.length>0) {
                propertySource = rs[0];
            }
            else {
                var rs = node.elementsOfKind("facets").filter(y=>y.name() == x);
                if (rs&&rs.length>0) {
                    propertySource = rs[0];
                }
            }

            var v = new defs.UserDefinedProp(x, propertySource);
            v.unmerge();
            return v;
        });
    }
    var u=transform(root.definition().universe());
    return ramlTypes.toNominal(t,u);
}