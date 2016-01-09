import RamlWrapper = require('../artifacts/raml08parser');
import core = require("./parserCore");
import hl = require('../highLevelAST');
export declare function load(pth: string): core.BasicNode;
export declare function expandTraitsAndResourceTypes(api: RamlWrapper.Api): RamlWrapper.Api;
export declare function completeRelativeUri(res: RamlWrapper.Resource): string;
export declare function absoluteUri(res: RamlWrapper.Resource): string;
export declare function qName(c: core.BasicNode): string;
export declare function allTraits(a: RamlWrapper.Api): RamlWrapper.Trait[];
export declare function allResourceTypes(a: RamlWrapper.Api): RamlWrapper.ResourceType[];
export declare function relativeUriSegments(res: RamlWrapper.Resource): string[];
export declare function parentResource(method: RamlWrapper.Method): RamlWrapper.Resource;
export declare function parent(resource: RamlWrapper.Resource): RamlWrapper.Resource;
export declare function childResource(container: RamlWrapper.Resource | RamlWrapper.Api, relPath: string): RamlWrapper.Resource;
export declare function getResource(container: RamlWrapper.Api | RamlWrapper.Resource, path: string[]): RamlWrapper.Resource;
export declare function childMethod(resource: RamlWrapper.Resource, method: string): RamlWrapper.Method[];
export declare function getMethod(container: RamlWrapper.Resource | RamlWrapper.Api, path: string[], method: string): RamlWrapper.Method[];
export declare function ownerApi(method: RamlWrapper.Method | RamlWrapper.Resource): RamlWrapper.Api;
export declare function methodId(method: RamlWrapper.Method): string;
export declare function isOkRange(response: RamlWrapper.Response): boolean;
export declare function allResources(api: RamlWrapper.Api): RamlWrapper.Resource[];
/**
 * __$helperMethod__ Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
 * Consider a fragment of RAML specification:
 * ```yaml
 * /resource/{objectId}/{propertyId}:
 *   uriParameters:
 *     objectId:
 * ```
 * Here `propertyId` uri parameter is not described in the `uriParameters` node.
 * Thus, it is not among Resource.uriParameters(), but it is among Resource.allUriParameters().
 * __$meta__={"name":"allUriParameters"}
 **/
export declare function uriParameters(resource: RamlWrapper.Resource): RamlWrapper.Parameter[];
/**__$helperMethod__
 * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
 * Consider a fragment of RAML specification:
 * ```yaml
 * version: v1
 * baseUri: https://{organization}.example.com/{version}/{service}
 * baseUriParameters:
 *   service:
 * ```
 * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node.
 * Thus, they are not among `Api.baseUriParameters()`, but they are among `Api.allBaseUriParameters()`.
 * __$meta__={"name":"allBaseUriParameters"}
 **/
export declare function baseUriParameters(api: RamlWrapper.Api): RamlWrapper.Parameter[];
/**__$helperMethod__
 * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.allBaseUriParameters()`
 * for `Api` owning the `Resource` and `Resource.allUriParameters()`.
 */
export declare function absoluteUriParameters(res: RamlWrapper.Resource): RamlWrapper.Parameter[];
/**
 * __$helperMethod__ Protocols used by the API. Returns the `protocols` property value if it is specified.
 * Otherwise, returns protocol, specified in the base URI.
 **/
export declare function allProtocols(api: RamlWrapper.Api): string[];
/**
 * __$helperMethod__ Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
 * returns schemes defined with `securedBy` at API level.
 */
export declare function allSecuredBy(resourceOrMethod: RamlWrapper.Resource | RamlWrapper.Method): RamlWrapper.SecuritySchemeRef[];
/**
 * __$helperMethod__ Returns the name of security scheme, this reference refers to.
 */
export declare function securitySchemeName(schemeReference: RamlWrapper.SecuritySchemeRef): string;
/**
 * __$helperMethod__ Returns AST node of security scheme, this reference refers to, or null.
 */
export declare function securityScheme(schemeReference: RamlWrapper.SecuritySchemeRef): RamlWrapper.AbstractSecurityScheme;
export declare class HelperUriParam implements RamlWrapper.Parameter {
    private _name;
    private _parent;
    constructor(_name: string, _parent: core.BasicNode);
    wrapperClassName(): string;
    kind(): string;
    name(): string;
    "type"(): string;
    location(): RamlWrapper.ParameterLocation;
    "default"(): string;
    xml(): any;
    sendDefaultByClient(): boolean;
    example(): string;
    schema(): string;
    repeat(): boolean;
    enum(): string[];
    collectionFormat(): string;
    required(): boolean;
    readOnly(): boolean;
    facets(): any[];
    scope(): string[];
    displayName(): string;
    description(): RamlWrapper.MarkdownString;
    usage(): any;
    parent(): core.BasicNode;
    highLevel(): hl.IHighLevelNode;
    errors(): core.RamlParserError[];
    definition(): any;
    runtimeDefinition(): any;
    toJSON(): any;
    optional(): boolean;
    optionalProperties(): string[];
}
