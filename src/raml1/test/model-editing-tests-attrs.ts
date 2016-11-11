

/// <reference path="../../../typings/main.d.ts" />

import assert = require("assert")

import fs = require("fs")
import path = require("path")
import _=require("underscore")

import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import yaml=require("yaml-ast-parser")
//import spec = require("../spec-1.0/methodsAndResources")

import ll=require("../lowLevelAST")
import high = require("../highLevelImpl")
import hl=require("../highLevelAST")

import t3 = require("../artifacts/raml10parser")
import services=require("../../raml1/definition-system/ramlServices")

import util = require("./test-utils")
import def = require("raml-definition-system")
import stubs = require("../stubs")
import mod = require("../../parserMod")

function genStructuredValue(name: string, parent: hl.IHighLevelNode, pr: hl.IProperty) : string | high.StructuredValue {
  if (pr.range() instanceof def.ReferenceType){
    var t=<def.ReferenceType>pr.range();

    var mockNode=jsyaml.createNode(name);

    return new high.StructuredValue(mockNode, parent, pr);
    // var hn = stv.toHighlevel()
    // return hn;
  } else return name;
}

describe('Low level model: nodes markup', function () {
  it('structured attribute markup #markup1', function () {
    var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'key1', value: 'value1'}], null);
    var n = <jsyaml.ASTNode>sval.lowLevel();
    var buf = new jsyaml.MarkupIndentingBuffer('');
    n.markupNode(buf, n._actualNode(), 0, true);
    //console.log('markup: ' + textutil.replaceNewlines(buf.text));
    //console.log('node markup: ' + n.text(buf.text));
    assert.equal(buf.text, '{key1: value1}');
  });

  it('structured json attribute markup #markup2', function (done) {
    try {
      console.log("Start of structured json attribute markup #markup2")
      var api = util.loadApi(util.data('attr/sattr1.raml'), true);
      var node: hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var result = genStructuredValue("base", node, node.definition().property('type'));
      var sv = <high.StructuredValue>result;
      var svh = sv.toHighLevel();

      console.log("Before structured json attribute markup failure #markup2")
      svh.attrOrCreate("required").setValue("true");
      var n = <jsyaml.ASTNode>svh.lowLevel();

      var buf2 = new jsyaml.MarkupIndentingBuffer('');
      n.markupNode(buf2, n._actualNode(), 0, true);
      //console.log('text2:\n' + buf2.text);
      assert.equal(buf2.text, 'base: {required: true}');

      done();
    } catch (Exception) {
      done(Exception)
    }

  });

  it('include ref markup #markup3', function () {
    var api = util.loadApi(util.data('markup/include.raml'), true);
    var buf = new jsyaml.MarkupIndentingBuffer('');
    var node = <jsyaml.ASTNode>api.lowLevel();
    node.markupNode(buf, node._actualNode(), 0, false);
    //console.log('Markup:\n' + buf.text);
    util.compareToFile(buf.text, util.data("markup/include-markup.raml"));
  });

});

