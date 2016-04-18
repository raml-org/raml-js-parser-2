/// <reference path="../../../typings/main.d.ts" />
import lowlevel=require("../lowLevelAST")
import highlevel=require("../highLevelAST")
import path=require("path")
import fs=require("fs")
import yaml=require("yaml-ast-parser")
import _=require("underscore")
import textutil = require('../../util/textutil')
import hli=require("../highLevelImpl");
import services=require("../definition-system/ramlServices");
import rr=require("./resourceRegistry")
import util = require("../../util/index")
import URL = require("url")
import refResolvers = require("./includeRefResolvers")
import schemes = require('../../util/schemaUtil');
import resolversApi = require("./resolversApi")

var Error=yaml.YAMLException
export var Kind={
    SCALAR:yaml.Kind.SCALAR
}
export class MarkupIndentingBuffer {

    text: string = '';
    indent: string;

    constructor(indent: string) {
        this.indent = indent;
    }

    isLastNL() {
        return this.text.length > 0 && this.text[this.text.length-1] == '\n';
    }

    addWithIndent(lev: number, s: string) {
        if(this.isLastNL()) {
            this.text += textutil.indent(lev);
            this.text += this.indent;
        }
        this.text += s;
    }

    addChar(ch: string) {
        if(this.isLastNL()) {
            this.text += this.indent;
        }
        this.text += ch;
    }

    append(s: string) {
        for(var i=0; i<s.length; i++) {
            this.addChar(s[i]);
        }
    }

}

export class CompilationUnit implements lowlevel.ICompilationUnit{

    constructor(private _path,private _content,private _tl,private _project:Project, private _apath:string){

    }
    private stu:boolean;
    private _lineMapper:lowlevel.LineMapper;

    highLevel():highlevel.IParseResult{
        return hli.fromUnit(this);
    }
    isStubUnit(){
        return this.stu;
    }
    resolveAsync(p:string):Promise<lowlevel.ICompilationUnit>{
        var unit=this._project.resolveAsync(this._path,p);
        return unit;
    }


    getIncludeNodes(): lowlevel.ILowLevelASTNode[]
    {
        var ast=<ASTNode>this.ast();
        var arr:lowlevel.ILowLevelASTNode[] = [];
        ast.gatherIncludes(arr);
        return arr;
    }
    cloneToProject(p:Project){
        var newUnit=new CompilationUnit(this._path,this._content,this._tl,p,this._apath);

        return newUnit;
    }
    clone(){
        var newUnit=new CompilationUnit(this._path,this._content,this._tl,this.project(),this._apath);
        return newUnit;
    }
    stub(){
        var newUnit=new CompilationUnit(this._path,this._content,this._tl,this.project(),this._apath);
        newUnit.stu=true;
        return newUnit;
    }

    isDirty(){
        return false;
    }




    absolutePath(){
        return this._apath
    }

    isRAMLUnit():boolean{
        var en=path.extname(this._path);
        return en=='.raml'||en=='.yaml'||en=='.yml'
    }

    contents():string {
        return this._content;
    }

    resolve(p:string):lowlevel.ICompilationUnit {
        if (typeof p!="string")
        {
            p=""+p;
        }
        var unit=this._project.resolve(this._path,p);
        return unit;
    }

    path():string {
        return this._path;
    }
    private errors:Error[];
    lexerErrors():Error[]{
        if (this.errors==null){
            this.ast();
        }
        return this.errors;
    }

    ast():ASTNode{
        if(this._node){
            return this._node;
        }
        try {
            var result = <yaml.YAMLNode><any>yaml.load(this._content, {});
            this.errors=result.errors;
            this.errors.forEach(x=>{
                if ((<any>x).mark) {
                    (<any>x).mark.filePath = this.absolutePath();
                }
            })
            this._node = new ASTNode(result, this, null, null, null);
            this._node._errors=this.errors;
            return this._node;
        }catch (e){
            this.errors=[];
            this.errors.push(new Error(e.message))
            //console.log(this._content)
            //console.log(e)
            this._node=null;
            return this._node
        }
    }

    private _node:ASTNode;

    isTopLevel():boolean {
        return this._tl;
    }
    updateContent(n:string){
        this._content=n;
        this.errors=null;
        this._node=null;//todo incremental update
        this._lineMapper = null;

    }
    updateContentSafe(n:string){
        this._content=n;
        this._lineMapper = null;
    }


    project():Project{
        return this._project;
    }

    lineMapper():lowlevel.LineMapper{
        if(this._lineMapper==null){
            this._lineMapper = new lowlevel.LineMapperImpl(this.contents(),this.absolutePath());
        }
        return this._lineMapper;
    }

    //ramlVersion():string{
    //    return this._ramlVersion;
    //}

}

/**
 * @hidden
 **/
export interface ExtendedFSResolver extends resolversApi.FSResolver{

    /**
     * List directory synchronosly
     * @param path Directory path
     * @return Names list of files located in the directory
     **/
    list(path:string):string[]

    /**
     * List directory asynchronosly
     * @param path Directory path
     * @return Names list of files located in the directory
     **/
    listAsync(path:string):Promise<string[]>
}

export type Response=resolversApi.Response;



var XhrSync = require('xmlhttprequest').XMLHttpRequest;
var XhrAsync = require('xhr2').XMLHttpRequest;

export class XMLHttpRequestWrapper {
    private xhr;

    onload;

    onerror;

    async;

    open(method, url, async) {
        this.xhr = async ? new XhrAsync() : new XhrSync();

        this.async = async;

        this.xhr.open(method, url, async);
    }

    setRequestHeader(name, value) {
        this.xhr.setRequestHeader(name, value);
    }

    getResponseHeader(name) {
        return this.xhr.getResponseHeader(name);
    }

    getAllResponseHeaders() {
        return this.xhr.getAllResponseHeaders();
    }

    send(content) {
        this.xhr.onload = () => this.onResponse(false);
        this.xhr.onerror = () => this.onResponse(true);

        this.xhr.send(content);
    }

    statusText;

    responseText;

    responseType;

    status;

    private onResponse(isError) {
        this.statusText = this.xhr.statusText;
        this.responseText = this.xhr.responseText;
        this.responseType = this.xhr.responseType;
        this.status = this.xhr.status;

        if(isError && this.onerror) {
            this.onerror();

            return;
        }

        if(this.onload) {
            this.onload();
        }
    }
}

export function buildXHR() {
    return new XMLHttpRequestWrapper();
}
export class SimpleExecutor {

    constructor(){}

