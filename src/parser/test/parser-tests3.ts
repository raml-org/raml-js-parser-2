// import _=require("underscore")
// import assert = require("assert")
// import fs = require("fs")
// import abnf = require('abnf');
// import path = require("path")
// import crypto = require('crypto');
//
// import yll=require("../jsyaml/jsyaml2lowLevel")
// import yaml=require("../jsyaml/yamlAST")
// import hl=require("../highLevelAST")
// import util = require("./test-utils")
// import tools = require("./testTools")
// import testgen = require("./testgen/testgen")
// import bnfgen = require("./testgen/bnfgen")
// import exgen = require("./testgen/exgen")
// import gu = require("./testgen/gen-util")
// import resgen = require("./testgen/resgen")
// import restypegen = require("./testgen/restypegen")
// import traitgen = require("./testgen/traitgen")
// import parser = require("../artifacts/raml10parser");
// import servergen = require("../tools/servergen/servergen")
//
// function reload(name: string, api: parser.Api): parser.Api {
//     var text = api.highLevel().lowLevel().unit().contents();
//     //console.log('text:\n' + text);
//     fs.writeFileSync(name, text);
//     var api2 = util.loadApiWrapper1(name);
//     return api2;
// }
//
//
// class Sanitizer {
//
//     files: string[] = [];
//
//     constructor() {
//         // console.log('Collect tmp files');
//     }
//
//     sanitize(api: parser.Api): parser.Api {
//         var text = api.highLevel().lowLevel().unit().contents();
//         var filename = 'test-tmp-'+crypto.randomBytes(4).readUInt32LE(0)+'.raml';
//         //console.log('text:\n' + text);
//         fs.writeFileSync(util.data(filename), text);
//         var api2 = util.loadApiWrapper1(filename);
//         this.files.push(filename);
//         // console.log('created: ' + filename);
//         return api2;
//     }
//
//     cleanup() {
//         this.files.forEach(filename=> {
//             fs.unlinkSync(util.data(filename));
//             // console.log('removed!: ' + filename);
//         });
//         // console.log('cleanup tmp files');
//     }
// }
//
// describe('Test generator',function() {
//
//     it ("Generate empty raml #emp01",function(){
//         var api = util.loadApiWrapper1(util.data('gen/empty.raml'));
// 	    var gen = new testgen.RamlTypeGen(api);
//         for(var i=1; i<=3; i++) {
//             gen.generateType("Type" + i);
//         }
//         var text = gen.text();
//         console.log('text:\n' + text);
//         fs.writeFileSync(util.data("test.raml"), text);
//         var api2 = util.loadApi(util.data("test.raml"));
//         util.showErrors(api2);
//         //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
//     });
//
//     it ("Generate empty raml #seed01",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var gen = new testgen.RamlTypeGen(api);
//         for(var i=1; i<=1; i++) {
//             gen.generateType("Type" + i);
//         }
//         var text = gen.text();
//         console.log('text:\n' + text);
//         fs.writeFileSync(util.data("test.raml"), text);
//         var api2 = util.loadApi(util.data("test.raml"));
//         util.showErrors(api2);
//         //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
//     });
//
//     it ("Generate empty raml #seed02",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var gen = new testgen.RamlTypeGen(api);
//         for(var i=1; i<=2; i++) {
//             gen.generateType("Type" + i);
//         }
//         var text = gen.text();
//         console.log('text:\n' + text);
//         fs.writeFileSync(util.data("test.raml"), text);
//         var api2 = util.loadApi(util.data("test.raml"));
//         util.showErrors(api2);
//         //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
//     });
//
//     it ("Generate empty raml #seed10",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var gen = new testgen.RamlTypeGen(api);
//         for(var i=1; i<=10; i++) {
//             gen.generateType("Type" + i);
//         }
//         var text = gen.text();
//         console.log('text:\n' + text);
//         fs.writeFileSync(util.data("test.raml"), text);
//         var api2 = util.loadApi(util.data("test.raml"));
//         util.showErrors(api2);
//         //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
//     });
//
//     it ("Generate empty raml #seed30",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var gen = new testgen.RamlTypeGen(api);
//         for(var i=1; i<=30; i++) {
//             gen.generateType("Type" + i);
//         }
//         var text = gen.text();
//         console.log('text:\n' + text);
//         fs.writeFileSync(util.data("test.raml"), text);
//         var api2 = util.loadApi(util.data("test.raml"));
//         util.showErrors(api2);
//         //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
//     });
//
//     /*
//     it ("Type shouldn't change #change21",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml')); // empty raml file is ok here
//
//         var type1 = new parser.ObjectTypeDeclarationImpl('Type1');
//         type1.setType('[object]');
//         api.addToProp(type1, 'types');
//         var t1 = _.find(api.types(), type=>{return type.name() == 'Type1'});
//         var typename1 = t1.constructor.name;
//         console.log('Type1: ' + typename1);
//
//         var type2 = new parser.ObjectTypeDeclarationImpl('Type2');
//         type2.setType('object');
//         api.addToProp(type2, 'types');
//         var t2 = _.find(api.types(), type=>{return type.name() == 'Type1'});
//         var typename2 = t2.constructor.name;
//         console.log('Type1: ' + typename2);
//
//         var text = api.highLevel().lowLevel().unit().contents();
//         console.log('text:\n' + text);
//
//         assert.equal(typename1, typename2);
//     });
//
//     it ("Type shouldn't change #change22",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml')); // empty raml file is ok here
//
//         var type1 = new parser.ObjectTypeDeclarationImpl('Type1');
//         //type1.setType('[object]');
//         api.addToProp(type1, 'types');
//         var t1 = _.find(api.types(), type=>{return type.name() == 'Type1'});
//         var typename1 = t1.constructor.name;
//         console.log('Type1: ' + typename1);
//
//         var type2 = new parser.ObjectTypeDeclarationImpl('Type2');
//         //type2.setType('object');
//         api.addToProp(type2, 'types');
//         var t2 = _.find(api.types(), type=>{return type.name() == 'Type1'});
//         var typename2 = t2.constructor.name;
//         console.log('Type1: ' + typename2);
//
//         var text = api.highLevel().lowLevel().unit().contents();
//         console.log('text:\n' + text);
//
//         assert.equal(typename1, typename2);
//     });
//     */
//
// });
//
// function generateResourceTypes(api: parser.Api, basename: string, amount: number) {
//     var rtgen = new restypegen.ResourceTypeGenerator(api);
//     for(var i=1; i<=amount; i++) {
//         rtgen.generate(basename + i);
//     }
// }
//
// function generateTraits(api: parser.Api, basename: string, amount: number) {
//     var tgen = new traitgen.TraitGenerator(api);
//     for(var i=1; i<=amount; i++) {
//         tgen.generate(basename + i);
//     }
// }
//
// function generateTypesAndResources(seed: string, types: number, resources: number) {
//     var api = util.loadApiWrapper1(seed);
//
//     var typegen = new testgen.RamlTypeGen(api);
//     for(var i=1; i<=types; i++) {
//         typegen.generateType("Type" + i);
//     }
//
//     api = reload(util.data("test.raml"), api);
//     //console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//     console.log('generate resources');
//     var gen = new resgen.ResourceGenerator(<parser.ApiImpl>api);
//     for(var i=1; i<=resources; i++) {
//         gen.generate("/res" + i);
//     }
//     var text = gen.text();
//     //fs.writeFileSync(util.data("test.raml"), text);
//     //var api2 = util.loadApi(util.data("test.raml"));
//     api = reload(util.data("test.raml"), api);
//     return api;
//     //testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
// }
//
// describe('Resource generator',function(){
//     it ("Generate resource with seed file #res01",function(){
//         var api = generateTypesAndResources(util.data('gen/seed.raml'), 1, 1);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//     });
//     it ("Generate resource with seed file #res02",function(){
//         var api = generateTypesAndResources(util.data('gen/seed.raml'), 2, 2);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//     });
//     it ("Generate resource with seed file #res10",function(){
//         var api = generateTypesAndResources(util.data('gen/seed.raml'), 10, 5);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//     });
// });
//
// describe('Resource type generator',function(){
//     it ("Generate resource type with seed file #restype01",function(){
//         var sanitizer = new Sanitizer();
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         generateResourceTypes(api, 'resourcetype', 1);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         // api = reload(util.data("test.raml"), api);
//         api = sanitizer.sanitize(api);
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//         sanitizer.cleanup();
//     });
//     it ("Generate resource type with seed file #restype10",function(){
//         var sanitizer = new Sanitizer();
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         generateResourceTypes(api, 'ResourceType', 10);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         api = reload(util.data("test.raml"), api);
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//         sanitizer.cleanup();
//     });
// });
//
// describe('Traits generator',function(){
//     it ("Generate trait with seed file #trait01",function(){
//         var sanitizer = new Sanitizer();
//         var api = util.loadApiWrapper1(util.data('gen/empty.raml'));
//         generateTraits(api, 'trait', 1);
//         console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
//         // api = reload(util.data("test.raml"), api);
//         api = sanitizer.sanitize(api);
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//         sanitizer.cleanup();
//     });
// });
//
// describe('REST serv generator',function(){
//
//     it ("Generate server #rest01",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var template =  path.resolve(util.projectRoot(), '../ramlserv-template');
//         var sgen = new servergen.ServerGenerator(template);
//         var type = api.types()[0];
//         sgen.generate(util.data('generated/server'), <parser.ObjectTypeDeclaration>type);
//     });
//
// });
//
//
// describe('Utility',function(){
//
//     it ("Print provided file #print01",function(){
//         var api = <parser.ApiImpl>util.loadApiWrapper1(util.data('print.raml'));
//         console.log('API:\n' + api.runtimeDefinition().printDetails());
//     });
//
// });
//
//
