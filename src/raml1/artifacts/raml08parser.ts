
import hl=require("../../raml1/highLevelAST");
import stubs=require("../../raml1/stubs");
import hlImpl=require("../../raml1/highLevelImpl");
import jsyaml=require("../../raml1/jsyaml/jsyaml2lowLevel");
import json2lowlevel = require('../../raml1/jsyaml/json2lowLevel');
import def=require("raml-definition-system");
import services=require("../../raml1/definition-system/ramlServices");
import core=require("../../raml1/wrapped-ast/parserCore");
import apiLoader=require("../../raml1/apiLoader");
import coreApi=require("../../raml1/wrapped-ast/parserCoreApi");
import pApi = require("./raml08parserapi");
import helper=require("../../raml1/wrapped-ast/wrapperHelper08")

import Api = pApi.Api;
import RAMLLanguageElement = pApi.RAMLLanguageElement;
import MarkdownString = pApi.MarkdownString;
import StringType = pApi.StringType;
import ValueType = pApi.ValueType;
import AnyType = pApi.AnyType;
import NumberType = pApi.NumberType;
import BooleanType = pApi.BooleanType;
import Reference = pApi.Reference;
import TypeInstance = pApi.TypeInstance;
import TypeInstanceProperty = pApi.TypeInstanceProperty;
import TraitRef = pApi.TraitRef;
import Trait = pApi.Trait;
import MethodBase = pApi.MethodBase;
import HasNormalParameters = pApi.HasNormalParameters;
import Parameter = pApi.Parameter;
import ParameterLocation = pApi.ParameterLocation;
import StringTypeDeclaration = pApi.StringTypeDeclaration;
import BooleanTypeDeclaration = pApi.BooleanTypeDeclaration;
import NumberTypeDeclaration = pApi.NumberTypeDeclaration;
import IntegerTypeDeclaration = pApi.IntegerTypeDeclaration;
import DateTypeDeclaration = pApi.DateTypeDeclaration;
import FileTypeDeclaration = pApi.FileTypeDeclaration;
import Response = pApi.Response;
import StatusCodeString = pApi.StatusCodeString;
import BodyLike = pApi.BodyLike;
import SchemaString = pApi.SchemaString;
import JSonSchemaString = pApi.JSonSchemaString;
import XMLSchemaString = pApi.XMLSchemaString;
import ExampleString = pApi.ExampleString;
import JSONExample = pApi.JSONExample;
import XMLExample = pApi.XMLExample;
import XMLBody = pApi.XMLBody;
import JSONBody = pApi.JSONBody;
import SecuritySchemeRef = pApi.SecuritySchemeRef;
import AbstractSecurityScheme = pApi.AbstractSecurityScheme;
import SecuritySchemePart = pApi.SecuritySchemePart;
import SecuritySchemeSettings = pApi.SecuritySchemeSettings;
import OAuth1SecuritySchemeSettings = pApi.OAuth1SecuritySchemeSettings;
import FixedUri = pApi.FixedUri;
import OAuth2SecuritySchemeSettings = pApi.OAuth2SecuritySchemeSettings;
import OAuth2SecurityScheme = pApi.OAuth2SecurityScheme;
import OAuth1SecurityScheme = pApi.OAuth1SecurityScheme;
import BasicSecurityScheme = pApi.BasicSecurityScheme;
import DigestSecurityScheme = pApi.DigestSecurityScheme;
import CustomSecurityScheme = pApi.CustomSecurityScheme;
import Method = pApi.Method;
import ResourceTypeRef = pApi.ResourceTypeRef;
import ResourceType = pApi.ResourceType;
import UriTemplate = pApi.UriTemplate;
import RelativeUriString = pApi.RelativeUriString;
import FullUriTemplateString = pApi.FullUriTemplateString;
import MimeType = pApi.MimeType;
import Resource = pApi.Resource;
import GlobalSchema = pApi.GlobalSchema;
import RAMLSimpleElement = pApi.RAMLSimpleElement;
import DocumentationItem = pApi.DocumentationItem;
export class RAMLLanguageElementImpl extends core.BasicNodeImpl implements RAMLLanguageElement{

        /**
         * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown.
         **/
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "RAMLLanguageElementImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "RAMLLanguageElement";}
}

export class ValueTypeImpl extends core.AttributeNodeImpl implements ValueType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ValueTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ValueType";}


        /**
         * @return JS representation of the node value
         **/
value(  ):any{return this.attr.value();}
}

export class AnyTypeImpl extends ValueTypeImpl implements AnyType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "AnyTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "AnyType";}
}

export class NumberTypeImpl extends ValueTypeImpl implements NumberType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "NumberTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "NumberType";}


        /**
         * @return Number representation of the node value
         **/
value(  ):number{return this.attr.value();}
}

export class BooleanTypeImpl extends ValueTypeImpl implements BooleanType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BooleanTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BooleanType";}


        /**
         * @return Boolean representation of the node value
         **/
value(  ):boolean{return this.attr.value();}
}

export class ReferenceImpl extends core.AttributeNodeImpl implements Reference{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ReferenceImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Reference";}


        /**
         * @return StructuredValue object representing the node value
         **/
value(  ):hl.IStructuredValue{return core.toStructuredValue(this.attr);}

structuredValue(  ):TypeInstance{
            return helper.structuredValue(this);
        }

name(  ):string{
            return helper.referenceName(this);
        }
}

export class TraitRefImpl extends ReferenceImpl implements TraitRef{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TraitRefImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "TraitRef";}

trait(  ):Trait{
            return helper.referencedTrait(this);
        }
}

export class HasNormalParametersImpl extends RAMLLanguageElementImpl implements HasNormalParameters{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createHasNormalParameters(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('queryParameters');
         }


