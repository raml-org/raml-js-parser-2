/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

import fs = require("fs")
import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
//import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
import _=require("underscore")
import search=require("../../search/search-interface")
import wrapper=require("../artifacts/raml10parser");
import wrapperApi=require("../artifacts/raml10parserapi");
import wrapperHelper=require("../wrapped-ast/wrapperHelper");
import core=require("../wrapped-ast/parserCore");
import services=require("../definition-system/ramlServices")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
var dir=path.resolve(__dirname,"../../../src/parser/test/")

describe('Example API tests.',function(){
    this.timeout(15000);
    it ("Direct YAML example",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api01.raml"))
        var example = api.types()[0].example();
        assert.deepEqual((<core.TypeInstanceImpl>example.structuredValue()).toJSON(),{prop1: "value1"});
        assert(example.strict());
        assert.equal(example.name(),null);
        assert.equal(example.displayName(),null);
        assert.equal(example.description(),null);
        assert.equal(example.annotations().length,0);
    });

    it ("Direct JSON example",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api02.raml"))
        var example = api.types()[0].example();
        assert.deepEqual((<core.TypeInstanceImpl>example.structuredValue()).toJSON(),{prop1: "value1"});
        assert(example.strict());
        assert.equal(example.name(),null);
        assert.equal(example.displayName(),null);
        assert.equal(example.description(),null);
        assert.equal(example.annotations().length,0);
    });

    it ("Wrapped simple YAML example",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api03.raml"))
        var example = api.types()[0].example();
        assert.deepEqual((<core.TypeInstanceImpl>example.structuredValue()).toJSON(),{prop1: "value1"});
        assert(example.strict());
        assert.equal(example.name(),null);
        assert.equal(example.displayName(),null);
        assert.equal(example.description(),null);
        assert.equal(example.annotations().length,0);
    });

    it ("Wrapped extended YAML example",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api04.raml"))
        var example = api.types()[0].example();
        assert.deepEqual((<core.TypeInstanceImpl>example.structuredValue()).toJSON(),{prop1: "value1"});
        assert(!example.strict());
        assert.equal(example.name(),null);
        assert.equal(example.displayName(),"myExample");
        assert.equal(example.description().value(),"example of ObjectType3");
        var annotations = example.annotations();
        assert.equal(annotations.length,2);
        var aRef0 = annotations[0];
        var aRef1 = annotations[1];
        assert.equal(aRef0.annotation().name(),"NumberAnnotation");
        assert.equal(aRef0.structuredValue().value(),5);
        assert.equal(aRef1.annotation().name(),"ObjectAnnotation");
        assert.equal(aRef1.structuredValue().properties()[0].name(),"prop1");
        assert.equal(aRef1.structuredValue().properties()[0].value().value(),"value1");
    });

    it ("Examples sequence",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api05.raml"))

        var example1 = api.types()[0].examples()[0];
        assert.deepEqual((<core.TypeInstanceImpl>example1.structuredValue()).toJSON(),{prop1: "value1"});
        assert(!example1.strict());
        assert.equal(example1.name(),null);
        assert.equal(example1.displayName(),"myExample1");
        assert.equal(example1.description().value(),"example 1 of ObjectType3");
        var annotations1 = example1.annotations();
        assert.equal(annotations1.length,2);
        var aRef10 = annotations1[0];
        var aRef11 = annotations1[1];
        assert.equal(aRef10.annotation().name(),"NumberAnnotation");
        assert.equal(aRef10.structuredValue().value(),5);
        assert.equal(aRef11.annotation().name(),"ObjectAnnotation");
        assert.equal(aRef11.structuredValue().properties()[0].name(),"prop1");
        assert.equal(aRef11.structuredValue().properties()[0].value().value(),"value1");

        var example2 = api.types()[0].examples()[1];
        assert.deepEqual((<core.TypeInstanceImpl>example2.structuredValue()).toJSON(),{prop1: "value2"});
        assert(!example2.strict());
        assert.equal(example2.name(),null);
        assert.equal(example2.displayName(),"myExample2");
        assert.equal(example2.description().value(),"example 2 of ObjectType3");
        var annotations2 = example2.annotations();
        assert.equal(annotations2.length,2);
        var aRef20 = annotations2[0];
        var aRef21 = annotations2[1];
        assert.equal(aRef20.annotation().name(),"NumberAnnotation");
        assert.equal(aRef20.structuredValue().value(),15);
        assert.equal(aRef21.annotation().name(),"ObjectAnnotation");
        assert.equal(aRef21.structuredValue().properties()[0].name(),"prop1");
        assert.equal(aRef21.structuredValue().properties()[0].value().value(),"value2");
    });

    it ("Examples sequence",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/parser/examples/example_api06.raml"))

        var example1 = api.types()[0].examples()[0];
        assert.deepEqual((<core.TypeInstanceImpl>example1.structuredValue()).toJSON(),{prop1: "value1"});
        assert(!example1.strict());
        assert.equal(example1.name(),"example1");
        assert.equal(example1.displayName(),"myExample1");
        assert.equal(example1.description().value(),"example 1 of ObjectType3");
        var annotations1 = example1.annotations();
        assert.equal(annotations1.length,2);
        var aRef10 = annotations1[0];
        var aRef11 = annotations1[1];
        assert.equal(aRef10.annotation().name(),"NumberAnnotation");
        assert.equal(aRef10.structuredValue().value(),5);
        assert.equal(aRef11.annotation().name(),"ObjectAnnotation");
        assert.equal(aRef11.structuredValue().properties()[0].name(),"prop1");
        assert.equal(aRef11.structuredValue().properties()[0].value().value(),"value1");

        var example2 = api.types()[0].examples()[1];
        assert.deepEqual((<core.TypeInstanceImpl>example2.structuredValue()).toJSON(),{prop1: "value2"});
        assert(!example2.strict());
        assert.equal(example2.name(),"example2");
        assert.equal(example2.displayName(),"myExample2");
        assert.equal(example2.description().value(),"example 2 of ObjectType3");
        var annotations2 = example2.annotations();
        assert.equal(annotations2.length,2);
        var aRef20 = annotations2[0];
        var aRef21 = annotations2[1];
        assert.equal(aRef20.annotation().name(),"NumberAnnotation");
        assert.equal(aRef20.structuredValue().value(),15);
        assert.equal(aRef21.annotation().name(),"ObjectAnnotation");
        assert.equal(aRef21.structuredValue().properties()[0].name(),"prop1");
        assert.equal(aRef21.structuredValue().properties()[0].value().value(),"value2");
    });
});
