declare var Universes: {
    "Universe08": {
        "GlobalSchema": {
            "name": string;
            "properties": {
                "key": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
            };
        };
        "Api": {
            "name": string;
            "properties": {
                "title": {
                    "name": string;
                };
                "version": {
                    "name": string;
                };
                "baseUri": {
                    "name": string;
                };
                "baseUriParameters": {
                    "name": string;
                };
                "uriParameters": {
                    "name": string;
                };
                "protocols": {
                    "name": string;
                };
                "mediaType": {
                    "name": string;
                };
                "schemas": {
                    "name": string;
                };
                "traits": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "securitySchemes": {
                    "name": string;
                };
                "resourceTypes": {
                    "name": string;
                };
                "resources": {
                    "name": string;
                };
                "documentation": {
                    "name": string;
                };
                "RAMLVersion": {
                    "name": string;
                };
            };
        };
        "DocumentationItem": {
            "name": string;
            "properties": {
                "title": {
                    "name": string;
                };
                "content": {
                    "name": string;
                };
            };
        };
        "ValueType": {
            "name": string;
            "properties": {};
        };
        "StringType": {
            "name": string;
            "properties": {};
        };
        "AnyType": {
            "name": string;
            "properties": {};
        };
        "NumberType": {
            "name": string;
            "properties": {};
        };
        "BooleanType": {
            "name": string;
            "properties": {};
        };
        "Referencable": {
            "name": string;
            "properties": {};
        };
        "Reference": {
            "name": string;
            "properties": {
                "structuredValue": {
                    "name": string;
                };
                "name": {
                    "name": string;
                };
            };
        };
        "DeclaresDynamicType": {
            "name": string;
            "properties": {};
        };
        "UriTemplate": {
            "name": string;
            "properties": {};
        };
        "RelativeUriString": {
            "name": string;
            "properties": {};
        };
        "FullUriTemplateString": {
            "name": string;
            "properties": {};
        };
        "FixedUri": {
            "name": string;
            "properties": {};
        };
        "MarkdownString": {
            "name": string;
            "properties": {};
        };
        "SchemaString": {
            "name": string;
            "properties": {};
        };
        "JSonSchemaString": {
            "name": string;
            "properties": {};
        };
        "XMLSchemaString": {
            "name": string;
            "properties": {};
        };
        "ExampleString": {
            "name": string;
            "properties": {};
        };
        "StatusCodeString": {
            "name": string;
            "properties": {};
        };
        "JSONExample": {
            "name": string;
            "properties": {};
        };
        "XMLExample": {
            "name": string;
            "properties": {};
        };
        "TypeInstance": {
            "name": string;
            "properties": {
                "properties": {
                    "name": string;
                };
                "isScalar": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
            };
        };
        "TypeInstanceProperty": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
                "values": {
                    "name": string;
                };
                "isArray": {
                    "name": string;
                };
            };
        };
        "RAMLLanguageElement": {
            "name": string;
            "properties": {
                "description": {
                    "name": string;
                };
            };
        };
        "RAMLSimpleElement": {
            "name": string;
            "properties": {};
        };
        "ResourceTypeRef": {
            "name": string;
            "properties": {
                "resourceType": {
                    "name": string;
                };
            };
        };
        "TraitRef": {
            "name": string;
            "properties": {
                "trait": {
                    "name": string;
                };
            };
        };
        "MethodBase": {
            "name": string;
            "properties": {
                "responses": {
                    "name": string;
                };
                "body": {
                    "name": string;
                };
                "protocols": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
            };
        };
        "Trait": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "usage": {
                    "name": string;
                };
                "parametrizedProperties": {
                    "name": string;
                };
            };
        };
        "ResourceType": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "usage": {
                    "name": string;
                };
                "methods": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "uriParameters": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "baseUriParameters": {
                    "name": string;
                };
                "parametrizedProperties": {
                    "name": string;
                };
            };
        };
        "Method": {
            "name": string;
            "properties": {
                "method": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
            };
        };
        "Resource": {
            "name": string;
            "properties": {
                "relativeUri": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "uriParameters": {
                    "name": string;
                };
                "methods": {
                    "name": string;
                };
                "resources": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "baseUriParameters": {
                    "name": string;
                };
            };
        };
        "SecuritySchemePart": {
            "name": string;
            "properties": {
                "headers": {
                    "name": string;
                };
                "queryParameters": {
                    "name": string;
                };
                "responses": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
            };
        };
        "SecuritySchemeSettings": {
            "name": string;
            "properties": {};
        };
        "AbstractSecurityScheme": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "describedBy": {
                    "name": string;
                };
                "settings": {
                    "name": string;
                };
            };
        };
        "SecuritySchemeRef": {
            "name": string;
            "properties": {
                "securitySchemeName": {
                    "name": string;
                };
                "securityScheme": {
                    "name": string;
                };
            };
        };
        "OAuth1SecuritySchemeSettings": {
            "name": string;
            "properties": {
                "requestTokenUri": {
                    "name": string;
                };
                "authorizationUri": {
                    "name": string;
                };
                "tokenCredentialsUri": {
                    "name": string;
                };
            };
        };
        "OAuth2SecuritySchemeSettings": {
            "name": string;
            "properties": {
                "accessTokenUri": {
                    "name": string;
                };
                "authorizationUri": {
                    "name": string;
                };
                "authorizationGrants": {
                    "name": string;
                };
                "scopes": {
                    "name": string;
                };
            };
        };
        "OAuth2SecurityScheme": {
            "name": string;
            "properties": {
                "settings": {
                    "name": string;
                };
            };
        };
        "OAuth1SecurityScheme": {
            "name": string;
            "properties": {
                "settings": {
                    "name": string;
                };
            };
        };
        "BasicSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "DigestSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "CustomSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "Parameter": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "location": {
                    "name": string;
                };
                "required": {
                    "name": string;
                };
                "default": {
                    "name": string;
                };
                "example": {
                    "name": string;
                };
                "repeat": {
                    "name": string;
                };
            };
        };
        "StringTypeDeclaration": {
            "name": string;
            "properties": {
                "pattern": {
                    "name": string;
                };
                "enum": {
                    "name": string;
                };
                "minLength": {
                    "name": string;
                };
                "maxLength": {
                    "name": string;
                };
            };
        };
        "BooleanTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "NumberTypeDeclaration": {
            "name": string;
            "properties": {
                "minimum": {
                    "name": string;
                };
                "maximum": {
                    "name": string;
                };
            };
        };
        "IntegerTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "DateTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "FileTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "HasNormalParameters": {
            "name": string;
            "properties": {
                "queryParameters": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "headers": {
                    "name": string;
                };
            };
        };
        "ParameterLocation": {
            "name": string;
            "properties": {};
        };
        "MimeTypeModel": {
            "name": string;
            "properties": {
                "type": {
                    "name": string;
                };
                "tree": {
                    "name": string;
                };
                "subtype": {
                    "name": string;
                };
                "suffix": {
                    "name": string;
                };
                "parameters": {
                    "name": string;
                };
            };
        };
        "MimeType": {
            "name": string;
            "properties": {};
        };
        "BodyLike": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "schema": {
                    "name": string;
                };
                "example": {
                    "name": string;
                };
                "formParameters": {
                    "name": string;
                };
                "schemaContent": {
                    "name": string;
                };
            };
        };
        "XMLBody": {
            "name": string;
            "properties": {
                "schema": {
                    "name": string;
                };
            };
        };
        "JSONBody": {
            "name": string;
            "properties": {
                "schema": {
                    "name": string;
                };
            };
        };
        "Response": {
            "name": string;
            "properties": {
                "code": {
                    "name": string;
                };
                "headers": {
                    "name": string;
                };
                "body": {
                    "name": string;
                };
            };
        };
    };
    "Universe10": {
        "GlobalSchema": {
            "name": string;
            "properties": {
                "key": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
            };
        };
        "ImportDeclaration": {
            "name": string;
            "properties": {
                "key": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
            };
        };
        "Library": {
            "name": string;
            "properties": {
                "usage": {
                    "name": string;
                };
                "name": {
                    "name": string;
                };
            };
        };
        "LibraryBase": {
            "name": string;
            "properties": {
                "schemas": {
                    "name": string;
                };
                "types": {
                    "name": string;
                };
                "traits": {
                    "name": string;
                };
                "resourceTypes": {
                    "name": string;
                };
                "annotationTypes": {
                    "name": string;
                };
                "securitySchemes": {
                    "name": string;
                };
                "uses": {
                    "name": string;
                };
            };
        };
        "Overlay": {
            "name": string;
            "properties": {
                "usage": {
                    "name": string;
                };
                "masterRef": {
                    "name": string;
                };
                "title": {
                    "name": string;
                };
            };
        };
        "Extension": {
            "name": string;
            "properties": {
                "usage": {
                    "name": string;
                };
                "masterRef": {
                    "name": string;
                };
                "title": {
                    "name": string;
                };
            };
        };
        "Api": {
            "name": string;
            "properties": {
                "title": {
                    "name": string;
                };
                "version": {
                    "name": string;
                };
                "baseUri": {
                    "name": string;
                };
                "baseUriParameters": {
                    "name": string;
                };
                "protocols": {
                    "name": string;
                };
                "mediaType": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "resources": {
                    "name": string;
                };
                "documentation": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
                "RAMLVersion": {
                    "name": string;
                };
            };
        };
        "DocumentationItem": {
            "name": string;
            "properties": {
                "title": {
                    "name": string;
                };
                "content": {
                    "name": string;
                };
            };
        };
        "ValueType": {
            "name": string;
            "properties": {};
        };
        "StringType": {
            "name": string;
            "properties": {};
        };
        "AnyType": {
            "name": string;
            "properties": {};
        };
        "NumberType": {
            "name": string;
            "properties": {};
        };
        "BooleanType": {
            "name": string;
            "properties": {};
        };
        "Referencable": {
            "name": string;
            "properties": {};
        };
        "Reference": {
            "name": string;
            "properties": {
                "structuredValue": {
                    "name": string;
                };
                "name": {
                    "name": string;
                };
            };
        };
        "DeclaresDynamicType": {
            "name": string;
            "properties": {};
        };
        "UriTemplate": {
            "name": string;
            "properties": {};
        };
        "StatusCodeString": {
            "name": string;
            "properties": {};
        };
        "RelativeUriString": {
            "name": string;
            "properties": {};
        };
        "FullUriTemplateString": {
            "name": string;
            "properties": {};
        };
        "FixedUriString": {
            "name": string;
            "properties": {};
        };
        "ContentType": {
            "name": string;
            "properties": {};
        };
        "ValidityExpression": {
            "name": string;
            "properties": {};
        };
        "MarkdownString": {
            "name": string;
            "properties": {};
        };
        "DateFormatSpec": {
            "name": string;
            "properties": {};
        };
        "FunctionalInterface": {
            "name": string;
            "properties": {};
        };
        "SchemaString": {
            "name": string;
            "properties": {};
        };
        "ExampleString": {
            "name": string;
            "properties": {};
        };
        "JSonSchemaString": {
            "name": string;
            "properties": {};
        };
        "XMLSchemaString": {
            "name": string;
            "properties": {};
        };
        "RAMLSelector": {
            "name": string;
            "properties": {};
        };
        "ExampleSpec": {
            "name": string;
            "properties": {
                "content": {
                    "name": string;
                };
                "strict": {
                    "name": string;
                };
                "name": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
                "structuredContent": {
                    "name": string;
                };
            };
        };
        "DataElementProperty": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "location": {
                    "name": string;
                };
                "locationKind": {
                    "name": string;
                };
                "default": {
                    "name": string;
                };
                "required": {
                    "name": string;
                };
            };
        };
        "TypeDeclaration": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "facets": {
                    "name": string;
                };
                "schema": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "location": {
                    "name": string;
                };
                "locationKind": {
                    "name": string;
                };
                "default": {
                    "name": string;
                };
                "example": {
                    "name": string;
                };
                "examples": {
                    "name": string;
                };
                "repeat": {
                    "name": string;
                };
                "required": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
                "fixedFacets": {
                    "name": string;
                };
                "schemaContent": {
                    "name": string;
                };
                "structuredExample": {
                    "name": string;
                };
            };
        };
        "ScalarElement": {
            "name": string;
            "properties": {
                "facets": {
                    "name": string;
                };
                "enum": {
                    "name": string;
                };
            };
        };
        "ArrayTypeDeclaration": {
            "name": string;
            "properties": {
                "uniqueItems": {
                    "name": string;
                };
                "items": {
                    "name": string;
                };
                "minItems": {
                    "name": string;
                };
                "maxItems": {
                    "name": string;
                };
            };
        };
        "UnionTypeDeclaration": {
            "name": string;
            "properties": {
                "discriminator": {
                    "name": string;
                };
            };
        };
        "ObjectTypeDeclaration": {
            "name": string;
            "properties": {
                "properties": {
                    "name": string;
                };
                "minProperties": {
                    "name": string;
                };
                "maxProperties": {
                    "name": string;
                };
                "additionalProperties": {
                    "name": string;
                };
                "patternProperties": {
                    "name": string;
                };
                "discriminator": {
                    "name": string;
                };
                "discriminatorValue": {
                    "name": string;
                };
            };
        };
        "StringTypeDeclaration": {
            "name": string;
            "properties": {
                "pattern": {
                    "name": string;
                };
                "minLength": {
                    "name": string;
                };
                "maxLength": {
                    "name": string;
                };
                "enum": {
                    "name": string;
                };
            };
        };
        "BooleanTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "ValueTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "NumberTypeDeclaration": {
            "name": string;
            "properties": {
                "minimum": {
                    "name": string;
                };
                "maximum": {
                    "name": string;
                };
                "enum": {
                    "name": string;
                };
                "format": {
                    "name": string;
                };
                "multipleOf": {
                    "name": string;
                };
            };
        };
        "IntegerTypeDeclaration": {
            "name": string;
            "properties": {
                "format": {
                    "name": string;
                };
            };
        };
        "RAMLExpression": {
            "name": string;
            "properties": {};
        };
        "SchemaElement": {
            "name": string;
            "properties": {};
        };
        "DateTypeDeclaration": {
            "name": string;
            "properties": {
                "dateFormat": {
                    "name": string;
                };
            };
        };
        "TypeInstance": {
            "name": string;
            "properties": {
                "properties": {
                    "name": string;
                };
                "isScalar": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
            };
        };
        "TypeInstanceProperty": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "value": {
                    "name": string;
                };
                "values": {
                    "name": string;
                };
                "isArray": {
                    "name": string;
                };
            };
        };
        "ModelLocation": {
            "name": string;
            "properties": {};
        };
        "LocationKind": {
            "name": string;
            "properties": {};
        };
        "MimeTypeModel": {
            "name": string;
            "properties": {
                "type": {
                    "name": string;
                };
                "tree": {
                    "name": string;
                };
                "subtype": {
                    "name": string;
                };
                "suffix": {
                    "name": string;
                };
                "parameters": {
                    "name": string;
                };
            };
        };
        "MimeType": {
            "name": string;
            "properties": {};
        };
        "Response": {
            "name": string;
            "properties": {
                "code": {
                    "name": string;
                };
                "headers": {
                    "name": string;
                };
                "body": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
            };
        };
        "RAMLLanguageElement": {
            "name": string;
            "properties": {
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
            };
        };
        "RAMLSimpleElement": {
            "name": string;
            "properties": {};
        };
        "AnnotationTypeDeclaration": {
            "name": string;
            "properties": {
                "allowMultiple": {
                    "name": string;
                };
                "allowedTargets": {
                    "name": string;
                };
                "usage": {
                    "name": string;
                };
            };
        };
        "AnnotationRef": {
            "name": string;
            "properties": {
                "annotation": {
                    "name": string;
                };
            };
        };
        "AnnotationTarget": {
            "name": string;
            "properties": {};
        };
        "Annotation": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
            };
        };
        "ArrayAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "UnionAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "ObjectAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "StringAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "BooleanAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "ValueAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "NumberAnnotationTypeDeclaration": {
            "name": string;
            "properties": {};
        };
        "RAMLExpressionAnnotation": {
            "name": string;
            "properties": {};
        };
        "DateTypeAnnotationDeclaration": {
            "name": string;
            "properties": {};
        };
        "ResourceTypeRef": {
            "name": string;
            "properties": {
                "resourceType": {
                    "name": string;
                };
            };
        };
        "TraitRef": {
            "name": string;
            "properties": {
                "trait": {
                    "name": string;
                };
            };
        };
        "SecuritySchemePart": {
            "name": string;
            "properties": {
                "headers": {
                    "name": string;
                };
                "queryParameters": {
                    "name": string;
                };
                "queryString": {
                    "name": string;
                };
                "responses": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
            };
        };
        "SecuritySchemeSettings": {
            "name": string;
            "properties": {};
        };
        "OAuth1SecuritySchemeSettings": {
            "name": string;
            "properties": {
                "requestTokenUri": {
                    "name": string;
                };
                "authorizationUri": {
                    "name": string;
                };
                "tokenCredentialsUri": {
                    "name": string;
                };
                "signatures": {
                    "name": string;
                };
            };
        };
        "OAuth2SecuritySchemeSettings": {
            "name": string;
            "properties": {
                "accessTokenUri": {
                    "name": string;
                };
                "authorizationUri": {
                    "name": string;
                };
                "authorizationGrants": {
                    "name": string;
                };
                "scopes": {
                    "name": string;
                };
            };
        };
        "PassThroughSecuritySchemeSettings": {
            "name": string;
            "properties": {
                "queryParameterName": {
                    "name": string;
                };
                "headerName": {
                    "name": string;
                };
            };
        };
        "SecuritySchemeRef": {
            "name": string;
            "properties": {
                "securitySchemeName": {
                    "name": string;
                };
                "securityScheme": {
                    "name": string;
                };
            };
        };
        "AbstractSecurityScheme": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "describedBy": {
                    "name": string;
                };
                "settings": {
                    "name": string;
                };
            };
        };
        "OAuth2SecurityScheme": {
            "name": string;
            "properties": {
                "settings": {
                    "name": string;
                };
            };
        };
        "OAuth1SecurityScheme": {
            "name": string;
            "properties": {
                "settings": {
                    "name": string;
                };
            };
        };
        "PassThroughSecurityScheme": {
            "name": string;
            "properties": {
                "settings": {
                    "name": string;
                };
            };
        };
        "BasicSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "DigestSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "CustomSecurityScheme": {
            "name": string;
            "properties": {};
        };
        "MethodBase": {
            "name": string;
            "properties": {
                "responses": {
                    "name": string;
                };
                "body": {
                    "name": string;
                };
                "protocols": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
            };
        };
        "Trait": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "usage": {
                    "name": string;
                };
                "uses": {
                    "name": string;
                };
                "parametrizedProperties": {
                    "name": string;
                };
            };
        };
        "ResourceBase": {
            "name": string;
            "properties": {
                "methods": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "type": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
                "uriParameters": {
                    "name": string;
                };
            };
        };
        "ResourceType": {
            "name": string;
            "properties": {
                "name": {
                    "name": string;
                };
                "usage": {
                    "name": string;
                };
                "uses": {
                    "name": string;
                };
                "parametrizedProperties": {
                    "name": string;
                };
            };
        };
        "ResourceTypeOrTrait": {
            "name": string;
            "properties": {
                "usage": {
                    "name": string;
                };
                "uses": {
                    "name": string;
                };
                "parameters": {
                    "name": string;
                };
            };
        };
        "Method": {
            "name": string;
            "properties": {
                "method": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "queryString": {
                    "name": string;
                };
                "queryParameters": {
                    "name": string;
                };
                "headers": {
                    "name": string;
                };
                "body": {
                    "name": string;
                };
                "is": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
                "securedBy": {
                    "name": string;
                };
            };
        };
        "Resource": {
            "name": string;
            "properties": {
                "relativeUri": {
                    "name": string;
                };
                "resources": {
                    "name": string;
                };
                "displayName": {
                    "name": string;
                };
                "description": {
                    "name": string;
                };
                "annotations": {
                    "name": string;
                };
            };
        };
        "FileTypeDeclaration": {
            "name": string;
            "properties": {
                "fileTypes": {
                    "name": string;
                };
                "minLength": {
                    "name": string;
                };
                "maxLength": {
                    "name": string;
                };
            };
        };
        "HasNormalParameters": {
            "name": string;
            "properties": {
                "queryParameters": {
                    "name": string;
                };
                "headers": {
                    "name": string;
                };
                "queryString": {
                    "name": string;
                };
            };
        };
        "Status": {
            "name": string;
            "properties": {
                "code": {
                    "name": string;
                };
                "message": {
                    "name": string;
                };
            };
        };
        "AuthentificationState": {
            "name": string;
            "properties": {};
        };
        "AuthentificationParameters": {
            "name": string;
            "properties": {};
        };
        "AuthData": {
            "name": string;
            "properties": {
                "authentificationParameters": {
                    "name": string;
                };
            };
        };
        "ParameterSpec": {
            "name": string;
            "properties": {};
        };
        "PromptSpec": {
            "name": string;
            "properties": {};
        };
        "UserResponse": {
            "name": string;
            "properties": {};
        };
        "QueryListener": {
            "name": string;
            "properties": {};
        };
        "EndPoint": {
            "name": string;
            "properties": {};
        };
        "EndPointSpec": {
            "name": string;
            "properties": {
                "url": {
                    "name": string;
                };
                "needToSendResponse": {
                    "name": string;
                };
            };
        };
        "SecurityEnvironment": {
            "name": string;
            "properties": {};
        };
        "AuthentificationManager": {
            "name": string;
            "properties": {};
        };
        "SchemeInfo": {
            "name": string;
            "properties": {
                "parameterSpec": {
                    "name": string;
                };
            };
        };
        "SecurityScheme": {
            "name": string;
            "properties": {};
        };
        "SecurityAwareApiClient": {
            "name": string;
            "properties": {};
        };
        "SecuritySchemeHook": {
            "name": string;
            "properties": {};
        };
        "StatusCode": {
            "name": string;
            "properties": {};
        };
    };
};
export = Universes;
