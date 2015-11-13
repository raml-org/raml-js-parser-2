/// <reference path="../../../typings/tsd.d.ts" />
import hl = require("../highLevelAST");
import wrapper = require("../artifacts/raml003parser");
export declare class OverloadingValidator {
    protected holder: {
        [path: string]: wrapper.Method[];
    };
    protected conflicting: {
        [path: string]: wrapper.Method[];
    };
    validateApi(q: wrapper.ApiImpl, v: hl.ValidationAcceptor): void;
    acceptResource(x: wrapper.Resource): void;
    acceptMethod(x: wrapper.Resource, m: wrapper.Method): void;
}
