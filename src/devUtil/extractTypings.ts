import fsutil = require("../util/fsutil");
import path = require("path");
import fs = require('fs');
import util = require("../util/index");

const rootPath = path.join(__dirname, "../../");
const destination = path.resolve(rootPath,"standalone-typings");
fsutil.removeDirSyncRecursive(destination);

const parserSource = rootPath;
const parserDestination = path.resolve(destination,"raml-1-parser");
const parserRelativeSourcePath = "dist";

const definitionSystemSource = path.resolve(rootPath,"../raml-definition-system");
const definitionSystemDestination = path.resolve(destination,"raml-definition-system");
const definitionSystemRelativeSourcePath = "dist";

const typeSystemSource = path.resolve(rootPath,"../raml-typesystem");
const typeSystemDestination = path.resolve(destination,"raml-typesystem");
const typeSystemRelativeSourcePath = "dist/src";

const yamlParserSource = path.resolve(rootPath,"../yaml-ast-parser");
const yamlParserDestination = path.resolve(destination,"yaml-ast-parser");
const yamlParserRelativeSourcePath = "dist/src";

function processModule(moduleSource:string,moduleDestination:string,relativeSourcePath:string) {

    const source = path.resolve(moduleSource, relativeSourcePath);
    const packageJsonPath = path.resolve(moduleSource,"package.json");
    const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath,"utf-8"));

    const typingsRelPath = packageJsonContent.typings || packageJsonContent.types;
    const typingsAbsPath = path.resolve(moduleSource,typingsRelPath);

    let arr = [typingsAbsPath];
    let checked:{[key:string]:boolean} = {};
    for(let p of arr){
        let relPath = path.relative(source,p);
        let absDstPath = path.resolve(moduleDestination,relPath);
        fsutil.copyFileSync(p,absDstPath);
        let content = fs.readFileSync(p,"utf-8").split("\n").map(x=>{
            x =x.trim();
            let rPath:string;
            if(x.indexOf("require")>=0){
                let ind = x.indexOf("require");
                if(ind<0){
                    return null;
                }
                let lb = x.indexOf("(",ind);
                if(lb<0){
                    return null;
                }
                lb++;
                let rb = x.indexOf(")",lb);
                if(rb<0){
                    return null;
                }
                rPath = x.substring(lb,rb).trim();
            }
            else if(util.stringStartsWith(x,"export")){
                let ind = x.indexOf("from");
                if(ind<0){
                    return null;
                }
                ind += "from".length;
                rPath = x.substring(ind).trim()
                if(util.stringEndsWith(rPath,";")){
                    rPath = rPath.substring(0,rPath.length-1);
                }
            }
            if(rPath && ((util.stringStartsWith(rPath,"\"")&&util.stringEndsWith(rPath,"\""))
                ||(util.stringStartsWith(rPath,"'")&&util.stringEndsWith(rPath,"'")))){
                rPath = rPath.substring(1,rPath.length-1).trim();
                return rPath;
            }
            return null;
        }).filter(x=>x!=null);

        for(let rPath of content){
            rPath+=".d.ts";
            let rAbsPath = path.resolve(path.dirname(p),rPath).replace(/\\/g,'/');
            if(checked[rAbsPath]){
                continue;
            }
            checked[rAbsPath] = true;
            if(!fs.existsSync(rAbsPath)||fs.lstatSync(rAbsPath).isDirectory()){
                continue;
            }
            arr.push(rAbsPath);
        }
    }
}

processModule(parserSource,parserDestination,parserRelativeSourcePath);
processModule(definitionSystemSource,definitionSystemDestination,definitionSystemRelativeSourcePath);
processModule(typeSystemSource,typeSystemDestination,typeSystemRelativeSourcePath);
processModule(yamlParserSource,yamlParserDestination,yamlParserRelativeSourcePath);