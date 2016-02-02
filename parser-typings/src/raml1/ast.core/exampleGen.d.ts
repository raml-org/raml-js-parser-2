/// <reference path="../../../typings/main.d.ts" />
import hl = require("../highLevelAST");
import wrapper = require("../artifacts/raml10parser");
export declare function createExampleObject(w: wrapper.TypeDeclaration, generateFakeExamples?: boolean): any;
export declare function createExampleObjectFromTypeDefinition(tp: hl.ITypeDefinition, generateFakeExamples?: boolean): any;