    execute(req:har.Request,doAppendParams:boolean=true):har.Response {
        var xhr = buildXHR();
        var url = req.url;
        if(doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        xhr.open(req.method, url, false);
        this.doRequest(req,xhr);
        //rheaders=xhr.getAllResponseHeaders();
        var status = xhr.status;
        if(status>300&&status<400){
            var locHeader = xhr.getResponseHeader('location');
            if(locHeader){
                req.url = locHeader;
                return this.execute(req,false)
            }
        }
        var response:har.Response={
            status: status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders().split('\n').map(x=>{
                var ind = x.indexOf(':');
                return{
                    name : x.substring(0,ind).trim(),
                    value : x.substring(ind+1).trim()
                }
            }),
            content:{
                text:xhr.responseText,
                mimeType:xhr.responseType
            }
        };
        return response;
    }

    private appendParams(req, url):string {
        var gotQueryParams = (req.queryString && req.queryString.length > 0);
        if (gotQueryParams) {
            url = url + '?';
            var arr:string[] = [];
            if (gotQueryParams) {
                arr = arr.concat(req.queryString.map(q=> {
                    return encodeURIComponent(q.name) + '=' + encodeURIComponent(q.value)
                }))
            }
            url += arr.join('&');
        }
        return url;
    }


    log(varName:string,value:any){
    }

    executeAsync(req:har.Request,doAppendParams:boolean = true):Promise<har.Response> {
        var xhr = buildXHR();
        var url=req.url;
        if(doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        var outer=this;
        return new Promise(function(resolve, reject) {

            xhr.open(req.method, url, true);
            xhr.onload = function() {
                var status = xhr.status;

                var response:har.Response={
                    status: status,
                    statusText: xhr.statusText,
                    headers: xhr.getAllResponseHeaders().split('\n').map(x=>{
                        var ind = x.indexOf(':');
                        return{
                            name : x.substring(0,ind).trim(),
                            value : x.substring(ind+1).trim()
                        }
                    }),
                    content:{
                        text:xhr.responseText,
                        mimeType:xhr.responseType
                    }
                };
                resolve(response);
            };
            xhr.onerror = function() {
                reject(new Error("Network Error"));
            };

            outer.doRequest(req, xhr);
        });
    }

    private doRequest(req, xhr) {
        if (req.headers) {
            req.headers.forEach(x=>xhr.setRequestHeader(x.name, x.value))
        }
        if (req.postData) {
            if (req.postData.params) {
                var body = req.postData.params.map(p=>encodeURIComponent(p.name)+'='+encodeURIComponent(p.value)).join('&');
                xhr.send(body);
            }
            else {
                xhr.send(req.postData.text);
            }
        }
        else {
            xhr.send();
        }
    }
}

declare var atom;

export class HTTPResolverImpl implements resolversApi.HTTPResolver {

    private executor:SimpleExecutor = new SimpleExecutor();

    getResource(url:string):Response{
        if (typeof atom !== 'undefined' && atom != null){
            var cached=rr.get(url);
            if (cached){
                return cached;
            }
            rr.addNotify(url)
            try {
                var resultWithCallback = {
                    content: ""
                }

                this.getResourceAsync(url).then(x=> {
                    try {
                        if(x.errorMessage) {
                            rr.set(url,{content: null,errorMessage:null});
                        } else {
                            x.errorMessage = null;

                            rr.set(url, x);
                        }
                    } finally {
                        if((<any>resultWithCallback).callback) {
                            (<any>resultWithCallback).callback(rr.get(url));
                        }

                        rr.removeNotity(url);
                    }
                },e=> {
                    rr.set(url,{content: null,errorMessage:null});

                    if((<any>resultWithCallback).callback) {
                        (<any>resultWithCallback).callback(rr.get(url));
                    }

                    rr.removeNotity(url);
                })

                return resultWithCallback;
            } catch (e){
                console.log("Error")
                console.log(e);
            }
        }
        var response = this.executor.execute({
            method: 'get',
            url: url
        });
        if(!response){
            throw new Error("Unable to execute GET " + url);
        }
        var result = this.toResponse(response, url);
        return result;
    }

    getResourceAsync(url:string):Promise<Response>{

        return this.executor.executeAsync({
            method: 'get',
            url: url
        }).then(x=>{
            if(!x){
                return Promise.reject(new Error("Unable to execute GET " + url));
            }
            var result = this.toResponse(x, url);
            return result;
        },x=>{
            return Promise.reject(new Error("Unable to execute GET " + url));
        });
    }

    private toResponse(response, url):Response {
        var msg:string = null;
        if (response.status >= 400) {
            msg = "GET " + url + "\nreturned error: " + response.status;
            if (response.statusText) {
                msg += " " + response.statusText;
            }
        }
        var content:string = null;
        if (response.content && response.content.text) {
            content = response.content.text;
        }
        var result = {
            content: content,
            errorMessage: msg
        };
        return result;
    }
}

export class FSResolverImpl implements ExtendedFSResolver{


    content(path:string):string{
        if (typeof path!="string"){
            path=""+path;
        }
        if (!fs.existsSync(path)){
            return null;
        }
        try {
            return fs.readFileSync(path).toString();
        } catch (e){
            return null;
        }
    }

    list(path:string):string[]{
        return fs.readdirSync(path);
    }

    contentAsync(path:string):Promise<string>{

        return new Promise(function(resolve, reject) {

            fs.readFile(path,(err,data)=>{
                if(err!=null){
                    return reject(err);
                }
                var content = data.toString();
                resolve(content);
            });
        });
    }

    listAsync(path:string):Promise<string[]>{
        return new Promise(function(reject,resolve){
            fs.readdir(path,(err,files)=>{
                if(err!=null){
                    return reject(err);
                }
                resolve(files);
            });
        });
    }
}
function copyNode(n:yaml.YAMLNode):yaml.YAMLNode{
    if (n==null){
        return null;
    }
    switch (n.kind){
        case yaml.Kind.SCALAR:
            return  {
                errors:[],
                startPosition:n.startPosition,
                endPosition:n.endPosition,
                value:(<yaml.YAMLScalar>n).value,
                kind:yaml.Kind.SCALAR,
                parent:n.parent
            }
        case yaml.Kind.MAPPING:
            var map=(<yaml.YAMLMapping>n)
            return {
                errors:[],
                key: copyNode(map.key),
                value: copyNode(map.value),
                startPosition:map.startPosition,
                endPosition:map.endPosition,
                kind:yaml.Kind.MAPPING,
                parent:map.parent
            }

        case yaml.Kind.MAP:
            var ymap=(<yaml.YamlMap>n)
            return {
                errors:[],
                startPosition:n.startPosition,
                endPosition:n.endPosition,
                mappings:ymap.mappings.map(x=>copyNode(x)),
                kind:yaml.Kind.MAP,
                parent:ymap.parent
            }
    }
    return n;
}


var innerShift = function (offset:number, yaNode:yaml.YAMLNode, shift:number) {
    if(!yaNode) return;
    if (yaNode.startPosition >= offset) {
        yaNode.startPosition += shift;
    }
    if (yaNode.endPosition > offset) {
        yaNode.endPosition += shift;
    }
    //this kind is a separate case
    if (yaNode.kind == yaml.Kind.MAPPING) {
        var m = <yaml.YAMLMapping>yaNode;
        innerShift(offset,m.key,shift);
        innerShift(offset,m.value,shift);
    }
};

function splitOnLines(text:string):string[]{
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}
//TODO IMPROVE INDENTS
function stripIndent(text:string,indent:string){
    var lines = splitOnLines(text);
    var rs=[];
    for (var i=0;i<lines.length;i++){
        if (i==0){
            rs.push(lines[0]);
        }
        else{
            rs.push(lines[i].substring(indent.length));
        }
    }
    return rs.join("");
}


var leadingIndent = function (node:lowlevel.ILowLevelASTNode, text:string) {
    var leading = "";
    var pos = node.start() - 1;
    //if(pos > 0 && text[pos] == ' ' && text[pos-1] == '-') {
    //    // seq here
    //    pos -= 2;
    //}
    while (pos > 0) {
        var ch = text[pos];
        //if (ch == '\r' || ch == '\n' || ch != ' ') break;
        //console.log('char: [' + ch + ']');
        if (ch != ' ' && ch != '-') break;
        leading = ' ' + leading;
        pos--;
    }
    return leading;
};
function indent(line:string){
    var rs="";
    for (var i=0;i<line.length;i++){
        var c=line[i];
        if (c=='\r'||c=='\n'){
            continue;
        }
        if (c==' '||c=='\t'){
            rs+=c;
            continue;
        }
        break;
    }
    return rs;
}
function indentLines(s:string,indent:string){
    return s.split("\n").map(x=>{
            if (x.trim().length==0){
                return x;
            }
            return  indent+x}
    ).join("\n")
}
function extraIndent(text:string,indent:string):string{
    var lines = splitOnLines(text);
    var rs=[];
    for (var i=0;i<lines.length;i++){
        if (i==0){
            rs.push(lines[0]);
        }
        else{
            if (lines[i].trim().length>0) {
                rs.push(indent+lines[i] );
            }
            else{
                rs.push("")
            }
        }
    }
    return rs.join("");
}

export class Project implements lowlevel.IProject{

    private listeners:lowlevel.IASTListener[]=[]
    private tlisteners:lowlevel.ITextChangeCommandListener[]=[]

    private pathToUnit:{[path:string]:CompilationUnit}={}

    /**
     *
     * @param rootPath - path to folder where your root api is located
     * @param resolver
     * @param _httpResolver
     */
    constructor(private rootPath:string,private resolver?:resolversApi.FSResolver,private _httpResolver?:resolversApi.HTTPResolver){
        if(this.resolver == null){
            this.resolver = new FSResolverImpl();
        }
        if(this._httpResolver == null){
            this._httpResolver = new HTTPResolverImpl();
        }
    }

    cloneWithResolver(newResolver:resolversApi.FSResolver,httpResolver:resolversApi.HTTPResolver=null):Project{
        var newProject=new Project(this.rootPath,newResolver,httpResolver?httpResolver:this._httpResolver);
        for (var unitPath in this.pathToUnit){
            newProject.pathToUnit[unitPath]=this.pathToUnit[unitPath].cloneToProject(newProject);
        }
        return newProject;
    }

    setCachedUnitContent(pth:string,cnt:string,tl:boolean=true):CompilationUnit{
        var relPath = pth;
        var apath=toAbsolutePath(this.rootPath,pth);
        var unit=new CompilationUnit(relPath,cnt,tl,this,apath);
        this.pathToUnit[apath]=unit;
        return unit;
    }
    resolveAsync(unitPath:string, pathInUnit:string): Promise<lowlevel.ICompilationUnit>{
        if(!pathInUnit){
            return Promise.reject(new Error("Unit path is null"));
        }

        var includeReference = refResolvers.getIncludeReference(pathInUnit);

        var oldPath = pathInUnit;

        if(includeReference) {
            pathInUnit = includeReference.getIncludePath();
        }

        var absPath = this.buildPath(pathInUnit, unitPath);

        if(includeReference) {
            var result;

            var refPath = path.dirname(toAbsolutePath(this.rootPath, unitPath)) + '/' + includeReference.encodedName();

            if (this.pathToUnit[refPath]) {
                result = this.pathToUnit[refPath];
            } else {
                this.pathToUnit[refPath] = new CompilationUnit(includeReference.encodedName(), refResolvers.resolveContents(oldPath), false, this, refPath);

                result = this.pathToUnit[refPath];
            }

            this.pathToUnit[absPath] ? Promise.resolve(result).then((unit: CompilationUnit) => {
                return result;
            }) : this.unitAsync(absPath, true).then((unit: CompilationUnit) => {
                this.pathToUnit[absPath] = unit;

                return result;
            });
        }

        return this.unitAsync(absPath,true);
    }

    resolve(unitPath:string,pathInUnit:string):CompilationUnit{
        if(!pathInUnit){
            return null;
        }

        var includeReference = refResolvers.getIncludeReference(pathInUnit);

        var oldPath = pathInUnit;

        if(includeReference) {
            pathInUnit = includeReference.getIncludePath();
        }

        var absPath = this.buildPath(pathInUnit, unitPath);

        if(includeReference) {
            if(!this.pathToUnit[absPath]) {
                this.pathToUnit[absPath] = this.unit(absPath, true);
            }

            var refPath = path.dirname(toAbsolutePath(this.rootPath, unitPath)) + '/' + includeReference.encodedName();

            if (this.pathToUnit[refPath]){
                return this.pathToUnit[refPath];
            }

            this.pathToUnit[refPath] = new CompilationUnit(includeReference.encodedName(), refResolvers.resolveContents(oldPath), false, this, refPath);

            return this.pathToUnit[refPath];
        }

        return this.unit(absPath,true);
    }

    buildPath(pathInUnit, unitPath) {
        if(isWebPath(pathInUnit)||path.isAbsolute(pathInUnit)){
            return pathInUnit;
        }

        if(isWebPath(unitPath)||path.isAbsolute(unitPath)){
            return toAbsolutePath(path.dirname(unitPath),pathInUnit);
        }

        return toAbsolutePath(path.dirname(toAbsolutePath(this.rootPath, unitPath)), pathInUnit);
    }


    units():lowlevel.ICompilationUnit[] {

        if(!(<ExtendedFSResolver>this.resolver).list){
            throw new Error("Provided FSResolver is unable to list files. Please, use ExtendedFSResolver.");
        }
        var names=(<ExtendedFSResolver>this.resolver).list(this.rootPath).filter(x=>path.extname(x)=='.raml');
        return names.map(x=>this.unit(x)).filter(y=>y.isTopLevel())
    }
    unitsAsync():Promise<lowlevel.ICompilationUnit[]>{

        if(!(<ExtendedFSResolver>this.resolver).listAsync){
            return Promise.reject(new Error("Provided FSResolver is unable to list files. Please, use ExtendedFSResolver."));
        }

        return (<ExtendedFSResolver>this.resolver).listAsync(this.rootPath).then(x=> {

            var promises:Promise<lowlevel.ICompilationUnit>[] =
                x.filter(x=>path.extname(x) == '.raml').map(x=>this.unitAsync(x).then(x=>{
                    return x.isTopLevel() ? x : null;
                },x=>{
                    return null;
                }));

            return Promise.all(promises).then(arr=>{
                return arr.filter(x=>x!=null);
            });
        });
    }


    lexerErrors():Error[]{
        var results:Error[]=[]
        this.units().forEach(x=>{
            results=results.concat(x.lexerErrors());
        })
        return results;
    }

    deleteUnit(p:string,absolute:boolean=false){
        var apath:string=null;
        if (isWebPath(p)){
            apath=p;
        }
        else{
            apath = absolute ? p : toAbsolutePath(this.rootPath, p);
        }
        delete this.pathToUnit[apath];
    }

    unit(p:string,absolute:boolean=false):CompilationUnit{
        var cnt:string=null;
        var apath:string=p;

        var response;

        if (isWebPath(p)){
            if (this.pathToUnit[apath]){
                return this.pathToUnit[apath];
            }
            if (this._httpResolver){
                response = this._httpResolver.getResource(p);
                if(response && response.errorMessage){
                    throw new Error(response.errorMessage);
                }
                if (response) {
                    cnt = response.content;
                } else {
                    cnt = null;
                }
            }
            else {
                response = new HTTPResolverImpl().getResource(apath);

                if (response) {
                    cnt = response.content;
                } else {
                    cnt = null;
                }
            }
        }
        else {
            if (p.charAt(0) == '/' && !absolute) {
                p = p.substr(1);//TODO REVIEW IT
            }
            var apath = toAbsolutePath(this.rootPath,p);
            if (this.pathToUnit[apath]){
                return this.pathToUnit[apath];
            }
            if(isWebPath(apath)){
                if (this._httpResolver){
                    var resp = this._httpResolver.getResource(apath);
                    if(resp && resp.errorMessage){
                        throw new Error(resp.errorMessage);
                    }

                    if (resp) {
                        cnt = resp.content;
                    } else {
                        cnt = null;
                    }
                }
                else {
                    var resourceResponse = new HTTPResolverImpl().getResource(apath);
                    if (resourceResponse) {
                        cnt = resourceResponse.content;
                    }
                    else {
                        cnt = null;
                    }
                }
            }
            else {
                cnt = this.resolver.content(apath);
            }
            //cnt = this.resolver.content(toAbsolutePath(this.rootPath, p));
        }
        if (cnt==null){
            return null;
        }
        var tl=util.stringStartsWith(cnt,"#%RAML");
        var relPath = (isWebPath(this.rootPath)==isWebPath(apath))?path.relative(this.rootPath,apath):apath;
        var unit=new CompilationUnit(relPath,cnt,tl,this,apath);
        this.pathToUnit[apath]=unit;

        if(response) {
            response.callback = contentHolder => {
                unit.updateContent(contentHolder && contentHolder.content);
            }
        }

        return unit;
    }

    unitAsync(p:string,absolute:boolean=false):Promise<lowlevel.ICompilationUnit>{

        var cnt:Promise<string>=null;
        var apath:string=p;
        if (isWebPath(p)){
            if (this.pathToUnit[apath]){
                return Promise.resolve(this.pathToUnit[apath]);
            }
            if (this._httpResolver){
                var resp = this._httpResolver.getResourceAsync(apath);
                cnt = resp.then(x=>{
                    if(x.errorMessage){
                        return <Promise<string>>Promise.reject(new Error(x.errorMessage));
                    }
                    return x.content;
                });
            }
            else {
                cnt = new HTTPResolverImpl().getResourceAsync(apath);
            }
        }
        else {
            if (p.charAt(0) == '/' && !absolute) {
                p = p.substr(1);//TODO REVIEW IT
            }
            if(absolute){
                apath = p;
            }
            else {
                apath = toAbsolutePath(this.rootPath,p);
            }
            if (this.pathToUnit[apath]){
                return Promise.resolve(this.pathToUnit[apath]);
            }
            if (isWebPath(apath)){
                if (this._httpResolver){
                    var resp = this._httpResolver.getResourceAsync(apath);
                    cnt = resp.then(x=>{
                        if(x.errorMessage){
                            return <Promise<string>>Promise.reject(new Error(x.errorMessage));
                        }
                        return x.content;
                    });
                }
                else {
                    cnt = new HTTPResolverImpl().getResourceAsync(apath);
                }
            }
            else {
                cnt = this.resolver.contentAsync(apath);
            }
        }
        if (cnt==null){
            return Promise.resolve(null);
        }
        var relPath = (isWebPath(this.rootPath)==isWebPath(apath))?path.relative(this.rootPath,apath):apath;
        return cnt.then(x=>{
            if(!x){
                return Promise.reject(new Error("Can note resolve " + apath));
            }
            var tl=util.stringStartsWith(x,"#%RAML");
            var unit=new CompilationUnit(relPath,x,tl,this,apath);
            this.pathToUnit[apath]=unit;
            return unit;
        }).then((unit: lowlevel.ICompilationUnit) => {
            if(unit.isRAMLUnit()) {
                return unit;
            }

            return schemes.isScheme(unit.contents()) ? schemes.startDownloadingReferencesAsync(unit.contents(), unit) : unit;
        });
    }

    visualizeNewlines(s: string): string {
        var res: string = '';
        for(var i=0; i<s.length; i++) {
            var ch = s[i];
            if(ch == '\r') ch = '\\r';
            if(ch == '\n') ch = '\\n';
            res += ch;
        }
        return res;
    }

    indent(node:ASTNode):string {
        //node.show('NODE');
        var text = node.unit().contents();
        //console.log('node text: ' + textutil.replaceNewlines(text.substring(node.start(), node.end())));
        //console.log('node parent: ' + node.parent());
        //console.log('node unit: ' + node.unit());

        if(node == node.root()) {
            //console.log('node is root');
            return '';
        }
        var leading = leadingIndent(node, text);
        //console.log('leading: [' + leading + '] ' + leading.length);
        var dmp=splitOnLines(node.dump());
        if (dmp.length>1){
            if(dmp[1].trim().length > 0) {
                //console.log('DMP0: [' + dmp[0] + ']');
                //console.log('DMP1: [' + dmp[1] + ']');
                var extra = indent(dmp[1]);
                return leading + extra;
            }
        }
        //console.log('LEADING: [' + this.visualizeNewlines(leading) + '] ');
        return leading + '  ';
    }

    startIndent(node: ASTNode):string {
        var text = node.unit().contents();
        //console.log('Node text:\n' + this.visualizeNewlines(text.substring(node.start(), node.end())));
        if(node == node.root()) return '';
        var dmp = splitOnLines(node.dump());
        if (dmp.length>0){
            console.log('FIRST: ' + dmp[0]);
            var extra = indent(dmp[0]);
            return extra + '  ';
        }
        //console.log('LEADING: [' + this.visualizeNewlines(leading) + '] ');
        return '';
    }


    private canWriteInOneLine(node:ASTNode):boolean{
        return false;
    }

    private isOneLine(node:ASTNode):boolean{
        return node.text().indexOf('\n')<0;
    }

    private recalcPositionsUp(target: ASTNode) {
        var np = target;
        while(np) {
            np.recalcEndPositionFromChilds();
            np = np.parent();
        }

    }


    private add2(target: ASTNode, node: ASTNode, toSeq: boolean, ipoint: ASTNode|InsertionPoint, json: boolean = false) {
        var unit:lowlevel.ICompilationUnit = target.unit();
        var api = <ASTNode>target.root();
        //console.log('api: ' + api);
        var point = null;
        if(ipoint) {
            if (ipoint instanceof ASTNode) {
                //console.log('insertion: ast node');
                point = <ASTNode>ipoint;
            }
            if (ipoint instanceof InsertionPoint) {
                //console.log('insertion: ip');
                point = (<InsertionPoint>ipoint).point;
            }
        }

        //console.log('target: ' + target.kindName() + '/' + target.valueKindName() + ' node: ' + node.kindName());
        //if(point) point.show('POINT:');
        if(target.isValueInclude()) {
            //console.log('insert to include ref');
            var childs = target.children();
            if(childs.length == 0) {
                throw new Error("not implemented: insert into empty include ref");
            }
            var parent = childs[0].parent();
            //console.log('parent: ' + parent);
            //parent.show('INCLUDE PARENT:');
            this.add2(<ASTNode>parent, node, toSeq, point, json);
            return;
        }

        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());

        var unitText = target.unit().contents();
        if(target.valueKind() == yaml.Kind.SEQ) {
            target = createSeq(target.valueAsSeq(), target, <CompilationUnit>target.unit());
        }
        var json = this.isJson(target);

        //console.log('target: ' + target.start() + '..' + target.end());

        var originalIndent = json? '' : this.indent(target.isSeq()? <ASTNode>target.parent() : target);
        //console.log('indent: [' + originalIndent + '] ' + originalIndent.length + '; toseq: ' + toSeq + '; json: ' + json);
        var xindent = originalIndent;
        var indentLength = originalIndent.length;
        var isTargetSeq = target.isSeq() || target.isMapping() && (target.isValueSeq() || target.isValueScalar() || !target.asMapping().value); //target.valueKind() == yaml.Kind.SEQ || target.isSeq();
        //toSeq = false;
        //console.log('target: ' + target.kindName() + '/' + yaml.Kind[target.valueKind()] + '; toseq: ' + toSeq);
        //target.root().show("API:");
        //target.show("TARGET:");
        //console.log('oindent: ' + originalIndent.length);
        toSeq = toSeq; // || isTargetSeq;
        if (toSeq) {
            if(json) {
                // nothing
            } else {
                if(isTargetSeq) {
                    xindent += "  ";
                    indentLength += 2;
                }
            }
        }
        //console.log('xindent: ' + xindent.length);
        var buf = new MarkupIndentingBuffer(xindent);
        //target.show('TARGET:');
        //node.show('NODE1');
        node.markupNode(buf, node._actualNode(), 0, json);
        var text = buf.text;

        //node.show('NODE2', 0, text);
        //console.log('TEXT TO ADD0: ' + textutil.replaceNewlines(text));

        if(toSeq) {
            //if(target.valueKind() == yaml.Kind.SEQ) {
                var trimText = textutil.trimEnd(text);
                var trimLen = text.length - trimText.length;
                if (trimLen > 0) {
                    //console.log('trim len: ' + trimLen);
                    var textlen = text.length;
                    text = text.substring(0, textlen - trimLen);
                    node.shiftNodes(textlen - trimLen, -trimLen);
                    //node.show('NODE SHIFTED', 0, text);

                }
            //}
        }

        //target.show('TARGET2');
        //node.show('NODE2', 0, text);
        //console.log('TEXT TO ADD1: ' + textutil.replaceNewlines(text));
        //console.log('TEXT TO ADD:\n' + this.visualizeNewlines(text));

        //console.log('toseq: ' + toSeq);
        if (toSeq && !json) {
            if(node.highLevelNode()) {
                //console.log('embedmap: ' + node.highLevelNode().property().isEmbedMap());
            }
            //console.log('target: ' + target.kindName());
            if(target.isMapping()) {
                //console.log('target value: ' + yaml.Kind[target.valueKind()]);
            }
            if(target.isSeq() || target.isMapping() && (target.isValueSeq() || target.isValueScalar() || !target.asMapping().value)) {
                //console.log('--- make it seq');
                text = originalIndent + '- ' + text;
            } else {
                //console.log('--- keep it map');
                text = originalIndent + text;
            }
        } else {
            text = originalIndent + text;
        }
        //console.log('TEXT TO ADD2: ' + textutil.replaceNewlines(text));
        //target.show('TARGET3');

        var pos = target.end();
        //console.log('insert to target end: ' + pos+ ' ; point: ' + point);
        if (point){
            //point.show("POINT");
            if (point!=target){
                pos = point.end();
            } else {
                if(json && toSeq) {
                    //
                } else {
                    pos = target.keyEnd() + 1;
                    pos = new textutil.TextRange(unitText, pos, pos).extendAnyUntilNewLines().endpos();
                }
            }
        } else {
            if(json && toSeq) {
                var seq = target.asSeq();
                if(seq) {
                    if(seq.items.length > 0) {
                        pos = seq.items[seq.items.length - 1].endPosition;
                        //console.log('indert to last end: ' + pos);
                    } else {
                        pos = seq.endPosition - 1;
                        //console.log('indert to empty: ' + pos);
                    }
                }
            } else {
                if(ipoint && (ipoint instanceof InsertionPoint)) {
                    //ipoint.show('insertion point provided');
                    var ip = <InsertionPoint>ipoint;
                    if(ip.type == InsertionPointType.START) {
                        pos = target.keyEnd() + 1;
                        pos = new textutil.TextRange(unitText, pos, pos).extendAnyUntilNewLines().endpos();
                    }
                }

            }
        }
        //console.log('insert poition: ' + pos);

        var insertionRange = new textutil.TextRange(unitText, 0, pos);
        pos = insertionRange.extendToNewlines().reduceSpaces().endpos();

        if(json && target.isSeq()) {
            var seq = target.asSeq();
            if(seq.items.length > 0) {
                text = ', ' + text;
                indentLength += 2;
            }
        } else if (pos>0 && unitText[pos-1] != '\n') {
            text = "\n" + text;
            indentLength++;
        }

        var suffixLen = 0;

        if(toSeq && !json) {
            text += '\n';
            suffixLen++;
        }

        //console.log('FINAL TEXT TO ADD: [' + textutil.replaceNewlines(text) + '] at position ' + pos);
        var newtext = unitText.substring(0,pos) + text + unitText.substring(pos, unitText.length);
        var cu: CompilationUnit = <CompilationUnit>unit;
        cu.updateContentSafe(newtext);
        this.executeReplace(new textutil.TextRange(unitText,pos,pos),text,cu);

        //console.log('shift root from position: ' + pos);
        (<ASTNode>target.root()).shiftNodes(pos, indentLength + (node.end()-node.start()) + suffixLen);

        //console.log('node len: ' + (node.end()-node.start()));
        //console.log('text len: ' + text.length);
        //(<ASTNode>target.root()).shiftNodes(pos, text.length+indentLength);

        //target.show('TARGET2:');
        //node.show('NODE TO ADD:');
        if(point) {
            var childs = target.children();
            var index = -1;
            for(var i=0; i<childs.length; i++) {
                var x = childs[i];
                if(x.start() == point.start() && x.end() == point.end()) {
                    index = i; break;
                }
            }
            //console.log('index: ' + index);
            if(index >=0) {
                target.addChild(node, index+1);
            } else {
                target.addChild(node);
            }
        } else {
            target.addChild(node);
        }

        node.shiftNodes(0, pos + indentLength);
        //target.show('TARGET UPDATED:');

        this.recalcPositionsUp(target);
        //target.show('TARGET UPDATED POSITIONS:');
        //api.show('ROOT UPDATED POSITIONS:');

        node.setUnit(<CompilationUnit>target.unit());
        node.visit(
            (n:lowlevel.ILowLevelASTNode):boolean => {
                var node = <ASTNode>n;
                node.setUnit(<CompilationUnit>target.unit());
                return true;
            }
        );

    }


    private isJsonMap(node: ASTNode) {
        if(!node.isMap()) return false;
        var text = node.text().trim();
        return text.length>=2 && text[0] == '{' && text[text.length-1] == '}';
    }

    private isJsonSeq(node: ASTNode) {
        if(!node.isSeq()) return false;
        var text = node.text().trim();
        return text.length>=2 && text[0] == '[' && text[text.length-1] == ']';
    }

    private isJson(node: ASTNode) {
        return this.isJsonMap(node) || this.isJsonSeq(node);
    }

    private remove(unit: lowlevel.ICompilationUnit, target: ASTNode, node: ASTNode) {
        var parent = node.parent();
        node._oldText=node.dump();

        //node.showParents('PARENTS:');

        //console.log('REMOVE NODE: ' + node.kindName() + ' from ' + target.kindName());
        //console.log('INITIAL SELECTION: [' + textutil.replaceNewlines(range.text()) + ']');
        //console.log('  text: \n' + unitText.substring(startpos,endpos));

        if (this.isOneLine(node) && node.isMapping() && node.parent().isMap()) {
            var mapnode = node.parent();
            if(mapnode.asMap().mappings.length==1 && mapnode.parent() != null) {
                //console.log('REMOVE MAP INSTEAD!');
                this.remove(unit, mapnode.parent(), mapnode);
                return;
            }
        }

        if (this.isOneLine(node) && node.isScalar() && node.parent().isSeq()) {
            var seqnode = node.parent();
            var seqn = seqnode.asSeq();
            //console.log('SEQ: ' + seqn.items.length);
            if(seqn.items.length==1) {
                //console.log('REMOVE SEQ INSTEAD!');
                this.remove(unit, seqnode.parent(), seqnode);
                return;
            }
        }

        if (target.isMapping() && node.isSeq()) {
            //console.log('remove seq from mapping');
            var map = target.parent();
            //console.log('REMOVE MAPPING INSTEAD!');
            this.remove(unit, map, target);
            return;
        }

        //target.show('TARGET:');
        //node.show('NODE:');

        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());
        var parentRange = new textutil.TextRange(unit.contents(), parent.start(), parent.end());

        var originalStartPos=range.startpos();
        //console.log('REMOVE TEXT: ' +  this.visualizeNewlines(range.text()));

        if(target.isSeq()) {
            // extend range to start of line
            //console.log('RANGE SEQ 0: ' + textutil.replaceNewlines(range.text()));
            var seq = <ASTNode>(node.isSeq()? node : node.parentOfKind(yaml.Kind.SEQ));
            //console.log('seq: ' + seq.text() + ' json: ' + this.isJson(seq));
            if(seq && this.isJson(seq)) {
                range = range.extendSpaces().extendCharIfAny(',').extendSpaces();
            } else {
                range = range.extendToStartOfLine().extendAnyUntilNewLines().extendToNewlines(); //
            }
            //console.log('RANGE SEQ 1:\n-----------\n' + range.text() + '\n-------------');
        }

        if(target.isMap()) {
            // extend range to end of line
            //console.log('RANGE MAP 0: [' +  this.visualizeNewlines(range.text()) + ']');
            range = range.trimEnd().extendAnyUntilNewLines().extendToNewlines();
            //console.log('RANGE MAP 1: [' +  this.visualizeNewlines(range.text()) + ']');
            range = range.extendToStartOfLine().extendUntilNewlinesBack();
            //console.log('RANGE MAP 2: [' +  this.visualizeNewlines(range.text()) + ']');
        }

        if(target.kind() == yaml.Kind.MAPPING) {
            //console.log('RANGE MAPPING 0: ' +  this.visualizeNewlines(range.text()));
            //console.log('NODE TEXT: ' + node.text());
            if(this.isJson(node) && this.isOneLine(node)) {
                // no need to trim trailing new lines
            } else {
                // extend range to end of line
                //console.log('RANGE MAP 0: ' +  this.visualizeNewlines(range.text()));
                range = range.extendSpacesUntilNewLines();
                range = range.extendToNewlines();
                //console.log('RANGE MAP 2: ' +  this.visualizeNewlines(range.text()));
                range = range.extendToStartOfLine().extendUntilNewlinesBack();
                //console.log('RANGE MAP 3: ' +  this.visualizeNewlines(range.text()));
            }
            //console.log('RANGE MAPPING 1: ' +  this.visualizeNewlines(range.text()));
        }

        if(node.isSeq()) {
            //console.log('cleanup seq');
            range = range.reduceSpaces();
        }

        //console.log('NODE:\n-----------\n' + range.unitText() + '\n-------------');
        //console.log('TARGET: ' + target.kindName());
        //target.show('TARGET');
        //console.log('FINAL REMOVE TEXT: [' +  this.visualizeNewlines(range.text()) + ']');
        //console.log('NEW TEXT:\n-----------\n' + range.remove() + '\n-------------');

        var cu: CompilationUnit = <CompilationUnit>unit;
        cu.updateContentSafe(range.remove());
        this.executeReplace(range,"",cu);
        //node.parent().show('Before remove');
        node.parent().removeChild(node);
        var shift = -range.len();
        //console.log('shift: ' + shift);
        (<ASTNode>target.root()).shiftNodes(originalStartPos, shift);


        this.recalcPositionsUp(target);

        //this.executeTextChange(new lowlevel.TextChangeCommand(range.startpos(), range.len(), "", unit))

        //target.show('TARGET AFTER REMOVE:');
        //target.root().show('API AFTER REMOVE:');

    }

