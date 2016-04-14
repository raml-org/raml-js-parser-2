import RamlWrapper = require("./raml08parser");
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
            if (superTypeName=="hl.BasicNode"){
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
        wrapperConstructor = classMap["hl.BasicNode"]

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

    "AnyType": (x)=>{return new RamlWrapper.AnyTypeImpl(x)},

    "Api": (x,y)=>{return new RamlWrapper.ApiImpl(x,y)},

    "BasicSecurityScheme": (x,y)=>{return new RamlWrapper.BasicSecuritySchemeImpl(x,y)},

    "BodyLike": (x,y)=>{return new RamlWrapper.BodyLikeImpl(x,y)},

    "BooleanType": (x)=>{return new RamlWrapper.BooleanTypeImpl(x)},

    "BooleanTypeDeclaration": (x,y)=>{return new RamlWrapper.BooleanTypeDeclarationImpl(x,y)},

    "CustomSecurityScheme": (x,y)=>{return new RamlWrapper.CustomSecuritySchemeImpl(x,y)},

    "DateTypeDeclaration": (x,y)=>{return new RamlWrapper.DateTypeDeclarationImpl(x,y)},

    "DigestSecurityScheme": (x,y)=>{return new RamlWrapper.DigestSecuritySchemeImpl(x,y)},

    "DocumentationItem": (x,y)=>{return new RamlWrapper.DocumentationItemImpl(x,y)},

    "ExampleString": (x)=>{return new RamlWrapper.ExampleStringImpl(x)},

    "FileTypeDeclaration": (x,y)=>{return new RamlWrapper.FileTypeDeclarationImpl(x,y)},

    "FixedUri": (x)=>{return new RamlWrapper.FixedUriImpl(x)},

    "FullUriTemplateString": (x)=>{return new RamlWrapper.FullUriTemplateStringImpl(x)},

    "GlobalSchema": (x,y)=>{return new RamlWrapper.GlobalSchemaImpl(x,y)},

    "HasNormalParameters": (x,y)=>{return new RamlWrapper.HasNormalParametersImpl(x,y)},

    "IntegerTypeDeclaration": (x,y)=>{return new RamlWrapper.IntegerTypeDeclarationImpl(x,y)},

    "JSONBody": (x,y)=>{return new RamlWrapper.JSONBodyImpl(x,y)},

    "JSONExample": (x)=>{return new RamlWrapper.JSONExampleImpl(x)},

    "JSonSchemaString": (x)=>{return new RamlWrapper.JSonSchemaStringImpl(x)},

    "MarkdownString": (x)=>{return new RamlWrapper.MarkdownStringImpl(x)},

    "Method": (x,y)=>{return new RamlWrapper.MethodImpl(x,y)},

    "MethodBase": (x,y)=>{return new RamlWrapper.MethodBaseImpl(x,y)},

    "MimeType": (x)=>{return new RamlWrapper.MimeTypeImpl(x)},

    "NumberType": (x)=>{return new RamlWrapper.NumberTypeImpl(x)},

    "NumberTypeDeclaration": (x,y)=>{return new RamlWrapper.NumberTypeDeclarationImpl(x,y)},

    "OAuth1SecurityScheme": (x,y)=>{return new RamlWrapper.OAuth1SecuritySchemeImpl(x,y)},

    "OAuth1SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.OAuth1SecuritySchemeSettingsImpl(x,y)},

    "OAuth2SecurityScheme": (x,y)=>{return new RamlWrapper.OAuth2SecuritySchemeImpl(x,y)},

    "OAuth2SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.OAuth2SecuritySchemeSettingsImpl(x,y)},

    "Parameter": (x,y)=>{return new RamlWrapper.ParameterImpl(x,y)},

    "ParameterLocation": (x)=>{return new RamlWrapper.ParameterLocationImpl(x)},

    "RAMLLanguageElement": (x,y)=>{return new RamlWrapper.RAMLLanguageElementImpl(x,y)},

    "RAMLSimpleElement": (x,y)=>{return new RamlWrapper.RAMLSimpleElementImpl(x,y)},

    "Reference": (x)=>{return new RamlWrapper.ReferenceImpl(x)},

    "RelativeUriString": (x)=>{return new RamlWrapper.RelativeUriStringImpl(x)},

    "Resource": (x,y)=>{return new RamlWrapper.ResourceImpl(x,y)},

    "ResourceType": (x,y)=>{return new RamlWrapper.ResourceTypeImpl(x,y)},

    "ResourceTypeRef": (x)=>{return new RamlWrapper.ResourceTypeRefImpl(x)},

    "Response": (x,y)=>{return new RamlWrapper.ResponseImpl(x,y)},

    "SchemaString": (x)=>{return new RamlWrapper.SchemaStringImpl(x)},

    "SecuritySchemePart": (x,y)=>{return new RamlWrapper.SecuritySchemePartImpl(x,y)},

    "SecuritySchemeRef": (x)=>{return new RamlWrapper.SecuritySchemeRefImpl(x)},

    "SecuritySchemeSettings": (x,y)=>{return new RamlWrapper.SecuritySchemeSettingsImpl(x,y)},

    "StatusCodeString": (x)=>{return new RamlWrapper.StatusCodeStringImpl(x)},

    "StringType": (x)=>{return new RamlWrapper.StringTypeImpl(x)},

    "StringTypeDeclaration": (x,y)=>{return new RamlWrapper.StringTypeDeclarationImpl(x,y)},

    "Trait": (x,y)=>{return new RamlWrapper.TraitImpl(x,y)},

    "TraitRef": (x)=>{return new RamlWrapper.TraitRefImpl(x)},

    "UriTemplate": (x)=>{return new RamlWrapper.UriTemplateImpl(x)},

    "ValueType": (x)=>{return new RamlWrapper.ValueTypeImpl(x)},

    "XMLBody": (x,y)=>{return new RamlWrapper.XMLBodyImpl(x,y)},

    "XMLExample": (x)=>{return new RamlWrapper.XMLExampleImpl(x)},

    "XMLSchemaString": (x)=>{return new RamlWrapper.XMLSchemaStringImpl(x)}

};
