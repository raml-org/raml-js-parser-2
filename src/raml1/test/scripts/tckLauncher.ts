import fs = require("fs")
import path = require("path")
import tckUtil = require("./tckUtil")

var args = process.argv;
var dirPath = null;
var regenerteJSON = false;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=="-path" && i < args.length-2){
        dirPath = args[++i];
    }
    else if(args[i]=="-generate" && i < args.length-2){
        regenerteJSON = true;
    }
}
if(dirPath == null){
    dirPath = path.resolve(__dirname,"../data/TCK");
}
if(dirPath) {
    tckUtil.launchTests(dirPath,regenerteJSON);
}