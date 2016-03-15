import RamlWrapper = require('../artifacts/raml10parser');
import core = require("./parserCore");
import hl = require('../highLevelAST');
import Opt = require('../../Opt');
import typeSystem = require("../definition-system/typeSystem");
export declare function resolveType(p: RamlWrapper.TypeDeclaration): hl.ITypeDefinition;
export declare function runtimeType(p: RamlWrapper.TypeDeclaration): typeSystem.ITypeDefinition;
export declare function load(pth: string): core.BasicNode;
export declare function completeRelativeUri(res: RamlWrapper.Resource): string;
/**
 * __$helperMethod__
 * Equivalent API with traits and resource types expanded
 * __$meta__={"name":"expand"}
 **/
export declare function expandTraitsAndResourceTypes(api: RamlWrapper.Api): RamlWrapper.Api;
export declare function absoluteUri(res: RamlWrapper.Resource): string;
export declare function validateInstance(res: RamlWrapper.TypeDeclaration, value: any): string[];
export declare function qName(c: core.BasicNode): string;
/**
 * __$helperMethod__
 * Retrieve all traits including those defined in libraries
 * __$meta__{"name":"traits","override":true}
 **/
export declare function traitsPrimary(a: RamlWrapper.LibraryBase): RamlWrapper.Trait[];
/**
 * __$helperMethod__ Retrieve all traits including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export declare function allTraits(a: RamlWrapper.LibraryBase): RamlWrapper.Trait[];
/**
 * __$helperMethod__
 * Retrieve all resource types including those defined in libraries
 * __$meta__{"name":"resourceTypes","override":true}
 **/
export declare function resourceTypesPrimary(a: RamlWrapper.LibraryBase): RamlWrapper.ResourceType[];
/**
 * __$helperMethod__ Retrieve all resource types including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export declare function allResourceTypes(a: RamlWrapper.LibraryBase): RamlWrapper.ResourceType[];
export declare function relativeUriSegments(res: RamlWrapper.Resource): string[];
export declare function parentResource(method: RamlWrapper.Method): RamlWrapper.Resource;
/**
 * __$helperMethod__
 * Parent resource for non top level resources
 * __$meta__={"name":"parentResource"}
 **/
export declare function parent(resource: RamlWrapper.Resource): RamlWrapper.Resource;
export declare function childResource(container: RamlWrapper.Resource | RamlWrapper.Api, relPath: string): RamlWrapper.Resource;
export declare function getResource(container: RamlWrapper.Api | RamlWrapper.Resource, path: string[]): RamlWrapper.Resource;
export declare function childMethod(resource: RamlWrapper.Resource, method: string): RamlWrapper.Method[];
export declare function getMethod(container: RamlWrapper.Resource | RamlWrapper.Api, path: string[], method: string): RamlWrapper.Method[];
export declare function ownerApi(method: RamlWrapper.Method | RamlWrapper.Resource): RamlWrapper.Api;
/**
 * __$helperMethod__
 * For methods of Resources: `{parent Resource relative path} {methodName}`.
 * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
 * For other methods throws Exception.
 **/
export declare function methodId(method: RamlWrapper.Method): string;
export declare function isOkRange(response: RamlWrapper.Response): boolean;
export declare function allResources(api: RamlWrapper.Api): RamlWrapper.Resource[];
export declare function matchUri(apiRootRelativeUri: string, resource: RamlWrapper.Resource): Opt<ParamValue[]>;
export declare function schema(body: RamlWrapper.TypeDeclaration, api: RamlWrapper.Api): Opt<SchemaDef>;
/**
 * __$helperMethod__
 * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
 * Consider a fragment of RAML specification:
 * ```yaml
 * /resource/{objectId}/{propertyId}:
 *   uriParameters:
 *     objectId:
 * ```
 * Here `propertyId` uri parameter is not described in the `uriParameters` node,
 * but it is among Resource.uriParameters().
 * __$meta__={"name":"uriParameters","override": true}
 **/
export declare function uriParametersPrimary(resource: RamlWrapper.ResourceBase): RamlWrapper.TypeDeclaration[];
/**
 * __$helperMethod__
 * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
 * Consider a fragment of RAML specification:
 * ```yaml
 * /resource/{objectId}/{propertyId}:
 *   uriParameters:
 *     objectId:
 * ```
 * Here `propertyId` uri parameter is not described in the `uriParameters` node,
 * but it is among Resource.allUriParameters().
 * __$meta__={"name":"allUriParameters","deprecated":true}
 **/
export declare function uriParameters(resource: RamlWrapper.ResourceBase): RamlWrapper.TypeDeclaration[];
/**
 * __$helperMethod__
 * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
 * Consider a fragment of RAML specification:
 * ```yaml
 * version: v1
 * baseUri: https://{organization}.example.com/{version}/{service}
 * baseUriParameters:
 *   service:
 * ```
 * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
 * but they are among `Api.baseUriParameters()`.
 * __$meta__={"name":"baseUriParameters","override":true}
 **/
