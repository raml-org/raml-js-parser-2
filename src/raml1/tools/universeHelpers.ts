import hl=require("../../raml1/highLevelAST")
import universe = require("./universe")

/////////////////////// properties

export function isDocumentationProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.Api.properties.documentation.name ||
        p.nameId() === universe.Universe08.Api.properties.documentation.name;
}

export function isUsagePropertyName(name : string) : boolean {
    return name === universe.Universe10.Trait.properties.usage.name ||
        name === universe.Universe08.Trait.properties.usage.name ||
        name === universe.Universe10.ResourceType.properties.usage.name ||
        name === universe.Universe08.ResourceType.properties.usage.name ||
        name === universe.Universe10.Library.properties.usage.name ||
        name === universe.Universe10.Overlay.properties.usage.name ||
        name === universe.Universe10.Extension.properties.usage.name;
}

export function isUsageProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return isUsagePropertyName(p.nameId());
}

export function isMasterRefProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() == universe.Universe10.Overlay.properties.extends.name ||
        p.nameId() == universe.Universe10.Extension.properties.extends.name;
}

export function isDescriptionPropertyName(name : string) : boolean {
    return name === universe.Universe10.TypeDeclaration.properties.description.name ||
        name === "description";
    //TODO too long to actually list every element having a description, so a couple of checks to cause compile error, and a simple equals check. Also we do not want to affect performance that much.
}

export function isDescriptionProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isDescriptionPropertyName(p.nameId());
}

export function isRequiredPropertyName(name : string) : boolean {
    return name === universe.Universe10.TypeDeclaration.properties.required.name ||
        name === universe.Universe08.Parameter.properties.required.name ||
        name === "required";
    //TODO too long to actually list every element having displayname, so a couple of checks to cause compile error, and a simple equals check. Also we do not want to affect performance that much.
}

export function isDisplayNamePropertyName(name : string) : boolean {
    return name === universe.Universe10.TypeDeclaration.properties.displayName.name ||
        name === "displayName";
    //TODO too long to actually list every element having displayname, so a couple of checks to cause compile error, and a simple equals check. Also we do not want to affect performance that much.
}

export function isDisplayNameProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isDisplayNamePropertyName(p.nameId());
}

export function isRequiredProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isRequiredPropertyName(p.nameId());
}

export function isTitlePropertyName(name : string) : boolean {
    return name === universe.Universe10.Api.properties.title.name ||
        name === universe.Universe08.Api.properties.title.name ||
        name === universe.Universe10.DocumentationItem.properties.title.name ||
        name === universe.Universe08.DocumentationItem.properties.title.name ||
        name === universe.Universe10.Overlay.properties.title.name ||
        name === universe.Universe10.Extension.properties.title.name;
}

export function isTitleProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isTitlePropertyName(p.nameId());
}

export function isHeadersProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isHeadersPropertyName(p.nameId());
}

export function isHeadersPropertyName(name : string) : boolean {
    return name === universe.Universe08.MethodBase.properties.headers.name ||
        name === universe.Universe08.Response.properties.headers.name ||
        name === universe.Universe08.SecuritySchemePart.properties.headers.name ||
        name === universe.Universe10.MethodBase.properties.headers.name ||
        name === universe.Universe10.Response.properties.headers.name
}

export function isFormParametersProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isFormParametersPropertyName(p.nameId());
}

export function isFormParametersPropertyName(name : string) : boolean {
    return name === universe.Universe08.BodyLike.properties.formParameters.name;
}

export function isQueryParametersProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return isQueryParametersPropertyName(p.nameId());
}

export function isQueryParametersPropertyName(name : string) : boolean {
    return name === universe.Universe08.MethodBase.properties.queryParameters.name ||
        name === universe.Universe08.SecuritySchemePart.properties.queryParameters.name ||
        name === universe.Universe10.MethodBase.properties.queryParameters.name
}

export function isAnnotationsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.Api.properties.annotations.name ||
    //p.nameId() === universe.Universe10.AbstractSecurityScheme.properties.annotations.name ||
    p.nameId() === universe.Universe10.TypeDeclaration.properties.annotations.name ||
    p.nameId() === universe.Universe10.Response.properties.annotations.name;
}

