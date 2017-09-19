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
// import mkdirp = require('mkdirp');
//
// var TestsBase = util.data('../parser-tests-gen');
//
// function reload(name: string, api: parser.Api): parser.ApiImpl {
// 	var text = api.highLevel().lowLevel().unit().contents();
// 	//console.log('text:\n' + text);
// 	fs.writeFileSync(name, text);
// 	var api2 = <parser.ApiImpl>util.loadApiWrapper1(name);
// 	return api2;
// }
//
// function generateTypesAndResources(seed: string, types: number, resources: number) {
// 	var api = util.loadApiWrapper1(seed);
//
// 	var typegen = new testgen.RamlTypeGen(api);
// 	for(var i=1; i<=types; i++) {
// 		typegen.generateType("Type" + i);
// 	}
//
// 	api = reload(util.data("test.raml"), api);
// 	//console.log('text:\n' + api.highLevel().lowLevel().unit().contents());
// 	// console.log('generate resources');
// 	var gen = new resgen.ResourceGenerator(<parser.ApiImpl>api);
// 	for(var i=1; i<=resources; i++) {
// 		gen.generate("/res" + i);
// 	}
// 	var text = gen.text();
// 	//fs.writeFileSync(util.data("test.raml"), text);
// 	//var api2 = util.loadApi(util.data("test.raml"));
// 	api = reload(util.data("test.raml"), api);
// 	return api;
// 	//testErrors(util.data("../../../../example-ramls/Instagram/api.raml"),3);
// }
//
// function testset(): any {
// 	var api = generateTypesAndResources(util.data('gen/seed.raml'), 10, 5);
// 	var text = api.highLevel().lowLevel().unit().contents();
//     //console.log('text:\n' + text);
// 	var errors = util.countErrors(api.highLevel());
// 	return {errors: errors, text: text};
// }
//
// function zeroPad(num, places) {
// 	var zero = places - num.toString().length + 1;
// 	return Array(+(zero > 0 && zero)).join("0") + num;
// }
//
// function baddir(): string {
// 	var dir = path.resolve(TestsBase, 'data/bad');
// 	mkdirp.sync(dir);
// 	return dir;
// }
//
// function gooddir(): string {
// 	var dir = path.resolve(TestsBase, 'data/good');
// 	mkdirp.sync(dir);
// 	return dir;
// }
//
// function writeHeader(file: string) {
// 	var data = fs.readFileSync(util.data('gen/tests-header.txt'), 'utf-8');
// 	fs.writeFileSync(file, data, 'utf-8');
// }
//
// function writeFooter(file: string) {
// 	var data = fs.readFileSync(util.data('gen/tests-footer.txt'), 'utf-8');
// 	fs.appendFileSync(file, data, 'utf-8');
// }
//
// function save(dir: string, file: string, prefix: string, no: number, text: string) {
// 	var filename = prefix + '-' + no.toString();//zeroPad(no, 3);
// 	var f = path.resolve(dir, filename+'.raml');
// 	fs.writeFileSync(f, text, 'utf-8');
// 	var data = '// ' + prefix + ' ' + no + '\n' +
// 		'  it ("' + filename + ' #' + filename + '",function(){\n' +
// 		'    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/' + prefix + '/' + filename + '.raml"));\n' +
// 		'    assert.equal(util.countErrors(api.highLevel()), 0);\n' +
// 		'  });\n\n';
//
// 	fs.appendFileSync(file, data, 'utf-8');
// }
//
// function rmdir(path) {
// 	if( fs.existsSync(path) ) {
// 		fs.readdirSync(path).forEach(function(file,index){
// 			var curPath = path + "/" + file;
// 			if(fs.lstatSync(curPath).isDirectory()) { // recurse
// 				rmdir(curPath);
// 			} else { // delete file
// 				fs.unlinkSync(curPath);
// 			}
// 		});
// 		fs.rmdirSync(path);
// 	}
// }
//
// function makeTestSets(amount: number) {
// 	var goodCount = 0;
// 	var badCount = 0;
// 	mkdirp.sync(TestsBase);
// 	var goodfile = path.resolve(TestsBase, 'parser-tests.ts');
// 	var badfile = path.resolve(TestsBase, 'parser-tests-bad.ts');
// 	rmdir(path.resolve(TestsBase, 'data'));
// 	console.log('good tests: ' + goodfile);
// 	writeHeader(goodfile);
// 	writeHeader(badfile);
// 	for(var i=0; i<amount; i++) {
// 		var tset = testset();
// 		if(tset.errors == 0) {
// 			goodCount++;
// 			// console.log('generated: ok');
// 			save(gooddir(), goodfile, 'good', goodCount, tset.text);
// 		} else {
// 			badCount++;
// 			save(baddir(), badfile, 'bad', badCount, tset.text);
// 		}
// 		console.log('generated good/bad: ' + goodCount + '/' + badCount);
// 	}
// 	writeFooter(goodfile);
// 	writeFooter(badfile);
// }
//
// function makeGoodBad(goodLimit: number, badLimit) {
// 	var goodCount = 0;
// 	var badCount = 0;
// 	mkdirp.sync(TestsBase);
// 	var goodfile = path.resolve(TestsBase, 'parser-tests.ts');
// 	var badfile = path.resolve(TestsBase, 'parser-tests-bad.ts');
// 	rmdir(path.resolve(TestsBase, 'data'));
// 	console.log('good tests: ' + goodfile);
// 	writeHeader(goodfile);
// 	writeHeader(badfile);
// 	while(goodCount < goodLimit || badCount < badLimit) {
// 		var tset = testset();
// 		if(tset.errors == 0) {
// 			if(goodCount < goodLimit) {
// 				goodCount++;
// 				// console.log('generated: ok');
// 				save(gooddir(), goodfile, 'good', goodCount, tset.text);
// 			}
// 		} else {
// 			if(badCount < badLimit) {
// 				badCount++;
// 				save(baddir(), badfile, 'bad', badCount, tset.text);
// 			}
// 		}
// 		console.log('generated good/bad: ' + goodCount + '/' + badCount);
// 	}
// 	writeFooter(goodfile);
// 	writeFooter(badfile);
// }
//
// makeGoodBad(100,100);
//
