/// <reference path="../../../typings/main.d.ts" />
import hl = require("../highLevelAST");
import wrapper = require("../artifacts/raml08parser");
declare class OverloadingValidator {
    protected holder: {
        [path: string]: wrapper.Resource[];
    };
    protected conflicting: {
        [path: string]: wrapper.Resource[];
    };
    validateApi(q: wrapper.ApiImpl, v: hl.ValidationAcceptor): void;
    acceptResource(x: wrapper.Resource): void;
}
export = OverloadingValidator;
