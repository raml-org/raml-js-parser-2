/// <reference path="../../typings/main.d.ts" />

import RamlWrapper1= require("../raml1/artifacts/raml10parserapi")
import RamlWrapper1Impl= require("../raml1/artifacts/raml10parser")

import RamlWrapper08= require("../raml1/artifacts/raml08parserapi")

import path=require("path")
import fs=require("fs")
import Opt = require('../Opt')
import jsyaml=require("../raml1/jsyaml/jsyaml2lowLevel")
import hl=require("../raml1/highLevelAST")
import hlimpl=require("../raml1/highLevelImpl")
import ll=require("../raml1/lowLevelAST")
import llimpl=require("../raml1/jsyaml/jsyaml2lowLevel")
import expander=require("../raml1/ast.core/expander")
import expanderHL=require("../raml1/ast.core/expanderHL")
import util=require("../util/index")
import universeDef=require("../raml1/tools/universe")
import parserCore=require('../raml1/wrapped-ast/parserCore')
import parserCoreApi=require('../raml1/wrapped-ast/parserCoreApi')
import ramlServices = require("../raml1/definition-system/ramlServices")
import tckDumperHL = require("../util/tckDumperHL")
import universeHelpers = require("./tools/universeHelpers");
import search = require("./../search/search-interface");
import linter=require("./ast.core/linter")
let messageRegistry = require("../../resources/errorMessages");

export type IHighLevelNode=hl.IHighLevelNode;
export type IParseResult=hl.IParseResult;

import universeProvider=require("../raml1/definition-system/universeProvider")

export function load(ramlPath:string,options?:parserCoreApi.Options2):Promise<Object>{
    options = options || {};
    return loadRAMLAsyncHL(ramlPath).then(hlNode=>{
        var expanded:hl.IHighLevelNode;
        if(!options.hasOwnProperty("expandLibraries") || options.expandLibraries) {
            expanded = expanderHL.expandLibrariesHL(hlNode);
        }
        else{
            expanded = expanderHL.expandTraitsAndResourceTypesHL(hlNode);
        }
        return tckDumperHL.dump(expanded,{
            rootNodeDetails: true,
            attributeDefaults: true,
            serializeMetadata: true,
            unfoldTypes: options.unfoldTypes
        });
    });
}

export function loadSync(ramlPath:string,options?:parserCoreApi.Options2):Object{
    options = options || {};
    var hlNode = loadRAMLInternalHL(ramlPath);
    var expanded:hl.IHighLevelNode;
    if (!options.hasOwnProperty("expandLibraries") || options.expandLibraries) {
        if(universeHelpers.isLibraryType(hlNode.definition())){
            expanded = expanderHL.expandLibraryHL(hlNode) || hlNode;
        }
        else {
            expanded = expanderHL.expandLibrariesHL(hlNode) || hlNode;
        }
    }
    else {
        expanded = expanderHL.expandTraitsAndResourceTypesHL(hlNode)||hlNode;
    }
    return tckDumperHL.dump(expanded,{
        rootNodeDetails: true,
        attributeDefaults: true,
        serializeMetadata: true,
        unfoldTypes: options.unfoldTypes
    });
}

/***
 * Load API synchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadApi(apiPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options):Opt<RamlWrapper1.Api|RamlWrapper08.Api>{

    var hlNode = loadRAMLInternalHL(apiPath,arg1,arg2);
    if(!hlNode) {
        return Opt.empty< RamlWrapper1.Api | RamlWrapper08.Api >();
    }
    var api = <any>hlNode.wrapperNode();
    var options = <parserCoreApi.Options>(Array.isArray(arg1) ? arg2 : arg1);
    setAttributeDefaults(api,options);
    return new Opt<RamlWrapper1.Api|RamlWrapper08.Api>(api);


}

/***
 * Load RAML synchronously. Detects RAML version and uses corresponding parser.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;RAMLLanguageElement&gt;, where RAMLLanguageElement belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadRAML(ramlPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options) : Opt<hl.BasicNode> {
    var hlNode = loadRAMLInternalHL(ramlPath, arg1, arg2);
    if(!hlNode){
        return Opt.empty<hl.BasicNode>();
    }
    var api = hlNode.wrapperNode();
    var options = <parserCoreApi.Options>(Array.isArray(arg1) ? arg2 : arg1);
    setAttributeDefaults(api,options);
    return new Opt<hl.BasicNode>(api);
}

/***
 * Load RAML synchronously. Detects RAML version and uses corresponding parser.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;hl.IHighLevelNode&gt;
 ***/
