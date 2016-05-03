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


});