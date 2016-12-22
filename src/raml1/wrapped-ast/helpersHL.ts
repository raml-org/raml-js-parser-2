import ramlPathMatch = require("../../util/raml-path-match")
import hl = require('../highLevelAST');
import hlimpl = require('../highLevelImpl');
import linter = require('../ast.core/linter');
import stubs = require('../stubs');
import _ = require("underscore");

import def = require('raml-definition-system');
import universeDef = require("../tools/universe");
import universes=require("../tools/universe")
import Opt = require('../../Opt')
import util = require('../../util/index');
import expander=require("../ast.core/expander")
import proxy = require("../ast.core/LowLevelASTProxy")
import referencePatcher = require("../ast.core/referencePatcher")
import search=require("../../search/search-interface")
import ll=require("../lowLevelAST");
import llImpl=require("../jsyaml/jsyaml2lowLevel");
import json=require("../jsyaml/json2lowLevel");
import path=require("path");
import ramlservices=def
import universeHelpers = require("../tools/universeHelpers");
import universeProvider = def
import rTypes = def.rt;

import factory = require('../artifacts/raml10factory')
import core=require("./parserCore");

/**
 * __$helperMethod__
 * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
 * Consider a fragment of RAML specification:
 * ```yaml
 * /resource/{objectId}/{propertyId}:
 *   uriParameters:
 *     objectId:
 * ```
 * Here `propertyId` uri parameter is not described in the `uriParameters` node,
 * but it is among Resource.allUriParameters().
 * __$meta__={"name":"allUriParameters","deprecated":true}
 */
export function uriParameters(resource:hl.IHighLevelNode,serializeMetadata=false):hl.IHighLevelNode[]{

    var propName = universes.Universe10.ResourceBase.properties.uriParameters.name;
    var params = resource.elementsOfKind(propName);
    if(!universeHelpers.isResourceType(resource.definition())){
        return params;
    }
    var uri = resource.attr(universes.Universe10.Resource.properties.relativeUri.name).value();
    return extractParams(params, uri, resource, propName,serializeMetadata);
}

/**
 * __$helperMethod__
 * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
 * Consider a fragment of RAML specification:
 * ```yaml
 * version: v1
 * baseUri: https://{organization}.example.com/{version}/{service}
 * baseUriParameters:
 *   service:
 * ```
 * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
 * but they are among `Api.allBaseUriParameters()`.
 * __$meta__={"name":"allBaseUriParameters","deprecated":true}
 */
export function baseUriParameters(api:hl.IHighLevelNode,serializeMetadata=true):hl.IHighLevelNode[]{

    var buriAttr = api.attr(universes.Universe10.Api.properties.baseUri.name);
    var uri = buriAttr ? buriAttr.value() : '';
    var propName = universes.Universe10.Api.properties.baseUriParameters.name;
    var params = api.elementsOfKind(propName);

    return extractParams(params, uri, api, propName,serializeMetadata);
}

function extractParams(
    params:hl.IHighLevelNode[],
    uri:string,
    ownerHl:hl.IHighLevelNode,
    propName:string,
    serializeMetadata:boolean):hl.IHighLevelNode[] {

    if(typeof(uri)!='string'){
        return [];
    }

    var definition = ownerHl.definition();
    var prop = definition.property(propName);

    if(!uri){
        return [];
    }

    var describedParams = {};
    params.forEach(x=>{
        var arr = describedParams[x.name()];
        if(!arr){
            arr = [];
            describedParams[x.name()] = arr;
        }
        arr.push(x);
    });

    var allParams:hl.IHighLevelNode[] = [];
    var prev = 0;
    var mentionedParams = {};
    for (var i = uri.indexOf('{'); i >= 0; i = uri.indexOf('{', prev)) {
        prev = uri.indexOf('}', ++i);
        if(prev<0){
            break;
        }
        var paramName = uri.substring(i, prev);
        mentionedParams[paramName] = true;
        if (describedParams[paramName]) {
            describedParams[paramName].forEach(x=>allParams.push(x));
        }
        else {
            var universe = definition.universe();
            var nc=<def.NodeClass>universe.type(universeDef.Universe10.StringTypeDeclaration.name);
            var hlNode=stubs.createStubNode(nc,null,paramName,ownerHl.lowLevel().unit());
            hlNode.setParent(ownerHl);
            if(serializeMetadata) {
                (<any>hlNode.wrapperNode().meta()).setCalculated();
            }
            hlNode.attrOrCreate("name").setValue(paramName);
            (<hlimpl.ASTNodeImpl>hlNode).patchProp(prop);

            allParams.push(hlNode);
        }
    }
    Object.keys(describedParams).filter(x=>!mentionedParams[x])
        .forEach(x=>describedParams[x].forEach(y=>allParams.push(y)));
    return allParams;
};

