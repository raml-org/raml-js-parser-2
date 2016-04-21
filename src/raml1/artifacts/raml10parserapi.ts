/**
 * <p>See <a href="http://raml.org">http://raml.org</a> for more information about RAML.</p>
 *
 * <p>This parser is at a beta state of development, as part of the API Workbench development cycle (<a href="http://apiworkbench.com">http://apiworkbench.com</a>).</p>
 *
 * <p><a href="https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md">Getting Started Guide</a> describes the first steps with the parser.</p>
 *
 * <h2>Installation</h2>
 *
 * <pre><code>git clone https://github.com/raml-org/raml-js-parser-2
 *
 * cd raml-js-parser-2
 *
 * npm install
 *
 * node test/test.js  //here you should observe JSON representation of XKCD API in your console
 *
 * node test/testAsync.js  //same as above but in asynchronous mode
 * </code></pre>
 *
 * <h2>Usage</h2>
 *
 * <ul>
 * <li>For parser usage example refer to <code>test/test.js</code></li>
 * <li>For asynchrounous usage example refer to <code>test/testAsync.js</code></li>
 * </ul>
 **/

 
import hl=require("../../raml1/highLevelAST");
import core=require("../../raml1/wrapped-ast/parserCoreApi");

export interface RAMLLanguageElement extends core.BasicNode{

        /**
         * The displayName attribute specifies the $self's display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
         **/
displayName(  ):string


        /**
         * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown [MARKDOWN]
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]
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


/**
 * Annotations allow you to attach information to your API
 **/
export interface AnnotationRef extends Reference{

        /**
         * Returns referenced annotation
         **/
annotation(  ):AnnotationTypeDeclaration
}

export interface TypeDeclaration extends RAMLLanguageElement{

        /**
         * name of the parameter
         **/
name(  ):string


        /**
         * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
         **/
facets(  ):TypeDeclaration[]


        /**
         * Alias for the equivalent "type" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "type" property, as the "schema" alias for that property name may be removed in a future RAML version. The "type" property allows for XML and JSON schemas.
         **/
schema(  ):string[]


        /**
         * A base type which the current type extends, or more generally a type expression.
         **/
"type"(  ):string[]


        /**
         * Location of the parameter (can not be edited by user)
         **/
location(  ):ModelLocation


        /**
         * Kind of location
         **/
locationKind(  ):LocationKind


        /**
         * Provides default value for a property
         **/
"default"(  ):any


        /**
         * An object containing named examples of instances of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
         **/
examples(  ):ExampleSpec[]


        /**
         * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
         **/
repeat(  ):boolean


        /**
         * Sets if property is optional or not
         **/
required(  ):boolean


        /**
         * An alternate, human-friendly name for the type
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the type
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


        /**
         * Returns facets fixed by the type. Value is an object with properties named after facets fixed. Value of each property is a value of the corresponding facet.
         **/
fixedFacets(  ):TypeInstance


        /**
         * Returns object representation of example, if possible
         **/
structuredExample(  ):TypeInstance


        /**
         * Runtime representation of type represented by this AST node
         **/
runtimeType(  ):hl.ITypeDefinition


        /**
         * validate an instance against type
         **/
validateInstance( value:any ):string[]

example(  ):string
}

export interface ModelLocation extends core.AbstractWrapperNode{}

export interface LocationKind extends core.AbstractWrapperNode{}

export interface ExampleSpec extends RAMLLanguageElement{

        /**
         * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
         **/
strict(  ):boolean


        /**
         * Example identifier, if specified
         **/
name(  ):string


        /**
         * An alternate, human-friendly name for the example
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the example
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


        /**
         * Returns object representation of example, if possible
         **/
structuredContent(  ):TypeInstance

content(  ):string
}

export interface ArrayTypeDeclaration extends TypeDeclaration{

        /**
         * Should items in array be unique
         **/
uniqueItems(  ):boolean


        /**
         * Array component type.
         **/
items(  ):TypeDeclaration


        /**
         * Minimum amount of items in array
         **/
minItems(  ):number


        /**
         * Maximum amount of items in array
         **/
maxItems(  ):number
}

export interface AnnotationTypeDeclaration extends TypeDeclaration{

        /**
         * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
         **/
allowedTargets(  ):AnnotationTarget[]


        /**
         * Instructions on how and when to use this annotation in a RAML spec.
         **/
usage(  ):string
}

export interface ArrayAnnotationTypeDeclaration extends ArrayTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * Elements to which this Annotation can be applied (enum)
 **/
export interface AnnotationTarget extends ValueType{}

export interface UnionTypeDeclaration extends TypeDeclaration{

        /**
         * Type property name to be used as a discriminator or boolean
         **/
discriminator(  ):string
}

export interface UnionAnnotationTypeDeclaration extends UnionTypeDeclaration,AnnotationTypeDeclaration{}

export interface ObjectTypeDeclaration extends TypeDeclaration{

        /**
         * The properties that instances of this type may or must have.
         **/
properties(  ):TypeDeclaration[]


        /**
         * The minimum number of properties allowed for instances of this type.
         **/
minProperties(  ):number