    private changeKey(unit: lowlevel.ICompilationUnit, attr: ASTNode, newval: string) {
        //console.log('set key: ' + newval);
        var range = new textutil.TextRange(attr.unit().contents(), attr.keyStart(), attr.keyEnd());
        if(attr.kind() == yaml.Kind.MAPPING) {
            var sc: yaml.YAMLScalar = (<yaml.YAMLMapping>attr._actualNode()).key;
            sc.value=<string>newval;
            sc.endPosition = sc.startPosition + newval.length;
        }
        var cu: CompilationUnit = <CompilationUnit>unit;
        this.executeReplace(range,newval,cu);
        //console.log('new text: ' + this.visualizeNewlines(newtext));
        var shift = newval.length-range.len();
        //console.log('shift: ' + shift);
        (<ASTNode>attr.root()).shiftNodes(range.startpos(), shift, attr);
        this.recalcPositionsUp(attr);
    }

    private executeReplace(r:textutil.TextRange,txt:string,unit:CompilationUnit){
        var command=new lowlevel.TextChangeCommand(r.startpos(),r.endpos()-r.startpos(),txt,unit);
        unit.project()
        try {
            this.tlisteners.forEach(x=>x(command));
        }catch (e){
            return false;
        }
        var newtext = r.replace(txt);
        unit.updateContentSafe(newtext);
        return true;
    }