export function isAnnotationProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.AnnotationRef.properties.annotation.name
}


export function isIsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.MethodBase.properties.is.name ||
    p.nameId() === universe.Universe08.Method.properties.is.name ||
    p.nameId() === universe.Universe10.ResourceBase.properties.is.name ||
    p.nameId() === universe.Universe08.ResourceType.properties.is.name ||
    p.nameId() === universe.Universe08.Resource.properties.is.name;
}

export function isSecuredByProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.Api.properties.securedBy.name ||
    p.nameId() === universe.Universe08.Api.properties.securedBy.name ||
    p.nameId() === universe.Universe10.MethodBase.properties.securedBy.name ||
    p.nameId() === universe.Universe08.MethodBase.properties.securedBy.name ||
    p.nameId() === universe.Universe08.ResourceType.properties.securedBy.name ||
    p.nameId() === universe.Universe08.Resource.properties.securedBy.name ||
    p.nameId() === universe.Universe10.ResourceBase.properties.securedBy.name;
}

export function isSecuritySchemesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.LibraryBase.properties.securitySchemes.name ||
        p.nameId() === universe.Universe08.Api.properties.securitySchemes.name;
}

export function isSecuritySchemeProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.SecuritySchemeRef.properties.securityScheme.name ||
        p.nameId() === universe.Universe08.SecuritySchemeRef.properties.securityScheme.name;
}

export function isTypeOrSchemaProperty(p:hl.IProperty) : boolean {
    return isTypeProperty(p)||isSchemaProperty(p);
}

export function isTypeProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.AbstractSecurityScheme.properties.type.name ||
    p.nameId() === universe.Universe08.AbstractSecurityScheme.properties.type.name ||
    p.nameId() === universe.Universe08.ResourceType.properties.type.name ||
    p.nameId() === universe.Universe08.Resource.properties.type.name ||
    p.nameId() === universe.Universe08.Parameter.properties.type.name ||
    p.nameId() === universe.Universe10.ResourceBase.properties.type.name ||
    p.nameId() === universe.Universe10.TypeDeclaration.properties.type.name;
}

export function isItemsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.ArrayTypeDeclaration.properties.items.name;
}

export function isStructuredItemsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.ArrayTypeDeclaration.properties.structuredItems.name;
}


export function isPropertiesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.ObjectTypeDeclaration.properties.properties.name;
}

export function isResponsesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.MethodBase.properties.responses.name||
    p.nameId() === universe.Universe08.MethodBase.properties.responses.name;
}

export function isProtocolsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.Api.properties.protocols.name ||
    p.nameId() === universe.Universe08.Api.properties.protocols.name ||
    p.nameId() === universe.Universe10.MethodBase.properties.protocols.name;
}

export function isNameProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.TypeDeclaration.properties.name.name ||
    p.nameId() === universe.Universe10.TypeDeclaration.properties.name.name ||
    p.nameId() === universe.Universe08.AbstractSecurityScheme.properties.name.name ||
    p.nameId() === universe.Universe10.AbstractSecurityScheme.properties.name.name ||
    p.nameId() === universe.Universe08.Trait.properties.name.name ||
    p.nameId() === universe.Universe10.Trait.properties.name.name ||
    p.nameId() === "name";
    //TODO too long to actually list every element having a name, so a couple of checks to cause compile error, and a simple equals check. Also we do not want to affect performance that much.
}

export function isBodyProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.MethodBase.properties.body.name ||
    p.nameId() === universe.Universe08.MethodBase.properties.body.name ||
    p.nameId() === universe.Universe10.Response.properties.body.name ||
    p.nameId() === universe.Universe08.Response.properties.body.name
}

export function isDefaultValue(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.TypeDeclaration.properties.default.name ||
        p.nameId() === universe.Universe08.Parameter.properties.default.name;
}

export function isSchemaProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.BodyLike.properties.schema.name ||
    p.nameId() === universe.Universe08.XMLBody.properties.schema.name ||
    p.nameId() === universe.Universe08.JSONBody.properties.schema.name ||
    p.nameId() === universe.Universe10.TypeDeclaration.properties.schema.name;
}

