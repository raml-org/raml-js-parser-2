/**
 * parameters:
 * -apiPath path to RAML API.
 * -outputFolder folder to write the output JSON. Default is folder of the API.
 * -ext list of extension and overlay paths separated by file separator symbol (':' for Mac and Linux, ';' for Windows)
 * -ignoreMeta cancels serialization of metadata
 * -postfix postfix to be added to generated TCK JSON file name
 **/
/// <reference path="../../../typings/main.d.ts" />
import fs = require('fs');
import path = require('path');
import ramlToJsonFile = require('../../util/ramlToJsonFile');

var outputFolder:string;
var apiPath:string;
var extensionsAndOverlays:string[] = [];
var ignoreMeta = false;
var attributeDefaults = true;
var postfix = null;

var args:string[] = process.argv;

for(var i = 0 ; i < args.length ; i++){

    if(args[i]=='-outputFolder' && i < args.length-1){
        outputFolder = args[i+1];
        i++;
    }

    else if(args[i]=='-apiPath' && i < args.length-1){
        apiPath = args[i+1];
        i++;
    }

    else if(args[i]=='-ext' && i < args.length-1){
        extensionsAndOverlays = args[i+1].split(path.delimiter);
        i++;
    }

    else if(args[i]=='-postfix' && i < args.length-1){
        postfix = args[i+1];
        i++;
    }

    else if(args[i]=='-ignoreMeta'){
        ignoreMeta = true;
    }
}

if(!apiPath){
    throw new Error('-apiPath parameter is required.');
}

var options:ramlToJsonFile.Options = {
    ignoreMeta : ignoreMeta,
    outputJsonFolder : outputFolder,
    attributeDefaults : true,
    postfix: postfix
};
ramlToJsonFile.saveToJson(apiPath,extensionsAndOverlays,options);