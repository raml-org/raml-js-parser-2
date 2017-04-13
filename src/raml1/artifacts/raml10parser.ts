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
import ApiScalarsAnnotations = pApi.ApiScalarsAnnotations;
import LibraryBase = pApi.LibraryBase;
import FragmentDeclaration = pApi.FragmentDeclaration;
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
import IntegerType = pApi.IntegerType;
import NullType = pApi.NullType;
import TimeOnlyType = pApi.TimeOnlyType;
import DateOnlyType = pApi.DateOnlyType;
import DateTimeOnlyType = pApi.DateTimeOnlyType;
import DateTimeType = pApi.DateTimeType;
import FileType = pApi.FileType;
import BooleanType = pApi.BooleanType;
import AnnotationTarget = pApi.AnnotationTarget;
import TypeInstance = pApi.TypeInstance;
import TypeInstanceProperty = pApi.TypeInstanceProperty;
import TraitRef = pApi.TraitRef;
import Trait = pApi.Trait;
import TraitScalarsAnnotations = pApi.TraitScalarsAnnotations;
import MethodBase = pApi.MethodBase;
import MethodBaseScalarsAnnotations = pApi.MethodBaseScalarsAnnotations;
import Operation = pApi.Operation;
import TypeDeclaration = pApi.TypeDeclaration;
import TypeDeclarationScalarsAnnotations = pApi.TypeDeclarationScalarsAnnotations;
import ModelLocation = pApi.ModelLocation;
import LocationKind = pApi.LocationKind;
import ExampleSpec = pApi.ExampleSpec;
import ExampleSpecScalarsAnnotations = pApi.ExampleSpecScalarsAnnotations;
import UsesDeclaration = pApi.UsesDeclaration;
import UsesDeclarationScalarsAnnotations = pApi.UsesDeclarationScalarsAnnotations;
import XMLFacetInfo = pApi.XMLFacetInfo;
import XMLFacetInfoScalarsAnnotations = pApi.XMLFacetInfoScalarsAnnotations;
import ArrayTypeDeclaration = pApi.ArrayTypeDeclaration;
import ArrayTypeDeclarationScalarsAnnotations = pApi.ArrayTypeDeclarationScalarsAnnotations;
import UnionTypeDeclaration = pApi.UnionTypeDeclaration;
import ObjectTypeDeclaration = pApi.ObjectTypeDeclaration;
import ObjectTypeDeclarationScalarsAnnotations = pApi.ObjectTypeDeclarationScalarsAnnotations;
import StringTypeDeclaration = pApi.StringTypeDeclaration;
import StringTypeDeclarationScalarsAnnotations = pApi.StringTypeDeclarationScalarsAnnotations;
import BooleanTypeDeclaration = pApi.BooleanTypeDeclaration;
import BooleanTypeDeclarationScalarsAnnotations = pApi.BooleanTypeDeclarationScalarsAnnotations;
import NumberTypeDeclaration = pApi.NumberTypeDeclaration;
import NumberTypeDeclarationScalarsAnnotations = pApi.NumberTypeDeclarationScalarsAnnotations;
import IntegerTypeDeclaration = pApi.IntegerTypeDeclaration;
import IntegerTypeDeclarationScalarsAnnotations = pApi.IntegerTypeDeclarationScalarsAnnotations;
import DateOnlyTypeDeclaration = pApi.DateOnlyTypeDeclaration;
import TimeOnlyTypeDeclaration = pApi.TimeOnlyTypeDeclaration;
import DateTimeOnlyTypeDeclaration = pApi.DateTimeOnlyTypeDeclaration;
import DateTimeTypeDeclaration = pApi.DateTimeTypeDeclaration;
import DateTimeTypeDeclarationScalarsAnnotations = pApi.DateTimeTypeDeclarationScalarsAnnotations;
import FileTypeDeclaration = pApi.FileTypeDeclaration;
import FileTypeDeclarationScalarsAnnotations = pApi.FileTypeDeclarationScalarsAnnotations;
import Response = pApi.Response;
import ResponseScalarsAnnotations = pApi.ResponseScalarsAnnotations;
import SecuritySchemePart = pApi.SecuritySchemePart;
import SecuritySchemeRef = pApi.SecuritySchemeRef;
import AbstractSecurityScheme = pApi.AbstractSecurityScheme;
import AbstractSecuritySchemeScalarsAnnotations = pApi.AbstractSecuritySchemeScalarsAnnotations;
import SecuritySchemeSettings = pApi.SecuritySchemeSettings;
import OAuth1SecuritySchemeSettings = pApi.OAuth1SecuritySchemeSettings;
import OAuth1SecuritySchemeSettingsScalarsAnnotations = pApi.OAuth1SecuritySchemeSettingsScalarsAnnotations;
import OAuth2SecuritySchemeSettings = pApi.OAuth2SecuritySchemeSettings;
import OAuth2SecuritySchemeSettingsScalarsAnnotations = pApi.OAuth2SecuritySchemeSettingsScalarsAnnotations;
import OAuth2SecurityScheme = pApi.OAuth2SecurityScheme;
import OAuth1SecurityScheme = pApi.OAuth1SecurityScheme;
import PassThroughSecurityScheme = pApi.PassThroughSecurityScheme;
import BasicSecurityScheme = pApi.BasicSecurityScheme;
import DigestSecurityScheme = pApi.DigestSecurityScheme;
import CustomSecurityScheme = pApi.CustomSecurityScheme;
import Method = pApi.Method;
import MethodScalarsAnnotations = pApi.MethodScalarsAnnotations;
import ResourceTypeRef = pApi.ResourceTypeRef;
import ResourceType = pApi.ResourceType;
import ResourceTypeScalarsAnnotations = pApi.ResourceTypeScalarsAnnotations;
import ResourceBase = pApi.ResourceBase;
import ResourceBaseScalarsAnnotations = pApi.ResourceBaseScalarsAnnotations;
import Resource = pApi.Resource;
import ResourceScalarsAnnotations = pApi.ResourceScalarsAnnotations;
import DocumentationItem = pApi.DocumentationItem;
import DocumentationItemScalarsAnnotations = pApi.DocumentationItemScalarsAnnotations;
import Library = pApi.Library;
import LibraryScalarsAnnotations = pApi.LibraryScalarsAnnotations;
import Overlay = pApi.Overlay;
import OverlayScalarsAnnotations = pApi.OverlayScalarsAnnotations;
import Extension = pApi.Extension;
import ExtensionScalarsAnnotations = pApi.ExtensionScalarsAnnotations;
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Annotable");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.AnnotableImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.AnnotableImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ValueType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("undefined.ValueTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "undefined.ValueTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "undefined";}


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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("StringType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.StringTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.StringTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("UriTemplate");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.UriTemplateImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.UriTemplateImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("RelativeUriString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.RelativeUriStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.RelativeUriStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("FullUriTemplateString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.FullUriTemplateStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.FullUriTemplateStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("StatusCodeString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.StatusCodeStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.StatusCodeStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("FixedUriString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.FixedUriStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.FixedUriStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ContentType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ContentTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ContentTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("MarkdownString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.MarkdownStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.MarkdownStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("SchemaString");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.SchemaStringImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.SchemaStringImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("MimeType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.MimeTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.MimeTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("AnyType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.AnyTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.AnyTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("NumberType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.NumberTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.NumberTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * @return Number representation of the node value
         **/
value(  ):number{return this.attr.value();}
}

export class IntegerTypeImpl extends ValueTypeImpl implements IntegerType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "IntegerTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "IntegerType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("IntegerType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.IntegerTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.IntegerTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class NullTypeImpl extends ValueTypeImpl implements NullType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "NullTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "NullType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("NullType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.NullTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.NullTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class TimeOnlyTypeImpl extends ValueTypeImpl implements TimeOnlyType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TimeOnlyTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "TimeOnlyType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("TimeOnlyType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.TimeOnlyTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.TimeOnlyTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class DateOnlyTypeImpl extends ValueTypeImpl implements DateOnlyType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateOnlyTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateOnlyType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateOnlyType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateOnlyTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateOnlyTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class DateTimeOnlyTypeImpl extends ValueTypeImpl implements DateTimeOnlyType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTimeOnlyTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTimeOnlyType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateTimeOnlyType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateTimeOnlyTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateTimeOnlyTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class DateTimeTypeImpl extends ValueTypeImpl implements DateTimeType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTimeTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTimeType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateTimeType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateTimeTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateTimeTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class FileTypeImpl extends ValueTypeImpl implements FileType{

        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "FileTypeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "FileType";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("FileType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.FileTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.FileTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("BooleanType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.BooleanTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.BooleanTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("AnnotationTarget");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.AnnotationTargetImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.AnnotationTargetImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Reference");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ReferenceImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ReferenceImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("TraitRef");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.TraitRefImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.TraitRefImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

trait(  ):Trait{
            return helper.referencedTrait(this);
        }
}

export class OperationImpl extends AnnotableImpl implements Operation{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOperation(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * Information about the expected responses to a request
         **/
responses(  ):Response[]{
             return <Response[]>super.elements('responses');
         }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "OperationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "Operation";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Operation");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OperationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OperationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class TypeDeclarationImpl extends AnnotableImpl implements TypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * @hidden
         **/
schema_original(  ):string[]{
             return <string[]>super.attributes('schema', this.toString);
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
         * @hidden
         **/
type_original(  ):string[]{
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
         * An example of this type instance represented as string or yaml map/sequence. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
         * @hidden
         **/
example_original(  ):ExampleSpec{
             return <ExampleSpec>super.element('example');
         }


        /**
         * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the example property is present.
         * @hidden
         **/
examples_original(  ):ExampleSpec[]{
             return <ExampleSpec[]>super.elements('examples');
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
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
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

uses(  ):UsesDeclaration[]{
             return <UsesDeclaration[]>super.elements('uses');
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("TypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.TypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.TypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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
         * validate an instance against type
         **/
validateInstanceWithDetailedStatuses( value:any ):any{
            return helper.validateInstanceWithDetailedStatuses(this, value);
        }


        /**
         * An example of this type instance represented as string or yaml map/sequence. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
         **/
example(  ):ExampleSpec{
            return helper.getTypeExample(this);
        }


        /**
         * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the example property is present.
         **/
examples(  ):ExampleSpec[]{
            return helper.getTypeExamples(this);
        }

fixedFacets(  ):TypeInstance{
            return helper.typeFixedFacets(this);
        }


        /**
         * A base type which the current type extends, or more generally a type expression.
         **/
"type"(  ):string[]{
            return helper.typeValue(this);
        }


        /**
         * Alias for the equivalent "type" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "type" property, as the "schema" alias for that property name may be removed in a future RAML version. The "type" property allows for XML and JSON schemas.
         **/
schema(  ):string[]{
            return helper.schemaValue(this);
        }


        /**
         * Inlined supertype definition.
         **/
structuredType(  ):TypeInstance{
            return helper.typeStructuredValue(this);
        }

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):TypeDeclarationScalarsAnnotationsImpl{return new TypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return ["ModelLocation"];}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return ["RAML10.ModelLocationImpl"];}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ModelLocationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return ["LocationKind"];}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return ["RAML10.LocationKindImpl"];}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.LocationKindImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class UsesDeclarationImpl extends AnnotableImpl implements UsesDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createUsesDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * Content of the schema
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("UsesDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.UsesDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.UsesDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Returns the root node of the AST, uses statement refers.
         **/
ast(  ):Library{
            return helper.referencedNode(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):UsesDeclarationScalarsAnnotationsImpl{return new UsesDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * UsesDeclaration scalar properties annotations accessor
 **/
export class UsesDeclarationScalarsAnnotationsImpl implements UsesDeclarationScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * UsesDeclaration.value annotations
         **/
value(  ):AnnotationRef[]{
        var attr = this.node.attr("value");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class XMLFacetInfoImpl extends AnnotableImpl implements XMLFacetInfo{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createXMLFacetInfo(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("XMLFacetInfo");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.XMLFacetInfoImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.XMLFacetInfoImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):XMLFacetInfoScalarsAnnotationsImpl{return new XMLFacetInfoScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * XMLFacetInfo scalar properties annotations accessor
 **/
export class XMLFacetInfoScalarsAnnotationsImpl implements XMLFacetInfoScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * XMLFacetInfo.attribute annotations
         **/
attribute(  ):AnnotationRef[]{
        var attr = this.node.attr("attribute");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * XMLFacetInfo.wrapped annotations
         **/
wrapped(  ):AnnotationRef[]{
        var attr = this.node.attr("wrapped");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * XMLFacetInfo.name annotations
         **/
name(  ):AnnotationRef[]{
        var attr = this.node.attr("name");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * XMLFacetInfo.namespace annotations
         **/
namespace(  ):AnnotationRef[]{
        var attr = this.node.attr("namespace");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * XMLFacetInfo.prefix annotations
         **/
prefix(  ):AnnotationRef[]{
        var attr = this.node.attr("prefix");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class ArrayTypeDeclarationImpl extends TypeDeclarationImpl implements ArrayTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createArrayTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * @hidden
         **/
items_original(  ):string[]{
             return <string[]>super.attributes('items', this.toString);
         }


        /**
         * @hidden
         * Set items value
         **/
setItems( param:string ){
            this.highLevel().attrOrCreate("items").setValue(""+param);
            return this;
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ArrayTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ArrayTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ArrayTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Inlined component type definition.
         **/
structuredItems(  ):TypeInstance{
            return helper.itemsStructuredValue(this);
        }


        /**
         * Array component type.
         **/
items(  ):string[]{
            return helper.getItems(this);
        }


        /**
         * Returns anonymous type defined by "items" keyword, or a component type if declaration can be found.
         * Does not resolve type expressions. Only returns component type declaration if it is actually defined
         * somewhere in AST.
         **/
findComponentTypeDeclaration(  ):TypeDeclaration{
            return helper.findComponentTypeDeclaration(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ArrayTypeDeclarationScalarsAnnotationsImpl{return new ArrayTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * TypeDeclaration scalar properties annotations accessor
 **/
export class TypeDeclarationScalarsAnnotationsImpl implements TypeDeclarationScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * TypeDeclaration.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.schema annotations
         **/
schema(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("schema");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * TypeDeclaration.type annotations
         **/
"type"(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("type");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * TypeDeclaration.location annotations
         **/
location(  ):AnnotationRef[]{
        var attr = this.node.attr("location");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.locationKind annotations
         **/
locationKind(  ):AnnotationRef[]{
        var attr = this.node.attr("locationKind");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.default annotations
         **/
"default"(  ):AnnotationRef[]{
        var attr = this.node.attr("default");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.required annotations
         **/
required(  ):AnnotationRef[]{
        var attr = this.node.attr("required");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * TypeDeclaration.allowedTargets annotations
         **/
allowedTargets(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("allowedTargets");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * TypeDeclaration.isAnnotation annotations
         **/
isAnnotation(  ):AnnotationRef[]{
        var attr = this.node.attr("isAnnotation");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}


/**
 * ArrayTypeDeclaration scalar properties annotations accessor
 **/
export class ArrayTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements ArrayTypeDeclarationScalarsAnnotations{

        /**
         * ArrayTypeDeclaration.uniqueItems annotations
         **/
uniqueItems(  ):AnnotationRef[]{
        var attr = this.node.attr("uniqueItems");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ArrayTypeDeclaration.items annotations
         **/
items(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("items");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * ArrayTypeDeclaration.minItems annotations
         **/
minItems(  ):AnnotationRef[]{
        var attr = this.node.attr("minItems");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ArrayTypeDeclaration.maxItems annotations
         **/
maxItems(  ):AnnotationRef[]{
        var attr = this.node.attr("maxItems");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class UnionTypeDeclarationImpl extends TypeDeclarationImpl implements UnionTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createUnionTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "UnionTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "UnionTypeDeclaration";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("UnionTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.UnionTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.UnionTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class ObjectTypeDeclarationImpl extends TypeDeclarationImpl implements ObjectTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createObjectTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * A Boolean that indicates if an object instance has additional properties.
         **/
additionalProperties(  ):boolean{
             return <boolean>super.attribute('additionalProperties', this.toBoolean);
         }


        /**
         * @hidden
         * Set additionalProperties value
         **/
setAdditionalProperties( param:boolean ){
            this.highLevel().attrOrCreate("additionalProperties").setValue(""+param);
            return this;
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

enum(  ):any[]{
             return <any[]>super.attributes('enum', this.toAny);
         }


        /**
         * @hidden
         * Set enum value
         **/
setEnum( param:any ){
            this.highLevel().attrOrCreate("enum").setValue(""+param);
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ObjectTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ObjectTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ObjectTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ObjectTypeDeclarationScalarsAnnotationsImpl{return new ObjectTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * ObjectTypeDeclaration scalar properties annotations accessor
 **/
export class ObjectTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements ObjectTypeDeclarationScalarsAnnotations{

        /**
         * ObjectTypeDeclaration.minProperties annotations
         **/
minProperties(  ):AnnotationRef[]{
        var attr = this.node.attr("minProperties");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ObjectTypeDeclaration.maxProperties annotations
         **/
maxProperties(  ):AnnotationRef[]{
        var attr = this.node.attr("maxProperties");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ObjectTypeDeclaration.additionalProperties annotations
         **/
additionalProperties(  ):AnnotationRef[]{
        var attr = this.node.attr("additionalProperties");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ObjectTypeDeclaration.discriminator annotations
         **/
discriminator(  ):AnnotationRef[]{
        var attr = this.node.attr("discriminator");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ObjectTypeDeclaration.discriminatorValue annotations
         **/
discriminatorValue(  ):AnnotationRef[]{
        var attr = this.node.attr("discriminatorValue");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ObjectTypeDeclaration.enum annotations
         **/
enum(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("enum");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Value must be a string
 **/
export class StringTypeDeclarationImpl extends TypeDeclarationImpl implements StringTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createStringTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("StringTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.StringTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.StringTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):StringTypeDeclarationScalarsAnnotationsImpl{return new StringTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * StringTypeDeclaration scalar properties annotations accessor
 **/
export class StringTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements StringTypeDeclarationScalarsAnnotations{

        /**
         * StringTypeDeclaration.pattern annotations
         **/
pattern(  ):AnnotationRef[]{
        var attr = this.node.attr("pattern");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * StringTypeDeclaration.minLength annotations
         **/
minLength(  ):AnnotationRef[]{
        var attr = this.node.attr("minLength");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * StringTypeDeclaration.maxLength annotations
         **/
maxLength(  ):AnnotationRef[]{
        var attr = this.node.attr("maxLength");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * StringTypeDeclaration.enum annotations
         **/
enum(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("enum");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Value must be a boolean
 **/
export class BooleanTypeDeclarationImpl extends TypeDeclarationImpl implements BooleanTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createBooleanTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

enum(  ):boolean[]{
             return <boolean[]>super.attributes('enum', this.toBoolean);
         }


        /**
         * @hidden
         * Set enum value
         **/
setEnum( param:boolean ){
            this.highLevel().attrOrCreate("enum").setValue(""+param);
            return this;
        }


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BooleanTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BooleanTypeDeclaration";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("BooleanTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.BooleanTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.BooleanTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):BooleanTypeDeclarationScalarsAnnotationsImpl{return new BooleanTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * BooleanTypeDeclaration scalar properties annotations accessor
 **/
export class BooleanTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements BooleanTypeDeclarationScalarsAnnotations{

        /**
         * BooleanTypeDeclaration.enum annotations
         **/
enum(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("enum");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export class NumberTypeDeclarationImpl extends TypeDeclarationImpl implements NumberTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createNumberTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
enum(  ):number[]{
             return <number[]>super.attributes('enum', this.toNumber);
         }


        /**
         * @hidden
         * Set enum value
         **/
setEnum( param:number ){
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("NumberTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.NumberTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.NumberTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):NumberTypeDeclarationScalarsAnnotationsImpl{return new NumberTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Value MUST be a integer.
 **/
export class IntegerTypeDeclarationImpl extends NumberTypeDeclarationImpl implements IntegerTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createIntegerTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("IntegerTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.IntegerTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.IntegerTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):IntegerTypeDeclarationScalarsAnnotationsImpl{return new IntegerTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * NumberTypeDeclaration scalar properties annotations accessor
 **/
export class NumberTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements NumberTypeDeclarationScalarsAnnotations{

        /**
         * NumberTypeDeclaration.minimum annotations
         **/
minimum(  ):AnnotationRef[]{
        var attr = this.node.attr("minimum");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * NumberTypeDeclaration.maximum annotations
         **/
maximum(  ):AnnotationRef[]{
        var attr = this.node.attr("maximum");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * NumberTypeDeclaration.enum annotations
         **/
enum(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("enum");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * NumberTypeDeclaration.format annotations
         **/
format(  ):AnnotationRef[]{
        var attr = this.node.attr("format");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * NumberTypeDeclaration.multipleOf annotations
         **/
multipleOf(  ):AnnotationRef[]{
        var attr = this.node.attr("multipleOf");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}


/**
 * IntegerTypeDeclaration scalar properties annotations accessor
 **/
export class IntegerTypeDeclarationScalarsAnnotationsImpl extends NumberTypeDeclarationScalarsAnnotationsImpl implements IntegerTypeDeclarationScalarsAnnotations{

        /**
         * IntegerTypeDeclaration.format annotations
         **/
format(  ):AnnotationRef[]{
        var attr = this.node.attr("format");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}


/**
 * the "full-date" notation of RFC3339, namely yyyy-mm-dd (no implications about time or timezone-offset)
 **/
export class DateOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements DateOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createDateOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateOnlyTypeDeclaration";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateOnlyTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateOnlyTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateOnlyTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * the "partial-time" notation of RFC3339, namely hh:mm:ss[.ff...] (no implications about date or timezone-offset)
 **/
export class TimeOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements TimeOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createTimeOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "TimeOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "TimeOnlyTypeDeclaration";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("TimeOnlyTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.TimeOnlyTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.TimeOnlyTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * combined date-only and time-only with a separator of "T", namely yyyy-mm-ddThh:mm:ss[.ff...] (no implications about timezone-offset)
 **/
export class DateTimeOnlyTypeDeclarationImpl extends TypeDeclarationImpl implements DateTimeOnlyTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createDateTimeOnlyTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DateTimeOnlyTypeDeclarationImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DateTimeOnlyTypeDeclaration";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateTimeOnlyTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateTimeOnlyTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateTimeOnlyTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * a timestamp, either in the "date-time" notation of RFC3339, if format is omitted or is set to rfc3339, or in the format defined in RFC2616, if format is set to rfc2616.
 **/
export class DateTimeTypeDeclarationImpl extends TypeDeclarationImpl implements DateTimeTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createDateTimeTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DateTimeTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DateTimeTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DateTimeTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):DateTimeTypeDeclarationScalarsAnnotationsImpl{return new DateTimeTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * DateTimeTypeDeclaration scalar properties annotations accessor
 **/
export class DateTimeTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements DateTimeTypeDeclarationScalarsAnnotations{

        /**
         * DateTimeTypeDeclaration.format annotations
         **/
format(  ):AnnotationRef[]{
        var attr = this.node.attr("format");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}


/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export class FileTypeDeclarationImpl extends TypeDeclarationImpl implements FileTypeDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createFileTypeDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("FileTypeDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.FileTypeDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.FileTypeDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):FileTypeDeclarationScalarsAnnotationsImpl{return new FileTypeDeclarationScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * FileTypeDeclaration scalar properties annotations accessor
 **/
export class FileTypeDeclarationScalarsAnnotationsImpl extends TypeDeclarationScalarsAnnotationsImpl implements FileTypeDeclarationScalarsAnnotations{

        /**
         * FileTypeDeclaration.fileTypes annotations
         **/
fileTypes(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("fileTypes");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * FileTypeDeclaration.minLength annotations
         **/
minLength(  ):AnnotationRef[]{
        var attr = this.node.attr("minLength");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * FileTypeDeclaration.maxLength annotations
         **/
maxLength(  ):AnnotationRef[]{
        var attr = this.node.attr("maxLength");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class ResponseImpl extends AnnotableImpl implements Response{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createResponse(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Response");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ResponseImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ResponseImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * true for codes < 400 and false otherwise
         **/
isOkRange(  ):boolean{
            return helper.isOkRange(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ResponseScalarsAnnotationsImpl{return new ResponseScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Response scalar properties annotations accessor
 **/
export class ResponseScalarsAnnotationsImpl implements ResponseScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * Response.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class SecuritySchemePartImpl extends OperationImpl implements SecuritySchemePart{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createSecuritySchemePart(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("SecuritySchemePart");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.SecuritySchemePartImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.SecuritySchemePartImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class MethodBaseImpl extends OperationImpl implements MethodBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createMethodBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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

description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
         }

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
wrapperClassName(  ):string{return "MethodBaseImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "MethodBase";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("MethodBase");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.MethodBaseImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.MethodBaseImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):MethodBaseScalarsAnnotationsImpl{return new MethodBaseScalarsAnnotationsImpl(this.highLevel());}
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("SecuritySchemeRef");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.SecuritySchemeRefImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.SecuritySchemeRefImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

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
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createAbstractSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("AbstractSecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.AbstractSecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.AbstractSecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):AbstractSecuritySchemeScalarsAnnotationsImpl{return new AbstractSecuritySchemeScalarsAnnotationsImpl(this.highLevel());}
}

export class SecuritySchemeSettingsImpl extends AnnotableImpl implements SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createSecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "SecuritySchemeSettingsImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "SecuritySchemeSettings";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("SecuritySchemeSettings");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.SecuritySchemeSettingsImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.SecuritySchemeSettingsImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class OAuth1SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth1SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOAuth1SecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("OAuth1SecuritySchemeSettings");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OAuth1SecuritySchemeSettingsImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OAuth1SecuritySchemeSettingsImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):OAuth1SecuritySchemeSettingsScalarsAnnotationsImpl{return new OAuth1SecuritySchemeSettingsScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * OAuth1SecuritySchemeSettings scalar properties annotations accessor
 **/
export class OAuth1SecuritySchemeSettingsScalarsAnnotationsImpl implements OAuth1SecuritySchemeSettingsScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * OAuth1SecuritySchemeSettings.requestTokenUri annotations
         **/
requestTokenUri(  ):AnnotationRef[]{
        var attr = this.node.attr("requestTokenUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * OAuth1SecuritySchemeSettings.authorizationUri annotations
         **/
authorizationUri(  ):AnnotationRef[]{
        var attr = this.node.attr("authorizationUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * OAuth1SecuritySchemeSettings.tokenCredentialsUri annotations
         **/
tokenCredentialsUri(  ):AnnotationRef[]{
        var attr = this.node.attr("tokenCredentialsUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * OAuth1SecuritySchemeSettings.signatures annotations
         **/
signatures(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("signatures");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}

export class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth2SecuritySchemeSettings{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOAuth2SecuritySchemeSettings(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * A list of the Authorization grants supported by the API as defined in RFC6749 Sections 4.1, 4.2, 4.3 and 4.4, can be any of: authorization_code, password, client_credentials, implicit, or any absolute url.
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("OAuth2SecuritySchemeSettings");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OAuth2SecuritySchemeSettingsImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OAuth2SecuritySchemeSettingsImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):OAuth2SecuritySchemeSettingsScalarsAnnotationsImpl{return new OAuth2SecuritySchemeSettingsScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * OAuth2SecuritySchemeSettings scalar properties annotations accessor
 **/
export class OAuth2SecuritySchemeSettingsScalarsAnnotationsImpl implements OAuth2SecuritySchemeSettingsScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * OAuth2SecuritySchemeSettings.accessTokenUri annotations
         **/
accessTokenUri(  ):AnnotationRef[]{
        var attr = this.node.attr("accessTokenUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * OAuth2SecuritySchemeSettings.authorizationUri annotations
         **/
authorizationUri(  ):AnnotationRef[]{
        var attr = this.node.attr("authorizationUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * OAuth2SecuritySchemeSettings.authorizationGrants annotations
         **/
authorizationGrants(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("authorizationGrants");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * OAuth2SecuritySchemeSettings.scopes annotations
         **/
scopes(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("scopes");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Declares globally referable security scheme definition
 **/
export class OAuth2SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth2SecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOAuth2SecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("OAuth2SecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OAuth2SecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OAuth2SecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * Declares globally referable security scheme definition
 **/
export class OAuth1SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth1SecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOAuth1SecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("OAuth1SecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OAuth1SecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OAuth1SecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * Declares globally referable security scheme definition
 **/
export class PassThroughSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements PassThroughSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createPassThroughSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("PassThroughSecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.PassThroughSecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.PassThroughSecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * Declares globally referable security scheme definition
 **/
export class BasicSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements BasicSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createBasicSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "BasicSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "BasicSecurityScheme";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("BasicSecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.BasicSecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.BasicSecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * Declares globally referable security scheme definition
 **/
export class DigestSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements DigestSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createDigestSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "DigestSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "DigestSecurityScheme";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DigestSecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DigestSecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DigestSecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * Declares globally referable security scheme definition
 **/
export class CustomSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements CustomSecurityScheme{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createCustomSecurityScheme(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


        /**
         * @hidden
         * @return Actual name of instance class
         **/
wrapperClassName(  ):string{return "CustomSecuritySchemeImpl";}


        /**
         * @return Actual name of instance interface
         **/
kind(  ):string{return "CustomSecurityScheme";}


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("CustomSecurityScheme");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.CustomSecuritySchemeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.CustomSecuritySchemeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}


/**
 * AbstractSecurityScheme scalar properties annotations accessor
 **/
export class AbstractSecuritySchemeScalarsAnnotationsImpl implements AbstractSecuritySchemeScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * AbstractSecurityScheme.type annotations
         **/
"type"(  ):AnnotationRef[]{
        var attr = this.node.attr("type");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * AbstractSecurityScheme.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * AbstractSecurityScheme.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class MethodImpl extends MethodBaseImpl implements Method{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createMethod(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Method");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.MethodImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.MethodImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):MethodScalarsAnnotationsImpl{return new MethodScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * MethodBase scalar properties annotations accessor
 **/
export class MethodBaseScalarsAnnotationsImpl implements MethodBaseScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * MethodBase.protocols annotations
         **/
protocols(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("protocols");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * MethodBase.is annotations
         **/
is(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("is");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * MethodBase.securedBy annotations
         **/
securedBy(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("securedBy");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * MethodBase.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * MethodBase.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}


/**
 * Method scalar properties annotations accessor
 **/
export class MethodScalarsAnnotationsImpl extends MethodBaseScalarsAnnotationsImpl implements MethodScalarsAnnotations{

        /**
         * Method.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class TraitImpl extends MethodBaseImpl implements Trait{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createTrait(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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

uses(  ):UsesDeclaration[]{
             return <UsesDeclaration[]>super.elements('uses');
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Trait");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.TraitImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.TraitImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):TraitScalarsAnnotationsImpl{return new TraitScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Trait scalar properties annotations accessor
 **/
export class TraitScalarsAnnotationsImpl extends MethodBaseScalarsAnnotationsImpl implements TraitScalarsAnnotations{

        /**
         * Trait.usage annotations
         **/
usage(  ):AnnotationRef[]{
        var attr = this.node.attr("usage");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Trait.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ResourceTypeRef");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ResourceTypeRefImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ResourceTypeRefImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

resourceType(  ):ResourceType{
            return helper.referencedResourceType(this);
        }
}

export class ResourceBaseImpl extends AnnotableImpl implements ResourceBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createResourceBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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

description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ResourceBase");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ResourceBaseImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ResourceBaseImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ResourceBaseScalarsAnnotationsImpl{return new ResourceBaseScalarsAnnotationsImpl(this.highLevel());}
}

export class ResourceImpl extends ResourceBaseImpl implements Resource{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createResource(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Resource");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ResourceImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ResourceImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ResourceScalarsAnnotationsImpl{return new ResourceScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * ResourceBase scalar properties annotations accessor
 **/
export class ResourceBaseScalarsAnnotationsImpl implements ResourceBaseScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * ResourceBase.is annotations
         **/
is(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("is");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * ResourceBase.type annotations
         **/
"type"(  ):AnnotationRef[]{
        var attr = this.node.attr("type");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ResourceBase.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ResourceBase.securedBy annotations
         **/
securedBy(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("securedBy");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Resource scalar properties annotations accessor
 **/
export class ResourceScalarsAnnotationsImpl extends ResourceBaseScalarsAnnotationsImpl implements ResourceScalarsAnnotations{

        /**
         * Resource.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Resource.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createResourceType(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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

uses(  ):UsesDeclaration[]{
             return <UsesDeclaration[]>super.elements('uses');
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("ResourceType");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ResourceTypeImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ResourceTypeImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

parametrizedProperties(  ):TypeInstance{
            return helper.getTemplateParametrizedProperties(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ResourceTypeScalarsAnnotationsImpl{return new ResourceTypeScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * ResourceType scalar properties annotations accessor
 **/
export class ResourceTypeScalarsAnnotationsImpl extends ResourceBaseScalarsAnnotationsImpl implements ResourceTypeScalarsAnnotations{

        /**
         * ResourceType.displayName annotations
         **/
displayName(  ):AnnotationRef[]{
        var attr = this.node.attr("displayName");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * ResourceType.usage annotations
         **/
usage(  ):AnnotationRef[]{
        var attr = this.node.attr("usage");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("AnnotationRef");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.AnnotationRefImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.AnnotationRefImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}

annotation(  ):TypeDeclaration{
            return helper.referencedAnnotation(this);
        }
}

export class DocumentationItemImpl extends AnnotableImpl implements DocumentationItem{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createDocumentationItem(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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

uses(  ):UsesDeclaration[]{
             return <UsesDeclaration[]>super.elements('uses');
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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("DocumentationItem");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.DocumentationItemImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.DocumentationItemImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):DocumentationItemScalarsAnnotationsImpl{return new DocumentationItemScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * DocumentationItem scalar properties annotations accessor
 **/
export class DocumentationItemScalarsAnnotationsImpl implements DocumentationItemScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * DocumentationItem.title annotations
         **/
title(  ):AnnotationRef[]{
        var attr = this.node.attr("title");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * DocumentationItem.content annotations
         **/
content(  ):AnnotationRef[]{
        var attr = this.node.attr("content");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class FragmentDeclarationImpl extends AnnotableImpl implements FragmentDeclaration{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createFragmentDeclaration(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}

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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("FragmentDeclaration");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.FragmentDeclarationImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.FragmentDeclarationImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}
}

export class LibraryBaseImpl extends FragmentDeclarationImpl implements LibraryBase{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createLibraryBase(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("LibraryBase");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.LibraryBaseImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.LibraryBaseImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


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
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createLibrary(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Library");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.LibraryImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.LibraryImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):LibraryScalarsAnnotationsImpl{return new LibraryScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Library scalar properties annotations accessor
 **/
export class LibraryScalarsAnnotationsImpl implements LibraryScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * Library.usage annotations
         **/
usage(  ):AnnotationRef[]{
        var attr = this.node.attr("usage");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class ApiImpl extends LibraryBaseImpl implements Api{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createApi(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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
         * A longer, human-friendly description of the API
         **/
description(  ):MarkdownString{
             return <MarkdownString>super.attribute('description', (attr:hl.IAttribute)=>new MarkdownStringImpl(attr));
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
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Api");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ApiImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ApiImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         * @hidden
         **/
RAMLVersion_original(  ):string{return "RAML10";}


        /**
         * Equivalent API with traits and resource types expanded
         * @expLib whether to apply library expansion or not
         **/
expand( expLib:boolean=false ):Api{
            return helper.expandSpec(this, expLib);
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


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{
            return helper.RAMLVersion(this);
        }


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ApiScalarsAnnotationsImpl{return new ApiScalarsAnnotationsImpl(this.highLevel());}
}

export class OverlayImpl extends ApiImpl implements Overlay{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createOverlay(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Overlay");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.OverlayImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.OverlayImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):OverlayScalarsAnnotationsImpl{return new OverlayScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Api scalar properties annotations accessor
 **/
export class ApiScalarsAnnotationsImpl implements ApiScalarsAnnotations{
constructor( protected node:hl.IHighLevelNode ){}


        /**
         * Api.title annotations
         **/
title(  ):AnnotationRef[]{
        var attr = this.node.attr("title");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Api.description annotations
         **/
description(  ):AnnotationRef[]{
        var attr = this.node.attr("description");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Api.version annotations
         **/
version(  ):AnnotationRef[]{
        var attr = this.node.attr("version");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Api.baseUri annotations
         **/
baseUri(  ):AnnotationRef[]{
        var attr = this.node.attr("baseUri");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Api.protocols annotations
         **/
protocols(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("protocols");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * Api.mediaType annotations
         **/
mediaType(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("mediaType");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}


        /**
         * Api.securedBy annotations
         **/
securedBy(  ):AnnotationRef[][]{
        var attrs = this.node.attributes("securedBy");
        return <AnnotationRef[][]>attrs.map(x=>{
            var annotationAttrs = x.annotations();
            var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
            return result;
        });
}
}


/**
 * Overlay scalar properties annotations accessor
 **/
export class OverlayScalarsAnnotationsImpl extends ApiScalarsAnnotationsImpl implements OverlayScalarsAnnotations{

        /**
         * Overlay.usage annotations
         **/
usage(  ):AnnotationRef[]{
        var attr = this.node.attr("usage");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Overlay.extends annotations
         **/
extends(  ):AnnotationRef[]{
        var attr = this.node.attr("extends");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Overlay.title annotations
         **/
title(  ):AnnotationRef[]{
        var attr = this.node.attr("title");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
}

export class ExtensionImpl extends ApiImpl implements Extension{
constructor( protected nodeOrKey:hl.IHighLevelNode|string,protected setAsTopLevel:boolean=true ){super((typeof  nodeOrKey=="string")?createExtension(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)}


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


        /**
         * @return Actual name of instance interface and all of its superinterfaces
         **/
allKinds(  ):string[]{return super.allKinds().concat("Extension");}


        /**
         * @return Actual name of instance class and all of its superclasses
         **/
allWrapperClassNames(  ):string[]{return super.allWrapperClassNames().concat("RAML10.ExtensionImpl");}


        /**
         * @return Whether specified object is an instance of this class
         **/
static isInstance( instance:any ):boolean{
        if(instance != null && instance.allWrapperClassNames
            && typeof(instance.allWrapperClassNames) == "function"){

            for (let currentIdentifier of instance.allWrapperClassNames()){
                if(currentIdentifier == "RAML10.ExtensionImpl") return true;
            }
        }

        return false;
}


        /**
         * @return RAML version of the node
         **/
RAMLVersion(  ):string{return "RAML10";}


        /**
         * Scalar properties annotations accessor
         **/
scalarsAnnotations(  ):ExtensionScalarsAnnotationsImpl{return new ExtensionScalarsAnnotationsImpl(this.highLevel());}
}


/**
 * Extension scalar properties annotations accessor
 **/
export class ExtensionScalarsAnnotationsImpl extends ApiScalarsAnnotationsImpl implements ExtensionScalarsAnnotations{

        /**
         * Extension.usage annotations
         **/
usage(  ):AnnotationRef[]{
        var attr = this.node.attr("usage");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Extension.extends annotations
         **/
extends(  ):AnnotationRef[]{
        var attr = this.node.attr("extends");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}


        /**
         * Extension.title annotations
         **/
title(  ):AnnotationRef[]{
        var attr = this.node.attr("title");
        if(attr==null){
          return [];
        }
        var annotationAttrs = attr.annotations();
        var result = core.attributesToValues(annotationAttrs,(a:hl.IAttribute)=>new AnnotationRefImpl(a));
        return <AnnotationRef[]>result;
}
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
function createFragmentDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("FragmentDeclaration");
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
function createOperation(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("Operation");
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
function createExampleSpec(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("ExampleSpec");
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
function createFileTypeDeclaration(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("FileTypeDeclaration");
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
function createSecuritySchemePart(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("SecuritySchemePart");
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
function createDocumentationItem(key:string){
    var universe=def.getUniverse("RAML10");
    var nc=<def.NodeClass>universe.type("DocumentationItem");
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
