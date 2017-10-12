// import RamlWrapper = require("../../artifacts/raml10parserapi")
// import RamlWrapperImpl = require("../../artifacts/raml10parser")
// var path = require('path');
// var tools =require("../testTools")
// var _ =require("underscore")
// import hlImpl = require("../../highLevelImpl")
// import hl = require("../../highLevelAST")
// import definitionSystem = require("raml-definition-system")
// var universe = require("../../tools/universe");
// import ramlService = require("../../definition-system/ramlServices")
// import core = require("../../wrapped-ast/parserCore");
// import coreApi = require("../../wrapped-ast/parserCoreApi");
//
// export function convertToJson(api, transform: boolean, serializeMeta?:boolean):any{
//     return new RamlToJSonConverter10(serializeMeta).convertToJson(api,transform);
// }
//
// export class RamlToJSonConverter10{
//
//     constructor(private dumpMeta:boolean = false){}
//
//     convertToJson(api, transform:boolean){
//         var addTransformations = transform;
//         if (true) {
//             if (!api.title()) {
//                 throw new Error("missing title")
//             }
//         }
//         if (transform == null)
//             addTransformations = true;
//         var json = this.serializeLibrary(api, api);
//
//         if (api.title()) {
//             var numberTitle:number = +api.title();
//             if (numberTitle != null && !isNaN(numberTitle)) {
//                 json["title"] = "" + numberTitle;
//             }
//             else
//                 json["title"] = "" + api.title();
//         }
//         if (api.version()) {
//             json["version"] = api.version() + "";
//         }
//         if (api.baseUri() && api.baseUri().value()) {
//             json["baseUri"] = "" + api.baseUri().value();
//         }
//         if (api.mediaType() && api.mediaType().value()) {
//             json["mediaType"] = "" + api.mediaType().value();
//         }
//         var sb = this.serializeSecuredBy(api.securedBy());
//         if (sb.length > 0) {
//             json["securedBy"] = sb;
//         }
//         var dt = this.serializeDocumentation(api.documentation());
//         if (Object.keys(dt).length > 0) {
//             json["documentation"] = dt;
//         }
//         var protocolsJson = this.serializeProtocols(api, addTransformations);
//         if (protocolsJson.length > 0) {
//             json["protocols"] = protocolsJson;
//         }
//         var rs = this.serializeResources(api.resources(), api);
//         if (rs.length > 0) {
//             json["resources"] = rs;
//         }
//         json["RAMLVersion"] = api.RAMLVersion();
//         var isBaseUriParams = this.isDefined(api, 'baseUriParameters');
//         var baseUriParameters = this.serializeParameters(api.baseUriParameters(), api, 'uriParameters');
//         if (Object.keys(baseUriParameters).length > 0) {
//             //if (api.version()){
//             //    baseUriParameters["version"]['enum'] = [api.version() + ""];
//             //}
//             json["baseUriParameters"] = baseUriParameters;
//         } else if (isBaseUriParams) {
//             json["baseUriParameters"] = null;
//         }
//         if(api instanceof RamlWrapperImpl.OverlayImpl||api instanceof RamlWrapperImpl.ExtensionImpl){
//             json["masterRef"] = api.masterRef();
//         }
//
//         JSON.stringify(json, null, 2);
//         this.serializeMeta(json,api);
//         return json;
//     }
//
//     serializeLibrary(lib, api) {
//
//         var json = {};
//         var annotations = this.serializeReferences(lib.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(lib, 'annotations')) {
//             json["annotations"] = annotations;
//         }
//
//         if(!(lib instanceof RamlWrapperImpl.ApiImpl)){
//             if(lib.displayName()){
//                 json["displayName"] = lib.displayName();
//             }
//         }
//
//         if (this.isDefined(lib, 'usage')) {
//             json["usage"] = lib.usage() + "";
//         }
//         if (this.isDefined(lib, 'description')) {
//             json["description"] = lib.description().value() + "";
//         }
//         if (this.isDefined(lib, 'uses')) {
//             var usesArr:any[] = [];
//             var uses = lib.uses();
//             uses.forEach(x=> {
//                 var libObj = this.serializeLibrary(x, api);
//                 libObj['name'] = x.name();
//                 usesArr.push(libObj);
//             });
//             json['uses'] = usesArr;
//         }
//
//         var resourceTypes = this.serializeResourceTypes(lib.resourceTypes(), lib);
//         if (Object.keys(resourceTypes).length > 0) {
//             json["resourceTypes"] = resourceTypes;
//         }
//         var pt = this.serializeSchemas(lib.schemas());
//         if (pt.length > 0) {
//             json["schemas"] = pt;
//         }
//
//         var rt = this.serializeTraits(lib.traits(), lib);
//         if (Object.keys(rt).length > 0) {
//             json["traits"] = rt;
//         }
//         if (this.isDefined(lib, 'securitySchemes')) {
//             var securitySchemesJson:any = {};
//             tools.toArray(lib.securitySchemes()).forEach(x=>securitySchemesJson[x.name()] = this.serializeSecurityScheme(x, api));
//             json["securitySchemes"] = securitySchemesJson;
//         }
//
//         var typesJson = {};
//         lib.types().forEach(x=>typesJson[x.name()] = this.serializeTypeDeclaration(x, lib));
//         if (Object.keys(typesJson).length > 0 || this.isDefined(lib, "types")) {
//             json["types"] = typesJson;
//         }
//         var annotationTypes = {};
//         lib.annotationTypes().forEach(x=> {
//             var name = x.highLevel().attr("name").value();
//             annotationTypes[name] = this.serializeAnnotationTypeDeclaration(x, lib);
//         });
//         if (Object.keys(annotationTypes).length > 0 || this.isDefined(lib, "annotationTypes")) {
//             json["annotationTypes"] = annotationTypes;
//         }
//         JSON.stringify(json, null, 2);
//         this.serializeMeta(json,lib);
//         return json;
//     }
//
//     isDefined(node, name) {
//         var hl = node.highLevel();
//         if (hl.elementsOfKind(name).length > 0) {
//             return true;
//         }
//         if (hl.attributes(name).length > 0) {
//             return true;
//         }
//         return false;
//     }
//
//     serializeResources(_m:Array<RamlWrapper.Resource>, api:RamlWrapper.Api) {
//         var m:RamlWrapper.Resource[] = tools.toArray(_m);
//         var resourcesJsonArray:any[] = [];
//         for (var i = 0; i < m.length; i++) {
//             var resource:RamlWrapper.Resource = m[i];
//             var resourceJson = {};
//             var annotations = this.serializeReferences(resource.annotations());
//             if (Object.keys(annotations).length > 0 || this.isDefined(resource, 'annotations')) {
//                 resourceJson["annotations"] = annotations;
//             }
//             if (resource.description())
//                 resourceJson["description"] = "" + resource.description().value();
//             if (resource.relativeUri()) {
//                 resourceJson["relativeUri"] = "" + resource.relativeUri().value();
//             }
//             //if (resource.relativeUri()) {
//             //    var relativeUriPathSegments = resource.relativeUri().value().split('/');
//             //    var segments = relativeUriPathSegments.splice(1, relativeUriPathSegments.length);
//             //    if (segments) {
//             //        var pathSegments:any[] = [];
//             //        for (var s = 0; s < segments.length; s++) {
//             //            if (segments[s] != "")
//             //                pathSegments.push(segments[s]);
//             //        }
//             //        resourceJson["relativeUriPathSegments"] = pathSegments;
//             //    }
//             //}
//             if (resource.displayName()) {
//                 resourceJson["displayName"] = "" + resource.displayName();
//             }
//             if (resource.type()) {
//                 var resourceTypeReference = m[i].type().value();
//                 var highLevelASTNode = resourceTypeReference.toHighLevel();
//                 var attributesJson = {};
//                 highLevelASTNode.attrs().forEach(function (attribute) {
//                     if (attribute.name() == 'key')
//                         return false;
//                     attributesJson[attribute.name()] = "" + attribute.value();
//                 });
//                 if (Object.keys(attributesJson).length > 0) {
//                     var typeParamsJson = {};
//                     typeParamsJson["" + resource.type().value().valueName()] = attributesJson;
//                     resourceJson["type"] = typeParamsJson;
//                 } else
//                     resourceJson["type"] = "" + resource.type().value().valueName();
//             }
//             if (resource.is()) {
//                 if (resource.is().length > 0) {
//                     var values:any[] = [];
//                     for (var k = 0; k < resource.is().length; k++) {
//                         var is = resource.is()[k].value();
//                         var traitParameters = {};
//                         is.toHighLevel().attrs().forEach(function (attribute) {
//                             if (attribute.name() == 'key')
//                                 return;
//                             traitParameters["" + attribute.name()] = "" + attribute.value();
//                         });
//                         if (Object.keys(traitParameters).length > 0) {
//                             var isJson = {};
//                             isJson["" + is.valueName()] = traitParameters;
//                             values.push(isJson);
//                         }
//                         else
//                             values.push(is.valueName());
//                     }
//                     resourceJson["is"] = values;
//                 }
//             }
//             if (resource.securedBy()) {
//                 var values:any[] = [];
//                 if (resource.securedBy().length > 0) {
//                     resource.securedBy().forEach(x => {
//                         if (x.value().valueName() == "null")
//                             values.push(null);
//                         else
//                             values.push("" + x.value().valueName());
//                     });
//                     resourceJson["securedBy"] = values;
//                 }
//             }
//             var params = this.serializeParameters(resource.allUriParameters(), api, 'uriParameters');
//             if (Object.keys(params).length > 0) {
//                 resourceJson["uriParameters"] = params;
//             }
//             //var baseUriParams = this.serializeParameters(resource.baseUriParameters(),"uriParameters");
//             //if (Object.keys(baseUriParams).length > 0){
//             //    resourceJson["baseUriParameters"] = baseUriParams;
//             //}
//             else {
//                 var isBaseUriParams = this.isDefined(resource, 'baseUriParameters');
//                 if (isBaseUriParams) {
//                     resourceJson["baseUriParameters"] = null;
//                 }
//             }
//             if (resource.methods().length > 0) {
//                 var methodsJson:any[] = [];
//                 tools.toArray(resource.methods()).forEach(x=>methodsJson.push(this.serializeAction(x, api, false)));
//                 resourceJson["methods"] = methodsJson;
//             }
//             if (resource.resources().length > 0) {
//                 resourceJson["resources"] = this.serializeResources(resource.resources(), api);
//             }
//             this.serializeMeta(resourceJson,resource);
//             resourcesJsonArray.push(resourceJson);
//         }
//         JSON.stringify(resourcesJsonArray, null, 2);
//         return resourcesJsonArray;
//     }
//
//     serializeParameters(_m:Array<RamlWrapper.TypeDeclaration>, api:RamlWrapper.Api, defaultKind?:string) {
//         var m:RamlWrapper.TypeDeclaration[] = tools.toArray(_m);
//         var parametersJson = {};
//         var isQuery = false;
//         var isUriParameter = false;
//         var isHeader = false;
//         var isTrait = false;
//         var isFormParam = false;
//         if (defaultKind) {
//             if (defaultKind == "query")
//                 isQuery = true;
//             else if (defaultKind == "uriParameters")
//                 isUriParameter = true;
//             else if (defaultKind == "header")
//                 isHeader = true;
//             else if (defaultKind == "trait")
//                 isTrait = true;
//             else if (defaultKind == "formParameters")
//                 isFormParam = true;
//         }
//         if (m) {
//             m.forEach(p=> {
//                 var parameter:RamlWrapper.TypeDeclaration = p;
//                 var parameterJson = this.serializeTypeDeclaration(parameter, api);
//                 if (parameter.description()) {
//                     parameterJson["description"] = "" + parameter.description().value();
//                 }
//                 var parameterName = parameter.name();
//                 if (!parameter.displayName()) {
//                     if (isQuery || isUriParameter || isHeader || isTrait || isFormParam) {
//                         //parameterJson["displayName"] = parameterName;
//                     }
//                 }
//                 if (!parameter.type()) {
//                     if (isQuery || isUriParameter || isHeader || isTrait || isFormParam) {
//                         //parameterJson["type"] = 'string';
//                     }
//                 }
//                 if (parameter.required() == null) {
//                     if (isUriParameter) {
//                         //parameterJson["required"] = true;
//                     }
//                 }
//                 this.serializeMeta(parameterJson,parameter);
//                 if (parameterName) {
//                     var key = parameter.optional() ? parameterName + "?" : parameterName;
//                     if (parametersJson[key]) {
//                         var sm = parametersJson[key];
//                         if (typeof sm == 'array') {
//                             sm.push(parameterJson)
//                         }
//                         else {
//                             parametersJson[key] = [sm, parameterJson]
//                         }
//
//                     }
//                     else {
//                         parametersJson[key] = parameterJson;
//                     }
//                 }
//
//             });
//         }
//         JSON.stringify(parametersJson, null, 2);
//         return parametersJson;
//     }
//
//     serializeTypeDeclaration(td:RamlWrapper.TypeDeclaration, api:RamlWrapper.Api):any {
//
//         var tdJson = {};
//
//         var annotations = this.serializeReferences(td.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(td, 'annotations')) {
//             tdJson["annotations"] = annotations;
//         }
//         if (td.description()) {
//             tdJson["description"] = "" + td.description().value();
//         }
//         if (td.displayName()) {
//             tdJson["displayName"] = "" + td.displayName();
//         }
//         if (td.name()) {
//             tdJson["name"] = "" + td.name();
//         }
//         if (td.type) {
//             //if (this.isDefined(td, 'type')) {
//             var typeArr:string[] = td.type();
//             var arr = tools.toArray(typeArr);
//             if (arr.length == 0) {
//                 tdJson["type"] = null;
//             }
//             else if (arr.length == 1) {
//                 tdJson["type"] = arr[0];
//             }
//             else {
//                 tdJson["type"] = arr;
//             }
//             //}
//         }
//
//         if (td.example()) {
//             var typeInstance = td.structuredExample();
//             if (typeInstance) {
//                 tdJson["example"] = this.serializeTypeInstance(typeInstance);
//             }
//             else {
//                 tdJson["example"] = td.example();
//             }
//         }
//
//         if (td.examples() && td.examples().length > 0) {
//             if (td.examples()[0].name()) {
//                 var exObj:any = {};
//                 td.examples().forEach(x=> {
//                     var typeInstance = x.structuredContent();
//                     if (typeInstance) {
//                         exObj[x.name()] = this.serializeTypeInstance(typeInstance);
//                     }
//                     else {
//                         exObj[x.name()] = x.content();
//                     }
//                 });
//                 tdJson["examples"] = exObj;
//             }
//             else {
//                 var exArr:any[] = [];
//                 td.examples().forEach(x=> {
//                     var typeInstance = x.structuredContent();
//                     if (typeInstance) {
//                         exArr.push(this.serializeTypeInstance(typeInstance));
//                     }
//                     else {
//                         exArr.push(x.content());
//                     }
//                 });
//                 tdJson["examples"] = exArr;
//             }
//         }
//
//         if (td.repeat && td.repeat() !== null) {
//             tdJson["repeat"] = td.repeat();
//         }
//         if (td.required && td.required() !== null) {
//             tdJson["required"] = td.required();
//         }
//         //something strange
//         //if(td.optional()){
//         //    tdJson["required"] = false;
//         //}
//         if (td.default && td.default()) {
//             var canBeNumber:boolean;
//             var canBeBoolean:boolean;
//             td.type().forEach(x=> {
//                 if (x == 'integer' || x == 'number') {
//                     canBeNumber = true;
//                 }
//                 else if (x == 'boolean') {
//                     canBeBoolean = true;
//                 }
//             });
//             var gotValidDefaultValue = false;
//             if (canBeNumber) {
//                 var defaultValue:number = +td.default();
//                 if (defaultValue != null && !isNaN(defaultValue)) {
//                     tdJson["default"] = defaultValue;
//                     gotValidDefaultValue = true;
//                 }
//             }
//             if (!gotValidDefaultValue && canBeBoolean) {
//                 if (td.default() == 'true') {
//                     tdJson["default"] = true;
//                     gotValidDefaultValue = true;
//                 }
//                 else if (td.default() == 'false') {
//                     tdJson["default"] = false;
//                     gotValidDefaultValue = true;
//                 }
//             }
//
//             if (!gotValidDefaultValue) {
//                 tdJson["default"] = "" + td.default();
//             }
//         }
//         var facets = td.facets();
//         if (facets.length != 0 || this.isDefined(td, 'facets')) {
//             var facetsObj = {};
//             facets.forEach(x=>facetsObj[x.name()] = this.serializeTypeDeclaration(x, api));
//             tdJson['facets'] = facetsObj;
//         }
//         var fixedFacets = td.fixedFacets();
//         if (fixedFacets.properties().length > 0) {
//             tdJson['fixedFacets'] = this.serializeTypeInstance(fixedFacets);
//         }
//         if (td.kind() == "StringTypeDeclaration") {
//             var stringTypeParameter = <RamlWrapper.StringTypeDeclaration>td;
//             if (stringTypeParameter.minLength()) {
//                 tdJson["minLength"] = stringTypeParameter.minLength();
//             }
//             if (stringTypeParameter.maxLength()) {
//                 tdJson["maxLength"] = stringTypeParameter.maxLength();
//             }
//             if (stringTypeParameter.pattern()) {
//                 tdJson["pattern"] = stringTypeParameter.pattern();
//             }
//             if (stringTypeParameter.enum() && stringTypeParameter.enum().length > 0) {
//                 var valEnum:any[] = [];
//                 stringTypeParameter.enum().forEach(x=> {
//                     valEnum.push(x);
//                 });
//                 tdJson["enum"] = valEnum;
//             }
//         }
//         if (td.kind() == "NumberTypeDeclaration") {
//             var numberTypeParameter = <RamlWrapper.NumberTypeDeclaration>td;
//             if (numberTypeParameter.minimum()) {
//                 tdJson["minimum"] = numberTypeParameter.minimum();
//             }
//             if (numberTypeParameter.maximum()) {
//                 tdJson["maximum"] = numberTypeParameter.maximum();
//             }
//             if (numberTypeParameter.format()) {
//                 tdJson["format"] = numberTypeParameter.format();
//             }
//         }
//         if (td.schema && td.schema()) {
//             var schemas = this.serializeSchemasForBody(api.schemas());
//             var schemaContent = "" + schemas[td.schema()];
//             if (schemaContent)
//                 tdJson["schema"] = schemaContent;
//             else
//                 tdJson["schema"] = "" + td.schema();
//         }
//         if (td instanceof RamlWrapperImpl.ObjectTypeDeclarationImpl) {
//             var props = (<RamlWrapper.ObjectTypeDeclaration>td).properties();
//             var propsJson = {};
//             props.forEach(x=>propsJson[x.name()] = this.serializeTypeDeclaration(x, api));
//             if (props.length > 0 || this.isDefined(td, "properties")) {
//                 tdJson["properties"] = propsJson;
//             }
//         }
//         this.serializeMeta(tdJson,td);
//         return tdJson;
//     }
//
//     serializeAnnotationTypeDeclaration(atd:RamlWrapper.AnnotationTypeDeclaration, api?:RamlWrapper.Api):any {
//
//         var hlNode:hl.IHighLevelNode = atd.highLevel();
//         var def = hlNode.definition();
//         var td:RamlWrapper.TypeDeclaration;
//         if (def.isAssignableFrom(universe.Universe10.StringTypeDeclaration.name)) {
//             td = new RamlWrapperImpl.StringTypeDeclarationImpl(hlNode,false);
//         }
//         else if (def.isAssignableFrom(universe.Universe10.NumberTypeDeclaration.name)) {
//             td = new RamlWrapperImpl.NumberTypeDeclarationImpl(hlNode,false);
//         }
//         else{//} if (def.isAssignableFrom(universe.Universe10.ObjectTypeDeclaration.name)) {
//             td = new RamlWrapperImpl.ObjectTypeDeclarationImpl(hlNode,false);
//         }
//         var result = this.serializeTypeDeclaration(td, api);
//         var allowedTargets = atd.allowedTargets().map(x=>x.value());
//         if (allowedTargets.length > 0 || this.isDefined(atd, 'allowedTargets')) {
//             result['allowedTargets'] = allowedTargets;
//         }
//         var allowMultiple = atd.allowMultiple();
//         if (allowMultiple != null || this.isDefined(atd, 'allowMultiple')) {
//             result['allowMultiple'] = allowMultiple;
//         }
//         this.serializeMeta(result,atd);
//         return result;
//     }
//
//
//     serializeAction(method:RamlWrapper.Method, api?:RamlWrapper.Api, hasAdditional?:boolean) {
//
//         var methodJson = this.serializeMethodBase(method, api, hasAdditional);
//         methodJson["method"] = "" + method.method();
//         if (method.description()) {
//             methodJson["description"] = "" + method.description().value();
//         }
//         if (method.displayName())
//             methodJson['displayName'] = "" + method.displayName();
//
//         this.serializeMeta(methodJson,method);
//         return methodJson;
//     }
//
//     serializeHasNormalParameters(method:RamlWrapper.HasNormalParameters,
//                                  api:RamlWrapper.Api, hasAdditional?:boolean) {
//
//         var methodJson = {};
//         var annotations = this.serializeReferences(method.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(method, 'annotations')) {
//             methodJson["annotations"] = annotations;
//         }
//         if (method.description()) {
//             methodJson["description"] = "" + method.description().value();
//         }
//
//         if (method.displayName())
//             methodJson['displayName'] = "" + method.displayName();
//
//         var hasQueryParams = this.isDefined(method, 'queryParameters');
//         if (method.queryParameters()) {
//             var params = this.serializeParameters(method.queryParameters(), api, "query");
//             if (Object.keys(params).length > 0)
//                 methodJson["queryParameters"] = params;
//             else if (hasQueryParams)
//                 methodJson["queryParameters"] = null;
//         }
//
//         var hasHeaders = this.isDefined(method, 'headers');
//         if (method.headers()) {
//             var opt = _.some(method.headers(), x=>x.highLevel().optional());
//             var headers = this.serializeParameters(method.headers(), api, 'header');
//             var key = opt ? "headers?" : "headers";
//             if (Object.keys(headers).length > 0)
//                 methodJson[key] = headers
//             else if (hasHeaders)
//                 methodJson[key] = null;
//         }
//         if (this.isDefined(method, 'queryString')) {
//             var qs = null;
//             if (method.queryString()) {
//                 qs = this.serializeTypeDeclaration(method.queryString(), api);
//             }
//             methodJson['queryString'] = qs;
//         }
//         this.serializeMeta(methodJson,method);
//         return methodJson;
//     }
//
//     serializeMethodBase(method:RamlWrapper.MethodBase, api?:RamlWrapper.Api, hasAdditional?:boolean) {
//
//         var methodJson = this.serializeHasNormalParameters(method, api, hasAdditional);
//         var annotations = this.serializeReferences(method.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(method, 'annotations')) {
//             methodJson["annotations"] = annotations;
//         }
//         var optionalProperties:{[key:string]:boolean} = {};
//         method.optionalProperties().forEach(x=>optionalProperties[x] = true);
//
// //TODO fix unnecessary protocols.
//         if (hasAdditional) {
//             var protocols = this.serializeProtocols(api, hasAdditional);
//             if (protocols.length > 0)
//                 methodJson["protocols"] = protocols;
//         }
//         if (method.protocols()) {
//             if (method.protocols().length > 0) {
//                 var _protocols:any[] = []
//                 method.protocols().forEach(x=>_protocols.push("" + x));
//                 methodJson["protocols"] = method.protocols()
//             }
//         }
//
//         var securedByJson:any[] = [];
//         if (hasAdditional) {
//             securedByJson = this.serializeSecuredBy(api.securedBy());
//             if (securedByJson.length > 0 && method.securedBy() && method.securedBy().length == 0)
//                 methodJson["securedBy"] = securedByJson;
//         }
//         if (method.securedBy()) {
//             if (api.securedBy() && api.securedBy().length > 0 && method.securedBy().length > 0)
//                 securedByJson = [];
//             if (method.securedBy().length > 0) {
//                 method.securedBy().forEach(x => {
//                     if (x.value().valueName() == "null")
//                         securedByJson.push(null);
//                     else
//                         securedByJson.push("" + x.value().valueName());
//                 });
//                 methodJson["securedBy"] = securedByJson;
//             }
//         }
//
//         if (method.is()) {
//             if (method.is().length > 0) {
//                 var values:any[] = [];
//                 for (var k = 0; k < method.is().length; k++) {
//                     var is = method.is()[k].value();
//                     var traitParameters = {};
//                     is.toHighLevel().attrs().forEach(function (attribute) {
//                         if (attribute.name() == 'key')
//                             return;
//                         traitParameters["" + attribute.name()] = "" + attribute.value()
//                     });
//                     if (Object.keys(traitParameters).length > 0) {
//                         var isJson = {};
//                         isJson["" + is.valueName()] = traitParameters;
//                         values.push(isJson);
//                     }
//                     else
//                         values.push(is.valueName());
//                 }
//                 methodJson["is"] = values;
//             }
//         }
//
//         if (method.body()) {
//             var hasBody = this.isDefined(method, 'body');
//             var body = this.serializeBody(method.body(), api, hasAdditional);
//             if (Object.keys(body).length > 0)
//                 methodJson["body"] = body;
//             else if (hasBody)
//                 methodJson["body"] = null;
//         }
//         if (method.responses()) {
//             var hasResponses = this.isDefined(method, 'responses');
//             var responses = this.serializeResponses(method.responses(), api, hasAdditional);
//             if (Object.keys(responses).length > 0)
//                 methodJson["responses"] = responses;
//             else if (hasResponses)
//                 methodJson["responses"] = null;
//         }
//         this.serializeMeta(methodJson,method);
//         return methodJson;
//     }
//
//     serializeBody(_b:RamlWrapper.TypeDeclaration[], api:RamlWrapper.Api, hasAdditional?) {
//         var b:RamlWrapper.TypeDeclaration[] = tools.toArray(_b);
//         if (hasAdditional == null)
//             hasAdditional = true;
//         var bodiesJson = {};
//         if (b) {
//             b.forEach(x=> {
//                 var body = <RamlWrapper.TypeDeclaration>x;
//                 var bodyJson = this.serializeTypeDeclaration(body, api);
//                 if (Object.keys(bodyJson).length == 0)
//                     bodyJson = null;
//
//                 this.serializeMeta(bodyJson,x);
//                 if (body.name())
//                     bodiesJson["" + body.name()] = bodyJson;
//                 else if (hasAdditional == false && bodyJson != null)
//                     bodiesJson = bodyJson;
//                 else if (hasAdditional && api.mediaType().value())
//                     bodiesJson[api.mediaType().value()] = bodyJson;
//             });
//         }
//         JSON.stringify(bodiesJson, null, 2);
//         return bodiesJson;
//     }
//
//
//     serializeResponses(_m:Array<RamlWrapper.Response>, api:RamlWrapper.Api, hasAdditional, kind?:string) {
//         var m:RamlWrapper.Response[] = tools.toArray(_m);
//         var responsesJson = {};
//         if (m) {
//             m.forEach(x=> {
//                 var response = <RamlWrapper.Response>x;
//                 var responseJson = {};
//                 responseJson["code"] = "" + response.code().value();
//                 if (response.description())
//                     responseJson["description"] = "" + response.description().value();
//                 if (response.headers()) {
//                     var parametersKind = kind || 'uriParameters'
//                     var hasHeaders = this.isDefined(response, 'headers');
//                     var headersParams = this.serializeParameters(response.headers(), api, "headers");
//                     if (Object.keys(headersParams).length > 0)
//                         responseJson["headers"] = headersParams;
//                     else if (hasHeaders)
//                         responseJson["headers"] = null;
//                 }
//                 if (response.body()) {
//                     var bodyJson = this.serializeBody(response.body(), api, hasAdditional);
//                     if (Object.keys(bodyJson).length > 0)
//                         responseJson["body"] = bodyJson;
//                 }
//                 if (Object.keys(responseJson).length == 0) {
//                     responseJson = null;
//                 }
//                 else {
//                     this.serializeMeta(responseJson, x);
//                 }
//                 responsesJson["" + response.code().value()] = responseJson;
//             });
//         }
//         JSON.stringify(responsesJson, null, 2);
//         return responsesJson;
//     }
//
//     serializeSchemas(_m:Array<RamlWrapper.GlobalSchema>) {
//         var m:RamlWrapper.GlobalSchema[] = tools.toArray(_m);
//         var s:any[] = [];
//         if (m && m.length > 0) {
//             for (var i = 0; i < m.length; i++) {
//                 if (m[i].value()) {
//                     var schema:RamlWrapper.GlobalSchema = m[i];
//                     var ij = {};
//                     ij["" + schema.key()] = "" + schema.value().value();
//                     this.serializeMeta(ij,schema);
//                     s.push(ij);
//                 }
//             }
//         }
//         JSON.stringify(s, null, 2);
//         return s;
//     }
//
//     serializeSchemasForBody(_m:Array<RamlWrapper.GlobalSchema>) {
//         var m:RamlWrapper.GlobalSchema[] = tools.toArray(_m);
//         var s = {};
//         if (m && m.length > 0) {
//             for (var i = 0; i < m.length; i++) {
//                 if (m[i].value()) {
//                     var schema:RamlWrapper.GlobalSchema = m[i];
//                     s["" + schema.key()] = "" + schema.value().value();
//                 }
//             }
//         }
//         JSON.stringify(s, null, 2);
//         return s;
//     }
//
//     serializeResourceTypes(_m:Array<RamlWrapper.ResourceType>, api:RamlWrapper.Api) {
//         var m:RamlWrapper.ResourceType[] = tools.toArray(_m);
//         var resourceTypesJson:any = {};
//         if (m) {
//             m.forEach(r=> {
//                 var resourceTypeJson = this.serializeResourceType(r, api);
//                 resourceTypesJson[r.name()] = resourceTypeJson;
//             });
//         }
//         JSON.stringify(resourceTypesJson, null, 2);
//         return resourceTypesJson;
//     }
//
//     private serializeResourceType(r, api?) {
//         var resourceType:RamlWrapper.ResourceType = r;
//         var resourceTypeJson = {};
//         resourceTypeJson['name'] = resourceType.name();
//         var annotations = this.serializeReferences(resourceType.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(resourceType, 'annotations')) {
//             resourceTypeJson["annotations"] = annotations;
//         }
//
//         if (r.displayName()) {
//             resourceTypeJson["displayName"] = "" + r.displayName();
//         }
//         if (resourceType.methods().length > 0) {
//             var array:any[] = [];
//             tools.toArray(resourceType.methods()).forEach(x=> {
//                 var action:any = this.serializeAction(x, api, false);
//                 array.push(action);
//             });
//             resourceTypeJson['methods'] = array;
//         }
//         if (resourceType.is()) {
//             if (resourceType.is().length > 0) {
//                 var values = this.serializeReferences(resourceType.is());
//                 resourceTypeJson["is"] = values;
//             }
//         }
//         if (resourceType.type()) {
//             if (resourceType.type().value()) {
//                 resourceTypeJson["type"] = "" + resourceType.type().value().valueName();
//             }
//         }
//         var uriParams = this.serializeParameters(resourceType.uriParameters(), api);
//         if (Object.keys(uriParams).length > 0) {
//             resourceTypeJson["uriParameters"] = uriParams;
//         }
//         if (resourceType.description())
//             resourceTypeJson["description"] = "" + resourceType.description().value();
//
//         this.serializeMeta(resourceTypeJson, resourceType);
//         return resourceTypeJson;
//     }
//
//     serializeTraits(_m:Array<RamlWrapper.Trait>, api:RamlWrapper.Api) {
//         var m:RamlWrapper.Trait[] = tools.toArray(_m);
//         var traitsJson:any = {};
//         if (m) {
//             m.forEach(t=> {
//                 var trait:RamlWrapper.Trait = t;
//                 var traitJson = this.serializeTrait(trait, api);
//                 if (Object.keys(traitJson).length > 0) {
//                     traitsJson[trait.name()] = traitJson;
//                 }
//                 //responses body is securedBy
//                 //  else
//                 //      traitsJson.push(trait.name()); //TODO JSP does not serialize empty traits;
//             });
//         }
//         JSON.stringify(traitsJson, null, 2);
//         return traitsJson;
//     }
//
//     private serializeTrait(trait, api?) {
//         var optionalProperties:{[key:string]:boolean} = {};
//         trait.optionalProperties().forEach(x=>optionalProperties[x] = true);
//
//         var traitJson = {};
//         traitJson['name'] = trait.name();
//         var annotations = this.serializeReferences(trait.annotations());
//         if (Object.keys(annotations).length > 0 || this.isDefined(trait, 'annotations')) {
//             traitJson["annotations"] = annotations;
//         }
//         if (trait.usage())
//             traitJson["usage"] = "" + trait.usage();
//         if (trait.queryParameters()) {
//             var params = this.serializeParameters(trait.queryParameters(), api, "query");
//             if (Object.keys(params).length > 0)
//                 traitJson["queryParameters"] = params;
//         }
//         if (trait.headers()) {
//             var opt = optionalProperties['headers'];
//             var headers = this.serializeParameters(trait.headers(), api, 'header');
//             var key = opt ? "headers?" : "headers";
//             if (Object.keys(headers).length > 0)
//                 traitJson[key] = headers;
//         }
//
//         if (trait.displayName())
//             traitJson["displayName"] = "" + trait.displayName();
//         if (trait.description())
//             traitJson["description"] = "" + trait.description().value();
//         if (trait.responses()) {
//             var responsesJson = this.serializeResponses(trait.responses(), api, false, 'trait');
//             if (Object.keys(responsesJson).length > 0)
//                 traitJson["responses"] = responsesJson;
//         }
//         if (trait.body()) {
//             var bodyJson = this.serializeBody(trait.body(), api, false);
//             if (Object.keys(bodyJson).length > 0)
//                 traitJson["body"] = bodyJson;
//         }
//         if (trait.is()) {
//             if (trait.is().length > 0) {
//                 var values = this.serializeReferences(trait.is());
//                 traitJson["is"] = values;
//             }
//         }
//         if (trait.securedBy()) {
//             var securedByJson = this.serializeSecuredBy(trait.securedBy());
//             if (Object.keys(securedByJson).length > 0)
//                 traitJson["securedBy"] = securedByJson;
//         }
//         this.serializeMeta(traitJson,trait);
//         return traitJson;
//     }
//
//     serializeDocumentation(_m:Array<RamlWrapper.DocumentationItem>) {
//         var m:RamlWrapper.DocumentationItem[] = tools.toArray(_m);
//         var j:any[] = [];
//         for (var i = 0; i < m.length; i++) {
//             var d:RamlWrapper.DocumentationItem = m[i];
//             var ij = {};
//             ij["title"] = "" + d.title();
//             ij["content"] = "" + d.content().value();
//             this.serializeMeta(ij,d);
//             j.push(ij);
//         }
//         JSON.stringify(j, null, 2);
//         return j;
//     }
//
//     serializeSecurityScheme(securitySchema:RamlWrapper.AbstractSecurityScheme, api?) {
//
//         var schemaJson = {}
//
//         if (securitySchema.description()) {
//             if (securitySchema.description().value()) {
//                 schemaJson["description"] = "" + securitySchema.description().value();
//             }
//         }
//         schemaJson["name"] = securitySchema.name();
//         var type = null;
//         if (securitySchema.type()) {
//             type = "" + securitySchema.type();
//             schemaJson["type"] = type;
//         }
//         if (this.isDefined(securitySchema, 'settings')) {
//             var settingsJson = null;
//             if (securitySchema.settings()) {
//                 settingsJson = this.serializeSecuritySettings(securitySchema.settings(), type);
//             }
//             schemaJson["settings"] = settingsJson;
//         }
//         var describedByJson = this.serializeDescribedBy(securitySchema.describedBy(), api);
//         if (Object.keys(describedByJson).length > 0)
//             schemaJson["describedBy"] = describedByJson;
//
//         this.serializeMeta(schemaJson,securitySchema);
//         return schemaJson;
//     }
//
//     serializeSecuritySettings(settings:RamlWrapper.SecuritySchemeSettings, type) {
//         var settingsJson = {};
//         if (type == 'Pass Through') {
//             var pt:RamlWrapperImpl.PassThroughSecuritySchemeSettingsImpl
//                 = <RamlWrapperImpl.PassThroughSecuritySchemeSettingsImpl>settings;
//             settingsJson['headerName'] = '' + pt.headerName();
//             settingsJson['queryParameterName'] = '' + pt.queryParameterName();
//         }
//         this.serializeMeta(settingsJson,settings);
//         JSON.stringify(settingsJson, null, 2);
//         return settingsJson;
//     }
//
//     serializeDescribedBy(description:RamlWrapper.SecuritySchemePart, api) {
//         var descriptionJson = this.serializeMethodBase(description, api);
//         JSON.stringify(descriptionJson, null, 2);
//         return descriptionJson; //TODO to implement after pull
//     }
//
//     serializeSecuredBy(m) {
//         var j:any[] = [];
//         if (m && m instanceof Array) {
//             for (var i = 0; i < m.length; i++) {
//                 j.push("" + m[i].value().valueName());
//             }
//         }
//         JSON.stringify(j, null, 2);
//         return j;
//     }
//
//     serializeProtocols(api:RamlWrapper.Api, addTransformations) {
//         var j:any[] = [];
//         //if (addTransformations&& api.protocols() && api.protocols().length == 0) {
//         //    if (api.baseUri()) {
//         //        var baseUri = api.baseUri().value();
//         //        var protocol = baseUri.substr(0, baseUri.indexOf(':'));
//         //        if (protocol.toUpperCase() == 'HTTP' || protocol.toUpperCase() == 'HTTPS')
//         //            j.push(""+protocol.toUpperCase());
//         //    }
//         //}
//         var m = api.protocols();
//         if (m && m instanceof Array) {
//             for (var i = 0; i < m.length; i++) {
//                 var value = m[i].toUpperCase();
//                 j.push("" + value.toUpperCase());
//             }
//         }
//         JSON.stringify(j, null, 2);
//         return j;
//     }
//
//     serializeReferences(refs:RamlWrapper.Reference[]):any[] {
//         var result:any = {};
//         refs.forEach(x=> {
//             result[x.name()] = this.serializeReference(x)
//         });
//         return result;
//     }
//
//     serializeReference(ref:RamlWrapper.Reference):any {
//         var obj:any = {};
//         obj['structuredValue'] = this.serializeTypeInstance(ref.structuredValue());
//         obj['name'] = ref.name();
//         if(ref instanceof RamlWrapperImpl.AnnotationRefImpl){
//             obj['annotation'] = this.serializeAnnotationTypeDeclaration((<RamlWrapper.AnnotationRef>ref).annotation());
//         }
//         else if(ref instanceof RamlWrapperImpl.SecuritySchemeRefImpl){
//             var ssRef = (<RamlWrapper.SecuritySchemeRef>ref);
//             obj['securityScheme'] = this.serializeSecurityScheme(ssRef.securityScheme());
//             obj['securitySchemeRef'] = ssRef.securitySchemeName();
//         }
//         else if(ref instanceof RamlWrapperImpl.ResourceTypeRefImpl){
//             obj['resourceType'] = this.serializeResourceType((<RamlWrapper.ResourceTypeRef>ref).resourceType());
//         }
//         else if(ref instanceof RamlWrapperImpl.TraitRefImpl){
//             obj['trait'] = this.serializeTrait((<RamlWrapper.TraitRef>ref).trait());
//         }
//         return obj;
//     }
//
//     serializeTypeInstance(inst:RamlWrapper.TypeInstance):any {
//         if (inst.isScalar()) {
//             return inst.value();
//         }
//         else {
//             var props = inst.properties();
//             if (props.length == 0) {
//                 return null;
//             }
//             var obj:any = {};
//             props.forEach(x=>obj[x.name()] = this.serializeTypeInstanceProperty(x));
//             return obj;
//         }
//     }
//
//     serializeTypeInstanceProperty(prop:RamlWrapper.TypeInstanceProperty):any {
//         if (prop.isArray()) {
//             var values = prop.values();
//             //if(values.length==0){
//             //    return null;
//             //}
//             var arr:any[] = [];
//             values.forEach(x=>arr.push(this.serializeTypeInstance(x)));
//             return arr;
//         }
//         else {
//             return this.serializeTypeInstance(prop.value());
//         }
//     }
//
//     serializeMeta(obj:any,node:core.BasicNode|coreApi.AttributeNode){
//         if(!this.dumpMeta){
//             return;
//         }
//         var meta = node.meta();
//         if(!meta.isDefault()){
//             obj["__METADATA__"] = meta.toJSON();
//         }
//     }
// }