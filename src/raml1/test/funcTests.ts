/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")
import ll=require("../lowLevelAST")
import linter=require("../ast.core/linter")
import yll=require("../jsyaml/jsyaml2lowLevel")
import hl=require("../highLevelAST")
import util = require("./test-utils")
import tools = require("./testTools")

import index = require("../../index");
import parserMod = require("../../parserMod");
import project = require("../../project");
import search = require("../../searchProxy");
import schema = require("../../schema");

import fs = require("fs");

describe('Parser index functions tests',function() {
    it("loadRaml", function(done){
        this.timeout(15000);

        index.loadRAML(util.data("../example-ramls/Instagram/api.raml"), []).then((api: any) => {
            testWrapperDump(api, util.data('./functions/dumps/apiAsync.dump'));

            done();
        });
    });

    it("getLanguageElementByRuntimeType", function(){
        var api = util.loadApi(util.data('./functions/simple.raml'));
        
        var type: any = index.getLanguageElementByRuntimeType((<any>api).wrapperNode().types()[0].runtimeType());
        
        assert.equal(type.name(), "SomeType");
    });

    it("isFragment", function(){
        var api = util.loadApi(util.data('./functions/simple.raml'));

        assert.equal((<any>index).isFragment(api.wrapperNode()), true);
    });

    it("asFragment", function(){
        var api = util.loadApi(util.data('./functions/simple1.raml'));

        var asFragment = (<any>index).asFragment(api.wrapperNode());

        testWrapperDump(asFragment, util.data('./functions/dumps/asFragment.dump'));
    });
});

describe('Parser parserMod functions tests',function() {
    it("createTypeDeclaration", function () {
        var typeDecl = parserMod.createTypeDeclaration('SomeType');

        testWrapperDump(typeDecl, util.data('./functions/dumps/createTypeDeclaration.dump'));
    });

    it("createObjectTypeDeclaration", function () {
        var typeDecl = parserMod.createObjectTypeDeclaration('SomeType');

        testWrapperDump(typeDecl, util.data('./functions/dumps/createObjectTypeDeclaration.dump'));
    });
});

describe('Parser project functions tests',function() {
    it("createProject", function () {
        var prj = project.createProject(util.data('./functions'));

        var content = prj.unit('simple.raml').contents();

        var api = index.parseRAMLSync(content);

        testWrapperDump(api, util.data('./functions/dumps/createProject.dump'));
    });
});

describe('Parser searchProxy functions tests',function() {
    it("determineCompletionKind1", function () {
        var prj = project.createProject(util.data('./functions'));

        var content = prj.unit('simple.raml').contents();

        assert.equal(search.determineCompletionKind(content, 166), search.LocationKind.VALUE_COMPLETION);
    });

    it("determineCompletionKind2", function () {
        var prj = project.createProject(util.data('./functions'));

        var content = prj.unit('simple.raml').contents();

        assert.equal(search.determineCompletionKind(content, 161), search.LocationKind.KEY_COMPLETION);
    });

    it("enumValues", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));
        
        var wrapper: any = api.wrapperNode();

        var resource = (<any>wrapper).resources()[0];

        var hl = wrapper.resources()[0].methods()[0].responses()[0].body()[0].highLevel();
        var prop = wrapper.resources()[0].methods()[0].responses()[0].body()[0].highLevel().children()[1].property();
        
        assert.equal(search.enumValues(prop, hl).join(', '), 'SomeType, array, union, object, string, boolean, number, integer, date-only, time-only, datetime-only, datetime, date, file');
    });

    it("globalDeclarations", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));

        var wrapper: any = (<any>api).wrapperNode().expand();

        var globals = search.globalDeclarations(api);
        
        testNodeDump(globals[0], util.data('./functions/dumps/globalDeclarations0.dump'));
        testNodeDump(globals[1], util.data('./functions/dumps/globalDeclarations1.dump'));
    });
});

