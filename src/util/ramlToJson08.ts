import RamlWrapper = require("../raml1/artifacts/raml08parserapi")
var path = require('path');
var tools =require("../raml1/test/testTools")
var _ =require("underscore")
var defaultCalculator = require("../raml1/wrapped-ast/defaultCalculator")
import services = require("../raml1/definition-system/ramlServices")
import hl = require("../raml1/highLevelAST")


export function convertToJson(api, transform: boolean){
    var addTransformations = transform;
    if (true){
        if (!api.title()){
            throw new Error("missing title")
        }
    }
    if (transform == null)
        addTransformations = true;
    var json = {};
    if (api.title()) {
        var numberTitle:number = +api.title();
        if (numberTitle != null && !isNaN(numberTitle)) {
            json["title"] = numberTitle;
        }
        else
            json["title"] = ""+api.title();
    }
    if (api.version()) {
        json["version"] = api.version() + "";
    }
    if (api.baseUri() && api.baseUri().value()) {
        json["baseUri"] = ""+api.baseUri().value();
    }
    if (api.mediaType() && api.mediaType().value()) {
        json["mediaType"] = ""+api.mediaType().value();
    }
    var resourceTypes = serializeResourceTypes(api.resourceTypes(), api);
    if (Object.keys(resourceTypes).length > 0) {
        json["resourceTypes"] = resourceTypes;
    }
    var pt = serializeSchemas(api.schemas());
    if (pt.length > 0) {
        json["schemas"] = pt;
    }
    var sb = serializeSecuredBy(api.securedBy());
    if (sb.length > 0) {
        json["securedBy"] = sb;
    }
    var dt = serializeDocumentation(api.documentation());
    if (Object.keys(dt).length > 0) {
        json["documentation"] = dt;
    }
    var protocolsJson = serializeProtocols(api, addTransformations);
    if (protocolsJson.length > 0) {
        json["protocols"] = protocolsJson;
    }
    var rt = serializeTraits(api.traits(), api);
    if (Object.keys(rt).length > 0) {
        json["traits"] = rt;
    }
    var hasSecuritySchemes = isDefined(api, 'securitySchemes');
    var sh = serializeSecuritySchemes(api.securitySchemes());
    if (sh.length > 0) {
        json["securitySchemes"] = sh;
    } else if(hasSecuritySchemes)
        json["securitySchemes"] = [];
    var rs = serializeResources(api.resources(), api);
    if (rs.length > 0) {
        json["resources"] = rs;
    }
    var isBaseUriParams = isDefined(api, 'baseUriParameters');
    var baseUriParameters = serializeParameters(api.allBaseUriParameters(), 'uriParameters');
    if (Object.keys(baseUriParameters).length > 0) {
        if (api.version()){
            baseUriParameters["version"]['enum'] = [api.version() + ""];
        }
        json["baseUriParameters"] = baseUriParameters;
    } else if (isBaseUriParams){
        json["baseUriParameters"] = null;
    }
    JSON.stringify(json,null,2);
    return json;
}

function isDefined(node, name){
    var llChildren = node.highLevel().lowLevel().children();
    var isDefined = false;
    var section = null;
    for (var i=0; i < llChildren.length; i++){
        var child = llChildren[i];
        if (child.key()&&child.key() == name){
            section = child;
            break;
        }
    }
    if (section)
        isDefined = true;

    return isDefined;
}

function serializeResources(_m:Array<RamlWrapper.Resource>, api:RamlWrapper.Api){
    var m:RamlWrapper.Resource[] = tools.toArray(_m);
    var resourcesJsonArray = [];
    for(var i=0; i <m.length; i++){
        var resource:RamlWrapper.Resource = m[i];

        var resourceJson = serializeResource(resource, api);

        resourcesJsonArray.push(resourceJson);
    }
    JSON.stringify(resourcesJsonArray,null,2);
    return resourcesJsonArray;
}

