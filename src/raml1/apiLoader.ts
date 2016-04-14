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
import util=require("../util/index")
import universeDef=require("../raml1/tools/universe")
import parserCore=require('../raml1/wrapped-ast/parserCore')
import parserCoreApi=require('../raml1/wrapped-ast/parserCoreApi')
import ramlServices = require("../raml1/definition-system/ramlServices")

export type IHighLevelNode=hl.IHighLevelNode;
export type IParseResult=hl.IParseResult;

import universeProvider=require("../raml1/definition-system/universeProvider")
import {IHighLevelNode} from "raml-definition-system/dist/definitionSystem";

/***
 * Load API synchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadApi(apiPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options):Opt<RamlWrapper1.Api|RamlWrapper08.Api>{

    var api = loadRAMLInternal(apiPath,arg1,arg2);

    // if (false) {
    //     //TODO loaded RAML is API
    //     throw new Error("Loaded RAML is not API");
    // } else {
    return new Opt<RamlWrapper1.Api|RamlWrapper08.Api>(<any>api);
    // }

}

/***
 * Load RAML synchronously. Detects RAML version and uses corresponding parser.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;RAMLLanguageElement&gt;, where RAMLLanguageElement belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export function loadRAML(ramlPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options) : Opt<hl.BasicNode> {
    var result = loadRAMLInternal(ramlPath, arg1, arg2);
    return new Opt<hl.BasicNode>(result);
}

function loadRAMLInternal(apiPath:string,arg1?:string[]|parserCoreApi.Options,arg2?:string[]|parserCoreApi.Options) : hl.BasicNode {
    var gotArray = Array.isArray(arg1);
    var extensionsAndOverlays = <string[]>(gotArray ? arg1: null);
    var options = <parserCoreApi.Options>(gotArray ? arg2 : arg1);
    options = options || {};


    var project = getProject(apiPath,options);
    var unitName = path.basename(apiPath);
    var unit = project.unit(unitName);

    if (arg2 && !extensionsAndOverlays) {
        throw new Error("Extensions and overlays list should be defined");
    }

    var api:hl.BasicNode;
    if(unit){

        if (extensionsAndOverlays && extensionsAndOverlays.length > 0) {
            var extensionUnits = [];

            extensionsAndOverlays.forEach(currentPath =>{
                if (!currentPath || currentPath.trim().length == 0) {
                    throw new Error("Extensions and overlays list should contain legal file paths");
                }
            })

            extensionsAndOverlays.forEach(unitPath=>{
                extensionUnits.push(project.unit(path.basename(unitPath)))
            })

            //calling to perform the checks, we do not actually need the api itself
            extensionUnits.forEach(extensionUnit=>toApi(extensionUnit, options))

            api = toApi(expander.mergeAPIs(unit, extensionUnits, hlimpl.OverlayMergeMode.MERGE), options)
        } else {

            api = toApi(unit, options);
            (<hlimpl.ASTNodeImpl>api.highLevel()).setMergeMode(hlimpl.OverlayMergeMode.MERGE);
        }

    }
    if(options.rejectOnErrors && api && api.errors().length){
        throw toError(api);
    }

    if (options.attributeDefaults != null && api) {
        (<any>api).setAttributeDefaults(options.attributeDefaults);
    } else if (api) {
        (<any>api).setAttributeDefaults(true);
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
    var gotArray = Array.isArray(arg1);
    var extensionsAndOverlays = <string[]>(gotArray ? arg1: null);
    var options = <parserCoreApi.Options>(gotArray ? arg2 : arg1);
    options = options || {};

    var project = getProject(ramlPath,options);
    var unitName = path.basename(ramlPath);

    if (arg2 && !extensionsAndOverlays) {
        throw new Error("Extensions and overlays list should be defined");
    }

    if (!extensionsAndOverlays || extensionsAndOverlays.length == 0) {
        return fetchAndLoadApiAsync(project, unitName, options).then(masterApi=>{
            masterApi.highLevel().setMergeMode(hlimpl.OverlayMergeMode.MERGE);
            if (options.attributeDefaults != null && masterApi) {
                (<any>masterApi).setAttributeDefaults(options.attributeDefaults);
            } else if (masterApi) {
                (<any>masterApi).setAttributeDefaults(true);
            }

            return masterApi;
        })
    } else {

        extensionsAndOverlays.forEach(currentPath =>{
            if (!currentPath || currentPath.trim().length == 0) {
                throw new Error("Extensions and overlays list should contain legal file paths");
            }
        })

        return fetchAndLoadApiAsync(project, unitName, options).then(masterApi=>{
            var apiPromises = []

            extensionsAndOverlays.forEach(extensionUnitPath=>{
                apiPromises.push(fetchAndLoadApiAsync(project, path.basename(extensionUnitPath), options))
            })

            return Promise.all(apiPromises).then(apis=>{
                var overlayUnits = []
                apis.forEach(currentApi=>overlayUnits.push(currentApi.highLevel().lowLevel().unit()))

                var result = expander.mergeAPIs(masterApi.highLevel().lowLevel().unit(), overlayUnits,
                    hlimpl.OverlayMergeMode.MERGE);

                if (options.attributeDefaults != null && result) {
                    (<any>result).setAttributeDefaults(options.attributeDefaults);
                } else if (result) {
                    (<any>result).setAttributeDefaults(true);
                }

                return result;
            }).then(mergedHighLevel=>{
                return toApi(mergedHighLevel, options);
            })
        })
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

function fetchAndLoadApiAsync(project: jsyaml.Project, unitName : string, options: parserCoreApi.Options) {
    return llimpl.fetchIncludesAsync(project,unitName).then(x=>{
        try {
            var api = toApi(x, options);
            if (options.rejectOnErrors && api && api.errors().length) {
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

    var projectRoot = path.dirname(apiPath);
    var project:jsyaml.Project = new jsyaml.Project(projectRoot, includeResolver, httpResolver);
    return project;
};

function toApi(unitOrHighlevel:ll.ICompilationUnit|hl.IHighLevelNode, options:parserCoreApi.Options,checkApisOverlays=false):hl.BasicNode {
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

    var api:hl.BasicNode;

    var contents = unit.contents();

    var ramlFirstLine = contents.match(/^\s*#%RAML\s+(\d\.\d)\s*(\w*)\s*$/m);
    if(!ramlFirstLine){
        //TODO throw sensible error
        return null;
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
        throw new Error("Unknown version of RAML expected to see one of '#%RAML 0.8' or '#%RAML 1.0'");
    }
    if(ramlVersion=='RAML08'&&checkApisOverlays){
        throw new Error('Extensions and overlays are not supported in RAML 0.8.');
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
        //highLevel =
        //    new hlimpl.ASTNodeImpl(unit.ast(), null, <any>apiType, null)
    }
    //api = new apiImpl(highLevel);
    api = <hl.BasicNode>highLevel.wrapperNode();

    return api;
};

export function toError(api:hl.BasicNode):parserCore.ApiLoadingError{
    var error:any = new Error('Api contains errors.');
    error.parserErrors = api.errors();
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
            lowLevel = llimpl.toChildCahcingNode(lowLevel);
        }
        var api:RamlWrapper1.Api = new RamlWrapper1Impl.ApiImpl(new hlimpl.ASTNodeImpl(lowLevel, null, <any>apiType, null));

        if(expandTraitsAndResourceTypes){
            api = expander.expandTraitsAndResourceTypes(api);
        }
        result.push(api);
    });
    return result;
}