        /**
         * The maximum number of properties allowed for instances of this type.
         **/
maxProperties(  ):number


        /**
         * JSON schema style syntax for declaring maps
         **/
additionalProperties(  ):TypeDeclaration


        /**
         * JSON schema style syntax for declaring key restricted maps
         **/
patternProperties(  ):TypeDeclaration[]


        /**
         * Type property name to be used as discriminator, or boolean
         **/
discriminator(  ):string


        /**
         * The value of discriminator for the type.
         **/
discriminatorValue(  ):string
}

export interface ObjectAnnotationTypeDeclaration extends ObjectTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * Value must be a string
 **/
export interface StringTypeDeclaration extends TypeDeclaration{

        /**
         * Regular expression that this string should path
         **/
pattern(  ):string


        /**
         * Minimum length of the string
         **/
minLength(  ):number


        /**
         * Maximum length of the string
         **/
maxLength(  ):number


        /**
         * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
         **/
enum(  ):string[]
}

export interface StringAnnotationTypeDeclaration extends StringTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * Value must be a boolean
 **/
export interface BooleanTypeDeclaration extends TypeDeclaration{}

export interface BooleanAnnotationTypeDeclaration extends BooleanTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export interface NumberTypeDeclaration extends TypeDeclaration{

        /**
         * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
         **/
minimum(  ):number


        /**
         * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
         **/
maximum(  ):number


        /**
         * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
         **/
enum(  ):string[]


        /**
         * Value format
         **/
format(  ):string


        /**
         * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
         **/
multipleOf(  ):number
}


/**
 * Value MUST be a integer.
 **/
export interface IntegerTypeDeclaration extends NumberTypeDeclaration{

        /**
         * Value format
         **/
format(  ):string
}

export interface NumberAnnotationTypeDeclaration extends NumberTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3, or according to specified date format
 **/
export interface DateTypeDeclaration extends TypeDeclaration{
format(  ):string
}

export interface DateTypeAnnotationDeclaration extends DateTypeDeclaration,AnnotationTypeDeclaration{}


/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export interface FileTypeDeclaration extends TypeDeclaration{

        /**
         * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
         **/
fileTypes(  ):ContentType[]


        /**
         * The minLength attribute specifies the parameter value's minimum number of bytes.
         **/
minLength(  ):number


        /**
         * The maxLength attribute specifies the parameter value's maximum number of bytes.
         **/
maxLength(  ):number
}

export interface StringType extends ValueType{

        /**
         * @return String representation of the node value
         **/
value(  ):string
}

export interface ContentType extends StringType{}

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
 * Declares globally referable security scheme definition
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
         * The description MAY be used to describe a securityScheme.
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

export interface HasNormalParameters extends RAMLLanguageElement{

        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming  a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):TypeDeclaration[]


        /**
         * Headers that allowed at this position
         **/
headers(  ):TypeDeclaration[]


        /**
         * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
         **/
queryString(  ):TypeDeclaration
}

export interface MethodBase extends HasNormalParameters{

        /**
         * Information about the expected responses to a request
         **/
responses(  ):Response[]


        /**
         * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create. Resources CAN have alternate representations. For example, an API might support both JSON and XML representations. A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
         **/
body(  ):TypeDeclaration[]


        /**
         * A method can override the protocols specified in the resource or at the API root, by employing this property.
         **/
protocols(  ):string[]


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]
}

export interface Response extends RAMLLanguageElement{

        /**
         * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
         **/
code(  ):StatusCodeString


        /**
         * Detailed information about any response headers returned by this method
         **/
headers(  ):TypeDeclaration[]


        /**
         * The body of the response: a body declaration
         **/
body(  ):TypeDeclaration[]


        /**
         * An alternate, human-friendly name for the response
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the response
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


        /**
         * true for codes < 400 and false otherwise
         **/
isOkRange(  ):boolean
}

export interface StatusCodeString extends StringType{}

export interface TraitRef extends Reference{

        /**
         * Returns referenced trait
         **/
trait(  ):Trait
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
         * You may import library locally here it contents is accessible only inside of this trait
         **/
uses(  ):Library[]


        /**
         * Returns object representation of parametrized properties of the trait
         **/
parametrizedProperties(  ):TypeInstance
}

export interface LibraryBase extends RAMLLanguageElement{

        /**
         * Alias for the equivalent "types" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "types" property, as the "schemas" alias for that property name may be removed in a future RAML version. The "types" property allows for XML and JSON schemas.
         **/
schemas(  ):GlobalSchema[]


        /**
         * Declarations of (data) types for use within this API
         **/
types(  ):TypeDeclaration[]


        /**
         * Declarations of annotation types for use by annotations
         **/
annotationTypes(  ):AnnotationTypeDeclaration[]


        /**
         * Declarations of security schemes for use within this API.
         **/
securitySchemes(  ):AbstractSecurityScheme[]


        /**
         * Importing libraries
         **/
uses(  ):Library[]


        /**
         * Retrieve all traits including those defined in libraries
         **/
traits(  ):Trait[]


        /**
         * Retrieve all traits including those defined in libraries
         * @deprecated
         **/
allTraits(  ):Trait[]


