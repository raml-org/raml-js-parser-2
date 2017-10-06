import fs = require("fs");
import mkdirp = require("mkdirp");
import path = require("path");
import util = require("./index")

export interface PatternReplacementSet{
    [key:string]:{
        regexp?:RegExp
        map:{
            [key:string]:string}
    }
}

export interface CopyOptions{

    forceDelete?: boolean

    pathReplacements?:{[key:string]:string}

    contentReplacements?:{[key:string]:string}

    pathPatternReplacements?:PatternReplacementSet

    contentPatternReplacements?:PatternReplacementSet

    ignore?:string
}

export function copyDirSyncRecursive(
    to:string,
    from:string,
    opt?:CopyOptions,
    pathFilter?:(x:string)=>boolean,
    contentFilter?:(x:string)=>boolean):void{

    opt = opt||{};

    if(path.resolve(to)==path.resolve(from)){
        return;
    }

    if(opt.ignore && new RegExp(opt.ignore).exec(from)!=null){
        return;
    }

    var fd = opt.forceDelete;

    if(!fs.lstatSync(from).isDirectory()){

        to = patch(to, to, opt.pathReplacements,opt.pathPatternReplacements);
        if(!fd && fs.existsSync(to)){
            return;
        }
        mkdirp.sync(path.dirname(to));

        var buffer = fs.readFileSync(from);
        if(opt.contentReplacements||opt.contentPatternReplacements||contentFilter){
            var content = buffer.toString();
            var contentLegal = contentFilter ? contentFilter(content) : true;
            if(contentLegal) {
                content = patch(to, content, opt.contentReplacements, opt.contentPatternReplacements);
                fs.writeFileSync(to, content);
            }
        }
        else{
            fs.writeFileSync(to, buffer);
        }
        return;
    }
    fs.readdirSync(from).forEach(x=>{

        var fromChild = path.resolve(from,x);
        if(pathFilter && !pathFilter(fromChild)){
            return;
        }
        var toChild = path.resolve(to,x);
        copyDirSyncRecursive(toChild,fromChild,opt,pathFilter,contentFilter);
    });
}

export function removeDirSyncRecursive(dirPath:string) {

    if(!fs.existsSync(dirPath)){
        return;
    }
    if(!fs.lstatSync(dirPath).isDirectory()){
        fs.unlinkSync(dirPath);
        return;
    }
    fs.readdirSync(dirPath).map(x=>path.resolve(dirPath,x)).forEach(x=>removeDirSyncRecursive(x));
    fs.rmdirSync(dirPath);
}


var patch = function (
    filePath:string,
    target:string,
    replacements:{[key:string]:string},
    patternReplacements:PatternReplacementSet) {

    if(patternReplacements){
        var regexps = Object.keys(patternReplacements);
        for(var i = 0 ; i < regexps.length; i++){
            var str = regexps[i];
            var regexp:RegExp = patternReplacements[str].regexp;
            if(regexp == null){
                regexp = new RegExp(str);
                patternReplacements[str].regexp = regexp;
            }
            if(regexp.exec(filePath)!=null){
                return util.replaceMap(target,patternReplacements[str].map);
            }
        }
    }

    if(replacements) {
        return util.replaceMap(target, replacements);
    }
    return target;
};

export function copyFileSync(sourcePath: string, targetPath : string) {

    var bufferLength = 16384;
    var buffer = new Buffer(bufferLength);
    var sourceDescriptor = fs.openSync(sourcePath, 'r');
    var targetDescriptor = fs.openSync(targetPath, 'w');

    var numBytes = fs.readSync(sourceDescriptor, buffer, 0, bufferLength, 0);
    var currentPosition = 0;

    while(numBytes > 0) {
        (<any>fs).writeSync(targetDescriptor,buffer,0,numBytes);

        currentPosition += numBytes;
        numBytes = fs.readSync(sourceDescriptor, buffer, 0, bufferLength, currentPosition);
    }

    fs.closeSync(sourceDescriptor)
    fs.closeSync(targetDescriptor)
}