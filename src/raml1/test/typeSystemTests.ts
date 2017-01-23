/// <reference path="../../../typings/main.d.ts" />
/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")
import services=require("../definition-system/ramlServices");
import apiLoader = require("../apiLoader")
import RamlWrapper = require("../artifacts/raml10parserapi")
import _=require("underscore")
import path=require("path")
import util = require("./test-utils")
import tools = require("./testTools")
import core = require("../wrapped-ast/parserCore")
var dir=path.resolve(__dirname,"../../../src/raml1/test/")

describe('To Runtime Tests',function(){
    it ("Basic inheritance",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="AnotherType");

        var supers=mt.runtimeType().superTypes();
        assert.equal(supers.length,1);
    });
    it ("Inheritance 1",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="AnotherType2");

        var supers=mt.runtimeType().superTypes();
        assert.equal(supers.length,1);
    });
    it ("Runtime Prop",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="AnotherType2");

        var props=mt.runtimeType().properties();
        assert.equal(props.length,1);
    });
    it ("Runtime Prop type",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="AnotherType2");

        var props=mt.runtimeType().properties();
        assert.equal(props[0].range().hasValueTypeInHierarchy(),true);
    });
    it ("Array type",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Arr");

        var props=mt.runtimeType().properties();
        assert.equal(props.length,0);
        assert.equal(mt.runtimeType().hasArrayInHierarchy(),true);

        assert.equal(mt.runtimeType().arrayInHierarchy().componentType().properties().length,1)
    });
    it ("Array type 2",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Arr");

        var props=mt.runtimeType().properties();
        assert.equal(props.length,0);
        assert.equal(mt.runtimeType().isArray(),true);

        assert.equal(mt.runtimeType().array().componentType().properties().length,1)
    });
    //it ("Array type 3",function(){
    //    var rsm=util.loadApiWrapper1("typeSystem.raml");
    //    var resource = tools.collectionItem(rsm.resources(), 1);
    //    var method = tools.collectionItem(resource.methods(), 0);
    //    var body = tools.collectionItem(method.body(), 0);
    //
    //    var runtimeType = body.runtimeDefinition();
    //
    //    assert.equal(runtimeType.isArray(), false);
    //});

    it ("Union Type",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Un");

        var props=mt.runtimeType().properties();
        assert.equal(props.length,0);
        assert.equal(mt.runtimeType().hasUnionInHierarchy(),true);

        assert.equal(mt.runtimeType().unionInHierarchy().leftType().arrayInHierarchy().componentType().properties().length,1)
    });
    it ("Union Type 2",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Un");

        var props=mt.runtimeType().properties();
        assert.equal(props.length,0);
        assert.equal(mt.runtimeDefinition().isUnion(),true);

        assert.equal(mt.runtimeDefinition().union().leftType().arrayInHierarchy().componentType().properties().length,1)
    });
    //it ("Union Type 3",function(){
    //    var rsm=util.loadApiWrapper1("typeSystem.raml");
    //    var resource = tools.collectionItem(rsm.resources(), 0);
    //    var method = tools.collectionItem(resource.methods(), 0);
    //    var body = tools.collectionItem(method.body(), 0);
    //
    //    var runtimeType = body.runtimeDefinition();
    //
    //    assert.equal(runtimeType.isUnion(), false);
    //});
    //it ("Facet access",function(){
    //    var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
    //    var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Facet");
    //    var z=mt.runtimeType();
    //    var f=z.getAdapter(services.RAMLService).getRepresentationOf().getFixedFacets();
    //    assert.equal(Object.keys(f).length,3);
    //}); Not relevant any more
    it ("Value type 1",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Facet");

        var z=mt.runtimeType();
        assert.equal(z.hasValueTypeInHierarchy(), true);
    });
    it ("Value type 2",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="Facet");

        var z=mt.runtimeType();
        assert.equal(z.isValueType(), true);
    });
    it ("Value type 3",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml")).getOrElse(null);
        var resource = tools.collectionItem(rsm.resources(), 2);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);

        var runtimeType = body.runtimeDefinition();

        assert.equal(runtimeType.isUnion(), false);
    });
    it ("Multiple inheritance",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="T4");

        var z=mt.runtimeType();
        var f=z.allProperties();
        assert.equal(f.length,3);
    });
    it ("Inheritance loop",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml"));
        var mt=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="T6");

        var z=mt.runtimeType();
        var f=z.allProperties();
        assert.equal(f.length,3);
    });

    it('Node by runtime type', function () {
        var api = apiLoader.loadApi(path.resolve(dir,"data/typeSystem.raml")).getOrElse(null);

        var typeNode1 = tools.collectionItem((<any>api).types(), 0);
        var runtimeType = typeNode1.runtimeType();
        var nodeByType = apiLoader.getLanguageElementByRuntimeType(runtimeType);

        assert.equal(typeNode1.name(), (<any>nodeByType).name())
    });
});

