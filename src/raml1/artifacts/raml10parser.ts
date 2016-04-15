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
import stubs=require("../../raml1/stubs");
import hlImpl=require("../../raml1/highLevelImpl");
import jsyaml=require("../../raml1/jsyaml/jsyaml2lowLevel");
import json2lowlevel = require('../../raml1/jsyaml/json2lowLevel');
import def=require("raml-definition-system");
import services=require("../../raml1/definition-system/ramlServices");
import core=require("../../raml1/wrapped-ast/parserCore");
import apiLoader=require("../../raml1/apiLoader");
import coreApi=require("../../raml1/wrapped-ast/parserCoreApi");
import pApi = require("./raml10parserapi");
import helper=require("../../raml1/wrapped-ast/wrapperHelper")

import Api = pApi.Api;
import LibraryBase = pApi.LibraryBase;
import Annotable = pApi.Annotable;
import AnnotationRef = pApi.AnnotationRef;
import Reference = pApi.Reference;
import ValueType = pApi.ValueType;
import StringType = pApi.StringType;
import UriTemplate = pApi.UriTemplate;
import RelativeUriString = pApi.RelativeUriString;
import FullUriTemplateString = pApi.FullUriTemplateString;
import StatusCodeString = pApi.StatusCodeString;
import FixedUriString = pApi.FixedUriString;
import ContentType = pApi.ContentType;
import MarkdownString = pApi.MarkdownString;
import SchemaString = pApi.SchemaString;
import MimeType = pApi.MimeType;
import AnyType = pApi.AnyType;
import NumberType = pApi.NumberType;
import BooleanType = pApi.BooleanType;
import AnnotationTarget = pApi.AnnotationTarget;
import TypeInstance = pApi.TypeInstance;
import TypeInstanceProperty = pApi.TypeInstanceProperty;
import TraitRef = pApi.TraitRef;
import Trait = pApi.Trait;
import MethodBase = pApi.MethodBase;
import HasNormalParameters = pApi.HasNormalParameters;
import TypeDeclaration = pApi.TypeDeclaration;
import ModelLocation = pApi.ModelLocation;
import LocationKind = pApi.LocationKind;
import XMLFacetInfo = pApi.XMLFacetInfo;
import ArrayTypeDeclaration = pApi.ArrayTypeDeclaration;
import UnionTypeDeclaration = pApi.UnionTypeDeclaration;
import ObjectTypeDeclaration = pApi.ObjectTypeDeclaration;
import StringTypeDeclaration = pApi.StringTypeDeclaration;
import BooleanTypeDeclaration = pApi.BooleanTypeDeclaration;
import NumberTypeDeclaration = pApi.NumberTypeDeclaration;
import IntegerTypeDeclaration = pApi.IntegerTypeDeclaration;
import DateOnlyTypeDeclaration = pApi.DateOnlyTypeDeclaration;
import TimeOnlyTypeDeclaration = pApi.TimeOnlyTypeDeclaration;
import DateTimeOnlyTypeDeclaration = pApi.DateTimeOnlyTypeDeclaration;
import DateTimeTypeDeclaration = pApi.DateTimeTypeDeclaration;
import DateTypeDeclaration = pApi.DateTypeDeclaration;
import FileTypeDeclaration = pApi.FileTypeDeclaration;
import SecuritySchemePart = pApi.SecuritySchemePart;
import Response = pApi.Response;
import SecuritySchemeRef = pApi.SecuritySchemeRef;
import AbstractSecurityScheme = pApi.AbstractSecurityScheme;
import SecuritySchemeSettings = pApi.SecuritySchemeSettings;
import OAuth1SecuritySchemeSettings = pApi.OAuth1SecuritySchemeSettings;
import OAuth2SecuritySchemeSettings = pApi.OAuth2SecuritySchemeSettings;
import OAuth2SecurityScheme = pApi.OAuth2SecurityScheme;
import OAuth1SecurityScheme = pApi.OAuth1SecurityScheme;
import PassThroughSecurityScheme = pApi.PassThroughSecurityScheme;
import BasicSecurityScheme = pApi.BasicSecurityScheme;
import DigestSecurityScheme = pApi.DigestSecurityScheme;
import CustomSecurityScheme = pApi.CustomSecurityScheme;
import Method = pApi.Method;
import ResourceTypeRef = pApi.ResourceTypeRef;
import ResourceType = pApi.ResourceType;
import ResourceBase = pApi.ResourceBase;
import Resource = pApi.Resource;
import UsesDeclaration = pApi.UsesDeclaration;
import FragmentDeclaration = pApi.FragmentDeclaration;
import DocumentationItem = pApi.DocumentationItem;
import ExampleSpec = pApi.ExampleSpec;
import Library = pApi.Library;
import Overlay = pApi.Overlay;
import Extension = pApi.Extension;
export class AnnotableImpl extends core.BasicNodeImpl implements Annotable{

        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "AnnotableImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Annotable";}
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