var serializeTypeProperty = function (resourceType, resourceJson) {
    var resourceTypeReference = resourceType.value();
    var highLevelASTNode = resourceTypeReference.toHighLevel();
    if(!highLevelASTNode){
        resourceJson["type"] = "" + resourceType.value().valueName();
        return;
    }
    var attributesJson = {};
    highLevelASTNode.attrs().forEach(function (attribute) {
        if (isKeyAttribute(attribute))
            return false;
        attributesJson[attribute.name()] = "" + attribute.value();
    });
    if (Object.keys(attributesJson).length > 0) {
        var typeParamsJson = {};
        typeParamsJson["" + resourceType.value().valueName()] = attributesJson;
        resourceJson["type"] = typeParamsJson;
    } else
        resourceJson["type"] = "" + resourceType.value().valueName();
};

function isKeyAttribute(attribute: hl.IAttribute) {
    var definition = attribute.parent().definition();
    if (!definition) return false;

    var property = definition.property(attribute.name());
    if (!property) return false;

    return property.getAdapter(services.RAMLPropertyService).isKey();
}

/**
 * Serializes resource to JSON
 * @param resource
 */
function serializeResource(resource : RamlWrapper.Resource, api:RamlWrapper.Api) {
    var resourceJson = {};
    if (resource.description())
        resourceJson["description"] = ""+resource.description().value();
    if (resource.relativeUri()){
        resourceJson["relativeUri"] = ""+resource.relativeUri().value();
    }
    if (resource.relativeUri()){
        var relativeUriPathSegments = resource.relativeUri().value().split('/');
        var segments = relativeUriPathSegments.splice(1, relativeUriPathSegments.length);
        if (segments){
            var pathSegments = [];
            for (var s = 0; s < segments.length; s++){
                if (segments[s]!="")
                    pathSegments.push(segments[s]);
            }
            resourceJson["relativeUriPathSegments"] = pathSegments;
        }
    }

    serializeNodeDisplayName(resource, resourceJson);

    if (resource.type()){
        serializeTypeProperty(resource.type(), resourceJson);
    }
    if (resource.is()){
        if (resource.is().length > 0) {
            var values = [];
            for (var k = 0; k<resource.is().length; k++){
                var is = resource.is()[k].value();
                var traitParameters = {};
                is.toHighLevel().attrs().forEach(function (attribute) {
                    if (isKeyAttribute(attribute))
                        return;
                    traitParameters[""+attribute.name()] = ""+attribute.value();
                });
                if (Object.keys(traitParameters).length > 0) {
                    var isJson = {};
                    isJson[""+is.valueName()] = traitParameters;
                    values.push(isJson);
                }
                else
                    values.push(is.valueName());
            }
            resourceJson["is"] = values;
        }
    }
    if (resource.securedBy()){
        var values = [];
        if(resource.securedBy().length > 0) {
            resource.securedBy().forEach(x => {
                if(x.value().valueName() == "null"||x.value().valueName() == null)
                    values.push(null);
                else
                    values.push(""+x.value().valueName());
            });
            resourceJson["securedBy"] = values;
        }
    }
    var params = serializeParameters(resource.allUriParameters(), 'uriParameters');
    if (Object.keys(params).length > 0){
        resourceJson["uriParameters"] = params;
    }
    //var baseUriParams = serializeParameters(resource.baseUriParameters(),"uriParameters");
    //if (Object.keys(baseUriParams).length > 0){
    //    resourceJson["baseUriParameters"] = baseUriParams;
    //}
    //else{
    //    var isBaseUriParams = isDefined(resource, 'baseUriParameters');
    //    if (isBaseUriParams) {
    //        resourceJson["baseUriParameters"] =  null ;
    //    }
    //}
    serializeBaseUriParameters(resource, resourceJson);

    if (resource.methods().length > 0){
        resourceJson["methods"] = serializeActions(resource.methods(), api, true);
    }
    if (resource.resources().length > 0){
        resourceJson["resources"] = serializeResources(resource.resources(), api);
    }

    return resourceJson;
}

function serializeBaseUriParameters(node : RamlWrapper.Resource | RamlWrapper.Method | RamlWrapper.Api,
    targetJson : any) {
    var baseUriParams = serializeParameters(node.baseUriParameters(),"uriParameters");
    if (Object.keys(baseUriParams).length > 0){
        targetJson["baseUriParameters"] = baseUriParams;
    }
    else{
        var isBaseUriParams = isDefined(node, 'baseUriParameters');
        if (isBaseUriParams) {
            targetJson["baseUriParameters"] =  null ;
        }
    }
}