describe('Parser schema functions tests',function() {
    it("createSchema xsd", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));
        
        var sch = schema.createSchema(getContent('./functions/schemas/xml/simpleSchema.xsd'), api.lowLevel().unit());
        
        assert(sch.getType(), 'text.xml');
    });
    
    it("createSchema json", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));

        var sch = schema.createSchema(getContent('./functions/schemas/json/simpleSchema.json'), api.lowLevel().unit());

        assert(sch.getType(), 'source.json');
    });

    it("getXMLSchema", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));

        var sch = schema.getXMLSchema(getContent('./functions/schemas/xml/simpleSchema.xsd'));

        assert(sch.getType(), 'text.xml');
    });

    it("getJSONSchema", function () {
        var api = util.loadApi(util.data('./functions/simple.raml'));

        var sch = schema.getJSONSchema(getContent('./functions/schemas/json/simpleSchema.json'), api.lowLevel().unit());

        assert(sch.getType(), 'source.json');
    });

    it("getIncludePath", function () {
        assert.equal(schema.getIncludePath('some/path.json#someRef'), 'some/path.json');
    });

    it("getIncludeReference", function () {
        assert.equal(schema.getIncludeReference('some/path.json#someRef').getIncludePath(), 'some/path.json');
    });

    it("completeReference", function () {
        var cr = schema.completeReference('some/path.json', schema.getIncludeReference('some/path.json#'), getContent('./functions/schemas/json/simpleSchema.json'));

        assert.equal(cr.join(', '), 'title, type, properties, required');
    });

    it("createSchemaModelGenerator", function () {
        var schemaContent = getContent('./functions/schemas/json/simpleSchema.json');

        var api = util.loadApi(util.data('./schema/api-empty.raml'));
        
        var smg = schema.createSchemaModelGenerator();
        
        smg.generateTo(api, schemaContent, 'GeneratedFromSchema');

        util.compareToFile(api.lowLevel().unit().contents(), util.data("./functions/createSchemaModelGenerator.raml"), true);
    });

    it("createModelToSchemaGenerator", function () {
        var schemaContent = getContent('./functions/schemas/json/simpleSchema.json');

        var api = util.loadApi(util.data('./functions/simple1.raml'));

        var msg = schema.createModelToSchemaGenerator();
        
        var sch = msg.generateSchema((<any>api).wrapperNode().types()[0].highLevel());
        
        util.compareToFileObject(sch, util.data("./functions/dumps/createModelToSchemaGenerator.dump"), true);
    });
});

function getContent(relativePath) {
    return fs.readFileSync(util.data(relativePath)).toString();
}

function testDump(apiPath: string, options: any) {
    var api = util.loadApi(apiPath);
    var dumpPath = util.dumpPath(apiPath);
    
    util.compareDump(api.wrapperNode().toJSON(options), dumpPath, apiPath);
}

function testNodeDump(api: any, dumpPath: string) {
    util.compareDump(api.wrapperNode().toJSON({}), dumpPath, null);
}

function testWrapperDump(api: any, dumpPath: string) {
    util.compareDump(api.toJSON({}), dumpPath, null);
}

function testErrorsWithLineNumber(p:string,lineNumber: number, column:number) {
    var api = util.loadApi(p);
    var errors:any = util.validateNode(api);
    var issue:hl.ValidationIssue =errors[0];
    var position:ll.TextPosition=null;
    if (typeof issue.node =="function"){
        var javaposition=(<any>issue).start();
        assert.equal(javaposition.column(),column);
        assert.equal(javaposition.line(),lineNumber);
    }
    else{
        position=issue.node.lowLevel().unit().lineMapper().position(issue.start);
        assert.equal(position.column,column);
        assert.equal(position.line,lineNumber);
    }


}
function testErrorsEnd(p:string) {
    var api = util.loadApi(p);
    var errors:any = util.validateNode(api);
    var issue:hl.ValidationIssue =errors[0];
    assert.equal(issue.end<api.lowLevel().unit().contents().length,true);

}

export function testErrors(p:string, expectedErrors=[],ignoreWarnings:boolean=false){
    var api=util.loadApi(p);
    api = util.expandHighIfNeeded(api);

    var errors:any=util.validateNode(api);
    if (ignoreWarnings){
        errors=errors.filter(x=>!x.isWarning);
    }
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
        console.warn("Expected errors:");
        expectedErrors.forEach(expectedError=>console.warn(expectedError));

        var unitContents = api.lowLevel().unit().contents();
        console.warn("Actual errors:");

        errors.forEach(error=>console.warn(error.message + " : " + unitContents.substr(error.start, error.end-error.start)));
    }
    assert.equal(hasUnexpectedErr, false, "Unexpected errors found\n"+errorMsg);
    assert.equal(errors.length, expectedErrors.length, "Wrong number of errors\n"+errorMsg);
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
    var children = n.children();
    var l = tools.getLength(children);
    for(var i = 0 ; i < l ; i++){
        var item = tools.collectionItem(children,i);
        testId(item);
    }
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
function testErrorsByNumber(p:string,count:number=0,deviations:number=0){
    var api=util.loadApi(p);
    var errors:any=util.validateNode(api);

    var condition:boolean = false;
    if(deviations==0){
        condition = errors.length == count;
    }
    else if(deviations>0){
        condition = errors.length >= count;
    }
    else{
        condition = errors.length <= count;
    }
    if(!condition) {
        if (errors.length > 0) {
            errors.forEach(error=>{
                if (typeof error.message == 'string') {
                    console.warn(error.message);
                } else {
                    console.warn(error);
                }
                console.warn("\n");
            })

        } else {
            //console.log(errors)
        }
    }
    if(deviations==0) {
        assert.equal(errors.length, count);
    }
    else if(deviations>0){
        assert.equal(errors.length>=count, true);
    }
    else{
        assert.equal(errors.length<=count, true);
    }
}

