/// <reference path="typings/tsd.d.ts" />
import RamlWrapper = require('./src/raml1/artifacts/raml003Parser');
import parserCore = require('./src/raml1/parserCore');
import json2lowlevel = require('./src/raml1/jsyaml/json2lowLevel');
import Opt = require('./src/Opt');
export declare function loadApi(apiPath: string, expandTraitsAndResourceTypes?: boolean): Opt<RamlWrapper.Api>;
export declare function loadApiAsync(apiPath: string, expandTraitsAndResourceTypes?: boolean): Promise<RamlWrapper.Api>;
export declare function toJSON(node: parserCore.BasicSuperNode, serializeOptions?: json2lowlevel.SerializeOptions): any;
