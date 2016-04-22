
import hl=require("../../raml1/highLevelAST");
import core=require("../../raml1/wrapped-ast/parserCoreApi");

export interface Api extends core.BasicNode{

        /**
         * The title property is a short plain text description of the RESTful API. The value SHOULD be suitable for use as a title for the contained user documentation.
         **/
title(  ):string


        /**
         * If the RAML API definition is targeted to a specific API version, the API definition MUST contain a version property. The version property is OPTIONAL and should not be used if: The API itself is not versioned. The API definition does not change between versions. The API architect can decide whether a change to user documentation elements, but no change to the API's resources, constitutes a version change. The API architect MAY use any versioning scheme so long as version numbers retain the same format. For example, 'v3', 'v3.0', and 'V3' are all allowed, but are not considered to be equal.
         **/
version(  ):string


        /**
         * (Optional during development; Required after implementation) A RESTful API's resources are defined relative to the API's base URI. The use of the baseUri field is OPTIONAL to allow describing APIs that have not yet been implemented. After the API is implemented (even a mock implementation) and can be accessed at a service endpoint, the API definition MUST contain a baseUri property. The baseUri property's value MUST conform to the URI specification RFC2396 or a Level 1 Template URI as defined in RFC6570. The baseUri property SHOULD only be used as a reference value.
         **/
baseUri(  ):FullUriTemplateString


        /**
         * URI parameters can be further defined by using the uriParameters property. The use of uriParameters is OPTIONAL. The uriParameters property MUST be a map in which each key MUST be the name of the URI parameter as defined in the baseUri property. The uriParameters CANNOT contain a key named version because it is a reserved URI parameter name. The value of the uriParameters property is itself a map that specifies  the property's attributes as named parameters
         **/
uriParameters(  ):Parameter[]


        /**
         * A RESTful API can be reached HTTP, HTTPS, or both. The protocols property MAY be used to specify the protocols that an API supports. If the protocols property is not specified, the protocol specified at the baseUri property is used. The protocols property MUST be an array of strings, of values `HTTP` and/or `HTTPS`.
         **/
protocols(  ):string[]


        /**
         * (Optional) The media types returned by API responses, and expected from API requests that accept a body, MAY be defaulted by specifying the mediaType property. This property is specified at the root level of the API definition. The property's value MAY be a single string with a valid media type described in the specification.
         **/
mediaType(  ):MimeType


        /**
         * To better achieve consistency and simplicity, the API definition SHOULD include an OPTIONAL schemas property in the root section. The schemas property specifies collections of schemas that could be used anywhere in the API definition. The value of the schemas property is an array of maps; in each map, the keys are the schema name, and the values are schema definitions. The schema definitions MAY be included inline or by using the RAML !include user-defined data type.
         **/
schemas(  ):GlobalSchema[]


        /**
         * A list of the security schemes to apply to all methods, these must be defined in the securitySchemes declaration.
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * Security schemes that can be applied using securedBy
         **/
securitySchemes(  ):AbstractSecurityScheme[]


        /**
         * Resources are identified by their relative URI, which MUST begin with a slash (/). A resource defined as a root-level property is called a top-level resource. Its property's key is the resource's URI relative to the baseUri. A resource defined as a child property of another resource is called a nested resource, and its property's key is its URI relative to its parent resource's URI. Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property. The key of a resource, i.e. its relative URI, MAY consist of multiple URI path fragments separated by slashes; e.g. `/bom/items` may indicate the collection of items in a bill of materials as a single resource. However, if the individual URI path fragments are themselves resources, the API definition SHOULD use nested resources to describe this structure; e.g. if `/bom` is itself a resource then `/items` should be a nested resource of `/bom`, while `/bom/items` should not be used.
         **/
resources(  ):Resource[]


        /**
         * The API definition can include a variety of documents that serve as a user guides and reference documentation for the API. Such documents can clarify how the API works or provide business context. Documentation-generators MUST include all the sections in an API definition's documentation property in the documentation output, and they MUST preserve the order in which the documentation is declared. To add user documentation to the API, include the documentation property at the root of the API definition. The documentation property MUST be an array of documents. Each document MUST contain title and content attributes, both of which are REQUIRED. If the documentation property is specified, it MUST include at least one document. Documentation-generators MUST process the content field as if it was defined using Markdown.
         **/
documentation(  ):DocumentationItem[]


        /**
         * Returns AST node of security scheme, this reference refers to, or null.
         **/
RAMLVersion(  ):string


        /**
         * Equivalent API with traits and resource types expanded
         **/
expand(  ):Api

traits(  ):Trait[]


