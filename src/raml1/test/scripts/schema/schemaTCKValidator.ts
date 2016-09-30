/// <reference path="../../../../../typings/main.d.ts" />
import testUtil = require("../../test-utils");

var schema = require("../../../../../tckJsonSchema.json");

var ZSchema=require("z-schema");

export function validateJSON(json: any): any[] {
    var validator = new ZSchema();
    
    var valid = validator.validate(json, schema);
    
    var errors = validator.getLastErrors();
    
    if(!valid) {
        return errors;
    }
    
    return [];
}