        /**
         * An alternate, human-readable name of the object
         **/
displayName(  ):string{
             return <string>super.attribute('displayName', this.toString);
         }


        /**
         * @hidden
         * Set displayName value
         **/
setDisplayName( param:string ){
            this.highLevel().attrOrCreate("displayName").setValue(""+param);
            return this;
        }


        /**
         * Headers that allowed at this position
         **/
headers(  ):Parameter[]{
             return <Parameter[]>super.elements('headers');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "HasNormalParametersImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "HasNormalParameters";}
}

export class ParameterImpl extends RAMLLanguageElementImpl implements Parameter{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createParameter(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * name of the parameter
         **/
name(  ):string{
             return <string>super.attribute('name', this.toString);
         }


        /**
         * @hidden
         * Set name value
         **/
setName( param:string ){
            this.highLevel().attrOrCreate("name").setValue(""+param);
            return this;
        }


        /**
         * An alternate, human-friendly name for the parameter
         **/
displayName(  ):string{
             return <string>super.attribute('displayName', this.toString);
         }


        /**
         * @hidden
         * Set displayName value
         **/
setDisplayName( param:string ){
            this.highLevel().attrOrCreate("displayName").setValue(""+param);
            return this;
        }


        /**
         * The type attribute specifies the primitive type of the parameter's resolved value. API clients MUST return/throw an error if the parameter's resolved value does not match the specified type. If type is not specified, it defaults to string.
         **/
"type"(  ):string{
             return <string>super.attribute('type', this.toString);
         }


        /**
         * @hidden
         * Set type value
         **/
setType( param:string ){
            this.highLevel().attrOrCreate("type").setValue(""+param);
            return this;
        }


        /**
         * Location of the parameter (can not be edited by user)
         **/
location(  ):ParameterLocation{
             return <ParameterLocation>super.attribute('location', (attr:hl.IAttribute)=>new ParameterLocationImpl(attr));
         }


        /**
         * Set to true if parameter is required
         **/
required(  ):boolean{
             return <boolean>super.attribute('required', this.toBoolean);
         }


        /**
         * @hidden
         * Set required value
         **/
setRequired( param:boolean ){
            this.highLevel().attrOrCreate("required").setValue(""+param);
            return this;
        }


        /**
         * The default attribute specifies the default value to use for the property if the property is omitted or its value is not specified. This SHOULD NOT be interpreted as a requirement for the client to send the default attribute's value if there is no other value to send. Instead, the default attribute's value is the value the server uses if the client does not send a value.
         **/
"default"(  ):any{
             return <any>super.attribute('default', this.toAny);
         }


        /**
         * @hidden
         * Set default value
         **/
setDefault( param:any ){
            this.highLevel().attrOrCreate("default").setValue(""+param);
            return this;
        }


        /**
         * (Optional) The example attribute shows an example value for the property. This can be used, e.g., by documentation generators to generate sample values for the property.
         **/
example(  ):string{
             return <string>super.attribute('example', this.toString);
         }


        /**
         * @hidden
         * Set example value
         **/
setExample( param:string ){
            this.highLevel().attrOrCreate("example").setValue(""+param);
            return this;
        }


        /**
         * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
         **/
repeat(  ):boolean{
             return <boolean>super.attribute('repeat', this.toBoolean);
         }


        /**
         * @hidden
         * Set repeat value
         **/
setRepeat( param:boolean ){
            this.highLevel().attrOrCreate("repeat").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ParameterImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Parameter";}
}

export class ParameterLocationImpl implements ParameterLocation{
constructor( protected attr:hl.IAttribute ){}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ParameterLocationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ParameterLocation";}
}


/**
 * Value must be a string
 **/
export class StringTypeDeclarationImpl extends ParameterImpl implements StringTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createStringTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * (Optional, applicable only for parameters of type string) The pattern attribute is a regular expression that a parameter of type string MUST match. Regular expressions MUST follow the regular expression specification from ECMA 262/Perl 5. The pattern MAY be enclosed in double quotes for readability and clarity.
         **/
pattern(  ):string{
             return <string>super.attribute('pattern', this.toString);
         }


        /**
         * @hidden
         * Set pattern value
         **/
setPattern( param:string ){
            this.highLevel().attrOrCreate("pattern").setValue(""+param);
            return this;
        }


        /**
         * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
         **/
enum(  ):string[]{
             return <string[]>super.attributes('enum', this.toString);
         }


        /**
         * @hidden
         * Set enum value
         **/
setEnum( param:string ){
            this.highLevel().attrOrCreate("enum").setValue(""+param);
            return this;
        }


        /**
         * (Optional, applicable only for parameters of type string) The minLength attribute specifies the parameter value's minimum number of characters.
         **/
minLength(  ):number{
             return <number>super.attribute('minLength', this.toNumber);
         }


        /**
         * @hidden
         * Set minLength value
         **/
setMinLength( param:number ){
            this.highLevel().attrOrCreate("minLength").setValue(""+param);
            return this;
        }


        /**
         * (Optional, applicable only for parameters of type string) The maxLength attribute specifies the parameter value's maximum number of characters.
         **/
maxLength(  ):number{
             return <number>super.attribute('maxLength', this.toNumber);
         }


        /**
         * @hidden
         * Set maxLength value
         **/
setMaxLength( param:number ){
            this.highLevel().attrOrCreate("maxLength").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "StringTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "StringTypeDeclaration";}
}


/**
 * Value must be a boolean
 **/
export class BooleanTypeDeclarationImpl extends ParameterImpl implements BooleanTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createBooleanTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BooleanTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BooleanTypeDeclaration";}
}


/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export class NumberTypeDeclarationImpl extends ParameterImpl implements NumberTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createNumberTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
         **/
minimum(  ):number{
             return <number>super.attribute('minimum', this.toNumber);
         }