export declare function baseUriParametersPrimary(api: RamlWrapper.Api): RamlWrapper.TypeDeclaration[];
/**
 * __$helperMethod__
 * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
 * Consider a fragment of RAML specification:
 * ```yaml
 * version: v1
 * baseUri: https://{organization}.example.com/{version}/{service}
 * baseUriParameters:
 *   service:
 * ```
 * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
 * but they are among `Api.allBaseUriParameters()`.
 * __$meta__={"name":"allBaseUriParameters","deprecated":true}
 **/
export declare function baseUriParameters(api: RamlWrapper.Api): RamlWrapper.TypeDeclaration[];
/**
 * __$helperMethod__
 * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
 * for `Api` owning the `Resource` and `Resource.uriParameters()`.
 **/
export declare function absoluteUriParameters(res: RamlWrapper.Resource): RamlWrapper.TypeDeclaration[];
/**
 * _//_$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__={"name":"protocols","override":true}
 **/
export declare function protocolsPrimary(api: RamlWrapper.Api): string[];
/**
 * __$helperMethod__
 * Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 * __$meta__{"deprecated":true}
 **/
export declare function allProtocols(api: RamlWrapper.Api): string[];
/**
 * _//_$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__={"name":"securedBy","override":true}
 **/
export declare function securedByPrimary(resourceOrMethod: RamlWrapper.ResourceBase | RamlWrapper.Method): RamlWrapper.SecuritySchemeRef[];
/**
 * __$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__{"deprecated":true}
 **/
export declare function allSecuredBy(resourceOrMethod: RamlWrapper.ResourceBase | RamlWrapper.Method): RamlWrapper.SecuritySchemeRef[];
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function securitySchemeName(schemeReference: RamlWrapper.SecuritySchemeRef): string;
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function securityScheme(schemeReference: RamlWrapper.SecuritySchemeRef): RamlWrapper.AbstractSecurityScheme;
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function RAMLVersion(api: RamlWrapper.Api): string;
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function structuredValue(reference: RamlWrapper.Reference): RamlWrapper.TypeInstance;
/**
 * __$helperMethod__
 * __$meta__={"name":"name","primary":true}
 **/
export declare function referenceName(reference: RamlWrapper.Reference): string;
/**
 * __$helperMethod__
 * __$meta__={"name":"trait","primary":true}
 **/
export declare function referencedTrait(ref: RamlWrapper.TraitRef): RamlWrapper.Trait;
/**
 * __$helperMethod__
 * __$meta__={"name":"annotation","primary":true}
 **/
export declare function referencedAnnotation(ref: RamlWrapper.AnnotationRef): RamlWrapper.AnnotationTypeDeclaration;
/**
 * __$helperMethod__
 * __$meta__={"name":"resourceType","primary":true}
 **/
export declare function referencedResourceType(ref: RamlWrapper.ResourceTypeRef): RamlWrapper.ResourceType;
/**
 * __$helperMethod__
 * __$meta__={"name":"example","override":true}
 **/
export declare function getTypeExample(td: RamlWrapper.TypeDeclaration): string;
/**
 * __$helperMethod__
 * __$meta__={"name":"structuredExample","primary":true}
 **/
export declare function getTypeStructuredExample(td: RamlWrapper.TypeDeclaration): RamlWrapper.TypeInstance;
/**
 * __$helperMethod__
 * __$meta__={"name":"content","override":true}
 **/
export declare function getExampleStringContent(td: RamlWrapper.ExampleSpec): string;
/**
 * __$helperMethod__
 * __$meta__={"name":"structuredContent","primary":true}
 **/
export declare function getExampleStructuredContent(td: RamlWrapper.ExampleSpec): RamlWrapper.TypeInstance;
/**
 * __$helperMethod__
 * __$meta__={"name":"fixedFacets","primary":true}
 **/
export declare function typeFixedFacets(td: RamlWrapper.TypeDeclaration): RamlWrapper.TypeInstance;
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function schemaContent(typeDeclaration: RamlWrapper.TypeDeclaration): string;
/**
 * __$helperMethod__
 * __$meta__={"name":"parametrizedProperties","primary":true}
 **/
export declare function getTemplateParametrizedProperties(node: RamlWrapper.Trait | RamlWrapper.ResourceType): RamlWrapper.TypeInstance;
export declare class SchemaDef {
    private _content;
    private _name;
    constructor(_content: string, _name?: string);
    name(): string;
    content(): string;
}
export declare class ParamValue {
    key: string;
    value: any;
    constructor(key: string, value: any);
}