        /**
         * Retrieve all traits including those defined in libraries *
         * @deprecated
         **/
allTraits(  ):Trait[]

resourceTypes(  ):ResourceType[]


        /**
         * Retrieve all resource types including those defined in libraries
         * @deprecated
         **/
allResourceTypes(  ):ResourceType[]


        /**
         * Get child resource by its relative path
         **/
childResource( relPath:string ):Resource


        /**
         * Retrieve all resources of the Api
         **/
allResources(  ):Resource[]


        /**
         * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
         * Consider a fragment of RAML specification:
         * ```yaml
         * version: v1
         * baseUri: https://{organization}.example.com/{version}/{service}
         * baseUriParameters:
         * service:
         * ```
         * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
         * but they are among `Api.baseUriParameters()`.
         **/
baseUriParameters(  ):Parameter[]


        /**
         * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
         * Consider a fragment of RAML specification:
         * ```yaml
         * version: v1
         * baseUri: https://{organization}.example.com/{version}/{service}
         * baseUriParameters:
         * service:
         * ```
         * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
         * Thus, they are not among `Api.baseUriParameters()`, but they are among `Api.allBaseUriParameters()`.
         * @deprecated
         **/
allBaseUriParameters(  ):Parameter[]


        /**
         * Protocols used by the API. Returns the `protocols` property value if it is specified.
         * Otherwise, returns protocol, specified in the base URI.
         * @deprecated
         **/
allProtocols(  ):string[]
}

export interface ValueType extends core.AttributeNode{

        /**
         * @return JS representation of the node value
         **/
value(  ):any
}

export interface AnyType extends ValueType{}

export interface NumberType extends ValueType{

        /**
         * @return Number representation of the node value
         **/
value(  ):number
}

export interface BooleanType extends ValueType{

        /**
         * @return Boolean representation of the node value
         **/
value(  ):boolean
}

export interface Reference extends core.AttributeNode{

        /**
         * Returns a structured object if the reference point to one.
         **/
structuredValue(  ):TypeInstance


        /**
         * Returns name of referenced object
         **/
name(  ):string


        /**
         * @return StructuredValue object representing the node value
         **/
value(  ):hl.IStructuredValue
}

export interface TypeInstance{

        /**
         * Array of instance properties
         **/
properties(  ):TypeInstanceProperty[]


        /**
         * Whether the type is scalar
         **/
isScalar(  ):boolean


        /**
         * For instances of scalar types returns scalar value
         **/
value(  ):any
}

export interface TypeInstanceProperty{

        /**
         * Property name
         **/
name(  ):string


        /**
         * Property value
         **/
value(  ):TypeInstance


        /**
         * Array of values if property value is array
         **/
values(  ):TypeInstance[]


        /**
         * Whether property has array as value
         **/
isArray(  ):boolean
}

export interface ResourceTypeRef extends Reference{

        /**
         * Returns referenced resource type
         **/
resourceType(  ):ResourceType
}

export interface RAMLLanguageElement extends core.BasicNode{

        /**
         * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown.
         **/
description(  ):MarkdownString
}

export interface StringType extends ValueType{

        /**
         * @return String representation of the node value
         **/
value(  ):string
}


/**
 * Mardown string is a string which can contain markdown as an extension this markdown should support links with RAML Pointers since 1.0
 **/
export interface MarkdownString extends StringType{}

export interface Parameter extends RAMLLanguageElement{

        /**
         * name of the parameter
         **/
name(  ):string


        /**
         * An alternate, human-friendly name for the parameter
         **/
displayName(  ):string


        /**
         * The type attribute specifies the primitive type of the parameter's resolved value. API clients MUST return/throw an error if the parameter's resolved value does not match the specified type. If type is not specified, it defaults to string.
         **/
"type"(  ):string


        /**
         * Location of the parameter (can not be edited by user)
         **/
location(  ):ParameterLocation


        /**
         * Set to true if parameter is required
         **/
required(  ):boolean


        /**
         * The default attribute specifies the default value to use for the property if the property is omitted or its value is not specified. This SHOULD NOT be interpreted as a requirement for the client to send the default attribute's value if there is no other value to send. Instead, the default attribute's value is the value the server uses if the client does not send a value.
         **/
"default"(  ):any


        /**
         * (Optional) The example attribute shows an example value for the property. This can be used, e.g., by documentation generators to generate sample values for the property.
         **/
example(  ):string


        /**
         * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
         **/
repeat(  ):boolean
}

export interface ParameterLocation extends core.AbstractWrapperNode{}


/**
 * Value must be a string
 **/
