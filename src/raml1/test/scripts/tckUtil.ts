/// <reference path="../../../../typings/main.d.ts" />
import fs = require("fs")
import path = require("path")
import index = require("../../../index")
import testUtil = require("../test-utils")
import hlImpl = require("../../highLevelImpl");
import mappings = require("./messageMappings")
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

export class TestResult{
    constructor(
        public apiPath:string,
        public json:any,
        public success:boolean,
        public tckJsonPath:string,
        public diff:any[]){}
}

var messageMappings:MessageMapping[] = mappings.map(x=>
    new MessageMapping(x.messagePatterns.map(x=>x.pattern)));

export function launchTests(folderAbsPath:string,reportPath:string,regenerateJSON:boolean,callTests:boolean){

    var count = 0;
    var passed = 0;
    var report:any=[];
    
    var dirs = iterateFolder(folderAbsPath);
    for(var dir of dirs){
        var tests = getTests(dir);
        for(var test of tests){
            count++;
            var result = testAPI(test.masterPath(), test.extensionsAndOverlays(), test.jsonPath(), regenerateJSON, callTests, false);
            if(!result){
                continue;
            }
            if(result.success){
                passed++;
                console.log('js parser passed: ' + result.apiPath);
            }
            else{
                console.warn('js parser failed: ' + result.apiPath);
            }
            var reportItem = {
                apiPath: result.apiPath,
                errors: result.diff,
                tckJsonPath: result.tckJsonPath,
                passed: result.success
            };
            report.push(reportItem);
        }
    }
    if(callTests) {
        console.log("total tests count: " + count);
        console.log("tests passed: " + passed);
        if (reportPath) {
            console.log("report file: " + reportPath);
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
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
        var ramlFirstLine = hlImpl.ramlFirstLine(content);
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

export function testAPILibExpand(
    apiPath:string, extensions?:string[],
    tckJsonPath?:string,
    regenerteJSON:boolean=false,
    callTests:boolean=true,
    doAssert:boolean = true){
    
    testAPI(
        apiPath,
        extensions,
        tckJsonPath,
        regenerteJSON,
        callTests,
        doAssert,true);
    
}

var pathReplacer = function (str1:string,str2:string) {
    var l = str1.length;
    return function (key, value) {
        if(value) {
            if (typeof(value) == "object") {
                for (var k of Object.keys(value)) {
                    if (k.substring(0, l) == str1) {
                        var newKey = str2 + k.substring(l);
                        var val = value[k];
                        delete value[k];
                        value[newKey] = val;
                    }
                }
            }
            else if (typeof(value) == "string") {
                value = value.split(str1).join(str2);
            }
        }
        return value;
    };
};
var serializeTestJSON = function (tckJsonPath:string, json:any) {
    var copy = JSON.parse(JSON.stringify(json));
    var rootPath = "file://"+testUtil.data("").replace(/\\/g,"/");
    var replacer = pathReplacer(rootPath,"__$$ROOT_PATH__");
    fs.writeFileSync(tckJsonPath, JSON.stringify(copy, replacer, 2));
};
var readTestJSON = function (tckJsonPath:string) {    
    var rootPath = "file://"+testUtil.data("").replace(/\\/g,"/");
    var replacer = pathReplacer("__$$ROOT_PATH__",rootPath);
    return JSON.parse(fs.readFileSync(tckJsonPath).toString(),replacer);
};
export function testAPI(
    apiPath:string, extensions?:string[],
    tckJsonPath?:string,
    regenerteJSON:boolean=false,
    callTests:boolean=true,
    doAssert:boolean = true,
    expandLib:boolean = false):TestResult{

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
    var expanded = api["expand"] ? api["expand"](expandLib) : api;

    (<any>expanded).setAttributeDefaults(true);
    var json = expanded.toJSON({rootNodeDetails:true});

    if(!tckJsonPath){
        tckJsonPath = defaultJSONPath(apiPath);
    }

    if(regenerteJSON) {
        serializeTestJSON(tckJsonPath, json);
    }
    if(!fs.existsSync(tckJsonPath)){
        serializeTestJSON(tckJsonPath, json);
        if(!callTests){
            console.log("TCK JSON GENERATED: " + tckJsonPath);
            return;
        }
        console.warn("FAILED TO FIND TCK JSON: " + tckJsonPath);
    }
    if(!callTests){
        return;
    }


    var tckJson:any = readTestJSON(tckJsonPath);
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

    var success = false;
    var diffArr = [];
    if(diff.length==0){
        success = true;
    }
    else{
        console.warn("DIFFERENCE DETECTED FOR " + tckJsonPath);
        console.warn(diff.map(x=>x.message("actual","expected")).join("\n\n"));
        if(doAssert) {
            assert(false);
        }
        diffArr = diff.map(x=>{
            return {
                "path": x.path,
                "comment": x.comment,
                "actual" : x.value0,
                "expected" : x.value1
            }
        });
    }
    return new TestResult(apiPath,tckJson,success,tckJsonPath,diffArr);
}

export function generateMochaSuite(
    folderAbsPath:string,
    dstPath:string,
    dataRoot:string,
    mochaSuiteTitle:string,
    libExpand:boolean=false){

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
        var title = suiteTitle(suitePath,folderAbsPath);
        if(title==null){
            continue;
        }
        var suiteStr = dumpSuite(title,dataRoot,map[suitePath],libExpand);
        suiteStrings.push(suiteStr);
    }
    var content = fileContent(suiteStrings,dstPath,mochaSuiteTitle);
    fs.writeFileSync(dstPath,content);
}
function suiteTitle(absPath:string,dataRoot:string){

    var title = absPath.substring(dataRoot.length);
    if(title.length>0&&title.charAt(0)=="/"){
        title = title.substring(1);
    }
    return title;
}

function dumpSuite(title:string,dataRoot:string,tests:Test[],libExpand:boolean):string{

    var dumpedTests = tests.map(x=>dumpTest(x,dataRoot,libExpand));

    var testsStr = dumpedTests.join("\n\n");
    return`describe('${title}',function(){
    
${testsStr}
    
});`
}

function dumpTest(test:Test,dataRoot:string,libExpand:boolean):string{

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

    var testMethod = libExpand ? 'testAPILibExpand' : 'testAPI';

    return`    it("${path.basename(path.dirname(test.masterPath()))}/${path.basename(test.masterPath())}", function () {
        this.timeout(15000);
        tckUtil.${testMethod}(${args.join(", ")});
    });`
}

var toIncludePath = function (workingFolder:any, absPath:any) {
    var relPath = path.relative(workingFolder, absPath).replace(/\\/g, "/");
    if (!relPath || relPath.charAt(0)!=".") {
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
function fileContent(suiteStrings:string[],filePath:string,title:string) {

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

describe('${title}',function(){

${suiteStrings.join("\n\n")}

});

`
};