        /**
         * Retrieve all resource types including those defined in libraries
         **/
resourceTypes(  ):ResourceType[]


        /**
         * Retrieve all resource types including those defined in libraries
         * @deprecated
         **/
allResourceTypes(  ):ResourceType[]
}

export interface Library extends LibraryBase{

        /**
         * contains description of why library exist
         **/
usage(  ):string


        /**
         * Namespace which the library is imported under
         **/
name(  ):string
}

export interface Method extends MethodBase{

        /**
         * Method that can be called
         **/
method(  ):string


        /**
         * An alternate, human-friendly name for the method (in the resource's context).
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the method (in the resource's context)
         **/
description(  ):MarkdownString


        /**
         * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
         **/
queryString(  ):TypeDeclaration


        /**
         * Detailed information about any query parameters needed by this method. Mutually exclusive with queryString.
         **/
queryParameters(  ):TypeDeclaration[]


        /**
         * Detailed information about any request headers needed by this method.
         **/
headers(  ):TypeDeclaration[]


        /**
         * Some methods admit request bodies, which are described by this property.
         **/
body(  ):TypeDeclaration[]


        /**
         * A list of the traits to apply to this method.
         **/
is(  ):TraitRef[]


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


        /**
         * The security schemes that apply to this method
         **/
securedBy(  ):SecuritySchemeRef[]


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

export interface SecuritySchemePart extends MethodBase{

        /**
         * Headers that allowed at this position
         **/
headers(  ):TypeDeclaration[]


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming  a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):TypeDeclaration[]


        /**
         * Specifies the query string, used by the scheme in order to authorize the request. Mutually exclusive with queryParameters.
         **/
queryString(  ):TypeDeclaration


        /**
         * Optional array of responses, describing the possible responses that could be sent.
         **/
responses(  ):Response[]


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * An alternate, human-friendly name for the security scheme part
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the security scheme part
         **/
description(  ):MarkdownString


        /**
         * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name.
         **/
annotations(  ):AnnotationRef[]
}

export interface SecuritySchemeSettings extends core.BasicNode{}

export interface OAuth1SecuritySchemeSettings extends SecuritySchemeSettings{

        /**
         * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
         **/
requestTokenUri(  ):FixedUriString


        /**
         * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
         **/
authorizationUri(  ):FixedUriString


        /**
         * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
         **/
tokenCredentialsUri(  ):FixedUriString


        /**
         * List of the signature methods used by the server. Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT
         **/
signatures(  ):string[]
}


/**
 * This  type describes fixed uris
 **/
export interface FixedUriString extends StringType{}

export interface OAuth2SecuritySchemeSettings extends SecuritySchemeSettings{

        /**
         * The URI of the Token Endpoint as defined in RFC6749 Section 3.2. Not required forby implicit grant type.
         **/
accessTokenUri(  ):FixedUriString


        /**
         * The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1. Required forby authorization_code and implicit grant types.
         **/
authorizationUri(  ):FixedUriString


        /**
         * A list of the Authorization grants supported by the API as defined in RFC6749 Sections 4.1, 4.2, 4.3 and 4.4, can be any of: authorization_code, password, client_credentials, implicit, or refresh_token.
         **/
authorizationGrants(  ):string[]


        /**
         * A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3
         **/
scopes(  ):string[]
}

export interface PassThroughSecuritySchemeSettings extends SecuritySchemeSettings{

        /**
         * Name of query parameter used to pass key
         **/
queryParameterName(  ):string


        /**
         * Name of header used to pass key
         **/
headerName(  ):string
}


/**
 * Declares globally referable security scheme definition
 **/
export interface OAuth2SecurityScheme extends AbstractSecurityScheme{
settings(  ):OAuth2SecuritySchemeSettings
}


/**
 * Declares globally referable security scheme definition
 **/
export interface OAuth1SecurityScheme extends AbstractSecurityScheme{
settings(  ):OAuth1SecuritySchemeSettings
}


/**
 * Declares globally referable security scheme definition
 **/
export interface PassThroughSecurityScheme extends AbstractSecurityScheme{
settings(  ):PassThroughSecuritySchemeSettings
}


/**
 * Declares globally referable security scheme definition
 **/
export interface BasicSecurityScheme extends AbstractSecurityScheme{}


/**
 * Declares globally referable security scheme definition
 **/
export interface DigestSecurityScheme extends AbstractSecurityScheme{}


/**
 * Declares globally referable security scheme definition
 **/
export interface CustomSecurityScheme extends AbstractSecurityScheme{}

export interface ResourceTypeRef extends Reference{

        /**
         * Returns referenced resource type
         **/
resourceType(  ):ResourceType
}

export interface ResourceBase extends RAMLLanguageElement{

        /**
         * Methods that are part of this resource type definition
         **/
methods(  ):Method[]


        /**
         * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. Individual methods may override this declaration
         **/
is(  ):TraitRef[]


        /**
         * The resource type which this resource inherits.
         **/
"type"(  ):ResourceTypeRef


        /**
         * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
         **/
securedBy(  ):SecuritySchemeRef[]


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
uriParameters(  ):TypeDeclaration[]