export function loadRAMLHL(ramlPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options) : Opt<hl.IHighLevelNode> {
    var hlNode = loadRAMLInternalHL(ramlPath, arg1, arg2);
    if(!hlNode){
        return Opt.empty<hl.IHighLevelNode>();
    }
    return new Opt<hl.IHighLevelNode>(hlNode);
}


function loadRAMLInternalHL(apiPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options) : hl.IHighLevelNode {
    var gotArray = Array.isArray(arg1);
    var extensionsAndOverlays = <string[]>(gotArray ? arg1: null);
    var options = <parserCoreApi.Options>(gotArray ? arg2 : arg1);
    options = options || {};


    var project = getProject(apiPath,options);
    var pr=apiPath.indexOf("://");
    var unitName=(pr!=-1&&pr<6)?apiPath:path.basename(apiPath);
    var unit = project.unit(unitName);

    if (arg2 && !extensionsAndOverlays) {
        extensionsAndOverlays=null;
    }

    var api:hl.IHighLevelNode;
    if(unit){

        if (extensionsAndOverlays && extensionsAndOverlays.length > 0) {
            var extensionUnits = [];

            extensionsAndOverlays.forEach(currentPath =>{
                if (!currentPath || currentPath.trim().length == 0) {
                    throw new Error(messageRegistry.EXTENSIONS_AND_OVERLAYS_LEGAL_FILE_PATHS.message);
                }
            })

            extensionsAndOverlays.forEach(unitPath=>{
                extensionUnits.push(project.unit(unitPath, path.isAbsolute(unitPath)))
            })

            //calling to perform the checks, we do not actually need the api itself
            extensionUnits.forEach(extensionUnit=>toApi(extensionUnit, options))

            api = toApi(expander.mergeAPIs(unit, extensionUnits, hlimpl.OverlayMergeMode.MERGE), options);
        } else {

            api = toApi(unit, options);
            (<hlimpl.ASTNodeImpl>api).setMergeMode(hlimpl.OverlayMergeMode.MERGE);
        }

    }

    if (!unit){
        throw new Error(linter.applyTemplate(messageRegistry.CAN_NOT_RESOLVE,{path:apiPath}));
    }

    if(options.rejectOnErrors && api && api.errors().filter(x=>!x.isWarning).length){
        throw toError(api);
    }
    return api;
}

/***
 * Load API asynchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadApiAsync(apiPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options):Promise<RamlWrapper1.Api|RamlWrapper08.Api>{
    var ramlPromise = loadRAMLAsync(apiPath,arg1,arg2);
    return ramlPromise.then(loadedRaml=>{
        // if (false) {
        //     //TODO check that loaded RAML is API
        //     return Promise.reject("Specified RAML is not API");
        // } else {
        return loadedRaml;
        // }
    })
}

/***
 * Load API asynchronously. Detects RAML version and uses corresponding parser.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;RAMLLanguageElement&gt;, where RAMLLanguageElement belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadRAMLAsync(ramlPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options):Promise<hl.BasicNode>{

    return loadRAMLAsyncHL(ramlPath,arg1,arg2).then(x=>{

        if(!x){
            return null;
        }
        var gotArray = Array.isArray(arg1);
        var options = <parserCoreApi.Options>(gotArray ? arg2 : arg1);

        var node = x;
        while (node != null) {
            var wn = node.wrapperNode();
            setAttributeDefaults(wn,options);
            var master = node.getMaster();
            node = master ? master.asElement() : null;
        }

        return x.wrapperNode();
    });
}
export function loadRAMLAsyncHL(ramlPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options):Promise<hl.IHighLevelNode>{
    var gotArray = Array.isArray(arg1);
    var extensionsAndOverlays = <string[]>(gotArray ? arg1: null);
    var options = <parserCoreApi.Options>(gotArray ? arg2 : arg1);
    options = options || {};

    var project = getProject(ramlPath,options);
    var pr=ramlPath.indexOf("://");
    var unitName=(pr!=-1&&pr<6)?ramlPath:path.basename(ramlPath);

    if (arg2 && !extensionsAndOverlays) {
        extensionsAndOverlays=null;
    }

    if (!extensionsAndOverlays || extensionsAndOverlays.length == 0) {
        return fetchAndLoadApiAsyncHL(project, unitName, options).then(masterApi=>{
            (<hlimpl.ASTNodeImpl>masterApi).setMergeMode(hlimpl.OverlayMergeMode.MERGE);
            return masterApi;
        })
    } else {

        extensionsAndOverlays.forEach(currentPath =>{
            if (!currentPath || currentPath.trim().length == 0) {
                throw new Error(messageRegistry.EXTENSIONS_AND_OVERLAYS_LEGAL_FILE_PATHS.message);
            }
        })

        return fetchAndLoadApiAsyncHL(project, unitName, options).then(masterApi=>{
            var apiPromises = []

            extensionsAndOverlays.forEach(extensionUnitPath=>{
                apiPromises.push(fetchAndLoadApiAsyncHL(project, extensionUnitPath, options))
            });

            return Promise.all(apiPromises).then(apis=>{
                var overlayUnits = []
                apis.forEach(currentApi=>overlayUnits.push(currentApi.lowLevel().unit()))

                var result = expander.mergeAPIs(masterApi.lowLevel().unit(), overlayUnits,
                    hlimpl.OverlayMergeMode.MERGE);
                return result;
            }).then(mergedHighLevel=>{
                return toApi(mergedHighLevel, options);
            })
        });
    }
}

/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType
 */