    private changeValue(unit: lowlevel.ICompilationUnit, attr: ASTNode, newval: string|lowlevel.ILowLevelASTNode) {
        //console.log('set value: ' + newval);mark
        //console.log('ATTR ' + yaml.Kind[attr.kind()] + '; VALUE: ' + val + ' => ' + newval);

        //attr.root().show('NODE:');
        //console.log('TEXT:\n' + attr.unit().contents());
        var range = new textutil.TextRange(attr.unit().contents(), attr.start(), attr.end());
        //console.log('Range0: ' + range.startpos() + '..' + range.endpos() + ': [' + this.visualizeNewlines(range.text()) + ']');

        //console.log('ATTR: ' + attr.kindName());
        //attr.root().show('BEFORE');

        var newNodeText;

        var prefix = 0;
        var delta = 0;

        var replacer = null;
        var mapping = null;

        //console.log('attr: ' + attr.kindName());
        if (attr.kind() == yaml.Kind.SCALAR) {
            if (typeof newval == 'string') {
                attr.asScalar().value = <string>newval;
                //range = range.withStart(attr.valueStart()).withEnd(attr.valueEnd());
                //console.log('Range1: ' + this.visualizeNewlines(range.text()));
                //console.log('Range0: ' + range.startpos() + '..' + range.endpos());
                newNodeText = newval;
            } else {
                throw new Error("not implemented");
            }
        } else if (attr.kind() == yaml.Kind.MAPPING) {
            //attr.show('ATTR:');
            mapping = attr.asMapping();
            //console.log('mapping val: ' + attr.valueKindName());
            if(attr.isValueInclude()) {
                var inc = attr.valueAsInclude();
                var includeString = inc.value;
                var includePath = includeString;
                //console.log("attr.setValue: path: " + includePath);
                var resolved=attr.unit().resolve(includePath)
                if (resolved==null){
                    console.log("attr.setValue: couldn't resolve: " + includePath);
                    return; // "can not resolve "+includePath
                }
                //console.log("attr.setValue: resolved: " + includePath);
                if (resolved.isRAMLUnit()){
                    //TODO DIFFERENT DATA TYPES, inner references
                    return;
                }
                //TODO for now disabling an update from outline details to JSON schema when there is a reference
                //to an inner element of the schema
                if (!refResolvers.getIncludeReference(includeString)) {
                    resolved.updateContent(<string>newval);
                }
                return;
            }
            //console.log('Range0: ' + range.startpos() + '..' + range.endpos() + ': [' + this.visualizeNewlines(range.text()) + ']');
            if(mapping.value)
                range = range.withStart(attr.valueStart()).withEnd(attr.valueEnd());
             else
                range = range.withStart(attr.keyEnd()+1).withEnd(attr.keyEnd()+1);
            //console.log('Range1: ' + range.startpos() + '..' + range.endpos());
            range = range.reduceNewlinesEnd();
            //console.log('Range2: ' + range.startpos() + '..' + range.endpos() + ': [' + this.visualizeNewlines(range.text()) + ']');
            if (newval == null) {
                newNodeText = '';
                mapping.value = null;
            } else if (typeof newval == 'string' || newval == null) {
                var newstr = <string>newval;
                var ind = this.indent(attr);
                //console.log('indent: ' + ind.length);
                if(newstr && textutil.isMultiLine(newstr)) {
                    newstr = '' + textutil.makeMutiLine(newstr, ind.length/2);
                }
                newNodeText = newstr;
                //var valueNode = null;
                if (!mapping.value) {
                    console.log('no value');
                    mapping.value = yaml.newScalar(newstr);
                    mapping.value.startPosition = attr.keyEnd() + 1;
                    mapping.value.endPosition = mapping.value.startPosition + newstr.length;
                    mapping.endPosition = mapping.value.endPosition;
                    if (unit.contents().length>attr.keyEnd()+1){
                        var vlPos=attr.keyEnd()+1;
                        if (unit.contents()[vlPos-1]==':'){
                            newNodeText=" "+newNodeText;
                            mapping.value.startPosition++;
                            mapping.value.endPosition++;
                            mapping.endPosition++;
                            delta++;
                        }
                    }
                } else if (mapping.value.kind == yaml.Kind.SEQ) {
                    console.log('seq value');
                    var v = (<yaml.YAMLSequence>mapping.value).items[0];
                    //TODO !!! assign value
                    throw "assign value!!!";
                } else if (mapping.value.kind == yaml.Kind.SCALAR) {
                    //console.log('scalar value');
                    var sc = <yaml.YAMLScalar>mapping.value;
                    var oldtext = sc.value;
                    //console.log('oldval: ' + sc.value);
                    //console.log('newstr: ' + newstr + ' ' + newstr.length);
                    sc.value = newstr;
                    //console.log('value1: ' + mapping.value.startPosition + '..' + mapping.value.endPosition);
                    mapping.value.endPosition = mapping.value.startPosition + newstr.length;
                    //console.log('value2: ' + mapping.value.startPosition + '..' + mapping.value.endPosition);
                    mapping.endPosition = mapping.value.endPosition;

                    //console.log('mvalue: ' + mapping.startPosition + '..' + mapping.endPosition);
                    //console.log('newval: ' + sc.value);
                    delta += newstr.length - oldtext.length;
                    //attr._children = null;
                }
                //console.log('newtext: ' + this.visualizeNewlines(newstr));
                //console.log('Range1: ' + range.startpos() + '..' + range.endpos() + ': ' + this.visualizeNewlines(range.text()));

                //console.log('set mapping scalar/seq: to: ' + newstr);
                //attr.show('ATTR1:');
            } else {
                var n = <ASTNode>newval;
                if(n.isMapping()) {
                    newval = createMap([n.asMapping()]);
                    n = <ASTNode>newval;
                } else if(n.isMap()) {
                    // nothing
                } else {
                    throw new Error("only MAP/MAPPING nodes allowed as values");
                }
                //n.show('NODE1');
                var buf = new MarkupIndentingBuffer('');
                n.markupNode(buf, n._actualNode(), 0, true);
                //n.show('NODE2');
                newNodeText = '' + buf.text + '';
                //indent++;
                //n.shiftNodes(0, 1);
                //console.log('node text: [[[' + newNodeText + ']]]');
                //n.show("NN1:", 0, newNodeText);
                //range = mapping.value? range.withStart(attr.valueStart()).withEnd(attr.valueEnd()) : range.withStart(attr.keyEnd()+1).withEnd(attr.keyEnd()+1 + newNodeText);
                n.shiftNodes(0, range.startpos()+delta);
                //n.show("NN2:");
                replacer = n;
                //console.log('new node text: ' + this.visualizeNewlines(newNodeText) + '; len: ' + newNodeText.length);
            }
        } else {
            console.log('Unsupported change value case: ' + attr.kindName());
        }

        //console.log('RangeX: ' + range.startpos() + '..' + range.endpos() + ': [' + this.visualizeNewlines(range.text()) + ']');

        //console.log('new node text: ' + newNodeText);
        var cu: CompilationUnit = <CompilationUnit>unit;
        //console.log('Range1: ' + range.startpos() + '..' + range.endpos());

        //console.log('replace: ' + range.len());
        //console.log('Range: ' + range.startpos() + '..' + range.endpos());
        //console.log('OldText: ' + this.visualizeNewlines(cu.contents()));
        this.executeReplace(range,newNodeText,cu);
        //var newtext = range.replace(newNodeText);
        //console.log('NewText: ' + this.visualizeNewlines(newtext));
        //cu.updateContentSafe(newtext);
        var shift = newNodeText.length-range.len();
        //var shift = delta;
        //attr.root().show('BEFORE SHIFT');
        //console.log('shift: ' + shift + '; from: ' + (range.endpos() + prefix) + '; delta: ' + delta + '; prefix: ' + prefix);
        (<ASTNode>attr.root()).shiftNodes(range.endpos()+prefix, shift, attr);
        //(<ASTNode>attr.root()).shiftNodes(range.endpos()+indent, shift);
        //attr.show('ATTR2:');

        if (replacer) {
            mapping.value = replacer._actualNode();
        }



        this.recalcPositionsUp(attr);



    }

    private initWithRoot(root : ASTNode, newroot: ASTNode) {
        var shift = root.end();
        newroot.markup(false);
        newroot._actualNode().startPosition = shift;
        newroot._actualNode().endPosition = shift;
        newroot.setUnit(root.unit());
    }

