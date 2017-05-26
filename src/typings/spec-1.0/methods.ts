import common = require("./common");
import datamodel = require("./datamodel");
import security = require("./security");

export type TraitRef10 = string | { [key: string]: any };

export interface Trait10 extends MethodBase10 {

    /**
     * Name of the trait
     */
    name: string

    /**
     * The displayName attribute specifies the trait display name.
     * It is a friendly name used only for  display or documentation purposes.
     * If displayName is not specified, it defaults to the element's key
     * (the name of the property itself).
     */
    displayName?: string

    /**
     * Instructions on how and when the trait should be used.
     */
    usage?: string
}

export interface TraitFragment extends Trait10, common.FragmentDeclaration{}

export interface Operation10 extends common.Annotable {

    /**
     * Headers that allowed at this position
     */
    headers?: { [key: string]: datamodel.TypeReference10 }

    /**
     * An APIs resources MAY be filtered (to return a subset of results)
     * or altered (such as transforming  a response body from JSON to XML format)
     * by the use of query strings. If the resource or its method supports
     * a query string, the query string MUST be defined by the queryParameters property
     */
    queryParameters?: { [key: string]: datamodel.TypeReference10 }

    queryString?: datamodel.ObjectTypeDeclaration
}
/**
 * RESTful API methods are operations that are performed on a resource
 */
export interface Method10 extends MethodBase10 {

    /**
     * Method that can be called
     */
    //TODO fix description
    method: string
}

export interface MethodBase10 extends Operation10 {

    displayName?: string,

    /**
     * A method can override the protocols specified in the resource
     * or at the API root, by employing this property.
     */
    protocols?: string[],

    /**
     * securityScheme may also be applied to a resource by using the
     * securedBy key, which is equivalent to applying the securityScheme
     * to all methods that may be declared, explicitly or implicitly,
     * by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme,
     * the method may be annotated with the null securityScheme.
     */
    securedBy?: security.SecuritySchemeRef10[]

    /**
     * Instantiation of applyed traits
     */
    is?: TraitRef10[]

    /**
     * Some method verbs expect the resource to be sent as a request body.
     * For example, to create a resource, the request must include the details
     * of the resource to create. Resources CAN have alternate representations.
     * For example, an API might support both JSON and XML representations.
     * A method's body is defined in the body property as a hashmap, in which
     * the key MUST be a valid media type.
     */
    body?: { [key: string]: datamodel.TypeReference10 }

    description?: string

    /**
     * Information about the expected responses to a request
     */
    responses?: { [key: string]: Response10 }
}

/**
 * Information about the expected responses to a request
 */
export interface Response10 extends common.Annotable {

    /**
     * Responses MUST be a map of one or more HTTP status codes,
     * where each status code itself is a map that describes that status code.
     */
    code: string

    /**
     * A longer, human-friendly description of the response
     */
    description?: string

    /**
     * Detailed information about any response headers returned by this method
     */
    headers?: datamodel.TypeReference10[]

    /**
     * The body of the response: a body declaration
     */
    body?: { [key: string]: datamodel.TypeReference10 }
}