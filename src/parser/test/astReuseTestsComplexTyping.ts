import index = require("../../index");
import assert = require("assert");
import ramlWrapper = require("../artifacts/raml10parser");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import hlimpl = require("../highLevelImpl");
import reuseUtil = require("./test-reuse-utils");
import util = require("./test-utils");
import fs = require("fs");

describe('Testing AST reuse by typing simulation (complex)',function() {
    this.timeout(200000);
    it("Test 001", function () {
        test("ASTReuseTests/ComplexTyping/test001/api.raml");
    });
});

function test(specPath:string) {
    var pathRes = util.data(specPath).replace(/\\/g,'/');
    reuseUtil.simulateTypingForFile(pathRes,[
        'Resource',
        'Method',
        'Method.body',
        'Api.types',
        'Method.responses',
        'TypeDeclaration'
    ]);
}
