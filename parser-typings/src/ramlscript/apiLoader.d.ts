/// <reference path="../../typings/tsd.d.ts" />
import RamlWrapper1 = require("../raml1/artifacts/raml10parser");
import RamlWrapper08 = require("../raml1/artifacts/raml08parser");
import Opt = require('../Opt');
import jsyaml = require("../raml1/jsyaml/jsyaml2lowLevel");
export interface Options {
    expandTraitsAndResourceTypes?: boolean;
    includeResolver?: jsyaml.IncludeResolver;
    httpResolver?: jsyaml.HTTPResolver;
}
export declare function loadApi1(apiPath: string, options?: Options): Opt<RamlWrapper1.Api>;
export declare function loadApi08(apiPath: string, options?: Options): Opt<RamlWrapper08.Api>;
export declare function loadApi(apiPath: string, options?: Options): Opt<RamlWrapper1.Api | RamlWrapper08.Api>;
export declare function loadApi1Async(apiPath: string, options?: Options): Promise<RamlWrapper1.Api>;
export declare function loadApi08Async(apiPath: string, options?: Options): Promise<RamlWrapper08.Api>;
export declare function loadApiAsync(apiPath: string, options?: Options): Promise<RamlWrapper1.Api | RamlWrapper08.Api>;
export declare function loadApis1(projectRoot: string, cacheChildren?: boolean, expandTraitsAndResourceTypes?: boolean): RamlWrapper1.Api[];
