import parserCore = require("./raml1/wrapped-ast/parserCoreApi")
import apiLoader = require("./raml1/apiLoader")
import path = require("path")

var PromiseConstructor = require('promise-polyfill');

/**
 * RAML 1.0 top-level AST interfaces.
 */
export import api10 = require("./raml1/artifacts/raml10parserapi")

/**
 * RAML 0.8 top-level AST interfaces.
 */
export import api08 = require("./raml1/artifacts/raml08parserapi")

/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, options?:parserCore.Options):api10.Api|api08.Api;
/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, extensionsAndOverlays:string[],
                            options?:parserCore.Options):api10.Api|api08.Api;

export function loadApiSync(apiPath:string, arg1?:string[]|parserCore.Options,
                            arg2?:parserCore.Options):api10.Api|api08.Api{

    return <api10.Api|api08.Api>apiLoader.loadApi(apiPath,arg1,arg2).getOrElse(null);
}

/**
 * Load RAML synchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return RAMLLanguageElement instance.
 **/
export function loadRAMLSync(ramlPath:string, extensionsAndOverlays:string[],
                             options?:parserCore.Options):hl.BasicNode

export function loadRAMLSync(ramlPath:string, arg1?:string[]|parserCore.Options,
                             arg2?:parserCore.Options):hl.BasicNode{

    return <any>apiLoader.loadApi(ramlPath,arg1,arg2).getOrElse(null);
}

function optionsForContent(content:string,
            arg2?:parserCore.Options):parserCore.Options{
    return {
        fsResolver:{
            content(pathStr:string):string{
                if (pathStr==path.resolve("/","#local.raml").replace(/\\/,"/")){
                    return content;
                }
                if (arg2){
                    if (arg2.fsResolver){
                        return arg2.fsResolver.content(pathStr);
                    }
                }
            },

            contentAsync(pathStr:string):Promise<string>{
                if (pathStr==path.resolve("/","#local.raml").replace(/\\/,"/")){
                    return Promise.resolve(content);
                }
                if (arg2){
                    if (arg2.fsResolver){
                        return arg2.fsResolver.contentAsync(pathStr);
                    }
                }
            }
        },
        httpResolver:arg2?arg2.httpResolver:null,
        rejectOnErrors:arg2?arg2.rejectOnErrors:false,
        attributeDefaults:arg2?arg2.attributeDefaults:true
    }
}
/**
 * Load RAML synchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param content content of the raml
 * @param options Load options  (note you should path a resolvers if you want includes to be resolved)
 * @return RAMLLanguageElement instance.
 **/
export function parseRAMLSync(content:string,
                             arg2?:parserCore.Options):hl.BasicNode{

    return <any>apiLoader.loadApi("/#local.raml",[],optionsForContent(content,arg2)).getOrElse(null);
}
/**
 * Load RAML asynchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param content content of the raml
 * @param options Load options  (note you should path a resolvers if you want includes to be resolved)
 * @return RAMLLanguageElement instance.
 **/
export function parseRAML(content:string,
                              arg2?:parserCore.Options):hl.BasicNode{

    return <any>apiLoader.loadApi("/#local.raml",[],optionsForContent(content,arg2)).getOrElse(null);
}

/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string, options?:parserCore.Options):Promise<api10.Api|api08.Api>;
/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string,extensionsAndOverlays:string[],
                        options?:parserCore.Options):Promise<api10.Api|api08.Api>;

export function loadApi(apiPath:string, arg1?:string[]|parserCore.Options,
                        arg2?:parserCore.Options):Promise<api10.Api|api08.Api>{

    return apiLoader.loadApiAsync(apiPath,arg1,arg2);
}

/**
 * Load RAML asynchronously. May load both Api and Typed fragments. The Promise is rejected with [[ApiLoadingError]] if the resulting RAMLLanguageElement contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;RAMLLanguageElement&gt;.
 **/
export function loadRAML(ramlPath:string,extensionsAndOverlays:string[],
                         options?:parserCore.Options):Promise<hl.BasicNode>;

export function loadRAML(ramlPath:string, arg1?:string[]|parserCore.Options,
                         arg2?:parserCore.Options):Promise<hl.BasicNode>{

    return apiLoader.loadRAMLAsync(ramlPath,arg1,arg2);
}

/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export function getLanguageElementByRuntimeType(runtimeType : hl.ITypeDefinition) : parserCore.BasicNode {
    return apiLoader.getLanguageElementByRuntimeType(runtimeType);
}

/**
 * Check if the AST node represents fragment
 */
export function isFragment(node:api10.Api|api10.Library|api10.Overlay|api10.Extension|api10.Trait|api10.TypeDeclaration|api10.ResourceType|api10.DocumentationItem):boolean{
    return api10.isFragment(<any>node);
}

/**
 * Convert fragment representing node to FragmentDeclaration instance.
 */
export function asFragment(node:api10.Api|api10.Library|api10.Overlay|api10.Extension|api10.Trait|api10.TypeDeclaration|api10.ResourceType|api10.DocumentationItem):api10.FragmentDeclaration{
    return api10.asFragment(<any>node);
}

/**
 * High-level AST interfaces.
 */
export import hl=require("./raml1/highLevelAST")

/**
 * Low-level AST interfaces.
 */
export import ll=require("./raml1/lowLevelAST")

/**
 * Search functionality, operates on high AST level.
 */
export import search=require("./searchProxy")

/**
 * High-level stub node factory methods.
 */
export import stubs=require("./stubProxy")

export import utils=require("./utils")

/**
 * Low-level project factory.
 */
export import project=require("./project")

/**
 * Helpers for classification of high-level AST entity types.
 */
export import universeHelpers=require("./raml1/tools/universeHelpers")

/**
 * Definition system.
 */
export import ds=require("raml-definition-system")

/**
 * Schema utilities.
 */
export import schema=require("./schema");

/**
 * A set of constants describing definition system entities.
 * @hidden
 **/
export var universes=ds.universesInfo

/**
 * Exposed parser model modification methods. Operate on high-level.
 */
export import parser = require("./parser")

/**
 * Applies traits and resources types to API on high-level.
 * Top-level expansion should be performed via calling expand() method of API node.
 */
export import expander=require("./expanderStub")

/**
 * Exposed part of custom methods applied to top-level AST during generation.
 * Not to be used by parser clients.
 */
export import wrapperHelper=require("./wrapperHelperStub")

/**
 * Abstract high-level node potentially having children.
 * @hidden
 **/
export type IHighLevelNode=hl.IHighLevelNode;

/**
 * Abstract high-level node property.
 * @hidden
 */
export type IProperty=hl.IProperty;

/**
 * The root of high-level node interface hierarchy.
 * @hidden
 **/
export type IParseResult=hl.IParseResult;

if(typeof Promise === 'undefined' && typeof window !== 'undefined') {
    (<any>window).Promise = PromiseConstructor;
}