        /**
         * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
         * Consider a fragment of RAML specification:
         * ```yaml
         * /resource/{objectId}/{propertyId}:
         * uriParameters:
         * objectId:
         * ```
         * Here `propertyId` uri parameter is not described in the `uriParameters` node,
         * but it is among Resource.allUriParameters().
         * @deprecated
         **/
allUriParameters(  ):TypeDeclaration[]


        /**
         * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
         * returns schemes defined with `securedBy` at API level.
         * @deprecated
         **/
allSecuredBy(  ):SecuritySchemeRef[]
}

export interface Resource extends ResourceBase{

        /**
         * Relative URL of this resource from the parent resource
         **/
relativeUri(  ):RelativeUriString


        /**
         * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
         **/
resources(  ):Resource[]


        /**
         * An alternate, human-friendly name for the resource.
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the resource.
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


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
         * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
         * for `Api` owning the `Resource` and `Resource.uriParameters()`.
         **/
absoluteUriParameters(  ):TypeDeclaration[]
}


/**
 * This type currently serves both for absolute and relative urls
 **/
export interface UriTemplate extends StringType{}


/**
 * This  type describes absolute uri templates
 **/
export interface FullUriTemplateString extends UriTemplate{}


/**
 * This  type describes relative uri templates
 **/
export interface RelativeUriString extends UriTemplate{}

export interface ResourceType extends ResourceBase{

        /**
         * Name of the resource type
         **/
name(  ):string


        /**
         * Instructions on how and when the resource type should be used.
         **/
usage(  ):string


        /**
         * You may import library locally here it contents is accessible only inside of this resource type
         **/
uses(  ):Library[]


        /**
         * Returns object representation of parametrized properties of the resource type
         **/
parametrizedProperties(  ):TypeInstance
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


/**
 * Examples at this moment only two subtypes are supported (json  and xml)
 **/
export interface ExampleString extends StringType{}


/**
 * This sub type of the string represents mime types
 **/
export interface MimeType extends StringType{}


/**
 * [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
 **/
export interface MarkdownString extends StringType{}

export interface DocumentationItem extends RAMLLanguageElement{

        /**
         * Title of documentation section
         **/
title(  ):string


        /**
         * Content of documentation section
         **/
content(  ):MarkdownString
}

export interface RAMLSimpleElement extends core.BasicNode{}

export interface ImportDeclaration extends RAMLSimpleElement{

        /**
         * Name prefix (without dot) used to refer imported declarations
         **/
key(  ):string


        /**
         * Content of the declared namespace
         **/
value(  ):Library
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

export interface Api extends LibraryBase{

        /**
         * Short plain-text label for the API
         **/
title(  ):string


        /**
         * The version of the API, e.g. 'v1'
         **/
version(  ):string


        /**
         * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
         **/
baseUri(  ):FullUriTemplateString


        /**
         * The protocols supported by the API
         **/
protocols(  ):string[]


        /**
         * The default media type to use for request and response bodies (payloads), e.g. "application/json"
         **/
mediaType(  ):MimeType


        /**
         * The security schemes that apply to every resource and method in the API
         **/
securedBy(  ):SecuritySchemeRef[]


        /**
         * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
         **/
resources(  ):Resource[]


        /**
         * Additional overall documentation for the API
         **/
documentation(  ):DocumentationItem[]


        /**
         * The displayName attribute specifies the $self's display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
         **/
displayName(  ):string


        /**
         * A longer, human-friendly description of the API
         **/
description(  ):MarkdownString


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]


        /**
         * Returns RAML version. "RAML10" string is returned for RAML 1.0. "RAML08" string is returned for RAML 0.8.
         **/
RAMLVersion(  ):string


        /**
         * Equivalent API with traits and resource types expanded
         **/
expand(  ):Api


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
baseUriParameters(  ):TypeDeclaration[]


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
         * but they are among `Api.allBaseUriParameters()`.
         * @deprecated
         **/
allBaseUriParameters(  ):TypeDeclaration[]


        /**
         * Protocols used by the API. Returns the `protocols` property value if it is specified.
         * Otherwise, returns protocol, specified in the base URI.
         * @deprecated
         **/
allProtocols(  ):string[]
}

export interface Overlay extends Api{

        /**
         * contains description of why overlay exist
         **/
usage(  ):string


        /**
         * Location of a valid RAML API definition (or overlay or extension), the overlay is applied to.
         **/
masterRef(  ):string


        /**
         * Short plain-text label for the API
         **/
title(  ):string
}

export interface Extension extends Api{

        /**
         * contains description of why extension exist
         **/
usage(  ):string


        /**
         * Location of a valid RAML API definition (or overlay or extension), the extension is applied to
         **/
masterRef(  ):string