/**
 * This  type describes fixed uris
 **/
export class FixedUriStringImpl extends StringTypeImpl implements FixedUriString{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FixedUriStringImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FixedUriString";}
}

export class ContentTypeImpl extends StringTypeImpl implements ContentType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ContentTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ContentType";}
}


/**
 * [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
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


/**
 * Elements to which this Annotation can be applied (enum)
 **/
export class AnnotationTargetImpl extends ValueTypeImpl implements AnnotationTarget{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "AnnotationTargetImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "AnnotationTarget";}
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

export class HasNormalParametersImpl extends AnnotableImpl implements HasNormalParameters{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createHasNormalParameters(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming  a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
         **/
queryParameters(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('queryParameters');
         }


        /**
         * Headers that allowed at this position
         **/
headers(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('headers');
         }


        /**
         * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
         **/
queryString(  ):TypeDeclaration{
             return <TypeDeclaration>super.element('queryString');
         }

description(  ):string{
             return <string>super.attribute('description', this.toString);
         }


        /**
         * @hidden
         * Set description value
         **/
setDescription( param:string ){
            this.highLevel().attrOrCreate("description").setValue(""+param);
            return this;
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

export class TypeDeclarationImpl extends AnnotableImpl implements TypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * The displayName attribute specifies the type display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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
         * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
         **/
facets(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('facets');
         }


        /**
         * Alias for the equivalent "type" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "type" property, as the "schema" alias for that property name may be removed in a future RAML version. The "type" property allows for XML and JSON schemas.
         **/
schema(  ):string{
             return <string>super.attribute('schema', this.toString);
         }


        /**
         * @hidden
         * Set schema value
         **/
setSchema( param:string ){
            this.highLevel().attrOrCreate("schema").setValue(""+param);
            return this;
        }


        /**
         * A base type which the current type extends, or more generally a type expression.
         **/
"type"(  ):string[]{
             return <string[]>super.attributes('type', this.toString);
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
location(  ):ModelLocation{
             return <ModelLocation>super.attribute('location', (attr:hl.IAttribute)=>new ModelLocationImpl(attr));
         }


        /**
         * Kind of location
         **/
locationKind(  ):LocationKind{
             return <LocationKind>super.attribute('locationKind', (attr:hl.IAttribute)=>new LocationKindImpl(attr));
         }


        /**
         * Provides default value for a property
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
         * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
         * @hidden
         **/
example_original(  ):any{
             return <any>super.attribute('example', this.toAny);
         }


        /**
         * @hidden
         * Set example value
         **/
setExample( param:any ){
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
         * Sets if property is optional or not
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
         * A longer, human-friendly description of the type
         **/
description(  ):string{
             return <string>super.attribute('description', this.toString);
         }


        /**
         * @hidden
         * Set description value
         **/
setDescription( param:string ){
            this.highLevel().attrOrCreate("description").setValue(""+param);
            return this;
        }

xml(  ):XMLFacetInfo{
             return <XMLFacetInfo>super.element('xml');
         }


        /**
         * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
         **/
allowedTargets(  ):AnnotationTarget[]{
             return <AnnotationTarget[]>super.attributes('allowedTargets', (attr:hl.IAttribute)=>new AnnotationTargetImpl(attr));
         }


        /**
         * Whether the type represents annotation
         **/
isAnnotation(  ):boolean{
             return <boolean>super.attribute('isAnnotation', this.toBoolean);
         }


        /**
         * @hidden
         * Set isAnnotation value
         **/
setIsAnnotation( param:boolean ){
            this.highLevel().attrOrCreate("isAnnotation").setValue(""+param);
            return this;
        }


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "TypeDeclaration";}


        /**
         * Runtime representation of type represented by this AST node
         **/
runtimeType(  ):hl.ITypeDefinition{
            return helper.runtimeType(this);
        }


        /**
         * validate an instance against type
         **/
validateInstance( value:any ):string[]{
            return helper.validateInstance(this, value);
        }


        /**
         * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
         **/
example(  ):string{
            return helper.getTypeExample(this);
        }

structuredExample(  ):TypeInstance{
            return helper.getTypeStructuredExample(this);
        }

fixedFacets(  ):TypeInstance{
            return helper.typeFixedFacets(this);
        }

schemaContent(  ):string{
            return helper.schemaContent(this);
        }
}

export class ModelLocationImpl implements ModelLocation{
constructor( protected attr:hl.IAttribute ){}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ModelLocationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ModelLocation";}
}

export class LocationKindImpl implements LocationKind{
constructor( protected attr:hl.IAttribute ){}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "LocationKindImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "LocationKind";}
}

export class XMLFacetInfoImpl extends AnnotableImpl implements XMLFacetInfo{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createXMLFacetInfo(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * If attribute is set to true, a type instance should be serialized as an XML attribute. It can only be true for scalar types.
         **/
attribute(  ):boolean{
             return <boolean>super.attribute('attribute', this.toBoolean);
         }


        /**
         * @hidden
         * Set attribute value
         **/
setAttribute( param:boolean ){
            this.highLevel().attrOrCreate("attribute").setValue(""+param);
            return this;
        }


        /**
         * If wrapped is set to true, a type instance should be wrapped in its own XML element. It can not be true for scalar types and it can not be true at the same moment when attribute is true.
         **/
wrapped(  ):boolean{
             return <boolean>super.attribute('wrapped', this.toBoolean);
         }


        /**
         * @hidden
         * Set wrapped value
         **/
setWrapped( param:boolean ){
            this.highLevel().attrOrCreate("wrapped").setValue(""+param);
            return this;
        }


        /**
         * Allows to override the name of the XML element or XML attribute in it's XML representation.
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
         * Allows to configure the name of the XML namespace.
         **/
namespace(  ):string{
             return <string>super.attribute('namespace', this.toString);
         }


        /**
         * @hidden
         * Set namespace value
         **/
setNamespace( param:string ){
            this.highLevel().attrOrCreate("namespace").setValue(""+param);
            return this;
        }


        /**
         * Allows to configure the prefix which will be used during serialization to XML.
         **/
prefix(  ):string{
             return <string>super.attribute('prefix', this.toString);
         }


        /**
         * @hidden
         * Set prefix value
         **/
setPrefix( param:string ){
            this.highLevel().attrOrCreate("prefix").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "XMLFacetInfoImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "XMLFacetInfo";}
}

export class ArrayTypeDeclarationImpl extends TypeDeclarationImpl implements ArrayTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createArrayTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Should items in array be unique
         **/
uniqueItems(  ):boolean{
             return <boolean>super.attribute('uniqueItems', this.toBoolean);
         }


        /**
         * @hidden
         * Set uniqueItems value
         **/
setUniqueItems( param:boolean ){
            this.highLevel().attrOrCreate("uniqueItems").setValue(""+param);
            return this;
        }


        /**
         * Array component type.
         **/
items(  ):TypeDeclaration{
             return <TypeDeclaration>super.element('items');
         }


        /**
         * Minimum amount of items in array
         **/
minItems(  ):number{
             return <number>super.attribute('minItems', this.toNumber);
         }


        /**
         * @hidden
         * Set minItems value
         **/
setMinItems( param:number ){
            this.highLevel().attrOrCreate("minItems").setValue(""+param);
            return this;
        }


        /**
         * Maximum amount of items in array
         **/
maxItems(  ):number{
             return <number>super.attribute('maxItems', this.toNumber);
         }


        /**
         * @hidden
         * Set maxItems value
         **/
setMaxItems( param:number ){
            this.highLevel().attrOrCreate("maxItems").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ArrayTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ArrayTypeDeclaration";}
}

export class UnionTypeDeclarationImpl extends TypeDeclarationImpl implements UnionTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createUnionTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "UnionTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "UnionTypeDeclaration";}
}

export class ObjectTypeDeclarationImpl extends TypeDeclarationImpl implements ObjectTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createObjectTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The properties that instances of this type may or must have.
         **/
properties(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('properties');
         }


        /**
         * The minimum number of properties allowed for instances of this type.
         **/
minProperties(  ):number{
             return <number>super.attribute('minProperties', this.toNumber);
         }


        /**
         * @hidden
         * Set minProperties value
         **/
setMinProperties( param:number ){
            this.highLevel().attrOrCreate("minProperties").setValue(""+param);
            return this;
        }


        /**
         * The maximum number of properties allowed for instances of this type.
         **/
maxProperties(  ):number{
             return <number>super.attribute('maxProperties', this.toNumber);
         }


        /**
         * @hidden
         * Set maxProperties value
         **/
setMaxProperties( param:number ){
            this.highLevel().attrOrCreate("maxProperties").setValue(""+param);
            return this;
        }


        /**
         * JSON schema style syntax for declaring maps
         **/
additionalProperties(  ):TypeDeclaration{
             return <TypeDeclaration>super.element('additionalProperties');
         }


        /**
         * JSON schema style syntax for declaring key restricted maps
         **/
patternProperties(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('patternProperties');
         }


        /**
         * Type property name to be used as discriminator, or boolean
         **/
discriminator(  ):string{
             return <string>super.attribute('discriminator', this.toString);
         }


        /**
         * @hidden
         * Set discriminator value
         **/
setDiscriminator( param:string ){
            this.highLevel().attrOrCreate("discriminator").setValue(""+param);
            return this;
        }


        /**
         * The value of discriminator for the type.
         **/
discriminatorValue(  ):string{
             return <string>super.attribute('discriminatorValue', this.toString);
         }


        /**
         * @hidden
         * Set discriminatorValue value
         **/
setDiscriminatorValue( param:string ){
            this.highLevel().attrOrCreate("discriminatorValue").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ObjectTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ObjectTypeDeclaration";}
}


/**
 * Value must be a string
 **/
export class StringTypeDeclarationImpl extends TypeDeclarationImpl implements StringTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createStringTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Regular expression that this string should path
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
         * Minimum length of the string
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
         * Maximum length of the string
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
export class BooleanTypeDeclarationImpl extends TypeDeclarationImpl implements BooleanTypeDeclaration{
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
export class NumberTypeDeclarationImpl extends TypeDeclarationImpl implements NumberTypeDeclaration{
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
         * Value format
         **/
format(  ):string{
             return <string>super.attribute('format', this.toString);
         }


        /**
         * @hidden
         * Set format value
         **/
setFormat( param:string ){
            this.highLevel().attrOrCreate("format").setValue(""+param);
            return this;
        }


        /**
         * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
         **/
multipleOf(  ):number{
             return <number>super.attribute('multipleOf', this.toNumber);
         }


        /**
         * @hidden
         * Set multipleOf value
         **/
setMultipleOf( param:number ){
            this.highLevel().attrOrCreate("multipleOf").setValue(""+param);
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
         * Value format
         **/
format(  ):string{
             return <string>super.attribute('format', this.toString);
         }


        /**
         * @hidden
         * Set format value
         **/
setFormat( param:string ){
            this.highLevel().attrOrCreate("format").setValue(""+param);
            return this;
        }


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
 * the "full-date" notation of RFC3339, namely yyyy-mm-dd (no implications about time or timezone-offset)
 **/
export class DateOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements DateOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDateOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateOnlyTypeDeclaration";}
}


/**
 * the "partial-time" notation of RFC3339, namely hh:mm:ss[.ff...] (no implications about date or timezone-offset)
 **/
export class TimeOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements TimeOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createTimeOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TimeOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "TimeOnlyTypeDeclaration";}
}


/**
 * combined date-only and time-only with a separator of "T", namely yyyy-mm-ddThh:mm:ss[.ff...] (no implications about timezone-offset)
 **/
export class DateTimeOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements DateTimeOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDateTimeOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTimeOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTimeOnlyTypeDeclaration";}
}


/**
 * a timestamp, either in the "date-time" notation of RFC3339, if format is omitted or is set to rfc3339, or in the format defined in RFC2616, if format is set to rfc2616.
 **/
export class DateTimeTypeDeclarationImpl extends TypeDeclarationImpl implements DateTimeTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDateTimeTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Format used for this date time rfc3339 or rfc2616
         **/
format(  ):string{
             return <string>super.attribute('format', this.toString);
         }


        /**
         * @hidden
         * Set format value
         **/
setFormat( param:string ){
            this.highLevel().attrOrCreate("format").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTimeTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTimeTypeDeclaration";}
}


/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3, or according to specified date format
 **/
export class DateTypeDeclarationImpl extends TypeDeclarationImpl implements DateTypeDeclaration{
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
export class FileTypeDeclarationImpl extends TypeDeclarationImpl implements FileTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createFileTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
         **/
fileTypes(  ):ContentType[]{
             return <ContentType[]>super.attributes('fileTypes', (attr:hl.IAttribute)=>new ContentTypeImpl(attr));
         }


        /**
         * The minLength attribute specifies the parameter value's minimum number of bytes.
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
         * The maxLength attribute specifies the parameter value's maximum number of bytes.
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
wrapperClassName(  ):string{return "FileTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FileTypeDeclaration";}
}

export class SecuritySchemePartImpl extends HasNormalParametersImpl implements SecuritySchemePart{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createSecuritySchemePart(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Information about the expected responses to a request
         **/
responses(  ):Response[]{
             return <Response[]>super.elements('responses');
         }


        /**
         * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name.
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
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

export class ResponseImpl extends AnnotableImpl implements Response{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResponse(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
         **/
code(  ):StatusCodeString{
             return <StatusCodeString>super.attribute('code', (attr:hl.IAttribute)=>new StatusCodeStringImpl(attr));
         }


        /**
         * Detailed information about any response headers returned by this method
         **/
headers(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('headers');
         }


        /**
         * The body of the response: a body declaration
         **/
body(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('body');
         }


        /**
         * A longer, human-friendly description of the response
         **/
description(  ):string{
             return <string>super.attribute('description', this.toString);
         }


        /**
         * @hidden
         * Set description value
         **/
setDescription( param:string ){
            this.highLevel().attrOrCreate("description").setValue(""+param);
            return this;
        }


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
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

export class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createMethodBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Information about the expected responses to a request
         **/
responses(  ):Response[]{
             return <Response[]>super.elements('responses');
         }


        /**
         * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create. Resources CAN have alternate representations. For example, an API might support both JSON and XML representations. A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
         **/
body(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('body');
         }


        /**
         * A method can override the protocols specified in the resource or at the API root, by employing this property.
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
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "MethodBaseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "MethodBase";}
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
 * Declares globally referable security scheme definition
 **/
export class AbstractSecuritySchemeImpl extends AnnotableImpl implements AbstractSecurityScheme{
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
         * The description MAY be used to describe a securityScheme.
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
         * The displayName attribute specifies the security scheme display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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

export class SecuritySchemeSettingsImpl extends AnnotableImpl implements SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createSecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
requestTokenUri(  ):FixedUriString{
             return <FixedUriString>super.attribute('requestTokenUri', (attr:hl.IAttribute)=>new FixedUriStringImpl(attr));
         }


        /**
         * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
         **/
authorizationUri(  ):FixedUriString{
             return <FixedUriString>super.attribute('authorizationUri', (attr:hl.IAttribute)=>new FixedUriStringImpl(attr));
         }


        /**
         * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
         **/
tokenCredentialsUri(  ):FixedUriString{
             return <FixedUriString>super.attribute('tokenCredentialsUri', (attr:hl.IAttribute)=>new FixedUriStringImpl(attr));
         }


        /**
         * List of the signature methods used by the server. Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT
         **/
signatures(  ):string[]{
             return <string[]>super.attributes('signatures', this.toString);
         }


        /**
         * @hidden
         * Set signatures value
         **/
setSignatures( param:string ){
            this.highLevel().attrOrCreate("signatures").setValue(""+param);
            return this;
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

export class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth2SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOAuth2SecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The URI of the Token Endpoint as defined in RFC6749 Section 3.2. Not required forby implicit grant type.
         **/
accessTokenUri(  ):FixedUriString{
             return <FixedUriString>super.attribute('accessTokenUri', (attr:hl.IAttribute)=>new FixedUriStringImpl(attr));
         }


        /**
         * The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1. Required forby authorization_code and implicit grant types.
         **/
authorizationUri(  ):FixedUriString{
             return <FixedUriString>super.attribute('authorizationUri', (attr:hl.IAttribute)=>new FixedUriStringImpl(attr));
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
 * Declares globally referable security scheme definition
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
 * Declares globally referable security scheme definition
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
 * Declares globally referable security scheme definition
 **/
export class PassThroughSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements PassThroughSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createPassThroughSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

settings(  ):SecuritySchemeSettings{
             return <SecuritySchemeSettings>super.element('settings');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "PassThroughSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "PassThroughSecurityScheme";}
}


/**
 * Declares globally referable security scheme definition
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
 * Declares globally referable security scheme definition
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
 * Declares globally referable security scheme definition
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
         * The displayName attribute specifies the method display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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
         * The displayName attribute specifies the trait display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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

export class ResourceBaseImpl extends AnnotableImpl implements ResourceBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResourceBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Methods that are part of this resource type definition
         **/
methods(  ):Method[]{
             return <Method[]>super.elements('methods');
         }


        /**
         * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. Individual methods may override this declaration
         **/
is(  ):TraitRef[]{
             return <TraitRef[]>super.attributes('is', (attr:hl.IAttribute)=>new TraitRefImpl(attr));
         }


        /**
         * The resource type which this resource inherits.
         **/
"type"(  ):ResourceTypeRef{
             return <ResourceTypeRef>super.attribute('type', (attr:hl.IAttribute)=>new ResourceTypeRefImpl(attr));
         }

description(  ):string{
             return <string>super.attribute('description', this.toString);
         }


        /**
         * @hidden
         * Set description value
         **/
setDescription( param:string ){
            this.highLevel().attrOrCreate("description").setValue(""+param);
            return this;
        }


        /**
         * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * Detailed information about any URI parameters of this resource
         * @hidden
         **/
uriParameters_original(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('uriParameters');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ResourceBaseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ResourceBase";}


        /**
         * Detailed information about any URI parameters of this resource
         **/
uriParameters(  ):TypeDeclaration[]{
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
         * but it is among Resource.allUriParameters().
         * @deprecated
         **/
allUriParameters(  ):TypeDeclaration[]{
            return helper.uriParameters(this);
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

export class ResourceImpl extends ResourceBaseImpl implements Resource{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResource(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Relative URL of this resource from the parent resource
         **/
relativeUri(  ):RelativeUriString{
             return <RelativeUriString>super.attribute('relativeUri', (attr:hl.IAttribute)=>new RelativeUriStringImpl(attr));
         }


        /**
         * The displayName attribute specifies the resource display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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
         * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
         **/
resources(  ):Resource[]{
             return <Resource[]>super.elements('resources');
         }


        /**
         * A longer, human-friendly description of the resource.
         **/
description(  ):string{
             return <string>super.attribute('description', this.toString);
         }


        /**
         * @hidden
         * Set description value
         **/
setDescription( param:string ){
            this.highLevel().attrOrCreate("description").setValue(""+param);
            return this;
        }


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
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
         * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
         * for `Api` owning the `Resource` and `Resource.uriParameters()`.
         **/
absoluteUriParameters(  ):TypeDeclaration[]{
            return helper.absoluteUriParameters(this);
        }
}

export class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createResourceType(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * The displayName attribute specifies the resource type display name. It is a friendly name used only for  display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
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
 * Annotations allow you to attach information to your API
 **/
export class AnnotationRefImpl extends ReferenceImpl implements AnnotationRef{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "AnnotationRefImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "AnnotationRef";}

annotation(  ):TypeDeclaration{
            return helper.referencedAnnotation(this);
        }
}

export class UsesDeclarationImpl extends AnnotableImpl implements UsesDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createUsesDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Name prefix (without dot) used to refer imported declarations
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
         * Pass to the used library
         **/
value(  ):string{
             return <string>super.attribute('value', this.toString);
         }


        /**
         * @hidden
         * Set value value
         **/
setValue( param:string ){
            this.highLevel().attrOrCreate("value").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "UsesDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "UsesDeclaration";}
}

export class FragmentDeclarationImpl extends AnnotableImpl implements FragmentDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createFragmentDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

uses(  ):UsesDeclaration[]{
             return <UsesDeclaration[]>super.elements('uses');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FragmentDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FragmentDeclaration";}
}

export class DocumentationItemImpl extends AnnotableImpl implements DocumentationItem{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createDocumentationItem(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Title of documentation section
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

export class ExampleSpecImpl extends AnnotableImpl implements ExampleSpec{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createExampleSpec(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * String representation of example
         **/
value(  ):any{
             return <any>super.attribute('value', this.toAny);
         }


        /**
         * @hidden
         * Set value value
         **/
setValue( param:any ){
            this.highLevel().attrOrCreate("value").setValue(""+param);
            return this;
        }


        /**
         * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
         **/
strict(  ):boolean{
             return <boolean>super.attribute('strict', this.toBoolean);
         }


        /**
         * @hidden
         * Set strict value
         **/
setStrict( param:boolean ){
            this.highLevel().attrOrCreate("strict").setValue(""+param);
            return this;
        }


        /**
         * Example identifier, if specified
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
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ExampleSpecImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "ExampleSpec";}
}

export class LibraryBaseImpl extends AnnotableImpl implements LibraryBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createLibraryBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Alias for the equivalent "types" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "types" property, as the "schemas" alias for that property name may be removed in a future RAML version. The "types" property allows for XML and JSON schemas.
         **/
schemas(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('schemas');
         }


        /**
         * Declarations of (data) types for use within this API
         **/
types(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('types');
         }


        /**
         * Declarations of traits for use within this API
         * @hidden
         **/
traits_original(  ):Trait[]{
             return <Trait[]>super.elements('traits');
         }


        /**
         * Declarations of resource types for use within this API
         * @hidden
         **/
resourceTypes_original(  ):ResourceType[]{
             return <ResourceType[]>super.elements('resourceTypes');
         }


        /**
         * Declarations of annotation types for use by annotations
         **/
annotationTypes(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('annotationTypes');
         }


        /**
         * Declarations of security schemes for use within this API.
         **/
securitySchemes(  ):AbstractSecurityScheme[]{
             return <AbstractSecurityScheme[]>super.elements('securitySchemes');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "LibraryBaseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "LibraryBase";}


        /**
         * Declarations of traits for use within this API
         **/
traits(  ):Trait[]{
            return helper.traitsPrimary(this);
        }


        /**
         * Retrieve all traits including those defined in libraries
         * @deprecated
         **/
allTraits(  ):Trait[]{
            return helper.allTraits(this);
        }


        /**
         * Declarations of resource types for use within this API
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
}

export class LibraryImpl extends LibraryBaseImpl implements Library{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createLibrary(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * contains description of why library exist
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
         * Namespace which the library is imported under
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
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "LibraryImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Library";}
}

export class ApiImpl extends LibraryBaseImpl implements Api{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createApi(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * Short plain-text label for the API
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
         * The version of the API, e.g. 'v1'
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
         * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
         **/
baseUri(  ):FullUriTemplateString{
             return <FullUriTemplateString>super.attribute('baseUri', (attr:hl.IAttribute)=>new FullUriTemplateStringImpl(attr));
         }


        /**
         * Named parameters used in the baseUri (template)
         * @hidden
         **/
baseUriParameters_original(  ):TypeDeclaration[]{
             return <TypeDeclaration[]>super.elements('baseUriParameters');
         }


        /**
         * The protocols supported by the API
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
         * The default media type to use for request and response bodies (payloads), e.g. "application/json"
         **/
mediaType(  ):MimeType[]{
             return <MimeType[]>super.attributes('mediaType', (attr:hl.IAttribute)=>new MimeTypeImpl(attr));
         }


        /**
         * The security schemes that apply to every resource and method in the API
         **/
securedBy(  ):SecuritySchemeRef[]{
             return <SecuritySchemeRef[]>super.attributes('securedBy', (attr:hl.IAttribute)=>new SecuritySchemeRefImpl(attr));
         }


        /**
         * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
         **/
resources(  ):Resource[]{
             return <Resource[]>super.elements('resources');
         }


        /**
         * Additional overall documentation for the API
         **/
documentation(  ):DocumentationItem[]{
             return <DocumentationItem[]>super.elements('documentation');
         }


        /**
         * Most of RAML model elements may have attached annotations decribing additional meta data about this element
         **/
annotations(  ):AnnotationRef[]{
             return <AnnotationRef[]>super.attributes('annotations', (attr:hl.IAttribute)=>new AnnotationRefImpl(attr));
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
         * Named parameters used in the baseUri (template)
         **/
baseUriParameters(  ):TypeDeclaration[]{
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
         * but they are among `Api.allBaseUriParameters()`.
         * @deprecated
         **/
allBaseUriParameters(  ):TypeDeclaration[]{
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

export class OverlayImpl extends ApiImpl implements Overlay{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createOverlay(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * contains description of why overlay exist
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
         * Location of a valid RAML API definition (or overlay or extension), the overlay is applied to.
         **/
extends(  ):string{
             return <string>super.attribute('extends', this.toString);
         }


        /**
         * @hidden
         * Set extends value
         **/
setExtends( param:string ){
            this.highLevel().attrOrCreate("extends").setValue(""+param);
            return this;
        }


        /**
         * Short plain-text label for the API
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
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OverlayImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Overlay";}
}

export class ExtensionImpl extends ApiImpl implements Extension{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel?:boolean ){super((typeof  nodeOrKey=="string")?createExtension(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * contains description of why extension exist
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
         * Location of a valid RAML API definition (or overlay or extension), the extension is applied to
         **/
extends(  ):string{
             return <string>super.attribute('extends', this.toString);
         }


        /**
         * @hidden
         * Set extends value
         **/
setExtends( param:string ){
            this.highLevel().attrOrCreate("extends").setValue(""+param);
            return this;
        }


        /**
         * Short plain-text label for the API
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
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "ExtensionImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Extension";}
}

/**
 * @hidden
 **/
function createApi(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Api");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createLibraryBase(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("LibraryBase");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createAnnotable(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Annotable");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTypeInstance(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("TypeInstance");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTypeInstanceProperty(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("TypeInstanceProperty");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTrait(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Trait");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createMethodBase(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("MethodBase");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createHasNormalParameters(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("HasNormalParameters");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("TypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createXMLFacetInfo(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("XMLFacetInfo");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createArrayTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ArrayTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createUnionTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("UnionTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createObjectTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ObjectTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createStringTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("StringTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createBooleanTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("BooleanTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createNumberTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("NumberTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createIntegerTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("IntegerTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDateOnlyTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DateOnlyTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createTimeOnlyTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("TimeOnlyTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDateTimeOnlyTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DateTimeOnlyTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDateTimeTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DateTimeTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDateTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DateTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createFileTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("FileTypeDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createSecuritySchemePart(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("SecuritySchemePart");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResponse(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Response");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createAbstractSecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("AbstractSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createSecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth1SecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("OAuth1SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth2SecuritySchemeSettings(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("OAuth2SecuritySchemeSettings");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth2SecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("OAuth2SecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOAuth1SecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("OAuth1SecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createPassThroughSecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("PassThroughSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createBasicSecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("BasicSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDigestSecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DigestSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createCustomSecurityScheme(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("CustomSecurityScheme");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createMethod(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Method");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResourceType(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ResourceType");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResourceBase(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ResourceBase");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createResource(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Resource");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createUsesDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("UsesDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createFragmentDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("FragmentDeclaration");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createDocumentationItem(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DocumentationItem");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createExampleSpec(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ExampleSpec");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createLibrary(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Library");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createOverlay(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Overlay");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}

/**
 * @hidden
 **/
function createExtension(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Extension");
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
/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, extensionsAndOverlays:string[],options?:coreApi.Options):Api

export function loadApiSync(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Api{

        return <Api>apiLoader.loadApi(apiPath,arg1,arg2).getOrElse(null);
}

/**
 * Load RAML synchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return hl.BasicNode instance.
 **/
export function loadRAMLSync(ramlPath:string, extensionsAndOverlays:string[],options?:coreApi.Options):hl.BasicNode

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
/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string,extensionsAndOverlays:string[], options?:coreApi.Options):Promise<Api>;

export function loadApi(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Promise<Api>{

        return apiLoader.loadApiAsync(apiPath,arg1,arg2);
}

/**
 * Load RAML asynchronously. May load both Api and Typed fragments. The Promise is rejected with [[ApiLoadingError]] if the resulting hl.BasicNode contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;hl.BasicNode&gt;.
 **/
export function loadRAML(ramlPath:string,extensionsAndOverlays:string[], options?:coreApi.Options):Promise<hl.BasicNode>;

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
