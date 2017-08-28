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

        it("Recursion by property types and array component types. Depth 1.", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test010/api.raml",1);
        });

        it("Recursion by property types and array component types. Depth 2.", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test011/api.raml",2);
        });

        it("Union type in recursion loop. Depth 1.", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test012/api.raml",1);
        });

        it("Union type in recursion loop. Depth 2.", function () {
            this.timeout(20000);
            test("./TypeExpansionTests/test013/api.raml",2);
        });
    });
});

function test(apiPath:string,depth=0) {
    tckUtil.testAPIScript({
        "apiPath": apiPath,
        "serializeMetadata": false,
        expandLib: true,
        "newFormat": true,
        expandTypes: true,
        recursionDepth: depth
    });
}