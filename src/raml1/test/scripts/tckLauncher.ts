import fs = require("fs")
import path = require("path")
import tckUtil = require("./tckUtil")

var args = process.argv;
var dirPath = null;
var reportPath = null;
var regenerteJSON = false;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=="-path" && i < args.length-1){
        dirPath = args[++i];
    }
    else if(args[i]=="-report" && i < args.length-1){
        reportPath = args[++i];
    }
    else if(args[i]=="-generate"){
        regenerteJSON = true;
    }
}
if(dirPath == null){
    dirPath = path.resolve(__dirname,"../data/TCK");
}
if(dirPath) {
    tckUtil.launchTests(dirPath,reportPath,regenerteJSON);
}