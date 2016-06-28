/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

//import fs = require("fs")
//import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
//import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")

////import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
import tools = require("./testTools")

import smg = require("../tools/schemaModelGen");
import expander = require("../ast.core/expander")
import hlimpl = require("../highLevelImpl")
import RamlWrapper = require("../artifacts/raml10parser")
import json = require("../jsyaml/json2lowLevel")
import wrapper10=require("../artifacts/raml10parser")
import _=require("underscore")
//import egen=require("../ast.core/exampleGen")

function testErrorsByNumber(p:string,count:number=0){
    var api=util.loadApi(p);
    api = util.expandHighIfNeeded(api);
    var errors:any=[];
    var q:hl.ValidationAcceptor= hlimpl.createBasicValidationAcceptor(errors);
    api.validate(q);
    if(errors.length!=count) {
        errors.forEach(error=>console.log(error.message))
        //console.log(errors)
    }
    assert.equal(errors.length,count);
}

function testErrorsWithLineNumber(p:string,lineNumber: number, column:number) {
    var api = util.loadApi(p);
    var errors:any = util.validateNode(api);
    var issue:hl.ValidationIssue =errors[0];
    var position=issue.node.lowLevel().unit().lineMapper().position(issue.start);
    console.log("DD:"+position.line+":"+position.column)
    assert.equal(position.column,column);
    assert.equal(position.line,lineNumber);

}
function testIds(p:string){
    var api=util.loadApi(p);
    testId(api);
}
function testId(n:hl.IParseResult){
    //console.log(n.id());
    if (n!=n.root()) {
        var nnn = n.root().findById(n.id());
        assert.equal(nnn != null, true)
    }
    n.children().forEach(x=>testId(x));
}

export function testErrors(p:string, expectedErrors=[]){
    var api=util.loadApi(p);
    api = util.expandHighIfNeeded(api);

    var errors:any=util.validateNode(api);
    var testErrors;
    var hasUnexpectedErr = false;
    if(expectedErrors.length>0){
        testErrors = validateErrors(errors, expectedErrors);
        hasUnexpectedErr = testErrors.unexpected.length > 0 || testErrors.lostExpected.length > 0;
    }

    var condition:boolean = false;
    condition = errors.length == expectedErrors.length;
    if(!condition) {
        if (errors.length > 0) {
            errors.forEach(error=>{
                if (typeof error.message == 'string') {
                    console.error(error.message);
                } else {
                    console.error(error);
                }
                console.error("\n");
            })
        }
    }

    var errorMsg = '';
    if (hasUnexpectedErr){
        if (testErrors.unexpected.length > 0) {
            errorMsg += "\nUnexpected errors: \n\n";
            testErrors.unexpected.forEach(unexpectedError=> {
                errorMsg += unexpectedError + "\n\n";
            });
        }
        if (testErrors.lostExpected.length > 0){
            errorMsg += "\nDisappeared expected errors: \n\n"
            testErrors.lostExpected.forEach(lostExpected=>{
                errorMsg += lostExpected + "\n\n";
            });
        }
    }

    if (hasUnexpectedErr || errors.length != expectedErrors.length) {
        console.log("Expected errors:");
        expectedErrors.forEach(expectedError=>console.log(expectedError));

        console.log("Actual errors:");
        errors.forEach(error=>console.log(error.message));
    }
    assert.equal(hasUnexpectedErr, false, "Unexpected errors found\n"+errorMsg);
    assert.equal(errors.length, expectedErrors.length, "Wrong number of errors\n"+errorMsg);
}

function escapeRegexp(regexp: string) {
    return regexp.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function validateErrors(realErrors:any, expectedErrors:string[]){
    var errors = {'unexpected': [], 'lostExpected': []};
    if (realErrors.length > 0){
        realErrors.forEach(error=>{
            var realError: string;
            if (typeof error.message == 'string'){
                realError = error.message;
            }else{
                realError = error;
            }
            var isExpectedError:boolean = false;
            expectedErrors.forEach(expectedError=>{
                var index = realError.search(new RegExp(expectedError, "mi"));
                if (index>-1) {
                    isExpectedError = true;
                } else {
                    index = realError.search(new RegExp(escapeRegexp(expectedError), "mi"));
                    if (index>-1) isExpectedError = true;
                }
            });
            if (!isExpectedError)
                errors.unexpected.push(realError);
        });

        expectedErrors.forEach(expectedError=>{
            var isLostError = true;
            realErrors.forEach(error=>{
                var realError: string;
                if (typeof error.message == 'string'){
                    realError = error.message;
                }else{
                    realError = error;
                }
                var index = realError.search(new RegExp(expectedError, "i"))
                if (index > -1) {
                    isLostError = false;
                } else {
                    index = realError.search(new RegExp(escapeRegexp(expectedError), "i"));
                    if (index > -1) isLostError = false;
                }
            });
            if (isLostError)
                errors.lostExpected.push(expectedError);
        });
    }
    return errors;
}



testErrors(util.data("../../../../example-ramls/application-monitoring/api.raml"),["Unrecognized type 'appmonitor-rule.schema'", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-action http://appmonitor-action", "Unrecognized type 'appmonitor-rule.schema'", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-action http://appmonitor-action", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-rule http://appmonitor-rule", "Unrecognized type 'appmonitor'"]);