/// <reference path="../../../../typings/main.d.ts" />
import fs = require("fs")
import path = require("path")
import index = require("../../../index")
import testUtil = require("../test-utils")
import util = require("../../../util/index")
import _ = require("underscore")
import assert = require("assert")

class MessageMapping{

    constructor(patterns:string[]){
        this.regExps = patterns.map(x=>new RegExp(x));
    }

    private regExps: RegExp[];

    match(a:string,b:string):boolean{
        var aMatch = this.getValues(a);
        if(aMatch==null){
            return null;
        }
        var bMatch = this.getValues(b);
        if(bMatch==null){
            return null;
        }
        if(aMatch.length!=bMatch.length){
            return false;
        }
        for(var i = 1 ; i < aMatch.length; i++){
            if(aMatch[i]!=bMatch[i]){
                return false;
            }
        }
        return true;        
    }

    private getValues(str:string){
        for(var re of this.regExps){
            var match = str.match(re);
            if(match!=null){
                return match;
            }
        }
        return null;
    }


}

import mappings = require("./messageMappings")
var messageMappings:MessageMapping[] = mappings.map(x=>new MessageMapping(x));

export function launchTests(folderAbsPath:string,regenerteJSON?:boolean){
    
    var dirs = iterateFolder(folderAbsPath);
    for(var dir of dirs){
        var tests = getTests(dir);
        for(var test of tests){
            testAPI(test.masterPath(), test.extensionsAndOverlays(), test.jsonPath(), regenerteJSON);
        }
    }    
}

export function iterateFolder(folderAbsPath:string,result:DirectoryContent[]=[]):DirectoryContent[]{

    if(!fs.lstatSync(folderAbsPath).isDirectory()){
        return;
    }

    var dirContent = extractContent(folderAbsPath);
    if(dirContent!=null){
        result.push(dirContent);
        return result;
    }

    for(var ch of fs.readdirSync(folderAbsPath)){
        var childAbsPath = path.resolve(folderAbsPath,ch);
        if(fs.lstatSync(childAbsPath).isDirectory()){
            iterateFolder(childAbsPath,result);
        }
    }
    return result;
}

