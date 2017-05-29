import bodies = require("./bodies");
import common = require("./common");
import parameters = require("./parameters");

/**
 * A partial method definition that, like a method, can provide method-level
 * properties such as description, headers, query string parameters, and responses.
 * Methods that use one or more traits inherit those traits' properties.
 */
export interface Trait extends MethodBase08{

    /**
     * Name of the trait
     */
    name: string

    /**
     * Instructions on how and when the trait should be used.
     */
    usage: string

    /**
     * An alternate, human-friendly name for the trait
     */
    displayName: string

    /**
     * Whether the type is scalar
     */
    isScalar: boolean
}

export type Reference08 = string|{[key:string]:any};

/**
 * Method object allows description of http methods
 */
export interface MethodBase08 extends common.HasMeta{

    /**
     * Resource methods MAY have one or more responses.
     * Responses MAY be described using the description property,
     * and MAY include example attributes or schema properties.
     */
        responses: {[key:string]:bodies.Response08}

    /**
     * Some method verbs expect the resource to be sent as a request body.
     * For example, to create a resource, the request must include the
     * details of the resource to create. Resources CAN have alternate
     * representations. For example, an API might support both JSON and XML
     * representations. A method's body is defined in the body property as
     * a hashmap, in which the key MUST be a valid media type.
     */
    body: {[key:string]: bodies.BodyLike08}

    /**
     * A method can override an API's protocols value for that single
     * method by setting a different value for the fields.
     */
    protocols: string[]

    /**
     * A list of the security schemas to apply, these must be defined
     * in the securitySchemes declaration. To indicate that the method
     * may be called without applying any securityScheme, the method
     * may be annotated with the null securityScheme. Security schemas
     * may also be applied to a resource with securedBy, which is
     * equivalent to applying the security schemas to all methods that
     * may be declared, explicitly or implicitly, by defining the
     * resourceTypes or traits property for that resource.
     */
    securedBy: string[]

    /**
     * A resource or a method can override a base URI template's values.
     * This is useful to restrict or change the default or parameter selection
     * in the base URI. The baseUriParameters property MAY be used to override
     * any or all parameters defined at the root level baseUriParameters
     * property, as well as base URI parameters not specified at the root level.
     */
    baseUriParameters: {[key:string]:parameters.Parameter08|parameters.Parameter08[]}

    /**
     * An APIs resources MAY be filtered (to return a subset of results)
     * or altered (such as transforming a response body from JSON to XML format)
     * by the use of query strings. If the resource or its method supports a
     * query string, the query string MUST be defined by the queryParameters property
     */
    queryParameters: {[key:string]:parameters.Parameter08|parameters.Parameter08[]}

    /**
     * Headers that allowed at this position
     */
    headers: {[key:string]:parameters.Parameter08|parameters.Parameter08[]}

    description: string
}

export interface Method08 extends MethodBase08{

    /**
     * Method that can be called
     */
    method: string

    /**
     * Instantiation of applyed traits
     */
    is: Reference08[]

    allUriParameters: parameters.Parameter08[]
}