function serializeParameters(_m:Array<RamlWrapper.Parameter>, defaultKind?:string){
    var m:RamlWrapper.Parameter[] = tools.toArray(_m);
    var parametersJson = {};
    var isQuery = false;
    var isUriParameter = false;
    var isHeader = false;
    var isTrait = false;
    var isFormParam = false;
    if (defaultKind) {
        if (defaultKind == "query")
            isQuery = true;
        else if (defaultKind == "uriParameters")
            isUriParameter = true;
        else if (defaultKind == "header")
            isHeader = true;
        else if (defaultKind == "trait")
            isTrait = true;
        else if (defaultKind == "formParameters")
            isFormParam = true;
    }
    if (m) {
        m.forEach(p=> {
            var parameter:RamlWrapper.Parameter = p;

            var parameterJson = serializeParameter(parameter);

            var parameterName = parameter.name();
            if (parameterName) {
                var key = parameter.optional() ? parameterName + "?" : parameterName;
                if (parametersJson[key]){
                    var sm=parametersJson[key];
                    if (typeof sm=='array'){
                        sm.push(parameterJson)
                    }
                    else{
                        parametersJson[key]=[sm,parameterJson]
                    }

                }
                else {
                    parametersJson[key] = parameterJson;
                }
            }
        });
    }
    JSON.stringify(parametersJson,null,2);
    return parametersJson;
}

/**
 * Serializes a single parameter to JSON.
 * @param parameter
 */
function serializeParameter(parameter : RamlWrapper.Parameter) : any {
    var parameterJson = {};
    if (parameter.description()) {
        parameterJson["description"] = ""+parameter.description().value();
    }
    var parameterName = parameter.name();

    //commenting out any special rules with regard to display name.
    //display name should be correctly returned by default calculator

    //if (parameter.displayName()) {
    //    parameterJson["displayName"] = ""+parameter.displayName();
    //} else if (isQuery || isUriParameter || isHeader || isTrait || isFormParam) {
    //    parameterJson["displayName"] = parameterName;
    //}

    if (parameter.displayName()) {
        var displayName = ""+parameter.displayName();

        ////working around when JS test expects display name to contain a question sign by default for some reason.
        //if (parameter.optional() && parameter.name() == displayName) {
        //    displayName = displayName + "?";
        //}
        parameterJson["displayName"] = displayName;
    }

    //commenting out any special rules with regard to type.
    //type should be correctly returned by default calculator

    //if (parameter.type()) {
    //    parameterJson["type"] = ""+parameter.type();
    //} else if (isQuery || isUriParameter || isHeader || isTrait || isFormParam) {
    //    parameterJson["type"] = 'string';
    //}

    if (parameter.type()) {
        parameterJson["type"] = parameter.type();
    }

    if (parameter.example()) {
        parameterJson["example"] = (""+parameter.example()).trim();
    }

    //if (parameter.repeat() !== null) {
    //    parameterJson["repeat"] = parameter.repeat();
    //}

    serializeNodeRepeat(parameter, parameterJson);

    //commenting out any special rules with regard to required.
    //required should be correctly returned by default calculator

    //if (parameter.required() !== null) {
    //    parameterJson["required"] = ""+parameter.required();
    //} else if(isUriParameter)
    //    parameterJson["required"] = true;

    if (parameter.required() != null) {
        //it looks like "false" required valeus are not added by JS parser, for whatever reason
        if (parameter.required()) {
            parameterJson["required"] = parameter.required();
        }
    }

    if (parameter.default()) {
        var gotValidDefaultValue = false;
        if (parameter.type() == 'integer' || parameter.type() == 'number') {
            var defaultValue:number = +parameter.default();
            if (defaultValue != null && !isNaN(defaultValue)) {
                parameterJson["default"] = defaultValue;
                gotValidDefaultValue = true;
            }
        } else if(parameter.type() == "boolean"){
            if (parameter.default() == 'true') {
                parameterJson["default"] = true;
                gotValidDefaultValue = true;
            }
            else if (parameter.default() == 'false') {
                parameterJson["default"] = false;
                gotValidDefaultValue = true;
            }
        }
        if(!gotValidDefaultValue) {
            parameterJson["default"] = "" + parameter.default();
        }
    }
    if (parameter.kind()=="StringTypeDeclaration") {
        var stringTypeParameter = <RamlWrapper.StringTypeDeclaration>parameter;
        if (stringTypeParameter.minLength()) {
            parameterJson["minLength"] = stringTypeParameter.minLength();
        }
        if (stringTypeParameter.maxLength()) {
            parameterJson["maxLength"] = stringTypeParameter.maxLength();
        }
        if (stringTypeParameter.pattern()) {
            parameterJson["pattern"] = stringTypeParameter.pattern();
        }
        if (stringTypeParameter.enum() && stringTypeParameter.enum().length > 0) {
            var valEnum = [];
            stringTypeParameter.enum().forEach(x=> {
                valEnum.push(x);
            });
            parameterJson["enum"] = valEnum;
        }
    }
    if (parameter.kind()=="NumberTypeDeclaration") {
        var numberTypeParameter = <RamlWrapper.NumberTypeDeclaration>parameter;
        if (numberTypeParameter.minimum()) {
            parameterJson["minimum"] = numberTypeParameter.minimum();
        }
        if (numberTypeParameter.maximum()) {
            parameterJson["maximum"] = numberTypeParameter.maximum();
        }
    }

    return parameterJson;
}

