import bodies = require("./bodies");
import common = require("./common");
import methods = require("./methods");
import parameters = require("./parameters");
import security = require("./security");

export interface Resource08 extends common.HasMeta{

    /**
     * Relative URL of this resource from the parent resource
     */
    relativeUri:string

    /**
     * Instantiation of applyed resource type
     */
    relativeUriPathSegments: string[]

    type?: methods.TemplateReference

    /**
     * Instantiation of applyed traits
     */
    is?: methods.TemplateReference[]

    /**
     * securityScheme may also be applied to a resource by using the
     * securedBy key, which is equivalent to applying the securityScheme
     * to all methods that may be declared, explicitly or implicitly,
     * by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any
     * securityScheme, the method may be annotated with the null securityScheme.
     */
    securedBy?: security.AbstractSecurityScheme08[]

    /**
     * Uri parameters of this resource
     */
    uriParameters?: parameters.Parameter08[]

    /**
     * Methods that can be called on this resource
     */
    methods?: methods.Method08[]

    /**
     * Children resources
     */
    resources?: Resource08[]

    /**
     * An alternate, human-friendly name for the resource
     */
    displayName?: string

    /**
     * A resource or a method can override a base URI template's values.
     * This is useful to restrict or change the default or parameter
     * selection in the base URI. The baseUriParameters property MAY
     * be used to override any or all parameters defined at the root level
     * baseUriParameters property, as well as base URI parameters
     * not specified at the root level.
     */
    baseUriParameters?: parameters.Parameter08[]

    /**
     * The description attribute describes the intended use or meaning of the $self.
     * This value MAY be formatted using Markdown.
     */
    description?: string

    absoluteUri: string

    completeRelativeUri: string

    parentUri?: string

    absoluteParentUri?: string
}

/**
 * Resource pattern which can be defined and then applied to multiple resources
 */
export interface ResourceType08 extends common.HasMeta{

    /**
     * Name of the resource type
     */
    name: string

    /**
     * Instructions on how and when the resource type should be used.
     */
    usage?: string

    /**
     * Instantiation of applyed traits
     */
    is?: methods.TemplateReference[]

    type?: methods.TemplateReference

    /**
     * securityScheme may also be applied to a resource by using the
     * securedBy key, which is equivalent to applying the securityScheme
     * to all methods that may be declared, explicitly or implicitly,
     * by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any
     * securityScheme, the method may be annotated with the null securityScheme.
     */
    securedBy?: security.AbstractSecurityScheme08[]

    /**
     * Uri parameters of this resource
     */
    uriParameters?: parameters.Parameter08[]

    /**
     * An alternate, human-friendly name for the resource type
     */
    displayName?: string

    /**
     * A resource or a method can override a base URI template's values.
     * This is useful to restrict or change the default or parameter selection
     * in the base URI. The baseUriParameters property MAY be used to override
     * any or all parameters defined at the root level baseUriParameters
     * property, as well as base URI parameters not specified at the root level.
     */
    baseUriParameters?: parameters.Parameter08[]

    /**
     * The description attribute describes the intended use or meaning of the $self.
     * This value MAY be formatted using Markdown.
     */
    description?: string

    /**
     * Methods that can be called on this resource
     */
    methods?: methods.Method08[]
}