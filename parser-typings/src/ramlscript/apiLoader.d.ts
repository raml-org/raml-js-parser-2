/// <reference path="../../typings/main.d.ts" />
import RamlWrapper1 = require("../raml1/artifacts/raml10parser");
import RamlWrapper08 = require("../raml1/artifacts/raml08parser");
import Opt = require('../Opt');
import parserCore = require('../raml1/wrapped-ast/parserCore');
/***
 * Load API synchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Opt&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export declare function loadApi(apiPath: string, arg1?: string[] | parserCore.Options, arg2?: string[] | parserCore.Options): Opt<RamlWrapper1.Api | RamlWrapper08.Api>;
/***
 * Load API asynchronously. Detects RAML version and uses corresponding parser.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;, where Api belongs to RAML 1.0 or RAML 0.8 model.
 ***/
export declare function loadApiAsync(apiPath: string, arg1?: string[] | parserCore.Options, arg2?: string[] | parserCore.Options): Promise<RamlWrapper1.Api | RamlWrapper08.Api>;
export declare function toError(api: RamlWrapper1.Api | RamlWrapper08.Api): parserCore.ApiLoadingError;
export declare function loadApis1(projectRoot: string, cacheChildren?: boolean, expandTraitsAndResourceTypes?: boolean): RamlWrapper1.Api[];