function serializeActions(_m:Array<RamlWrapper.Method>, api:RamlWrapper.Api, hasAdditional?:boolean) {
    var m:RamlWrapper.Method[] = tools.toArray(_m);
    var methodsJson = [];
    if (m){
        for (var i = 0; i < m.length; i++) {
            var method:RamlWrapper.Method = m[i];

            var methodJson = serializeMethod(method, api, hasAdditional)
            methodsJson.push(methodJson);
        }
        JSON.stringify(methodsJson,null,2);
        return methodsJson;
    }
}

/**
 * As there is custom logics for display name serialization, moved it to a separate method.
 * @param node
 * @param jsonToWriteTo
 */
function serializeNodeDisplayName(node: RamlWrapper.RAMLLanguageElement, jsonToWriteTo: any) {
    var nodeAsAny : any = node;
    try {
        if (!nodeAsAny.displayName) {
            return;
        }

        if (nodeAsAny.displayName() == null) {
            return;
        }
    } catch (Error) {
        console.log(Error)
    }

    //For unknown reason, the 0.8 Spec states that for resource displayName should not default in
    //resource key. This has no sense, our parsers behaves in the same way with regard to displayName
    //for all nodes.
    //Ignoring displayName in resource if it is equal to its default

    var defaultCalculatorInstance = new defaultCalculator.AttributeDefaultsCalculator();
    if (nodeAsAny.displayName() != defaultCalculatorInstance.getWrapperAttributeDefault(node, "displayName")) {
        jsonToWriteTo["displayName"] = nodeAsAny.displayName();
    }
}

/**
 * As there is custom logics for repeat serialization, moved it to a separate method.
 * @param node
 * @param jsonToWriteTo
 */
function serializeNodeRepeat(node: RamlWrapper.RAMLLanguageElement, jsonToWriteTo: any) {
    var nodeAsAny : any = node;
    try {
        if (!nodeAsAny.repeat) {
            return;
        }

        if (nodeAsAny.repeat() == null) {
            return;
        }
    } catch (Error) {
        console.log(Error)
    }

    //For unknown reason, the 0.8 Spec states that for resource displayName should not default in
    //resource key. This has no sense, our parsers behaves in the same way with regard to displayName
    //for all nodes.
    //Ignoring displayName in resource if it is equal to its default

    var defaultCalculatorInstance = new defaultCalculator.AttributeDefaultsCalculator();
    if (nodeAsAny.repeat() != defaultCalculatorInstance.getWrapperAttributeDefault(node, "repeat")) {
        jsonToWriteTo["repeat"] = nodeAsAny.repeat();
    }
}

/**
 * Serializes trait reference to JSON.
 * Basically, returns the value of "is" property
 */
