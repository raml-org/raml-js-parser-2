/// <reference path="typings/tsd.d.ts" />
import RamlWrapper = require('./src/raml1/artifacts/raml10parser');
import parserCore = require('./src/raml1/wrapped-ast/parserCore');
export declare function loadApi(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): RamlWrapper.Api;
export declare function loadApiAsync(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): Promise<RamlWrapper.Api>;
