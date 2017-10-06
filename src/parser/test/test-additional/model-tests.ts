import assert = require("assert")
import fs = require("fs")
import path = require("path")
import _=require("underscore")
import def = require("raml-definition-system")
import services = require("../../definition-system/ramlServices")

import ll=require("../../lowLevelAST")
import yll=require("../../jsyaml/jsyaml2lowLevel")
import high = require("../../highLevelImpl")
import hl=require("../../highLevelAST")
import t3 = require("../../artifacts/raml10parser")
import util = require("../../test/test-utils")
import universeProvider = require("../../definition-system/universeProvider");
describe('Tests to fix', function () {

    describe('High Level Model', function () {

        it('there should be BodyLike type.... #prop01', function () {
            var api = util.loadApi(util.data('refactor/api-body-subresource.raml'));
            var universe = universeProvider("RAML10");
            //var universe = api.definition().universe();
            var types = universe.types();
            //types.forEach(x=>console.log('class3: ' + x));
            //types.forEach(x=>console.log('type: ' + x.name()));
            var type = <def.NodeClass>universe.type("BodyLike");
            //console.log('type: ' + type);
            assert.ok(type, 'missed BodyLike type');
        });

        it('there should be BodyLike type.... #prop02', function () {
            var api = util.loadApi(util.data('refactor/api-body-subresource.raml'));
            //var universe = universeProvider("RAML10");
            var universe = api.definition().universe();
            var types = universe.types();
            //types.forEach(x=>console.log('class3: ' + x));
            //types.forEach(x=>console.log('type: ' + x.name()));
            var type = <def.NodeClass>universe.type("BodyLike");
            //console.log('type: ' + type);
            assert.ok(type, 'missed universe.BodyLike type');
        });

        it('BodyLike type should have mediaType property #prop1', function () {
            var api = util.loadApi(util.data('refactor/api-body-subresource.raml'));
            var universe = api.definition().universe();
            //universe.types().forEach(x=>console.log('type: ' + type));
            var type = <def.NodeClass>universe.type("BodyLike");
            //console.log('type: ' + type);
            var property = type.property('mediaType');
            console.log('property: ' + property);
            assert.ok(property, 'missed property BodyLike.mediaType');
        });

        it('BodyLike type should have description proprty #prop2', function () {
            var api = util.loadApi(util.data('refactor/api-body-subresource.raml'));
            var universe = api.definition().universe();
            var type = <def.NodeClass>universe.type("BodyLike");
            var property = type.property('description');
            console.log('property: ' + property);
            assert.ok(property, 'missed property BodyLike.description');
        });
    });

    describe('Model', function () {

        //it('fill body #fillbody1', function () {
        //    var api = util.loadApi(util.data('refactor/fillbody/api08-11.raml'));
        //    var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
        //    var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');
        //    var methodType = method.definition();
        //    var body = <high.ASTNodeImpl>bodyType.getAdapter(services.RAMLService).createStubNode(methodType.property('name'), "application/json");
        //    body.createAttr("schema", 'aaa');
        //    body.createAttr("example","!include ./examples/aaa.json");
        //    method.add(body);
        //    console.log(api.lowLevel().unit().contents());
        //    util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-11-added.raml"));
        //});
    });

    describe('Refactoring', function () {
    });

    describe('Model parser', function () {
        it('node end position shouldnt be outside file length (file size is 305 bytes on win) #type31', function () {
            var api = util.loadApi(util.data('refactor/type3.raml'));
            assert.equal(api.lowLevel().end(), 305);
        });
    });

});