function serializeTraitReferences(references: RamlWrapper.TraitRef[]) : any {
    if (!references || references.length == 0) return null;

    var values = [];

    for (var k = 0; k<references.length; k++){
        var reference = references[k];

        var serializedReference = serializeTraitReference(reference);
        values.push(serializedReference)
    }
    return values;
}

function serializeTraitReference(reference : RamlWrapper.TraitRef) {
    //TODO this is refactored out algorithm scattered across the code.
    //It should be further refactored to be using TypeInstance instead.

    var structuredValue = reference.value();
    var traitParameters = {};

    var refHighLevel = structuredValue.toHighLevel();
    if (refHighLevel) {
        refHighLevel.attrs().forEach(function (attribute) {
            if (isKeyAttribute(attribute))
                return;
            traitParameters["" + attribute.name()] = "" + attribute.value()
        });
    }

    if (Object.keys(traitParameters).length > 0) {
        var isJson = {};
        isJson[""+structuredValue.valueName()] = traitParameters;
        return isJson;
    }
    else
        return structuredValue.valueName();
}

function serializeMethod(method:RamlWrapper.Method, api:RamlWrapper.Api, hasAdditional?:boolean) {
    var methodJson = {};
    var optionalProperties:{[key:string]:boolean} = {};
    method.optionalProperties().forEach(x=>optionalProperties[x]=true);

    methodJson["method"] = ""+method.method();
    if (method.description()) {
        methodJson["description"] = ""+method.description().value();
    }
//TODO fix unnecessary protocols.
    if (hasAdditional){
        var protocols = serializeProtocols(api, hasAdditional);
        if (protocols.length > 0)
            methodJson["protocols"] = protocols;
    }
    if (method.protocols()){
        if (method.protocols().length > 0) {
            var _protocols = []
            method.protocols().forEach(x=>_protocols.push(""+x));
            methodJson["protocols"] = method.protocols()
        }
    }

    serializeNodeDisplayName(method, methodJson);

    var securedByJson = [];
    if (hasAdditional){
        securedByJson = serializeSecuredBy(api.securedBy());
        if (securedByJson.length > 0 && method.securedBy() && method.securedBy().length == 0)
            methodJson["securedBy"] = securedByJson;
    }
    if (method.securedBy()){
        if (api.securedBy() && api.securedBy().length > 0 && method.securedBy().length > 0)
            securedByJson = [];
        if(method.securedBy().length > 0) {
            method.securedBy().forEach(x => {
                if(x.value().valueName() == "null")
                    securedByJson.push(null);
                else
                    securedByJson.push(""+x.value().valueName());
            });
            methodJson["securedBy"] = securedByJson;
        }
    }
    var hasQueryParams = isDefined(method, 'queryParameters');
    if (method.queryParameters()){
        var params = serializeParameters(method.queryParameters(), "query");
        if (Object.keys(params).length > 0)
            methodJson["queryParameters"] = params;
        else if (hasQueryParams)
            methodJson["queryParameters"] = null;
    }
    if (method.is()){
        var serializedTraitRefs = serializeTraitReferences(method.is());
        if (serializedTraitRefs)
            methodJson["is"] = serializedTraitRefs;
    }
    var hasHeaders = isDefined(method, 'headers');
    if (method.headers()){
        var opt = _.some(method.headers(),x=>x.highLevel().optional());
        var headers = serializeParameters(method.headers(), 'header');
        var key = opt ? "headers?" : "headers";
        if (Object.keys(headers).length > 0)
            methodJson[key] = headers;
        else if (hasHeaders)
            methodJson[key] = null;
    }
    if (method.body()){
        var hasBody = isDefined(method, 'body');
        var body = serializeBody(method.body(), api, hasAdditional);
        if (Object.keys(body).length > 0)
            methodJson["body"] = body;
        else if (hasBody)
            methodJson["body"] = null;
    }
    if (method.responses()){
        var hasResponses = isDefined(method, 'responses');
        var responses = serializeResponses(method.responses(), api, hasAdditional);
        if (Object.keys(responses).length > 0)
            methodJson["responses"] = responses;
        else if (hasResponses)
            methodJson["responses"] = null;
    }

    serializeBaseUriParameters(method, methodJson);

    return methodJson;
}

