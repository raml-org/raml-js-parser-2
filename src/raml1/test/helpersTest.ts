/// <reference path="../../../typings/main.d.ts" />

import assert = require("assert")
import util = require("./test-utils")
import tools = require("./testTools")
import RamlWrapper = require("../artifacts/raml10parserapi")
import RamlWrapperImpl = require("../artifacts/raml10parser")

describe('Helper methods', function () {

    var api:RamlWrapper.Api;
    var songsResource:RamlWrapper.Resource;
    var songResource:RamlWrapper.Resource;
    var getSongMethod:RamlWrapper.Method;
    var response:RamlWrapper.Response;

    it('Api.allTraits()', function () {
        api = util.loadApiWrapper1("./helperTestApi.raml");
        (<RamlWrapperImpl.ApiImpl>api).setAttributeDefaults(true);
        var traits = api.allTraits();
        assert.notEqual(traits,null);
        var traitsCount = tools.getLength(traits);
        assert.equal(traitsCount,2);
    });

    it('Api.allProtocols()', function () {
        var protocols = api.allProtocols();
        assert.notEqual(protocols,null);
        var protocolsCount = tools.getLength(protocols);
        assert.equal(protocolsCount,1);
    });

    it('Api.allResourceTypes()', function () {
        var resourceTypes = api.allResourceTypes();
        assert.notEqual(resourceTypes,null);
        var resourceTypesCount = tools.getLength(resourceTypes);
        assert.equal(resourceTypesCount,2);
    });

    it('Api.allResources()', function () {
        var resources = api.allResources();
        assert.notEqual(resources,null);
        var resourcesCount = tools.getLength(resources);
        assert.equal(resourcesCount,2);
    });

    it('Api.childResource(relPath:string)', function () {

        songsResource = api.childResource("/songs");
        assert.notEqual(songsResource,null);
        assert.equal(songsResource.relativeUri().value(),'/songs');
    });

    it('Api.allBaseUriParameters()', function () {

        var baseUriParameters = api.allBaseUriParameters();
        var baseUriParametersCount = tools.getLength(baseUriParameters);
        assert.equal(baseUriParametersCount,3);
    });

    it('Resource.childResource(relPath:string)', function () {

        songResource = songsResource.childResource("/{singetId}_{songId}");
        assert.notEqual(songResource,null);
        assert.equal(songResource.relativeUri().value(),'/{singetId}_{songId}');
    });

    it('Resource.childMethod(method:string)', function () {

        var getMethods = songResource.childMethod("get");
        assert.notEqual(getMethods,null);
        var getMethodsCount = tools.getLength(getMethods);
        assert.equal(getMethodsCount,1);
        getSongMethod = tools.collectionItem(getMethods,0);
        assert.equal(getSongMethod.method(),'get');
    });

    it('Resource.completeRelativeUri()', function () {

        var relUri = songResource.completeRelativeUri();
        assert.equal(relUri,'/songs/{singetId}_{songId}');
    });

    it('Resource.absoluteUri()', function () {

        var relUri = songResource.absoluteUri();
        assert.equal(relUri,'http://{domain}.{country}.api.com/{version}/songs/{singetId}_{songId}');
    });

    it('Resource.parentResource()', function () {
        songsResource = api.childResource("/songs");
        songResource = songsResource.childResource("/{singetId}_{songId}");
        var parent = songResource.parentResource();
        assert.notEqual(parent,null);
        assert.equal(parent.relativeUri().value(),'/songs');
        //assert(parent.parentResource()==null)
    });

    it('Resource.ownerApi()', function () {

        var owner = songResource.ownerApi();
        assert.notEqual(owner,null);
        assert.equal(owner.baseUri().value(),'http://{domain}.{country}.api.com/{version}');
    });

    it('Resource.allUriParameters()', function () {

        var uriParameters = songResource.allUriParameters();
        var uriParametersCount = tools.getLength(uriParameters);
        assert.equal(uriParametersCount,2);
    });

    it('Resource.absoluteUriParameters()', function () {

        var absoluteUriParameters = songResource.absoluteUriParameters();
        var absoluteUriParametersCount = tools.getLength(absoluteUriParameters);
        assert.equal(absoluteUriParametersCount,5);
    });


    it('Method.methodId()', function () {

        var methodId = getSongMethod.methodId();
        assert.equal(methodId,'/songs/{singetId}_{songId} get');
    });

    it('Method.ownerApi()', function () {

        var owner = getSongMethod.ownerApi();
        assert.notEqual(owner,null);
        assert.equal(owner.baseUri().value(),'http://{domain}.{country}.api.com/{version}');
    });

    it('Method.parentResource()', function () {

        var parent = getSongMethod.parentResource();
        assert.notEqual(parent,null);
        assert.equal(parent.relativeUri().value(),'/{singetId}_{songId}');
    });


    it('Response.isOkRange()', function () {

        response = tools.collectionItem(getSongMethod.responses(),0);
        assert.notEqual(response,null);
        assert.equal(response.isOkRange(),true);
    });

    //it('Type.runtimeType()', function () {
    //    var body = tools.collectionItem(response.body(),0);
    //    assert.equal(body.name(),'application/json');
    //    var runtimeType = body.runtimeType();
    //    var propertiesCount = tools.getLength(runtimeType.allProperties());
    //    assert.equal(propertiesCount,2);
    //});

    //it('Resource.allSecuredBy()', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.ResourceImpl>resource).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(resource.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //});
    //
    //it('Method.allSecuredBy()', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //});
    //
    //it('Resource.allSecuredBy() override', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.ResourceImpl>resource).securedBy());
    //    assert.equal(defaultSchemasNumber,1);
    //
    //    var allSchemasNumber = tools.getLength(resource.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(resource.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "basic")
    //});
    //
    //it('Method.allSecuredBy() override', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,1);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(method.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "oauth_1_0")
    //});
    //
    //it('Resource.allSecuredBy() 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.ResourceImpl>resource).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(resource.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //});
    //
    //it('Method.allSecuredBy() 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //});
    //
    //it('Method.allSecuredBy() schema from resource', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy3.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(method.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "basic")
    //
    //});
    //
    //it('Method.allSecuredBy() schema from resource 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy3_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,0);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(method.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "basic")
    //});
    //
    //it('Resource.allSecuredBy() override 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.ResourceImpl>resource).securedBy());
    //    assert.equal(defaultSchemasNumber,1);
    //
    //    var allSchemasNumber = tools.getLength(resource.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(resource.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "basic")
    //});
    //
    //it('Method.allSecuredBy() override 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var defaultSchemasNumber = tools.getLength((<RamlWrapper.MethodImpl>method).securedBy());
    //    assert.equal(defaultSchemasNumber,1);
    //
    //    var allSchemasNumber = tools.getLength(method.allSecuredBy());
    //    assert.equal(allSchemasNumber,1);
    //
    //    var securedBy = tools.collectionItem(method.allSecuredBy(), 0);
    //    assert.equal(securedBy.highLevel().value(), "oauth_1_0")
    //});
    //
    //it('SecuritySchemeReference.securitySchemeName() for resource', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.ResourceImpl>resource).securedBy(), 0);
    //    assert.equal(securedBy.securitySchemeName(), "basic")
    //});
    //
    //it('SecuritySchemeReference.securitySchemeName() for method', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.MethodImpl>method).securedBy(), 0);
    //    assert.equal(securedBy.securitySchemeName(), "oauth_1_0")
    //});
    //
    //it('SecuritySchemeReference.securitySchemeName() for resource 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.ResourceImpl>resource).securedBy(), 0);
    //    assert.equal(securedBy.securitySchemeName(), "basic")
    //});
    //
    //it('SecuritySchemeReference.securitySchemeName() for method 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.MethodImpl>method).securedBy(), 0);
    //    assert.equal(securedBy.securitySchemeName(), "oauth_1_0")
    //});
    //
    //it('SecuritySchemeReference.securityScheme() for resource', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.ResourceImpl>resource).securedBy(), 0);
    //    var referredScheme = securedBy.securityScheme();
    //
    //    //commented out as Java nodes do not have kind() method
    //    //assert.equal(referredScheme.kind(), "SecuritySchema");
    //
    //    assert.equal(referredScheme.name(), "basic");
    //});
    //
    //it('SecuritySchemeReference.securityScheme() for method', function () {
    //    var api = util.loadApiWrapper08("./helper/securedBy2.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.MethodImpl>method).securedBy(), 0);
    //    var referredScheme = securedBy.securityScheme();
    //
    //    //commented out as Java nodes do not have kind() method
    //    //assert.equal(referredScheme.kind(), "SecuritySchema");
    //
    //    assert.equal(referredScheme.name(), "oauth_1_0");
    //});
    //
    //it('SecuritySchemeReference.securityScheme() for resource 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.ResourceImpl>resource).securedBy(), 0);
    //    var referredScheme = securedBy.securityScheme();
    //
    //    //commented out as Java nodes do not have kind() method
    //    //assert.equal(referredScheme.kind(), "BasicSecurityScheme");
    //
    //    assert.equal(referredScheme.name(), "basic");
    //});
    //
    //it('SecuritySchemeReference.securityScheme() for method 1.0', function () {
    //    var api = util.loadApiWrapper1("./helper/securedBy2_10.raml");
    //    var resource = tools.collectionItem(api.resources(),0);
    //    var method = tools.collectionItem(resource.methods(),0);
    //
    //    var securedBy = tools.collectionItem((<RamlWrapper.MethodImpl>method).securedBy(), 0);
    //    var referredScheme = securedBy.securityScheme();
    //
    //    //commented out as Java nodes do not have kind() method
    //    //assert.equal(referredScheme.kind(), "OAuth1SecurityScheme");
    //
    //    assert.equal(referredScheme.name(), "oauth_1_0");
    //});

    it('SecuritySchemeReference.securityScheme() for api-level', function () {
        var api = util.loadApiWrapper08("./helper/securedBy.raml");
        //var resource = tools.collectionItem(api.resources(),0);

        var securedBy = tools.collectionItem(api.securedBy(), 0);
        var referredScheme = securedBy.securityScheme();

        //commented out as Java nodes do not have kind() method
        //assert.equal(referredScheme.kind(), "SecuritySchema");

        assert.equal(referredScheme.name(), "oauth_2_0");
    });

    it('SecuritySchemeReference.securityScheme() for api-level 1.0', function () {
        var api = util.loadApiWrapper1("./helper/securedBy_10.raml");
        //var resource = tools.collectionItem(api.resources(),0);

        var securedBy = tools.collectionItem(api.securedBy(), 0);
        var referredScheme = securedBy.securityScheme();

        //commented out as Java nodes do not have kind() method
        //assert.equal(referredScheme.kind(), "SecuritySchema");

        assert.equal(referredScheme.name(), "oauth_2_0");
    });
    //it('Type.validateInstance() positive', function () {
    //    var method=tools.collectionItem(api.childResource("/songs").methods(),0);
    //    var param=tools.collectionItem(method.queryParameters(),0);
    //    assert.equal(param.name(),'genre');
    //    var errors=param.validateInstance("pop");
    //    assert.equal(tools.getLength(errors),0);
    //});
    //it('Type.validateInstance() negative', function () {
    //    var method=tools.collectionItem(api.childResource("/songs").methods(),0);
    //    var param=tools.collectionItem(method.queryParameters(),0);
    //    assert.equal(param.name(),'genre');
    //    var errors=param.validateInstance("pop2");
    //    assert.equal(tools.getLength(errors),1)
    //});

    it('Api.version() 1.0', function () {
        var api = util.loadApiWrapper1("./helper/securedBy_10.raml");

        assert.equal(api.RAMLVersion(), "RAML10");
    });

    it('Api.version() 0.8', function () {
        var api = util.loadApiWrapper08("./helper/securedBy.raml");

        assert.equal(api.RAMLVersion(), "RAML08");
    });

    it('Defaults for UriParameter#repeat', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.repeat(), false);
    });

    it('Defaults for UriParameter#repeat 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.repeat(), false);
    });

    it('Defaults for UriParameter#displayName', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.displayName(), "testParam");
    });

    it('Defaults for UriParameter#displayName', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.displayName(), "testParam");
    });

    it('Defaults for UriParameter#required', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.required(), true);
    });

    it('Defaults for UriParameter#required 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        assert.equal(uriParameter.required(), true);
    });

    it('Defaults for UriParameter#type', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        var type = tools.collectionItem(uriParameter.type(),0);
        assert.equal(type, "string");
    });

    it('Defaults for UriParameter#type 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.uriParameters(), 0);
        var type = uriParameter.type();
        assert.equal(type, "string");
    });

    it('Defaults for UriParameter#repeat , allUriParameters', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters2.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.repeat(), false);
    });

    it('Defaults for UriParameter#repeat 08 , allUriParameters', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters2_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.repeat(), false);
    });

    it('Defaults for UriParameter#displayName , allUriParameters', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters2.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.displayName(), "testParam");
    });

    it('Defaults for UriParameter#displayName , allUriParameters', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters2_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.displayName(), "testParam");
    });

    it('Defaults for UriParameter#required , allUriParameters', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters2.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.required(), true);
    });

    it('Defaults for UriParameter#required 08 , allUriParameters', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters2_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        assert.equal(uriParameter.required(), true);
    });

    it('Defaults for UriParameter#type , allUriParameters', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/uriParameters2.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        var type = tools.collectionItem(uriParameter.type(),0);
        assert.equal(type, "string");
    });

    it('Defaults for UriParameter#type 08 , allUriParameters', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/uriParameters2_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var uriParameter = tools.collectionItem(resource.allUriParameters(), 0);
        var type = uriParameter.type();
        assert.equal(type, "string");
    });

    it('Defaults for QueryParameter#displayName', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/queryParameters.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var queryParameter = tools.collectionItem(method.queryParameters(), 0);
        assert.equal(queryParameter.displayName(), "page");
    });

    it('Defaults for QueryParameter#displayName', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/queryParameters_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var queryParameter = tools.collectionItem(method.queryParameters(), 0);
        assert.equal(queryParameter.displayName(), "page");
    });






    it('Defaults for Header#repeat', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/headers.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.repeat(), false);
    });

    it('Defaults for Header#repeat 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/headers_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.repeat(), false);
    });

    it('Defaults for Header#displayName', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/headers.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.displayName(), "Zencoder-Api-Key");
    });

    it('Defaults for Header#displayName', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/headers_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.displayName(), "Zencoder-Api-Key");
    });

    it('Defaults for Header#required', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/headers.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.required(), false);
    });

    it('Defaults for Header#required 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/headers_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        assert.equal(header.required(), false);
    });

    it('Defaults for Header#type', function () {
        var api = util.loadApiOptions1(util.data("parser/defaults/headers.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        var type = tools.collectionItem(header.type(),0);
        assert.equal(type, "string");
    });

    it('Defaults for Header#type 08', function () {
        var api = util.loadApiOptions08(util.data("parser/defaults/headers_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var header = tools.collectionItem(method.headers(), 0);
        var type = header.type();
        assert.equal(type, "string");
    });
    //This is not relevant any more
    // it('TypeDeclaration.schemaContent 1 #1.0', function () {
    //     var api = util.loadApiOptions1(util.data("helper/schema1_10.raml"),
    //         {attributeDefaults:true});
    //
    //     var resource = tools.collectionItem(api.resources(), 0);
    //     var method = tools.collectionItem(resource.methods(), 0);
    //     var body = tools.collectionItem(method.body(), 0);
    //     var schemaContents : string = body.schemaContent();
    //     assert.equal(schemaContents.indexOf("required"), 5);
    // });
    //
    // it('TypeDeclaration.schemaContent 2 #1.0', function () {
    //     var api = util.loadApiOptions1(util.data("helper/schema2_10.raml"),
    //         {attributeDefaults:true});
    //
    //     var resource = tools.collectionItem(api.resources(), 0);
    //     var method = tools.collectionItem(resource.methods(), 0);
    //     var body = tools.collectionItem(method.body(), 0);
    //     var schemaContents : string = body.schemaContent();
    //     assert.equal(schemaContents.indexOf("required"), 5);
    // });
    //
    // it('TypeDeclaration.schemaContent 3 #1.0', function () {
    //     var api = util.loadApiOptions1(util.data("helper/schema3_10.raml"),
    //         {attributeDefaults:true});
    //
    //     var resource = tools.collectionItem(api.resources(), 0);
    //     var method = tools.collectionItem(resource.methods(), 0);
    //     var body = tools.collectionItem(method.body(), 0);
    //     var schemaContents : string = body.schemaContent();
    //     assert.equal(schemaContents.indexOf("required"), 5);
    // });

    it('TypeDeclaration.schemaContent 1 #0.8', function () {
        var api = util.loadApiOptions08(util.data("helper/schema1_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);
        var schemaContents : string = body.schemaContent();
        assert.equal(schemaContents.indexOf("required"), 5);
    });

    it('TypeDeclaration.schemaContent 2 #0.8', function () {
        var api = util.loadApiOptions08(util.data("helper/schema2_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);
        var schemaContents : string = body.schemaContent();
        assert.equal(schemaContents.indexOf("required"), 5);
    });

    it('TypeDeclaration.schemaContent 3 #0.8', function () {
        var api = util.loadApiOptions08(util.data("helper/schema3_08.raml"),
            {attributeDefaults:true});

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);
        var schemaContents : string = body.schemaContent();
        assert.equal(schemaContents.indexOf("required"), 5);
    });


});
