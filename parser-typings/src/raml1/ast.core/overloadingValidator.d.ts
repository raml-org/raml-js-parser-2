/// <reference path="../../../typings/main.d.ts" />
import hl = require("../highLevelAST");
import wrapper10 = require("../artifacts/raml10parser");
import wrapper08 = require("../artifacts/raml08parser");
declare class OverloadingValidator {
    protected uriToResources: {
        [path: string]: Array<wrapper10.Resource | wrapper08.Resource>;
    };
    protected conflictingUriToResources: {
        [path: string]: Array<wrapper10.Resource | wrapper08.Resource>;
    };
    validateApi(api: wrapper10.Api | wrapper08.Api, acceptor: hl.ValidationAcceptor): void;
    acceptResource(resource: wrapper10.Resource | wrapper08.Resource): void;
}
export = OverloadingValidator;
