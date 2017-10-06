// import _=require("underscore")
// import assert = require("assert")
// import fs = require("fs")
// import abnf = require('abnf');
// import path = require("path")
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
// import parser = require("../artifacts/raml10parser");
// import servergen = require("../tools/servergen/servergen")
//
// function reload(name: string, api: parser.ApiImpl): parser.ApiImpl {
//     var text = api.highLevel().lowLevel().unit().contents();
//     //console.log('text:\n' + text);
//     fs.writeFileSync(name, text);
//     var api2 = <parser.ApiImpl>util.loadApiWrapper1(name);
//     return api2;
// }
//
// function str(o: any): string {
//     return JSON.stringify(o);
// }
//
// function pretty(o: any): string {
//     return JSON.stringify(o, null, 2);
// }
//
// function fakerandom(): number {
//     return 0;
// }
//
// class Gen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'number') {
//             if(this.counter<3) {
//                 this.counter++;
//                 return '7';
//             } else {
//                 // reject to generate
//                 throw new bnfgen.RejectToGenerateException('max count');
//             }
//         }
//         return undefined;
//     }
// }
//
// class TestGen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'number') {
//             throw new bnfgen.RejectToGenerateException('max count');
//         }
//         return undefined;
//     }
// }
//
// class TypeGen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'custom') {
//             throw new bnfgen.RejectToGenerateException('no free types');
//         }
//         return undefined;
//     }
// };
//
// describe('BNF generator',function(){
//
//     it ("Generate calc #bnf01",function(){
//         var bnf = fs.readFileSync(util.data('gram/calc.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, null, fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated: ' + text);
//         assert.equal(text, '0');
//     });
//
//     it ("Generate calc #bnf02",function(){
//         var bnf = fs.readFileSync(util.data('gram/calc.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, new Gen(), fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated' + ': ' + text);
//         assert.equal(text, '7');
//     });
//     it ("Generate calc #bnfN02",function(){
//         var bnf = fs.readFileSync(util.data('gram/calc.abnf'),'utf8')
//         for(var i=0; i<10; i++) {
//             var gen = new bnfgen.BnfGen(bnf, new Gen());
//             var text = gen.generate("expr");
//             console.log('generated' + i + ': ' + text);
//         }
//     });
//     it ("Generate calc #bnf03",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, null, fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated: ' + text);
//         assert.equal(text, 'string');
//     });
//
//     it ("Generate calc #bnfN03",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, null);
//         var text = gen.generate("expr");
//         console.log('generated: ' + text);
//     });
//     it ("Generate calc #bnf04",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, new TypeGen(), fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated ' + ': ' + text);
//         assert.equal(text, 'string');
//     });
//
//     it ("Generate calc #bnfN04",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         for(var i=0; i<10; i++) {
//             var gen = new bnfgen.BnfGen(bnf, new TypeGen());
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
//     it ("Generate calc #bnf05",function(){
//         var bnf = fs.readFileSync(util.data('gram/test.abnf'),'utf8')
//         try {
//             var gen = new bnfgen.BnfGen(bnf, new TestGen());
//             var text = gen.generate("expr");
//             console.log('generated: ' + text);
//             assert.ok(false);
//         } catch(x) {
//             assert.equal(x.message, "No choices left");
//         }
//     });
//
//     it ("Generate calc #bnf06",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8');
//         var typegen = new gu.CustomTypeGen(names);
//         var gen = new bnfgen.BnfGen(bnf, typegen, fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated ' + ': ' + text);
//         assert.equal(text, 'string');
//     });
//     it ("Generate calc #bnfN06",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8');
//         for(var i=0; i<10; i++) {
//             var typegen = new gu.CustomTypeGen(names);
//             var gen = new bnfgen.BnfGen(bnf, typegen);
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
//
//     it ("Generate calc #bnf07",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/type-type-exp.abnf'),'utf8');
//         var typegen = new gu.CustomTypeGen(names);
//         var gen = new bnfgen.BnfGen(bnf, typegen, fakerandom);
//         var text = gen.generate("expr");
//         //console.log('generated ' + ': ' + text);
//         assert.ok(text.indexOf('Seed')>=0);
//     });
//     it ("Generate calc #bnfN07",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/type-type-exp.abnf'),'utf8');
//         for(var i=0; i<10; i++) {
//             var typegen = new gu.CustomTypeGen(names);
//             var gen = new bnfgen.BnfGen(bnf, typegen);
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
//
//
// });
//
// describe('Example generator',function(){
//
//     function xgen(type: string): string {
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var example = egen.generateTypeExpression(type);
//         return example; //JSON.stringify(example, null, 2);
//     }
//
//     it ("Generate type example #ex00",function(){
//         var ex = xgen("string");
//         //console.log('Example:\n' + ex);
//         assert.equal(ex, "str");
//     });
//
//     it ("Generate type example #ex01",function(){
// 	      var ex = xgen("Seed2");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {num2: 1, str2: 'str'});
//     });
//
//     it ("Generate type example #ex02",function(){
//         var ex = xgen("[Seed2]");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {num2: 1, str2: 'str'});
//     });
//
//     it ("Generate type example #ex03",function(){
//         var ex = xgen("[Seed2,Seed3]");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {num2: 1, str2: 'str', num3: 1, str3: 'str'});
//     });
//
//     it ("Generate type example #ex04",function(){
//         var ex = xgen("Seed1|Seed2");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {num1: 1, str1: 'str'});
//     });
//
//     it ("Generate type example #ex05",function(){
//         var ex = xgen("(Seed1|Seed2)");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {num1: 1, str1: 'str'});
//     });
//
//     it ("Generate type example #ex06",function(){
//         var ex = xgen("string[]");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, ['str']);
//     });
//
//     it ("Generate type example #ex07",function(){
//         var ex = xgen("Seed1[]");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, [{"str1":"str","num1":1}]);
//     });
//
//     it ("Generate type example #ex08",function(){
//         var ex = xgen("(Seed1|Seed2)[]");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, [{"str1":"str","num1":1}]);
//     });
//
//     it ("Generate type example #ex09",function(){
//         var ex = xgen("Seed41");
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {"str1":"str","num1":1,"str4":"str","num4":1});
//     });
//
//     it ("Generate type example #ex10",function(){
//         var api = util.loadApiWrapper1(util.data('gen/type-with-object.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var type = api.types()[0];
//         //console.log(type.runtimeType().printDetails());
//         var ex = egen.generate(<parser.ObjectTypeDeclaration>type);
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, { str1: 'str', num1: 1, obj1: { str11: 'str', num11: 1 } });
//     });
//
//     it ("Generate type example #ex11",function(){
//         var api = util.loadApiWrapper1(util.data('gen/type-with-object.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var type = api.types()[1];
//         //console.log(type.runtimeType().printDetails());
//         var ex = egen.generate(<parser.ObjectTypeDeclaration>type);
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {"str1":"str","num1":1,"obj1":{"str11":"str","num11":1},"str2":"str","num2":1});
//     });
//
//     it ("Generate type example #ex12",function(){
//         var api = util.loadApiWrapper1(util.data('gen/type-with-object.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var type = api.types()[2];
//         //console.log(type.runtimeType().printDetails());
//         var ex = egen.generate(<parser.ObjectTypeDeclaration>type);
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {"str1":"str","num1":1,"obj1":{"str11":"str","num11":1},"str2":"str","num2":1});
//     });
//
//     it ("Generate type example #ex13",function(){
//         var api = util.loadApiWrapper1(util.data('gen/union.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var type = api.types()[2];
//         //console.log(type.runtimeType().printDetails());
//         var ex = egen.generate(<parser.ObjectTypeDeclaration>type);
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {"str3":"str","prop3":{"str1":"str","num1":1}});
//     });
//
//     it ("Generate type example #ex14",function(){
//         var api = util.loadApiWrapper1(util.data('gen/union.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var type = api.types()[3];
//         //console.log(type.runtimeType().printDetails());
//         var ex = egen.generate(<parser.ObjectTypeDeclaration>type);
//         //console.log('Example:\n' + str(ex));
//         assert.deepEqual(ex, {"str4":"str","prop4":true});
//     });
//
// });
//
//
// /*
// describe('Test generator',function(){
//
//     it ("Generate empty raml #emp00",function(){
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
//
// });
//
// class Gen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'number') {
//             if(this.counter<3) {
//                 this.counter++;
//                 return '7';
//             } else {
//                 // reject to generate
//                 throw new bnfgen.RejectToGenerateException('max count');
//             }
//         }
//         return undefined;
//     }
// }
//
// class TestGen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'number') {
//             throw new bnfgen.RejectToGenerateException('max count');
//         }
//         return undefined;
//     }
// }
//
// class TypeGen implements bnfgen.IRuleGenerator {
//     counter = 0;
//     generate(name: string, lev: number): string {
//         if(name == 'custom') {
//             throw new bnfgen.RejectToGenerateException('no free types');
//         }
//         return undefined;
//     }
// }
//
// describe('BNF generator',function(){
//     it ("Generate calc #bnf01",function(){
//         var bnf = fs.readFileSync(util.data('gram/calc.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf);
//         var text = gen.generate("expr");
//         console.log('generated: ' + text);
//     });
//     it ("Generate calc #bnf02",function(){
//         var bnf = fs.readFileSync(util.data('gram/calc.abnf'),'utf8')
//         for(var i=0; i<10; i++) {
//             var gen = new bnfgen.BnfGen(bnf, new Gen());
//             var text = gen.generate("expr");
//             console.log('generated' + i + ': ' + text);
//         }
//     });
//     it ("Generate calc #bnf03",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         var gen = new bnfgen.BnfGen(bnf, null);
//         var text = gen.generate("expr");
//         console.log('generated: ' + text);
//     });
//     it ("Generate calc #bnf04",function(){
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8')
//         for(var i=0; i<10; i++) {
//             var gen = new bnfgen.BnfGen(bnf, new TypeGen());
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
//     it ("Generate calc #bnf05",function(){
//         var bnf = fs.readFileSync(util.data('gram/test.abnf'),'utf8')
//         try {
//             var gen = new bnfgen.BnfGen(bnf, new TestGen());
//             var text = gen.generate("expr");
//             console.log('generated: ' + text);
//             assert.ok(false);
//         } catch(x) {
//             assert.equal(x.message, "No choices left");
//         }
//     });
//     it ("Generate calc #bnf06",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/prop-type-exp.abnf'),'utf8');
//         for(var i=0; i<10; i++) {
//             var typegen = new gu.CustomTypeGen(names);
//             var gen = new bnfgen.BnfGen(bnf, typegen);
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
//     it ("Generate calc #bnf07",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var names = typeman.typenames();
//         var bnf = fs.readFileSync(util.data('gram/type-type-exp.abnf'),'utf8');
//         for(var i=0; i<10; i++) {
//             var typegen = new gu.CustomTypeGen(names);
//             var gen = new bnfgen.BnfGen(bnf, typegen);
//             var text = gen.generate("expr");
//             console.log('generated ' + i + ': ' + text);
//         }
//     });
// });
//
//
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
//     var gen = new resgen.ResourceGenerator(api);
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
// describe('Example generator',function(){
//
//     function xgen(type: string): string {
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         var typeman = new gu.TypeManager(api);
//         var egen = new exgen.ExampleGenerator(typeman);
//         var example = egen.generateTypeExpression(type);
//         return JSON.stringify(example, null, 2);
//     }
//
//     it ("Generate type example #ex00",function(){
//         console.log('Example:\n' + xgen("string"));
//         //console.log('Example:\n' + xgen("((boolean))|(boolean|number)"));
//     });
//     it ("Generate type example #ex01",function(){
//         console.log('Example:\n' + xgen("[Seed2]"));
//         //console.log('Example:\n' + xgen("((boolean))|(boolean|number)"));
//     });
//     it ("Generate type example #ex03",function(){
//         console.log('Example:\n' + xgen("[Seed2,Seed3]"));
//         //console.log('Example:\n' + xgen("((boolean))|(boolean|number)"));
//     });
//
//     it ("Generate type example #ex04",function(){
//         console.log('Example:\n' + xgen("(Seed2|Seed3)[]"));
//     });
//     it ("Generate type example #ex05",function(){
//         var api = util.loadApiWrapper1(util.data('gen/seed.raml'));
//         api.types()[0].highLevel().printDetails();
//         console.log('printed');
//         var typeman = new gu.TypeManager(api);
//         typeman.listApiTypes('Types');
//     });
// });
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
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//     });
//     it ("Generate resource with seed file #res10",function(){
//         var api = generateTypesAndResources(util.data('gen/seed.raml'), 10, 5);
//         var errors = util.showErrors(api.highLevel());
//         assert.equal(errors, 0);
//     });
// });
//
//
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
// */
//
