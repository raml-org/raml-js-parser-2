import fs =require("fs");
import path=require("path")
var wrench=require("wrench")
import util=require("../../util/index")
import mkdirp=require("mkdirp")
let messageRegistry = require("../../../resources/errorMessages");
interface Module{
    name():string;
    dependencies():Module[];
    isExternal():boolean;
    content():string[]
    actualFolder():string
}

class ExistingModule implements Module{

    private static requiredTypings:string[] = [
        'main.d.ts'
    ]

    name():string {
        return this._name;
    }

    isExternal():boolean{return false}

    dependencies():Module[] {
        return this.parseDepencencies();
    }

    private parseDepencencies(){
        var lines:string[]=this.content();
        var modules:Module[]=[];
        lines.forEach(l=>{
            var mod:Module=this.moduleFromLine(l);
            if(mod){
                    modules.push(mod);
            }
        });
        return  modules;
    }

    private moduleFromLine(l):Module {
        var mod = null;
        var pos = l.indexOf("require" + "(");
        if (pos != -1) {
            var req = l.substr(pos + ("require" + "(").length + 1);
            var requireCode = req.substr(0, req.indexOf(")") - 1);
            var modulePath = this.resolve(requireCode);
            if (modulePath) {
                mod = new ExistingModule(this.resolveName(requireCode), modulePath)
            }
            else {
                mod = (new ExternalModule(requireCode));
            }
        }
        return mod;
    }
    private resolve(requireCode:string):string{
        var folder=this.depFolder();
        var ps=path.resolve(folder,requireCode+".ts");
        if (fs.existsSync(ps)){
            return ps
        }
        return null;
    }

    private depFolder():string {
        return this._depRoot!=null?this._depRoot:this.actualFolder();
    }

    actualFolder():string {
        return path.dirname(this._path)
    }
    private resolveName(requireCode:string):string{
        var p=requireCode.lastIndexOf("/");
        return p!=-1?requireCode.substr(p+1):requireCode;
    }


    private rewrittenContent():string{
        var lines:string[]=this.content();
        var rewrittenLines=[];
        var modules:Module[]=[];
        lines.forEach(l=>{
            var pos=l.indexOf("require"+"(");
            if (pos!=-1){
                var pre=l.substr(0,pos);
                var m=this.moduleFromLine(l);
                var endPos = l.indexOf(')',pos)+1;
                if (!m.isExternal()) {
                    var result = pre + "require('"+this.depPath()+ m.name() + "')" + l.substring(endPos).trim();
                    rewrittenLines.push(result);
                }
                else{
                    rewrittenLines.push(l);
                }
            }
            else{
                if (l.indexOf("/// <reference path=\"")!=-1){
                    ExistingModule.requiredTypings.forEach(
                            x => rewrittenLines.push('/// <reference path=\"' + this.depPath() + 'typings/' + path.basename(x) +'\" />'))
                }
                else{
                    rewrittenLines.push(l);
                }
            }
        });
        return rewrittenLines.join("\n")
    }

    protected depPath() {
        return "./deps/";
    }

    rewrite(set={}):void{
        var key = this._path
        if (!set[key]) {
            set[key] = true
            var deps = this.createDepFolder();
            this.dependencies().forEach(x=> {
                if (!x.isExternal()) {
                    var newPath = deps + "/" + x.name() + ".ts";
                    fs.writeFileSync(newPath, x.content().join("\n"))
                    var af = x.actualFolder();
                    new DepModule(x.name(), newPath, af).rewrite(set);
                }
            });
        }
        fs.writeFileSync(this._path,this.rewrittenContent());
    }

    protected createDepFolder():string {
        var deps = this.actualFolder() + "/deps";
        //if (!fs.existsSync(deps)) {
            try {
                mkdirp.sync(deps + "/typings/");

                var typingsPath = path.resolve( __dirname , '../../typings')
                var depsTypingsPath = path.resolve(deps,'typings')

                this.copyContent(typingsPath,depsTypingsPath)

                var tsd_d_ts_Path = path.resolve(depsTypingsPath, 'main.d.ts');
                var str:string = fs.readFileSync(tsd_d_ts_Path).toString()
                var levelUpStr = ''
                for(var i = 0 ; i++ < this.stepsToModulesDir ; levelUpStr += '../');
                str = str.replace(new RegExp('\\.\\./','g'),levelUpStr)
                fs.writeFileSync(tsd_d_ts_Path,str)
                //fs.readdirSync(depsTypingsPath).forEach(x=>console.log(x))
                //var np = __dirname + "/../../typings/q/Q.d.ts";
                //mkdirp.sync(deps + "/q/");
                //fs.writeFileSync(deps + "/q/Q.d.ts", fs.readFileSync(np).toString());
            }catch (e){
                console.log(e)
            }
        //}
        return deps;
    }

    //small change

    private copyContent(srcFolder:string,destFolder:string){
        wrench.copyDirSyncRecursive(srcFolder,destFolder, {forceDelete: true})
    }