        /**
         * @hidden
         * Set minimum value
         **/
setMinimum( param:number ){
            this.highLevel().attrOrCreate("minimum").setValue(""+param);
            return this;
        }


        /**
         * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
         **/
maximum(  ):number{
             return <number>super.attribute('maximum', this.toNumber);
         }


        /**
         * @hidden
         * Set maximum value
         **/
setMaximum( param:number ){
            this.highLevel().attrOrCreate("maximum").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "NumberTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "NumberTypeDeclaration";}
}


/**
 * Value MUST be a integer.
 **/
export class IntegerTypeDeclarationImpl extends NumberTypeDeclarationImpl implements IntegerTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createIntegerTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "IntegerTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "IntegerTypeDeclaration";}
}


/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3.
 **/
export class DateTypeDeclarationImpl extends ParameterImpl implements DateTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDateTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTypeDeclaration";}
}


/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export class FileTypeDeclarationImpl extends ParameterImpl implements FileTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createFileTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FileTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FileTypeDeclaration";}
}


/**
 * Method object allows description of http methods
 **/
export class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createMethodBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Resource methods MAY have one or more responses. Responses MAY be described using the description property, and MAY include example attributes or schema properties.
         **/
responses(  ):Response[]{
             return <Response[]>super.elements('responses');
         }


        /**
         * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create. Resources CAN have alternate representations. For example, an API might support both JSON and XML representations. A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
         **/
body(  ):BodyLike[]{
             return <BodyLike[]>super.elements('body');
         }


        /**
         * A method can override an API's protocols value for that single method by setting a different value for the fields.
         **/
protocols(  ):string[]{
             return <string[]>super.attributes('protocols', this.toString);
         }


        /**
         * @hidden
         * Set protocols value
         **/
setProtocols( param:string ){
            this.highLevel().attrOrCreate("protocols").setValue(""+param);
            return this;
        }


        /**
         * A list of the security schemas to apply, these must be defined in the securitySchemes declaration. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme. Security schemas may also be applied to a resource with securedBy, which is equivalent to applying the security schemas to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "MethodBaseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "MethodBase";}
}

export class ResponseImpl extends RAMLLanguageElementImpl implements Response{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResponse(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
         **/
code(  ):StatusCodeString{
             return <StatusCodeString>super.attribute('code', (attr:hl.IAttribute)=>new StatusCodeStringImpl(attr));
         }


        /**
         * An API's methods may support custom header values in responses. The custom, non-standard HTTP headers MUST be specified by the headers property. API's may include the the placeholder token {?} in a header name to indicate that any number of headers that conform to the specified format can be sent in responses. This is particularly useful for APIs that allow HTTP headers that conform to some naming convention to send arbitrary, custom data.
         **/
headers(  ):Parameter[]{
             return <Parameter[]>super.elements('headers');
         }


        /**
         * Each response MAY contain a body property, which conforms to the same structure as request body properties (see Body). Responses that can return more than one response code MAY therefore have multiple bodies defined. For APIs without a priori knowledge of the response types for their responses, `* /*` MAY be used to indicate that responses that do not matching other defined data types MUST be accepted. Processing applications MUST match the most descriptive media type first if `* /*` is used.
         **/
body(  ):BodyLike[]{
             return <BodyLike[]>super.elements('body');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ResponseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Response";}


        /**
         * true for codes < 400 and false otherwise
         **/
isOkRange(  ):boolean{
            return helper.isOkRange(this);
        }
}

export class StringTypeImpl extends ValueTypeImpl implements StringType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "StringTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "StringType";}


        /**
         * @return String representation of the node value
         **/
value(  ):string{return this.attr.value();}
}

export class StatusCodeStringImpl extends StringTypeImpl implements StatusCodeString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "StatusCodeStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "StatusCodeString";}
}

export class BodyLikeImpl extends RAMLLanguageElementImpl implements BodyLike{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createBodyLike(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Mime type of the request or response body
         **/
name(  ):string{
             return <string>super.attribute('name', this.toString);
         }


        /**
         * @hidden
         * Set name value
         **/
setName( param:string ){
            this.highLevel().attrOrCreate("name").setValue(""+param);
            return this;
        }


        /**
         * The structure of a request or response body MAY be further specified by the schema property under the appropriate media type. The schema key CANNOT be specified if a body's media type is application/x-www-form-urlencoded or multipart/form-data. All parsers of RAML MUST be able to interpret JSON Schema and XML Schema. Schema MAY be declared inline or in an external file. However, if the schema is sufficiently large so as to make it difficult for a person to read the API definition, or the schema is reused across multiple APIs or across multiple miles in the same API, the !include user-defined data type SHOULD be used instead of including the content inline. Alternatively, the value of the schema field MAY be the name of a schema specified in the root-level schemas property, or it MAY be declared in an external file and included by using the by using the RAML !include user-defined data type.
         **/
schema(  ):SchemaString{
             return <SchemaString>super.attribute('schema', (attr:hl.IAttribute)=>new SchemaStringImpl(attr));
         }


        /**
         * Documentation generators MUST use body properties' example attributes to generate example invocations.
         **/
example(  ):ExampleString{
             return <ExampleString>super.attribute('example', (attr:hl.IAttribute)=>new ExampleStringImpl(attr));
         }


        /**
         * Web forms REQUIRE special encoding and custom declaration. If the API's media type is either application/x-www-form-urlencoded or multipart/form-data, the formParameters property MUST specify the name-value pairs that the API is expecting. The formParameters property is a map in which the key is the name of the web form parameter, and the value is itself a map the specifies the web form parameter's attributes.
         **/
formParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('formParameters');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BodyLikeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BodyLike";}

schemaContent(  ):string{
            return helper.schemaContent(this);
        }
}


/**
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 **/
export class SchemaStringImpl extends StringTypeImpl implements SchemaString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "SchemaStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "SchemaString";}
}


