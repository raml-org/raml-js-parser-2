/// <reference path="../../typings/tsd.d.ts" />
import RamlWrapper1 = require("../raml1/artifacts/raml003parser");
import Opt = require('../Opt');
export declare function loadApi1(apiPath: string, expandTraitsAndResourceTypes?: boolean): Opt<RamlWrapper1.Api>;
export declare function loadApi1Async(apiPath: string, expandTraitsAndResourceTypes?: boolean): Promise<RamlWrapper1.Api>;
export declare function loadApis1(projectRoot: string, cacheChildren?: boolean, expandTraitsAndResourceTypes?: boolean): RamlWrapper1.Api[];
