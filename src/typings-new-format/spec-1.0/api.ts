import common = require("./common");
import datamodel = require("./datamodel");
import methods = require("./methods");
import resources = require("./resources");
import security = require("./security");

/**
 * RAML 1.0 API definition
 */
//TODO NOT READY
export interface Api10 extends LibraryBase10 {

    /**
     * Additional overall documentation for the API
     */
    documentation?: DocumentationItem[]

    /**
     * Short plain-text label for the API
     */
    title: string

    /**
     * A substantial, human-friendly description of the API.
     * Its value is a string and MAY be formatted using markdown.
     */
    description?: string

    /**
     * The version of the API, e.g. 'v1'
     */
    version?: string

    /**
     * A URI that's to be used as the base of all the resources' URIs.
     * Often used as the base of the URL of each resource, containing
     * the location of the API. Can be a template URI.
     */
    baseUri?: string

    /**
     * Named parameters used in the baseUri (template)
     */
    baseUriParameters?: { [key: string]: datamodel.TypeReference10 }

    /**
     * The resources of the API, identified as relative URIs that
     * begin with a slash (/). Every property whose key begins with a slash (/),
     * and is either at the root of the API definition or is the child property
     * of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
     */
    resources?: resources.Resource10[]

    /**
     * The protocols supported by the API
     */
    protocols?: string[]

    /**
     * The default media type to use for request and response bodies (payloads),
     * e.g. \"application/json\"
     */
    mediaType?: string | string[]

    /**
     * The security schemes that apply to every resource and method in the API
     */
    securedBy?: security.SecuritySchemeRef10[]
}

/**
 * RAML libraries are used to combine any collection of data type declarations,
 * resource type declarations, trait declarations, and security scheme
 * declarations into modular, externalized, reusable groups."
 */
export interface Library extends LibraryBase10 {

    /**
     * Namespace which the library is imported under
     */
    name?: string

    /**
     * Contains description of why the library exists
     */
    usage?: string
}

/**
 * Extension is RAML documents that add or override nodes of a RAML API definition.
 */
export interface Extension extends Api10 {

    /**
     * Location of a valid RAML API definition (or overlay or extension), the extension is applied to
     */
    extends: string

    /**
     * Contains description of why the extension exist
     */
    usage?: string
}

/**
 * Overlays is RAML document that add or override nodes of a RAML API definition.
 */
export interface Overlay extends Api10 {

    /**
     * Location of a valid RAML API definition (or overlay or extension), the overlay is applied to.
     */
    extends: string

    /**
     * Contains description of why the overlay exists
     */
    usage?: string
}

export interface LibraryBase10 {

    /**
     * Declarations of (data) types for use within this API
     */
    types?: { [key: string]: datamodel.TypeDeclaration }

    /**
     * Declarations of resource types for use within this API
     */
    resourceTypes?: { [key: string]: resources.ResourceType10 }

    /**
     * Declarations of traits for use within this API
     */
    traits?: { [key: string]: methods.Trait10 }
    /**
     * Declarations of security schemes for use within this API.
     */
    securitySchemes?: { [key: string]: security.SecuritySchemeBase10 }

    /**
     * Declarations of annotation types for use by annotations
     */
    annotationTypes?: { [key: string]: datamodel.TypeDeclaration }

}

/**
 * API documentation
 */
export interface DocumentationItem {

    /**
     * Title of documentation section
     */
    title: string

    /**
     * Content of documentation section
     */
    content: string
}
