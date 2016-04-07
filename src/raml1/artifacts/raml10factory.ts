import RamlWrapper = require("./raml10parser");
import hl = require("../../raml1/highLevelAST")

/**
 * @hidden
 * Build Wrapper node corresponding to the High Level node
 **/
export function buildWrapperNode(node:hl.IHighLevelNode,setAsTopLevel:boolean=true){

    var definition = node.definition();
    var nodeClassName = definition.nameId();

    var wrapperConstructor = classMap[nodeClassName];

    if(!wrapperConstructor){
        var priorities = determineSuperclassesPriorities(definition);
        var superTypes = definition.allSuperTypes().sort((x,y)=>priorities[x.nameId()]-priorities[y.nameId()]);
        var wr=null;
        for (var i=0;i<superTypes.length;i++){
            var superTypeName=superTypes[i].nameId();
            wrapperConstructor = classMap[superTypeName];
            if (superTypeName=="DataElement"){
                wr=superTypeName;
                //This is only case of nested hierarchy
                continue;
            }
            if (superTypeName=="RAMLLanguageElement"){
                //depth first
                continue;
            }
            if (wrapperConstructor){
                break;
            }
        }
        if (!wrapperConstructor){
            wr=superTypeName;
        }
    }
    if (!wrapperConstructor){
        wrapperConstructor = classMap["RAMLLanguageElement"]

    }
    return wrapperConstructor(node,setAsTopLevel);
}

function determineSuperclassesPriorities(
    td:hl.ITypeDefinition,
    priorities:{[key:string]:number}={},
    path:{[key:string]:boolean}={}):any{

    var typeName = td.nameId();
    if(path[typeName]){
        return;
    }
    path[typeName] = true;
    var rank = (priorities[typeName]!=null && priorities[typeName] + 1 )|| 0;
    var superTypes = td.superTypes();
    superTypes.forEach(x=>{
        var name = x.nameId();
        var r = priorities[name];
        if(r==null||rank>r){
            priorities[name] = rank;
            determineSuperclassesPriorities(x,priorities,path);
        }
    });
    delete path[typeName];
    return priorities;
}