    execute(cmd:lowlevel.CompositeCommand) {
        //console.log('Commands: ' + cmd.commands.length);
        cmd.commands.forEach(x=>{
            //console.log('EXECUTE: kind: ' + lowlevel.CommandKind[x.kind] + '; val: ' + x.value);
            switch (x.kind){
                case lowlevel.CommandKind.CHANGE_VALUE:
                    var attr: ASTNode = <ASTNode>x.target;
                    var curval = attr.value();
                    if (!curval){
                        curval="";
                    }
                    var newval = x.value;

                    //console.log('set value: ' + (typeof curval) + ' ==> ' + (typeof newval));
                    if(typeof curval == 'string' && typeof newval == 'string') {
                        //console.log('set value: str => str');
                        if(curval != newval) {
                            this.changeValue(attr.unit(), attr, <string>newval);
                        }
                    } else if(typeof curval == 'string' && typeof newval != 'string') {
                        //console.log('set value: str => obj');
                        // change structure
                        //this.changeValue(attr.unit(), attr, null);
                        this.changeValue(attr.unit(), attr, <ASTNode>newval);
                    } else if(typeof curval != 'string' && typeof newval == 'string') {
                        var newstr = <string>x.value;
                        if(curval.kind() == yaml.Kind.MAPPING) {
                          if (textutil.isMultiLine(newstr)) {
                              //console.log('multiline');
                              attr.children().forEach(n=> {
                                  this.remove(attr.unit(), attr, <ASTNode>n);
                              });
                              this.changeValue(attr.unit(), attr, newstr);
                          } else {
                              //console.log('singleline');
                              this.changeKey(attr.unit(), curval, newstr);
                          }
                        } else {
                            throw new Error('unsupported case: attribute value conversion: ' + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported');
                        }
                    } else if(typeof curval != 'string' && typeof newval != 'string') {
                        var newvalnode = <ASTNode>newval;
                        //(<ASTNode>curval).show("OLD:");
                        //newvalnode.show("NEW:");
                        if(newvalnode.isMapping()) {
                            newval = createMap([newvalnode.asMapping()]);
                            //(<ASTNode>newval).show("NEW2:");
                        }

                        //console.log('obj obj: ' + (curval == newval));
                        if(curval == newval) break;
                        // change structure
                        //console.log('set value: obj => obj');
                        var node = <ASTNode>newval;
                        var map = node.asMap();
                        //console.log('attr: ' + attr.kindName() + " " + attr.dump());
                        attr.children().forEach(n=> {
                            this.remove(attr.unit(), attr, <ASTNode>n);
                        });
                        node.children().forEach(m=> {
                            //this.add2(attr, <ASTNode>m, false, null, true);
                        });
                        this.changeValue(attr.unit(), attr, <ASTNode>newval);
                    } else {
                        throw new Error("shouldn't be this case: attribute value conversion " + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported');
                    }
                    return;
                case lowlevel.CommandKind.CHANGE_KEY:
                    var attr: ASTNode = <ASTNode>x.target;
                    this.changeKey(attr.unit(), attr, <string>x.value);
                    return;
                case lowlevel.CommandKind.ADD_CHILD:
                    var attr:ASTNode=<ASTNode>x.target;
                    var newValueNode=<ASTNode>x.value;
                    this.add2(attr, newValueNode, x.toSeq, <ASTNode>x.insertionPoint);
                    return;
                case lowlevel.CommandKind.REMOVE_CHILD:
                    var target:ASTNode = <ASTNode>x.target;
                    var node = <ASTNode>x.value;
                    this.remove(target.unit(), target, node);
                    return;
                case lowlevel.CommandKind.INIT_RAML_FILE:
                    var root = <ASTNode>x.target;
                    var newroot = <ASTNode>x.value;
                    this.initWithRoot(root, newroot);
                    return;

                default:
                    console.log('UNSUPPORTED COMMAND: ' + lowlevel.CommandKind[x.kind]);
                    return;

            }
        })
    }

    replaceYamlNode(target: ASTNode, newNodeContent: string, offset: number, shift: number, unit: lowlevel.ICompilationUnit) {

        //console.log('New content:\n' + newNodeContent);
        //target.show('OLD TARGET');

        var newYamlNode = <yaml.YAMLNode>yaml.load(newNodeContent, {});

        //console.log('new yaml: ' + yaml.Kind[newYamlNode.kind]);
        this.updatePositions(target.start(), newYamlNode);
        //console.log('Shift: ' + shift);
        //(<ASTNode>unit.ast()).shiftNodes(offset, shift);
        (<ASTNode>target.root()).shiftNodes(offset, shift);

        var targetParent = target.parent();
        var targetYamlNode: yaml.YAMLNode = target._actualNode();
        var parent = targetYamlNode.parent;
        newYamlNode.parent = parent;

        if(targetParent && targetParent.kind() == yaml.Kind.MAP) {
            //console.log('MAP!!!');
            var targetParentMapNode = <yaml.YamlMap>targetParent._actualNode();
            targetParentMapNode.mappings = <yaml.YAMLMapping[]>targetParentMapNode.mappings.map(x=> {
                if (x != targetYamlNode) {
                    return x;
                }
                return newYamlNode;
            });
        }
        target.updateFrom(newYamlNode);

        //target.show('MEW TARGET');

        this.recalcPositionsUp(target);

    }

    executeTextChange2(textCommand: lowlevel.TextChangeCommand) {
        var cu: CompilationUnit = <CompilationUnit>textCommand.unit;
        var unitText = cu.contents();
        var target:ASTNode = <ASTNode>textCommand.target;
        if (target) {
            var cnt = unitText.substring(target.start(), target.end());
            var original=unitText;
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);

            var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) +
                textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);

            cu.updateContentSafe(unitText)
            if (textCommand.offset > target.start()) {
                try {
                    var shift = textCommand.text.length - textCommand.replacementLength;
                    var offset = textCommand.offset;

                    (<Project>target.unit().project()).replaceYamlNode(target, newNodeContent, offset, shift, textCommand.unit);

                } catch (e) {
                    console.log('New node contents (causes error below): \n' + newNodeContent);
                    console.log('Reparse error: ' + e.stack);
                }
            }
        } else {
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);
        }

        cu.updateContent(unitText);
        this.listeners.forEach(x=> {
            x(null)
        });
        this.tlisteners.forEach(x=> {
            x(textCommand)
        })

    }

    executeTextChange(textCommand:lowlevel.TextChangeCommand) {
        var l0=new Date().getTime();
        try {
            var oc = textCommand.unit.contents();
            //console.log('Offset: ' + textCommand.offset + '; end: ' + (textCommand.offset + textCommand.replacementLength) + '; len: ' + textCommand.replacementLength);
            var target:ASTNode = <ASTNode>textCommand.target;
            if(target == null) {
                target = <ASTNode>this.findNode(textCommand.unit.ast(), textCommand.offset, textCommand.offset + textCommand.replacementLength);
            }
            var cu:CompilationUnit = <CompilationUnit>textCommand.unit;
            if (target) {
                var cnt = oc.substring(target.start(), target.end());
                //console.log('Content: ' + cnt);
                var original=oc;
                oc = oc.substr(0, textCommand.offset) + textCommand.text + oc.substr(textCommand.offset + textCommand.replacementLength);

                var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) +
                    textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);

                cu.updateContentSafe(oc)
                //console.log('UPDATED TEXT: ' + oc);
                var hasNewLines = breaksTheLine(original, textCommand);
                if (textCommand.offset > target.start()) {
                    //we can just reparse new node content;
                    //console.log(newNodeContent)
                    try {
                        var newYamlNode = <yaml.YAMLNode>yaml.load(newNodeContent, {});
                        this.updatePositions(target.start(), newYamlNode);
                        //console.log("Positions updated")
                        //lets shift all after it
                        var shift = textCommand.text.length - textCommand.replacementLength;
                        //console.log('shift: ' + shift);

                        //console.log('offset: ' + textCommand.offset);
                        (<ASTNode>textCommand.unit.ast()).shiftNodes(textCommand.offset, shift);
                        //console.log('Unit AST: ' + textCommand.unit.ast())
                        if (newYamlNode != null && newYamlNode.kind == yaml.Kind.MAP) {
                            var actualResult = (<yaml.YamlMap>newYamlNode).mappings[0];
                            var targetYamlNode: yaml.YAMLNode = target._actualNode();
                            var parent = targetYamlNode.parent;
                            var cmd=new lowlevel.ASTDelta();
                            var unit = <CompilationUnit>textCommand.unit;
                            cmd.commands=[
                                new lowlevel.ASTChangeCommand(lowlevel.CommandKind.CHANGE_VALUE,
                                    new ASTNode(copyNode(targetYamlNode), unit, null, null, null),
                                    new ASTNode(actualResult, unit, null, null, null),
                                    0
                                )
                            ];
                            if (parent && parent.kind == yaml.Kind.MAP) {
                                var map:yaml.YamlMap = <yaml.YamlMap>parent;
                                map.mappings = <yaml.YAMLMapping[]>map.mappings.map(x=> {
                                    if (x != targetYamlNode) {
                                        return x;
                                    }
                                    return actualResult;
                                })
                            }
                            actualResult.parent = parent;
                            //updating low level ast from yaml

                            this.recalcPositionsUp(target);

                            target.updateFrom(actualResult);
                            //console.log("Incremental without listeners: "+(new Date().getTime()-l0));
                            //console.log("Notify listeners1: " + this.listeners.length + ":" + this.tlisteners.length);
                            this.listeners.forEach(x=> {
                                x(cmd)
                            });
                            this.tlisteners.forEach(x=> {
                                x(textCommand)
                            });
                            //console.log("Incremental update processed");
                            return;
                        }
                    }
                    catch (e) {
                        console.log('New node contents (causes error below): \n' + newNodeContent);
                        console.log('Reparse error: ' + e.stack);
                    }
                }
            }
            else {
                oc = oc.substr(0, textCommand.offset) + textCommand.text + oc.substr(textCommand.offset + textCommand.replacementLength);
            }
            var t2=new Date().getTime();
            //console.log("Full without listeners:"+(t2-l0));

            //!find node in scope
            cu.updateContent(oc);

            //console.log("Notify listeners2: " + this.listeners.length + ":" + this.tlisteners.length);

            this.listeners.forEach(x=> {
                x(null)
            });
            this.tlisteners.forEach(x=> {
                x(textCommand)
            })
        } finally{
            var t2=new Date().getTime();
            //console.log("Total:"+(t2-l0));
        }
    }

    updatePositions(offset: number, n: yaml.YAMLNode){
        if (n==null){
            return;
        }
        if (n.startPosition == -1){
            n.startPosition = offset;
        } else {
            n.startPosition = offset + n.startPosition;
        }
        n.endPosition = offset + n.endPosition;
        //console.log('SET POS: ' + n.startPosition + ".." + n.endPosition);
        switch (n.kind){
            case yaml.Kind.MAP:
                var m:yaml.YamlMap=<yaml.YamlMap>n;
                m.mappings.forEach(x=>this.updatePositions(offset,x))
                break;
            case yaml.Kind.MAPPING:
                var ma:yaml.YAMLMapping=<yaml.YAMLMapping>n;
                this.updatePositions(offset,ma.key)
                this.updatePositions(offset,ma.value)
                break;
            case yaml.Kind.SCALAR:
                break;
            case yaml.Kind.SEQ:
                var s:yaml.YAMLSequence=<yaml.YAMLSequence>n;
                s.items.forEach(x=>this.updatePositions(offset,x))
                break;
        }
    }

    findNode(n:lowlevel.ILowLevelASTNode,offset:number,end:number):lowlevel.ILowLevelASTNode{
        if (n==null){
            return null;
        }
        var node:ASTNode=<ASTNode>n;
        if (n.start()<=offset&&n.end()>=end){
            var res=n;
            node.directChildren().forEach(x=>{
                var m=this.findNode(x,offset,end);
                if (m){
                    res=m;
                }
            })
            return res;
        }
        return null;
    }

    //shiftNodes(n:lowlevel.ILowLevelASTNode, offset:number, shift:number):lowlevel.ILowLevelASTNode{
    //    var node:ASTNode=<ASTNode>n;
    //    if (node==null){
    //        return null;
    //    }
    //    node.directChildren().forEach(x=> {
    //        var m = this.shiftNodes(x, offset, shift);
    //    })
    //    var yaNode=(<ASTNode>n)._actualNode();
    //    if(yaNode) innerShift(offset, yaNode, shift);
    //    return null;
    //}

    addTextChangeListener(listener:lowlevel.ITextChangeCommandListener){
        this.tlisteners.push(listener)
    }
    removeTextChangeListener(listener:lowlevel.ITextChangeCommandListener){
        this.tlisteners=this.tlisteners.filter(x=>x!=listener);
    }


    addListener(listener:lowlevel.IASTListener) {
        this.listeners.push(listener)
    }

    removeListener(listener:lowlevel.IASTListener) {
        this.listeners=this.listeners.filter(x=>x!=listener)
    }

}
function breaksTheLine(oc:string,textCommand:lowlevel.TextChangeCommand){
    var oldText=oc.substr(textCommand.offset,textCommand.replacementLength);
    if (oldText.indexOf('\n')!=-1){
        return true;
    }
    if (textCommand.text.indexOf('\n')!=-1){
        return true;
    }
}

export class ASTNode implements lowlevel.ILowLevelASTNode{

    _errors:Error[]=[]

    constructor (
        private _node: yaml.YAMLNode,
        private _unit: lowlevel.ICompilationUnit,
        private _parent: ASTNode,
        private _anchor: ASTNode,
        private _include: ASTNode,
        private cacheChildren:boolean = false,
        private _includesContents = false) {
        if (_node==null){
            console.log("null")
        }
    }
    actual(): any{
        return this._node;
    }

    _children:lowlevel.ILowLevelASTNode[]

    yamlNode():yaml.YAMLNode{
        return this._node;
    }

    includesContents() : boolean {
        return this._includesContents;
    }

    setIncludesContents(includesContents : boolean) {
        this._includesContents = includesContents;
    }