describe('Low level model: attributes', function () {

  describe('plain attributes', function () {
    it('add plain attribute #add-attr1', function () {
      var api = util.loadApi(util.data('attr/attr0.raml'), true);
      //var type = <def.NodeClass>util.universe.type("GlobalSchema");
      var response: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses");

      var body = response.element('body');
      var bodyType = <def.NodeClass>body.definition();

      var node = stubs.createStubNode(bodyType,bodyType.property('name'), "application/json");
      body.add(node);

      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');

      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr0-add-attr1.raml"));

    });

    //it('set plain attributes #attributes01', function () {
    //  var api = util.loadApi(util.data('attr/attr0.raml'), true);
    //  var type = <def.NodeClass>util.universe.type("GlobalSchema");
    //  //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    //
    //  var response: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses");
    //
    //  var code = response.attr('code').value();
    //  //console.log('Code: ' + code);
    //
    //  var body = response.element('body');
    //  var bodyType = <def.NodeClass>body.definition();
    //
    //  var node = stubs.createStubNode(bodyType,bodyType.property('name'), "application/json");
    //
    //  node.createAttr("schema", 'aaa');
    //  node.createAttr("example", "bbb");
    //
    //  body.add(node);
    //
    //  var schemaAttribute = node.attr('schema');
    //  assert.ok(schemaAttribute, 'schema attribute should exists');
    //  assert.equal(schemaAttribute.value(), 'aaa');
    //
    //  var descriptionAttribute = node.attr('description');
    //  assert.ok(!descriptionAttribute, 'description attribute should not exists');
    //  //assert.equal(descriptionAttribute.value(), '', 'description attribute should be empty');
    //
    //  descriptionAttribute = node.attrOrCreate('description');
    //  assert.ok(descriptionAttribute, 'description attribute should exists');
    //  util.assertValue(descriptionAttribute, '');
    //
    //  descriptionAttribute.setValue('new description');
    //  //console.log('new value: ' + descriptionAttribute.value());
    //  util.assertValue(descriptionAttribute, 'new description');
    //  util.assertText(descriptionAttribute, 'description: new description');
    //
    //  //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
    //  //console.log(api.lowLevel().unit().contents());
    //  //util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr0-attributes0.raml"));
    //});


  });

  describe('set str value', function () {

    it('set str value to str attribute #attributes11', function () {
      var api = util.loadApi(util.data('attr/attr1.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      api.attr('version').setValue('xxxxx');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      util.assertText(api.attr('version'), 'version: xxxxx');
      util.assertValue(api.attr('version'), 'xxxxx');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test11.raml"));
    });

    it('set multiline str value to str attribute #attributes12', function () {
      var api = util.loadApi(util.data('attr/attr1.raml'), true);
      api.attr('version').setValue('xxx\nyyy\nzzz');
      util.assertText(api.attr('version'), 'version: |\n  xxx\n  yyy\n  zzz');
      util.assertValue(api.attr('version'), 'xxx\nyyy\nzzz');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test12.raml"));
    });

    it('set str value to json attribute #attributes13', function () {
      var api = util.loadApi(util.data(util.data('attr/attr2.raml')), true);
      api.attr('version').setValue('xxx');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      util.assertText(api.attr('version'), 'version: {xxx: aaa}');
      //util.assertValue(api.attr('version'), 'xxx');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr2-test13.raml"));
    });

    it('set multiline str value to json attribute #attributes14', function () {
      var api = util.loadApi(util.data('attr/attr2.raml'), true);
      api.attr('version').setValue('xxx\nyyy\nzzz');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.assertText(api.attr('version'), 'version: |\n  xxx\n  yyy\n  zzz');
      util.assertValue(api.attr('version'), 'xxx\nyyy\nzzz');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr2-test14.raml"));
    });

    it('set str value to yaml attribute #attributes15', function () {
      var api = util.loadApi(util.data('attr/attr3.raml'), true);
      api.attr('version').setValue('xxx');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      //TODO need more correct crlf aware comparision here
      //util.assertText(api.attr('version'), 'version:\r\n  xxx: aaa\r');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr3-test15.raml"));
    });

    it('set multiline str value to yaml attribute #attributes16', function () {
      var api = util.loadApi(util.data('attr/attr3.raml'), true);
      api.attr('version').setValue('xxx\nyyy\nzzz');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.assertText(api.attr('version'), 'version: |\n  xxx\n  yyy\n  zzz');
      util.assertValue(api.attr('version'), 'xxx\nyyy\nzzz');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr3-test16.raml"));
    });

    it('set str value to missed attribute #attributes17', function () {
      var api = util.loadApi(util.data('attr/attr3.raml'), true);
      api.attrOrCreate('baseUri').setValue('http://samplehost.com');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      //var text = (<jsyaml.ASTNode>api.attr('description').lowLevel()).text();
      util.assertText(api.attr('baseUri'), 'baseUri: http://samplehost.com');
      util.assertValue(api.attr('baseUri'), 'http://samplehost.com');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr3-test17.raml"));
    });

    it('set str value to str attribute many times #attributes18-1', function () {
      var api = util.loadApi(util.data('attr/attr1.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      api.attr('version').setValue('xxxxx');
      api.attr('version').setValue('y');
      api.attr('version').setValue('zzzzzzzzzzz');
      api.attr('version').setValue('aaa');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.assertText(api.attr('version'), 'version: aaa');
      util.assertValue(api.attr('version'), 'aaa');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test18.raml"));
    });

    it('set str value to str attribute many times #attributes18-2', function () {
      var api = util.loadApi(util.data('attr/api-test2.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      api.attr('version').setValue('xxxxx');
      api.attr('version').setValue('qq');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.assertText(api.attr('version'), 'version: qq');
      util.assertValue(api.attr('version'), 'qq');
      //util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test18.raml"));
    });

    it('set str value to str attribute (empty string) #attributes19', function () {
      var api = util.loadApi(util.data('attr/attr1.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      api.attr('version').setValue('');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      //console.log('attr: ' + api.attr('version'));
      //util.assertText(api.attr('version'), 'version: aaa');
      //util.assertValue(api.attr('version'), 'aaa');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test19.raml"));
    });

    it('should remove attribute when setting to empty string #empty1', function() {
      var api = util.loadApi(util.data('attr/attr5.raml'), true);
      api.attrOrCreate('version').setValue('xxxxx');
      api.attrOrCreate('version').setValue("");
      //console.log('version: [' + api.attr('version').value() + ']');
      //console.log(api.lowLevel().unit().contents());
      assert.ok(!api.attr('version'), "version attribute shouldn't exist");
    });

    it('set str value to quoted schema #schema1', function() {
      var api = util.loadApi(util.data('attr/schema/schema1.raml'), true);
      var body = <hl.IHighLevelNode>util.xpath(api, 'resources/methods/responses/body');
      //body.lowLevel().show('BODY:');
      body.attrOrCreate('schema').setValue('xxxxx');
      //api.attrOrCreate('version').setValue("");
      //console.log('version: [' + api.attr('version').value() + ']');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/schema/schema1-renamed.raml"));
    });

  });

  describe('set json value', function () {

    it('set structured value to str attribute #attributes21', function () {
      var api = util.loadApi(util.data('attr/attr1.raml'), true);
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      //sval.lowLevel().show('SVAL');
      api.attr('version').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr1-test21.raml"));
    });

    it('set structured value to json attribute #attributes22', function () {
      var api = util.loadApi(util.data('attr/attr2.raml'), true);
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      api.attr('version').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr2-test22.raml"));
    });

    it('set same structured value to json attribute #attributes27', function () {
      var api = util.loadApi(util.data('attr/attr2.raml'), true);
      //var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      var sval = api.attr('version').value();
      api.attr('version').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr2-test27.raml"));
    });

    it('set structured value to yaml attribute #attributes23', function () {
      var api = util.loadApi(util.data('attr/attr3.raml'), true);
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'key1', value: 'value1'}], api);
      api.attr('version').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr3-test23.raml"));
    });

    it('set str value to missed attribute #attributes24', function () {
      var api = util.loadApi(util.data('attr/attr3.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'key1', value: 'value1'}], api);
      //api.attrOrCreate('description');
      api.attrOrCreate('baseUri').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr3-test24.raml"));
    });

    it('set str value to empty attribute1 #attributes25', function () {
      var api = util.loadApi(util.data('attr/attr4.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'key1', value: 'value1'}], api);
      //api.attrOrCreate('description');
      api.attrOrCreate('baseUri').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr4-test25.raml"));

      //var text = (<jsyaml.ASTNode>api.attr("description").lowLevel()).text();
      util.assertText(api.attr("baseUri"), "baseUri:{key1: value1}");
    });

    it('set str value to empty attribute2 #attributes26', function () {
      var api = util.loadApi(util.data('attr/attr41.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'key1', value: 'value1'}], api);
      //api.attrOrCreate('description');
      api.attrOrCreate('baseUri').setValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr41-test26.raml"));

      //var text = (<jsyaml.ASTNode>api.attr("description").lowLevel()).text();
      util.assertText(api.attr("baseUri"), "baseUri:{key1: value1}");
    });

  });

  describe('special cases', function () {
    it('set structured value #sattr1', function () {
      var api = util.loadApi(util.data('attr/sattr1.raml'), true);
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      var resource:hl.IHighLevelNode = api.elementsOfKind('resources')[0];
      var attr = resource.attrOrCreate("type");
      var result = genStructuredValue("base", resource, resource.definition().property('type'));
      var sv = <high.StructuredValue>result;
      var svh = sv.toHighLevel();

      var n = <jsyaml.ASTNode>svh.lowLevel();

      var buf1 = new jsyaml.MarkupIndentingBuffer('');
      n.markupNode(buf1, n._actualNode(), 0);
      //(<jsyaml.ASTNode>svh.lowLevel()).show('CREATED:', 0, buf1.text);

      //util.showTypeProperties(svh.definition());
      //console.log('text1: ' + buf1.text);
      svh.attrOrCreate("required").setValue("true");
      //svh.attrOrCreate("description").setValue("secondValue");


      var buf2 = new jsyaml.MarkupIndentingBuffer('');
      n.markupNode(buf2, n._actualNode(), 0, true);
      //console.log('text2:\n' + buf2.text);
      //(<jsyaml.ASTNode>svh.lowLevel()).show('ATTR SET:', 0, buf2.text);


      resource.attr("type").setValue(sv);

      //var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      //api.attr("type").setValue(sval);
      //api.attrOrCreate("description").setValue(sval);

      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED:');

      //console.log("\nContents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/sattr1-test.raml"));

    });

    it('remove last attribute #no-attr', function () {
      var api = util.loadApi(util.data('attr/sattr4.raml'), true);
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGIBAL NODE:');
      //var node = api.elementsOfKind('resources')[0];
      api.attr('title').setValue('');
      //console.log(api.lowLevel().unit().contents());
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/sattr4-removed.raml"));
    });


    it('set structured value #sattr2', function () {
      var api = util.loadApi(util.data('attr/sattr2.raml'), true);
      //api.attrOrCreate('displayName').setValue('x123456789');
      api.attrOrCreate('baseUri').setValue('http://samplehost.com');
      api.attrOrCreate('version').setValue('v1-change#3');

      assert.equal(api.attr('version').value(), 'v1-change#3');
      //assert.equal(api.attr('displayName').value(), 'x123456789');
      assert.equal(api.attr('baseUri').value(), 'http://samplehost.com');

      assert.equal((<jsyaml.ASTNode>api.attr('version').lowLevel()).text(), 'version: v1-change#3');
      //assert.equal((<jsyaml.ASTNode>api.attr('displayName').lowLevel()).text(), 'displayName: x123456789');
      assert.equal((<jsyaml.ASTNode>api.attr('baseUri').lowLevel()).text(), 'baseUri: http://samplehost.com');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/sattr2-test.raml"));
    });

    it('set structured value #sattr3', function () {
      var api = util.loadApi(util.data('attr/sattr3.raml'), true);
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //api.attrOrCreate('displayName').setValue('x123456789');
      api.attrOrCreate('baseUri').setValue('http://samplehost.com');
      api.attrOrCreate('version').setValue('v1-change#3');

      assert.equal(api.attr('version').value(), 'v1-change#3');
      //assert.equal(api.attr('displayName').value(), 'x123456789');
      assert.equal(api.attr('baseUri').value(), 'http://samplehost.com');

      assert.equal((<jsyaml.ASTNode>api.attr('version').lowLevel()).text(), 'version: v1-change#3');
      //assert.equal((<jsyaml.ASTNode>api.attr('displayName').lowLevel()).text(), 'displayName: x123456789');
      assert.equal((<jsyaml.ASTNode>api.attr('baseUri').lowLevel()).text(), 'baseUri: http://samplehost.com');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/sattr3-test.raml"));
    });

  });

  describe('array attributes', function () {

    it('add array attribute #aa11-1', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a = resource.attr('is');
      //resource.lowLevel().show("Resource:");
      a.addValue('xxx');
      //resource.lowLevel().show("Resource:");

      //console.log("Contents:\n" + api.lowLevel().unit().contents());

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 3);
      util.assertValue(attrs[2], 'xxx');
      util.assertText(attrs[2], 'xxx');

      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-add-value.raml"));
    });

    it('add array attribute #aa20', function () {
      var api = util.loadApi(util.data('attr/array/aa2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      //resource.lowLevel().show("Resource:");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a = resource.attr('is');
      //resource.lowLevel().show("Resource:");
      a.addValue('xxx');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      assert.equal(attrs.length, 3);
      util.assertValue(attrs[2], 'xxx');
      util.assertText(attrs[2], 'xxx');

      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa2-test20.raml"));
    });

    it('set array attribute #aa11-2', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a = resource.attr('is');
      //resource.lowLevel().show("Resource:");
      //a.addValue('xxx');
      attrs[0].setValue('zzz');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      util.assertValue(attrs[0], 'zzz');
      util.assertValue(attrs[1], 'secured');
      //util.assertText(attrs[2], 'xxx\n');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test2.raml"));
    });

    it('set array attribute #aa11-3', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a = resource.attr('is');
      //resource.lowLevel().show("Resource:");
      //a.addValue('xxx');
      attrs[1].setValue('zzz');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      util.assertValue(attrs[0], 'paged');
      util.assertValue(attrs[1], 'zzz');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test3.raml"));
    });

    it('set array attribute #aa11-4', function () {
      var api = util.loadApi(util.data('attr/array/aa1-2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 1);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a = resource.attr('is');
      //resource.lowLevel().show("Resource:");
      //a.addValue('xxx');
      attrs[0].setValue('zzz');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 1);
      util.assertValue(attrs[0], 'zzz');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test4.raml"));
    });

    it('remove array attribute #aa12', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a: hl.IAttribute = attrs[0];
      assert.equal(a.lowLevel().kind(), 0);
      a.remove();
      //resource.lowLevel().show("Resource:");
      //a.addValue('xxx');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 1);
      //util.assertValue(attrs[2], 'xxx');
      //util.assertText(attrs[2], 'xxx\n');

      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test12.raml"));
    });

    it('remove array attribute #aa21', function () {
      var api = util.loadApi(util.data('attr/array/aa2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a: hl.IAttribute = attrs[0];
      assert.equal(a.lowLevel().kind(), 0);

      //console.log('val0: ' + attrs[0].value());
      //console.log('tex0: ' + (<jsyaml.ASTNode>attrs[0].lowLevel()).text());
      //console.log('val1: ' + attrs[1].value());
      //console.log('tex1: ' + (<jsyaml.ASTNode>attrs[1].lowLevel()).text());
      //console.log('kind: ' + (<jsyaml.ASTNode>attrs[0].lowLevel()).kindName());
      //resource.lowLevel().show("Resource:");
      a.remove();
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      //console.log('val0: ' + attrs[0].value());
      //console.log('tex0: ' + (<jsyaml.ASTNode>attrs[0].lowLevel()).text());
      //console.log('kind: ' + (<jsyaml.ASTNode>attrs[0].lowLevel()).kindName());
      assert.equal(attrs.length, 1);
      util.assertValue(attrs[0], 'secured');
      util.assertText(attrs[0], 'secured');
      assert.equal(attrs[0].lowLevel().kind(), 0);

      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa2-test21.raml"));
    });

    it('remove array attribute #aa22', function () {
      var api = util.loadApi(util.data('attr/array/aa2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      assert.equal(attrs[0].lowLevel().kind(), 0);
      var a: hl.IAttribute = attrs[1];
      a.remove();
      //resource.lowLevel().show("Resource:");
      //a.addValue('xxx');
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 1);
      util.assertValue(attrs[0], 'paged');
      util.assertText(attrs[0], 'paged');
      assert.equal(attrs[0].lowLevel().kind(), 0);

      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa2-test22.raml"));
    });

    it('remove array attribute #aa31', function () {
      var api = util.loadApi(util.data('attr/array/aa3.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 3);
      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      var a: hl.IAttribute = attrs[0];
      assert.equal(attrs[0].lowLevel().kind(), 0);
      a.remove();

      attrs = resource.attributes('is');
      assert.equal(attrs.length, 2);
      util.assertValue(attrs[0], 'paged');
      util.assertText(attrs[0], 'paged');
      util.assertValue(attrs[1], 'secured');
      util.assertText(attrs[1], 'secured');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      assert.equal(attrs[1].lowLevel().kind(), 0);

      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa3-test31.raml"));
    });

    it('remove array attribute #aa41', function () {
      var api = util.loadApi(util.data('attr/array/aa4.raml'), true);
      //api.lowLevel().show('API');
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      //resource.lowLevel().show("Resource:");
      var attrs = resource.attributes('is');
      assert.equal(attrs.length, 1);
      assert.equal(attrs[0].lowLevel().kind(), 0);
      var a: hl.IAttribute = attrs[0];
      //resource.lowLevel().show("Resource:");
      a.remove();
      //resource.lowLevel().show("Resource:");

      attrs = resource.attributes('is');
      attrs.forEach(a=> {
        //console.log(' attr: ' + a.lowLevel().dump());
        //a.lowLevel().show("Atr:");
      });
      //assert.equal(attrs[0].lowLevel().kind(), 0);
      //assert.equal(attrs.length, 0);
      //util.assertValue(attrs[0], 'secured');
      //util.assertText(attrs[0], 'secured');

      //console.log('attributes:');
      //attrs.forEach(a=>console.log(' attr: ' + a.value()));
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa4-test41.raml"));
    });

    it('test attribute kind  #aa42', function () {
      var api = util.loadApi(util.data('attr/array/aa3.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //resource.lowLevel().show("Resource0:");

      assert.equal(attrs[0].lowLevel().kind(), 0);
      assert.equal(attrs[1].lowLevel().kind(), 0);
      assert.equal(attrs[2].lowLevel().kind(), 0);
    });

    it('test attribute kind #aa43', function () {
      var api = util.loadApi(util.data('attr/array/aa4.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
    });

    it('remove all attributes #aa13', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      attrs[0].remove();
      attrs[1].remove();
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test13.raml"));
    });

    it('remove all attributes #aa28', function () {
      var api = util.loadApi(util.data('attr/array/aa2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      attrs[0].remove();
      attrs[1].remove();
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa2-test28.raml"));
    });

    it('remove all attributes and add #aa14', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      attrs[0].remove();
      //attrs[1].remove();
      //resource.lowLevel().show("Resource1:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      resource.attr('is').addValue('aaa');
      resource.attr('is').addValue('bbb');
      //resource.lowLevel().show("Resource2:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test14.raml"));
    });

    it('add to initially empty yaml attribute #aa51', function () {
      var api = util.loadApi(util.data('attr/array/aa5.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      resource.attr('is').addValue('aaa');
      //resource.lowLevel().show("Resource1:");
      //resource.attr('is').addValue('bbb');
      //resource.lowLevel().show("Resource2:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test51.raml"));
    });

    it('add to non existing attribute #aa70', function () {
      var api = util.loadApi(util.data('attr/array/aa7.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      //attrs[0].remove();
      //attrs[1].remove();
      //resource.lowLevel().show("Resource1:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      var a = resource.attrOrCreate('is');
      //a.lowLevel().show("Attribute:");
      a.addValue('aaa');
      //resource.lowLevel().show("Resource2:");
      //a.addValue('bbb');
      //resource.attr('is').addValue('ccc');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa7-test70.raml"));
    });

    it('add to non existing attribute #aa71', function () {
      var api = util.loadApi(util.data('attr/array/aa7.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      //attrs[0].remove();
      //attrs[1].remove();
      //resource.lowLevel().show("Resource1:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      var a = resource.attrOrCreate('is');
      //a.lowLevel().show("Attribute:");
      a.addValue('aaa');
      //resource.lowLevel().show("Resource2:");
      a.addValue('bbb');
      resource.attr('is').addValue('ccc');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa7-test71.raml"));
    });

    it('add to initially empty yaml attribute #aa52', function () {
      var api = util.loadApi(util.data('attr/array/aa5.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      resource.attr('is').addValue('aaa');
      //resource.lowLevel().show("Resource1:");
      resource.attr('is').addValue('bbb');
      //resource.lowLevel().show("Resource2:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa5-test52.raml"));
    });

    it('remove all attributes and add #aa29', function () {
      var api = util.loadApi(util.data('attr/array/aa2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      attrs[0].remove();
      attrs[1].remove();
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
      resource.attrOrCreate('is').addValue('aaa');
      resource.attr('is').addValue('bbb');
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa2-test29.raml"));
    });

    it('remove all attributes and add #aa81', function () {
      var api = util.loadApi(util.data('attr/array/aa8.raml'), true);
      var method: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]/methods[0]");
      var attrs = method.attributes('protocols');
      //(<jsyaml.ASTNode>api.lowLevel()).show('ORIG NODE:');
      //console.log("Original:\n" + api.lowLevel().unit().contents());
      attrs.forEach(attr => attr.remove());
      //(<jsyaml.ASTNode>api.lowLevel()).show('REMOVE NODE:');
      //console.log("After remove:\n" + api.lowLevel().unit().contents());
      method.attrOrCreate('protocols').addValue('aaa');
      method.attrOrCreate('protocols').addValue('bbb');
      method.attrOrCreate('protocols').addValue('ccc');
      //(<jsyaml.ASTNode>api.lowLevel()).show('INSERT NODE:');
      //console.log("After insert:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa8-test81.raml"));
    });

    it('add to initially empty json attribute #aa61', function () {
      var api = util.loadApi(util.data('attr/array/aa6.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //resource.lowLevel().show("Resource1:");
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      resource.attr('is').addValue('aaa');
      resource.attr('is').addValue('bbb');
      //resource.lowLevel().show("Resource2:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test61.raml"));
    });

    it('remove all attributes and add #aa15', function () {
      var api = util.loadApi(util.data('attr/array/aa1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var attrs = resource.attributes('is');
      assert.equal(attrs[0].lowLevel().kind(), 0);
      //resource.lowLevel().show("Resource0:");
      attrs[0].remove();
      attrs[1].remove();
      //resource.lowLevel().show("Resource1:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //assert.equal((<jsyaml.ASTNode>resource.attr('is').lowLevel()).text(), 'qqq');
      var a = resource.attrOrCreate('is');
      //a.lowLevel().show("Attribute:");
      a.addValue('aaa');
      resource.attr('is').addValue('bbb');
      //resource.lowLevel().show("Resource2:");
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aa1-test15.raml"));
    });

  });


  describe('array attributes structured', function () {
    it('set structured value to empty yaml attribute #as11', function () {
      var api = util.loadApi(util.data('attr/as1.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      resource.attr('is').addValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/as1-test11.raml"));
    });
    it('set structured value to yaml attribute #as21', function () {
      var api = util.loadApi(util.data('attr/as2.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      resource.attr('is').addValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/as2-test21.raml"));
    });
    it('set structured value to empty json attribute #as31', function () {
      var api = util.loadApi(util.data('attr/as3.raml'), true);
      var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
      var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
      resource.attr('is').addValue(sval);
      //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/as3-test31.raml"));
    });

    //it('set structured value to json attribute #as41', function () {
    //  var api = util.loadApi(util.data('attr/as4.raml'));
    //  //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL NODE:');
    //  var resource: hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
    //  var sval = stubs.genStructuredValue('aaa', 'bbb', [{key: 'newkey', value: 'newvalue'}], api);
    //  resource.attr('is').addValue(sval);
    //  //console.log(api.lowLevel().unit().contents());
    //  //(<jsyaml.ASTNode>api.lowLevel()).show('UPDATED NODE:');
    //  //util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/as4-test41.raml"));
    //});

  });


  describe('attr.setValues', function () {
    describe('set str array values to empty yaml attribute', function () {
      it('empty value #aasv11', function () {
        var api = util.loadApi(util.data('attr/array/aasv1.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues([]);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv1.raml"));
      });
      it('one value  #aasv12', function () {
        var api = util.loadApi(util.data('attr/array/aasv1.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv1-test12.raml"));
      });
      it('multiple values #aasv13', function () {
        var api = util.loadApi(util.data('attr/array/aasv1.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa', 'bbb', 'ccc']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv1-test13.raml"));
      });

    });

    describe('set str array values to empty json attribute', function () {
      it('empty value #aasv21', function () {
        var api = util.loadApi(util.data('attr/array/aasv2.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues([]);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv2.raml"));
      });
      it('one value #aasv22', function () {
        var api = util.loadApi(util.data('attr/array/aasv2.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv2-test22.raml"));
      });
      it('multiple values #aasv23', function () {
        var api = util.loadApi(util.data('attr/array/aasv2.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa', 'bbb', 'ccc']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv2-test23.raml"));
      });
    });

    describe('set str array values to single value yaml attribute', function () {
      it('empty value #aasv31', function () {
        var api = util.loadApi(util.data('attr/array/aasv3.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues([]);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv3-test31.raml"));
      });
      it('one value #aasv32', function () {
        var api = util.loadApi(util.data('attr/array/aasv3.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv3-test32.raml"));
      });
      it('multiple values #aasv33', function () {
        var api = util.loadApi(util.data('attr/array/aasv3.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa', 'bbb', 'ccc']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv3-test33.raml"));
      });
    });

    describe('set str array values to single value json attribute', function () {
      it('empty value #aasv41', function () {
        var api = util.loadApi(util.data('attr/array/aasv4.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues([]);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv4-test41.raml"));
      });
      it('one value #aasv42', function () {
        var api = util.loadApi(util.data('attr/array/aasv4.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv4-test42.raml"));
      });
      it('multiple values #aasv43', function () {
        var api = util.loadApi(util.data('attr/array/aasv4.raml'), true);
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attr('is').setValues(['aaa', 'bbb', 'ccc']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/aasv4-test43.raml"));
      });

      it('add one char enum value some times #array-enum11', function () {
        var api = util.loadApi(util.data('attr/array/enum1.raml'), true);
        var qp = <hl.IHighLevelNode>util.xpath(api, "resources/methods/queryParameters");
        //api.lowLevel().show("ORIG:");
        qp.attr('enum').addValue('a');
        //qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'd']);
        //api.lowLevel().show("SET:");
        //qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'dd']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/enum1-test11.raml"));
      });

      it('set parameter enum values some times #array-enum12', function () {
        var api = util.loadApi(util.data('attr/array/enum1.raml'), true);
        var qp = <hl.IHighLevelNode>util.xpath(api, "resources/methods/queryParameters");
        //api.lowLevel().show("ORIG:");
        //qp.attr('enum').addValue('a');
        qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'd']);
        qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'd']);
        qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'dd']);
        qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'ddd']);
        //api.lowLevel().show("SET:");
        //qp.attr('enum').setValues(['aaa', 'bbb', 'ccc', 'dd']);
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/array/enum1-test12.raml"));
      });

    });

    describe('attributes and nodes placement', function () {
      it('should add version attribute at right place #none1', function() {
        var api = util.loadApi(util.data('attr/attr5.raml'), true);
        api.attrOrCreate('version').setValue("vvv");
        //console.log(api.lowLevel().unit().contents());
        //util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/attr5-added.raml"));
      });
    });

    describe('special cases', function () {

      it('set type attribute to resource #type1', function () {
        var api = util.loadApi(util.data('attr/simple/set-type.raml'), true);
        //api.lowLevel().show("ORIGINAL:");
        var resource:hl.IHighLevelNode = <hl.IHighLevelNode>util.xpath(api, "resources[0]");
        resource.attrOrCreate('type').setValue('aaa');
        //api.lowLevel().show("FINAL:");
        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/simple/set-type-ok.raml"));
      });

      it('set type attribute to resource #set-schema1', function () {
        var api = util.loadApi(util.data('attr/simple/set-schema1.raml'), true);
        //api.lowLevel().show("ORIGINAL:");
        var body = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses/body");
        //api.lowLevel().show("BODY0:");

        body.attrOrCreate('schema').setValue('');
        //api.lowLevel().show("BODY1:");

        body.attrOrCreate('schema').setValue('x');
        //api.lowLevel().show("BODY2:");

        body.attrOrCreate('schema').setValue('');
        //api.lowLevel().show("BODY3:");

        body.attrOrCreate('schema').setValue('b');
        //api.lowLevel().show("BODY4:");

        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/simple/set-schema1-ok.raml"));
      });

      it('set type attribute to resource #set-schema2', function () {
        var api = util.loadApi(util.data('attr/simple/set-schema2.raml'), true);
        //api.lowLevel().show("ORIGINAL:");
        var body = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses/body");
        //api.lowLevel().show("BODY0:");

        body.attrOrCreate('schema').setValue('x');
        //api.lowLevel().show("BODY2:");

        body.attrOrCreate('schema').setValue('');
        //api.lowLevel().show("BODY3:");

        body.attrOrCreate('schema').setValue('b');
        //api.lowLevel().show("BODY4:");


        //console.log("Contents:\n" + api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/simple/set-schema2-ok.raml"));
      });
    });

    describe('Model parser', function () {
      it('should parse structured value #parse1', function () {
        var api = util.loadApi(util.data('attr/as5.raml'), true);
        //console.log(api.lowLevel().unit().contents());
        //(<jsyaml.ASTNode>api.lowLevel()).show('ORIGINAL API');
        var resource = <hl.IHighLevelNode>api.elementsOfKind('resources')[0];
        //console.log('is text: ' + (<jsyaml.ASTNode>resource.attr('is').lowLevel()).text());
        util.assertText(resource.attr('is'), '{type: aaa}');
      });
    });

  });

  describe('include', function () {

    it('check include schema node value #include-schema1', function () {
      var api = util.loadApi(util.data('attr/include/xero.raml'), true);
      //api.lowLevel().show("ORIGINAL:");
      var body = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses/body");
      var schema = body.attr('schema').value();
      //console.log('schema: ' + schema);
      util.compareToFile(schema, util.data("attr/include/inc/xero-value.json"));
    });

    it('set include schema node value #include-schema2', function () {
      var api = util.loadApi(util.data('attr/include/xero.raml'), true);
      //api.lowLevel().show("ORIGINAL:");
      //util.show(api);
      var body = <hl.IHighLevelNode>util.xpath(api, "resources/methods/responses/body");
      //console.log('value: ' + body.attr('schema').value());
      body.attr('schema').setValue('aaa');
      //console.log('new value: ' + body.attr('schema').value());
      util.assertValue(body.attr('schema'), 'aaa');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/xero.raml"));
    });

    it('check include resource node value #include-resource1', function () {
      var api = util.loadApi(util.data('attr/include/xero.raml'), true);
      var method = <hl.IHighLevelNode>util.xpath(api, "resources[1]/methods");
      //console.log('value1: ' + method.attr('description').value());
      util.assertValue(method.attr('description'), 'Retrieves contacts in a Xero organisation');
    });

    it('set include resource node value #include-resource2', function () {
      var api = util.loadApi(util.data('attr/include/xero.raml'), true);
      //util.show(api);
      var method = <hl.IHighLevelNode>util.xpath(api, "resources[1]/methods");
      //method.lowLevel().show("METHOD:");
      util.assertValue(method.attr('description'), 'Retrieves contacts in a Xero organisation');
      //console.log('value1: ' + method.attr('description').value());

      method.attr('description').setValue('aaa');
      util.assertValue(method.attr('description'), 'aaa');
      //console.log('value2: ' + method.attr('description').value());

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/xero.raml"));

    });

    it('set include resource node value #include-resource3', function () {
      var api = util.loadApi(util.data('attr/include/xero.raml'), true);
      //util.show(api);
      var resource = <hl.IHighLevelNode>util.xpath(api, "resources[1]");
      //method.lowLevel().show("METHOD:");
      //util.assertValue(method.attr('description'), 'Retrieves contacts in a Xero organisation');
      //console.log('value1: ' + method.attr('description').value());

      resource.attrOrCreate('description').setValue('aaa');
      //resource.lowLevel().show('RES:');
      //console.log("Contents:\n" + api.lowLevel().unit().contents());

      util.assertValue(resource.attr('description'), 'aaa');
      util.assertValueText(resource.attr('description'), 'aaa');
      //console.log('value2: ' + resource.attr('description').value());

      var attr = resource.attr('description');
      var root2 = (<jsyaml.ASTNode>attr.lowLevel()).root();
      //console.log("\nATTR:\n" + attr.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/xero.raml"));
      util.compareToFile(root2.unit().contents(), util.data("attr/include/inc/res2-added.raml"));
      util.compareToFile((<jsyaml.ASTNode>attr.lowLevel()).unit().contents(), util.data("attr/include/inc/res2-added.raml"));
    });

    it('crud annotations example #include-uses1', function () {
      var api = util.loadApi(util.data('attr/include/annotations-examle/api.raml'), true);
      //api.lowLevel().show("API:");
      //util.show(api);
      // var uses = <hl.IHighLevelNode>util.xpath(api, "uses[0]");

      //util.assertValue(uses.attr('name'), 'crud');
      // util.assertValue(uses.attr('usage'), 'My CRUD Annotations Library');
      //
      // //uses.lowLevel().show("USES1:");
      //
      // //console.log('name1: ' + uses.attr('name').value());
      // //console.log('title1: ' + uses.attr('title').value());
      //
      // uses.attr('name').setValue('xxxx');
      // //console.log('name2: ' + uses.attr('name').value());
      // //console.log('title2: ' + uses.attr('title').value());
      //
      // //uses.lowLevel().show("USES2:");
      //
      // util.assertValue(uses.attr('name'), 'xxxx');
      // util.assertValue(uses.attr('usage'), 'My CRUD Annotations Library');
      //
      // //console.log("Contents:\n" + api.lowLevel().unit().contents());
      // util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/annotations-examle/api-test1.raml"));

    });

    it('crud annotations example #include-uses2', function () {
      var api = util.loadApi(util.data('attr/include/annotations-examle/api.raml'), true);
      //api.lowLevel().show("API:");
      //util.show(api);
      //var uses = <hl.IHighLevelNode>util.xpath(api, "uses[0]");

      //util.assertValue(uses.attr('name'), 'crud');
      //util.assertValue(uses.attr('usage'), 'My CRUD Annotations Library');

      //uses.lowLevel().show("USES1:");

      //console.log('name1: ' + uses.attr('name').value());
      //console.log('title1: ' + uses.attr('title').value());

      //uses.attrOrCreate('description');
      //uses.attrOrCreate('description').setValue('new-description');

      //uses.lowLevel().show("USES2:");

      //util.assertValue(uses.attr('name'), 'crud');
      //util.assertValue(uses.attr('usage'), 'My CRUD Annotations Library');
      //util.assertValue(uses.attr('description'), 'new-description');
      //util.assertValueText(uses.attr('description'), 'new-description');

      //console.log("Contents:\n" + api.lowLevel().unit().contents());

      //console.log((<jsyaml.ASTNode>uses.attr('description').lowLevel()).unit().contents());
      //util.compareToFile(uses.attr('description').lowLevel().unit().contents(), util.data("attr/include/annotations-examle/crud-annotations-added.raml"));
      //util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/annotations-examle/api.raml"));

    });

    it('resourc type include #include-restype1', function () {
      var api = util.loadApi(util.data('attr/include/api-restype.raml'), true);
      //api.lowLevel().show("API:");
      //util.show(api);
      var restype = <hl.IHighLevelNode>util.xpath(api, "resourceTypes[0]");
      //restype.lowLevel().show("RESTYPE:");

      var method = <hl.IHighLevelNode>util.xpath(restype, 'methods[0]');
      util.assertValue(method.attr('description'), 'xxx');

      var method2 = stubs.createMethodStub(restype, 'put');
      restype.add(method2);

      //console.log("Contents:\n" + api.lowLevel().unit().contents());
      //console.log((<jsyaml.ASTNode>method.lowLevel()).unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/include/api-restype.raml"));
      util.compareToFile((<jsyaml.ASTNode>method.lowLevel()).unit().contents(), util.data("attr/include/inc/restype-added.raml"));

    });

  });

  describe('schema values', function () {

    describe('with no schemas', function () {

      it('schema with simple value #schema11', function () {
        var api = util.loadApi(util.data('attr/schema/empty.raml'), true);
        var p = api.definition().property("schemas");
        //var node = (<def.NodeClass>p.range()).createStubNode(p,"schema1");
        var node = stubs.createStub0(api, 'schemas',  'schema1');
        node.attrOrCreate("value").setValue('aaa');
        api.add(node);
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/schema/empty-test11.raml"));
      });

      it('schema with multiline value #schema12', function () {
        var api = util.loadApi(util.data('attr/schema/empty.raml'), true);
        var node = stubs.createStub0(api, 'schemas',  'schema1');
        node.attrOrCreate("value").setValue('{\n}');
        api.add(node);
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/schema/empty-test12.raml"));
      });

    });

    describe('with existing schema', function () {

      it('schema with simple value #schema21', function () {
        var api = util.loadApi(util.data('attr/schema/schema2.raml'), true);
        var node = <hl.IHighLevelNode>util.xpath(api, 'schemas[0]');
        node.attrOrCreate("type").setValue('aaa');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/schema/schema2-test21.raml"));
      });

      it('schema with multiline value #schema22', function () {
        var api = util.loadApi(util.data('attr/schema/schema2.raml'), true);
        var node = <hl.IHighLevelNode>util.xpath(api, 'schemas[0]');
        node.attrOrCreate("type").setValue('{\n}');
        //console.log(api.lowLevel().unit().contents());
        util.compareToFile(api.lowLevel().unit().contents(), util.data("attr/schema/schema2-test22.raml"));
      });

    });


  });

  describe('Attr change', function () {

    it('type attribute change', function () {
      var api = util.loadApi(util.data('attr/typeAttr.raml'), true);
      var typeNode = <hl.IHighLevelNode>api.children()[0];
      var typeAttr = typeNode.attr('type');

      typeAttr.setValue("NewTypeName")

    });

    it('type example change', function () {
      var api = util.loadApi(util.data('add/addExampleToType.raml'), true);
      var typeNode = <hl.IHighLevelNode>api.children()[0];


      mod.setTypeDeclarationExample(<any>typeNode.wrapperNode(), '{"prop" : "blah"}')
      var unitContents = api.lowLevel().unit().contents();
      assert.equal(unitContents.indexOf("example") > 0, true)
      assert.equal(unitContents.indexOf("blah") > 0, true)
    });

    it('type facet value change', function () {
      var api = util.loadApi(util.data('attr/facetAttr.raml'), true);
      var typeNode = <hl.IHighLevelNode>api.children()[0];

      var typeNode = <hl.IHighLevelNode>api.children()[0];
      var facetAttr = typeNode.attr('minLength');

      facetAttr.setValue("57")
    });
  });
});




