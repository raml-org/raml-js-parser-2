import assert = require("assert")

import fs = require("fs")
import path = require("path")
import _=require("underscore")

import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import def = require("raml-definition-system")

import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import hl=require("../highLevelAST")

import t3 = require("../artifacts/raml10parser")

import util = require("./test-utils")



//var api = util.loadApi('add/api-body-none.raml');
//var type = <def.NodeClass>util.universe.type("GlobalSchema");
//api.lowLevel().show('ORIGINAL NODE:');
//
//var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
//var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
//var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
//
////var body = response.element('body');
//var responseType = <def.NodeClass>response.definition();
//var bodyType = <def.NodeClass>util.universe.getType("BodyLike"); //body.definition();
//
//var body = <high.ASTNodeImpl>(bodyType.createStubNode(responseType.property('body')));

//var media = <high.ASTNodeImpl>(bodyType.createStubNode(bodyType.property('mediaType'),"application/json"));
//media.createAttr("schema", 'aaa');
//media.createAttr("example","bbb");
//console.log('media: ' + media);

//body.createAttr("mediaType", media);
//body.add(media);
//response.add(body);


describe('BasicSecurityScheme node editing operations', function() {
  describe('insert', function () {

    //it('insert schema and body #schema1', function () {
    //  var api = util.loadApi('api-body-empty.raml');
    //  var type = <def.NodeClass>util.universe.type("GlobalSchema");
    //
    //  (<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    //
    //  var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
    //  var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
    //  var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
    //  var code = response.attr('code').value();
    //  var body = response.element('body');
    //  var bodyType = <def.NodeClass>body.definition();
    //
    //  var node;
    //
    //  node = <any>type.createStubNode(util.apiType.property("schemas"),"schema1");
    //  node.attr("value").setValue('schema text 1');
    //  api.add(node);
    //
    //  (<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');
    //
    //  node = <high.ASTNodeImpl>(bodyType.createStubNode(bodyType.property('mediaType'),"application/json"));
    //  node.createAttr("schema", 'aaa');
    //  node.createAttr("example","bbb");
    //  body.add(node);
    //
    //  (<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (BODY):');
    //
    //
    //
    //  console.log(api.lowLevel().unit().contents());
    //  //assert(false);
    //});

    //it('insert schema and body #schema10', function () {
    //  var api = util.loadApi('api-body-empty.raml');
    //  var type = <def.NodeClass>util.universe.type("GlobalSchema");
    //
    //  (<yll.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    //
    //  var resource: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
    //  var method: hl.IHighLevelNode = resource.elementsOfKind('methods')[0];
    //  var response: hl.IHighLevelNode = method.elementsOfKind('responses')[0];
    //  var code = response.attr('code').value();
    //  var body = response.element('body');
    //  var bodyType = <def.NodeClass>body.definition();
    //
    //  var node;
    //
    //  node = <any>type.createStubNode(util.apiType.property("schemas"),"schema1");
    //  node.attr("value").setValue('schema text 1');
    //  api.add(node);
    //  (<yll.ASTNode>api.lowLevel()).show('UPDATED NODE (SCHEMA):');
    //
    //  console.log(api.lowLevel().unit().contents());
    //  //assert(false);
    //});


  });




});