    gatherIncludes(s:lowlevel.ILowLevelASTNode[]=[],inc:ASTNode=null,anc:ASTNode=null,inOneMemberMap:boolean=true){
            if (this._node==null){
                return;//TODO FIXME
            }
            var kind = this._node.kind;

            if(kind==yaml.Kind.SCALAR) {
                if(schemes.isScheme(this._node.value)) {
                    var references = schemes.getReferences(this._node.value, this.unit());

                    references.forEach(reference => {
                        var includeNode = yaml.newScalar(reference);

                        includeNode.kind = yaml.Kind.INCLUDE_REF;

                        var includeAST = new ASTNode(includeNode, this.unit(), null, null, null);

                        s.push(includeAST);
                    });
                }

                return;
            }
            else if(kind == yaml.Kind.MAP)
            {
                var map:yaml.YamlMap=<yaml.YamlMap>this._node;
                if(map.mappings.length==1&&!inOneMemberMap){
                  new ASTNode(map.mappings[0].value,this._unit,this,inc,anc,this.cacheChildren).gatherIncludes(s);
                }
                else {
                    map.mappings.
                        map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren)).
                        forEach(x=>x.gatherIncludes(s));
                }
            }
            else if(kind == yaml.Kind.MAPPING)
            {
                var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
                if (mapping.value==null){

                }
                else {
                    new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren).gatherIncludes(s);
                }
            }
            else if(kind == yaml.Kind.SEQ)
            {
                var seq:yaml.YAMLSequence=<yaml.YAMLSequence>this._node;
                seq.items.filter(x=>x!=null).map(x=>new ASTNode(x,this._unit,this,anc?anc:this._anchor,inc?inc:this._include,this.cacheChildren)).forEach(x=>x.gatherIncludes(s));
            }
            else if(kind == yaml.Kind.INCLUDE_REF)
            {
                if (this._unit) {
                    s.push(this);
                }
            }
    }

    private _highLevelNode:highlevel.IHighLevelNode

    private _highLevelParseResult:highlevel.IParseResult

    setHighLevelParseResult(highLevelParseResult:highlevel.IParseResult){
        this._highLevelParseResult = highLevelParseResult;
    }

    highLevelParseResult():highlevel.IParseResult{
        return this._highLevelParseResult;
    }

    setHighLevelNode(highLevel:highlevel.IHighLevelNode){
        this._highLevelNode = highLevel;
    }

    highLevelNode():highlevel.IHighLevelNode{
        return this._highLevelNode;
    }

    start():number {
        return this._node.startPosition;
    }


    errors(){
        return this._errors;
    }

    parent():ASTNode{
        return this._parent;
    }

    recalcEndPositionFromChilds() {
        var childs = this.children();
        //if(this.children().length == 0) return;
        var max = 0;
        var first: ASTNode = <ASTNode>this.children()[0];
        var last: ASTNode = <ASTNode>this.children()[this.children().length-1];
        //this.children().forEach(n=> {
        //    var node: ASTNode = <ASTNode>n;
        //    if(node._node.endPosition > max) max = node._node.endPosition;
        //});
        if(this.isMapping()) {
            var mapping = this.asMapping();
            //console.log('reposition: mapping');
            if(mapping.value) {
                if (mapping.value.kind == yaml.Kind.MAP) {
                    var map = <yaml.YamlMap>mapping.value;
                    if(map.startPosition<0 && first) {
                        map.startPosition = first.start();
                    }
                    if(last) this._node.endPosition = last._node.endPosition;
                    //console.log('embedded map: ' + map.startPosition + ".." + map.endPosition);
                    this._node.endPosition = Math.max(this._node.endPosition, mapping.value.endPosition);
                } else if (mapping.value.kind == yaml.Kind.SEQ) {
                    var seq = <yaml.YAMLSequence>mapping.value;
                    if(seq.startPosition < 0) {
                        //console.log('*** missed start position');
                        if(seq.items.length > 0) {
                            var pos = seq.items[0].startPosition;
                            var range = new textutil.TextRange(this.unit().contents(), pos, pos);
                            range = range.extendSpacesBack().extendCharIfAnyBack('-');
                            seq.startPosition = range.startpos();
                        } else {

                        }
                    }
                    //console.log('mapping1     : ' + mapping.startPosition + ".." + mapping.endPosition);
                    //console.log('embedded seq1: ' + seq.startPosition + ".." + seq.endPosition);
                    if(seq.items.length > 0) {
                        var ilast = seq.items[seq.items.length-1];
                        this._node.endPosition = Math.max(this._node.endPosition, seq.endPosition, ilast.endPosition);
                        seq.endPosition = Math.max(this._node.endPosition, seq.endPosition, ilast.endPosition);
                    }
                    //console.log('embedded seq2: ' + seq.startPosition + ".." + seq.endPosition);
                    //console.log('mapping2     : ' + mapping.startPosition + ".." + mapping.endPosition);
                } else if (mapping.value.kind == yaml.Kind.SCALAR) {
                    //console.log('embedded scalar: ' + mapping.value.startPosition + ".." + mapping.value.endPosition);
                    //this._node.endPosition = mapping.value.endPosition;
                } else {
                    if(last) this._node.endPosition = last._node.endPosition;
                }
            }
        } else {
            if(last) this._node.endPosition = last._node.endPosition;
        }
        //this._node.endPosition = max;;
    }

    isValueLocal():boolean{
        if (this._node.kind==yaml.Kind.MAPPING){
            var knd=(<yaml.YAMLMapping>this._node).value.kind;
            return knd!=yaml.Kind.INCLUDE_REF&&knd!=yaml.Kind.ANCHOR_REF;
        }
        return true;
    }

    keyStart():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            return (<yaml.YAMLMapping>this._node).key.startPosition
        }
        return -1;
    }
    keyEnd():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            return (<yaml.YAMLMapping>this._node).key.endPosition
        }
        return -1;
    }

    valueStart():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            var mapping =  this.asMapping();
            if (mapping.value) return mapping.value.startPosition;
            else return mapping.endPosition;
        }

        return -1;
    }

    valueEnd():number {
        if(this._node.kind==yaml.Kind.MAPPING) {
            var mapping = this.asMapping();

            return mapping.value ? mapping.value.endPosition : mapping.endPosition;
        }

        return -1;
    }

    end():number {
        return this._node.endPosition;

    }

    _oldText;
    dump():string{
        if (this._oldText){
            return this._oldText;
        }

        if (this._unit&&this._node.startPosition>0&&this._node.endPosition>0){
            var originalText=this._unit.contents().substring(this._node.startPosition,this._node.endPosition);
            originalText=stripIndent(originalText,leadingIndent(this,this._unit.contents()));
            //console.log("L:");
            //console.log(originalText);
            return originalText;
        }

        return yaml.dump(this.dumpToObject(),{})
    }
    dumpToObject(full:boolean=false):any{

        return this.dumpNode(this._node,full);
    }





    dumpNode(n:yaml.YAMLNode,full:boolean=false){
        if(!n){
            return  null;
        }
        if (n.kind==yaml.Kind.INCLUDE_REF){
            if (this._unit) {
                var s:yaml.YAMLScalar=<yaml.YAMLScalar>n
                var includePath = s.value;
                var resolved = null;
                try {
                    resolved = this._unit.resolve(includePath)
                } catch (Error) {
                    //this will be reported during invalidation
                }
                if (resolved == null) {
                    return null;
                }
                else if (resolved.isRAMLUnit() && this.canInclude(resolved)) {
                    var ast = resolved.ast();
                    if (ast) {
                        return ast.dumpToObject(full);
                    }
                }
            }
            return null;
        }
        if (n.kind==yaml.Kind.SEQ){
            var seq:yaml.YAMLSequence=<yaml.YAMLSequence>n
            var arr=[];
            seq.items.forEach(x=>arr.push(this.dumpNode(x,full)));
            return arr;
        }
        if (n.kind==yaml.Kind.MAPPING){
            var c:yaml.YAMLMapping=<yaml.YAMLMapping>n
            var v={};

            var val=c.value;
            var mm=this.dumpNode(val,full);
            v[""+this.dumpNode(c.key,full)]=mm;
            return v;
        }
        if (n.kind==yaml.Kind.SCALAR){
            var s:yaml.YAMLScalar=<yaml.YAMLScalar>n
            var q:any= s.value;
            if (s.plainScalar){
                if (q=="true"){
                    q=true;
                }
                else if (q=="false"){
                    q=false;
                }
                else {
                    var vl=parseFloat(q);
                    if (!isNaN(vl)){
                        if ((""+q).match("^[-+]?[0-9]*\.?[0-9]+$")) {
                            q = vl;
                        }
                    }
                }
            }
            return q;
        }
        if (n.kind==yaml.Kind.MAP){
            var map=<yaml.YamlMap>n;
            var res={};


            if (map.mappings) {
                map.mappings.forEach(x=> {
                    var ms=this.dumpNode(x.value,full);
                    if (ms==null){
                        ms="!$$$novalue"
                    }
                    if ((ms+"").length>0||full) {
                        res[this.dumpNode(x.key,full) + ""] = ms;
                    }
                })
            }
            return res;
        }

    }
    keyKind(){
        if (this._node.key) {
            return this._node.key.kind;
        }
        return null;
    }

    _actualNode(){
        return this._node
    }
    execute(cmd:lowlevel.CompositeCommand) {
        if (this.unit()){
            this.unit().project().execute(cmd)
        }
        else{
            cmd.commands.forEach(x=>{
                switch (x.kind){
                    case lowlevel.CommandKind.CHANGE_VALUE:
                        var attr:ASTNode=<ASTNode>x.target;
                        var newValue=x.value;
                        var va=attr._actualNode();
                        var as=attr.start();
                        if (va.kind==yaml.Kind.MAPPING){
                            (<yaml.YAMLMapping>va).value=yaml.newScalar(""+newValue);
                        }

                        //this.executeTextChange(new lowlevel.TextChangeCommand(as,attr.value().length,<string>newValue,attr.unit()))
                        return;
                    case lowlevel.CommandKind.CHANGE_KEY:
                        var attr:ASTNode=<ASTNode>x.target;
                        var newValue=x.value;
                        var va=attr._actualNode();
                        if (va.kind==yaml.Kind.MAPPING){
                            var sc:yaml.YAMLScalar=(<yaml.YAMLMapping>va).key
                            sc.value=<string>newValue
                        }
                        return;
                }
            })
        }
    }


    updateFrom(n:yaml.YAMLNode){
        this._node=n;
    }

    value(toString?:boolean):any {
        if (!this._node){
            return "";
        }
        if (this._node.kind==yaml.Kind.SCALAR){
            //TODO WHAT IS IT IS INCLUDE ACTUALLY
            if(!toString&&(""+this._node['valueObject']===this._node['value'])){
                return this._node['valueObject'];
            }
            return this._node['value'];
        }
        if (this._node.kind==yaml.Kind.ANCHOR_REF){
            var ref:yaml.YAMLAnchorReference=<yaml.YAMLAnchorReference>this._node;
            return new ASTNode(ref.value,this._unit,this,null,null).value(toString);
        }
        if (this._node.kind==yaml.Kind.MAPPING){
            var map:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (map.value==null){
                return null;
            }
            return new ASTNode(map.value,this._unit,this,null,null).value(toString);
        }
        if (this._node.kind==yaml.Kind.INCLUDE_REF){
            //here we should resolve include
            var includeString = this._node['value'];
            var includePath=includeString;

            var resolved=null;
            try {
                resolved = this._unit.resolve(includePath)
            } catch (Error) {
                //not sure why we're returning this as a value, but that's what we do with failed units due to unknown cause below,
                //so doing the same @Denis
                return "can not resolve "+includePath + " due to: " + Error.message;
            }
            if (resolved==null){
                return "can not resolve "+includePath
            }
            if (resolved.isRAMLUnit()){

                //TODO DIFFERENT DATA TYPES, inner references
                return null;
            }
            var text = resolved.contents();
            if(textutil.isMultiLineValue(text)) {
                text = textutil.fromMutiLine(text);
            }
            return text;
        }
        if (this._node.kind==yaml.Kind.MAP){
            var amap:yaml.YamlMap=<yaml.YamlMap>this._node;
            if(amap.mappings.length==1){

                //handle map with one member case differently
                return new ASTNode(amap.mappings[0],this._unit,this,null,null);
            }

        }
        if (this._node.kind==yaml.Kind.SEQ){
            var aseq:yaml.YAMLSequence=<yaml.YAMLSequence>this._node;
            if(aseq.items.length==1&&true){

                //handle seq with one member case differently
                return new ASTNode(aseq.items[0],this._unit,this,null,null).value(toString);
            }
        }
        //this are only kinds which has values
        return null;
    }

    printDetails(indent?:string) : string {
        var result : string = ""

        if (!indent) indent = ""

        var typeName = this.kindName()

        if (this.kind() == yaml.Kind.SCALAR)
        {
            result += indent + "[" + typeName + "]" + " " + this.value() + "\n"
        }
        else if (this.kind() == yaml.Kind.MAPPING &&
            (<yaml.YAMLMapping>this._node).value &&
            (<yaml.YAMLMapping>this._node).value.kind == yaml.Kind.SCALAR) {
            result += indent + "[" + typeName + "]" + " " + this.key()
                + " = " + this.value() + "\n"
        } else if (this.kind() == yaml.Kind.MAPPING) {
            result += indent + "[" + typeName + "]" + " " + this.key()
                + " = :\n"
            this.children().forEach(child=>{
                result += (<ASTNode>child).printDetails(indent + "\t")
            })
        }
        else {
            result += indent + "[" + typeName + "]" + " :\n"
            this.children().forEach(child=>{
                result += (<ASTNode>child).printDetails(indent + "\t")
            })
        }



        return result
    }


    visit(v:lowlevel.ASTVisitor) {
        this.children().forEach(x=>{
            if (v(x)){
                x.visit(v);
            }
        })
    }

    private rawKey():string {
        if (!this._node){
            return "";
        }
        if (this._node.kind==yaml.Kind.MAPPING){
            var map:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (map.key.kind==yaml.Kind.SEQ){
                var items=<yaml.YAMLSequence><any>map.key;
                var mn="[";
                items.items.forEach(x=>mn+=(<any>x).value);
                return mn+"]";
            }
            return map.key.value;
        }
        //other kinds do not have keys
        return null;
    }

    key():string{
        var key = this.rawKey();
        if(key!=null&&util.stringEndsWith(key,'?')){
            key = key.substring(0,key.length-1);
        }
        return key;
    }

    optional():boolean{
        var key = this.rawKey();
        return key!=null && util.stringEndsWith(key,'?');
    }

    addChild(n: lowlevel.ILowLevelASTNode, pos: number = -1){
        //this.show('ADD TARGET:');
        var node = <ASTNode>n;
        //console.log('add-child: ' + this.kindName() + ' .add ' + node.kindName());
        node._parent = this;
        this._oldText=null;
        if(this.isMap()) {
            //console.log('pos: ' + pos);
            var map = this.asMap();
            if (map.mappings==null||map.mappings==undefined){
                map.mappings=[]
            }
            if(pos >= 0) {
                map.mappings.splice(pos, 0, node.asMapping());
            } else {
                map.mappings.push(node.asMapping());
            }
        } else if(this.isMapping()) {
            var mapping = this.asMapping();
            var val = mapping.value;
            //console.log('mapping value: ' + val);
            if(!mapping.value && node.isMap()) {
                mapping.value = node._actualNode();
                return;
            }
            if(mapping.value && mapping.value.kind == yaml.Kind.SCALAR) {
                // cleanup old value
                mapping.value = null;
                val = null;
            }
            if(!val) {
                if(node.isScalar() || node.highLevelNode() && node.highLevelNode().property().getAdapter(services.RAMLPropertyParserService).isEmbedMap()) {
                    val = yaml.newSeq();
                } else {
                    val = yaml.newMap();
                }
                mapping.value = val;
            }
            if(val.kind == yaml.Kind.MAP) {
                var map = <yaml.YamlMap>val;
                if (map.mappings==null||map.mappings==undefined){
                    map.mappings=[]
                }

                if(node.isScalar()) {
                    // wrap it into ...
                    //node = cre
                }
                if(pos >= 0) {
                    map.mappings.splice(pos, 0, node.asMapping());
                } else {
                    map.mappings.push(node.asMapping());
                }
            } else if(val.kind == yaml.Kind.SEQ) {
                var seq = <yaml.YAMLSequence>val;
                if(pos >= 0) {
                    seq.items.splice(pos, 0, node._actualNode());
                } else {
                    seq.items.push(node._actualNode());
                }
            } else {
                throw new Error("Insert into mapping with " + yaml.Kind[mapping.value.kind] + " value not supported");
            }
        } else if(this.isSeq()) {
            var seq = this.asSeq();
            if(pos >= 0) {
                seq.items.splice(pos, 0, node._actualNode());
            } else {
                seq.items.push(node._actualNode());
            }
        } else {
            throw new Error("Insert into " + this.kindName() + " not supported");
        }

    }

    removeChild(n: lowlevel.ILowLevelASTNode){
        this._oldText=null;
        var node = <ASTNode>n;
        var ynode;
        var index;

        //console.log('*** REMOVE FROM: ' + this.kindName());

        if (this.kind() == yaml.Kind.SEQ) {
            //console.log('remove from seq');
            var seq = this.asSeq();
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            ynode = <yaml.YAMLNode>node._node;
            index = seq.items.indexOf(ynode);
            if (index > -1) seq.items.splice(index, 1);
        } else if (this.kind() == yaml.Kind.MAP) {
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            var map = this.asMap();
            //console.log('remove from map: ' + map.mappings.length);
            ynode = node.asMapping();
            index = map.mappings.indexOf(ynode);
            //console.log('  index: ' + index);
            if (index > -1) map.mappings.splice(index, 1);
            //console.log('  new len: ' + map.mappings.length);
        } else if (this.kind() == yaml.Kind.MAPPING) {
            //console.log('*** REMOVE FROM MAPPING');
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            //console.log('remove from mapping with map as value');
            var mapping = this.asMapping();
            //this.show("REMOVE TARGET: ***");
            //node.show("REMOVE NODE: ***");
            if(node._actualNode() == mapping.value) {
                // remove right from mapping
                //console.log('*** remove map from mapping!');
                mapping.value = null;
            } else {
                var map = <yaml.YamlMap>(mapping.value);
                ynode = node.asMapping();
                if(map && map.mappings) {
                    index = map.mappings.indexOf(ynode);
                    if (index > -1) map.mappings.splice(index, 1);
                }
            }
        } else {
            throw new Error("Delete from " + yaml.Kind[this.kind()] + " unsupported");
        }

    }

    includeErrors():string[]{
        if (this._node.kind==yaml.Kind.MAPPING){

            var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (mapping.value==null){
                        return [];
            }
            return new ASTNode(mapping.value,this._unit,this,this._anchor,this._include).includeErrors();

        }
        var rs:string[]=[]
        if (this._node.kind==yaml.Kind.INCLUDE_REF){
            var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (mapping.value==null){
                return [];
            }
            var includePath=this.includePath();

            var resolved = null;
            try {
                 resolved = this._unit.resolve(includePath)
            } catch (Error) {
                //known cause of failure
                rs.push("Can not resolve "+includePath + " due to: " + Error.message);
                return rs;
            }

            if (resolved==null){
                //unknown cause of failure
                rs.push("Can not resolve "+includePath);
                return rs;
            }
            if (resolved.isRAMLUnit()) {
                var ast=resolved.ast();
                if (ast) {
                    return []
                }
                else{
                    rs.push(""+includePath+" can not be parsed")
                }
            } else {

            }
        }


        return rs;
    }
    children(inc:ASTNode=null,anc:ASTNode=null,inOneMemberMap:boolean=true):lowlevel.ILowLevelASTNode[] {
        if (this._node==null){
            return [];//TODO FIXME
        }
        if(this.cacheChildren&&this._children){
            return this._children;
        }
        var result:lowlevel.ILowLevelASTNode[];
        var kind = this._node.kind;

            if(kind==yaml.Kind.SCALAR) {
                result = [];
            }
            else if(kind == yaml.Kind.MAP)
            {
                var map:yaml.YamlMap=<yaml.YamlMap>this._node;
                if(map.mappings.length==1&&!inOneMemberMap){
                    //handle map with one member case differently
                    // q:
                    //  []
                    //   - a
                    //   - b
                    // ->
                    // q:
                    //  a
                    //  b
                    result = new ASTNode(map.mappings[0].value,this._unit,this,inc,anc,this.cacheChildren).children(null,null,true);
                }
                else {
                    result = map.mappings.map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren));
                }
            }
            else if(kind == yaml.Kind.MAPPING)
            {
                var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
                if (mapping.value==null){
                    result = [];
                }
                else {
                    var proxy = new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren)

                    result = proxy.children();

                    if (proxy.includesContents()) {
                        this.setIncludesContents(true)
                    }
                }
            }
            else if(kind == yaml.Kind.SEQ)
            {
                var seq:yaml.YAMLSequence=<yaml.YAMLSequence>this._node;
                result = seq.items.filter(x=>x!=null).map(x=>new ASTNode(x,this._unit,this,anc?anc:this._anchor,inc?inc:this._include,this.cacheChildren));
            }
            else if(kind == yaml.Kind.INCLUDE_REF)
            {
                if (this._unit) {
                    var includePath = this.includePath();
                    var resolved = null;
                    try {
                        resolved = this._unit.resolve(includePath)
                    } catch (Error) {
                        //this will be reported during invalidation
                    }
                    if (resolved == null) {
                        result = [];
                    }
                    else if (resolved.isRAMLUnit() && this.canInclude(resolved)) {
                        var ast = resolved.ast();
                        if (ast) {
                            if(this.cacheChildren){
                                ast = <ASTNode>toChildCahcingNode(ast);
                            } //else {
                            //    ast = <ASTNode>toIncludingNode(ast);
                            //}

                            result = (<ASTNode> resolved.ast()).children(this, null);
                            this.setIncludesContents(true);
                        }
                    }
                }
                if(!result) {
                    result = [];
                }
            }
            else if(kind == yaml.Kind.ANCHOR_REF)
            {
                var ref:yaml.YAMLAnchorReference=<yaml.YAMLAnchorReference>this._node;
                result = new ASTNode(ref.value,this._unit,this,null,null,this.cacheChildren).children();
            }
            else{
                throw new Error("Should never happen; kind : " + yaml.Kind[this._node.kind]);
            }


            if(this.cacheChildren){
                this._children = result;
            }
            return result;


    }

    canInclude(unit : lowlevel.ICompilationUnit) : boolean {

        var includedFrom = this.includedFrom();
        while(includedFrom != null) {
            if (includedFrom.unit().absolutePath() == unit.absolutePath()) {
                return false;
            }

            includedFrom = includedFrom.includedFrom();
        }

        return true;
    }

    directChildren(inc:ASTNode=null,anc:ASTNode=null,inOneMemberMap:boolean=true):lowlevel.ILowLevelASTNode[] {
        if (this._node) {
            switch (this._node.kind) {
                case yaml.Kind.SCALAR:
                    return [];
                case yaml.Kind.MAP:
                {
                    var map:yaml.YamlMap = <yaml.YamlMap>this._node;
                    if (map.mappings.length == 1 && !inOneMemberMap) {
                        //handle map with one member case differently
                        return new ASTNode(map.mappings[0].value, this._unit, this, inc, anc).directChildren(null, null, true);
                    }
                    return map.mappings.map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include));
                }
                case yaml.Kind.MAPPING:
                {
                    var mapping:yaml.YAMLMapping = <yaml.YAMLMapping>this._node;
                    if (mapping.value == null) {
                        return [];
                    }
                    return new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include).directChildren();
                }
                case yaml.Kind.SEQ:
                {
                    var seq:yaml.YAMLSequence = <yaml.YAMLSequence>this._node;
                    return seq.items.filter(x=>x!=null).map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include));
                }
                case yaml.Kind.INCLUDE_REF:
                {
                    return [];
                }
                case yaml.Kind.ANCHOR_REF:
                {
                    return [];
                }
            }
            throw new Error("Should never happen; kind : " + yaml.Kind[this._node.kind]);
        }
        return []
    }

    anchorId():string {
        return this._node.anchorId;
    }

    unit():lowlevel.ICompilationUnit {
        return this._unit;
        //if(this._unit) return this._unit;
        //if(!this.parent()) return null;
        //return this.parent().unit();
    }

    setUnit(unit: lowlevel.ICompilationUnit) {
        this._unit = unit;
    }

    includePath():string {
        var includeString = this.getIncludeString();
        if (!includeString) {
            return null;
        }

        return includeString;
    }

    includeReference(): refResolvers.IncludeReference {
        var includeString = this.getIncludeString();
        if (!includeString) {
            return null;
        }

        return refResolvers.getIncludeReference(includeString);
    }

    getIncludeString() : string {
        if (this._node.kind==yaml.Kind.INCLUDE_REF){

            var includePath=this._node['value'];
            return includePath;
        } else if (this._node.kind == yaml.Kind.MAPPING) {

            var mapping: yaml.YAMLMapping = <yaml.YAMLMapping> this._node;
            if (mapping.value == null) return null;
            return new ASTNode(mapping.value, this._unit, this, null, null).getIncludeString();
        }

        return null;
    }


    anchoredFrom():lowlevel.ILowLevelASTNode {
        return this._anchor;
    }

    includedFrom():lowlevel.ILowLevelASTNode {
        return this._include;
    }

    kind(): yaml.Kind {
        return this._actualNode().kind;
    }

    valueKind(): yaml.Kind {
        if(this._node.kind != yaml.Kind.MAPPING){
            return null;
        }
        var map:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
        if(!map.value){
            return null;
        }
        return map.value.kind;
    }

    valueKindName(): string {
        var kind = this.valueKind();
        return kind != undefined? yaml.Kind[kind] : null;
    }

    kindName(): string {
        return yaml.Kind[this.kind()];
    }

    indent(lev: number, str: string='') {
        var leading = '';
        //leading += '[' + lev + ']';
        for(var i=0; i<lev; i++) leading += '  ';
        return leading + str;
    }

    replaceNewlines(s: string, rep: string=null): string {
        var res: string = '';
        for(var i=0; i<s.length; i++) {
            var ch = s[i];
            if(ch == '\r') ch = rep == null? '\\r' : rep;
            if(ch == '\n') ch = rep == null? '\\n' : rep;
            res += ch;
        }
        return res;
    }

    shortText(unittext: string, maxlen: number = 50): string {
        var elen = this.end() - this.start();
        var len = elen;
        //var len = Math.min(elen,50);

        var unit = this.unit();

        if(!unittext && unit) {
            unittext = unit.contents();
        }
        var text;
        if (!unittext) {
            text = '[no-unit]';
        } else {
            var s = unittext;
            text = s ? s.substring(this.start(), this.end()) : '[no-text]';
        }
        text =  "[" + this.start() + ".." + this.end() + "] " + elen + " // " + text + ' //';
        if(len < elen) text += '...';

        text = this.replaceNewlines(text);
        return text;
    }

    nodeShortText(node: yaml.YAMLNode, unittext: string, maxlen: number = 50): string {
        var elen = node.endPosition - node.startPosition;
        var len = elen;
        //var len = Math.min(elen,50);
        var unit = this.unit();
        if(!unittext && unit) {
            unittext = unit.contents();
        }
        var text;
        if (!unittext) {
            text = '[no-unit]';
        } else {
            var s = unittext;
            text = s ? s.substring(node.startPosition, node.endPosition) : '[no-text]';
        }
        text =  "[" + node.startPosition + ".." + node.endPosition + "] " + elen + " // " + text + ' //';
        if(len < elen) text += '...';

        text = this.replaceNewlines(text);
        return text;
    }

    show(message: string=null, lev: number=0, text: string = null) {
        if(message && lev == 0) {
            console.log(message);
        }
        var children = this.children();

        var desc = this.kindName();
        var val = (<any>this._actualNode()).value;

        if(this.kind() == yaml.Kind.MAPPING) {
            desc += '[' + (<yaml.YAMLMapping>this._actualNode()).key.value + ']';
        }


        if(val) {
            desc += "/" + yaml.Kind[val.kind];
        } else
            desc += "";


        if(children.length == 0) {
            //desc += "/" + this.value();
            console.log(this.indent(lev) + desc + " // " + this.shortText(text));
            if(this.isMapping() && this.asMapping().value) {
                console.log(this.indent(lev + 1) + '// ' + this.valueKindName() + ': ' + this.nodeShortText(this.asMapping().value, text));
            }
        } else {
            console.log(this.indent(lev) + desc + " { // " + this.shortText(text));
            if(this.isMapping() && this.asMapping().value) {
                console.log(this.indent(lev + 1) + '// ' + this.valueKindName() + ': ' + this.nodeShortText(this.asMapping().value, text));
            }
            children.forEach(node=> {
                var n = <ASTNode>node;
                n.show(null, lev + 1, text);
            })
            console.log(this.indent(lev) + '}');
        }

    }

    showParents(message: string, lev: number=0):number {
        if(message && lev == 0) {
            console.log(message);
        }
        var depth = 0;
        if(this.parent()) {
            var n = <ASTNode>this.parent();
            depth = n.showParents(null, lev + 1);
        }

        var desc = this.kindName();
        var val = (<any>this._actualNode()).value;
        if(val)
            desc += "/" + yaml.Kind[val.kind];
        else
            desc += "/null";

        console.log(this.indent(depth) + desc + " // " + this.shortText(null));

        return depth+1;
    }

    inlined(kind: yaml.Kind): boolean {
        return kind == yaml.Kind.SCALAR ||kind == yaml.Kind.INCLUDE_REF;
    }


    markupNode(xbuf: MarkupIndentingBuffer, node: yaml.YAMLNode, lev: number, json: boolean = false) {
        var start = xbuf.text.length;
        //console.log('node: ' + node);
        switch(node.kind) {
            case yaml.Kind.MAP:
                if(json) xbuf.append('{');
                var mappings = (<yaml.YamlMap>node).mappings;
                //console.log('map: ' + mappings.length);
                for (var i:number = 0; i < mappings.length; i++) {
                    if(json && i>0) xbuf.append(', ');
                    this.markupNode(xbuf, mappings[i], lev, json);
                }
                if(json) xbuf.append('}');
                break;
            case yaml.Kind.SEQ:
                var items = (<yaml.YAMLSequence>node).items;
                //console.log('seq: ' + items.length);
                for (var i:number = 0; i < items.length; i++) {
                    xbuf.append(this.indent(lev, '- '));
                    //this.markupNode(xindent, pos+xbuf.text.length-(lev+1)*2, items[i], lev+1, xbuf);
                    this.markupNode(xbuf, items[i], lev+1, json);
                }
                break;
            case yaml.Kind.MAPPING:
                var mapping = <yaml.YAMLMapping>node;
                var val = mapping.value;
                //console.log('mapping: ' + mapping.key.value + ' ' + val.kind);
                if(json) {
                    xbuf.append(mapping.key.value);
                    xbuf.append(': ');
                    if(val.kind == yaml.Kind.SCALAR) {
                        var sc = <yaml.YAMLScalar>val;
                        xbuf.append(sc.value);
                    } else if(val.kind == yaml.Kind.MAP) {
                        //var mp = <yaml.YamlMap>val;
                        this.markupNode(xbuf, mapping.value, lev+1, json);
                    } else {
                        throw new Error("markup not implemented: " + yaml.Kind[val.kind]);
                    }
                    break;
                }
                xbuf.addWithIndent(lev, mapping.key.value + ':');
                if(!val) {
                    xbuf.append('\n');
                    break;
                }
                if(val.kind == yaml.Kind.SCALAR) {
                    var sc = <yaml.YAMLScalar>val;
                    //if(!sc.value || sc.value.trim().length == 0) break;
                }
                //xbuf.append(this.indent(lev, mapping.key.value + ':'));
                if (mapping.value) {
                    xbuf.append(this.inlined(mapping.value.kind) ? ' ' : '\n');
                    this.markupNode(xbuf, mapping.value, lev+1, json);
                } else {
                    xbuf.append('\n');
                }
                //console.log('xbuf: ' + xbuf);
                break;
            case yaml.Kind.SCALAR:
                var sc = (<yaml.YAMLScalar>node);
                if (textutil.isMultiLine(sc.value)) {
                    xbuf.append('|\n');
                    var lines = splitOnLines(sc.value);
                    for(var i=0; i<lines.length; i++) {
                        xbuf.append(this.indent(lev, lines[i]));
                    }
                    xbuf.append('\n');
                } else {
                    xbuf.append(sc.value + '\n');
                }
                //console.log('SCALAR: ' + textutil.replaceNewlines(sc.value));
                break;
            case yaml.Kind.INCLUDE_REF:
                var ref = (<yaml.YAMLScalar>node);
                xbuf.append('!include ' + ref.value + '\n');
                break;
            default:
                throw new Error('Unknown node kind: ' + yaml.Kind[node.kind]);
        }
        while(start < xbuf.text.length && xbuf.text[start] == ' ') start++;
        node.startPosition = start;
        node.endPosition = xbuf.text.length;
    }

    markup(json: boolean = false): string {
        var buf = new MarkupIndentingBuffer('');
        this.markupNode(buf, this._actualNode(), 0, json);
        return buf.text;
    }


    root(): lowlevel.ILowLevelASTNode {
        var node:ASTNode = this;
        while(node.parent()) {
            var p = <ASTNode>node.parent();
            //if(p.isValueInclude()) break; // stop on include
            node = p;
        }
        return node;
    }

    parentOfKind(kind: yaml.Kind):ASTNode{
        var p = this.parent();
        while(p) {
            if(p.kind() == kind) return p;
            p = p.parent();
        }
        return null;
    }

    find(name: string): ASTNode {
        var found: ASTNode = null;
        //console.log('Looking for: ' + name);
        this.directChildren().forEach(y=>{
            if (y.key() && y.key() == name){
                if(!found) found = <ASTNode>y;
            }
        });
        return found;
    }

    shiftNodes(offset:number, shift:number, exclude?: ASTNode) {
        this.directChildren().forEach(x=> {
            if(exclude && exclude.start()==x.start() && exclude.end()==x.end()) {
                //console.log('exclude node: ' + x.start() + '..' + x.end());
                // exclude
            } else {
                var m = (<ASTNode>x).shiftNodes(offset, shift, exclude);
            }
        })
        if(exclude && exclude.start()==this.start() && exclude.end()==this.end()) {
            // exclude
            //console.log('exclude node: ' + this.start() + '..' + this.end());
        } else {
            var yaNode = this._actualNode();
            if (yaNode) innerShift(offset, yaNode, shift);
        }
        return null;
    }

    isMap(): boolean {
        return this.kind() == yaml.Kind.MAP;
    }

    isMapping(): boolean {
        return this.kind() == yaml.Kind.MAPPING;
    }

    isSeq(): boolean {
        return this.kind() == yaml.Kind.SEQ;
    }

    isScalar(): boolean {
        return this.kind() == yaml.Kind.SCALAR;
    }

    asMap(): yaml.YamlMap {
        if(!this.isMap()) throw new Error("map expected instead of " + this.kindName());
        return <yaml.YamlMap>(this._actualNode());
    }

    asMapping(): yaml.YAMLMapping {
        if(!this.isMapping()) throw new Error("maping expected instead of " + this.kindName());
        return <yaml.YAMLMapping>(this._actualNode());
    }

    asSeq(): yaml.YAMLSequence {
        if(!this.isSeq()) throw new Error("seq expected instead of " + this.kindName());
        return <yaml.YAMLSequence>(this._actualNode());
    }

    asScalar(): yaml.YAMLScalar {
        if(!this.isScalar()) throw new Error("scalar expected instead of " + this.kindName());
        return <yaml.YAMLScalar>(this._actualNode());
    }

    isValueSeq(): boolean {
        return this.valueKind() == yaml.Kind.SEQ;
    }

    isValueMap(): boolean {
        return this.valueKind() == yaml.Kind.MAP;
    }

    isValueInclude(): boolean {
        return this.valueKind() == yaml.Kind.INCLUDE_REF;
    }

    isValueScalar(): boolean {
        return this.valueKind() == yaml.Kind.SCALAR;
    }

    valueAsSeq(): yaml.YAMLSequence {
        if(!this.isMapping()) throw new Error("mapping expected instead of " + this.kindName());
        if(this.valueKind() != yaml.Kind.SEQ) throw new Error("mappng/seq expected instead of mapping/" + this.kindName());
        return <yaml.YAMLSequence>(this.asMapping().value);
    }

    valueAsMap(): yaml.YamlMap {
        if(!this.isMapping()) throw new Error("mapping expected instead of " + this.kindName());
        if(this.valueKind() != yaml.Kind.MAP) throw new Error("mappng/map expected instead of mapping/" + this.kindName());
        return <yaml.YamlMap>(this.asMapping().value);
    }

    valueAsScalar(): yaml.YAMLScalar {
        if(!this.isMapping()) throw new Error("mapping expected instead of " + this.kindName());
        if(this.valueKind() != yaml.Kind.SCALAR) throw new Error("mappng/scalar expected instead of mapping/" + this.kindName());
        return <yaml.YAMLScalar>(this.asMapping().value);
    }

    valueAsInclude(): yaml.YAMLScalar {
        if(!this.isMapping()) throw new Error("mapping expected instead of " + this.kindName());
        if(this.valueKind() != yaml.Kind.INCLUDE_REF) throw new Error("mappng/include expected instead of mapping/" + this.kindName());
        return <yaml.YAMLScalar>(this.asMapping().value);
    }

    text(unitText: string = null): string {
        if(!unitText) {
            if(!this.unit())
                return '[no-text]';
            unitText = this.unit().contents();

        }
        return unitText.substring(this.start(), this.end());
    }

    copy(): ASTNode {
        var yn = copyNode(this._actualNode());
       return new ASTNode(yn, this._unit, this._parent, this._anchor, this._include, this._includesContents);
    }

    nodeDefinition(): highlevel.INodeDefinition{
        return getDefinitionForLowLevelNode(this);
    }

}

