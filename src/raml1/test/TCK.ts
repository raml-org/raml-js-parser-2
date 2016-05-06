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
        testAPI('TCK/RAML10/Fragments 001/fragment.raml');
    });

    it("Types 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types 001/api.raml');
    });


    it("Types 002", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types 002/api.raml');
    });

    it("Types 003", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Types 003/api.raml');
    });

    it("Trait 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Traits/Trait 001/api.raml');
    });

    it("Annotations 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations 001/api.raml');
    });

    it("Annotations 002", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations 002/api.raml');
    });

    it("Annotations 003", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Annotations 003/api.raml');
    });

    it("Bodies 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Bodies/Body 001/api.raml');
    });

    it("Instagram 1.0", function () {
        this.timeout(15000);
        testAPI('../example-ramls/Instagram1.0/api.raml',null,'TCK/RAML10/Instagram1.0/api-tck.json');
    });

    it("Instagram 0.8", function () {
        this.timeout(15000);
        testAPI('../example-ramls/Instagram/api.raml',null,'TCK/RAML08/Instagram/api-tck.json');
    });

    it("Libraries 001", function () {
        this.timeout(15000);
        testAPI('TCK/RAML10/Libraries 001/api.raml');
    });

    it("Form Parameters", function () {
        this.timeout(15000);
        testAPI('TCK/RAML08/Form Parameters/api.raml');
    });


    it("Overlays 001", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays 001/apigateway.raml", [
            "TCK/RAML10/Overlays 001/apigateway-aws-overlay.raml"
        ]);
    });

    it("Overlays 002", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays 002/api.raml", [
            "TCK/RAML10/Overlays 002/overlay.raml"
        ]);
    });

    it("Overlays 003", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/Overlays 003/api.raml", [
            "TCK/RAML10/Overlays 003/overlay.raml"
        ]);
    });

    it("Extension example", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/examples/raml1/overlays&extensions/extension/master.raml", [
            "TCK/RAML10/examples/raml1/overlays&extensions/extension/extension.raml"
        ],"TCK/RAML10/examples/raml1/overlays&extensions/extension/master-tck.json");
    });

    it("Overlay example", function () {
        this.timeout(15000);
        testAPI("TCK/RAML10/examples/raml1/overlays&extensions/overlay/master.raml", [
            "TCK/RAML10/examples/raml1/overlays&extensions/overlay/slave.raml"
        ],"TCK/RAML10/examples/raml1/overlays&extensions/overlay/master-tck.json");
    })
});





function testAPI(apiPath:string, extensions?:string[],tckJsonPath?:string){

    if(extensions){
        extensions = extensions.map(x=>util.data(x));
    }
    var api = index.loadRAMLSync(util.data(apiPath),extensions);
    var expanded = api["expand"] ? api["expand"]() : api;
    (<any>expanded).setAttributeDefaults(true);
    var json = expanded.toJSON({rootNodeDetails:true});

    if(!tckJsonPath){
        var dir = path.dirname(util.data(apiPath));
        var fileName = path.basename(apiPath).replace(".raml","-tck.json");
        tckJsonPath = path.resolve(dir,fileName);
    }

    if(!fs.existsSync(util.data(tckJsonPath))){
        fs.writeFileSync(util.data(tckJsonPath),JSON.stringify(json,null,2));
    }

    var tckJson:any = JSON.parse(fs.readFileSync(util.data(tckJsonPath)).toString());
    var regExp = new RegExp('/errors\\[\\d+\\]/path');
    var diff = util.compare(json,tckJson).filter(x=>!x.path.match(regExp));
    if(diff.length==0){
        assert(true);
    }
    else{
        //fs.writeFileSync(util.data(tckJsonPath),JSON.stringify(json,null,2));
        console.log(diff.map(x=>x.message("actual","expected")).join("\n\n"));
        assert(false);
    }
}