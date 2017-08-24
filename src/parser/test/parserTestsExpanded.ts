/// <reference path="../../../typings/main.d.ts" />

global.isExpanded = true;

describe ("Tests with expanded APIs.", function () {
    this.timeout(15000);
    require("./model-editing-tests-add")
    require("./model-editing-tests-refactoring")
    require("./model-editing-tests-remove")
    require("./model-editing-tests-attrs")
    require("./model-editing-tests-sig")
    require("./schema-model-tests")
    require("./parserTests")
    require("./parserTests2")
    require("./parserASTTests")
    require("./gotoDeclarationTests")
    require("./findUsagesTests")
    require("./traits-and-resource-types-expanding-tests")
    require("./exampleGenTests")
    require("./typeSystemTests")
    require("./runtimeExampleTests")
    require("./data/parser/test/specs/parser")
});