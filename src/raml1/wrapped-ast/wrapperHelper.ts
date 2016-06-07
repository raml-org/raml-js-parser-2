import RamlWrapper = require('../artifacts/raml10parserapi')
import RamlWrapperImpl = require('../artifacts/raml10parser')

import factory = require('../artifacts/raml10factory')
import core=require("./parserCore");

import ramlPathMatch = require("../../util/raml-path-match")
import hl = require('../highLevelAST');
import ll = require("../lowLevelAST")
import hlimpl = require('../highLevelImpl');
import linter = require('../ast.core/linter');
import stubs = require('../stubs');
import proxy = require("../ast.core/LowLevelASTProxy");

import defs = require('raml-definition-system');
import universeDef = require("../tools/universe");
import universes=require("../tools/universe")
import Opt = require('../../Opt')
import util = require('../../util/index');
import expander=require("../ast.core/expander")
import lowLevelProxy=require("../ast.core/LowLevelASTProxy")
import search=require("../ast.core/search")
import jsyaml=require("../jsyaml/jsyaml2lowLevel");
import json=require("../jsyaml/json2lowLevel");
import path=require("path");
import ramlservices=defs
import universeHelpers = require("../tools/universeHelpers");
import universeProvider = defs

export function resolveType(p:RamlWrapper.TypeDeclaration):hl.ITypeDefinition{
    return p.highLevel().localType();
}

//__$helperMethod__ Runtime representation of type represented by this AST node
export function runtimeType(p:RamlWrapper.TypeDeclaration):hl.ITypeDefinition{
    return p.highLevel().localType();
}

export function load(pth: string):core.BasicNode{
    var m=new jsyaml.Project(path.dirname(pth));
    var unit=m.unit(path.basename(pth));
    if (unit){
        if (unit.isRAMLUnit()){
            return (<hlimpl.ASTNodeImpl>hlimpl.fromUnit(unit)).wrapperNode();
        }
    }
    return null;
}

//__$helperMethod__ Path relative to API root
export function completeRelativeUri(res:RamlWrapper.Resource):string{
    var uri = '';
    var parent:any = res;
    do{
        res = <RamlWrapper.Resource>parent;//(parent instanceof RamlWrapper.ResourceImpl) ? <RamlWrapper.Resource>parent : null;
        uri = res.relativeUri().value() + uri;
        parent = res.parent();

    }
    while (parent.definition().key().name==universes.Universe10.Resource.name);
    return uri;
}
/**
 * __$helperMethod__
 * Equivalent API with traits and resource types expanded
 * __$meta__={"name":"expand"}
 */
export function expandTraitsAndResourceTypes(api:RamlWrapper.Api):RamlWrapper.Api{
    var lowLevelNode = api.highLevel().lowLevel();
    if(lowLevelNode instanceof lowLevelProxy.LowLevelProxyNode){
        return api;
    }
    return expander.expandTraitsAndResourceTypes(api);
}

