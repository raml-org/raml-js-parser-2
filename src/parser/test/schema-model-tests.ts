import assert = require("assert")
import fs = require("fs")
import path = require("path")
import _=require("underscore")
import def = require("raml-definition-system")
import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
import t3 = require("../artifacts/raml10parser")
import util = require("./test-utils")
import textutil=require('../../util/textutil')
import smg = require("../tools/schemaModelGen");


describe('Schema Tests', function() {
  this.timeout(15000);
  describe('generate model by json', function () {

    it('generate type definition in text mode (outdated)', function () {
      var content = fs.readFileSync(util.data("schema/schema.json")).toString();
      var text = new smg.SchemaToModelGenerator().generateText(content);
      //fs.writeFileSync(targetPath,z.serializeToString());
      //console.log('Text: \n' + text);
      util.compareToFile(text, util.data("schema/schema-type.txt"));
    });

    it('convert json to type #json11', function () {
      var api = util.loadApi(util.data('schema/api-empty.raml'));
      var schema = fs.readFileSync(util.data("schema/schema.json")).toString();
      //util.showTypeProperties(api.definition());
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      new smg.SchemaToModelGenerator().generateTo(api, schema);
      //fs.writeFileSync(targetPath,z.serializeToString());
      //show(api);
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("schema/api-empty-expanded.raml"));
    });

    it('convert json reference to type #jsonref1', function () {
      var api = util.loadApi(util.data('schema/to-model/jsonref.raml'));
      //var schema = fs.readFileSync(util.data("schema/jsonref.json")).toString();
      //util.showTypeProperties(api.definition());
      //(<yll.ASTNode>api.lowLevel()).show('UPDATED NODE:');
      var body = <hl.IHighLevelNode>util.xpath(api, 'resources/methods/body');
      var schema = body.attr('schema').value();
      //console.log(schema);
      new smg.SchemaToModelGenerator().generateTo(api, schema);
      //fs.writeFileSync(targetPath,z.serializeToString());
      //show(api);
      //console.log(api.lowLevel().unit().contents());
      util.compareToFile(api.lowLevel().unit().contents(), util.data("schema/to-model/jsonref-generated.raml"));
    });

  });

  describe('generate json by model', function () {

    describe('basic', function () {
      it('simple type #type1', function () {
        var api = util.loadApi(util.data('schema/basic/type1.raml'));
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //api.lowLevel().show('ORIGINAL NODE:');
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/basic/type1-generated.json"));
      });
      it('simple type #type2', function () {
        var api = util.loadApi(util.data('schema/basic/type2.raml'));
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[1]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //api.lowLevel().show('ORIGINAL NODE:');
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/basic/type2-generated.json"));
      });
    });

    describe('union types', function () {
      it('convert union types for basic properties #union1', function () {
        var api = util.loadApi(util.data('schema/union/union1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/union/union1-to-schema.json"));
      });
      it('convert union types for recursive types #union2', function () {
        var api = util.loadApi(util.data('schema/union/union2.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[1]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/union/union2-generated.json"));
      });
      it('convert union types for recursive types #union3', function () {
        var api = util.loadApi(util.data('schema/union/union3.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[2]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/union/union3-gen.json"));
      });
      it('convert union types for recursive types #union4', function () {
        var api = util.loadApi(util.data('schema/union/union4.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[2]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/union/union4-gen.json"));
      });
      it('convert union types for recursive types #union5', function () {
        var api = util.loadApi(util.data('schema/union/union5.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[2]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/union/union5-gen.json"));
      });
    });

    describe('inheritance', function () {
      it('simple type inheritance #inher1', function () {
        var api = util.loadApi(util.data('schema/inher/inher1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[1]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/inher/inher1-generated.json"));
      });
      it('multiple types inheritance #inher2', function () {
        var api = util.loadApi(util.data('schema/inher/inher2.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[3]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/inher/inher2-generated.json"));
      });
    });

    describe('shortcuts', function () {
      it('property with type shortcut type-short1', function () {
        var api = util.loadApi(util.data('schema/shortcut/type-shortcut1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/shortcut/type-shortcut1.json"));
      });
      it('property with type shortcut type-short2', function () {
        var api = util.loadApi(util.data('schema/shortcut/type-shortcut2.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[1]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/shortcut/type-shortcut2.json"));
      });
      it('optional property short2', function () {
        var api = util.loadApi(util.data('schema/shortcut/shortcut2.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/shortcut/shortcut2.json"));
      });
    });

    describe('references', function () {
      it('json schema reference #ref11', function () {
        var api = util.loadApi(util.data('schema/refs/ref1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/refs/ref11-generated.json"));
      });
      it('json schema reference #ref12', function () {
        var api = util.loadApi(util.data('schema/refs/ref1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[1]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/refs/ref12-generated.json"));
      });
    });

    describe('enums', function () {
      it('enum property #enum1', function () {
        var api = util.loadApi(util.data('schema/enum/enum1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[0]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/enum/enum1-gen.json"));
      });
    });

    describe('type expressions', function () {
      it('union #expr1', function () {
        var api = util.loadApi(util.data('schema/typeexpr/expr1.raml'));
        //api.lowLevel().show('ORIGINAL:');
        var type = <hl.IHighLevelNode>util.xpath(api, 'types[2]');
        var obj = new smg.ModelToSchemaGenerator().generateSchema(type);
        var text = JSON.stringify(obj, null, 2);
        //console.log('JSON:\n' + text);
        //console.log(api.lowLevel().unit().contents());
        //console.log(text);
        util.compareToFile(text, util.data("schema/typeexpr/expr1-gen.json"));
      });
    });




  });

});