var classMap = {

    "AbstractSecurityScheme": (x,y)=>{return new RamlWrapper.AbstractSecuritySchemeImpl(x,y)},

    "AnnotationRef": (x)=>{return new RamlWrapper.AnnotationRefImpl(x)},

    "AnnotationTarget": (x)=>{return new RamlWrapper.AnnotationTargetImpl(x)},

    "AnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.AnnotationTypeDeclarationImpl(x,y)},

    "AnyType": (x)=>{return new RamlWrapper.AnyTypeImpl(x)},

    "Api": (x,y)=>{return new RamlWrapper.ApiImpl(x,y)},

    "ArrayAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.ArrayAnnotationTypeDeclarationImpl(x,y)},

    "ArrayTypeDeclaration": (x,y)=>{return new RamlWrapper.ArrayTypeDeclarationImpl(x,y)},

    "BasicSecurityScheme": (x,y)=>{return new RamlWrapper.BasicSecuritySchemeImpl(x,y)},

    "BooleanAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.BooleanAnnotationTypeDeclarationImpl(x,y)},

    "BooleanType": (x)=>{return new RamlWrapper.BooleanTypeImpl(x)},

    "BooleanTypeDeclaration": (x,y)=>{return new RamlWrapper.BooleanTypeDeclarationImpl(x,y)},

    "ContentType": (x)=>{return new RamlWrapper.ContentTypeImpl(x)},

    "CustomSecurityScheme": (x,y)=>{return new RamlWrapper.CustomSecuritySchemeImpl(x,y)},

    "DateFormatSpec": (x)=>{return new RamlWrapper.DateFormatSpecImpl(x)},

    "DateTypeAnnotationDeclaration": (x,y)=>{return new RamlWrapper.DateTypeAnnotationDeclarationImpl(x,y)},

    "DateTypeDeclaration": (x,y)=>{return new RamlWrapper.DateTypeDeclarationImpl(x,y)},

    "DigestSecurityScheme": (x,y)=>{return new RamlWrapper.DigestSecuritySchemeImpl(x,y)},

    "DocumentationItem": (x,y)=>{return new RamlWrapper.DocumentationItemImpl(x,y)},

    "ExampleSpec": (x,y)=>{return new RamlWrapper.ExampleSpecImpl(x,y)},

    "ExampleString": (x)=>{return new RamlWrapper.ExampleStringImpl(x)},

    "Extension": (x,y)=>{return new RamlWrapper.ExtensionImpl(x,y)},

    "FileTypeDeclaration": (x,y)=>{return new RamlWrapper.FileTypeDeclarationImpl(x,y)},

    "FixedUriString": (x)=>{return new RamlWrapper.FixedUriStringImpl(x)},

    "FullUriTemplateString": (x)=>{return new RamlWrapper.FullUriTemplateStringImpl(x)},

    "FunctionalInterface": (x)=>{return new RamlWrapper.FunctionalInterfaceImpl(x)},

    "GlobalSchema": (x,y)=>{return new RamlWrapper.GlobalSchemaImpl(x,y)},

    "HasNormalParameters": (x,y)=>{return new RamlWrapper.HasNormalParametersImpl(x,y)},

    "ImportDeclaration": (x,y)=>{return new RamlWrapper.ImportDeclarationImpl(x,y)},

    "IntegerTypeDeclaration": (x,y)=>{return new RamlWrapper.IntegerTypeDeclarationImpl(x,y)},

    "JSonSchemaString": (x)=>{return new RamlWrapper.JSonSchemaStringImpl(x)},

    "Library": (x,y)=>{return new RamlWrapper.LibraryImpl(x,y)},

    "LibraryBase": (x,y)=>{return new RamlWrapper.LibraryBaseImpl(x,y)},

    "LocationKind": (x)=>{return new RamlWrapper.LocationKindImpl(x)},

    "MarkdownString": (x)=>{return new RamlWrapper.MarkdownStringImpl(x)},

    "Method": (x,y)=>{return new RamlWrapper.MethodImpl(x,y)},

    "MethodBase": (x,y)=>{return new RamlWrapper.MethodBaseImpl(x,y)},

    "MimeType": (x)=>{return new RamlWrapper.MimeTypeImpl(x)},

    "ModelLocation": (x)=>{return new RamlWrapper.ModelLocationImpl(x)},

    "NumberAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.NumberAnnotationTypeDeclarationImpl(x,y)},

    "NumberType": (x)=>{return new RamlWrapper.NumberTypeImpl(x)},

    "NumberTypeDeclaration": (x,y)=>{return new RamlWrapper.NumberTypeDeclarationImpl(x,y)},

    "OAuth1SecurityScheme": (x,y)=>{return new RamlWrapper.OAuth1SecuritySchemeImpl(x,y)},

    "OAuth1SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.OAuth1SecuritySchemeSettingsImpl(x,y)},

    "OAuth2SecurityScheme": (x,y)=>{return new RamlWrapper.OAuth2SecuritySchemeImpl(x,y)},

    "OAuth2SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.OAuth2SecuritySchemeSettingsImpl(x,y)},

    "ObjectAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.ObjectAnnotationTypeDeclarationImpl(x,y)},

    "ObjectTypeDeclaration": (x,y)=>{return new RamlWrapper.ObjectTypeDeclarationImpl(x,y)},

    "Overlay": (x,y)=>{return new RamlWrapper.OverlayImpl(x,y)},

    "PassThroughSecurityScheme": (x,y)=>{return new RamlWrapper.PassThroughSecuritySchemeImpl(x,y)},

    "PassThroughSecuritySchemeSettings": (x,y)=>{return new RamlWrapper.PassThroughSecuritySchemeSettingsImpl(x,y)},

    "RAMLExpression": (x,y)=>{return new RamlWrapper.RAMLExpressionImpl(x,y)},

    "RAMLExpressionAnnotation": (x,y)=>{return new RamlWrapper.RAMLExpressionAnnotationImpl(x,y)},

    "RAMLLanguageElement": (x,y)=>{return new RamlWrapper.RAMLLanguageElementImpl(x,y)},

    "RAMLSelector": (x)=>{return new RamlWrapper.RAMLSelectorImpl(x)},

    "RAMLSimpleElement": (x,y)=>{return new RamlWrapper.RAMLSimpleElementImpl(x,y)},

    "Reference": (x)=>{return new RamlWrapper.ReferenceImpl(x)},

    "RelativeUriString": (x)=>{return new RamlWrapper.RelativeUriStringImpl(x)},

    "Resource": (x,y)=>{return new RamlWrapper.ResourceImpl(x,y)},

    "ResourceBase": (x,y)=>{return new RamlWrapper.ResourceBaseImpl(x,y)},

    "ResourceType": (x,y)=>{return new RamlWrapper.ResourceTypeImpl(x,y)},

    "ResourceTypeRef": (x)=>{return new RamlWrapper.ResourceTypeRefImpl(x)},

    "Response": (x,y)=>{return new RamlWrapper.ResponseImpl(x,y)},

    "SchemaElement": (x,y)=>{return new RamlWrapper.SchemaElementImpl(x,y)},

    "SchemaString": (x)=>{return new RamlWrapper.SchemaStringImpl(x)},

    "SecuritySchemePart": (x,y)=>{return new RamlWrapper.SecuritySchemePartImpl(x,y)},

    "SecuritySchemeRef": (x)=>{return new RamlWrapper.SecuritySchemeRefImpl(x)},

    "SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.SecuritySchemeSettingsImpl(x,y)},

    "StatusCodeString": (x)=>{return new RamlWrapper.StatusCodeStringImpl(x)},

    "StringAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.StringAnnotationTypeDeclarationImpl(x,y)},

    "StringType": (x)=>{return new RamlWrapper.StringTypeImpl(x)},

    "StringTypeDeclaration": (x,y)=>{return new RamlWrapper.StringTypeDeclarationImpl(x,y)},

    "Trait": (x,y)=>{return new RamlWrapper.TraitImpl(x,y)},

    "TraitRef": (x)=>{return new RamlWrapper.TraitRefImpl(x)},

    "TypeDeclaration": (x,y)=>{return new RamlWrapper.TypeDeclarationImpl(x,y)},

    "UnionAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.UnionAnnotationTypeDeclarationImpl(x,y)},

    "UnionTypeDeclaration": (x,y)=>{return new RamlWrapper.UnionTypeDeclarationImpl(x,y)},

    "UriTemplate": (x)=>{return new RamlWrapper.UriTemplateImpl(x)},

    "ValidityExpression": (x)=>{return new RamlWrapper.ValidityExpressionImpl(x)},

    "ValueAnnotationTypeDeclaration": (x,y)=>{return new RamlWrapper.ValueAnnotationTypeDeclarationImpl(x,y)},

    "ValueType": (x)=>{return new RamlWrapper.ValueTypeImpl(x)},

    "ValueTypeDeclaration": (x,y)=>{return new RamlWrapper.ValueTypeDeclarationImpl(x,y)},

    "XMLSchemaString": (x)=>{return new RamlWrapper.XMLSchemaStringImpl(x)}

};