export interface StringTypeDeclaration extends Parameter{

        /**
         * (Optional, applicable only for parameters of type string) The pattern attribute is a regular expression that a parameter of type string MUST match. Regular expressions MUST follow the regular expression specification from ECMA 262/Perl 5. The pattern MAY be enclosed in double quotes for readability and clarity.
         **/
pattern(  ):string


        /**
         * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
         **/
enum(  ):string[]


        /**
         * (Optional, applicable only for parameters of type string) The minLength attribute specifies the parameter value's minimum number of characters.
         **/
minLength(  ):number


        /**
         * (Optional, applicable only for parameters of type string) The maxLength attribute specifies the parameter value's maximum number of characters.
         **/
maxLength(  ):number
}


/**
 * Value must be a boolean
 **/
export interface BooleanTypeDeclaration extends Parameter{}


/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export interface NumberTypeDeclaration extends Parameter{

        /**
         * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
         **/
minimum(  ):number


        /**
         * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
         **/
maximum(  ):number
}


/**
 * Value MUST be a integer.
 **/
export interface IntegerTypeDeclaration extends NumberTypeDeclaration{}


/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3.
 **/
export interface DateTypeDeclaration extends Parameter{}


/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export interface FileTypeDeclaration extends Parameter{}

export interface Response extends RAMLLanguageElement{

        /**
         * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
         **/
code(  ):StatusCodeString


        /**
         * An API's methods may support custom header values in responses. The custom, non-standard HTTP headers MUST be specified by the headers property. API's may include the the placeholder token {?} in a header name to indicate that any number of headers that conform to the specified format can be sent in responses. This is particularly useful for APIs that allow HTTP headers that conform to some naming convention to send arbitrary, custom data.
         **/
headers(  ):Parameter[]


        /**
         * Each response MAY contain a body property, which conforms to the same structure as request body properties (see Body). Responses that can return more than one response code MAY therefore have multiple bodies defined. For APIs without a priori knowledge of the response types for their responses, `* /*` MAY be used to indicate that responses that do not matching other defined data types MUST be accepted. Processing applications MUST match the most descriptive media type first if `* /*` is used.
         **/
body(  ):BodyLike[]


        /**
         * true for codes < 400 and false otherwise
         **/
isOkRange(  ):boolean
}

export interface StatusCodeString extends StringType{}

export interface BodyLike extends core.BasicNode{

        /**
         * Mime type of the request or response body
         **/
name(  ):string


        /**
         * The structure of a request or response body MAY be further specified by the schema property under the appropriate media type. The schema key CANNOT be specified if a body's media type is application/x-www-form-urlencoded or multipart/form-data. All parsers of RAML MUST be able to interpret JSON Schema and XML Schema. Schema MAY be declared inline or in an external file. However, if the schema is sufficiently large so as to make it difficult for a person to read the API definition, or the schema is reused across multiple APIs or across multiple miles in the same API, the !include user-defined data type SHOULD be used instead of including the content inline. Alternatively, the value of the schema field MAY be the name of a schema specified in the root-level schemas property, or it MAY be declared in an external file and included by using the by using the RAML !include user-defined data type.
         **/
schema(  ):SchemaString


        /**
         * Documentation generators MUST use body properties' example attributes to generate example invocations.
         **/
example(  ):ExampleString


        /**
         * Web forms REQUIRE special encoding and custom declaration. If the API's media type is either application/x-www-form-urlencoded or multipart/form-data, the formParameters property MUST specify the name-value pairs that the API is expecting. The formParameters property is a map in which the key is the name of the web form parameter, and the value is itself a map the specifies the web form parameter's attributes.
         **/
formParameters(  ):Parameter[]


        /**
         * Human readable description of the body
         **/
description(  ):MarkdownString


        /**
         * Returns schema content for the cases when schema is inlined, when schema is included, and when schema is a reference.
         **/
schemaContent(  ):string
}


/**
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 **/
export interface SchemaString extends StringType{}


/**
 * JSON schema
 **/
export interface JSonSchemaString extends SchemaString{}


/**
 * XSD schema
 **/
export interface XMLSchemaString extends SchemaString{}

export interface ExampleString extends StringType{}

export interface JSONExample extends ExampleString{}

export interface XMLExample extends ExampleString{}


/**
 * Needed to set connection between xml related mime types and xsd schema
 **/
export interface XMLBody extends BodyLike{

        /**
         * XSD Schema
         **/
schema(  ):XMLSchemaString
}


/**
 * Needed to set connection between json related mime types and json schema
 **/
export interface JSONBody extends BodyLike{