    content():string[] {
        return fs.readFileSync(this._path).toString().split("\n");
    }

    constructor(private _name:string,private _path:string,private _depRoot=null,private stepsToModulesDir:number=3){

    }
}
class DepModule extends ExistingModule{

    constructor(name:string, path:string, depRoot) {
        super(name, path, depRoot);
    }

    protected depPath() {
        return "./";
    }

    protected createDepFolder():string {
        return this.actualFolder();
    }
}

class ExternalModule implements Module{
    actualFolder():string{
        throw new Error(messageRegistry.UNSUPPORTED_OPERATION_EXCEPTION.message)
    }
    name():string {
        return this._name;
    }

    isExternal():boolean {
        return true;
    }

    constructor(private _name:string) {
    }

    content():string[] {
        throw new Error(messageRegistry.UNSUPPORTED_OPERATION_EXCEPTION.message)
    }

    dependencies():Module[] {
        return [];
    }
}

export class DependencyManager {

    modules:{[key:string]:boolean} = {};

    constructor(private _rootPath:string = __dirname, private patchExternalOnly:boolean=false, private stepsToModulesDir:number = 3) {
    }

    updateDeps(path:string):void {
        new ExistingModule("dependencyManager", path, this._rootPath, this.stepsToModulesDir).rewrite();
    }

    transportDependencies(filePath:string, srcProjectRoot:string, dstProjectRoot:string, dstDepsFolder:string) {
        this.patchDeps(filePath, srcProjectRoot, this._rootPath, dstProjectRoot, dstDepsFolder, true);

        var srcTypingsPath = path.resolve(srcProjectRoot, 'typings');
        var dstTypingsPath = path.resolve(path.resolve(dstProjectRoot, dstDepsFolder), 'typings');
        mkdirp.sync(dstTypingsPath);
        wrench.copyDirSyncRecursive(srcTypingsPath, dstTypingsPath, {forceDelete: true});

        var tsd_d_ts_Path = path.resolve(dstTypingsPath, 'main.d.ts');
        var ts_d_ts_Content:string = fs.readFileSync(tsd_d_ts_Path).toString()
        var levelUpStr = ''
        for(var i = 0 ; i++ < this.stepsToModulesDir ; levelUpStr += '../');
        ts_d_ts_Content = ts_d_ts_Content.replace(/(\.\.\/)+/,levelUpStr);
        fs.writeFileSync(tsd_d_ts_Path,ts_d_ts_Content);

    }


    patchDeps(
        filePath:string,
        srcProjectRoot:string,
        dependencyBase:string,
        dstProjectRoot:string,
        dstDepsFolder:string,
        doPatch:boolean,
        processed:{[key:string]:boolean}={}) {

        var deps:DependencyOccurence[] = this.getDependencies(filePath,dependencyBase);
        deps.forEach(x=> {
            x.srcProjectRoot = srcProjectRoot;
            x.dstProjectRoot = dstProjectRoot;
            x.dstDepsFolder = dstDepsFolder;
        })
        if (doPatch) {
            var content = fs.readFileSync(filePath).toString();
            var prev = 0;
            var patched = '';
            deps.filter(x=>!(this.patchExternalOnly&&x.isInternal())).forEach(x=>{
                patched += content.substring(prev,x.start);
                patched += x.replacement();
                prev = x.end;
            });
            patched += content.substring(prev,content.length);
            fs.writeFileSync(filePath, patched);
        }
        deps.filter(x=>x.matchRule.isRecursive()&&!processed[x.getAbsoluteDestinationPath()]).forEach(x=>{
            x.copySync();
            processed[x.getAbsoluteDestinationPath()] = true;
            this.patchDeps(
                x.absPath,
                srcProjectRoot,
                path.dirname(x.absPath),
                dstProjectRoot,
                dstDepsFolder,
                false,
                processed )
        });
    }

    private matchRules:MatchRule[] = [
        new MatchRule(new RequireMatcher(), true, ['ts', 'json']),
        new MatchRule(new RequireResolveMatcher(), true),
        new MatchRule(new ReferenceMatcher(), false)
    ]

    getDependencies(filePath:string, dependencyBase:string):DependencyOccurence[] {
        var content:string = fs.readFileSync(filePath).toString();

        var result:DependencyOccurence[] = [];
        this.matchRules.forEach(x=>x.matcher().match(content).forEach(y=>{

            if (y.end <= y.start) {
                return;
            }
            var depStr = content.substring(y.start,y.end).trim();
            if (!util.stringStartsWith(depStr,'.')) {
                this.modules[depStr] = true;
                return;
            }
            var absPathBase = path.resolve(dependencyBase, depStr);
            var matched:boolean = false;
            x.extensions().forEach(ext=>{
                ext = util.stringStartsWith(ext,'.') || ext.length == 0 ? ext : '.' + ext;
                var absPath = absPathBase + ext;
                if (fs.existsSync(absPath)) {
                    result.push(new DependencyOccurence(depStr, y.start, y.end, x, absPath));
                    matched = true;
                }
            });
            if(!matched){
                this.modules[depStr] = true;
            }
        }));
        return result.sort((x,y)=>x.start-y.start);
    }

}

