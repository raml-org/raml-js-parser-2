/// <reference path="typings/tsd.d.ts" />
import json2lowlevel = require('./src/raml1/jsyaml/json2lowLevel');
import RamlWrapper = require('./src/raml1/artifacts/raml10parser');
import parserCore = require('./src/raml1/wrapped-ast/parserCore');
import Opt = require('./src/Opt');
/***
 * Load API synchronously
 * @param apiPath Path to API: local file system path or Web URL
 * @param expand Whether to expand traits and resource types
 * @return Opt<Api>. Call .isDefined() Opt member to find out if the result actually contains an Api. Call .getOrThrow() Opt member to retrieve the Api.
 ***/
export declare function loadApi(apiPath: string, expand?: boolean): Opt<RamlWrapper.Api>;
/***
 * Load API asynchronously
 * @param apiPath Path to API: local file system path or Web URL
 * @param expand Whether to expand traits and resource types
 * @return Promise<Api>
 ***/
export declare function loadApiAsync(apiPath: string, expand?: boolean): Promise<RamlWrapper.Api>;
/***
 * Turn model node into an object. Should not be relied on for API analysis and manipulation by the parser users.
 * @param node Model node
 * @return Stringifyable object representation of the node.
 ***/
export declare function toJSON(node: parserCore.BasicNode, serializeOptions?: json2lowlevel.SerializeOptions): any;
