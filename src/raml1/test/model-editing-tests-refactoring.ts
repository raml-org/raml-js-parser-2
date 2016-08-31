/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")
import fs = require("fs")
import path = require("path")
import _=require("underscore")
import def = require("raml-definition-system")
//import spec = require("../spec-1.0/methodsAndResources")
import ll=require("../lowLevelAST")
import stubs=require("../stubs")

import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
//import t3 = require("../artifacts/raml10parser")
import util = require("./test-utils")
import wrapper=require("../artifacts/raml10parser")
import core = require('../wrapped-ast/parserCore')
import universeModule = require("../../raml1/tools/universe")
import services=require("../../raml1/definition-system/ramlServices")
describe('Low level model: refactoring', function() {

  it('refactoring remove two methods #res00', function () {
    var api = util.loadApi(util.data('refactor/test-resource1.raml'), true);
    var type = <def.NodeClass>util.universe.type("GlobalSchema");

    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

    var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
    var methods: hl.IHighLevelNode[] = resource.elementsOfKind('methods');

    var resourceType = <def.NodeClass>util.universe.type("ResourceType");

    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL:');
    //(<yll.ASTNode>methods[1].lowLevel()).showParents('M1');

    //(<yll.ASTNode>methods[0].lowLevel()).showParents('M0');

    var stub = createStub(resourceType,api.definition().property("resourceTypes"));
    stub.add(methods[0].copy());
    stub.add(methods[1].copy());

    api.add(stub);

    //(<yll.ASTNode>methods[0].lowLevel()).showParents('M0');
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED ADD:');

    //resource = api.elementsOfKind('resources')[0];

    resource.remove(methods[0]);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE0:');

    resource.remove(methods[1]);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE1:');

    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-resource1-processed-methods0.raml"));
  });

  it('refactoring remove two methods #res02', function () {
    var api = util.loadApi(util.data('refactor/test-resource1.raml'), true);
    var type = <def.NodeClass>util.universe.type("GlobalSchema");

    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

    var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
    var methods = resource.elementsOfKind('methods');

    var resourceType = <def.NodeClass>util.universe.type("ResourceType");

    var stub = createStub(resourceType,api.definition().property("resourceTypes"));
    methods.forEach(x=>{
      stub.add(x.copy());
    });
    resource.add(stubs.createAttr(resourceType.property("type"),"abc"));
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED ADD:');
    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL:');
    resource.remove(methods[0]);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE0:');
    resource.remove(methods[1]);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE1:');
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE1:');

    api.add(stub);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED:');

    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-resource1-processed-methods.raml"));
  });

  describe('extract resource type', function() {

    it('refactoring extract resource type #res01', function () {
      var api = util.loadApi(util.data('refactor/test-resource-add-del.raml'), true);
      var apinode = <yll.ASTNode>api.lowLevel();
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var methods = resource.elementsOfKind('methods');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));
      methods.forEach(x=>{
        stub.add(x.copy());
      });
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED ADD:');

      resource.remove(methods[0]);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE0:');
      resource.remove(methods[1]);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE1:');
      api.add(stub);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-resource-add-del-done.raml"));
    });

    it('refactoring extract resource type #res1', function () {
      var api = util.loadApi(util.data('refactor/test-resource1.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var methods = resource.elementsOfKind('methods');
      var method = methods[0];

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));
      methods.forEach(x=>{
        stub.add(x.copy());
      });
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED ADD:');
      resource.remove(methods[0]);
      resource.remove(methods[1]);
      resource.add(stubs.createAttr(resourceType.property("type"),"abc"));
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED REMOVE:');
      api.add(stub);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-resource1-processed.raml"));
    });

    //it('refactoring extract resource type after resource type added #res2', function () { // OK
    //  var api = util.loadApi(util.data('test-resource2.raml'), true);
    //  var type = <def.NodeClass>util.universe.type("GlobalSchema");
    //
    //  //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    //
    //  var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
    //  var methods = resource.elementsOfKind('methods');
    //  var method = methods[0];
    //
    //  var resourceType = <def.NodeClass>util.universe.type("ResourceType");
    //
    //  var stub = createStub(resourceType,api.definition().property("resourceTypes"));
    //  methods.forEach(x=>{
    //    stub.add(x);
    //  });
    //  //api.add(stub);
    //  resource.remove(methods[0]);
    //  resource.remove(methods[1]);
    //  resource.add(stubs.createStubNode(resourceType,"abc"));
    //  //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
    //
    //  //console.log(api.lowLevel().unit().contents());
    //  util.compareToFile(api.lowLevel().unit().contents(), util.data("test-resource2-processed.raml"));
    //});

    it('refactoring extract resource type #res3', function () {
      var api = util.loadApi(util.data('refactor/extract-res1.raml'), true);
      var apinode = <yll.ASTNode>api.lowLevel();
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var methods = resource.elementsOfKind('methods');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));
      var m1 = methods[0];
      var m2 = methods[1];

      stub.add(m1.copy());
      stub.add(m2.copy());
      //methods.forEach(x=>{
      //    var copy = x.copy();
      //    copy.lowLevel().show('Copy:');
      //    stub.add(copy);
      //});
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED ADD:');

      resource.remove(m1);
      resource.remove(m2);
      //resource.remove(methods[1]);
      //stub.lowLevel().show('Stub:');
      api.add(stub);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/extract-res1-extracted.raml"));
    });

  });



  describe('fill body', function() {

    it('fill body : api-body-subresource.raml #subres1', function () { // OK
      var api = util.loadApi(util.data('refactor/fillbody/api-body-subresource.raml'), true);

      //console.log(api.lowLevel().unit().contents());

      var type = <def.NodeClass>util.universe.type("TypeDeclaration");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var topresource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var resource: hl.IHighLevelNode = topresource.elementsOfKind('resources')[0];

      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      //var code = response.attr('code').value();
      var body = method.element('body');
      //console.log('LOGB: ' + body);
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <high.ASTNodeImpl>(createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);

      node = <high.ASTNodeImpl>(createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'ccc');
      node.createAttr("example","ddd");
      body.add(node);

      node = <any>createStubNode(type,util.apiType.property("schemas"),"schema1");
      node.attrOrCreate("type").setValue('schema-1');
      api.add(node);

      node = <any>createStubNode(type,util.apiType.property("schemas"),"schema2");
      node.attrOrCreate("type").setValue('schema-2');
      api.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api-body-subresource-added.raml"));

    });

    it('fill body: api-body-subresource.raml #subres2', function () { // OK
      var api = util.loadApi(util.data('refactor/fillbody/api-body-subresource.raml'), true);
      var type = <def.NodeClass>util.universe.type("TypeDeclaration");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      //var topresource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      //var resource: hl.IHighLevelNode = topresource.elementsOfKind('resources')[0];
      //var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];

      var method = <hl.IHighLevelNode> util.xpath(api, 'resources[0]/resources[0]/methods[0]');

      //var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      //var code = response.attr('code').value();
      var body = method.element('body');
      //console.log('LOGB: ' + body);
        var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <any>createStubNode(type,util.apiType.property("schemas"),"schema1");
      node.attrOrCreate("type").setValue('schema-1');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      node = <any>createStubNode(type,util.apiType.property("schemas"),"schema2");
      node.attrOrCreate("type").setValue('schema-2');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA2):');

      node = <high.ASTNodeImpl>(createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY):');

      node = <high.ASTNodeImpl>(createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'ccc');
      node.createAttr("example","ddd");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY2):');


      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (FINAL):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api-body-subresource-added.raml"));

    });

    function fillBodyRfactoring08(node: hl.IHighLevelNode) {
      var name = node.property().nameId();
      //console.log('node name1: ' + name);
      if(name == universeModule.Universe08.MethodBase.properties.body.name) {
        node = node.parent();
        name = node.property().nameId();
        //console.log('node name2: ' + name);
      }
      var bodyType = <def.NodeClass>node.definition().universe().type("BodyLike");
      var body = <high.ASTNodeImpl>createStubNode(bodyType,(<def.NodeClass>node.definition()).property('name'), "application/json");
      body.createAttr("schema", 'aaa');
      body.createAttr("example","!include ./examples/aaa.json");
      node.add(body);
    }

    it('fill body: fill body with raml 0.8 #fillbody08-11', function () {
      var api = util.loadApi(util.data('refactor/fillbody/api08-11.raml'), true);
      var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');
      var methodType = method.definition();

      fillBodyRfactoring08(method);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-11-added.raml"));
    });

    it('fill body: fill body with raml 0.8 #fillbody08-12', function () {
      var api = util.loadApi(util.data('refactor/fillbody/api08-12.raml'), true);
      var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');

      fillBodyRfactoring08(method);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-12-added.raml"));
    });

    it('fill body: fill body with raml 0.8 #fillbody08-13', function () {
      var api = util.loadApi(util.data('refactor/fillbody/api08-13.raml'), true);
      var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');

      fillBodyRfactoring08(method);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-13-added.raml"));
    });
    it('fill body: fill body with raml 0.8 #fillbody08-14', function () {
      var api = util.loadApi(util.data('refactor/fillbody/api08-14.raml'), true);
      var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');

      fillBodyRfactoring08(method);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-14-added.raml"));
    });

    it('fill body: fill body with raml 0.8 #fillbody08-15', function () {
      var api = util.loadApi(util.data('refactor/fillbody/api08-15.raml'), true);
      var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      var body = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]/body');

      fillBodyRfactoring08(body);

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api08-15-added.raml"));
    });

    it('fill body: fill body with raml 1.0 #fillbody10-11', function () {
      //var api = util.loadApi(util.data('refactor/fillbody/api10-11.raml'));
      //var bodyType = <def.NodeClass>api.definition().universe().type("BodyLike");
      //var method = <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');
      //var methodType = method.definition();
      //var body = <high.ASTNodeImpl>createStubNode(bodyType,methodType.property('name'), "application/json");
      //body.createAttr("schema", 'aaa');
      //body.createAttr("example","!include ./examples/aaa.json");
      //method.add(body);
      //console.log(api.lowLevel().unit().contents());
      //util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/fillbody/api10-11-added.raml"));
    });


  });

  describe('move resource', function() {

    it('refactoring move resource #move1', function () { // OK
      var api = util.loadApi(util.data('refactor/test-move-resource.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resources = api.elementsOfKind('resources');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));

      var res1 = resources[0];
      var res2 = resources[1];

      res2.parent().remove(res2);
      res1.add(res2);

      //resource.add(resourceType.property("type").createAttr("abc"));
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-move-resource-processed1.raml"));

    });

    it('refactoring move resource #move2', function () { // OK
      var api = util.loadApi(util.data('refactor/test-move-resource.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resources = api.elementsOfKind('resources');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));

      var res1 = resources[0];
      var res2 = resources[1];

      res1.parent().remove(res1);
      res2.add(res1);

      //resource.add(resourceType.property("type").createAttr("abc"));
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-move-resource-processed2.raml"));
    });

    it('refactoring move resource #move3ok', function () { // OK
      var api = util.loadApi(util.data('refactor/test-move-resource3-ok.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resources = api.elementsOfKind('resources');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));

      var res1 = resources[0];
      var res2 = resources[1];

      res1.parent().remove(res1);
      res2.add(res1);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-move-resource3-ok-processed.raml"));
    });

    it('refactoring move resource #move3bad', function () { // OK
      var api = util.loadApi(util.data('refactor/test-move-resource3-bad.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resources = api.elementsOfKind('resources');

      var resourceType = <def.NodeClass>util.universe.type("ResourceType");

      var stub = createStub(resourceType,api.definition().property("resourceTypes"));

      var res1 = resources[0];
      var res2 = resources[1];

      res1.parent().remove(res1);
      res2.add(res1);

      //resource.add(resourceType.property("type").createAttr("abc"));
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/test-move-resource3-bad-processed.raml"));
    });

  });


  it('insert schemas to non existing schemas #schema1', function () {
    var api = util.loadApi(util.data('add/api-schemas-none.raml'), true);
    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

    var schemaType = <def.NodeClass>util.universe.type("TypeDeclaration");
    var node = createStubNode(schemaType,util.apiType.property("schemas"), 'schema1');
    node.attrOrCreate("type").setValue('aaa');
    api.add(node);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

    var schemaType = <def.NodeClass>util.universe.type("TypeDeclaration");
    var node = createStubNode(schemaType,util.apiType.property("schemas"), 'schema2');
    node.attrOrCreate("type").setValue('bbb');
    api.add(node);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-schemas-none-added.raml"));
  });

  it('insert schema to existing schemas #schema2', function () {
    var api = util.loadApi(util.data('add/api-schemas-empty.raml'), true);
    //api.lowLevel().show('ORIGINAL NODE:');

    var type = <def.NodeClass>util.universe.type("TypeDeclaration");
    var node = createStubNode(type,util.apiType.property("schemas"), 'schema1');
    node.attrOrCreate("type").setValue('aaa');
    api.add(node);
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED API (SCHEMA):');

    var type = <def.NodeClass>util.universe.type("TypeDeclaration");
    var node = createStubNode(type,util.apiType.property("schemas"), 'schema2');
    node.attrOrCreate("type").setValue('bbb');
    api.add(node);
    //api.lowLevel().show('UPDATED API (SCHEMA):');

    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-schemas-empty-added.raml"));

  });

  describe('rename attributes', function() {

    it('rename one attrinbute name #rename0', function () {
      var api = util.loadApi(util.data('rename/xero0.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var attrs = [];
      attrs.push(util.xpath(api, 'resources[0]/methods[0]/#is[0]'));

      attrs.forEach(x=> {
        //console.log('set attr value');
        x.setValue('xxx');
      });

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero0-renamed.raml"));
    });

    it('rename attribute with equal length #rename1', function () {
      var api = util.loadApi(util.data('rename/xero1.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var attrs = [];
      attrs.push(util.xpath(api, 'resources[0]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[0]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[2]/methods[0]/#is[0]'));

      attrs.forEach(x=> {
        //console.log('a: ' + x.value())
        x.setValue('abcdefgh');
      });

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero1-renamed.raml"));

    });

    it('rename attribute with shorter name #rename2', function () {
      var api = util.loadApi(util.data('rename/xero1.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var attrs = [];
      attrs.push(util.xpath(api, 'resources[0]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[0]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[2]/methods[0]/#is[0]'));

      attrs.forEach(x=> {
        x.setValue('xxx');
      });

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero1-renamed-short.raml"));
    });

    it('rename attribute with longer name #rename3', function () {
      var api = util.loadApi(util.data('rename/xero1.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var attrs = [];
      attrs.push(util.xpath(api, 'resources[0]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[0]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[2]/methods[0]/#is[0]'));

      attrs.forEach(x=> {
        //console.log('a: ' + x.value())
        x.setValue('aaabbbcccdddeee');
      });

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero1-renamed-long.raml"));

    });

    it('rename attribute in expanded seq context #rename4', function () {
      var api = util.loadApi(util.data('rename/xero2.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var attrs = [];
      attrs.push(util.xpath(api, 'resources[0]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[0]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[0]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[1]/methods[1]/#is[0]'));
      attrs.push(util.xpath(api, 'resources[2]/methods[0]/#is[0]'));

      attrs.forEach(x=> {
        x.setValue('xxx');
      });

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero2-renamed.raml"));
    });

    it('rename resource type with same length #rename-resource-type1', function () {
      var api = util.loadApi(util.data('rename/xero-resource-type.raml'), true);

      var name =  <hl.IAttribute>util.xpath(api, 'resourceTypes[0]/#name[0]');
      var rtype =  <hl.IAttribute>util.xpath(api, 'resources[0]/#type[0]');

      name.setValue('xxxxaaaazzzz');
      rtype.setValue('xxxxaaaazzzz');

      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero-resource-type-renamed.raml"));
    });

    it('rename resource type with shorter string in direct order #rename-resource-type2', function () {
      var api = util.loadApi(util.data('rename/xero-resource-type.raml'), true);

      var name =  <hl.IAttribute>util.xpath(api, 'resourceTypes[0]/#name[0]');
      var rtype =  <hl.IAttribute>util.xpath(api, 'resources[0]/#type[0]');

      name.setValue('xxx');
      rtype.setValue('xxx');

      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero-resource-type-renamed2.raml"));
    });

    it('rename resource type with shorter string in reverse order #rename-resource-type3', function () {
      var api = util.loadApi(util.data('rename/xero-resource-type.raml'), true);

      var name =  <hl.IAttribute>util.xpath(api, 'resourceTypes[0]/#name[0]');
      var rtype =  <hl.IAttribute>util.xpath(api, 'resources[0]/#type[0]');

      rtype.setValue('xxx');
      name.setValue('xxx');

      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero-resource-type-renamed2.raml"));
    });

    it('rename resource type with longer string #rename-resource-type4', function () {
      var api = util.loadApi(util.data('rename/xero-resource-type.raml'), true);

      var name =  <hl.IAttribute>util.xpath(api, 'resourceTypes[0]/#name[0]');
      var rtype =  <hl.IAttribute>util.xpath(api, 'resources[0]/#type[0]');

      //console.log('name: ' + name.value());
      name.setValue('xxxxaaaazzzzaaaa');
      rtype.setValue('xxxxaaaazzzzaaaa');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero-resource-type-renamed3.raml"));
    });

    it('rename collection #rename-resource-type5', function () {
      var api = util.loadApi(util.data('rename/xero-resource-type-collection.raml'), true);
      var resourceType =  <hl.IHighLevelNode>util.xpath(api, 'resourceTypes[1]');
      var name =  <hl.IAttribute>util.xpath(api, 'resourceTypes[1]/#name[0]');
      //console.log('Resource Type: ' + resourceType.name());
      //resNode.lowLevel().show();

      var refs = resourceType.findReferences();
      //console.log('found: ' + refs.length);
      var ref = <hl.IAttribute>refs[0];
      //console.log('value: ' + ref.value());
      //ref.lowLevel().show();

      name.setValue('xxx');
      ref.setValue('xxx');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/xero-resource-type-collection-done.raml"));

    });

    it('rename resource twice #res-twice', function () {
      var api = util.loadApi(util.data('rename/rename-keys/keys1.raml'), true);
      var resource =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
      //util.showTypeProperties(resource.definition());
      var name =  resource.attr('relativeUri');
      //console.log('name: ' + name.value());
      name.setValue('/elementsx');
      name.setValue('/elementszz');
      //api.lowLevel().show('UPDATED:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("rename/rename-keys/keys1-renamed.raml"));
    });



  });


  it('add description to two resources #add-desc1', function () {
    var api = util.loadApi(util.data('refactor/two-resources1.raml'), true);
    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    var resource =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
    resource.attrOrCreate('description').setValue('new desciption');
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/two-resources1-add-desc.raml"));
  });

  it('add description to two resources #add-desc2', function () {
    var api = util.loadApi(util.data('refactor/two-resources2.raml'), true);
    //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    var resource =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
    resource.attrOrCreate('description').setValue('new desciption');
    //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
    //console.log(api.lowLevel().unit().contents());
    util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/two-resources2-add-desc.raml"));
  });

  //it('expand signature #sig3', function () {
  //  var api = util.loadApi(util.data('sig/sig3.raml'));
  //  var res =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
  //  var method =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');
  //  var attr = method.attr('signature');
  //  var tr=signature.convertToTrait(signature.parse(attr));
  //  attr.remove();
  //  tr.highLevel().elements().forEach(x=>{
  //    method.add(<any>x)
  //  });
  //  //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
  //  //console.log(api.lowLevel().unit().contents());
  //  util.compareToFile(api.lowLevel().unit().contents(), util.data("sig/sig3-expanded.raml"));
  //});
  //
  //it('expand signature #sig4', function () {
  //  var api = util.loadApi(util.data('sig/sig4.raml'));
  //  var res =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
  //  var method =  <hl.IHighLevelNode>util.xpath(api, 'resources[0]/methods[0]');
  //  var attr = method.attr('signature');
  //  var tr=signature.convertToTrait(signature.parse(attr));
  //  attr.remove();
  //  tr.highLevel().elements().forEach(x=>{
  //    method.add(<any>x)
  //  });
  //  //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
  //  //console.log(api.lowLevel().unit().contents());
  //  util.compareToFile(api.lowLevel().unit().contents(), util.data("sig/sig4-expanded.raml"));
  //});

  describe('extract supertype', function() {

    it('extract super type #type11', function () {
      var api = util.loadApi(util.data('refactor/type1.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      type.remove(name1);
      type.remove(name2);
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type1-supertype.raml"));
    });

    it('extract super type #type12', function () {
      var api = util.loadApi(util.data('refactor/type1.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      type.remove(name1);
      type.remove(name2);
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type1-supertype.raml"));
    });

    it('extract super type #type13', function () {
      var api = util.loadApi(util.data('refactor/type1.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      newtype.highLevel().add(name1.copy());
      //newtype.highLevel().add(name2.copy());
      //type.remove(name1);
      //type.remove(name2);
      //api.lowLevel().show('UPDATED:');
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      //util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type1-supertype.raml"));
    });

    it('extract super type #type14', function () {
      var api = util.loadApi(util.data('refactor/type1.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      type.remove(name1);
      type.remove(name2);
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      //util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type1-supertype.raml"));
    });

    it('extract super type #type21', function () {
      var api = util.loadApi(util.data('refactor/type2.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      type.remove(name1);
      type.remove(name2);
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type2-supertype.raml"));
    });

    it('extract super type #type22', function () {
      var api = util.loadApi(util.data('refactor/type2.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      type.remove(name1);
      type.remove(name2);
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type2-supertype.raml"));
    });

    it('extract super type #type23', function () {
      var api = util.loadApi(util.data('refactor/type2.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      type.remove(name1);
      type.remove(name2);
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type2-supertype.raml"));
    });

    it('extract super type #type24', function () {
      var api = util.loadApi(util.data('refactor/type2.raml'), true);
      //console.log('ORIGINAL:\n' + api.lowLevel().unit().contents());
      var type =  <hl.IHighLevelNode>util.xpath(api, 'types[0]');
      var name1 =  <hl.IHighLevelNode>util.xpath(type, 'properties[1]');
      var name2 =  <hl.IHighLevelNode>util.xpath(type, 'properties[2]');
      //api.lowLevel().show('UPDATED NODE:');
      var newtype = new wrapper.ObjectTypeDeclarationImpl('SuperType');
      new core.BasicNodeImpl(api).addToProp(newtype, 'types');
      type.remove(name1);
      type.remove(name2);
      newtype.highLevel().add(name1.copy());
      newtype.highLevel().add(name2.copy());
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/type2-supertype.raml"));
    });


  });

  describe('detect insertion point', function() {

    it('insert resource #ip1', function () {
      var api = util.loadApi(util.data('refactor/ipoint/api1.raml'), true);
      var res = new wrapper.ResourceImpl('/res2');
      api.add(res.highLevel());
      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/ipoint/api1-addres1.raml"));
    });

    it('insert resource #ip2', function () {
      var api = util.loadApi(util.data('refactor/ipoint/api2.raml'), true);
      var method = <hl.IHighLevelNode>util.xpath(api, 'resources/methods');

      //util.show(api);

      var body = new wrapper.TypeDeclarationImpl('application/json');
      method.add(body.highLevel());

      //console.log('REFACTORED:\n' + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("refactor/ipoint/api2-addres1.raml"));
    });

  });


});

function createStubNode(t:hl.ITypeDefinition,p:hl.IProperty,v:string=null){
  return stubs.createStubNode(t,p,v);
}


function createStub(t:hl.ITypeDefinition,p:hl.IProperty){
  return stubs.createStubNode(t,p);
}

