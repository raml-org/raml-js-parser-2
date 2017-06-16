import bodies = require("./bodies");
import common = require("./common");
import methods = require("./methods");
import resources = require("./resources");
import parameters = require("./parameters");
import security = require("./security");

/**
 * RAML 0.8 API definition.
 */
export interface Api08 extends common.HasMeta {

    /**
     * The title property is a short plain text description of the RESTful API. The value SHOULD be suitable for use as a title for the contained user documentation.
     */
    title: string

    /**
     * If the RAML API definition is targeted to a specific API version, the API definition MUST contain a version property. The version property is OPTIONAL and should not be used if: The API itself is not versioned. The API definition does not change between versions. The API architect can decide whether a change to user documentation elements, but no change to the API's resources, constitutes a version change. The API architect MAY use any versioning scheme so long as version numbers retain the same format. For example, 'v3', 'v3.0', and 'V3' are all allowed, but are not considered to be equal.
     */
    version: string

    /**
     * (Optional during development; Required after implementation) A RESTful API's resources are defined relative to the API's base URI. The use of the baseUri field is OPTIONAL to allow describing APIs that have not yet been implemented. After the API is implemented (even a mock implementation) and can be accessed at a service endpoint, the API definition MUST contain a baseUri property. The baseUri property's value MUST conform to the URI specification RFC2396 or a Level 1 Template URI as defined in RFC6570. The baseUri property SHOULD only be used as a reference value.
     */
    baseUri: string

    /**
     * Base uri parameters are named parameters which described template parameters in the base uri
     */
    baseUriParameters: parameters.Parameter08[]

    /**
     * URI parameters can be further defined by using the uriParameters property. The use of uriParameters is OPTIONAL. The uriParameters property MUST be a map in which each key MUST be the name of the URI parameter as defined in the baseUri property. The uriParameters CANNOT contain a key named version because it is a reserved URI parameter name. The value of the uriParameters property is itself a map that specifies  the property's attributes as named parameters
     */
    uiParameters: parameters.Parameter08[]

    /**
     * A RESTful API can be reached HTTP, HTTPS, or both. The protocols property MAY be used to specify the protocols that an API supports. If the protocols property is not specified, the protocol specified at the baseUri property is used. The protocols property MUST be an array of strings, of values `HTTP` and/or `HTTPS`.
     */
    protocols: string[]

    /**
     * (Optional) The media types returned by API responses, and expected from API requests that accept a body, MAY be defaulted by specifying the mediaType property. This property is specified at the root level of the API definition. The property's value MAY be a single string with a valid media type described in the specification.
     */
    mediaType: string

    /**
     * To better achieve consistency and simplicity, the API definition SHOULD include an OPTIONAL schemas property in the root section. The schemas property specifies collections of schemas that could be used anywhere in the API definition. The value of the schemas property is an array of maps; in each map, the keys are the schema name, and the values are schema definitions. The schema definitions MAY be included inline or by using the RAML !include user-defined data type.
     */
    schemas: GlobalSchema[]

    /**
     * Declarations of traits used in this API
     */
    traits: methods.Trait[]

    /**
     * A list of the security schemes to apply to all methods, these must be defined in the securitySchemes declaration.
     */
    securedBy: methods.Reference08[]

    securitySchemes: security.AbstractSecurityScheme08[]

    /**
     * Declaration of resource types used in this API
     */
    resourceTypes: resources.ResourceType08[]

    /**
     * Resources are identified by their relative URI, which MUST begin with a slash (/). A resource defined as a root-level property is called a top-level resource. Its property's key is the resource's URI relative to the baseUri. A resource defined as a child property of another resource is called a nested resource, and its property's key is its URI relative to its parent resource's URI. Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property. The key of a resource, i.e. its relative URI, MAY consist of multiple URI path fragments separated by slashes; e.g. `/bom/items` may indicate the collection of items in a bill of materials as a single resource. However, if the individual URI path fragments are themselves resources, the API definition SHOULD use nested resources to describe this structure; e.g. if `/bom` is itself a resource then `/items` should be a nested resource of `/bom`, while `/bom/items` should not be used.
     */
    resources: resources.ResourceType08[]

    /**
     * The API definition can include a variety of documents that serve as a user guides and reference documentation for the API. Such documents can clarify how the API works or provide business context. Documentation-generators MUST include all the sections in an API definition's documentation property in the documentation output, and they MUST preserve the order in which the documentation is declared. To add user documentation to the API, include the documentation property at the root of the API definition. The documentation property MUST be an array of documents. Each document MUST contain title and content attributes, both of which are REQUIRED. If the documentation property is specified, it MUST include at least one document. Documentation-generators MUST process the content field as if it was defined using Markdown.
     */
    documentation: DocumentationItem08[]
}

/**
 * Content of the schema
 */
export type GlobalSchema = {[key:string]:string};

export interface DocumentationItem08 {

    /**
     * title of documentation section
     */
    title: string

    /**
     * Content of documentation section
     */
    content: string
}

/**
 * RAML error
 */
export interface Error {

    /**
     * IssueCode
     */
    code: string

    /**
     * Message text
     */
    message: string

    /**
     * File path
     */
    path: string

    /**
     * Whether the message is warning or not
     */
    isWarning?: boolean

    trace?: Error[]

    range: ErrorRange
}

/**
 * Range object describing start and end of error location
 */
export interface ErrorRange {

    start: ErrorPosition,
    end: ErrorPosition
}

export interface ErrorPosition {

    /**
     * Line number, starting at 0
     */
    line: number

    /**
     * Column number, starting at 0
     */
    column: number

    /**
     * Position in characters from the beginning of the document, starting at 0
     */
    position: number

}

export interface RAML08ParseResult {

    ramlVersion: "RAML08"

    type: string

    errors?: Error[]

    specification: Api08
}