        /**
         * JSON Schema
         **/
schema(  ):JSonSchemaString
}

export interface Resource extends RAMLLanguageElement{

        /**
         * Relative URL of this resource from the parent resource
         **/
relativeUri(  ):RelativeUriString


        /**
         * Instantiation of applyed resource type
         **/
"type"(  ):ResourceTypeRef


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * Methods that can be called on this resource
         **/
methods(  ):Method[]


        /**
         * Children resources
         **/
resources(  ):Resource[]


        /**
         * An alternate, human-friendly name for the resource
         **/
displayName(  ):string


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]


        /**
         * Path relative to API root
         **/
completeRelativeUri(  ):string


        /**
         * baseUri of owning Api concatenated with completeRelativeUri
         **/
absoluteUri(  ):string


        /**
         * Parent resource for non top level resources
         **/
parentResource(  ):Resource


        /**
         * Get child resource by its relative path
         **/
childResource( relPath:string ):Resource


        /**
         * Get child method by its name
         **/
childMethod( method:string ):Method[]


        /**
         * Api owning the resource as a sibling
         **/
ownerApi(  ):Api


        /**
         * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
         * Consider a fragment of RAML specification:
         * ```yaml
         * /resource/{objectId}/{propertyId}:
         * uriParameters:
         * objectId:
         * ```
         * Here `propertyId` uri parameter is not described in the `uriParameters` node,
         * but it is among Resource.uriParameters().
         **/
uriParameters(  ):Parameter[]


        /**
         * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
         * Consider a fragment of RAML specification:
         * ```yaml
         * /resource/{objectId}/{propertyId}:
         * uriParameters:
         * objectId:
         * ```
         * Here `propertyId` uri parameter is not described in the `uriParameters` node,
         * Thus, it is not among Resource.uriParameters(), but it is among Resource.allUriParameters().
         * @deprecated
         **/
allUriParameters(  ):Parameter[]


        /**
         * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.allBaseUriParameters()`
         * for `Api` owning the `Resource` and `Resource.allUriParameters()`.
         **/
absoluteUriParameters(  ):Parameter[]


        /**
         * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
         * returns schemes defined with `securedBy` at API level.
         * @deprecated
         **/
allSecuredBy(  ):SecuritySchemeRef[]
}


/**
 * This type currently serves both for absolute and relative urls
 **/
export interface UriTemplate extends StringType{}


/**
 * This  type describes relative uri templates
 **/
export interface RelativeUriString extends UriTemplate{}

export interface TraitRef extends Reference{

        /**
         * Returns referenced trait
         **/
trait(  ):Trait
}


/**
 * Method object allows description of http methods
 **/
export interface MethodBase extends RAMLLanguageElement{

        /**
         * Resource methods MAY have one or more responses. Responses MAY be described using the description property, and MAY include example attributes or schema properties.
         **/
responses(  ):Response[]


        /**
         * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create. Resources CAN have alternate representations. For example, an API might support both JSON and XML representations. A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
         **/
body(  ):BodyLike[]


        /**
         * A method can override an API's protocols value for that single method by setting a different value for the fields.
         **/
protocols(  ):string[]


        /**
         * A list of the security schemas to apply, these must be defined in the securitySchemes declaration. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme. Security schemas may also be applied to a resource with securedBy, which is equivalent to applying the security schemas to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):Parameter[]


        /**
         * Headers that allowed at this position
         **/
headers(  ):Parameter[]

displayName(  ):string
}

export interface SecuritySchemeRef extends Reference{

        /**
         * Returns the name of security scheme, this reference refers to.
         **/
securitySchemeName(  ):string


        /**
         * Returns AST node of security scheme, this reference refers to, or null.
         **/
securityScheme(  ):AbstractSecurityScheme
}


/**
 * Declares globally referable security schema definition
 **/
export interface AbstractSecurityScheme extends RAMLLanguageElement{

        /**
         * Name of the security scheme
         **/
name(  ):string


        /**
         * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
         **/
"type"(  ):string


        /**
         * The description attribute MAY be used to describe a security schemes property.
         **/
description(  ):MarkdownString


        /**
         * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes. Including the security scheme description completes an API documentation.
         **/
describedBy(  ):SecuritySchemePart


        /**
         * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared. It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
         **/
settings(  ):SecuritySchemeSettings
}

export interface SecuritySchemePart extends MethodBase{

        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * Headers that allowed at this position
         **/
headers(  ):Parameter[]


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):Parameter[]


        /**
         * Optional array of responses, describing the possible responses that could be sent.
         **/
