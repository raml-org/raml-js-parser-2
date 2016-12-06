/// <reference path="../../../typings/main.d.ts" />
import testUtil = require("./test-utils")

var fs = require("fs");
var path = require("path");
var def = require("raml-definition-system");
var projectClass = require("../jsyaml/jsyaml2lowLevel").Project;
var ContentProvider = require("../../util/contentprovider").ContentProvider;

var jsonSchemaFile: string = "./tckJsonSchema.json";

var project = new projectClass(testUtil.projectRoot() + "/tckJsonSchema");
var unit = project.unit(jsonSchemaFile);
var provider = new ContentProvider(unit);
var content = fs.readFileSync(testUtil.projectRoot()+"/tckJsonSchema/"+jsonSchemaFile).toString();
var schemaUtils = def.getSchemaUtils();
var jsonSchemaObject = new schemaUtils.JSONSchemaObject(content, provider);

validateDir(testUtil.data("TCK"));

function validateDir(path: string) {
    if(fs.statSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(file => {
            validateDir(path + "/" + file);
        });
    } else if(fs.statSync(path).isFile()) {
        if (path.lastIndexOf("-tck.json") > -1 ) {
            validateJSON(path);
        }
    }
}

function validateJSON(path: string){

    try {
        jsonSchemaObject.validate(fs.readFileSync(path).toString());
        console.log("ok: " + path);
    } catch (err){
        console.error("errors: " + path + "\n" + JSON.stringify(err, null, 4));
    }
}