/**
 * JSON schema
 **/
export class JSonSchemaStringImpl extends SchemaStringImpl implements JSonSchemaString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "JSonSchemaStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "JSonSchemaString";}
}


/**
 * XSD schema
 **/
export class XMLSchemaStringImpl extends SchemaStringImpl implements XMLSchemaString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "XMLSchemaStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "XMLSchemaString";}
}

export class ExampleStringImpl extends StringTypeImpl implements ExampleString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ExampleStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ExampleString";}
}

export class JSONExampleImpl extends ExampleStringImpl implements JSONExample{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "JSONExampleImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "JSONExample";}
}

export class XMLExampleImpl extends ExampleStringImpl implements XMLExample{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "XMLExampleImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "XMLExample";}
}


/**
 * Needed to set connection between xml related mime types and xsd schema
 **/
export class XMLBodyImpl extends BodyLikeImpl implements XMLBody{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createXMLBody(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * XSD Schema
         **/
schema(  ):XMLSchemaString{
             return <XMLSchemaString>super.attribute('schema', (attr:hl.IAttribute)=>new XMLSchemaStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "XMLBodyImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "XMLBody";}
}


/**
 * Needed to set connection between json related mime types and json schema
 **/
export class JSONBodyImpl extends BodyLikeImpl implements JSONBody{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createJSONBody(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * JSON Schema
         **/
schema(  ):JSonSchemaString{
             return <JSonSchemaString>super.attribute('schema', (attr:hl.IAttribute)=>new JSonSchemaStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "JSONBodyImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "JSONBody";}
}

export class SecuritySchemeRefImpl extends ReferenceImpl implements SecuritySchemeRef{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "SecuritySchemeRefImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "SecuritySchemeRef";}

securitySchemeName(  ):string{
            return helper.securitySchemeName(this);
        }

securityScheme(  ):AbstractSecurityScheme{
            return helper.securityScheme(this);
        }
}


/**
 * Declares globally referable security schema definition
 **/
export class AbstractSecuritySchemeImpl extends RAMLLanguageElementImpl implements AbstractSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createAbstractSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Name of the security scheme
         **/
name(  ):string{
             return <string>super.attribute('name', this.toString);
         }


        /**
         * @hidden
         * Set name value
         **/
setName( param:string ){
            this.highLevel().attrOrCreate("name").setValue(""+param);
            return this;
        }


        /**
         * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
         **/
"type"(  ):string{
             return <string>super.attribute('type', this.toString);
         }


        /**
         * @hidden
         * Set type value
         **/
setType( param:string ){
            this.highLevel().attrOrCreate("type").setValue(""+param);
            return this;
        }


        /**
         * The description attribute MAY be used to describe a security schemes property.
         **/
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
         }


        /**
         * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes. Including the security scheme description completes an API documentation.
         **/
describedBy(  ):SecuritySchemePart{
             return <SecuritySchemePart>super.element('describedBy');
         }


        /**
         * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared. It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
         **/
settings(  ):SecuritySchemeSettings{
             return <SecuritySchemeSettings>super.element('settings');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "AbstractSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "AbstractSecurityScheme";}
}

export class SecuritySchemePartImpl extends MethodBaseImpl implements SecuritySchemePart{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createSecuritySchemePart(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Headers that allowed at this position
         **/
headers(  ):Parameter[]{
             return <Parameter[]>super.elements('headers');
         }


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('queryParameters');
         }


        /**
         * Optional array of responses, describing the possible responses that could be sent.
         **/
responses(  ):Response[]{
             return <Response[]>super.elements('responses');
         }


        /**
         * A list of the security schemas to apply, these must be defined in the securitySchemes declaration. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme. Security schemas may also be applied to a resource with securedBy, which is equivalent to applying the security schemas to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * An alternate, human-friendly name for the security scheme part
         **/
displayName(  ):string{
             return <string>super.attribute('displayName', this.toString);
         }


        /**
         * @hidden
         * Set displayName value
         **/
setDisplayName( param:string ){
            this.highLevel().attrOrCreate("displayName").setValue(""+param);
            return this;
        }


        /**
         * A longer, human-friendly description of the security scheme part
         **/
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "SecuritySchemePartImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "SecuritySchemePart";}
}

export class SecuritySchemeSettingsImpl extends core.BasicNodeImpl implements SecuritySchemeSettings{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "SecuritySchemeSettingsImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "SecuritySchemeSettings";}
}

export class OAuth1SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth1SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOAuth1SecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
         **/
requestTokenUri(  ):FixedUri{
             return <FixedUri>super.attribute('requestTokenUri', (attr:hl.IAttribute)=>new FixedUriImpl(attr));
         }


        /**
         * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
         **/
authorizationUri(  ):FixedUri{
             return <FixedUri>super.attribute('authorizationUri', (attr:hl.IAttribute)=>new FixedUriImpl(attr));
         }


        /**
         * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
         **/
tokenCredentialsUri(  ):FixedUri{
             return <FixedUri>super.attribute('tokenCredentialsUri', (attr:hl.IAttribute)=>new FixedUriImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OAuth1SecuritySchemeSettingsImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "OAuth1SecuritySchemeSettings";}
}


/**
 * This  type describes fixed uris
 **/
export class FixedUriImpl extends StringTypeImpl implements FixedUri{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FixedUriImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FixedUri";}
}

export class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth2SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOAuth2SecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The URI of the Token Endpoint as defined in RFC6749 Section 3.2. Not required forby implicit grant type.
         **/
accessTokenUri(  ):FixedUri{
             return <FixedUri>super.attribute('accessTokenUri', (attr:hl.IAttribute)=>new FixedUriImpl(attr));
         }


        /**
         * The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1. Required forby authorization_code and implicit grant types.
         **/
authorizationUri(  ):FixedUri{
             return <FixedUri>super.attribute('authorizationUri', (attr:hl.IAttribute)=>new FixedUriImpl(attr));
         }


        /**
         * A list of the Authorization grants supported by the API as defined in RFC6749 Sections 4.1, 4.2, 4.3 and 4.4, can be any of: authorization_code, password, client_credentials, implicit, or refresh_token.
         **/
authorizationGrants(  ):string[]{
             return <string[]>super.attributes('authorizationGrants', this.toString);
         }


        /**
         * @hidden
         * Set authorizationGrants value
         **/
setAuthorizationGrants( param:string ){
            this.highLevel().attrOrCreate("authorizationGrants").setValue(""+param);
            return this;
        }


        /**
         * A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3
         **/
scopes(  ):string[]{
             return <string[]>super.attributes('scopes', this.toString);
         }


        /**
         * @hidden
         * Set scopes value
         **/
setScopes( param:string ){
            this.highLevel().attrOrCreate("scopes").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OAuth2SecuritySchemeSettingsImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "OAuth2SecuritySchemeSettings";}
}


/**
 * Declares globally referable security schema definition
 **/
export class OAuth2SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth2SecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOAuth2SecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

settings(  ):OAuth2SecuritySchemeSettings{
             return <OAuth2SecuritySchemeSettings>super.element('settings');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OAuth2SecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "OAuth2SecurityScheme";}
}


/**
 * Declares globally referable security schema definition
 **/
export class OAuth1SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth1SecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOAuth1SecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

settings(  ):OAuth1SecuritySchemeSettings{
             return <OAuth1SecuritySchemeSettings>super.element('settings');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OAuth1SecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "OAuth1SecurityScheme";}
}


/**
 * Declares globally referable security schema definition
 **/
export class BasicSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements BasicSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createBasicSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BasicSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BasicSecurityScheme";}
}


/**
 * Declares globally referable security schema definition
 **/
export class DigestSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements DigestSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDigestSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DigestSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DigestSecurityScheme";}
}


