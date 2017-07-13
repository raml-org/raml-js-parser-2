import apiLoader = require("../raml1/apiLoader");
import RamlWrapper = require("../raml1/artifacts/raml08parserapi")
import RamlWrapper1= require("../raml1/artifacts/raml10parserapi")
import Opt= require("../Opt")
import raml = require('raml-parser');
import fs = require("fs");

var mkdirp = require('mkdirp');
var path = require('path');
var diff = require('deep-diff').diff;
var converter = require('./ramlToJson08');
let messageRegistry = require("../../resources/errorMessages");

export function compareParsers(workspacePath:string){
    var files_ = files || [];
    var jsonFolder = workspacePath + '/_JSON';
    var files = fs.readdirSync(jsonFolder);
    for (var i in files){
        if (fs.statSync(jsonFolder + '/' + files[i]).isDirectory()) {
            var jsonsFiles = fs.readdirSync(jsonFolder + '/' + files[i])
            jsonsFiles.forEach(jFile=> {
                if (jFile.substr(0, 4) == "jsp_") {
                    var base = jFile.substr(4, jFile.length)
                    var tspName = "tsp_" + base;
                    console.log("Comparing: " + files[i]);
                    var jspJsonContent = JSON.parse(fs.readFileSync(jsonFolder + '/' + files[i]+'/'+jFile, 'utf8'));
                    var tspJsonContent = JSON.parse(fs.readFileSync(jsonFolder + '/' + files[i]+'/'+tspName, 'utf8'));
                    var diffContent = diff(jspJsonContent, tspJsonContent);
                    var outputDiff = workspacePath + '/_DIFF/' + files[i];

                    if (diffContent){
                        mkdirp.sync(outputDiff);
                        fs.writeFileSync(outputDiff+'/'+'diff_'+base, JSON.stringify(diffContent, null, 4));
                    }
                }
            });
        }
    }
}
export class FileSystemLoader extends raml.FileReader{
    constructor(rootPath:string){
        super(<any>((pth:string)=>{
            //heandle absolute path
            if(fs.existsSync(pth)){
                return Promise.resolve(fs.readFileSync(pth).toString());
            }
            //notebook related path;
            var path1 = path.resolve(rootPath, pth);
            if(!fs.existsSync(path1)){
                //handle workdir related path
                path1 = path.resolve(process.cwd(),pth)
            }
            var z=fs.readFileSync(path1).toString();
            var v=Promise.resolve(z);
            return v;
        }));
    }

}

export function serializeWorkspaceToJsonJSP(workspacePath:string){
    getApiProjects(workspacePath).forEach(dir=>{
        var files = fs.readdirSync(dir);
        files.forEach(file=>{
            if(path.extname(file) === ".raml") {
                var outputFolder = workspacePath + '/_JSON/' + dir.split('/').slice(-1) + '/';
                var fileName = '/jsp_' + file.substr(0, file.indexOf('.')) + '.json';
                mkdirp.sync(outputFolder);
                var apiUrl = dir + '/' + file;
                var options = new FileSystemLoader(this._rootPath)
                var api:Promise<Raml08Parser.Api> = raml.loadFile(apiUrl, {reader: options});
                var result = api.then(api=> {
                    var content = JSON.stringify(api, null, 4);
                    fs.writeFileSync(outputFolder + fileName, content);
                });
            }
        });
    });
}

export function serializeWorkspaceToJsonTSP(workspacePath:string){
    var apiProjects = getApiProjects(workspacePath);
    apiProjects.forEach(dir=>{
        var files = fs.readdirSync(dir);
        files.forEach(file=>{
            if(path.extname(file) === ".raml") {
                var apiUrl = dir + '/' + file;
                var opt:Opt<RamlWrapper1.Api|RamlWrapper.Api> = apiLoader.loadApi(apiUrl);
                var apiBase:RamlWrapper.Api = <RamlWrapper.Api>opt.getOrThrow();
                var api: RamlWrapper.Api = apiBase.expand();
                var json = converter.convertToJson(api, "aa");

                var projectFolder = dir.split('/').slice(-1);
                var fileName = file.substr(0, file.indexOf('.'));
                var folder = workspacePath + "/_JSON/" + projectFolder;
                var jsonPath = folder + "/tsp_" + fileName + ".json";

                console.log("Serializing: " + projectFolder[0]+"/"+fileName);

                var mkdirp = require('mkdirp');
                mkdirp.sync(folder);
                var fl = require("fs");
                fl.writeFileSync(jsonPath, JSON.stringify(json, null, 4));
            }
        });
    });
}

function getApiProjects(workspaceDir){
    var files_ = files || [];
    var files = fs.readdirSync(workspaceDir);
    for (var i in files){
        var name = workspaceDir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            files_.push(name);
        }
    }
    return files_;
}

var apiPath;
var args:string[] = process.argv;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=='-apiPath' && i < args.length-1){
        apiPath = args[i+1]
    }
}
if(apiPath){
    serializeWorkspaceToJsonJSP(apiPath);
    serializeWorkspaceToJsonTSP(apiPath);
    compareParsers(apiPath);
}
else{
    throw new Error(messageRegistry.SPECIFY_APIPATH.message);
}