export function getLanguageElementByRuntimeType(runtimeType : hl.ITypeDefinition) : parserCore.BasicNode {
    if (runtimeType == null) {
        return null;
    }

    var highLevelNode = runtimeType.getAdapter(ramlServices.RAMLService).getDeclaringNode();
    if (highLevelNode == null) {
        return null;
    }

    return highLevelNode.wrapperNode();
}

function fetchAndLoadApiAsync(project: jsyaml.Project, unitName : string, options: parserCoreApi.Options):Promise<hl.BasicNode> {
    return fetchAndLoadApiAsyncHL(project,unitName,options).then(x=>x.wrapperNode());
}

function fetchAndLoadApiAsyncHL(project: jsyaml.Project, unitName : string, options: parserCoreApi.Options):Promise<hl.IHighLevelNode>{
    return llimpl.fetchIncludesAndMasterAsync(project,unitName).then(x=>{
        try {
            var api = toApi(x, options);
            if (options.rejectOnErrors && api && api.errors().filter(x=>!x.isWarning).length) {
                return Promise.reject(toError(api));
            }
            return api;
        }
        catch(err){
            return Promise.reject(err);
        }
    });
}

function getProject(apiPath:string,options?:parserCoreApi.Options):jsyaml.Project {

    options = options || {};
    var includeResolver = options.fsResolver;
    var httpResolver = options.httpResolver;
    var reusedNode = options.reusedNode;
    var project:jsyaml.Project;
    if(reusedNode){
        project = <jsyaml.Project>reusedNode.lowLevel().unit().project();
        project.deleteUnit(path.basename(apiPath));
        if(includeResolver) {
            project.setFSResolver(includeResolver);
        }
        if(httpResolver){
            project.setHTTPResolver(httpResolver);
        }
    }
    else {
        var projectRoot = path.dirname(apiPath);
        project = new jsyaml.Project(projectRoot, includeResolver, httpResolver);
    }
    return project;
};

function toApi(unitOrHighlevel:ll.ICompilationUnit|hl.IHighLevelNode, options:parserCoreApi.Options,checkApisOverlays=false):hl.IHighLevelNode {
    options = options||{};
    if(!unitOrHighlevel){
        return null;
    }

    var unit : ll.ICompilationUnit = null;
    var highLevel : hl.IHighLevelNode = null;

    if ((<any>unitOrHighlevel).isRAMLUnit) {
        unit = <ll.ICompilationUnit>unitOrHighlevel;
    } else {
        highLevel = <hlimpl.ASTNodeImpl>unitOrHighlevel;
        unit = highLevel.lowLevel().unit();
    }

    var contents = unit.contents();

    var ramlFirstLine = hlimpl.ramlFirstLine(contents);
    if(!ramlFirstLine){
        throw new Error(messageRegistry.INVALID_FIRST_LINE.message);
    }

    var verStr = ramlFirstLine[1];
    var ramlFileType = ramlFirstLine[2];

    var typeName;
    var apiImpl;

    var ramlVersion;
    if (verStr == '0.8') {
        ramlVersion='RAML08';
    } else if (verStr == '1.0') {
        ramlVersion='RAML10';
    }

    if (!ramlVersion) {
        throw new Error(messageRegistry.UNKNOWN_RAML_VERSION.message);
    }
    if(ramlVersion=='RAML08'&&checkApisOverlays){
        throw new Error(messageRegistry.EXTENSIONS_AND_OVERLAYS_NOT_SUPPORTED_0_8.message);
    }

    //if (!ramlFileType || ramlFileType.trim() === "") {
    //    if (verStr=='0.8') {
    //        typeName = universeDef.Universe08.Api.name;
    //        apiImpl = RamlWrapper08.ApiImpl;
    //    } else if(verStr=='1.0'){
    //        typeName = universeDef.Universe10.Api.name;
    //        apiImpl = RamlWrapper1.ApiImpl;
    //    }
    //} else if (ramlFileType === "Overlay") {
    //    apiImpl = RamlWrapper1.OverlayImpl;
    //    typeName = universeDef.Universe10.Overlay.name;
    //} else if (ramlFileType === "Extension") {
    //    apiImpl = RamlWrapper1.ExtensionImpl;
    //    typeName = universeDef.Universe10.Extension.name;
    //}

    var universe = universeProvider(ramlVersion);
    var apiType = universe.type(typeName);

    if (!highLevel) {
        highLevel = <hl.IHighLevelNode>hlimpl.fromUnit(unit);
        if(options.reusedNode) {
            if(options.reusedNode.lowLevel().unit().absolutePath()==unit.absolutePath()) {
                if(checkReusability(<hlimpl.ASTNodeImpl>highLevel,
                        <hlimpl.ASTNodeImpl>options.reusedNode)) {
                    (<hlimpl.ASTNodeImpl>highLevel).setReusedNode(options.reusedNode);
                }
            }
        }
        //highLevel =
        //    new hlimpl.ASTNodeImpl(unit.ast(), null, <any>apiType, null)
    }
    //api = new apiImpl(highLevel);
    return highLevel;
};