responses(  ):Response[]


        /**
         * An alternate, human-friendly name for the security scheme part
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the security scheme part
         **/
description(  ):MarkdownString
}

export interface SecuritySchemeSettings extends core.BasicNode{}

export interface OAuth1SecuritySchemeSettings extends SecuritySchemeSettings{

        /**
         * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
         **/
requestTokenUri(  ):FixedUri


        /**
         * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
         **/
authorizationUri(  ):FixedUri


        /**
         * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
         **/
tokenCredentialsUri(  ):FixedUri
}


/**
 * This  type describes fixed uris
 **/
export interface FixedUri extends StringType{}

export interface OAuth2SecuritySchemeSettings extends SecuritySchemeSettings{

        /**
         * The URI of the Token Endpoint as defined in RFC6749 Section 3.2. Not required forby implicit grant type.
         **/
accessTokenUri(  ):FixedUri


        /**
         * The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1. Required forby authorization_code and implicit grant types.
         **/
authorizationUri(  ):FixedUri


        /**
         * A list of the Authorization grants supported by the API as defined in RFC6749 Sections 4.1, 4.2, 4.3 and 4.4, can be any of: authorization_code, password, client_credentials, implicit, or refresh_token.
         **/
authorizationGrants(  ):string[]


        /**
         * A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3
         **/
scopes(  ):string[]
}


/**
 * Declares globally referable security schema definition
 **/
export interface OAuth2SecurityScheme extends AbstractSecurityScheme{
settings(  ):OAuth2SecuritySchemeSettings
}


/**
 * Declares globally referable security schema definition
 **/
export interface OAuth1SecurityScheme extends AbstractSecurityScheme{
settings(  ):OAuth1SecuritySchemeSettings
}


/**
 * Declares globally referable security schema definition
 **/
export interface BasicSecurityScheme extends AbstractSecurityScheme{}


/**
 * Declares globally referable security schema definition
 **/
export interface DigestSecurityScheme extends AbstractSecurityScheme{}


/**
 * Declares globally referable security schema definition
 **/
export interface CustomSecurityScheme extends AbstractSecurityScheme{}

export interface Method extends MethodBase{

        /**
         * Method that can be called
         **/
method(  ):string


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * An alternate, human-friendly name for the method
         **/
displayName(  ):string


        /**
         * For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
         **/
parentResource(  ):Resource


        /**
         * Api owning the resource as a sibling
         **/
ownerApi(  ):Api


        /**
         * For methods of Resources: `{parent Resource relative path} {methodName}`.
         * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
         * For other methods throws Exception.
         **/
methodId(  ):string


        /**
         * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
         * returns schemes defined with `securedBy` at API level.
         * @deprecated
         **/
allSecuredBy(  ):SecuritySchemeRef[]
}

export interface Trait extends MethodBase{

        /**
         * Name of the trait
         **/
name(  ):string


        /**
         * Instructions on how and when the trait should be used.
         **/
usage(  ):string


        /**
         * An alternate, human-friendly name for the trait
         **/
displayName(  ):string


        /**
         * Returns object representation of parametrized properties of the trait
         **/
parametrizedProperties(  ):TypeInstance
}

export interface ResourceType extends RAMLLanguageElement{

        /**
         * Name of the resource type
         **/
name(  ):string


        /**
         * Instructions on how and when the resource type should be used.
         **/
usage(  ):string


        /**
         * Methods that are part of this resource type definition
         **/
methods(  ):Method[]


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * Instantiation of applyed resource type
         **/
"type"(  ):ResourceTypeRef


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * Uri parameters of this resource
         **/
uriParameters(  ):Parameter[]


        /**
         * An alternate, human-friendly name for the resource type
         **/
displayName(  ):string


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]


        /**
         * Returns object representation of parametrized properties of the resource type
         **/
parametrizedProperties(  ):TypeInstance
}


/**
 * This sub type of the string represents mime types
 **/
export interface MimeType extends StringType{}


/**
 * This  type describes absolute uri templates
 **/
export interface FullUriTemplateString extends UriTemplate{}

export interface RAMLSimpleElement extends core.BasicNode{}

export interface DocumentationItem extends RAMLSimpleElement{

        /**
         * title of documentation section
         **/
title(  ):string


        /**
         * Content of documentation section
         **/
content(  ):MarkdownString
}


/**
 * Content of the schema
 **/
export interface GlobalSchema extends RAMLSimpleElement{

        /**
         * Name of the global schema, used to refer on schema content
         **/
key(  ):string


        /**
         * Content of the schema
         **/
value(  ):SchemaString
}