function serializeBody(_b:RamlWrapper.BodyLike[], api:RamlWrapper.Api, hasAdditional?){
    var b:RamlWrapper.BodyLike[] = tools.toArray(_b);
    if (hasAdditional == null)
        hasAdditional = true;
    var bodiesJson = {};
    if (b){
        b.forEach(x=>{
            var body = <RamlWrapper.BodyLike>x;
            var bodyJson = {};
            if (body.schema()) {
                var schemas = serializeSchemasForBody(api.schemas());
                var schemaContent = schemas[body.schema().value()]?""+schemas[body.schema().value()]:"";
                if (schemaContent)
                    bodyJson["schema"] = schemaContent;
                else if (body.schema().value()) {
                    bodyJson["schema"] = ("" + body.schema().value()).trim();
                }
            }
            if (body.example())
                bodyJson["example"] = (""+body.example().value()).trim();
            if (body.description())
                bodyJson["description"] = ""+body.description().value();
            if (body.formParameters()) {
                var hasFormParams = isDefined(body, 'formParameters');
                var formParameters = serializeParameters(body.formParameters(), 'formParameters');
                if (Object.keys(formParameters).length > 0)
                    bodyJson["formParameters"] = formParameters;
                else if (hasFormParams)
                    bodyJson["formParameters"] = null;
            }
            if (Object.keys(bodyJson).length == 0)
                bodyJson = null;
            if (body.name())
                bodiesJson[""+body.name()] = bodyJson;
            else if (hasAdditional == false && bodyJson != null)
                bodiesJson = bodyJson;
            else if (hasAdditional && api.mediaType().value())
                bodiesJson[api.mediaType().value()] = bodyJson;
        });
    }
    JSON.stringify(bodiesJson,null,2);
    return bodiesJson;
}


function serializeResponses(_m:Array<RamlWrapper.Response>, api:RamlWrapper.Api, hasAdditional, kind?:string){
    var m:RamlWrapper.Response[] = tools.toArray(_m);
    var responsesJson = {};
    if (m){
        m.forEach(x=>{
            var response = <RamlWrapper.Response>x;
            var responseJson = {};
            if (response.description())
                responseJson["description"] = ""+response.description().value();
            if (response.headers()) {
                var parametersKind = kind || 'uriParameters'
                var hasHeaders = isDefined(response, 'headers');
                var headersParams = serializeParameters(response.headers(), "headers");
                if (Object.keys(headersParams).length > 0)
                    responseJson["headers"] = headersParams;
                else if(hasHeaders)
                    responseJson["headers"] = null;
            }
            if (response.body()) {
                var bodyJson = serializeBody(response.body(), api, hasAdditional);
                if (Object.keys(bodyJson).length > 0)
                    responseJson["body"] = bodyJson;
            }
            if (Object.keys(responseJson).length == 0)
                responseJson = null;
            responsesJson[""+response.code().value()] = responseJson;
        });
    }
    JSON.stringify(responsesJson,null,2);
    return responsesJson;
}

function serializeSchemas(_m:Array<RamlWrapper.GlobalSchema>){
    var m:RamlWrapper.GlobalSchema[] = tools.toArray(_m);
    var s = [];
    if (m && m.length > 0) {
        for (var i = 0; i < m.length; i++) {
            if (m[i].value()) {
                var schema:RamlWrapper.GlobalSchema = m[i];
                var ij = {};
                ij[""+schema.key()] = ""+schema.value().value();
                s.push(ij);
            }
        }
    }
    JSON.stringify(s,null,2);
    return s;
}

function serializeSchemasForBody(_m:Array<RamlWrapper.GlobalSchema>){
    var m:RamlWrapper.GlobalSchema[] = tools.toArray(_m);
    var s = {};
    if (m && m.length > 0) {
        for (var i = 0; i < m.length; i++) {
            if (m[i].value()) {
                var schema:RamlWrapper.GlobalSchema = m[i];
                s[""+schema.key()] = ""+schema.value().value();
            }
        }
    }
    JSON.stringify(s,null,2);
    return s;
}