//__$helperMethod__ baseUri of owning Api concatenated with completeRelativeUri
export function absoluteUri(res:RamlWrapper.Resource):string{
    var uri = '';
    var parent:any = res;
    do{
        res = <RamlWrapper.Resource>parent;//(parent instanceof RamlWrapper.ResourceImpl) ? <RamlWrapper.Resource>parent : null;
        uri = res.relativeUri().value() + uri;
        parent = res.parent();
    }
    while (parent.definition().key().name==universes.Universe10.Resource.name);
    uri = uri.replace(/\/\//g,'/');
    var buri=(<RamlWrapper.Api>parent).baseUri();
    var base =buri?buri.value():"";
    base = base ? base : '';
    if(util.stringEndsWith(base,'/')){
        uri = uri.substring(1);
    }
    uri = base + uri;
    return uri;
}
//__$helperMethod__ validate an instance against type
export function validateInstance(res:RamlWrapper.TypeDeclaration, value: any):string[]{
    return res.runtimeType().validate(value).map(x=>x.getMessage());
    //throw new Error("Fix me");
}
//__$helperMethod__ validate an instance against type
export function validateInstanceWithDetailedStatuses(res:RamlWrapper.TypeDeclaration, value: any): any{
    return res.runtimeType().validate(value);
}

/**
 * __$helperMethod__
 * Retrieve all traits including those defined in libraries
 * __$meta__{"name":"traits","override":true}
 */
export function traitsPrimary(a:RamlWrapper.LibraryBase):RamlWrapper.Trait[]{
    return allTraits(a);
}

/**
 * __$helperMethod__ Retrieve all traits including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export function allTraits(a:RamlWrapper.LibraryBase):RamlWrapper.Trait[]{
    return <any>findTemplates(a,d=>universeHelpers.isTraitType(d));
}

/**
 * __$helperMethod__
 * Retrieve all resource types including those defined in libraries
 * __$meta__{"name":"resourceTypes","override":true}
 */
export function resourceTypesPrimary(a:RamlWrapper.LibraryBase):RamlWrapper.ResourceType[]{
    return allResourceTypes(a);
}

/**
 * __$helperMethod__ Retrieve all resource types including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export function allResourceTypes(a:RamlWrapper.LibraryBase):RamlWrapper.ResourceType[]{
    return <any>findTemplates(a,d=>universeHelpers.isResourceTypeType(d));
}

function findTemplates(a:core.BasicNode,filter) {    
    var ll = a.highLevel().lowLevel();
    var nodePath = ll.includePath();
    if(!nodePath){
        nodePath = ll.unit().path();
    }
    
    if(ll instanceof proxy.LowLevelProxyNode){
        var result = a.highLevel().children()
            .filter(x=>x.isElement()&&filter(x.asElement().definition()))
            .map(x=>x.asElement().wrapperNode());
        
        result.forEach(x=>{
            var p = x.highLevel().lowLevel().unit().path();
            if(p!=nodePath){
                (<core.NodeMetadataImpl>x.meta()).setCalculated();
            }
        });
        return result;
    }
    var arr = search.globalDeclarations(a.highLevel()).filter(x=>filter(x.definition()));
    
    var topLevelArr = arr.map(x=>{
        var topLevelNode:core.BasicNode;
        var p = x.lowLevel().unit().path();
        if(p!=nodePath){
            topLevelNode = factory.buildWrapperNode(x,false);
            (<core.NodeMetadataImpl>topLevelNode.meta()).setCalculated();
        }
        else{
            topLevelNode = x.wrapperNode();
        }
        return topLevelNode;
    });
    return topLevelArr;
};

export function relativeUriSegments(res:RamlWrapper.Resource):string[]{
    var result:string[] = [];
    var parent:any = res;
    do{
        res = <RamlWrapper.Resource>parent;//(parent instanceof RamlWrapper.ResourceImpl) ? <RamlWrapper.Resource>parent : null;
        result.push(res.relativeUri().value());
        parent = res.parent();
    }
    while (parent.definition().key().name==universes.Universe10.Resource.name);
    return result.reverse();
}

//__$helperMethod__ For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
export function parentResource(method:RamlWrapper.Method):RamlWrapper.Resource{
    if(method.parent() instanceof RamlWrapperImpl.ResourceImpl) {
        return <RamlWrapper.Resource>method.parent();
    }
    return null;
}

/**
 * __$helperMethod__
 * Parent resource for non top level resources
 * __$meta__={"name":"parentResource"}
 */
export function parent(resource:RamlWrapper.Resource):RamlWrapper.Resource{
    var parent = resource.parent();
    if(parent.definition().key().name==universes.Universe10.Resource.name){
        return <RamlWrapper.Resource>parent
    }
    return null;
}

//__$helperMethod__ Get child resource by its relative path
export function childResource(container:RamlWrapper.Resource|RamlWrapper.Api, relPath:string):RamlWrapper.Resource{

    if(container==null){
        return null;
    }
    var resources:RamlWrapper.Resource[] = container.resources();
    if(!resources){
        return null;
    }
    resources = resources.filter(x=>x.relativeUri().value()==relPath);
    if(resources.length==0){
        return null;
    }
    return resources[0];
}

export function getResource(container:RamlWrapper.Api|RamlWrapper.Resource, path:string[]):RamlWrapper.Resource{

    if(!container){
        return null;
    }
    var res:RamlWrapper.Resource = null;
    for (var i = 0; i < path.length; i++) {
        res = childResource(container, path[i]);
        if(!res){
            return null;
        }
        container = res;
    }
    return res;
}

//__$helperMethod__ Get child method by its name
export function childMethod(resource:RamlWrapper.Resource, method:string):RamlWrapper.Method[]{

    if(!resource){
        return null;
    }
    return resource.methods().filter(x=>x.method()==method);
}

export function getMethod(container:RamlWrapper.Resource|RamlWrapper.Api, path:string[],method:string):RamlWrapper.Method[]{

    var resource = getResource(container,path);
    if(!resource){
        return null;
    }
    return childMethod(resource,method);
}

function isApi(obj:core.BasicNode) {
    return universeHelpers.isApiSibling(obj.definition());
};

//__$helperMethod__ Api owning the resource as a sibling
export function ownerApi(method:RamlWrapper.Method|RamlWrapper.Resource):RamlWrapper.Api{
    var obj:core.BasicNode = method;
    while(!isApi(obj)){
        obj = obj.parent();
    }
    return <RamlWrapper.Api>obj;
}

/**
 * __$helperMethod__
 * For methods of Resources: `{parent Resource relative path} {methodName}`.
 * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
 * For other methods throws Exception.
 */
export function methodId(method:RamlWrapper.Method):string{

    var parent = method.parent();
    if(parent instanceof RamlWrapperImpl.ResourceImpl){
        return completeRelativeUri(<RamlWrapper.Resource>parent) + ' ' + method.method().toLowerCase();
    }
    else if(parent instanceof RamlWrapperImpl.ResourceTypeImpl){
        return (<RamlWrapper.ResourceType>parent).name() + ' ' + method.method().toLowerCase();
    }
    throw new Error(`Method is supposed to be owned by Resource or ResourceType.
Here the method is owned by ${method.definition().key().name}`);
}

//__$helperMethod__ true for codes < 400 and false otherwise
export function isOkRange(response:RamlWrapper.Response):boolean{
    var str:string = response.code().value();
    var err = linter.validateResponseString(str);
    if(err!=null){
        return false;
    }
    try{
        if(parseInt(str.charAt(0)) < 4){
            return true;
        }
    }
    catch(e){}
    return false;
}

//__$helperMethod__  Retrieve all resources of the Api
export function allResources(api:RamlWrapper.Api):RamlWrapper.Resource[]{

    var resources:RamlWrapper.Resource[] = []
    var visitor = (res:RamlWrapper.Resource) => {
        resources.push(res);
        res.resources().forEach(x=>visitor(x));
    }
    api.resources().forEach(x=>visitor(x));
    return resources;
}


export function matchUri(apiRootRelativeUri:string, resource:RamlWrapper.Resource):Opt<ParamValue[]>{

    var allParameters:Raml08Parser.NamedParameterMap = {}
    while(resource != null){
        uriParameters(resource).forEach(x=>allParameters[x.name()]=new ParamWrapper(x));
        resource = parent(resource);
    }
    var result = ramlPathMatch.ramlPathMatch(completeRelativeUri(resource), allParameters, {})(apiRootRelativeUri);
    if (result) {
        return new Opt<ParamValue[]>(Object.keys((<any>result).params)
            .map(x=>new ParamValue(x, result['params'][x])));
    }
    return Opt.empty<ParamValue[]>();
}

var schemaContentChars:string[] = [ '{', '<' ];

// export function schema(body:RamlWrapper.TypeDeclaration, api:RamlWrapper.Api):Opt<SchemaDef>{
//
//     var schemaNode = body.schema();
//     if(!schemaNode){
//         return Opt.empty<SchemaDef>();
//     }
//     var schemaString = schemaNode;
//     var isContent:boolean = false;
//     schemaContentChars.forEach(x=>{try{ isContent = isContent||schemaString.indexOf(x)>=0}catch(e){}});
//     var schDef:SchemaDef;
//     if(isContent) {
//         schDef = new SchemaDef(schemaString);
//     }
//     else{
//         var globalSchemes = api.schemas().filter(x=>x.name()==schemaString);
//         if(globalSchemes.length>0){
//             schDef = new SchemaDef(globalSchemes[0].type(),globalSchemes[0].name());
//         }
//         else{
//             return Opt.empty<SchemaDef>();
//         }
//     }
//     return new Opt<SchemaDef>(schDef);
// }

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
 * but it is among Resource.uriParameters().
 * __$meta__={"name":"uriParameters","override": true}
 */
export function uriParametersPrimary(resource:RamlWrapper.ResourceBase):RamlWrapper.TypeDeclaration[]{
    return uriParameters(resource);
}

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
export function uriParameters(resource:RamlWrapper.ResourceBase):RamlWrapper.TypeDeclaration[]{

    var params = (<RamlWrapperImpl.ResourceBaseImpl>resource).uriParameters_original();
    if(!(resource instanceof RamlWrapperImpl.ResourceImpl)){
        return params;
    }
    var uri = (<RamlWrapper.Resource>resource).relativeUri().value();
    var propName = universes.Universe10.ResourceBase.properties.uriParameters.name;
    return extractParams(params, uri, resource, propName);
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
 * but they are among `Api.baseUriParameters()`.
 * __$meta__={"name":"baseUriParameters","override":true}
 */
export function baseUriParametersPrimary(api:RamlWrapper.Api):RamlWrapper.TypeDeclaration[]{
    return baseUriParameters(api);
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
export function baseUriParameters(api:RamlWrapper.Api):RamlWrapper.TypeDeclaration[]{

    var uri = api.baseUri() ? api.baseUri().value() : '';
    var params = (<RamlWrapperImpl.ApiImpl>api).baseUriParameters_original();
    var propName = universes.Universe10.Api.properties.baseUriParameters.name;

    return extractParams(params, uri, api, propName);
}

/**
 * __$helperMethod__
 * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
 * for `Api` owning the `Resource` and `Resource.uriParameters()`.
 */
export function absoluteUriParameters(res:RamlWrapper.Resource):RamlWrapper.TypeDeclaration[]{

    var params:RamlWrapper.TypeDeclaration[] = [];
    var parent:any = res;
    do{
        res = <RamlWrapper.Resource>parent;
        params = uriParameters(res).concat(params);
        parent = res.parent();

    }
    while (parent.definition().key().name==universes.Universe10.Resource.name);

    var api = <RamlWrapper.Api>parent;
    var baseUri = api.baseUri().value();
    var baseUriParams = api.baseUriParameters();
    params = baseUriParameters(api).concat(params);
    return params;
}

/**
 * _//_$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__={"name":"protocols","override":true}
 */
export function protocolsPrimary(api:RamlWrapper.Api):string[]{
    return allProtocols(api);
}

/**
 * __$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__{"deprecated":true}
 */
export function allProtocols(api:RamlWrapper.Api):string[]{
    return api.protocols().map(x=>x.toUpperCase());
    //var attributeDefaults = (<RamlWrapper.ApiImpl>api).attributeDefaults();
    //var result = (<RamlWrapper.ApiImpl>api).protocols_original();
    //if(result.length!=0||!attributeDefaults){
    //    return result;
    //}
    //var baseUriAttr = api.baseUri();
    //if(baseUriAttr) {
    //    var baseUri = baseUriAttr.value();
    //    if (baseUri) {
    //        var ind = baseUri.indexOf('://');
    //        if (ind >= 0) {
    //            result = [baseUri.substring(0, ind)];
    //        }
    //        if(result.length==0){
    //            result = [ 'HTTP' ];
    //        }
    //    }
    //}
    //return result;
}

/**
 * _//_$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__={"name":"securedBy","override":true}
 */
export function securedByPrimary(resourceOrMethod : RamlWrapper.ResourceBase | RamlWrapper.Method):RamlWrapper.SecuritySchemeRef[] {
    return allSecuredBy(resourceOrMethod);
}

/**
 * __$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__{"deprecated":true}
 */
export function allSecuredBy(resourceOrMethod : RamlWrapper.ResourceBase | RamlWrapper.Method):RamlWrapper.SecuritySchemeRef[] {
    //var currentSecuredBy = (<RamlWrapper.ResourceBaseImpl|RamlWrapper.MethodImpl>resourceOrMethod).securedBy_original();
    //if (currentSecuredBy && currentSecuredBy.length > 0) {
    //    return currentSecuredBy;
    //}
    //
    ////instanceof, but have to avoid direct usage of instanceof in JS.
    //var key = resourceOrMethod.highLevel().definition().key();
    //if (key == universes.Universe10.Method) {
    //    var method = (<RamlWrapper.Method>resourceOrMethod);
    //    var resource = <RamlWrapper.ResourceImpl>method.parentResource();
    //    if (resource && resource.securedBy_original() && resource.securedBy_original().length > 0) {
    //        return resource.securedBy_original();
    //    }
    //    return method.ownerApi().securedBy();
    //}
    //if (key == universes.Universe10.Resource) {
    //    return (<RamlWrapper.Resource>resourceOrMethod).ownerApi().securedBy();
    //}
    return resourceOrMethod.securedBy();//return currentSecuredBy;
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 */
export function securitySchemeName(schemeReference : RamlWrapper.SecuritySchemeRef) : string {
    var highLevel = schemeReference.highLevel();
    if (!highLevel) return "";

    var attributeValue = highLevel.value();
    if (!attributeValue) return "";

    return attributeValue.toString();
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 */
export function securityScheme(schemeReference : RamlWrapper.SecuritySchemeRef) : RamlWrapper.AbstractSecurityScheme {
    var highLevel = schemeReference.highLevel();
    if (!highLevel) return null;

    var declaration = search.findDeclarationByNode(highLevel, search.LocationKind.VALUE_COMPLETION);
    if (!declaration) return null;

    if (!(<any>declaration).getKind || (<any>declaration).getKind() != hl.NodeKind.NODE) {
        return null;
    }

    var result = (<hl.IHighLevelNode> declaration).wrapperNode();
    if (!(result instanceof RamlWrapperImpl.AbstractSecuritySchemeImpl)) {
        //I do not see how to avoid instanceof here
        return null;
    }

    return <RamlWrapper.AbstractSecurityScheme> result;
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 */
export function RAMLVersion(api:RamlWrapper.Api):string{
    return api.highLevel().definition().universe().version();
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 */
export function structuredValue(reference:RamlWrapper.Reference):RamlWrapper.TypeInstance{
    var hl = reference.value().lowLevel();
    return <RamlWrapper.TypeInstance><any>new core.TypeInstanceImpl(hl);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"name","primary":true}
 */
export function referenceName(reference:RamlWrapper.Reference):string{
    var val = reference.highLevel().value();
    return (typeof val == 'string') || val==null ? val : val.valueName();
}

/**
 * __$helperMethod__
 * __$meta__={"name":"trait","primary":true}
 */
export function referencedTrait(ref:RamlWrapper.TraitRef):RamlWrapper.Trait{
    return <RamlWrapper.Trait>referencedObject(ref);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"annotation","primary":true}
 */
export function referencedAnnotation(ref:RamlWrapper.AnnotationRef):RamlWrapper.TypeDeclaration{
    return <RamlWrapper.TypeDeclaration>referencedObject(ref);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"resourceType","primary":true}
 */
export function referencedResourceType(ref:RamlWrapper.ResourceTypeRef):RamlWrapper.ResourceType{
    return <RamlWrapper.ResourceType>referencedObject(ref);
}

function referencedObject(ref:RamlWrapper.Reference):core.BasicNode{
    var attr = ref.highLevel();
    var parent = attr.parent();
    var vn = ref.name();
    var cands = search.referenceTargets(attr.property(),parent).filter(x=>hlimpl.qName(x,parent)==vn);

    if(cands.length==0){
        return null;
    }
    return cands[0].wrapperNode();
}

function getExpandableExamples(node:core.BasicNode,isSingle:boolean=false):ExampleSpecImpl[] {

    var runtimeDefinition = node.runtimeDefinition();
    if(!runtimeDefinition){
        return [];
    }
    var hlParent = node.highLevel();
    var property = hlParent.definition().property(isSingle?"example":"examples");
    var universe = defs.getUniverse("RAML10");
    var definition = universe.type(universeDef.Universe10.ExampleSpec.name);

    var expandables = runtimeDefinition.examples().filter(x=>!x.isEmpty() && x.isSingle()==isSingle);
    return expandables.map(x=>{
        var obj = x.asJSON();
        var llParent = hlParent.lowLevel();
        var key = x.isSingle() ? "example" : null;
        var jsonNode = new json.AstNode(llParent.unit(),obj,llParent,null,key);
        var hlNode = new hlimpl.ASTNodeImpl(jsonNode,hlParent,definition,property);

        var wrapperAnnotations:RamlWrapperImpl.AnnotationRefImpl[] = [];
        var annotations = x.annotations();
        if(annotations) {
            var aProp = universe.type("Annotable").property("annotations");
            for (var aName of Object.keys(annotations)) {
                var aObj = annotations[aName];
                var aJson = new json.AstNode(llParent.unit(),aObj,jsonNode,null,"("+aName+")");
                var aHlNode = new hlimpl.ASTPropImpl(aJson,hlNode,aProp.range(),aProp)
                var wAnnotation = new RamlWrapperImpl.AnnotationRefImpl(aHlNode);
                wrapperAnnotations.push(wAnnotation);
            }
        }
        return new ExampleSpecImpl(hlNode,x,wrapperAnnotations);
    });
};

/**
 * __$helperMethod__
 * __$meta__={"name":"example","primary":true}
 */
export function getTypeExample(td:RamlWrapper.TypeDeclaration):RamlWrapper.ExampleSpec{
    var examples = getExpandableExamples(td,true);
    if(examples.length>0){
        return <RamlWrapper.ExampleSpec>examples[0];
    }
    return null;
}

/**
 * __$helperMethod__
 * __$meta__={"name":"examples","primary":true}
 */
export function getTypeExamples(td:RamlWrapper.TypeDeclaration):RamlWrapper.ExampleSpec[]{
    return <RamlWrapper.ExampleSpec[]>getExpandableExamples(td);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"fixedFacets","primary":true}
 */
export function typeFixedFacets(td:RamlWrapper.TypeDeclaration):RamlWrapper.TypeInstance{
    var fixedFacets = td.runtimeDefinition().getFixedFacets();
    if(Object.keys(fixedFacets).length==0){
        return null;
    }
    var obj = {};
    for(var key of Object.keys(fixedFacets)){
        var value = fixedFacets[key];
        if(value instanceof jsyaml.ASTNode || value instanceof proxy.LowLevelProxyNode){
            obj[key] = json.serialize(<ll.ILowLevelASTNode>value);
        }
        else{
            obj[key] = value;
        }
    }
    var node = new json.AstNode(null,obj);
    return <RamlWrapper.TypeInstance><any>new core.TypeInstanceImpl(node);
}
/**
 * __$helperMethod__ A base type which the current type extends, or more generally a type expression.
 * __$meta__={"name":"type","override":true}
 */
export function typeValue(typeDeclaration:RamlWrapper.TypeDeclaration):string[]{

    var attrs
        =typeDeclaration.highLevel().attributes(defs.universesInfo.Universe10.TypeDeclaration.properties.type.name);

    var structuredAttrs = attrs.filter(x=>x.value() instanceof hlimpl.StructuredValue);
    if(structuredAttrs.length==0){
        return (<RamlWrapperImpl.TypeDeclarationImpl>typeDeclaration).type_original();
    }
    var nullify=false;
    var values:string[] = attrs.map(x=>{
        var val = x.value();
        if(typeof(val)=="string"){
            return val;
        }
        else if(val instanceof hlimpl.StructuredValue){
            nullify=true;
        }
        return val.toString();
    });
    if (nullify){
        return null;
    }
    return values;
}
/**
 * __$helperMethod__ A base type which the current type extends, or more generally a type expression.
 * __$meta__={"name":"schema","override":true}
 */
export function schemaValue(typeDeclaration:RamlWrapper.TypeDeclaration):string[]{
    var nullify=false;
    var attrs
        =typeDeclaration.highLevel().attributes(defs.universesInfo.Universe10.TypeDeclaration.properties.schema.name);
    if (nullify){
        return null;
    }
    var structuredAttrs = attrs.filter(x=>x.value() instanceof hlimpl.StructuredValue);
    if(structuredAttrs.length==0){
        return (<RamlWrapperImpl.TypeDeclarationImpl>typeDeclaration).schema_original();
    }
    var values:string[] = attrs.map(x=>{
        var val = x.value();
        if(typeof(val)=="string"){
            return val;
        }
        else if(val instanceof hlimpl.StructuredValue){
            nullify=true;
        }
        return val.toString();
    });
    if (nullify){
        return null;
    }
    return values;
}

/**
 * __$helperMethod__ Inlined supertype definition.
 * __$meta__={"name":"structuredType","primary":true}
 */
export function typeStructuredValue(typeDeclaration:RamlWrapper.TypeDeclaration):RamlWrapper.TypeInstance{

    var attrs
        =typeDeclaration.highLevel().attributes(defs.universesInfo.Universe10.TypeDeclaration.properties.type.name);
    attrs=attrs.concat(typeDeclaration.highLevel().attributes(defs.universesInfo.Universe10.TypeDeclaration.properties.schema.name))
    var values = attrs.map(x=>x.value());

    for(var val of values){
        if(val instanceof hlimpl.StructuredValue){
            var typeInstance = new core.TypeInstanceImpl((<hlimpl.StructuredValue><any>val).lowLevel());
            return typeInstance;
        }
    }
    return null;
}

/**
 * __$helperMethod__
 * Returns the root node of the AST, uses statement refers.
 * __$meta__={"name":"ast"}
 */
export function referencedNode (usesDecl:RamlWrapper.UsesDeclaration):RamlWrapper.Library {

    var ref = usesDecl.value();
    var unit = usesDecl.highLevel().lowLevel().unit().resolve(ref);
    var hlNode = unit.highLevel();
    var hlElement = hlNode.asElement();
    if(hlElement){

        //we know, only libraries can be referenced from uses
        var wrapperNode = hlElement.wrapperNode();
        if (RamlWrapper.isLibrary(wrapperNode)) {
            (<any>wrapperNode).setAttributeDefaults((<any>usesDecl).attributeDefaults())
            return wrapperNode;
        } else {
            return null;
        }
    }
    return null;
}



function extractParams(
    params:RamlWrapper.TypeDeclaration[],
    uri:string,
    owner:core.BasicNode,
    propName:string):RamlWrapper.TypeDeclaration[] {

    var ownerHl = owner.highLevel();
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

    var allParams:RamlWrapper.TypeDeclaration[] = [];
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
            var nc=<defs.NodeClass>universe.type(universeDef.Universe10.StringTypeDeclaration.name);
            var node=stubs.createStubNode(nc,null,paramName);
            var uriParameter = factory.buildWrapperNode(node);
            var hlNode = uriParameter.highLevel();
            hlNode.setParent(ownerHl);
            (<core.NodeMetadataImpl>uriParameter.meta()).setCalculated();
            (<RamlWrapperImpl.TypeDeclarationImpl>uriParameter).setName(paramName);
            (<hlimpl.ASTNodeImpl>hlNode).patchProp(prop);

            allParams.push(<RamlWrapper.TypeDeclaration>uriParameter);
        }
    }
    Object.keys(describedParams).filter(x=>!mentionedParams[x])
        .forEach(x=>describedParams[x].forEach(y=>allParams.push(y)));
    return allParams;
};


/**
 * __$helperMethod__
 * __$meta__={"name":"parametrizedProperties","primary":true}
 */
export function getTemplateParametrizedProperties(
    node:RamlWrapper.Trait|RamlWrapper.ResourceType):RamlWrapper.TypeInstance{

    var highLevelNode = node.highLevel();
    if(highLevelNode==null){
        return null;
    }
    var lowLevelNode = highLevelNode.lowLevel();
    if(lowLevelNode==null){
        return null;
    }
    var children = lowLevelNode.children().filter(x=>x.key().indexOf("<<")>=0);
    if(children.length==0){
        return null;
    }
    var result = new core.TypeInstanceImpl(children);
    return result;
}

export class SchemaDef{

    constructor(private _content:string, private _name?:string){}

    name():string{return this._name}

    content(): string{return this._content}
}


export class ParamValue{
    key:string
    value:any

    constructor(key:string, value:any) {
        this.key = key;
        this.value = value;
    }
}


class ParamWrapper implements Raml08Parser.BasicNamedParameter{

    constructor(private _param:RamlWrapper.TypeDeclaration){

        this.description = _param.description() ? _param.description().value() : this.description;

        this.displayName = _param.displayName();

//        this.enum = _param.enum();

        this.type = _param.type().length > 0 ? _param.type()[0] : "string";

        this.example = _param.example();

        this.repeat = _param.repeat();

        this.required = _param.required();

        this.default = _param.default();
    }

    description: Raml08Parser.MarkdownString

    displayName: string

    'enum': any[]

    type: string

    example: any

    repeat: boolean

    required: boolean

    'default': any

}


export class ExampleSpecImpl extends core.BasicNodeImpl{

    constructor(hlNode:hl.IHighLevelNode,protected expandable, protected _annotations:core.AttributeNodeImpl[]){
        super(hlNode);
    }

    value():any{
        if(this.expandable.isJSONString()||this.expandable.isYAML()) {
            return this.expandable.asJSON();
        }
        return this.expandable.original();
    }

    structuredValue():core.TypeInstanceImpl{
        var obj = this.value();
        var llParent = this._node.lowLevel();
        var key = this.expandable.isSingle() ? "example" : null;
        var jsonNode = new json.AstNode(llParent.unit(),obj,llParent,null,key);
        return new core.TypeInstanceImpl(jsonNode);

    }

    strict():boolean{
        return this.expandable.strict();
    }

    description():RamlWrapper.MarkdownString{
        var descriptionValue = this.expandable.description();
        if(descriptionValue==null&&descriptionValue!==null){
            return null;
        }
        var attr = stubs.createAttr(
            this._node.definition().property(universeDef.Universe10.ExampleSpec.properties.description.name),
            descriptionValue);

        var result = new RamlWrapperImpl.MarkdownStringImpl(attr);
        return result;
    }

    name():string{
        return this.expandable.name();
    }

    displayName():string{
        return this.expandable.displayName();
    }

    annotations():any[]{
        return this._annotations;
    }

    scalarsAnnotations():any{ return <any>{}; }

}