export class DependencyOccurence{

    constructor(path:string,start:number,end:number,matchRule:MatchRule, absPath?:string){
        this.path = path;
        this.start = start;
        this.end = end;
        this.matchRule = matchRule;
        this.absPath = absPath;
    }

    matchRule:MatchRule;

    path:string

    start:number

    end:number

    absPath:string

    srcProjectRoot:string

    dstProjectRoot:string

    dstDepsFolder:string

    isInternal():boolean{
        return util.stringStartsWith(this.path,'./');
    }

    patch(content:string):string{
        var requireStr = this.replacement();
        var result = content.substring(0, this.start) + requireStr + content.substr(this.end);
        return result;
    }

    replacement() {
        var absDstPath = this.getAbsoluteDestinationPath();
        var dstRelPath = absDstPath.substring(this.dstProjectRoot.length);
        dstRelPath = dstRelPath.replace(/\\/g, '/');
        if (dstRelPath.charAt(0) != '/') {
            dstRelPath = '/' + dstRelPath;
        }
        dstRelPath = '.' + dstRelPath;
        var requireStr = dstRelPath;
        var ind = requireStr.lastIndexOf('.');
        var ext = ind < 0 ? '' : requireStr.substring(ind+1);
        ind = ind < 0 ? requireStr.length : ind;
        if (this.matchRule.extensions().indexOf(ext)>=0) {
            requireStr = requireStr.substring(0, ind);
        }
        return requireStr;
    }

    copySync(){
        var absDstPath = this.getAbsoluteDestinationPath();
        var content = fs.readFileSync(this.absPath).toString();
        mkdirp.sync(path.dirname(absDstPath));
        fs.writeFileSync(absDstPath,content);
        if(util.stringEndsWith(absDstPath,'.ts')){
            var jsPath = absDstPath.substring(0,absDstPath.length-'.ts'.length)+'.js';
            if(fs.existsSync(jsPath)){
                fs.unlinkSync(jsPath);
            }
        }
    }

    getAbsoluteDestinationPath() {
        var srcRelPath = path.relative(this.srcProjectRoot,this.absPath);
        var absDstDepsPath = path.resolve(this.dstProjectRoot, this.dstDepsFolder);
        var absDstPath = path.resolve(absDstDepsPath, srcRelPath);
        return absDstPath;
    }
}

export class Match{

    constructor(start:number,end:number){
        this.start = start;
        this.end = end;
    }

    start:number

    end:number
}

export class MatchRule{

    constructor(private _matcher:Matcher,private _isRecursive:boolean, private _extensions:string[]=['']){}

    matcher():Matcher{ return this._matcher; }

    isRecursive():boolean{return this._isRecursive;}

    extensions():string[]{ return this._extensions; }
}

export interface Matcher{

    match(content:string):Match[]
}

class BasicMatcher implements Matcher{

    constructor (private startSeq:string[],private endSeq:string[]){}

    match(content:string):Match[]{

        var result:Match[] = [];
        var ind = 0;
        var match = this.nextMatch(content,ind);
        while(match){
            result.push(match);
            ind = match.end;
            match = this.nextMatch(content,ind);
        }
        return result;
    }

    private nextMatch(content:string,ind:number):Match{

        var sMatch = this.matchStringSequence(content,this.startSeq,ind);
        if(!sMatch){
            return null;
        }
        var eMatch = this.matchStringSequence(content,this.endSeq,sMatch.end);
        if(!eMatch){
            return null;
        }
        var matchStr = content.substring(sMatch.end,eMatch.start).trim();
        var start = content.indexOf(matchStr,sMatch.end);
        var end = start + matchStr.length;
        return new Match(start+1,end-1);//correction by +-1 is due to quotes
    }

    private matchStringSequence(content:string,seq:string[],ind:number):Match{

        var start = -1;
        var end = -1;

        for(var i = 0 ; i < seq.length; i++){
            var str = seq[i];
            var ind1 = content.indexOf(str,ind);
            if(ind1<0){
                ind = -1;
                break;
            }
            if(i>0&&content.substring(ind,ind1).trim().length>0){
                i = -1;
                continue;
            }
            else if (i==0){
                start = ind1;
            }
            ind = ind1 + str.length;
        }
        if(ind<0){
            return null;
        }
        end = ind;
        return new Match(start,end);
    }

}

class RequireMatcher extends BasicMatcher{
    constructor(){
        super([ 'require', '(' ], [ ')' ]);
    }
}

class RequireResolveMatcher extends BasicMatcher{
    constructor(){
        super([ 'require.resolve', '(' ], [ ')' ]);
    }
}

class ReferenceMatcher extends BasicMatcher{
    constructor(){
        super([ '///', '<', 'reference', 'path', '=' ], [ '/', '>' ]);
    }
}