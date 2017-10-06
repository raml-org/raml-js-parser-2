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
// describe('Failing tests',function() {
//
//     it ("Bad-01 #bad01",function(){
//         var api = util.loadApiWrapper1(util.data('gen/bad/bad01.raml'));
//         assert.equal(util.showErrors(api.highLevel()), 0);
//     });
//
//     it ("Bad-02 #bad02",function(){
//         var api = util.loadApiWrapper1(util.data('gen/bad/bad02.raml'));
//         assert.equal(util.showErrors(api.highLevel()), 0);
//     });
//
//     it ("Bad-03 #bad03",function(){
//         var api = util.loadApiWrapper1(util.data('gen/bad/bad03.raml'));
//         assert.equal(util.showErrors(api.highLevel()), 0);
//     });
//
// });
//
//