export function extractContent(folderAbsPath:string):DirectoryContent{

    if(!fs.lstatSync(folderAbsPath).isDirectory()){
        return null;
    }
    
    var ramlFileNames = fs.readdirSync(folderAbsPath).filter(x=>path.extname(x).toLowerCase()==".raml");
    if(ramlFileNames.length==0){
        return null;
    }
    var ramlFilesAbsPaths = ramlFileNames.map(x=>path.resolve(folderAbsPath,x));
    var ramlFiles:RamlFile[] = [];
    for(var f of ramlFilesAbsPaths){
        var content = fs.readFileSync(f).toString();
        var ramlFirstLine = content.match(/^\s*#%RAML\s+(\d\.\d)\s*(\w*)\s*$/m);
        if(!ramlFirstLine||ramlFirstLine.length<2){
            continue;
        }
        var verStr = ramlFirstLine[1];
        var version = (verStr == "0.8") ? "RAML08" : "RAML10"; 
        var ramlFileType = "API";
        if(ramlFirstLine.length>2&&ramlFirstLine[2].trim().length>0){
            ramlFileType = ramlFirstLine[2].toUpperCase();
        }
        var kind = RamlFileKind[ramlFileType];
        if(kind==null){
            kind = RamlFileKind.FRAGMENT;
        }
        var extendsPath=null;
        if(kind==RamlFileKind.EXTENSION||kind==RamlFileKind.OVERLAY){
            extendsPath = extractMasterRef(f);
        }
        var ramlFile = new RamlFile(f,kind,version,extendsPath);
        ramlFiles.push(ramlFile);
    }
    if(ramlFiles.length==0){
        return null;
    }
    return new DirectoryContent(folderAbsPath,ramlFiles);
}

function extractMasterRef(filePath:string){
    var raml = index.loadRAMLSync(filePath,null);
    var extendsStr = raml.highLevel().attrValue("extends");
    if(!extendsStr){
        return null;
    }
    var result = path.resolve(path.dirname(filePath),extendsStr);
    return result;
}

export function getTests(dirContent:DirectoryContent):Test[] {

    var result:Test[] = [];
    if (dirContent.hasCleanAPIsOnly()) {
        result = dirContent.masterAPIs().map(x=>new Test(x.absolutePath()));
    }
    else if (dirContent.hasSingleExtensionOrOverlay()) {
        result = dirContent.extnsionsAndOverlays().map(x=>{
            var jsonPath = defaultJSONPath(x.extends());
            return new Test(x.absolutePath(),null,jsonPath);
        });
    }
    else if (dirContent.hasLibraries() && dirContent.masterAPIs().length == 0) {
        result = dirContent.libraries().map(x=>new Test(x.absolutePath()));
    }
    else if (dirContent.hasFragmentsOnly()) {
        result = dirContent.fragments().map(x=>new Test(x.absolutePath()));
    }
    else if (dirContent.hasExtensionsOrOverlaysAppliedToSingleAPI()) {
        var ordered = orderExtensionsAndOverlays(dirContent.extnsionsAndOverlays());
        if (ordered) {
            var apiPath = ordered[0].extends();
            var extensionsAndOverlays = ordered.map(x=>x.absolutePath());
            result = [ new Test(apiPath, extensionsAndOverlays) ];
        }
    }
    return result;
}

export class Test{

    constructor(
        public _masterPath:string,
        public _extensionsAndOverlays?:string[],
        public _jsonPath?:string){}

    masterPath():string{  return this._masterPath; }

    extensionsAndOverlays():string[]{ return this._extensionsAndOverlays; }

    jsonPath():string{ return this._jsonPath; }
}


export enum RamlFileKind{
    API, LIBRARY, EXTENSION, OVERLAY, FRAGMENT 
}

export class RamlFile{
    
    constructor(
        private _absPath:string,
        private _kind:RamlFileKind,
        private _ver:string,
        private _extends?:string){}
    
    absolutePath():string{
        return this._absPath.replace(/\\/g,'/');;
    }
    
    kind():RamlFileKind{
        return this._kind;
    }
    
    version():string{
        return this._ver;
    }

    extends():string{
        return this._extends;
    }
}

export class DirectoryContent{
    
    constructor(private dirAbsPath:string, private files:RamlFile[]){}
    
    absolutePath():string{
        return this.dirAbsPath.replace(/\\/g,'/');
    }

    allRamlFiles():RamlFile[]{
        return this.files;
    }

    extnsionsAndOverlays():RamlFile[]{
        return this.files.filter(x=>x.kind()==RamlFileKind.EXTENSION||x.kind()==RamlFileKind.OVERLAY);
    }

    masterAPIs():RamlFile[]{
        return this.files.filter(x=>x.kind()==RamlFileKind.API);
    }

    fragments():RamlFile[]{
        return this.files.filter(x=>x.kind()==RamlFileKind.FRAGMENT);
    }

    libraries():RamlFile[]{
        return this.files.filter(x=>x.kind()==RamlFileKind.LIBRARY);
    }

    hasCleanAPIsOnly():boolean{
        return this.extnsionsAndOverlays().length==0 && this.masterAPIs().length>0;
    }

    hasSingleExtensionOrOverlay():boolean{
        return this.extnsionsAndOverlays().length==1 && this.masterAPIs().length>0;
    }

    hasExtensionsOrOverlaysAppliedToSingleAPI():boolean{
        return this.extnsionsAndOverlays().length>0 && this.masterAPIs().length==1;
    }

    hasFragmentsOnly():boolean{
        return this.fragments().length == this.files.length;
    }

    hasLibraries():boolean{
        return this.libraries().length>0;
    }
}

export function defaultJSONPath(apiPath:string) {
    var dir = path.dirname(apiPath);
    var fileName = path.basename(apiPath).replace(".raml", "-tck.json");
    var str = path.resolve(dir, fileName);
    return str;
};

function orderExtensionsAndOverlays(ramlFiles:RamlFile[]):RamlFile[]{
    
    var indToFileMap:{[key:string]:RamlFile} = {};
    var pathToIndMap:{[key:string]:number} = {};
    for(var rf of ramlFiles){
        var fPath = rf.absolutePath();
        var fName = path.basename(fPath);
        var indStr = fName.replace(/([a-zA-Z]*)(\d*)(\.raml)/,"$2");
        indStr = indStr == "" ? "0" : "" + parseInt(indStr);
        var ind = parseInt(indStr);
        if(indToFileMap[indStr]){
            return null;
        }
        indToFileMap[indStr] = rf;
        pathToIndMap[rf.absolutePath()] = ind;
    }
    var sorted = _.sortBy(ramlFiles,x=>{
        return pathToIndMap[x.absolutePath()];
    });

    return sorted;
}

export function testAPI(
    apiPath:string, extensions?:string[],
    tckJsonPath?:string,
    regenerteJSON:boolean=false){

    if(apiPath){
        apiPath = testUtil.data(apiPath);
    }
    if(extensions){
        extensions = extensions.map(x=>testUtil.data(x));
    }
    if(!tckJsonPath){
        tckJsonPath = defaultJSONPath(apiPath);
    }
    else{
        tckJsonPath = testUtil.data(tckJsonPath);
    }
    var api = index.loadRAMLSync(apiPath,extensions);
    var expanded = api["expand"] ? api["expand"]() : api;
    (<any>expanded).setAttributeDefaults(true);
    var json = expanded.toJSON({rootNodeDetails:true});

    if(!tckJsonPath){
        tckJsonPath = defaultJSONPath(apiPath);
    }

    if(regenerteJSON) {
        fs.writeFileSync(tckJsonPath,JSON.stringify(json,null,2));
    }
    if(!fs.existsSync(tckJsonPath)){
        fs.writeFileSync(tckJsonPath,JSON.stringify(json,null,2));
        console.warn("FAILED TO FIND JSON: " + tckJsonPath);
    }

    var tckJson:any = JSON.parse(fs.readFileSync(tckJsonPath).toString());
    var pathRegExp = new RegExp('/errors\\[\\d+\\]/path');
    var messageRegExp = new RegExp('/errors\\[\\d+\\]/message');
    var diff = testUtil.compare(json,tckJson).filter(x=>{
        if(x.path.match(pathRegExp)){
            return false;
        }
        if(x.path.match(messageRegExp)){
            for(var mm of messageMappings){
                if(mm.match(x.value0,x.value1)){
                    return false;
                }
            }
        }
        return true;
    });

    if(diff.length==0){
    }
    else{
        console.warn("DIFFERENCE DETECTED FOR " + tckJsonPath);
        console.warn(diff.map(x=>x.message("actual","expected")).join("\n\n"));
        assert(false);
    }
}

export function generateMochaSuite(folderAbsPath:string,dstPath:string,dataRoot:string){

    var dirs = iterateFolder(folderAbsPath);
    var map:{[key:string]:Test[]} = {};
    for(var dir of dirs){
        var tests = getTests(dir);
        if(tests.length>0){
            var suiteFolder = path.resolve(dir.absolutePath(),"../").replace(/\\/g,'/');
            var arr = map[suiteFolder];
            if(!arr){
                arr = [];
                map[suiteFolder] = arr;
            }
            for(var t of tests){
                arr.push(t);
            }
        }
    }

    var suitePaths = Object.keys(map).sort();
    var suiteStrings:string[] = [];
    for(var suitePath of suitePaths){
        var title = suiteTitle(suitePath);
        if(!title){
            continue;
        }
        var suiteStr = dumpSuite(title,dataRoot,map[suitePath]);
        suiteStrings.push(suiteStr);
    }
    var content = fileContent(suiteStrings,dstPath);
    fs.writeFileSync(dstPath,content);
}
function suiteTitle(absPath:string){

    var ind = Math.max(absPath.indexOf("RAML10"),absPath.indexOf("RAML08"));
    if(ind<0){
        return null;
    }
    return absPath.substring(ind);
}

function dumpSuite(title:string,dataRoot:string,tests:Test[]):string{

    var dumpedTests = tests.map(x=>dumpTest(x,dataRoot));

    var testsStr = dumpedTests.join("\n\n");
    return`describe('${title}',function(){
    
${testsStr}
    
});`
}

function dumpTest(test:Test,dataRoot:string):string{

    var relMasterPath = path.relative(dataRoot,test.masterPath()).replace(/\\/g,'/');;

    var args = [ `"${relMasterPath}"` ];

    if(test.extensionsAndOverlays()) {
        var relArr = test.extensionsAndOverlays().map(x=>path.relative(dataRoot, x).replace(/\\/g,'/'));
        if (relArr.length > 0) {
            args.push("[ " + relArr.map(x=>`"${x}"`).join(", ") + " ]");
        }
    }
    var jsonPath = test.jsonPath() ? path.relative(dataRoot,test.jsonPath()).replace(/\\/g,'/'):null;
    if(jsonPath!=null){
        if(!test.extensionsAndOverlays()){
            args.push("null");
        }
        args.push(`"${jsonPath}"`);
    }

    return`    it("${path.basename(path.dirname(test.masterPath()))}", function () {
        this.timeout(15000);
        tckUtil.testAPI(${args.join(", ")});
    });`
}

var toIncludePath = function (workingFolder:any, absPath:any) {
    var relPath = path.relative(workingFolder, absPath).replace(/\\/g, "/");
    if (!util.stringStartsWith(relPath, ".")) {
        relPath = "./" + relPath;
    }
    return relPath;
};
export function projectFolder() {
    var folder = __dirname;
    while (!fs.existsSync(path.resolve(folder, "package.json"))) {
        folder = path.resolve(folder, "../");
    }
    return folder;
};
function fileContent(suiteStrings:string[],filePath:string) {

    var folder = projectFolder();
    var dstFolder = path.dirname(filePath);

    var tckUtilPath = path.resolve(folder,"./src/raml1/test/scripts/tckUtil");
    var typingsPath = path.resolve(folder,"typings/main.d.ts");
    var relTckUtilPath = toIncludePath(dstFolder, tckUtilPath);
    var relTypingsPath = toIncludePath(dstFolder,typingsPath);
    return `/**
 * ATTENTION !!! The file is generated. Manual changes will be overridden by the nearest build.
 */
/// <reference path="${relTypingsPath}" />
import tckUtil = require("${relTckUtilPath}")

describe('Complete TCK Test Set',function(){

${suiteStrings.join("\n\n")}

});

`
};
