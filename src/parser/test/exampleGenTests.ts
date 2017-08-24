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
import services=require("../definition-system/ramlServices")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
var dir=path.resolve(__dirname,"../../../src/parser/test/")

function createExampleObject(w:wrapperApi.TypeDeclaration, generateFakeExamples = false){

    var tp=wrapperHelper.resolveType(w);

    return createExampleObjectFromTypeDefinition(tp, generateFakeExamples);
}

function createExampleObjectFromTypeDefinition(tp:hl.ITypeDefinition, generateFakeExamples = false){
    var node=tp.getAdapter(services.RAMLService).getDeclaringNode();
    if (node){
        return node.parsedType().exampleObject();
    }
}

describe('Example test',function(){
    this.timeout(15000);
    it ("Programmers",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Programmers");
        var example=createExampleObject(tp);
        assert.deepEqual(example,[{"name":"Pavel","lastname":"Petrochenko","age":33,"knowsLanguages":["Java","C++"]}])
    })
    it ("Programmer",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Programmer");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"name":"Pavel","lastname":"Petrochenko","age":33,"knowsLanguages":["Java","C++"]})
    })
    it ("Dog",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Dog");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"name":"Dog","age":"33"})
    })
    it ("Dog2",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Dog2");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"name":"Dog","age":33})
    })
    it ("ManWithDog",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="ManWithDog");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"name":"Pavel","d":{"name":"Dog","age":33}})
    })
    it ("ManWithDog2",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="ManWithDog2");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"name":"Pavel","d":{"name":"Dog","age":33}})
    })
    it ("Amount",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Amount");
        var example=createExampleObject(tp);
        assert.deepEqual(example,30)
    })
    it ("Amounts",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="Amounts");
        var example=createExampleObject(tp);
        assert.deepEqual(example,[30])
    })
    it ("ManWithExamples",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="ManWithExamples");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{"mmm":"2"})
    })
    it ("IAmUnion",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="IAmUnion");
        var example=createExampleObject(tp);
        assert.deepEqual(example,30)
    })
    it ("IAmNumber",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="RecordId");
        var example=createExampleObject(tp, true);
        assert.deepEqual(example,1)
    })
    it ("IAmBool",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e1.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="MYBool");
        var example=createExampleObject(tp, true);
        assert.deepEqual(example,true)
    })

    it ("User",function() {
        var api=<wrapper.ApiImpl>wrapperHelper.load(path.resolve(dir,"data/exampleGen/e7.raml"))
        api = <wrapper.ApiImpl>util.expandWrapperIfNeeded(api);

        var tp=_.find(api.types(),x=>x.name()=="User");
        var example=createExampleObject(tp);
        assert.deepEqual(example,{
            "firstname": "Juan",
            "lastname": "Coen",
            "age": "31",
            "id": 12345678,
            "department": {
                "name": "Engineering"
            }
        })
    })
});
