/// <reference path="../../../typings/main.d.ts" />
import index = require("../../index");
import assert = require("assert");
import ramlWrapper = require("../artifacts/raml10parser");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import hlimpl = require("../highLevelImpl");
import reuseUtil = require("./test-reuse-utils");
import util = require("./test-utils");
import fs = require("fs");

describe('Testing AST reuse by typing simulation (basic)',function() {
    this.timeout(50000);
    describe('Basic Tests', function () {

        it("Resource type", function () {
            test("ASTReuseTests/test01/api.raml");
        });

        it("Super type", function () {
            test("ASTReuseTests/test02/api.raml");
        });

        it("Additional properties for a response mime type", function () {
            test("ASTReuseTests/test03/api.raml");
        });

        it("Uri parameter facet value", function () {
            test("ASTReuseTests/test04/api.raml");
        });

        it("Resource description", function () {
            test("ASTReuseTests/test05/api.raml");
        });

        it("Header name in the method", function () {
            test("ASTReuseTests/test06/api.raml");
        });

        it("Trait parameter value", function () {
            test("ASTReuseTests/test07/api.raml");
        });

        it("Method securedBy value", function () {
            test("ASTReuseTests/test08/api.raml");
        });

        it("Resource annotation", function () {
            test("ASTReuseTests/test09/api.raml");
        });

        it("Resource type annotation for a resource with the same annotation", function () {
            test("ASTReuseTests/test10/api.raml");
        });

        it("Resource type: method response change 1", function () {
            test("ASTReuseTests/test11/api.raml");
        });

        it("Inherited method", function () {
            test("ASTReuseTests/test12/api.raml");
        });

        it("Resource type method trait content", function () {
            test("ASTReuseTests/test13/api.raml");
        });

        it("Resource type parameter name", function () {
            test("ASTReuseTests/test14/api.raml");
        });

        it("Object annotation", function () {
            test("ASTReuseTests/test15/api.raml");
        });

        it("Property declaration type", function () {
            test("ASTReuseTests/test16/api.raml");
        });

        it("Property declaration type", function () {
            test("ASTReuseTests/test17/api.raml");
        });

        it("Resource type: supertype", function () {
            test("ASTReuseTests/test18/api.raml");
        });

        it('Parse simple resource type with request body', function(){
            test('parser/resourceType/resType01.raml');
        });

        it('Parse simple resource type with response body', function(){
            test('parser/resourceType/resType02.raml');
        });

        it('Parse resource type with response body inherited from user defined type', function(){
            test('parser/resourceType/resType03.raml');
        });

        it('Parse resource type with request body inherited from user defined type', function(){
            test('parser/resourceType/resType04.raml');
        });

        it('Parse resource type with uri parameters', function(){
            test('parser/resourceType/resType05.raml');
        });

        it('Parse applying resource type with uri parameters', function(){
            test('parser/resourceType/resType06.raml');
        });

        it('Parse resource inherited from simple resource type with request body', function(){
            test('parser/resourceType/resType07.raml');
        });

        it('Parse resource inherited from simple resource type with response body', function(){
            test('parser/resourceType/resType08.raml');
        });

        it('Parse resource inherited from resource type with response body inherited from user defined type', function(){
            test('parser/resourceType/resType09.raml');
        });

        it('Parse resource inherited from resource type with request body inherited from user defined type', function(){
            test('parser/resourceType/resType10.raml');
        });

        it('Parse schema item as parameter', function(){
            test('parser/resourceType/resType17.raml');
        });

        it('Parse type item as parameter', function(){
            test('parser/resourceType/resType18.raml');
        });

        it('Should fail on parameter non exist value', function(){
            test('parser/resourceType/resType19.raml');
        });

        it('Parse all resource types methods defined in the HTTP version 1.1 specification [RFC2616] and its extension, RFC5789 [RFC5789]', function(){
            test('parser/resourceType/resType20.raml');
        });

        it('Parse resource type method with response body', function(){
            test('parser/resourceType/resType15.raml');
        });

        it('Parse resource type method with request body.', function(){
            test('parser/resourceType/resType16.raml');
        });

        it('New methods test 0.8.', function(){
            test('parser/resourceType/resType11.raml');
        });

         it('New methods test 1.0.', function(){
             test('parser/resourceType/resType12.raml');
         });

        it('Disabled body test 0.8.', function(){
            test('parser/resourceType/resType13.raml');
        });

         it('Disabled body test 1.0.', function(){
             test('parser/resourceType/resType14.raml');
         });

        it('Parse trait with header and validate it', function(){
            test('parser/trait/trait01.raml');
        });

        it('Parse trait with query parameter and validate it', function(){
            test('parser/trait/trait02.raml');
        });

        it('Parse trait with body', function(){
            test('parser/trait/trait03.raml');
        });

        it('Parse traits with parameters', function(){
            test('parser/trait/trait04.raml');
        });

        it('Parse traits with boolean parameters', function(){
            test('parser/trait/trait05.raml');
        });

        it('Parse traits with number parameters', function(){
            test('parser/trait/trait06.raml');
        });

        it('Parse object properties',function(){
            test('ASTReuseTests/library/objectTypes/oType01.raml');
        });

        it('Parse minimum number of properties',function(){
            test('ASTReuseTests/library/objectTypes/oType02.raml');
        });

        it('Parse maximum number of properties',function(){
            test('ASTReuseTests/library/objectTypes/oType03.raml');
        });

        it('Parse property required option',function(){
            test('ASTReuseTests/library/objectTypes/oType04.raml');
        });

        it('Parse property default option',function(){
            test('ASTReuseTests/library/objectTypes/oType06.raml');
        });

        it('Parse object types that inherit from other object types',function(){
            test('ASTReuseTests/library/objectTypes/oType07.raml');
        });

        it('Parse object inherit from more than one type',function(){
            test('ASTReuseTests/library/objectTypes/oType08.raml');
        });

        it('Parse shortcut scalar type property declaration',function(){
            test('ASTReuseTests/library/objectTypes/oType09.raml');
        });

        it('Parse maps type declaration',function(){
            test('ASTReuseTests/library/objectTypes/oType10.raml');
        });

        it('Parse restricting the set of valid keys by specifying a regular expression',function(){
            test('ASTReuseTests/library/objectTypes/oType11.raml');
        });

        it('Should not parse alternatively use additionalProperties',function(){
            test('ASTReuseTests/library/objectTypes/oType12.raml');
        });
        //
        // it('Parse inline type expression gets expanded to a proper type declaration',function(){
        //     test('ASTReuseTests/library/objectTypes/oType14.raml');
        // });

        it('Parse array of scalar types declaration',function(){
            test('ASTReuseTests/library/arrayTypes/aType01.raml');
        });

        it('Parse array of complex types declaration',function(){
            test('ASTReuseTests/library/arrayTypes/aType02.raml');
        });

        it('Parse type inherited from several user defined types declaration',function(){
            test('ASTReuseTests/library/objectTypeInheritance/oti02.raml');
        });

        it('Parse type inherited from several user defined types shortcut declaration',function(){
            test('ASTReuseTests/library/objectTypeInheritance/oti03.raml');
        });

        it('Parse inheritance which should works in the types and in the mimeTypes',function(){
            test('ASTReuseTests/library/objectTypeInheritance/oti04.raml');
        });

        it('Should check that does not allowed to specify current type or type that extends current while declaring property of current type',function(){
            test('ASTReuseTests/library/objectTypeInheritance/oti07.raml');
        });

        it('Parse included json schema',function(){
            test('ASTReuseTests/library/externalTypes/eType01.raml');
        });
    });
});

function test(specPath:string) {
    var pathRes = util.data(specPath).replace(/\\/g,'/');
    reuseUtil.testReuseByBasicTyping(pathRes);
}