        /**
         * Short plain-text label for the API
         **/
title(  ):string
}

/**
 * Custom type guard for Api. Returns true if node is instance of Api. Returns false otherwise.
 * Also returns false for super interfaces of Api.
 */
export function isApi(node: core.AbstractWrapperNode) : node is Api {
    return node.kind() == "Api" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for LibraryBase. Returns true if node is instance of LibraryBase. Returns false otherwise.
 * Also returns false for super interfaces of LibraryBase.
 */
export function isLibraryBase(node: core.AbstractWrapperNode) : node is LibraryBase {
    return node.kind() == "LibraryBase" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for RAMLLanguageElement. Returns true if node is instance of RAMLLanguageElement. Returns false otherwise.
 * Also returns false for super interfaces of RAMLLanguageElement.
 */
export function isRAMLLanguageElement(node: core.AbstractWrapperNode) : node is RAMLLanguageElement {
    return node.kind() == "RAMLLanguageElement" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for MarkdownString. Returns true if node is instance of MarkdownString. Returns false otherwise.
 * Also returns false for super interfaces of MarkdownString.
 */
export function isMarkdownString(node: core.AbstractWrapperNode) : node is MarkdownString {
    return node.kind() == "MarkdownString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for StringType. Returns true if node is instance of StringType. Returns false otherwise.
 * Also returns false for super interfaces of StringType.
 */
export function isStringType(node: core.AbstractWrapperNode) : node is StringType {
    return node.kind() == "StringType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ValueType. Returns true if node is instance of ValueType. Returns false otherwise.
 * Also returns false for super interfaces of ValueType.
 */
export function isValueType(node: core.AbstractWrapperNode) : node is ValueType {
    return node.kind() == "ValueType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for AnyType. Returns true if node is instance of AnyType. Returns false otherwise.
 * Also returns false for super interfaces of AnyType.
 */
export function isAnyType(node: core.AbstractWrapperNode) : node is AnyType {
    return node.kind() == "AnyType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for NumberType. Returns true if node is instance of NumberType. Returns false otherwise.
 * Also returns false for super interfaces of NumberType.
 */
export function isNumberType(node: core.AbstractWrapperNode) : node is NumberType {
    return node.kind() == "NumberType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for BooleanType. Returns true if node is instance of BooleanType. Returns false otherwise.
 * Also returns false for super interfaces of BooleanType.
 */
export function isBooleanType(node: core.AbstractWrapperNode) : node is BooleanType {
    return node.kind() == "BooleanType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Reference. Returns true if node is instance of Reference. Returns false otherwise.
 * Also returns false for super interfaces of Reference.
 */
export function isReference(node: core.AbstractWrapperNode) : node is Reference {
    return node.kind() == "Reference" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for AnnotationRef. Returns true if node is instance of AnnotationRef. Returns false otherwise.
 * Also returns false for super interfaces of AnnotationRef.
 */
export function isAnnotationRef(node: core.AbstractWrapperNode) : node is AnnotationRef {
    return node.kind() == "AnnotationRef" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for AnnotationTypeDeclaration. Returns true if node is instance of AnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of AnnotationTypeDeclaration.
 */
export function isAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is AnnotationTypeDeclaration {
    return node.kind() == "AnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for TypeDeclaration. Returns true if node is instance of TypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of TypeDeclaration.
 */
export function isTypeDeclaration(node: core.AbstractWrapperNode) : node is TypeDeclaration {
    return node.kind() == "TypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ModelLocation. Returns true if node is instance of ModelLocation. Returns false otherwise.
 * Also returns false for super interfaces of ModelLocation.
 */
export function isModelLocation(node: core.AbstractWrapperNode) : node is ModelLocation {
    return node.kind() == "ModelLocation" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for LocationKind. Returns true if node is instance of LocationKind. Returns false otherwise.
 * Also returns false for super interfaces of LocationKind.
 */
export function isLocationKind(node: core.AbstractWrapperNode) : node is LocationKind {
    return node.kind() == "LocationKind" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ExampleSpec. Returns true if node is instance of ExampleSpec. Returns false otherwise.
 * Also returns false for super interfaces of ExampleSpec.
 */
export function isExampleSpec(node: core.AbstractWrapperNode) : node is ExampleSpec {
    return node.kind() == "ExampleSpec" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ArrayTypeDeclaration. Returns true if node is instance of ArrayTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of ArrayTypeDeclaration.
 */
export function isArrayTypeDeclaration(node: core.AbstractWrapperNode) : node is ArrayTypeDeclaration {
    return node.kind() == "ArrayTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ArrayAnnotationTypeDeclaration. Returns true if node is instance of ArrayAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of ArrayAnnotationTypeDeclaration.
 */
export function isArrayAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is ArrayAnnotationTypeDeclaration {
    return node.kind() == "ArrayAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for AnnotationTarget. Returns true if node is instance of AnnotationTarget. Returns false otherwise.
 * Also returns false for super interfaces of AnnotationTarget.
 */
export function isAnnotationTarget(node: core.AbstractWrapperNode) : node is AnnotationTarget {
    return node.kind() == "AnnotationTarget" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for UnionTypeDeclaration. Returns true if node is instance of UnionTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of UnionTypeDeclaration.
 */
export function isUnionTypeDeclaration(node: core.AbstractWrapperNode) : node is UnionTypeDeclaration {
    return node.kind() == "UnionTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for UnionAnnotationTypeDeclaration. Returns true if node is instance of UnionAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of UnionAnnotationTypeDeclaration.
 */
export function isUnionAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is UnionAnnotationTypeDeclaration {
    return node.kind() == "UnionAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ObjectTypeDeclaration. Returns true if node is instance of ObjectTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of ObjectTypeDeclaration.
 */
export function isObjectTypeDeclaration(node: core.AbstractWrapperNode) : node is ObjectTypeDeclaration {
    return node.kind() == "ObjectTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ObjectAnnotationTypeDeclaration. Returns true if node is instance of ObjectAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of ObjectAnnotationTypeDeclaration.
 */
export function isObjectAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is ObjectAnnotationTypeDeclaration {
    return node.kind() == "ObjectAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for StringTypeDeclaration. Returns true if node is instance of StringTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of StringTypeDeclaration.
 */
export function isStringTypeDeclaration(node: core.AbstractWrapperNode) : node is StringTypeDeclaration {
    return node.kind() == "StringTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for StringAnnotationTypeDeclaration. Returns true if node is instance of StringAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of StringAnnotationTypeDeclaration.
 */
export function isStringAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is StringAnnotationTypeDeclaration {
    return node.kind() == "StringAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for BooleanTypeDeclaration. Returns true if node is instance of BooleanTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of BooleanTypeDeclaration.
 */
export function isBooleanTypeDeclaration(node: core.AbstractWrapperNode) : node is BooleanTypeDeclaration {
    return node.kind() == "BooleanTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for BooleanAnnotationTypeDeclaration. Returns true if node is instance of BooleanAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of BooleanAnnotationTypeDeclaration.
 */
export function isBooleanAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is BooleanAnnotationTypeDeclaration {
    return node.kind() == "BooleanAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for NumberTypeDeclaration. Returns true if node is instance of NumberTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of NumberTypeDeclaration.
 */
export function isNumberTypeDeclaration(node: core.AbstractWrapperNode) : node is NumberTypeDeclaration {
    return node.kind() == "NumberTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for IntegerTypeDeclaration. Returns true if node is instance of IntegerTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of IntegerTypeDeclaration.
 */
export function isIntegerTypeDeclaration(node: core.AbstractWrapperNode) : node is IntegerTypeDeclaration {
    return node.kind() == "IntegerTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for NumberAnnotationTypeDeclaration. Returns true if node is instance of NumberAnnotationTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of NumberAnnotationTypeDeclaration.
 */
export function isNumberAnnotationTypeDeclaration(node: core.AbstractWrapperNode) : node is NumberAnnotationTypeDeclaration {
    return node.kind() == "NumberAnnotationTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for DateTypeDeclaration. Returns true if node is instance of DateTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of DateTypeDeclaration.
 */
export function isDateTypeDeclaration(node: core.AbstractWrapperNode) : node is DateTypeDeclaration {
    return node.kind() == "DateTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for DateTypeAnnotationDeclaration. Returns true if node is instance of DateTypeAnnotationDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of DateTypeAnnotationDeclaration.
 */
export function isDateTypeAnnotationDeclaration(node: core.AbstractWrapperNode) : node is DateTypeAnnotationDeclaration {
    return node.kind() == "DateTypeAnnotationDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for FileTypeDeclaration. Returns true if node is instance of FileTypeDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of FileTypeDeclaration.
 */
export function isFileTypeDeclaration(node: core.AbstractWrapperNode) : node is FileTypeDeclaration {
    return node.kind() == "FileTypeDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ContentType. Returns true if node is instance of ContentType. Returns false otherwise.
 * Also returns false for super interfaces of ContentType.
 */
export function isContentType(node: core.AbstractWrapperNode) : node is ContentType {
    return node.kind() == "ContentType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for SecuritySchemeRef. Returns true if node is instance of SecuritySchemeRef. Returns false otherwise.
 * Also returns false for super interfaces of SecuritySchemeRef.
 */
export function isSecuritySchemeRef(node: core.AbstractWrapperNode) : node is SecuritySchemeRef {
    return node.kind() == "SecuritySchemeRef" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for AbstractSecurityScheme. Returns true if node is instance of AbstractSecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of AbstractSecurityScheme.
 */
export function isAbstractSecurityScheme(node: core.AbstractWrapperNode) : node is AbstractSecurityScheme {
    return node.kind() == "AbstractSecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for SecuritySchemePart. Returns true if node is instance of SecuritySchemePart. Returns false otherwise.
 * Also returns false for super interfaces of SecuritySchemePart.
 */
export function isSecuritySchemePart(node: core.AbstractWrapperNode) : node is SecuritySchemePart {
    return node.kind() == "SecuritySchemePart" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for MethodBase. Returns true if node is instance of MethodBase. Returns false otherwise.
 * Also returns false for super interfaces of MethodBase.
 */
export function isMethodBase(node: core.AbstractWrapperNode) : node is MethodBase {
    return node.kind() == "MethodBase" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for HasNormalParameters. Returns true if node is instance of HasNormalParameters. Returns false otherwise.
 * Also returns false for super interfaces of HasNormalParameters.
 */
export function isHasNormalParameters(node: core.AbstractWrapperNode) : node is HasNormalParameters {
    return node.kind() == "HasNormalParameters" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Response. Returns true if node is instance of Response. Returns false otherwise.
 * Also returns false for super interfaces of Response.
 */
export function isResponse(node: core.AbstractWrapperNode) : node is Response {
    return node.kind() == "Response" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for StatusCodeString. Returns true if node is instance of StatusCodeString. Returns false otherwise.
 * Also returns false for super interfaces of StatusCodeString.
 */
export function isStatusCodeString(node: core.AbstractWrapperNode) : node is StatusCodeString {
    return node.kind() == "StatusCodeString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for TraitRef. Returns true if node is instance of TraitRef. Returns false otherwise.
 * Also returns false for super interfaces of TraitRef.
 */
export function isTraitRef(node: core.AbstractWrapperNode) : node is TraitRef {
    return node.kind() == "TraitRef" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Trait. Returns true if node is instance of Trait. Returns false otherwise.
 * Also returns false for super interfaces of Trait.
 */
export function isTrait(node: core.AbstractWrapperNode) : node is Trait {
    return node.kind() == "Trait" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Library. Returns true if node is instance of Library. Returns false otherwise.
 * Also returns false for super interfaces of Library.
 */
export function isLibrary(node: core.AbstractWrapperNode) : node is Library {
    return node.kind() == "Library" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Method. Returns true if node is instance of Method. Returns false otherwise.
 * Also returns false for super interfaces of Method.
 */
export function isMethod(node: core.AbstractWrapperNode) : node is Method {
    return node.kind() == "Method" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for SecuritySchemeSettings. Returns true if node is instance of SecuritySchemeSettings. Returns false otherwise.
 * Also returns false for super interfaces of SecuritySchemeSettings.
 */
export function isSecuritySchemeSettings(node: core.AbstractWrapperNode) : node is SecuritySchemeSettings {
    return node.kind() == "SecuritySchemeSettings" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for OAuth1SecuritySchemeSettings. Returns true if node is instance of OAuth1SecuritySchemeSettings. Returns false otherwise.
 * Also returns false for super interfaces of OAuth1SecuritySchemeSettings.
 */
export function isOAuth1SecuritySchemeSettings(node: core.AbstractWrapperNode) : node is OAuth1SecuritySchemeSettings {
    return node.kind() == "OAuth1SecuritySchemeSettings" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for FixedUriString. Returns true if node is instance of FixedUriString. Returns false otherwise.
 * Also returns false for super interfaces of FixedUriString.
 */
export function isFixedUriString(node: core.AbstractWrapperNode) : node is FixedUriString {
    return node.kind() == "FixedUriString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for OAuth2SecuritySchemeSettings. Returns true if node is instance of OAuth2SecuritySchemeSettings. Returns false otherwise.
 * Also returns false for super interfaces of OAuth2SecuritySchemeSettings.
 */
export function isOAuth2SecuritySchemeSettings(node: core.AbstractWrapperNode) : node is OAuth2SecuritySchemeSettings {
    return node.kind() == "OAuth2SecuritySchemeSettings" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for PassThroughSecuritySchemeSettings. Returns true if node is instance of PassThroughSecuritySchemeSettings. Returns false otherwise.
 * Also returns false for super interfaces of PassThroughSecuritySchemeSettings.
 */
export function isPassThroughSecuritySchemeSettings(node: core.AbstractWrapperNode) : node is PassThroughSecuritySchemeSettings {
    return node.kind() == "PassThroughSecuritySchemeSettings" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for OAuth2SecurityScheme. Returns true if node is instance of OAuth2SecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of OAuth2SecurityScheme.
 */
export function isOAuth2SecurityScheme(node: core.AbstractWrapperNode) : node is OAuth2SecurityScheme {
    return node.kind() == "OAuth2SecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for OAuth1SecurityScheme. Returns true if node is instance of OAuth1SecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of OAuth1SecurityScheme.
 */
export function isOAuth1SecurityScheme(node: core.AbstractWrapperNode) : node is OAuth1SecurityScheme {
    return node.kind() == "OAuth1SecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for PassThroughSecurityScheme. Returns true if node is instance of PassThroughSecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of PassThroughSecurityScheme.
 */
export function isPassThroughSecurityScheme(node: core.AbstractWrapperNode) : node is PassThroughSecurityScheme {
    return node.kind() == "PassThroughSecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for BasicSecurityScheme. Returns true if node is instance of BasicSecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of BasicSecurityScheme.
 */
export function isBasicSecurityScheme(node: core.AbstractWrapperNode) : node is BasicSecurityScheme {
    return node.kind() == "BasicSecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for DigestSecurityScheme. Returns true if node is instance of DigestSecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of DigestSecurityScheme.
 */
export function isDigestSecurityScheme(node: core.AbstractWrapperNode) : node is DigestSecurityScheme {
    return node.kind() == "DigestSecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for CustomSecurityScheme. Returns true if node is instance of CustomSecurityScheme. Returns false otherwise.
 * Also returns false for super interfaces of CustomSecurityScheme.
 */
export function isCustomSecurityScheme(node: core.AbstractWrapperNode) : node is CustomSecurityScheme {
    return node.kind() == "CustomSecurityScheme" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ResourceTypeRef. Returns true if node is instance of ResourceTypeRef. Returns false otherwise.
 * Also returns false for super interfaces of ResourceTypeRef.
 */
export function isResourceTypeRef(node: core.AbstractWrapperNode) : node is ResourceTypeRef {
    return node.kind() == "ResourceTypeRef" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ResourceType. Returns true if node is instance of ResourceType. Returns false otherwise.
 * Also returns false for super interfaces of ResourceType.
 */
export function isResourceType(node: core.AbstractWrapperNode) : node is ResourceType {
    return node.kind() == "ResourceType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ResourceBase. Returns true if node is instance of ResourceBase. Returns false otherwise.
 * Also returns false for super interfaces of ResourceBase.
 */
export function isResourceBase(node: core.AbstractWrapperNode) : node is ResourceBase {
    return node.kind() == "ResourceBase" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Resource. Returns true if node is instance of Resource. Returns false otherwise.
 * Also returns false for super interfaces of Resource.
 */
export function isResource(node: core.AbstractWrapperNode) : node is Resource {
    return node.kind() == "Resource" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for RelativeUriString. Returns true if node is instance of RelativeUriString. Returns false otherwise.
 * Also returns false for super interfaces of RelativeUriString.
 */
export function isRelativeUriString(node: core.AbstractWrapperNode) : node is RelativeUriString {
    return node.kind() == "RelativeUriString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for UriTemplate. Returns true if node is instance of UriTemplate. Returns false otherwise.
 * Also returns false for super interfaces of UriTemplate.
 */
export function isUriTemplate(node: core.AbstractWrapperNode) : node is UriTemplate {
    return node.kind() == "UriTemplate" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for FullUriTemplateString. Returns true if node is instance of FullUriTemplateString. Returns false otherwise.
 * Also returns false for super interfaces of FullUriTemplateString.
 */
export function isFullUriTemplateString(node: core.AbstractWrapperNode) : node is FullUriTemplateString {
    return node.kind() == "FullUriTemplateString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for SchemaString. Returns true if node is instance of SchemaString. Returns false otherwise.
 * Also returns false for super interfaces of SchemaString.
 */
export function isSchemaString(node: core.AbstractWrapperNode) : node is SchemaString {
    return node.kind() == "SchemaString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for JSonSchemaString. Returns true if node is instance of JSonSchemaString. Returns false otherwise.
 * Also returns false for super interfaces of JSonSchemaString.
 */
export function isJSonSchemaString(node: core.AbstractWrapperNode) : node is JSonSchemaString {
    return node.kind() == "JSonSchemaString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for XMLSchemaString. Returns true if node is instance of XMLSchemaString. Returns false otherwise.
 * Also returns false for super interfaces of XMLSchemaString.
 */
export function isXMLSchemaString(node: core.AbstractWrapperNode) : node is XMLSchemaString {
    return node.kind() == "XMLSchemaString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ExampleString. Returns true if node is instance of ExampleString. Returns false otherwise.
 * Also returns false for super interfaces of ExampleString.
 */
export function isExampleString(node: core.AbstractWrapperNode) : node is ExampleString {
    return node.kind() == "ExampleString" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for MimeType. Returns true if node is instance of MimeType. Returns false otherwise.
 * Also returns false for super interfaces of MimeType.
 */
export function isMimeType(node: core.AbstractWrapperNode) : node is MimeType {
    return node.kind() == "MimeType" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for DocumentationItem. Returns true if node is instance of DocumentationItem. Returns false otherwise.
 * Also returns false for super interfaces of DocumentationItem.
 */
export function isDocumentationItem(node: core.AbstractWrapperNode) : node is DocumentationItem {
    return node.kind() == "DocumentationItem" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for GlobalSchema. Returns true if node is instance of GlobalSchema. Returns false otherwise.
 * Also returns false for super interfaces of GlobalSchema.
 */
export function isGlobalSchema(node: core.AbstractWrapperNode) : node is GlobalSchema {
    return node.kind() == "GlobalSchema" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for RAMLSimpleElement. Returns true if node is instance of RAMLSimpleElement. Returns false otherwise.
 * Also returns false for super interfaces of RAMLSimpleElement.
 */
export function isRAMLSimpleElement(node: core.AbstractWrapperNode) : node is RAMLSimpleElement {
    return node.kind() == "RAMLSimpleElement" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for ImportDeclaration. Returns true if node is instance of ImportDeclaration. Returns false otherwise.
 * Also returns false for super interfaces of ImportDeclaration.
 */
export function isImportDeclaration(node: core.AbstractWrapperNode) : node is ImportDeclaration {
    return node.kind() == "ImportDeclaration" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Overlay. Returns true if node is instance of Overlay. Returns false otherwise.
 * Also returns false for super interfaces of Overlay.
 */
export function isOverlay(node: core.AbstractWrapperNode) : node is Overlay {
    return node.kind() == "Overlay" && node.RAMLVersion() == "RAML10";
}


/**
 * Custom type guard for Extension. Returns true if node is instance of Extension. Returns false otherwise.
 * Also returns false for super interfaces of Extension.
 */
export function isExtension(node: core.AbstractWrapperNode) : node is Extension {
    return node.kind() == "Extension" && node.RAMLVersion() == "RAML10";
}

