import common = require("./common");
import datamodel = require("./datamodel");
import security = require("./security");
import methods = require("./methods");

/**
 * Web resource
 */
export interface Resource10 extends ResourceBase10 {

    /**
     * Resource name
     */
    displayName?: string

    /**
     * A nested resource is identified as any property whose name begins
     * with a slash (\"/\") and is therefore treated as a relative URI.
     */
    resources?: Resource10[]

    /**
     * Relative URL of this resource from the parent resource
     */
    relativeUri: string

    /**
     * URI Segments
     */
    relativeUriPathSegments: string[]

    /**
     * Absolute URI of the resource
     */
    absoluteUri: string

    /**
     * URI relative to base URI of the Api
     */
    completeRelativeUri: string

    /**
     * For nested resources, URI of the parent resource relative to base URI of the Api.
     * For top level resources it is empty string
     */
    parentUri?: string

    /**
     * For nested resources, absolute URI of the parent resource.
     * For top level resources it is base URI of the Api or empty string if base Uri is undefined.
     */
    absoluteParentUri?: string

}

export interface ResourceTypeFragment extends ResourceType10, common.FragmentDeclaration{}

/**
 * Resource pattern which can be defined and then applied to multiple resources
 */
export interface ResourceType10 extends ResourceBase10 {

    /**
     * Resource name
     */
    name: string

    /**
     * Instructions on how and when the resource type should be used.
     */
    usage?: string

    /**
     * Resource name
     */
    displayName?: string
}

export interface ResourceBase10 extends common.Annotable {

    /**
     * Resource description
     */
    description?: string

    /**
     * A list of the traits to apply to all methods declared
     * (implicitly or explicitly) for this resource.
     * Individual methods may override this declaration
     */
    is?: methods.TemplateReference[]

    type?: methods.TemplateReference

    /**
     * The security schemes that apply to all methods declared
     * (implicitly or explicitly) for this resource.
     */
    securedBy?: security.SecuritySchemeBase10[]

    /**
     * Methods that are part of this resource type definition
     */
    methods?: methods.Method10[]

    /**
     * Detailed information about any URI parameters of this resource
     */
    uriParameters?: datamodel.TypeReference10[]

}