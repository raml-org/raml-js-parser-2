/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

//import fs = require("fs")
//import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
//import ll=require("../lowLevelAST")

import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
import tools = require("./testTools")
import wrapper10=require("../artifacts/raml10parserapi")
import _=require("underscore")


describe('Runtime example tests', function() {
    it('Should return JSON string example as JSON', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonExample = example.asJSON();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return JSON string example as String', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonString = example.asString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return JSON string example original', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonString = example.original();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return YAML string example as JSON', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonExample = example.asJSON();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return YAML string example as String', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonString = example.asString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return YAML string example original', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonExample = example.original();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return expand and return proper string 1', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="ManWithDog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isEmpty(), true);

        var jsonString = example.expandAsString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{"name":"Pavel","d":{"name":"Dog","age":33}})
    });

    it('Should return expand and return proper JSON 1', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e1.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="ManWithDog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isEmpty(), true);

        var jsonExample = example.expandAsJSON();
        assert.deepEqual(jsonExample,{"name":"Pavel","d":{"name":"Dog","age":33}})
    });

    it('Should return JSON string example as JSON, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonExample = example.asJSON();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return JSON string example as String, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonString = example.asString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return JSON string example original, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog2");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), true);

        var jsonString = example.original();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });


    it('Should return YAML string example as JSON, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonExample = example.asJSON();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return YAML string example as String, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonString = example.asString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return YAML string example original, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isJSONString(), false);
        assert.equal(example.isYAML(), true);

        var jsonExample = example.original();
        assert.deepEqual(jsonExample,{ "name": "Dog", "age": 33 })
    });

    it('Should return expand and return proper string 1, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="ManWithDog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isEmpty(), true);

        var jsonString = example.expandAsString();
        var jsonExample = JSON.parse(jsonString);
        assert.deepEqual(jsonExample,{"name":"Pavel","d":{"name":"Dog","age":33}})
    });

    it('Should return expand and return proper JSON 1, include', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e2.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="ManWithDog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isEmpty(), true);

        var jsonExample = example.expandAsJSON();
        assert.deepEqual(jsonExample,{"name":"Pavel","d":{"name":"Dog","age":33}})
    });


    it('Should return XML string example as String', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e3.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Dog");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isXMLString(), true);

        var xmlString = example.asString();
        assert(xmlString.indexOf(">") != -1)
    });

    it('User defined 1', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e4.raml'));

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);

        var runtimeType = body.runtimeType();
        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
        assert.equal(runtimeType.genuineUserDefinedType().nameId(), "application/json");
    });

    it('User defined 2', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e5.raml'));

        var resource = tools.collectionItem(api.resources(), 0);
        var method = tools.collectionItem(resource.methods(), 0);
        var body = tools.collectionItem(method.body(), 0);

        var runtimeType = body.runtimeType();
        assert.equal(runtimeType.isGenuineUserDefinedType(), true);
        assert.equal(runtimeType.genuineUserDefinedType().nameId(), "Dog");
    });

    it('Should return expand and return proper JSON 3', function () {
        var api = util.loadApiWrapper1(util.data('exampleGen/e6.raml'));
        var types : wrapper10.TypeDeclaration[] = <any>tools.toArray(api.types());
        var type=_.find(types,x=>x.name()=="Employee");
        assert(type != null);

        var runtimeType = type.runtimeType();
        assert(runtimeType != null);

        var example : hl.IExpandableExample = tools.collectionItem(runtimeType.examples(), 0);
        assert.equal(example.isEmpty(), true);

        var jsonExample = example.expandAsJSON();
        assert.deepEqual(jsonExample,{"name":"Christian","dep":{"name":"OCTO"}})
    });
});
