import parameters = require("./parameters");

/**
 * Resource methods MAY have one or more responses.
 * Responses MAY be described using the description property,
 * and MAY include example attributes or schema properties.
 */
export interface Response08 {

    /**
     * Responses MUST be a map of one or more HTTP status codes,
     * where each status code itself is a map that describes that status code.
     */
    code: string

    /**
     * An API's methods may support custom header values in responses.
     * The custom, non-standard HTTP headers MUST be specified by the
     * headers property. API's may include the the placeholder token {?}
     * in a header name to indicate that any number of headers that
     * conform to the specified format can be sent in responses.
     * This is particularly useful for APIs that allow HTTP headers that
     * conform to some naming convention to send arbitrary, custom data.
     */
    headers?: parameters.Parameter08[]

    /**
     * Each response MAY contain a body property, which conforms to
     * the same structure as request body properties (see Body).
     * Responses that can return more than one response code MAY
     * therefore have multiple bodies defined. For APIs without
     * a priori knowledge of the response types for their responses,
     * `* /*` MAY be used to indicate that responses that do not
     * matching other defined data types MUST be accepted.
     * Processing applications MUST match the most descriptive
     * media type first if `* /*` is used.
     */
    body?: BodyLike08

    /**
     * The description attribute describes the intended use or meaning
     * of the $self. This value MAY be formatted using Markdown.
     */
    description?: string
}

/**
 * Some method verbs expect the resource to be sent as a request body.
 * For example, to create a resource, the request must include the
 * details of the resource to create. Resources CAN have alternate
 * representations. For example, an API might support both JSON and XML
 * representations. A method's body is defined in the body property as
 * a hashmap, in which the key MUST be a valid media type.
 */
export interface BodyLike08{

    /**
     * Mime type of the request or response body
     */
    name: string

    /**
     * The structure of a request or response body MAY be further specified
     * by the schema property under the appropriate media type. The schema
     * key CANNOT be specified if a body's media type is
     * application/x-www-form-urlencoded or multipart/form-data.
     * All parsers of RAML MUST be able to interpret JSON Schema and XML Schema.
     * Schema MAY be declared inline or in an external file.
     * However, if the schema is sufficiently large so as to make it difficult
     * for a person to read the API definition, or the schema is reused
     * across multiple APIs or across multiple miles in the same API,
     * the !include user-defined data type SHOULD be used instead of including
     * the content inline. Alternatively, the value of the schema field MAY be
     * the name of a schema specified in the root-level schemas property, or
     * it MAY be declared in an external file and included by using the by using
     * the RAML !include user-defined data type.
     */
    schema?: string

    /**
     * Documentation generators MUST use body properties' example attributes
     * to generate example invocations.
     */
    example?: string|number|boolean

    /**
     * Web forms REQUIRE special encoding and custom declaration.
     * If the API's media type is either application/x-www-form-urlencoded
     * or multipart/form-data, the formParameters property MUST specify
     * the name-value pairs that the API is expecting. The formParameters
     * property is a map in which the key is the name of the web form
     * parameter, and the value is itself a map the specifies the web
     * form parameter's attributes.
     */
    formParameters?: parameters.Parameter08[]

    /**
     * Returns schema content for the cases when schema is inlined,
     * when schema is included, and when
     */
    schemaContent?:string

    /**
     * Human readable description of the body
     */
    description?: string
}