describe('Nominal Hierarchy Genuine User Defined Tests',function(){
    it ("Genuine User Defined 1",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType1");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 2",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType2");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 3",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType3");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 4",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType4");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 5",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType5");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 6",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType6");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined 7",function(){
        var rsm=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml"));
        var type=_.find((<RamlWrapper.Api>util.expandWrapperIfNeeded(rsm.getOrElse(null))).types(),x=>x.name()=="TestType7");

        var runtimeType = type.runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined Method Response 1",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[0];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();
        console.log("----DEBUG: " + runtimeType.nameId()+"/"+runtimeType.isGenuineUserDefinedType())

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 2",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[1];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 3",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[2];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 4",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[3];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 5",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[4];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 6",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[5];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined Method Response 7",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[6];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), false);
    });

    it ("Genuine User Defined Method Response 7",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[7];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
    });

    it ("Genuine User Defined Method Response In hierarchy 1",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[0];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType1")
    });

    it ("Genuine User Defined Method Response In hierarchy 2",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[1];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType2")
    });

    it ("Genuine User Defined Method Response In hierarchy 3",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[2];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType3")
    });

    it ("Genuine User Defined Method Response In hierarchy 4",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[3];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType4")
    });

    it ("Genuine User Defined Method Response In hierarchy 5",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[4];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType5")
    });

    it ("Genuine User Defined Method Response In hierarchy 6",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[5];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "application/xml")
    });

    it ("Genuine User Defined Method Response In hierarchy 7",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[6];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "TestType7")
    });

    it ("Genuine User Defined Method Response In hierarchy 8",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/genuine.raml")).getOrElse(null);

        var method = api.resources()[0].methods()[0];
        var response = method.responses()[7];
        var type = response.body()[0];

        var runtimeType = (<RamlWrapper.TypeDeclaration>type).runtimeType();

        assert.equal(runtimeType.hasGenuineUserDefinedTypeInHierarchy(), true);

        var userDefinedType = runtimeType.genuineUserDefinedTypeInHierarchy();
        assert.notEqual(userDefinedType, null);

        assert.equal(userDefinedType.nameId(), "application/json")
    });

    it ("Built-in facets for Object type",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[0];
        var expected = {
            "displayName": "Test Object Type",
            "description": "test object type",
            "usage": "type for testing object type built in facets",
            "minProperties": 1,
            "maxProperties": 2,
            "discriminator": "kind",
            "discriminatorValue": "__MyObjectType__",
            "additionalProperties": false
        };
        var ignore:any = {
            properties: true
        };
        testFacets(type,expected,ignore);     
    });

    it ("Pattern Property RegExp",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[0];
        var prop = type.runtimeType().properties()[1];
        var regExp = prop.getKeyRegexp();
        assert(regExp=="/[a-z]+/");
    });

    it ("Built-in facets for File type",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[1];
        var expected = {
            "displayName": "Test File Type",
            "description": "test file type",
            "usage": "type for testing file type built in facets",
            "minLength" : 1024,
            "maxLength" : 8192,
            "fileTypes" : [ "text/txt", "text/doc" ]
        };
        testFacets(type,expected);

    });

    it ("Built-in facets for Array type",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[2];
        var expected = {
            "displayName": "Test Array Type",
            "description": "test array type",
            "usage": "type for testing array type built in facets",
            "minItems": 1,
            "maxItems": 10,
            "uniqueItems": true
        };
        var ignore:any = {
            items: true
        };
        testFacets(type,expected,ignore);
    });

    it ("Built-in facets for String type",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[3];
        var expected = {
            "displayName": "Test String Type",
            "description": "test string type",
            "usage": "type for testing string type built in facets",
            "minLength": 3,
            "maxLength": 128,
            "enum": [ "abcd", "12345" ],
            "pattern": "[a-zA-Z0-9]{3,128}",
            "default": "abcd"
        };
        var ignore:any = {
            items: true
        };
        testFacets(type,expected,ignore);
    });

    it ("Built-in facets for Number type",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).types()[4];
        var expected = {
            "displayName": "Test Number Type",
            "description": "test number type",
            "usage": "type for testing number type built in facets",
            "minimum": 1,
            "maximum": 1000,
            "multipleOf": 5,
            "enum": [ 15, 20, 25, 30 ],
            "format": "int8",
            "default": 15
        };
        testFacets(type,expected);
    });

    it ("Built-in 'allowedTargets' facet",function(){
        var api=apiLoader.loadApi(path.resolve(dir,"data/typesystem/facets.raml")).getOrElse(null);
        var type = (<RamlWrapper.Api>api).annotationTypes()[0];
        var expected = {
            "displayName": "Test Annotation Type",
            "description": "test Annotation type",
            "usage": "type for testing annotation type built in 'allowedTarget' facet",
            "allowedTargets": [ "Method", "Resource" ]
        };
        var ignore: any = {};
        api.highLevel().definition().universe().type("StringTypeDeclaration")
            .properties().forEach(x=>ignore[x.nameId()] = true);
        testFacets(type,expected,ignore,true);
    });
});

function testFacets(typeNode:core.BasicNode,expected:any,ignoredProperties:any={},all=false){

    var runtimeType = (<RamlWrapper.TypeDeclaration>typeNode).runtimeType();
    var fixedBuiltInFacets:any = all ? runtimeType.allFixedBuiltInFacets() : runtimeType.fixedBuiltInFacets();

    var props = [ "displayName", "description", "usage" ];
    typeNode.highLevel().definition().universe().type(typeNode.kind())
        .properties().filter(x=>!ignoredProperties[x.nameId()]).forEach(x=>{
        props.push(x.nameId())
    });

    for(var pName of props){
        var eVal = expected[pName];
        var aVal = fixedBuiltInFacets[pName];
        assert.notEqual(eVal, null);
        if (Array.isArray(aVal) && Array.isArray(eVal)) {
            aVal = aVal.toString();
            eVal = eVal.toString();
        }
        assert.equal(aVal, eVal);
    }
}