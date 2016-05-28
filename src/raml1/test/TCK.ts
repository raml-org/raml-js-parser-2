/// <reference path="../../../typings/main.d.ts" />
import index = require("../../index")
import assert = require("assert")
import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import hl=require("../highLevelAST")
import util = require("./test-utils")
import tools = require("./testTools")
import path = require("path")
import fs = require("fs")

describe('TCK tests',function() {

    it("Fragments 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Fragments/test001/fragment.raml');
    });

    it("Types 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types/test024/api.raml');
    });


    it("Types 002", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types/test025/api.raml');
    });

    it("Types 003", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types/test026/api.raml');
    });

    it("Trait 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Traits/test005/api.raml');
    });

    it("Trait 002", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Traits/test006/api.raml');
    });

    it("Annotations 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations/test027/api.raml');
    });

    it("Annotations 002", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations/test028/api.raml');
    });

    it("Annotations 003", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations/test029/api.raml');
    });

    it("Bodies 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML08/Bodies/test001/api.raml');
    });

    it("Instagram 1.0", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Instagram1.0/api.raml');
    });

    it("Instagram 0.8", function () {
        this.timeout(15000);
        testAPI('TCK/RAML08/Instagram/api.raml');
    });

    it("Libraries 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Libraries/test004/api.raml');
    });

    it("Form Parameters", function () {
        this.timeout(15000);
        testAPI('TCK/RAML08/Form Parameters/test001/api.raml');
    });


    it("Overlays 001", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays/test026/apigateway.raml", [
            "TCK/RAML10/Overlays/test026/apigateway-aws-overlay.raml"
        ]);
    });

    it("Overlays 002", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays/test027/api.raml", [
            "TCK/RAML10/Overlays/test027/overlay.raml"
        ]);
    });

    it("Overlays 003", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays/test028/api.raml", [
            "TCK/RAML10/Overlays/test028/overlay.raml"
        ]);
    });

    it("Extension example", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Examples/raml1/overlays&extensions/extension/master.raml", [
            "TCK/RAML10/Examples/raml1/overlays&extensions/extension/extension.raml"
        ],"TCK/RAML10/Examples/raml1/overlays&extensions/extension/master-tck.json");
    });

    it("Overlay example", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Examples/raml1/overlays&extensions/overlay/master.raml", [
            "TCK/RAML10/Examples/raml1/overlays&extensions/overlay/slave.raml"
        ],"TCK/RAML10/Examples/raml1/overlays&extensions/overlay/master-tck.json");
    })
});





export function testAPI(apiPath:string, extensions?:string[],tckJsonPath?:string){

    if(apiPath){
        apiPath = util.data(apiPath);
    }
    if(extensions){
        extensions = extensions.map(x=>util.data(x));
    }
    var api = index.loadRAMLSync(apiPath,extensions);
    var expanded = api["expand"] ? api["expand"]() : api;
    (<any>expanded).setAttributeDefaults(true);
    var json = expanded.toJSON({rootNodeDetails:true});

    if(!tckJsonPath){
        tckJsonPath = defaultJSONPath(apiPath);
    }
    else{
        tckJsonPath = util.data(tckJsonPath);
    }

    if(!fs.existsSync(tckJsonPath)){
        console.warn("FAILED TO FIND JSON: " + tckJsonPath);
        fs.writeFileSync(tckJsonPath,JSON.stringify(json,null,2));
    }

    var tckJson:any = JSON.parse(fs.readFileSync(tckJsonPath).toString());
    var regExp = new RegExp('/errors[d+]/path');
    var diff = util.compare(json,tckJson).filter(x=>!x.path.match(regExp));

    if(diff.length==0){
    }
    else{
        console.warn("DIFFERENCE DETECTED FOR " + tckJsonPath);
        console.warn(diff.map(x=>x.message("actual","expected")).join("\n\n"));
        assert(false);
    }
}

export function defaultJSONPath(apiPath:string) {
    var dir = path.dirname(apiPath);
    var fileName = path.basename(apiPath).replace(".raml", "-tck.json");
    var str = path.resolve(dir, fileName);
    return str;
};