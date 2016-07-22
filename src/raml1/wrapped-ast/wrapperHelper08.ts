import RamlWrapper = require('../artifacts/raml08parserapi')
import RamlWrapperImpl = require('../artifacts/raml08parser')

import factory = require('../artifacts/raml08factory')
import core=require("./parserCore");

import ramlPathMatch = require("../../util/raml-path-match")
import hl = require('../highLevelAST');
import hlimpl = require('../highLevelImpl');

import defs = require('raml-definition-system');
import universes=require("../tools/universe")
import expander=require("../ast.core/expander")
import lowLevelProxy=require("../ast.core/LowLevelASTProxy")
import linter=require("../ast.core/linter")
import Opt = require('../../Opt')
import util = require('../../util/index');
import typeexpression=require("../ast.core/typeBuilder")
import search=require("../ast.core/search")
import ramlservices=require("../definition-system/ramlServices")
import universeHelpers = require("../tools/universeHelpers");

import ll=require("../jsyaml/jsyaml2lowLevel");
import path=require("path")
//export function resolveType(p:RamlWrapper.TypeDeclaration):hl.ITypeDefinition{
//    var tpe=typeexpression.typeFromNode(p.highLevel());
//    return tpe.toRuntime();
//}

export function load(pth: string):core.BasicNode{
    var m=new ll.Project(path.dirname(pth));
    var unit=m.unit(path.basename(pth));
    if (unit){
        if (unit.isRAMLUnit()){
            return (<hlimpl.ASTNodeImpl>hlimpl.fromUnit(unit)).wrapperNode();
        }
    }
    return null;
}
/**
 * __$helperMethod__
 * Equivalent API with traits and resource types expanded
 * __$meta__={"name":"expand"}
 **/
