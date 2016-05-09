/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")
import fs = require("fs")
import path = require("path")
import _=require("underscore")
import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import yaml=require("yaml-ast-parser")
import def = require("raml-definition-system")
import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import stubs = require("../stubs")

import hl=require("../highLevelAST")
import t3 = require("../artifacts/raml10parser")
import util = require("./test-utils")
import services=require("../../raml1/definition-system/ramlServices")
import wrapper=require("../artifacts/raml10parser")
type ASTNodeImpl =high.ASTNodeImpl;

describe('Low level model: insert', function () {

  describe('simple attributes and nodes', function () {

    it('should create add new value to version attribute #version1', function () {
      var api = util.loadApi(util.data('api.raml'), true);
      api.add(stubs.createAttr(util.apiType.property("version"),"v2"));
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-add-version-attribute.raml"));
    });

    it('should create new baseUri attribute #desc1', function () {
      var api = util.loadApi(util.data('test-api.raml'), true);
      api.add(stubs.createAttr(util.apiType.property("baseUri"),"http://samplehost.com"));
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-add-description-attribute.raml"));
    });

    it('should insert baseUri in another context #desc2', function () {
      var api = util.loadApi(util.data('test-api.raml'), true);
      var apiType = <def.NodeClass>util.universe.type("Api");
      api.add(stubs.createAttr(apiType.property("baseUri"),"http://samplehost.com"));
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-add-description-attribute2.raml"));
    });

    it('should add first traits node #traits1', function () {
      var api = util.loadApi(util.data("add/api-traits-does-not-exist.raml"), true);
      var type = <def.NodeClass>util.universe.type("Trait");
      var node = stubs.createStubNode(type,util.apiType.property("traits"));
      api.add(node); //- key: {}
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-traits-does-not-exist-added.raml"));
    });

    it('should add new trait #traits2', function () {
      var api = util.loadApi(util.data('api.raml'), true);
      var type = <def.NodeClass>util.universe.type("Trait");
      var node = stubs.createStubNode(type,util.apiType.property("traits"));
      api.add(node); //- key: {}
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-add-new-trait.raml"));
    });

  });

  describe('body insertions', function () {
    it('insert mediatype to body #body0', function () {
      var api = util.loadApi(util.data('add/api-body-empty.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      //var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", '111');
      node.createAttr("example","111");
      body.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-test-add-mediatype.raml"));
    });

    it('insert body #nobody1', function () {
      var api = util.loadApi(util.data('add/api-body-none.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");
      //api.lowLevel().show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];

      //var body = response.element('body');
      var responseType = <def.NodeClass>response.definition();
      var bodyType = <def.NodeClass>util.universe.type("TypeDeclaration"); //body.definition();

      var body = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,responseType.property('body')));

      var media = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      media.createAttr("schema", 'aaa');
      media.createAttr("example","bbb");

      body.add(media);
      response.add(body);

      //api.lowLevel().show('UPDATED NODE (BODY):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add6.raml"));
    });

    it('insert body #body1', function () {
      var api = util.loadApi(util.data('add/api-body-empty.raml'), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      //console.log('--------------- 1');
      //node.attrs();
      body.add(node);
      //console.log('--------------- 2');
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add1.raml"));
    });

    it('insert body twice #body2', function () {
      var api = util.loadApi(util.data(('add/api-body-empty.raml')), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      ////(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY1):');
      //
      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY2):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add2.raml"));
    });

    it('insert body twice #body3', function () {
      var api = util.loadApi(util.data(util.data('add/api-body-empty.raml')), true);
      var type = <def.NodeClass>util.universe.type("GlobalSchema");
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      //util.showTypeProperties(resource.definition());
      //util.showTypeProperties(bodyType);

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY1):');

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY2):');

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/text"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY3):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add3.raml"));
    });

  });

  describe('schemas insertion', function () {
    it('insert schema to existing schemas #schema1', function () {
      var api = util.loadApi(util.data(util.data('add/api-schemas-empty.raml')), true);
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var type = <def.NodeClass>util.universe.type("TypeDeclaration");
      var node;

      node = <high.ASTNodeImpl>stubs.createStubNode(type,util.apiType.property("schemas"), 'schema1');
      node.attrOrCreate("type").setValue('aaa');
      //node.createAttr("value", "");
      //node.attr("value").setValue('bbb');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add-schema1.raml"));
    });

    it('insert schema to existing schemas #schema2', function () {
      var api = util.loadApi(util.data(util.data('add/api-schemas-empty.raml')), true);
      //api.lowLevel().show('API:');

      var type = <def.NodeClass>util.universe.type("TypeDeclaration");
      var node;

      node = stubs.createStubNode(type,util.apiType.property("schemas"), 'schema1');
      node.attrOrCreate("type").setValue('aaa');
      api.add(node);
      //api.lowLevel().show('UPDATED NODE (SCHEMA1):');

      node = stubs.createStubNode(type,util.apiType.property("schemas"), 'schema2');
      node.attrOrCreate("type").setValue('bbb');
      api.add(node);
      //api.lowLevel().show('UPDATED NODE (SCHEMA2):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add-schema.raml"));
    });

    it('insert schema to existing schemas #schema3', function () {
      var api = util.loadApi(util.data(util.data('add/api-schemas-one.raml')), true);
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var type = <def.NodeClass>util.universe.type("TypeDeclaration");
      var node = stubs.createStubNode(type,util.apiType.property("schemas"), 'schema1');
      node.attrOrCreate("type").setValue('bbb');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add-schema2.raml"));
    });

    it('insert body and schema to existing schemas #add-schema2', function () {
      var api = util.loadApi(util.data(util.data('add/api-schemas-empty.raml')), true);
      //var api = util.loadApi('api-body-empty.raml');
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();
      var schemaType = <def.NodeClass>util.universe.type("TypeDeclaration");

      var node;

      node = stubs.createStubNode(schemaType,util.apiType.property("schemas"), 'schema1');
      node.attrOrCreate("type").setValue('aaa');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA1):');

      node = stubs.createStubNode(schemaType,util.apiType.property("schemas"), 'schema2');
      node.attrOrCreate("type").setValue('bbb');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA2):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-schemas-empty-add-two2.raml"));
    });

    it('insert schema after body already inserted #schema-body2', function () {
      var api = util.loadApi(util.data(util.data('add/api-body-exists.raml')), true);
      var type = <def.NodeClass>util.universe.type("TypeDeclaration");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      //var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <any>stubs.createStubNode(type,util.apiType.property("schemas"),"schema1");
      node.attrOrCreate("type").setValue('schema text 1');
      api.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-exists-add-schema-body.raml"));

    });

    it('insert body and schema to existing schemas #body-schema2-body', function () {
      var api = util.loadApi(util.data('add/api-schemas-empty.raml'), true);
      //var api = util.loadApi('api-body-empty.raml');
      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();
      var schemaType = <def.NodeClass>util.universe.type("TypeDeclaration");

      var node;

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY1):');

      node = stubs.createStubNode(schemaType,util.apiType.property("schemas"), 'schema1');
      node.attrOrCreate("type").setValue('aaa');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA1):');

      node = stubs.createStubNode(schemaType,util.apiType.property("schemas"), 'schema2');
      node.attrOrCreate("type").setValue('bbb');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA2):');

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY2):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-schemas-empty-add-two.raml"));
    });

    it('insert body and schema #schema-xxx', function () {
      var api = util.loadApi(util.data(util.data('add/api-body-empty.raml')), true);
      var type = <def.NodeClass>util.universe.type("TypeDeclaration");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY):');

      node = <any>stubs.createStubNode(type,util.apiType.property("schemas"),"schema1");
      node.attrOrCreate("type").setValue('schema text 1');
      api.add(node);

      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add4.raml"));
    });


    it('insert body and schema twice #schema4', function () {
      var api = util.loadApi(util.data(util.data('add/api-body-empty.raml')), true);
      var type = <def.NodeClass>util.universe.type("TypeDeclaration");

      //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');

      var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
      var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
      var code = response.attr('code').value();
      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node;

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/json"));
      node.createAttr("schema", 'aaa');
      node.createAttr("example","bbb");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY):');
      //console.log('');

      node = <any>stubs.createStubNode(type,util.apiType.property("schemas"),"schema1");
      node.attrOrCreate("type").setValue('schema text 1');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');
      //console.log('');

      node = <high.ASTNodeImpl>(stubs.createStubNode(bodyType,bodyType.property('name'),"application/xml"));
      node.createAttr("schema", 'ccc');
      node.createAttr("example","ddd");
      body.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY2):');
      //console.log('');

      node = <any>stubs.createStubNode(type,util.apiType.property("schemas"),"schema2");
      node.attrOrCreate("type").setValue('schema text 2');
      api.add(node);
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA2):');
      //console.log('');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-empty-add5.raml"));

    });

  });

  function createResourceStub(parent) {
    var resourceType = <def.NodeClass>util.universe.type("Resource");
    var stub = stubs.createStubNode(resourceType,parent.definition().property("resources"));
    return stub;
  }

  function createMethodStub(resource, name: string) {
    var methodType = <def.NodeClass>util.universe.type("Method");
    //util.showTypeProperties(methodType);
    var method = stubs.createStubNode(methodType,resource.definition().property("methods"));
    method.attrOrCreate('method').setValue(name);
    return method;
  }

  describe('resources insertion', function () {

    it('add two resources #res2', function () {
      var api = util.loadApi(util.data('add/api-body-none.raml'), true);
      //var type = <def.NodeClass>util.universe.type("Resource");
      //api.lowLevel().show('ORIGINAL NODE:');

      var res1 = createResourceStub(api);
      res1.attrOrCreate("relativeUri").setValue('/aaa');
      var method1 = createMethodStub(res1, 'get');
      res1.add(method1);
      api.add(res1);
      //res1.lowLevel().show("RES1");

      var res2 = createResourceStub(api);
      res2.attrOrCreate("relativeUri").setValue('/bbb');
      var method2 = createMethodStub(res2, 'post');
      res2.add(method2);
      api.add(res2);
      //api.lowLevel().show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-none-test-res2.raml"));
    });

    it('add two resources #subres1', function () {
      var api = util.loadApi(util.data('add/api-body-none.raml'), true);
      //var type = <def.NodeClass>util.universe.type("Resource");
      //api.lowLevel().show('ORIGINAL NODE:');
      var resources = api.elementsOfKind('resources');
      //console.log('resources: ' + resources.length);

      var res1 = createResourceStub(api);
      res1.attrOrCreate("relativeUri").setValue('/aaa');
      //console.log('res1 parent1: ' + res1.lowLevel().parent());
      api.add(res1);
      //console.log('res1 parent2: ' + res1.lowLevel().parent());
      //res1.lowLevel().show("RES1");
      //resources = api.elementsOfKind('resources');
      //console.log('resources: ' + resources.length);
      //res1.lowLevel().show('res1:');
      //console.log('res1 parent3: ' + res1.lowLevel().parent());

      var res2 = createResourceStub(res1);
      res2.attrOrCreate("relativeUri").setValue('/bbb');
      //console.log('res2 parent1: ' + res2.lowLevel().parent());
      res1.add(res2);
      //console.log('res2 parent2: ' + res2.lowLevel().parent());

      //api.lowLevel().show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-none-test-subres1.raml"));
    });

    it('add two resources #subres2', function () {
      var api = util.loadApi(util.data('add/api-body-none.raml'), true);
      //var type = <def.NodeClass>util.universe.type("Resource");
      //api.lowLevel().show('ORIGINAL NODE:');

      var res1 = createResourceStub(api);
      res1.attrOrCreate("relativeUri").setValue('/aaa');
      var method1 = createMethodStub(res1, 'get');
      res1.add(method1);
      api.add(res1);
      //res1.lowLevel().show("RES1");

      var res2 = createResourceStub(res1);
      res2.attrOrCreate("relativeUri").setValue('/bbb');
      var method2 = createMethodStub(res2, 'post');
      res2.add(method2);
      res1.add(res2);

      //api.lowLevel().show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-none-test-subres2.raml"));
    });

    it('should correctly add nodes to different levels', function() {
      var api = util.loadApi(util.data('add/api-body-exists.raml'), true);

      var first = stubs.createResourceStub(api, '/first');

      first.add(createMethodStub(first, 'get'));
      api.add(first);

      var second = stubs.createResourceStub(first, '/second');
      second.add(createMethodStub(second, 'post'));
      second.add(createMethodStub(second, 'patch'));
      first.add(second);



      var third = stubs.createResourceStub(api, '/third');
      third.add(createMethodStub(second, 'post'));
      api.add(third);
      //api.lowLevel().show('UPDATED NODE:');
      // console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/api-body-exists-tests-difflevels.raml"));
    });

  });

  describe('insertion to sequences', function () {
    describe('type sequences', function () {
      it('insert to non existing #seq01', function () {
        var api = util.loadApi(util.data('add/seq/seq01.raml'), true);
        var type = new wrapper.ObjectTypeDeclarationImpl('aaa');
        new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/seq/seq01-added.raml"));
      });
      it('insert to empty #seq02', function () {
        var api = util.loadApi(util.data('add/seq/seq02.raml'), true);
        var type = new wrapper.ObjectTypeDeclarationImpl('aaa');
        new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/seq/seq02-added.raml"));
      });
      it('insert to seq like syntax #seq11', function () {
        var api = util.loadApi(util.data('add/seq/seq11.raml'), true);
        var type = new wrapper.ObjectTypeDeclarationImpl('aaa');
        new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/seq/seq11-added.raml"));
      });
      it('insert to map like syntax #seq12', function () {
        var api = util.loadApi(util.data('add/seq/seq12.raml'), true);
        var type = new wrapper.ObjectTypeDeclarationImpl('aaa');
        new wrapper.BasicSecuritySchemeImpl(api).addToProp(type, 'types');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/seq/seq12-added.raml"));
      });
    });
    describe('is sequences', function () {
      it('insert to non existing #is01', function () {
        var api = util.loadApi(util.data('add/is01.raml'), true);
        var resource = <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
        resource.attrOrCreate('is').addValue('aaa');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/is01-added.raml"));
      });
      it('insert to non existing #is02', function () {
        var api = util.loadApi(util.data('add/is02.raml'), true);
        var resource = <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
        resource.attrOrCreate('is').addValue('aaa');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/is02-added.raml"));
      });
      it('insert to seq like syntax #is11', function () {
        var api = util.loadApi(util.data('add/is11.raml'), true);
        var resource = <hl.IHighLevelNode>util.xpath(api, 'resources[0]');
        resource.attrOrCreate('is').addValue('aaa');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("add/is11-added.raml"));
      });
    });

    describe('multi-file type sequences', function () {

      it('insert types from another file #mul-11', function () {
        var api1 = util.loadApi(util.data('add/seq/mul11.raml'), true);
        var api2 = util.loadApi(util.data('add/seq/mul12.raml'), true);
        //api1.lowLevel().show('API1:');
        //api2.lowLevel().show('API2:');
        var type = <hl.IHighLevelNode>util.xpath(api2, 'types[0]');
        api1.add(type);
        //api1.lowLevel().show('API:');
        //console.log(api1.lowLevel().unit().contents());
        util.compareToFile(api1.lowLevel().unit().contents(), util.data("add/seq/mul1-test11.raml"));
      });

      it('insert types from another file #mul-21', function () {
        var api1 = util.loadApi(util.data('add/seq/mul21.raml'), true);
        var api2 = util.loadApi(util.data('add/seq/mul22.raml'), true);
        //api1.lowLevel().show('API1:');
        //api2.lowLevel().show('API2:');
        var type = <hl.IHighLevelNode>util.xpath(api2, 'types[0]');
        api1.add(type);
        //api1.lowLevel().show('API:');
        //console.log(api1.lowLevel().unit().contents());
        util.compareToFile(api1.lowLevel().unit().contents(), util.data("add/seq/mul2-test21.raml"));
      });

    });

  });

  describe('empty raml file', function () {

    it('add plain attribute #empty1', function () {
      var api = util.loadApi(util.data('add/empty/api-empty.raml'), true);
      //api.lowLevel().show('API:');
      api.attrOrCreate('version').setValue('v1');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/empty/api-empty-add-attr.raml"));
    });

    it('add trait #empty2', function () {
      var api = util.loadApi(util.data('add/empty/api-empty.raml'), true);
      var type = <def.NodeClass>util.universe.type("Trait");
      var node = stubs.createStubNode(type,util.apiType.property("traits"));
      api.add(node);
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("add/empty/api-empty-add-trait.raml"));
    });

  });

});

