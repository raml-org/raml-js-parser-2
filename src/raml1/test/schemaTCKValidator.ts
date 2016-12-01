/// <reference path="../../../typings/main.d.ts" />
import testUtil = require("./test-utils")

var fs = require("fs");
var ZSchema=require("z-schema");

var jsonSchemaPath: string = "../../../../tckJsonSchema.json";
var jsonSchema:string;

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
    var validator = new ZSchema();
    var content = fs.readFileSync(path).toString();

    if(!jsonSchema) {
        jsonSchema = fs.readFileSync(testUtil.data(jsonSchemaPath)).toString();
    }

    var valid = validator.validate(JSON.parse(content), JSON.parse(jsonSchema));
    var errors = validator.getLastErrors();

    if(!valid) {
        console.error("errors: " + path + "\n" + JSON.stringify(errors, null, 4));
    } else {
        console.log("ok: " + path);
    }
}