export function isTraitsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.Api.properties.traits.name ||
        p.nameId() === universe.Universe10.LibraryBase.properties.traits.name;
}

export function isTraitProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.TraitRef.properties.trait.name ||
        p.nameId() === universe.Universe10.TraitRef.properties.trait.name;
}

export function isResourceTypesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.Api.properties.resourceTypes.name ||
        p.nameId() === universe.Universe10.LibraryBase.properties.resourceTypes.name;
}

export function isResourceTypeProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.ResourceTypeRef.properties.resourceType.name ||
        p.nameId() === universe.Universe10.ResourceTypeRef.properties.resourceType.name;
}

export function isFacetsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.TypeDeclaration.properties.facets.name;
}

export function isSchemasProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.Api.properties.schemas.name ||
        p.nameId() === universe.Universe10.LibraryBase.properties.schemas.name;
}

//export function isSignatureProperty(p:hl.IProperty) : boolean {
//    return p.nameId() === universe.Universe10.Method.properties.signature.name ||
//    p.nameId() === universe.Universe10.Resource.properties.signature.name;
//}

export function isResourcesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.Api.properties.resources.name ||
    p.nameId() === universe.Universe08.Api.properties.resources.name ||
    p.nameId() === universe.Universe10.Resource.properties.resources.name ||
    p.nameId() === universe.Universe08.Resource.properties.resources.name;
}

export function isMethodsProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.ResourceBase.properties.methods.name ||
        p.nameId() === universe.Universe08.Resource.properties.methods.name ||
        p.nameId() === universe.Universe08.ResourceType.properties.methods.name;
}

export function isTypesProperty(p:hl.IProperty) : boolean {
    return p && p.nameId() === universe.Universe10.LibraryBase.properties.types.name;
}

export function isExampleProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.TypeDeclaration.properties.example.name ||
    p.nameId() === "example";
    //TODO too long to actually list every element having an example, so a couple of checks to cause compile error, and a simple equals check. Also we do not want to affect performance that much.
}

export function isEnumProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.StringTypeDeclaration.properties.enum.name
        ||p.nameId() === universe.Universe10.NumberTypeDeclaration.properties.enum.name
        ||p.nameId() === universe.Universe08.StringTypeDeclaration.properties.enum.name;
}

export function isExamplesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe10.TypeDeclaration.properties.example.name||p.nameId() === universe.Universe10.TypeDeclaration.properties.examples.name
}

export function isValueProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.GlobalSchema.properties.value.name
}

export function isUriParametersProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.Api.properties.uriParameters.name ||
    p.nameId() === universe.Universe08.ResourceType.properties.uriParameters.name ||
    p.nameId() === universe.Universe08.Resource.properties.uriParameters.name ||
    p.nameId() === universe.Universe10.ResourceBase.properties.uriParameters.name;

}

export function isBaseUriParametersProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }
    return p.nameId() === universe.Universe08.Resource.properties.baseUriParameters.name ||
    p.nameId() === universe.Universe08.Api.properties.baseUriParameters.name ||
    p.nameId() === universe.Universe10.Api.properties.baseUriParameters.name;

}

export function isRAMLVersionProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe08.Api.properties.RAMLVersion.name ||
        p.nameId() === universe.Universe10.Api.properties.RAMLVersion.name;

}

export function isUsesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.FragmentDeclaration.properties.uses.name;
}

export function isAnnotationTypesProperty(p:hl.IProperty) : boolean {
    if(!p) {
        return false;
    }

    return p.nameId() === universe.Universe10.LibraryBase.properties.annotationTypes.name;
}

/////////////////////// types

export function isMethodType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Method ||
        type.key() == universe.Universe08.Method;
}

export function isApiType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Api ||
    type.key() == universe.Universe08.Api;
}

export function isBooleanTypeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.BooleanType ||
    type.key() == universe.Universe08.BooleanType;
}

export function isMarkdownStringType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.MarkdownString ||
    type.key() == universe.Universe08.MarkdownString;
}

export function isResourceType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Resource ||
    type.key() == universe.Universe08.Resource;
}

