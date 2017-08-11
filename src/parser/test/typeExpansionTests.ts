/// <reference path="../../../typings/main.d.ts" />
import tckUtil = require("./scripts/tckUtil");
describe('Type Expansion Tests',function(){

    describe('Type Expansion Tests',function(){

        it("Properties aggregation", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test001/api.raml");
        });

        it("Property types merging", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test002/api.raml");
        });

        it("Fixing user defined facets", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test003/api.raml");
        });

        it("Array of union types and union of array types", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test004/api.raml");
        });

        it("Merging array component types", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test005/api.raml");
        });

        it("Recursion by property types and array component types", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test006/api.raml");
        });

        it("External types", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test007/api.raml");
        });

        it("Examples", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test008/api.raml");
        });

        it("Annotations", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test009/api.raml");
        });
    });
});

function test(apiPath:string) {
    tckUtil.testAPIScript({
        "apiPath": apiPath,
        "serializeMetadata": false,
        expandLib: true,
        "newFormat": true,
        expandTypes: true
    });
}