export function toError(api:hl.IHighLevelNode):hl.ApiLoadingError{
    var error:any = new Error(messageRegistry.API_CONTAINS_ERROR.message);
    error.parserErrors = hlimpl.toParserErrors(api.errors(),api);
    return error;
}


export function loadApis1(projectRoot:string,cacheChildren:boolean = false,expandTraitsAndResourceTypes:boolean=true){

    var universe = universeProvider("RAML10");
    var apiType=universe.type(universeDef.Universe10.Api.name);

    var p=new jsyaml.Project(projectRoot);
    var result:RamlWrapper1.Api[] = [];
    p.units().forEach( x=> {
        var lowLevel = x.ast();
        if(cacheChildren){
            lowLevel = llimpl.toChildCachingNode (lowLevel);
        }
        var api:RamlWrapper1.Api = new RamlWrapper1Impl.ApiImpl(new hlimpl.ASTNodeImpl(lowLevel, null, <any>apiType, null));

        if(expandTraitsAndResourceTypes){
            api = expander.expandTraitsAndResourceTypes(api);
        }
        result.push(api);
    });
    return result;
}

function checkReusability(hnode:hlimpl.ASTNodeImpl,rNode:hlimpl.ASTNodeImpl){
    if(!rNode) {
        return false;
    }
    var s1 = hnode.lowLevel().unit().contents();
    var s2 = rNode.lowLevel().unit().contents();
    var l = Math.min(s1.length,s2.length);
    var pos = -1;
    for(var i = 0 ; i < l ; i++){
        if(s1.charAt(i)!=s2.charAt(i)){
            pos = i;
            break;
        }
    }
    while(pos>0&&s1.charAt(pos).replace(/\s/,'')==''){
        pos--;
    }
    if(pos<0&&s1.length!=s2.length){
        pos = l;
    }
    var editedNode = search.deepFindNode(rNode,pos,pos+1);
    if(!editedNode){
        return true;
    }
    if(editedNode.lowLevel().unit().absolutePath() != hnode.lowLevel().unit().absolutePath()){
        return true;
    }
    var editedElement = editedNode.isElement() ? editedNode.asElement() : editedNode.parent();
    if(!editedElement){
        return true;
    }
    var pProp = editedElement.property();
    if(!pProp){
        return true;
    }
    if(universeHelpers.isAnnotationsProperty(pProp)){
        editedElement = editedElement.parent();
    }
    if(!editedElement){
        return true;
    }
    var p = editedElement;
    while(p){
        var pDef = p.definition();
        if(universeHelpers.isResourceTypeType(pDef)||universeHelpers.isTraitType(pDef)){
            return false;
        }
        var prop = p.property();
        if(!prop){
            return true;
        }
        if(universeHelpers.isTypeDeclarationDescendant(pDef)){
            if(universeHelpers.isTypesProperty(prop)||universeHelpers.isAnnotationTypesProperty(prop)){
                return false;
            }
        }
        var propRange = prop.range();
        if(universeHelpers.isResourceTypeRefType(propRange)||universeHelpers.isTraitRefType(propRange)){
            return false;
        }
        p = p.parent();
    }
    return true;
}

function setAttributeDefaults(api:parserCoreApi.BasicNode,options){
    options = options || {};
    if (options.attributeDefaults != null && api) {
        (<any>api).setAttributeDefaults(options.attributeDefaults);
    } else if (api) {
        (<any>api).setAttributeDefaults(true);
    }
}