/**
 * Declares globally referable security schema definition
 **/
export class CustomSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements CustomSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createCustomSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "CustomSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "CustomSecurityScheme";}
}

export class MethodImpl extends MethodBaseImpl implements Method{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createMethod(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Method that can be called
         **/
method(  ):string{
             return <string>super.attribute('method', this.toString);
         }


        /**
         * @hidden
         * Set method value
         **/
setMethod( param:string ){
            this.highLevel().attrOrCreate("method").setValue(""+param);
            return this;
        }


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]{
             return <TraitRef[]>super.attributes('is', (attr:hl.IAttribute)=>new TraitRefImpl(attr));
         }


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('baseUriParameters');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "MethodImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Method";}


        /**
         * For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
         **/
parentResource(  ):Resource{
            return helper.parentResource(this);
        }


        /**
         * Api owning the resource as a sibling
         **/
ownerApi(  ):Api{
            return helper.ownerApi(this);
        }


        /**
         * For methods of Resources: `{parent Resource relative path} {methodName}`.
         * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
         * For other methods throws Exception.
         **/
methodId(  ):string{
            return helper.methodId(this);
        }


        /**
         * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
         * returns schemes defined with `securedBy` at API level.
         * @deprecated
         **/
allSecuredBy(  ):SecuritySchemeRef[]{
            return helper.allSecuredBy(this);
        }
}

export class TraitImpl extends MethodBaseImpl implements Trait{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createTrait(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Name of the trait
         **/
name(  ):string{
             return <string>super.attribute('name', this.toString);
         }


        /**
         * @hidden
         * Set name value
         **/
setName( param:string ){
            this.highLevel().attrOrCreate("name").setValue(""+param);
            return this;
        }


        /**
         * Instructions on how and when the trait should be used.
         **/
usage(  ):string{
             return <string>super.attribute('usage', this.toString);
         }


        /**
         * @hidden
         * Set usage value
         **/
setUsage( param:string ){
            this.highLevel().attrOrCreate("usage").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TraitImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Trait";}

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }
}

export class ResourceTypeRefImpl extends ReferenceImpl implements ResourceTypeRef{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ResourceTypeRefImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ResourceTypeRef";}

resourceType(  ):ResourceType{
            return helper.referencedResourceType(this);
        }
}

export class ResourceTypeImpl extends RAMLLanguageElementImpl implements ResourceType{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResourceType(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Name of the resource type
         **/
name(  ):string{
             return <string>super.attribute('name', this.toString);
         }


        /**
         * @hidden
         * Set name value
         **/
setName( param:string ){
            this.highLevel().attrOrCreate("name").setValue(""+param);
            return this;
        }


        /**
         * Instructions on how and when the resource type should be used.
         **/
usage(  ):string{
             return <string>super.attribute('usage', this.toString);
         }


        /**
         * @hidden
         * Set usage value
         **/
setUsage( param:string ){
            this.highLevel().attrOrCreate("usage").setValue(""+param);
            return this;
        }


        /**
         * Methods that are part of this resource type definition
         **/
methods(  ):Method[]{
             return <Method[]>super.elements('methods');
         }


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]{
             return <TraitRef[]>super.attributes('is', (attr:hl.IAttribute)=>new TraitRefImpl(attr));
         }


