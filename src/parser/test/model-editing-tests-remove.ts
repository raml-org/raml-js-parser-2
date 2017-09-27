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


// describe('Low level model: remove', function () {
//
//   it('should remove paged trait', function () {
//     var api = util.loadApi(util.data('api.raml'), true);
//     var nodes = api.elementsOfKind("traits");
//     assert.equal(2, nodes.length);
//     //(<yll.ASTNode>nodes[0].lowLevel()).showParents('Node parents');
//     api.remove(nodes[0]);
//     //assert.equal(1, api.elementsOfKind("traits").length);
//     //console.log(api.lowLevel().unit().contents());
//     util.compareToFile(api.lowLevel().unit().contents(), util.data("api-remove-paged.raml"));
//   });
//
//   it('should remove secured trait', function () {
//     var api = util.loadApi(util.data('api.raml'), true);
//     var nodes = api.elementsOfKind("traits");
//     assert.equal(2, nodes.length);
//     api.remove(nodes[1]);
//     //console.log(api.lowLevel().unit().contents());
//     //assert.equal(1, api.elementsOfKind("traits").length);
//     util.compareToFile(api.lowLevel().unit().contents(), util.data("api-remove-secured.raml"));
//   });
//
//   it('should remove all traits', function () {
//     var api = util.loadApi(util.data('api.raml'), true);
//     var nodes = api.elementsOfKind("traits");
//     assert.equal(2, nodes.length);
//     //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL API');
//     nodes.forEach(node=> {
//       //console.log('Removing: ' + node.name());
//       api.remove(node);
//       //(<yll.ASTNode>api.lowLevel()).show('NODE REMOVED');
//     });
//     //(<yll.ASTNode>api.lowLevel()).show('NODES REMOVED');
//     //assert.equal(1, api.elementsOfKind("traits").length);
//     //console.log(api.lowLevel().unit().contents());
//     util.compareToFile(api.lowLevel().unit().contents(), util.data("api-remove-all-traits.raml"));
//     //assert(false);
//   });
//
//   it('should remove version attribute', function () {
//     var api = util.loadApi(util.data('api.raml'), true);
//     var version = api.attr("version");
//     api.remove(version);
//     //console.log(api.lowLevel().unit().contents());
//     util.compareToFile(api.lowLevel().unit().contents(), util.data("api-remove-version.raml"));
//   });
//
//
//
// });