function serializeResourceTypes(_m:Array<RamlWrapper.ResourceType>, api:RamlWrapper.Api){
    var m:RamlWrapper.ResourceType[] = tools.toArray(_m);
    var resourceTypesJson = [];
    if (m){
        m.forEach(r=>{
            var resourceType:RamlWrapper.ResourceType = r;
            var resourceTypeJson = {};
            var result = {};
            serializeNodeDisplayName(r, result);
            //if(r.displayName()){
            //    result["displayName"] = ""+r.displayName();
            //}
            if (resourceType.methods()){
                var actions = serializeActions(resourceType.methods(), api, false);
                var map = {};
                actions.forEach(action =>{
                    var name = ""+action.method;
                    delete action.method;
                    if (Object.keys(action).length > 0)
                        map[name] = action;
                    else
                        map[name] = null;
                });
                resourceType.methods().forEach(x=>{
                    var key = x.method();
                    var obj = map[key];
                    if(x.highLevel().optional()){
                        key += '?';
                    }
                    result[key] = obj;
                });
            }
            if (resourceType.is()){
                var serializedTraitRefs = serializeTraitReferences(resourceType.is());
                if (serializedTraitRefs)
                    result["is"] = serializedTraitRefs;
            }
            if(resourceType.type()){
                serializeTypeProperty(resourceType.type(),result);
            }
            var uriParams = serializeParameters(resourceType.uriParameters());
            if (Object.keys(uriParams).length > 0){
                result["uriParameters"] = uriParams;
            }
            if (resourceType.description())
                result["description"] = ""+resourceType.description().value();
            resourceTypeJson[""+resourceType.name()] = result;
            resourceTypesJson.push(resourceTypeJson);
        });
    }
    JSON.stringify(resourceTypesJson,null,2);
    return resourceTypesJson;
}

function serializeTraits(_m:Array<RamlWrapper.Trait>, api?:RamlWrapper.Api){
    var m:RamlWrapper.Trait[] = tools.toArray(_m);
    var traitsJson = [];
    if (m){
        m.forEach(t=>{
            var trait:RamlWrapper.Trait = t;
            var optionalProperties:{[key:string]:boolean} = {};
            t.optionalProperties().forEach(x=>optionalProperties[x]=true);

            var traitJson = {};
            if (trait.usage())
                traitJson["usage"] = ""+trait.usage();
            if (trait.queryParameters()){
                var params = serializeParameters(trait.queryParameters(), "query");
                if (Object.keys(params).length > 0)
                    traitJson["queryParameters"] = params;
            }
            if (trait.headers()){
                var opt = optionalProperties['headers'];
                var headers = serializeParameters(trait.headers(), 'header');
                var key = opt ? "headers?" : "headers";
                if (Object.keys(headers).length > 0)
                    traitJson[key] = headers;
            }

            serializeNodeDisplayName(trait, traitJson);
            //if (trait.displayName())
            //    traitJson["displayName"] = ""+trait.displayName();
            if (trait.description())
                traitJson["description"] = ""+trait.description().value();
            if (trait.responses()){
                var responsesJson = serializeResponses(trait.responses(), api, false, 'trait');
                if (Object.keys(responsesJson).length > 0)
                    traitJson["responses"] = responsesJson;
            }
            if (trait.body()){
                var bodyJson = serializeBody(trait.body(), api, false);
                if (Object.keys(bodyJson).length > 0)
                    traitJson["body"] = bodyJson;
            }
//            if (trait.is()){
//
//                var serializedTraitRefs = serializeTraitReferences(trait.is());
//                if (serializedTraitRefs)
//                    traitJson["is"] = serializedTraitRefs;
//            }
            if (trait.securedBy()){
                var securedByJson = serializeSecuredBy(trait.securedBy());
                if (Object.keys(securedByJson).length > 0)
                    traitJson["securedBy"] = securedByJson;
            }
            if (trait.protocols()) {
                var protocols = trait.protocols();
                if (protocols.length > 0) {
                    traitJson["protocols"] = protocols.map(x=>x.toUpperCase());
                }
            }
            if (Object.keys(traitJson).length > 0) {
                var result = {};
                result[""+trait.name()] = traitJson;
                traitsJson.push(result);
            }
            //responses body is securedBy
            //  else
            //      traitsJson.push(trait.name()); //TODO JSP does not serialize empty traits;
        });
    }
    JSON.stringify(traitsJson,null,2);
    return traitsJson;
}

