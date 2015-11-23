/// <reference path="../../typings/tsd.d.ts" />
import RamlWrapper1 = require("../raml1/artifacts/raml10parser");
import RamlWrapper08 = require("../raml1/artifacts/raml08parser");
import Opt = require('../Opt');
import jsyaml = require("../raml1/jsyaml/jsyaml2lowLevel");
export interface Options {
    /**
     * Whether ro expand traits and resource types
     * @default true
     **/
    expandTraitsAndResourceTypes?: boolean;
    /**
     * Module used for operations with file system
     **/
    fsResolver?: jsyaml.FSResolver;
    /**
     * Module used for operations with web
     **/
    httpResolver?: jsyaml.HTTPResolver;
}
/***
 * Load RAML 1.0 API synchronously
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;
 ***/
export declare function loadApi1(apiPath: string, options?: Options): Opt<RamlWrapper1.Api>;
/***
 * Load RAML 0.8 API synchronously
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;
 ***/
export declare function loadApi08(apiPath: string, options?: Options): Opt<RamlWrapper08.Api>;
/***
 * Load API synchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export declare function loadApi(apiPath: string, options?: Options): Opt<RamlWrapper1.Api | RamlWrapper08.Api>;
/***
 * Load RAML 1.0 API asynchronously.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;
 ***/
export declare function loadApi1Async(apiPath: string, options?: Options): Promise<RamlWrapper1.Api>;
/***
 * Load RAML 0.8 API asynchronously.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;
 ***/
export declare function loadApi08Async(apiPath: string, options?: Options): Promise<RamlWrapper08.Api>;
/***
 * Load API asynchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export declare function loadApiAsync(apiPath: string, options?: Options): Promise<RamlWrapper1.Api | RamlWrapper08.Api>;
export declare function loadApis1(projectRoot: string, cacheChildren?: boolean, expandTraitsAndResourceTypes?: boolean): RamlWrapper1.Api[];