        /**
         * Instantiation of applyed resource type
         **/
"type"(  ):ResourceTypeRef{
             return <ResourceTypeRef>super.attribute('type', (attr:hl.IAttribute)=>new ResourceTypeRefImpl(attr));
         }


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * Uri parameters of this resource
         **/
uriParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('uriParameters');
         }


        /**
         * An alternate, human-friendly name for the resource type
         **/
displayName(  ):string{
             return <string>super.attribute('displayName', this.toString);
         }


        /**
         * @hidden
         * Set displayName value
         **/
setDisplayName( param:string ){
            this.highLevel().attrOrCreate("displayName").setValue(""+param);
            return this;
        }


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('baseUriParameters');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ResourceTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ResourceType";}

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }
}


/**
 * This type currently serves both for absolute and relative urls
 **/
export class UriTemplateImpl extends StringTypeImpl implements UriTemplate{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "UriTemplateImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "UriTemplate";}
}


/**
 * This  type describes relative uri templates
 **/
export class RelativeUriStringImpl extends UriTemplateImpl implements RelativeUriString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "RelativeUriStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "RelativeUriString";}
}


/**
 * This  type describes absolute uri templates
 **/
export class FullUriTemplateStringImpl extends UriTemplateImpl implements FullUriTemplateString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FullUriTemplateStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FullUriTemplateString";}
}


/**
 * This sub type of the string represents mime types
 **/
export class MimeTypeImpl extends StringTypeImpl implements MimeType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "MimeTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "MimeType";}
}


/**
 * Mardown string is a string which can contain markdown as an extension this markdown should support links with RAML Pointers since 1.0
 **/
export class MarkdownStringImpl extends StringTypeImpl implements MarkdownString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "MarkdownStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "MarkdownString";}
}