function serializeDocumentation(_m:Array<RamlWrapper.DocumentationItem>){
    var m:RamlWrapper.DocumentationItem[] = tools.toArray(_m);
    var j = [];
    for(var i=0; i <m.length; i++){
        var d:RamlWrapper.DocumentationItem = m[i];
        var ij = {};
        ij["title"] = ""+d.title();
        ij["content"] = ""+d.content().value();
        j.push(ij);
    }
    JSON.stringify(j,null,2);
    return j;
}

function serializeSecuritySchemes(_m:Array<RamlWrapper.AbstractSecurityScheme>){
    var m:RamlWrapper.AbstractSecurityScheme[] = tools.toArray(_m);
    var schemasJson = [];
    if (m){
        m.forEach(s=>{
            var securitySchema:RamlWrapper.AbstractSecurityScheme = s;
            var schemaJson = {};
            var result = {};
            if (securitySchema.description()) {
                if (securitySchema.description().value()) {
                    schemaJson["description"] = ""+securitySchema.description().value();
                }
            }
            if (securitySchema.type())
                schemaJson["type"] = ""+securitySchema.type();
            var settingsJson = serializeSecuritySettings(securitySchema.settings());
            if (Object.keys(settingsJson).length > 0)
                schemaJson["settings"] = settingsJson;
            var describedByJson = serializeDescribedBy(securitySchema.describedBy());
            if (Object.keys(describedByJson).length > 0)
                schemaJson["describedBy"] = describedByJson;
            result[""+securitySchema.name()] = schemaJson;

            schemasJson.push(result);
        });
    }
    JSON.stringify(schemasJson,null,2);
    return schemasJson;
}

function serializeSecuritySettings(settings:RamlWrapper.SecuritySchemeSettings){
    var settingsJson = {};

    if (!settings) {
        return settingsJson;
    }

    if(settings.highLevel() == null) return settingsJson;

    //TODO replace with serialization of TypeInstance when its ready to support more arbitrary custom settings
    settings.highLevel().attrs().forEach(attribute=>{
        if (attribute.value() && typeof (attribute.value()) == "string") {
            if (settingsJson[attribute.name()]) {
                if (typeof (settingsJson[attribute.name()]) == "string" ||
                    Array.isArray(settingsJson[attribute.name()])) {

                    var newValue = [].concat(settingsJson[attribute.name()]);
                    newValue = newValue.concat(attribute.value());

                    settingsJson[attribute.name()] = newValue;
                }
            } else {
                settingsJson[attribute.name()] = attribute.value();
            }

        }
    })

    return settingsJson;
}

function serializeDescribedBy(description:RamlWrapper.SecuritySchemePart){
    var descriptionJson = {};
    if (description)
        descriptionJson = {}//description.toJSON();
    JSON.stringify(descriptionJson,null,2);
    return descriptionJson; //TODO to implement after pull
}

function serializeSecuredBy(m){
    var j = [];
    if (m && m instanceof Array) {
        for (var i = 0; i < m.length; i++) {
            var schemeName = m[i].value().valueName();
            if (schemeName == "null") {
                schemeName = null;
            }
            j.push(schemeName);
        }
    }
    JSON.stringify(j,null,2);
    return j;
}

function serializeProtocols(api:RamlWrapper.Api, addTransformations){
    var j = [];
    if (addTransformations&& api.protocols() && api.protocols().length == 0) {
        if (api.baseUri()) {
            var baseUri = api.baseUri().value();
            var protocol = baseUri.substr(0, baseUri.indexOf(':'));
            if (protocol.toUpperCase() == 'HTTP' || protocol.toUpperCase() == 'HTTPS')
                j.push(""+protocol.toUpperCase());
        }
    }
    var m = api.protocols();
    if (m && m instanceof Array) {
        for (var i = 0; i < m.length; i++) {
            var value = m[i].toUpperCase();
            j.push(""+value.toUpperCase());
        }
    }
    JSON.stringify(j,null,2);
    return j;
}