export enum InsertionPointType {
    NONE, START, END, POINT
}

export class InsertionPoint {

    type: InsertionPointType;
    point: ASTNode;

    constructor(type: InsertionPointType, point: ASTNode=null) {
        this.type = type;
        this.point = point;
    }

    static after(point: ASTNode) {
        return new InsertionPoint(InsertionPointType.POINT, point);
    }

    static atStart() {
        return new InsertionPoint(InsertionPointType.START);
    }

    static atEnd() {
        return new InsertionPoint(InsertionPointType.END);
    }

    static node() {
        return new InsertionPoint(InsertionPointType.NONE);
    }

    show(msg: string) {
        if(msg) {
            console.log(msg);
            console.log('  insertion point type: ' + InsertionPointType[this.type]);
        } else {
            console.log('insertion point type: ' + InsertionPointType[this.type]);
        }
        if(this.type == InsertionPointType.POINT && this.point) {
            this.point.show();
        }
    }
}

export function createNode(key:string,parent?:ASTNode){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),yaml.newMap());
    return new ASTNode(node,null,parent,null,null);
}

export function createMap(mappings: yaml.YAMLMapping[]){
    //console.log('create node: ' + key);
    var node = yaml.newMap(mappings);
    return new ASTNode(node,null,null,null,null);
}

