import fsutil = require("../util/fsutil");
import path = require("path");
import fs = require('fs');
import util = require("../util/index");


const rootPath = path.join(__dirname, "../../");
const npmIgnorePath = path.resolve(rootPath,".npmignore");
const npmIgnore = fs.readFileSync(npmIgnorePath,"utf-8");
const ignoredPaths = npmIgnore.split("\n").filter(x=>{
   return util.stringStartsWith(x,"/dist");
}).map(x=>x.substring(1));

const destination = path.resolve(rootPath,"standalone-typings");
const source = path.resolve(rootPath,"dist");

fsutil.removeDirSyncRecursive(destination);
fsutil.copyDirSyncRecursive(
    destination,
    source,null,
        p=>{
       let rel = path.relative(rootPath,p).replace(/\\/g,"/");
       if(util.stringStartsWith(rel,"./")){
           rel = rel.substring(2);
       }
       for(let ip of ignoredPaths){
          if(util.stringStartsWith(rel,ip)){
             return false;
          }
       }
       if(!fs.lstatSync(p).isDirectory() && !util.stringEndsWith(rel,".d.ts")){
          return false;
       }
       return true;
    });