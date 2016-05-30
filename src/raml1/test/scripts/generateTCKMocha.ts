/// <reference path="../../../../typings/main.d.ts" />
import path = require("path")
import tckUtil = require("./tckUtil")

var args = process.argv;
var tckDir = null;
var mochaFile = null;
var dataRoot = null;

for(var i = 0 ; i < args.length ; i++){
    if(i < args.length-1) {
        if (args[i] == "-tckDir") {
            tckDir = args[++i];
        }
        else if (args[i] == "-mochaFile") {
            mochaFile = args[++i];
        }
        else if (args[i] == "-dataRoot") {
            dataRoot = args[++i];
        }
    }
}
if(tckDir==null){
    tckDir = path.resolve(tckUtil.projectFolder(),"src/raml1/test/data/TCK");
}
if(mochaFile==null){
    mochaFile = path.resolve(tckUtil.projectFolder(),"src/raml1/test/TCK2.ts");
}
if(dataRoot==null){
    dataRoot = path.resolve(tckUtil.projectFolder(),"src/raml1/test/data")
}
tckUtil.generateMochaSuite(
    tckDir,
    mochaFile,
    dataRoot
);