export function createScalar(value: string){
    var node = yaml.newScalar(value);
    return new ASTNode(node,null,null,null,null);
}

export function createSeq(sn: yaml.YAMLSequence, parent: ASTNode, unit: CompilationUnit) {
    return new ASTNode(sn, unit, parent, null, null);
}

/*
export function createMappingWithMap(key:string, map: yaml.YAMLNode){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),map);
    return new ASTNode(node,null,null,null,null);
}

export function createMap(){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMap();
    return new ASTNode(node,null,null,null,null);
}
*/

export function createSeqNode(key:string){
    var node:yaml.YAMLNode = yaml.newMapping(yaml.newScalar(key), yaml.newItems());
    return new ASTNode(node,null,null,null,null);
}

export function createMapNode(key:string){
    var node:yaml.YAMLNode = yaml.newMapping(yaml.newScalar(key), yaml.newMap());
    return new ASTNode(node,null,null,null,null);
}

export function createMapping(key:string,v:string){
    //console.log('create mapping: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),yaml.newScalar(v));
    return new ASTNode(node,null,null,null,null);
}

export function toChildCahcingNode(node:lowlevel.ILowLevelASTNode):lowlevel.ILowLevelASTNode{
    if(!(node instanceof ASTNode)){
        return null;
    }
    var astNode:ASTNode = <ASTNode>node;
    var result = new ASTNode(astNode.yamlNode(), <CompilationUnit>astNode.unit(), null, null, null, true);
    result._errors = astNode._errors;
    return result;
}

export function toIncludingNode(node:lowlevel.ILowLevelASTNode):lowlevel.ILowLevelASTNode{
    if(!(node instanceof ASTNode)){
        return null;
    }
    var astNode:ASTNode = <ASTNode>node;
    var result = new ASTNode(astNode.yamlNode(), <CompilationUnit>astNode.unit(), null, null, null, false);
    result._errors = astNode._errors;
    return result;
}

export function getDefinitionForLowLevelNode(node:lowlevel.ILowLevelASTNode):highlevel.INodeDefinition{
    var hl = node.highLevelNode();
    if(hl){
        return hl.definition();
    }
    var parent = node.parent();
    if(!parent){
        return null;
    }
    var key = node.key();
    if(!key){
        return null;
    }
    var parentDef = parent.nodeDefinition();
    if(!parentDef){
        return null;
    }
    if(!parentDef.property){
        return null;
    }
    var prop = parentDef.property(key);
    if(!prop){
        return null;
    }
    return <highlevel.INodeDefinition>prop.range();
}

export function fetchIncludesAsync(project:lowlevel.IProject,apiPath:string):Promise<lowlevel.ICompilationUnit>{

    var map:{[key:string]:boolean}={};
    var errors:{[key:string]:string}={};

    var nodes:lowlevel.ILowLevelASTNode[] = [];
    var units:lowlevel.ICompilationUnit[] = [];

    var processUnits = (ind:number):Promise<any>=>{
        var refs: Promise<any>[] = [];

        var lMap:{[key:string]:lowlevel.ILowLevelASTNode[]} = {};
        while(ind<units.length) {
            var unit = units[ind];
            var unitPath = path.dirname(unit.absolutePath());
            var includeNodes = unit.getIncludeNodes();
            includeNodes.forEach(x=>{
                var ip = x.includePath();

                var includeReference = refResolvers.getIncludeReference(ip);

                if(includeReference) {
                    refs.push((<Project>project).resolveAsync(unit.absolutePath(), ip));

                    return;
                }

                if (!ip) return;
                var absIncludePath = toAbsolutePath(unitPath,ip);


                if(map[absIncludePath]){
                    return;
                }
                if(errors[absIncludePath]){
                    x.errors().push(new Error(errors[ip]));
                    return;
                }
                var arr = lMap[absIncludePath];
                if(!arr){
                    arr = [];
                    lMap[absIncludePath] = arr;
                }
                arr.push(x);
            });
            ind++;
        }
        var unitPaths = Object.keys(lMap);
        if(refs.length == 0 && unitPaths.length==0){
            return Promise.resolve();
        }
        var promises:Promise<void>[] = refs;
        unitPaths.forEach(unitPath=>{
            promises.push((<Project>project).unitAsync(unitPath, true).then(x=>{
                if(!map[x.absolutePath()]) {
                    map[x.absolutePath()] = true;
                    units.push(x);
                }
            },x=>{
                lMap[unitPath].forEach(node=>node.errors().push(new Error(x)));
                errors[unitPath] = x;
            }));
        });
        return Promise.all(promises).then(x=>{
            return processUnits(ind);
        });
    }

    return project.unitAsync(apiPath).then(x=>{
        units.push(x);
        map[x.absolutePath()] = true;
        return processUnits(0);
    }).then(x=>{
        return units.length > 0 ? units[0] : null;
    })
}

function toAbsolutePath(rootPath:string,relPath:string) {
    if (isWebPath(relPath)){
        return relPath;
    }
    var apath:string;
    if (isWebPath(rootPath)) {
        var rp = util.stringEndsWith(rootPath,"/") ? rootPath : rootPath + "/";
        apath = URL.resolve(rp,relPath);
    } else {
        apath = path.resolve(rootPath, relPath);
    }
    return apath;
}

function isWebPath(str):boolean {
    if (str == null) return false;

    return util.stringStartsWith(str,"http://") || util.stringStartsWith(str,"https://");
}