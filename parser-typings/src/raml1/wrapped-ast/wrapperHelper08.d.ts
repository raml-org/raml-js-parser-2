import RamlWrapper = require('../artifacts/raml08parser');
import core = require("./parserCore");
export declare function load(pth: string): core.BasicNode;
/**
 * __$helperMethod__
 * Equivalent API with traits and resource types expanded
 * __$meta__={"name":"expand"}
 **/
export declare function expandTraitsAndResourceTypes(api: RamlWrapper.Api): RamlWrapper.Api;
export declare function completeRelativeUri(res: RamlWrapper.Resource): string;
export declare function absoluteUri(res: RamlWrapper.Resource): string;
export declare function qName(c: core.BasicNode): string;
/**
 * __$helperMethod__
 * __$meta__{"name":"traits","override":true}
 **/
export declare function traitsPrimary(a: RamlWrapper.Api): RamlWrapper.Trait[];
/**
 * __$helperMethod__ Retrieve all traits including those defined in libraries *
 * __$meta__{"deprecated":true}
 */
export declare function allTraits(a: RamlWrapper.Api): RamlWrapper.Trait[];
/**
 *__$helperMethod__
 *__$meta__{"name":"resourceTypes","override":true}
 **/
export declare function resourceTypesPrimary(a: RamlWrapper.Api): RamlWrapper.ResourceType[];
/**
 * __$helperMethod__ Retrieve all resource types including those defined in libraries
 * __$meta__{"deprecated":true}
 */
export declare function allResourceTypes(a: RamlWrapper.Api): RamlWrapper.ResourceType[];
export declare function relativeUriSegments(res: RamlWrapper.Resource): string[];
export declare function parentResource(method: RamlWrapper.Method): RamlWrapper.Resource;
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
export declare function uriParametersPrimary(resource: RamlWrapper.Resource): RamlWrapper.Parameter[];
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
 * Thus, it is not among Resource.uriParameters(), but it is among Resource.allUriParameters().
 * __$meta__={"name":"allUriParameters","deprecated":true}
 **/
export declare function uriParameters(resource: RamlWrapper.Resource): RamlWrapper.Parameter[];
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
export declare function baseUriParametersPrimary(api: RamlWrapper.Api): RamlWrapper.Parameter[];
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
 * Thus, they are not among `Api.baseUriParameters()`, but they are among `Api.allBaseUriParameters()`.
 * __$meta__={"name":"allBaseUriParameters","deprecated":true}
 **/
export declare function baseUriParameters(api: RamlWrapper.Api): RamlWrapper.Parameter[];
/**
 * __$helperMethod__
 * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.allBaseUriParameters()`
 * for `Api` owning the `Resource` and `Resource.allUriParameters()`.
 **/
export declare function absoluteUriParameters(res: RamlWrapper.Resource): RamlWrapper.Parameter[];
/**
 * __$helperMethod__
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
 * __$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__={"name":"securedBy","override":true}
 **/
export declare function securedByPrimary(resourceOrMethod: RamlWrapper.Resource | RamlWrapper.Method): RamlWrapper.SecuritySchemeRef[];
/**
 * __$helperMethod__
 * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 * __$meta__{"deprecated":true}
 **/
export declare function allSecuredBy(resourceOrMethod: RamlWrapper.Resource | RamlWrapper.Method): RamlWrapper.SecuritySchemeRef[];
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
 * __$meta__={"name":"resourceType","primary":true}
 **/
export declare function referencedResourceType(ref: RamlWrapper.ResourceTypeRef): RamlWrapper.ResourceType;
/**
 * __$helperMethod__
 * __$meta__={"primary":true}
 **/
export declare function schemaContent(bodyDeclaration: RamlWrapper.BodyLike): string;