export class ResourceImpl extends RAMLLanguageElementImpl implements Resource{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResource(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Relative URL of this resource from the parent resource
         **/
relativeUri(  ):RelativeUriString{
             return <RelativeUriString>super.attribute('relativeUri', (attr:hl.IAttribute)=>new RelativeUriStringImpl(attr));
         }


        /**
         * Instantiation of applyed resource type
         **/
"type"(  ):ResourceTypeRef{
             return <ResourceTypeRef>super.attribute('type', (attr:hl.IAttribute)=>new ResourceTypeRefImpl(attr));
         }


        /**
         * Instantiation of applyed traits
         **/
is(  ):TraitRef[]{
             return <TraitRef[]>super.attributes('is', (attr:hl.IAttribute)=>new TraitRefImpl(attr));
         }


        /**
         * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * Uri parameters of this resource
         * @hidden
         **/
uriParameters_original(  ):Parameter[]{
             return <Parameter[]>super.elements('uriParameters');
         }


        /**
         * Methods that can be called on this resource
         **/
methods(  ):Method[]{
             return <Method[]>super.elements('methods');
         }


        /**
         * Children resources
         **/
resources(  ):Resource[]{
             return <Resource[]>super.elements('resources');
         }


        /**
         * An alternate, human-friendly name for the resource
         **/
displayName(  ):string{
             return <string>super.attribute('displayName', this.toString);
         }


        /**
         * @hidden
         * Set displayName value
         **/
setDisplayName( param:string ){
            this.highLevel().attrOrCreate("displayName").setValue(""+param);
            return this;
        }


        /**
         * A resource or a method can override a base URI template's values. This is useful to restrict or change the default or parameter selection in the base URI. The baseUriParameters property MAY be used to override any or all parameters defined at the root level baseUriParameters property, as well as base URI parameters not specified at the root level.
         **/
baseUriParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('baseUriParameters');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ResourceImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Resource";}


        /**
         * Path relative to API root
         **/
completeRelativeUri(  ):string{
            return helper.completeRelativeUri(this);
        }


        /**
         * baseUri of owning Api concatenated with completeRelativeUri
         **/
absoluteUri(  ):string{
            return helper.absoluteUri(this);
        }


        /**
         * Parent resource for non top level resources
         **/
parentResource(  ):Resource{
            return helper.parent(this);
        }


        /**
         * Get child resource by its relative path
         **/
childResource( relPath:string ):Resource{
            return helper.childResource(this, relPath);
        }


        /**
         * Get child method by its name
         **/
childMethod( method:string ):Method[]{
            return helper.childMethod(this, method);
        }


        /**
         * Api owning the resource as a sibling
         **/
ownerApi(  ):Api{
            return helper.ownerApi(this);
        }


        /**
         * Uri parameters of this resource
         **/
uriParameters(  ):Parameter[]{
            return helper.uriParametersPrimary(this);
        }


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
allUriParameters(  ):Parameter[]{
            return helper.uriParameters(this);
        }


        /**
         * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.allBaseUriParameters()`
         * for `Api` owning the `Resource` and `Resource.allUriParameters()`.
         **/
absoluteUriParameters(  ):Parameter[]{
            return helper.absoluteUriParameters(this);
        }


        /**
         * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
         * returns schemes defined with `securedBy` at API level.
         * @deprecated
         **/
allSecuredBy(  ):SecuritySchemeRef[]{
            return helper.allSecuredBy(this);
        }
}

export class ApiImpl extends RAMLLanguageElementImpl implements Api{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createApi(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The title property is a short plain text description of the RESTful API. The value SHOULD be suitable for use as a title for the contained user documentation.
         **/
title(  ):string{
             return <string>super.attribute('title', this.toString);
         }


        /**
         * @hidden
         * Set title value
         **/
setTitle( param:string ){
            this.highLevel().attrOrCreate("title").setValue(""+param);
            return this;
        }


        /**
         * If the RAML API definition is targeted to a specific API version, the API definition MUST contain a version property. The version property is OPTIONAL and should not be used if: The API itself is not versioned. The API definition does not change between versions. The API architect can decide whether a change to user documentation elements, but no change to the API's resources, constitutes a version change. The API architect MAY use any versioning scheme so long as version numbers retain the same format. For example, 'v3', 'v3.0', and 'V3' are all allowed, but are not considered to be equal.
         **/
version(  ):string{
             return <string>super.attribute('version', this.toString);
         }


        /**
         * @hidden
         * Set version value
         **/
setVersion( param:string ){
            this.highLevel().attrOrCreate("version").setValue(""+param);
            return this;
        }


        /**
         * (Optional during development; Required after implementation) A RESTful API's resources are defined relative to the API's base URI. The use of the baseUri field is OPTIONAL to allow describing APIs that have not yet been implemented. After the API is implemented (even a mock implementation) and can be accessed at a service endpoint, the API definition MUST contain a baseUri property. The baseUri property's value MUST conform to the URI specification RFC2396 or a Level 1 Template URI as defined in RFC6570. The baseUri property SHOULD only be used as a reference value.
         **/
baseUri(  ):FullUriTemplateString{
             return <FullUriTemplateString>super.attribute('baseUri', (attr:hl.IAttribute)=>new FullUriTemplateStringImpl(attr));
         }


        /**
         * Base uri parameters are named parameters which described template parameters in the base uri
         * @hidden
         **/
baseUriParameters_original(  ):Parameter[]{
             return <Parameter[]>super.elements('baseUriParameters');
         }


        /**
         * URI parameters can be further defined by using the uriParameters property. The use of uriParameters is OPTIONAL. The uriParameters property MUST be a map in which each key MUST be the name of the URI parameter as defined in the baseUri property. The uriParameters CANNOT contain a key named version because it is a reserved URI parameter name. The value of the uriParameters property is itself a map that specifies  the property's attributes as named parameters
         **/
uriParameters(  ):Parameter[]{
             return <Parameter[]>super.elements('uriParameters');
         }


        /**
         * A RESTful API can be reached HTTP, HTTPS, or both. The protocols property MAY be used to specify the protocols that an API supports. If the protocols property is not specified, the protocol specified at the baseUri property is used. The protocols property MUST be an array of strings, of values `HTTP` and/or `HTTPS`.
         **/
protocols(  ):string[]{
             return <string[]>super.attributes('protocols', this.toString);
         }


        /**
         * @hidden
         * Set protocols value
         **/
setProtocols( param:string ){
            this.highLevel().attrOrCreate("protocols").setValue(""+param);
            return this;
        }


        /**
         * (Optional) The media types returned by API responses, and expected from API requests that accept a body, MAY be defaulted by specifying the mediaType property. This property is specified at the root level of the API definition. The property's value MAY be a single string with a valid media type described in the specification.
         **/
mediaType(  ):MimeType{
             return <MimeType>super.attribute('mediaType', (attr:hl.IAttribute)=>new MimeTypeImpl(attr));
         }


        /**
         * To better achieve consistency and simplicity, the API definition SHOULD include an OPTIONAL schemas property in the root section. The schemas property specifies collections of schemas that could be used anywhere in the API definition. The value of the schemas property is an array of maps; in each map, the keys are the schema name, and the values are schema definitions. The schema definitions MAY be included inline or by using the RAML !include user-defined data type.
         **/
schemas(  ):GlobalSchema[]{
             return <GlobalSchema[]>super.elements('schemas');
         }


        /**
         * Declarations of traits used in this API
         * @hidden
         **/
traits_original(  ):Trait[]{
             return <Trait[]>super.elements('traits');
         }


        /**
         * A list of the security schemes to apply to all methods, these must be defined in the securitySchemes declaration.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * Security schemes that can be applied using securedBy
         **/
securitySchemes(  ):AbstractSecurityScheme[]{
             return <AbstractSecurityScheme[]>super.elements('securitySchemes');
         }


        /**
         * Declaration of resource types used in this API
         * @hidden
         **/
resourceTypes_original(  ):ResourceType[]{
             return <ResourceType[]>super.elements('resourceTypes');
         }


        /**
         * Resources are identified by their relative URI, which MUST begin with a slash (/). A resource defined as a root-level property is called a top-level resource. Its property's key is the resource's URI relative to the baseUri. A resource defined as a child property of another resource is called a nested resource, and its property's key is its URI relative to its parent resource's URI. Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property. The key of a resource, i.e. its relative URI, MAY consist of multiple URI path fragments separated by slashes; e.g. `/bom/items` may indicate the collection of items in a bill of materials as a single resource. However, if the individual URI path fragments are themselves resources, the API definition SHOULD use nested resources to describe this structure; e.g. if `/bom` is itself a resource then `/items` should be a nested resource of `/bom`, while `/bom/items` should not be used.
         **/
resources(  ):Resource[]{
             return <Resource[]>super.elements('resources');
         }


        /**
         * The API definition can include a variety of documents that serve as a user guides and reference documentation for the API. Such documents can clarify how the API works or provide business context. Documentation-generators MUST include all the sections in an API definition's documentation property in the documentation output, and they MUST preserve the order in which the documentation is declared. To add user documentation to the API, include the documentation property at the root of the API definition. The documentation property MUST be an array of documents. Each document MUST contain title and content attributes, both of which are REQUIRED. If the documentation property is specified, it MUST include at least one document. Documentation-generators MUST process the content field as if it was defined using Markdown.
         **/
documentation(  ):DocumentationItem[]{
             return <DocumentationItem[]>super.elements('documentation');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ApiImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Api";}


        /**
         * Equivalent API with traits and resource types expanded
         **/
expand(  ):Api{
            return helper.expandTraitsAndResourceTypes(this);
        }


        /**
         * Declarations of traits used in this API
         **/
traits(  ):Trait[]{
            return helper.traitsPrimary(this);
        }


        /**
         * Retrieve all traits including those defined in libraries *
         * @deprecated
         **/
allTraits(  ):Trait[]{
            return helper.allTraits(this);
        }


        /**
         * Declaration of resource types used in this API
         **/
resourceTypes(  ):ResourceType[]{
            return helper.resourceTypesPrimary(this);
        }


        /**
         * Retrieve all resource types including those defined in libraries
         * @deprecated
         **/
allResourceTypes(  ):ResourceType[]{
            return helper.allResourceTypes(this);
        }


        /**
         * Get child resource by its relative path
         **/
childResource( relPath:string ):Resource{
            return helper.childResource(this, relPath);
        }


        /**
         * Retrieve all resources of the Api
         **/
allResources(  ):Resource[]{
            return helper.allResources(this);
        }


        /**
         * Base uri parameters are named parameters which described template parameters in the base uri
         **/
baseUriParameters(  ):Parameter[]{
            return helper.baseUriParametersPrimary(this);
        }


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
allBaseUriParameters(  ):Parameter[]{
            return helper.baseUriParameters(this);
        }


        /**
         * Protocols used by the API. Returns the `protocols` property value if it is specified.
         * Otherwise, returns protocol, specified in the base URI.
         * @deprecated
         **/
allProtocols(  ):string[]{
            return helper.allProtocols(this);
        }

RAMLVersion(  ):string{
            return helper.RAMLVersion(this);
        }
}

export class RAMLSimpleElementImpl extends core.BasicNodeImpl implements RAMLSimpleElement{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "RAMLSimpleElementImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "RAMLSimpleElement";}
}

export class DocumentationItemImpl extends RAMLSimpleElementImpl implements DocumentationItem{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDocumentationItem(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * title of documentation section
         **/
title(  ):string{
             return <string>super.attribute('title', this.toString);
         }


        /**
         * @hidden
         * Set title value
         **/
setTitle( param:string ){
            this.highLevel().attrOrCreate("title").setValue(""+param);
            return this;
        }


        /**
         * Content of documentation section
         **/
content(  ):MarkdownString{
             return <MarkdownString>super.attribute('content', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DocumentationItemImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DocumentationItem";}
}


/**
 * Content of the schema
 **/
export class GlobalSchemaImpl extends RAMLSimpleElementImpl implements GlobalSchema{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createGlobalSchema(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Name of the global schema, used to refer on schema content
         **/
key(  ):string{
             return <string>super.attribute('key', this.toString);
         }


        /**
         * @hidden
         * Set key value
         **/
setKey( param:string ){
            this.highLevel().attrOrCreate("key").setValue(""+param);
            return this;
        }


        /**
         * Content of the schema
         **/
value(  ):SchemaString{
             return <SchemaString>super.attribute('value', (attr:hl.IAttribute)=>new SchemaStringImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "GlobalSchemaImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "GlobalSchema";}
}

/**
 * @hidden
 **/
function createApi(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Api");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createRAMLLanguageElement(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("RAMLLanguageElement");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTypeInstance(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("TypeInstance");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTypeInstanceProperty(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("TypeInstanceProperty");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTrait(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Trait");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createMethodBase(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("MethodBase");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createHasNormalParameters(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("HasNormalParameters");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createParameter(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Parameter");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createStringTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("StringTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createBooleanTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("BooleanTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createNumberTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("NumberTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createIntegerTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("IntegerTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDateTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("DateTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createFileTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("FileTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResponse(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Response");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createBodyLike(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("BodyLike");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createXMLBody(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("XMLBody");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createJSONBody(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("JSONBody");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createAbstractSecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("AbstractSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createSecuritySchemePart(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("SecuritySchemePart");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createSecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth1SecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("OAuth1SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth2SecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("OAuth2SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth2SecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("OAuth2SecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth1SecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("OAuth1SecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createBasicSecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("BasicSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDigestSecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("DigestSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createCustomSecurityScheme(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("CustomSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createMethod(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Method");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResourceType(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("ResourceType");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResource(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("Resource");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createGlobalSchema(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("GlobalSchema");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createRAMLSimpleElement(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("RAMLSimpleElement");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDocumentationItem(key:string){
    var universe=def.getUniverse("RAML08");
    var nc=<def.NodeClass>universe.type("DocumentationItem");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, options?:coreApi.Options):Api

export function loadApiSync(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Api{

        return <Api>apiLoader.loadApi(apiPath,arg1,arg2).getOrElse(null);
}


export function loadRAMLSync(ramlPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):hl.BasicNode{

        return <any>apiLoader.loadApi(ramlPath,arg1,arg2).getOrElse(null);
}

/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string, options?:coreApi.Options):Promise<Api>;

export function loadApi(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Promise<Api>{

        return apiLoader.loadApiAsync(apiPath,arg1,arg2);
}


export function loadRAML(ramlPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Promise<hl.BasicNode>{

        return apiLoader.loadRAMLAsync(ramlPath,arg1,arg2);
}

/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export function getLanguageElementByRuntimeType(runtimeType : hl.ITypeDefinition) : core.BasicNode {
    return apiLoader.getLanguageElementByRuntimeType(runtimeType);
}