//__$helperMethod__ baseUri of owning Api concatenated with completeRelativeUri
export function absoluteUri(res:hl.IHighLevelNode):string{
    if(!universeHelpers.isResourceType(res.definition())){
        return null;
    }
    var uri = '';
    var parent = res;
    do{
        res = parent;//(parent instanceof RamlWrapper.ResourceImpl) ? <RamlWrapper.Resource>parent : null;
        uri = res.attr(universeDef.Universe10.Resource.properties.relativeUri.name).value() + uri;
        parent = res.parent();
    }
    while (universeHelpers.isResourceType(parent.definition()));
    uri = uri.replace(/\/\//g,'/');
    var base:string = "";
    var buriAttr = parent.attr(universeDef.Universe10.Api.properties.baseUri.name);
    if(buriAttr) {
        base = buriAttr ? buriAttr.value() :  "";
    }
    base = base ? base : '';
    if(util.stringEndsWith(base,'/')){
        uri = uri.substring(1);
    }
    uri = base + uri;
    return uri;
}

/**
 * __$helperMethod__
 * __$meta__={"name":"example","primary":true}
 */
export function typeExample(node:hl.IHighLevelNode,dumpXMLRepresentationOfExamples=false):any{
    var examples = exampleObjects(node,true,dumpXMLRepresentationOfExamples);
    return examples.length > 0 ? examples[0] : null;
}

/**
 * __$helperMethod__
 * __$meta__={"name":"examples","primary":true}
 */
export function typeExamples(node:hl.IHighLevelNode,dumpXMLRepresentationOfExamples=false):any{
    return exampleObjects(node,false,dumpXMLRepresentationOfExamples);
}

export function dumpExpandableExample(ex,dumpXMLRepresentationOfExamples=false):any {
    var obj;
    if (ex.isJSONString() || ex.isYAML()) {
        obj = ex.asJSON();
    }
    else {
        obj = ex.original();
    }
    var sObj:any = {
        value: ex.asString(),
        strict: ex.strict(),
        name: ex.name(),
        structuredValue: obj
    };
    var annotations = ex.annotations();
    var aObj = toAnnotations(annotations);
    if (Object.keys(aObj).length > 0) {
        sObj["annotations"] = aObj;
    }
    var sAnnotations = ex.scalarsAnnotations();
    var saObj = {};
    Object.keys(sAnnotations).forEach(pName=> {
        var aObj1 = toAnnotations(sAnnotations[pName]);
        if (Object.keys(aObj1).length > 0) {
            saObj[pName] = Object.keys(aObj1).map(x=>aObj1[x]);
        }
    });
    if (Object.keys(saObj).length > 0) {
        sObj["scalarsAnnotations"] = saObj;
    }
    var displayName = ex.displayName();
    if (displayName) {
        sObj["displayName"] = displayName;
    }
    var description = ex.description();
    if (description != null) {
        sObj["description"] = description;
    }
    if (dumpXMLRepresentationOfExamples) {
        sObj.asXMLString = ex.asXMLString();
    }
    return sObj;
}
function exampleObjects(node:hl.IHighLevelNode,
                        isSingle:boolean,dumpXMLRepresentationOfExamples=false):any[]{
    var lt = node.localType();
    if(lt.isAnnotationType()){
        lt = _.find(lt.superTypes(),x=>x.nameId()==lt.nameId());
    }
    var examples = lt.examples().filter(
        x=>x!=null && !x.isEmpty() &&(x.isSingle() == isSingle))
        .map(ex=>dumpExpandableExample(ex,dumpXMLRepresentationOfExamples));
    return examples;
}

function toAnnotations(annotations:any) {
    var aObj = {};
    if(annotations) {
        Object.keys(annotations).forEach(aName=> {
            aObj[aName] = {
                structuredValue: annotations[aName].value(),
                name: aName
            };
        });
    }
    return aObj;
}


/**
 * __$helperMethod__ Retrieve all traits including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export function allTraits(hlNode:hl.IHighLevelNode,serializeMetadata=true):hl.IHighLevelNode[]{
    if(hlNode.lowLevel().actual().libExpanded){
        return [];
    }
    return findTemplates(hlNode,d=>universeHelpers.isTraitType(d),serializeMetadata);
}

/**
 * __$helperMethod__ Retrieve all resource types including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export function allResourceTypes(hlNode:hl.IHighLevelNode,serializeMetadata=true):hl.IHighLevelNode[]{
    if(hlNode.lowLevel().actual().libExpanded){
        return [];
    }
    return findTemplates(hlNode,d=>universeHelpers.isResourceTypeType(d),serializeMetadata);
}

function findTemplates(hlNode:hl.IHighLevelNode,filter,serializeMetadata:boolean):hl.IHighLevelNode[] {
    var arr = search.globalDeclarations(hlNode).filter(x=>filter(x.definition()));
    var ll = hlNode.lowLevel();
    var nodePath = ll.includePath();
    if(!nodePath){
        nodePath = ll.unit().path();
    }
    var isProxy = hlNode.definition().universe().version()=="RAML10"
        &&!universeHelpers.isOverlayType(hlNode.definition());
    var exp = isProxy ? new expander.TraitsAndResourceTypesExpander() : null;
    var result:hl.IHighLevelNode[] = [];
    for(var x of arr){
        var p = x.lowLevel().unit().path();
        if(isProxy){
            if(!(x.lowLevel() instanceof proxy.LowLevelProxyNode)) {
                x = exp.createHighLevelNode(x, false);
            }
            new referencePatcher.ReferencePatcher().process(x,hlNode,true,true);
        }
        if(serializeMetadata&&p!=nodePath){
            (<core.NodeMetadataImpl>x.wrapperNode().meta()).setCalculated();
        }
        result.push(x);
    }
    return result;
}


/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export function schemaContent08(bodyDeclaration:hl.IHighLevelNode):hl.IAttribute {

    var schemaAttribute =
        bodyDeclaration.attr(universes.Universe08.BodyLike.properties.schema.name);

    if (!schemaAttribute) {
        return null;
    }

    var declaration = search.findDeclarationByNode(schemaAttribute, search.LocationKind.VALUE_COMPLETION);
    if (!declaration) return schemaAttribute;

    if (!(<any>declaration).getKind || (<any>declaration).getKind() != hl.NodeKind.NODE) {
        return schemaAttribute;
    }

    //we found the schema declaration and should get its contents

    if ((<hl.IHighLevelNode>declaration).definition().key() != universes.Universe08.GlobalSchema) {
        return schemaAttribute;
    }

    var valueAttribute =
        (<hl.IHighLevelNode>declaration).attr(universes.Universe08.GlobalSchema.properties.value.name);
    if (valueAttribute == null) {
        return null;
    }

    return valueAttribute;
}

/**
 * __$helperMethod__
 * __$meta__={"name":"parametrizedProperties","primary":true}
 */
export function getTemplateParametrizedProperties(node:hl.IHighLevelNode):any{

    var type = node.definition();
    if(universeHelpers.isMethodType(type)||universeHelpers.isTypeDeclarationDescendant(type)){
        var isInsideTemplate = false;
        var parent = node.parent();
        while(parent!=null){
            var pDef = parent.definition();
            if(universeHelpers.isResourceTypeType(pDef)||universeHelpers.isTraitType(pDef)){
                isInsideTemplate = true;
                break;
            }
            parent = parent.parent();
        }
        if(!isInsideTemplate){
            return null;
        }
    }

    if(node==null){
        return null;
    }
    var lowLevelNode = node.lowLevel();
    if(lowLevelNode==null){
        return null;
    }
    var children = lowLevelNode.children().filter(x=>{
        var key = x.key();
        if(!key){
            return false;
        }
        if(key.charAt(0)=="("&&key.charAt(key.length-1)==")"){
            return false;
        }
        return key.indexOf("<<")>=0
    });
    if(children.length==0){
        return null;
    }
    var result = {};
    children.forEach(x=>{
        var obj = x.dumpToObject();
        Object.keys(obj).forEach(y=>result[y] = obj[y]);
    });
    return result;
}


/**
 * __$helperMethod__
 * __$meta__={"name":"fixedFacets","primary":true}
 */
export function typeFixedFacets(td:hl.IHighLevelNode):any{
    var rDef = td.localType();
    var obj = rDef.getFixedFacets();
    var keys = Object.keys(obj);
    if(!rDef.hasUnionInHierarchy()) {
        for (var key of keys) {
            if (rDef.facet(key) == null) {
                delete obj[key];
            }
        }
    }
    if(Object.keys(obj).length==0){
        return null;
    }
    return obj;
}