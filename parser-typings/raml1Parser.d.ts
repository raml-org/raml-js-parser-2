/// <reference path="typings/main.d.ts" />
import RamlWrapper = require('./src/raml1/artifacts/raml10parser');
import parserCore = require('./src/raml1/wrapped-ast/parserCore');
import typeSystem = require("./src/raml1/definition-system/typeSystem");
export declare function loadApiSync(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): RamlWrapper.Api;
export declare function loadApi(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): Promise<RamlWrapper.Api>;
export declare function loadRAMLSync(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): RamlWrapper.RAMLLanguageElement;
export declare function loadRAML(apiPath: string, extensionsAndOverlays?: string[], options?: parserCore.Options): Promise<RamlWrapper.RAMLLanguageElement>;
/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export declare function getLanguageElementByRuntimeType(runtimeType: typeSystem.ITypeDefinition): parserCore.BasicNode;
