/// <reference path="../../typings/main.d.ts" />
import apiLoader = require("../raml1/apiLoader");
import RamlWrapper = require("../raml1/artifacts/raml08parserapi")
import RamlWrapper1= require("../raml1/artifacts/raml10parserapi")
import Opt= require("../Opt")
import fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var converter = require('./ramlToJson08');
var converter1 = require('./ramlToJson10');
var tckDumper = require('./TCKDumper');
import parserCore = require('../raml1/wrapped-ast/parserCore');
import parserCoreApi = require('../raml1/wrapped-ast/parserCoreApi');
import util = require("../raml1/test/test-utils")

export interface Options extends parserCoreApi.Options{

    //The folder for output JSON object to be saved to
    outputJsonFolder?: string

    ignoreMeta?:boolean

    postfix?:string
}

export function saveToJson(apiPath:string,arg1?:string[]|Options,arg2?:string[]|Options){

    var _arg1 = arg1;
    var _arg2 = arg2;
    var options:Options;
    if(_arg1 && !Array.isArray(_arg1)){
        options = _arg1;
    }
    else if(_arg2 && !Array.isArray(_arg2)){
        options = _arg2;
    }
    else if(!_arg1){
        options = {};
        _arg1 = options;
    }
    else{
        options = {};
        _arg2 = options;
    }
    options.attributeDefaults = true;

    var opt:Opt<RamlWrapper1.Api|RamlWrapper.Api> = apiLoader.loadApi(apiPath,_arg1,_arg2);
    var apiBase:RamlWrapper1.Api|RamlWrapper.Api = opt.getOrThrow();
    var api:RamlWrapper1.Api|RamlWrapper.Api = apiBase.expand();
    //var json = api instanceof RamlWrapper.ApiImpl
    //    ? converter.convertToJson(<RamlWrapper.Api>api,false,!options.ignoreMeta)
    //    : converter1.convertToJson(<RamlWrapper1.Api>api,false,!options.ignoreMeta);

    var dumper = new tckDumper.TCKDumper();
    var tckJson = api.toJSON({
        rootNodeDetails:true
    });//dumper.dump(api,true);
    var missingProperties = dumper.printMissingProperties();
    if(missingProperties.trim().length>0){
        console.log('Missing Properties:');
        console.log(missingProperties);
    }

    var ramlFileName = path.basename(apiPath);
    var fileName = ramlFileName.substr(0, ramlFileName.lastIndexOf('.'));
    var jsonFileName = fileName + (options.postfix ? options.postfix : "") + ".json";
    var tckJsonFileName = fileName + "_tck.json";
    var diffFileName = fileName + "_diff.json";
    var folder;

    var outputJsonFolder = options.outputJsonFolder;
    if (outputJsonFolder){
        if (outputJsonFolder.lastIndexOf('/') == outputJsonFolder.length-1 || outputJsonFolder.lastIndexOf('\\') == outputJsonFolder.length-1)
            folder = outputJsonFolder;
        else
            folder = outputJsonFolder + '/';
    }else {
        folder = apiPath.substr(0, apiPath.length - ramlFileName.length);
    }
    var jsonFilePath = folder + jsonFileName;
    var tckJsonFilePath = folder + tckJsonFileName;
    mkdirp.sync(folder);
    fs.writeFileSync(jsonFilePath, JSON.stringify(tckJson, null, 4));
    //fs.writeFileSync(tckJsonFilePath, JSON.stringify(tckJson, null, 4));

    //var diffFilePath = folder + diffFileName;
    //var diffs = util.compare(json,tckJson);
    //if(diffs.length==0){
    //    if(fs.existsSync(diffFilePath)){
    //        fs.unlinkSync(diffFilePath);
    //    }
    //}
    //else{
    //    fs.writeFileSync(diffFilePath, JSON.stringify(diffs, null, 4));
    //}
}