export function isTraitType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Trait ||
    type.key() == universe.Universe08.Trait;
}

export function isTraitRefType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.TraitRef ||
        type.key() == universe.Universe08.TraitRef;
}

export function isResourceTypeRefType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.ResourceTypeRef ||
        type.key() == universe.Universe08.ResourceTypeRef;
}

export function isGlobalSchemaType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe08.GlobalSchema;
}

export function isSecuritySchemaType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.AbstractSecurityScheme ||
    type.key() == universe.Universe08.AbstractSecurityScheme;
}

export function isSecuritySchemaTypeDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.AbstractSecurityScheme.name);
}

export function isSecuritySchemeRefType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.SecuritySchemeRef ||
        type.key() == universe.Universe08.SecuritySchemeRef;
}

export function isTypeDeclarationType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.TypeDeclaration;
}

export function isResponseType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Response ||
    type.key() == universe.Universe08.Response;
}

export function isBodyLikeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe08.BodyLike;
}

export function isOverlayType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Overlay;
}

export function isAnnotationTypeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return false;
}

export function isResourceTypeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.ResourceType ||
    type.key() == universe.Universe08.ResourceType;
}

export function isSchemaStringType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.SchemaString ||
    type.key() == universe.Universe08.SchemaString;
}

export function isMethodBaseType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.MethodBase ||
    type.key() == universe.Universe08.MethodBase;
}



export function isLibraryType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Library;
}

export function isStringTypeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.StringType ||
        type.key() == universe.Universe08.StringType;
}

export function isAnyTypeType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.AnyType ||
        type.key() == universe.Universe08.AnyType;
}

export function isExampleSpecType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.ExampleSpec;
}

export function isExtensionType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.Extension;
}

export function isTypeDeclarationTypeOrDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.TypeDeclaration.name);
}

export function isDocumentationType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.DocumentationItem ||
        type.key() == universe.Universe08.DocumentationItem;
}

export function isAnnotationRefTypeOrDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.AnnotationRef.name);
}

export function isApiSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.Api.name)||type.isAssignableFrom(universe.Universe08.Api.name);
}

export function isLibraryBaseSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.LibraryBase.name);
}

export function isResourceBaseSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.ResourceBase.name)||type.isAssignableFrom(universe.Universe08.Resource.name);
}

export function isObjectTypeDeclarationSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.ObjectTypeDeclaration.name);
}

export function isArrayTypeDeclarationSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.ArrayTypeDeclaration.name);
}

export function isTypeDeclarationDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.TypeDeclaration.name);
}

export function isParameterDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe08.Parameter.name);
}

export function isStringTypeDeclarationDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.StringTypeDeclaration.name);
}

export function isStringTypeDescendant(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.StringType.name);
}


/**
 * @deprecated use 'isTypeDeclarationDescendant'
 */
export function isTypeDeclarationSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.TypeDeclaration.name);
}


export function isMethodBaseSibling(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.isAssignableFrom(universe.Universe10.MethodBase.name) ||
        type.isAssignableFrom(universe.Universe08.MethodBase.name);
}

export function isSecuritySchemePartType(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.key() == universe.Universe10.SecuritySchemePart ||
        type.key() == universe.Universe08.SecuritySchemePart;
}

export function isMediaTypeProperty(p:hl.IProperty) : boolean {
    return p.nameId() === universe.Universe08.Api.properties.mediaType.name ||
        p.nameId() === universe.Universe10.Api.properties.mediaType.name;

}

export function isRAML08Type(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.universe().version()=="RAML08";
}

export function isRAML10Type(type: hl.INodeDefinition | hl.ITypeDefinition) : boolean {
    return type.universe().version()=="RAML10";
}

export function isRAML08Node(node : hl.IHighLevelNode ) : boolean {
    return isRAML08Type(node.definition());
}

export function isRAML08Attribute(node : hl.IAttribute ) : boolean {
    return isRAML08Type(node.definition());
}

export function isRAML10Node(node : hl.IHighLevelNode ) : boolean {
    return isRAML10Type(node.definition());
}

export function isRAML10Attribute(node : hl.IAttribute ) : boolean {
    return isRAML10Type(node.definition());
}