export function expandTraitsAndResourceTypes(api:RamlWrapper.Api):RamlWrapper.Api{
    var lowLevelNode = api.highLevel().lowLevel();
    if(lowLevelNode instanceof lowLevelProxy.LowLevelProxyNode){
        return api;
    }
    return expander.expandTraitsAndResourceTypes(api);
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
    while (parent.definition().key().name==universes.Universe08.Resource.name);
    return uri;
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
    while (parent.definition().key().name==universes.Universe08.Resource.name);
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

export function qName(c:core.BasicNode):string{
    return hlimpl.qName(c.highLevel(),c.highLevel().root());
}

/**
 * __$helperMethod__
 * __$meta__{"name":"traits","override":true}
 **/
export function traitsPrimary(a:RamlWrapper.Api):RamlWrapper.Trait[]{
    return allTraits(a);
}

/**
 * __$helperMethod__ Retrieve all traits including those defined in libraries *
 * __$meta__{"deprecated":true}
 */
export function allTraits(a:RamlWrapper.Api):RamlWrapper.Trait[]{
    return <any>findTemplates(a,d=>universeHelpers.isTraitType(d));
}

/**
 *__$helperMethod__
 *__$meta__{"name":"resourceTypes","override":true}
 **/
export function resourceTypesPrimary(a:RamlWrapper.Api):RamlWrapper.ResourceType[]{
    return allResourceTypes(a);
}

/**
 * __$helperMethod__ Retrieve all resource types including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export function allResourceTypes(a:RamlWrapper.Api):RamlWrapper.ResourceType[]{
    return <any>findTemplates(a,d=>universeHelpers.isResourceTypeType(d));
}

function findTemplates(a:core.BasicNode,filter) {
    var arr = search.globalDeclarations(a.highLevel()).filter(x=>filter(x.definition()));
    var ll = a.highLevel().lowLevel();
    var nodePath = ll.includePath();
    if(!nodePath){
        nodePath = ll.unit().path();
    }
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
    while (parent.definition().key().name==universes.Universe08.Resource.name);
    return result.reverse();
}

//__$helperMethod__ For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
export function parentResource(method:RamlWrapper.Method):RamlWrapper.Resource{
    if(method.parent() instanceof RamlWrapperImpl.ResourceImpl) {
        return <RamlWrapper.Resource>method.parent();
    }
    return null;
}

//__$helperMethod__ Parent resource for non top level resources __$meta__={"name":"parentResource"}
export function parent(resource:RamlWrapper.Resource):RamlWrapper.Resource{
    var parent = resource.parent();
    if(parent.definition().key().name==universes.Universe08.Resource.name){
        <RamlWrapper.Resource>parent
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
    if(resource==null){
        return null;
    }
    return childMethod(resource,method);
}

function isApi(obj) {
    return (obj.definition().key().name==universes.Universe08.Api.name);
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
 **/
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


//export function matchUri(apiRootRelativeUri:string, resource:RamlWrapper.Resource):Opt<ParamValue[]>{
//
//    var allParameters:Raml08Parser.NamedParameterMap = {}
//    var opt:Opt<RamlWrapper.Resource> = new Opt<RamlWrapper.Resource>(resource);
//    while(opt.isDefined()){
//        var res:RamlWrapper.Resource = opt.getOrThrow();
//        uriParameters(res).forEach(x=>allParameters[x.name()]=new ParamWrapper(x));
//        opt = parent(res);
//    }
//    var result = ramlPathMatch(completeRelativeUri(resource), allParameters, {})(apiRootRelativeUri);
//    if (result) {
//        return new Opt<ParamValue[]>(Object.keys((<any>result).params)
//            .map(x=>new ParamValue(x, result['params'][x])));
//    }
//    return Opt.empty<ParamValue[]>();
//}

var schemaContentChars:string[] = [ '{', '<' ];

//export function schema(body:RamlWrapper.TypeDeclaration, api:RamlWrapper.Api):Opt<SchemaDef>{
//
//    var schemaNode = body.schema();
//    if(!schemaNode){
//        return Opt.empty<SchemaDef>();
//    }
//    var schemaString = schemaNode;
//    var isContent:boolean = false;
//    schemaContentChars.forEach(x=>{try{ isContent = isContent||schemaString.indexOf(x)>=0}catch(e){}});
//    var schDef:SchemaDef;
//    if(isContent) {
//        schDef = new SchemaDef(schemaString);
//    }
//    else{
//        var globalSchemes = api.schemas().filter(x=>x.key()==schemaString);
//        if(globalSchemes.length>0){
//            schDef = new SchemaDef(globalSchemes[0].value().value(),globalSchemes[0].key());
//        }
//        else{
//            return Opt.empty<SchemaDef>();
//        }
//    }
//    return new Opt<SchemaDef>(schDef);
//}

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
 **/
export function uriParametersPrimary(resource:RamlWrapper.Resource):RamlWrapper.Parameter[]{
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
 * Thus, it is not among Resource.uriParameters(), but it is among Resource.allUriParameters().
 * __$meta__={"name":"allUriParameters","deprecated":true}
 **/
export function uriParameters(resource:RamlWrapper.Resource):RamlWrapper.Parameter[]{

    var uri = resource.relativeUri().value();
    var params = (<RamlWrapperImpl.ResourceImpl>resource).uriParameters_original();
    var propName = universes.Universe08.Resource.properties.uriParameters.name;

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
 **/
export function baseUriParametersPrimary(api:RamlWrapper.Api):RamlWrapper.Parameter[]{
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
 * Thus, they are not among `Api.baseUriParameters()`, but they are among `Api.allBaseUriParameters()`.
 * __$meta__={"name":"allBaseUriParameters","deprecated":true}
 **/
export function baseUriParameters(api:RamlWrapper.Api):RamlWrapper.Parameter[]{

    var uri = api.baseUri() ? api.baseUri().value() : '';
    var params = (<RamlWrapperImpl.ApiImpl>api).baseUriParameters_original();
    var propName = universes.Universe08.Api.properties.baseUriParameters.name;

    return extractParams(params, uri, api, propName);
}

/**
 * __$helperMethod__
 * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.allBaseUriParameters()`
 * for `Api` owning the `Resource` and `Resource.allUriParameters()`.
 **/
export function absoluteUriParameters(res:RamlWrapper.Resource):RamlWrapper.Parameter[]{

    var params:RamlWrapper.Parameter[] = [];
    var parent:any = res;
    do{
        res = <RamlWrapper.Resource>parent;
        params = uriParameters(res).concat(params);
        parent = res.parent();

    }
    while (parent.definition().key().name==universes.Universe10.Resource.name);

    var api = <RamlWrapper.Api>parent;
    var baseUriParams = api.baseUriParameters();
    params = baseUriParameters(api).concat(params);
    return params;
}

/**
 * _//_$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__={"name":"protocols","override":true}
 **/
export function protocolsPrimary(api:RamlWrapper.Api):string[]{
    return allProtocols(api);
}

/**
 * __$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__{"deprecated":true}
 **/
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
 **/
export function securedByPrimary(resourceOrMethod : RamlWrapper.Resource | RamlWrapper.Method):RamlWrapper.SecuritySchemeRef[] {
    return allSecuredBy(resourceOrMethod);
}

/**
 * __$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__{"deprecated":true}
 **/
export function allSecuredBy(resourceOrMethod : RamlWrapper.Resource | RamlWrapper.Method):RamlWrapper.SecuritySchemeRef[] {
    //var currentSecuredBy = (<RamlWrapper.ResourceImpl|RamlWrapper.MethodImpl>resourceOrMethod).securedBy_original();
    //if (currentSecuredBy && currentSecuredBy.length > 0) {
    //    return currentSecuredBy;
    //}
    //
    ////instanceof, but have to avoid direct usage of instanceof in JS.
    //if (resourceOrMethod.highLevel().definition().key() == universes.Universe08.Method) {
    //    var resource = <RamlWrapper.ResourceImpl>(<RamlWrapper.Method>resourceOrMethod).parentResource();
    //    if (resource && resource.securedBy_original() && resource.securedBy_original().length > 0) {
    //        return resource.securedBy();
    //    }
    //}
    return resourceOrMethod.securedBy();
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
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
 **/
export function securityScheme(schemeReference : RamlWrapper.SecuritySchemeRef) : RamlWrapper.AbstractSecurityScheme {
    var highLevel = schemeReference.highLevel();
    if (!highLevel) return null;

    var declaration = search.findDeclarationByNode(highLevel, search.LocationKind.VALUE_COMPLETION);
    if (!declaration) return null;

    if (!(<any>declaration).getKind || (<hl.IHighLevelNode>declaration).getKind() != hl.NodeKind.NODE) {
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
 **/
export function RAMLVersion(api:RamlWrapper.Api):string{
    return api.highLevel().definition().universe().version();
}

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export function structuredValue(reference:RamlWrapper.Reference):RamlWrapper.TypeInstance{
    var hl = reference.value().lowLevel();
    return <RamlWrapper.TypeInstance><any>new core.TypeInstanceImpl(hl);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"name","primary":true}
 **/
export function referenceName(reference:RamlWrapper.Reference):string{
    var val = reference.highLevel().value();
    return (typeof val == 'string') || val == null ? val : val.valueName();
}


/**
 * __$helperMethod__
 * __$meta__={"name":"trait","primary":true}
 **/
export function referencedTrait(ref:RamlWrapper.TraitRef):RamlWrapper.Trait{
    return <RamlWrapper.Trait>referencedObject(ref);
}

/**
 * __$helperMethod__
 * __$meta__={"name":"resourceType","primary":true}
 **/
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

function extractParams(
    params:RamlWrapper.Parameter[],
    uri:string,
    owner:core.BasicNode,
    propName:string):RamlWrapper.Parameter[] {

    var ownerHl = owner.highLevel();
    var prop = ownerHl.definition().property(propName);

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

    var allParams:RamlWrapper.Parameter[] = [];
    var prev = 0;
    var mentionedParams = {};
    for (var i = uri.indexOf('{'); i >= 0; i = uri.indexOf('{', prev)) {
        prev = uri.indexOf('}', ++i);
        var paramName = uri.substring(i, prev);
        mentionedParams[paramName] = true;
        if (describedParams[paramName]) {
            describedParams[paramName].forEach(x=>allParams.push(x));
        }
    else {
            var uriParameter = new RamlWrapperImpl.StringTypeDeclarationImpl(paramName);
            uriParameter.setName(paramName);
            var hlNode = uriParameter.highLevel();
            hlNode.setParent(ownerHl);
            (<core.NodeMetadataImpl>uriParameter.meta()).setCalculated();
            (<hlimpl.ASTNodeImpl>hlNode).patchProp(prop);

            allParams.push(uriParameter);
        }
    }
    Object.keys(describedParams).filter(x=>!mentionedParams[x])
        .forEach(x=>describedParams[x].forEach(y=>allParams.push(y)));
    return allParams;
};

/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export function schemaContent(bodyDeclaration : RamlWrapper.BodyLike) : string {
    var schemaDecl = bodyDeclaration.schema();
    if (schemaDecl == null) {
        return null;
    }

    var schemaString = schemaDecl.value();
    if(!schemaString){
        return null;
    }

    var schemaAttribute =
        bodyDeclaration.highLevel().attr(universes.Universe08.BodyLike.properties.schema.name);
    if (!schemaAttribute) {
        return schemaString;
    }

    var declaration = search.findDeclarationByNode(schemaAttribute, search.LocationKind.VALUE_COMPLETION);
    if (!declaration) return schemaString;

    if (!(<any>declaration).getKind || (<any>declaration).getKind() != hl.NodeKind.NODE) {
        return schemaString;
    }

    //we found the schema declaration and should get its contents

    if ((<hl.IHighLevelNode>declaration).definition().key() != universes.Universe08.GlobalSchema) {
        return schemaString;
    }

    var valueAttribute =
        (<hl.IHighLevelNode>declaration).attr(universes.Universe08.GlobalSchema.properties.value.name);
    if (valueAttribute == null) {
        return null;
    }

    return valueAttribute.value();
}

/**
 * __$helperMethod__
 * __$meta__={"name":"parametrizedProperties","primary":true}
 **/
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

//
//export class SchemaDef{
//
//    constructor(private _content:string, private _name?:string){}
//
//    name():string{return this._name}
//
//    content(): string{return this._content}
//}
//
//
//export class ParamValue{
//    key:string
//    value:any
//
//    constructor(key:string, value:any) {
//        this.key = key;
//        this.value = value;
//    }
//}
//
//
//class ParamWrapper implements Raml08Parser.BasicNamedParameter{
//
//    constructor(private _param:RamlWrapper.TypeDeclaration){
//
//        this.description = _param.description() ? _param.description().value() : this.description;
//
//        this.displayName = _param.displayName();
//
////        this.enum = _param.enum();
//
//        this.type = _param.type().length > 0 ? _param.type()[0] : "string";
//
//        this.example = _param.example();
//
//        this.repeat = _param.repeat();
//
//        this.required = _param.required();
//
//        this.default = _param.default();
//    }
//
//    description: Raml08Parser.MarkdownString
//
//    displayName: string
//
//    'enum': any[]
//
//    type: string
//
//    example: any
//
//    repeat: boolean
//
//    required: boolean
//
//    'default': any
//
//}
