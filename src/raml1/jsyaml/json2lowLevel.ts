/// <reference path="../../../typings/main.d.ts" />

/**
 * Created by kor on 05/05/15.
 */
import yaml=require("yaml-ast-parser")
import lowlevel=require("../lowLevelAST")
import highlevel=require("../highLevelAST")
import hlimpl=require("../highLevelImpl")

import util=require("../../util/index")
import llImpl=require("./jsyaml2lowLevel")
var Error=yaml.YAMLException
export class CompilationUnit implements lowlevel.ICompilationUnit{

    constructor(
        protected _absolutePath:string,
        protected _path:string,
        protected _content:string,
        protected _project:lowlevel.IProject,
        protected _isTopoLevel:boolean,
        protected serializeOptions:SerializeOptions = {}){

        this._node = new AstNode(this,JSON.parse(this._content),null,serializeOptions);
    }

    highLevel():highlevel.IParseResult{
        return hlimpl.fromUnit(this);
    }

    protected _node:AstNode;

    absolutePath(){
        return this._absolutePath;
    }
    clone(){
        return null;
    }

    contents(){
        return this._content;
    }
    lexerErrors():Error[]{
        return []
    }
    path(){
        return this._content;
    }

    isTopLevel(){
        return this._isTopoLevel;
    }

    ast(){
        return this._node;
    }

    expandedHighLevel():highlevel.IParseResult
    {
        return this.highLevel();
    }

    isDirty(){
        return true;
    }

    getIncludeNodes(): lowlevel.ILowLevelASTNode[]{
        return [];
    }
    resolveAsync(p:string):Promise<lowlevel.ICompilationUnit>{
        return null;
    }

    isRAMLUnit(){
        return true;
    }

    project(){
        return this._project;
    }

    updateContent(newContent:string){}

    ramlVersion():string{

        throw new Error('not implemented');
    }

    lineMapper():lowlevel.LineMapper{ return new lowlevel.LineMapperImpl(this.contents(),this.absolutePath()); }
    
    resolve(p: string) : lowlevel.ICompilationUnit { return null; } // TODO FIXME 

    /**
     * Returns true if this unit is overlay or extension, false otherwise.
     */
    isOverlayOrExtension() : boolean {
        return false;
    }

    /**
     * Returns master reference if presents, null otherwise.
     */
    getMasterReferenceNode() : lowlevel.ILowLevelASTNode {
        return null;
    }
}

//export interface IProject{
//    units():ICompilationUnit[];//returns units with apis in this folder
//
//    execute(cmd:CompositeCommand)
//
//    executeTextChange(textCommand:TextChangeCommand);//this may result in broken nodes?
//
//    addListener(listener:IASTListener);
//
//    removeListener(listener:IASTListener)
//
//    addTextChangeListener(listener:ITextChangeCommandListener);
//    removeTextChangeListener(listener:ITextChangeCommandListener);
//}

//export interface IASTListener{
//    (delta:ASTDelta)
//}
//
//export interface ITextChangeCommandListener{
//    (delta:TextChangeCommand)
//}
//export class ASTDelta{
//    commands:ASTChangeCommand[]
//}
//export interface ASTVisitor{
//    (node:ILowLevelASTNode):boolean
//}

export class AstNode implements lowlevel.ILowLevelASTNode{

    keyKind(){

        return null;
    }
    isAnnotatedScalar(){
        return false;
    }
    hasInnerIncludeError(){
        return false;
    }

    constructor(
        private _unit:lowlevel.ICompilationUnit,
        protected _object:any,
        protected _parent ?:lowlevel.ILowLevelASTNode,
        protected options:SerializeOptions={},
        protected _key?:string
        ){

        if(this._object instanceof Object) {
            Object.keys(this._object).forEach(x=> {
                var u = unescapeKey(x,this.options);
                if (u != x) {
                    var val = this._object[x];
                    delete this._object[x];
                    this._object[u] = val;
                }
            });
        }
        if(this._key){
            if(util.stringEndsWith(this._key,'?')){
                this._isOptional = true;
                this._key = this._key.substring(0,this._key.length-1);
            }
        }
    }


    private _highLevelNode:highlevel.IHighLevelNode

    private _highLevelParseResult:highlevel.IParseResult

    private _isOptional:boolean = false;

    start(){ return -1; }

    end(){ return -1; }

    value(){
        return this._object;
    }

    actual(): any{
        return this._object;
    }

    includeErrors(){return [];}

    includePath(){return null;}

    includeReference(){return null;}

    key(){ return this._key; }

    optional():boolean { return this._isOptional; }

    children(){

        if(!this._object){
            return [];
        }

        if(Array.isArray(this._object)){
            return this._object.map(x=>new AstNode(this._unit,x,this,this.options));
        }
        else if(this._object instanceof Object){
            return Object.keys(this._object).map(x=>new AstNode(this._unit,this._object[x],this,this.options,x));
        }
        else{
            return [];
        }
    }

    parent(){ return this._parent; }

    unit(){ return this._unit; }

    includeBaseUnit(){ return this._unit; }

    anchorId(){ return null; }

    errors(){ return []; }

    anchoredFrom(){ return this; }

    includedFrom(){ return this; }

    visit(v:lowlevel.ASTVisitor){
        if(v(this)){
            this.children().forEach(x=>x.visit(v));
        }
    }
    dumpToObject(){
        return this._object;
    }

    addChild(n:lowlevel.ILowLevelASTNode){}

    execute(cmd:lowlevel.CompositeCommand){}

    dump(){ return JSON.stringify(this._object)}

    keyStart(){ return -1; }

    keyEnd(){ return -1; }

    valueStart(){ return -1; }

    valueEnd(){ return -1; }

    isValueLocal(){ return true; }

    kind(){
        if(Array.isArray(this._object)){
            return yaml.Kind.SEQ;
        }
        else if(this._object instanceof Object){
            return yaml.Kind.MAP;
        }
        else{
            return yaml.Kind.SCALAR;
        }
    }

    valueKind(){
        if(!this._object){
            return null;
        }

        var valType = typeof this._object;
        if(Array.isArray(this._object)){
            return yaml.Kind.SEQ;
        }
        else if(valType == "object"){
            return yaml.Kind.MAP;
        }
        else if(valType == "string"||valType=="number"||valType=="boolean"){
            return yaml.Kind.SCALAR;
        }
        return null;
    }

    show(msg: string){}

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

    text(unitText:string):string {
        throw new Error("not implemented");
    }

    copy():AstNode{
        throw new Error("not implemented");
    }

    markup(json?: boolean): string {
        throw new Error("not implemented");
    }

    nodeDefinition(): highlevel.INodeDefinition{
        return llImpl.getDefinitionForLowLevelNode(this);
    }

    includesContents() : boolean {
        return false;
    }
}

export interface SerializeOptions{

    escapeNumericKeys?:boolean

    writeErrors?:boolean
}

export function serialize(node:lowlevel.ILowLevelASTNode,options:SerializeOptions={}):any{
    if(node.children().length==0) {
        return node.value();
    }

    if(!node.children()[0].key()){
        var arr = []
        node.children().forEach(x=> {
            arr.push(serialize(x,options));
        });
        return arr;
    }
    else {
        var obj = {};
        node.children().forEach(x=> {
            obj[escapeKey(x.key(),options)] = serialize(x,options);
        });
        if(options&&options.writeErrors){
            var errors = collectErrors(node);
            if(errors != null && errors.length>0) {
                obj['__$errors__'] = errors;
            }
        }
        return obj;
    }
}

function collectErrors(node:lowlevel.ILowLevelASTNode):Error[]{

    var errors:Error[] = [].concat(node.errors());
    node.children().forEach(ch=>{
        var children = ch.children();
        if(children.length==0){
            ch.errors().forEach(e=>errors.push(e));
            return;
        }
        if(!children[0].key()){
            children.forEach(x=>{
                if(x.children().length==0){
                    x.errors().forEach(e=>errors.push(e));
                }
            });
        }
    });
    return errors;
}

function escapeKey(key:string,options:SerializeOptions):string{
    if(!options||!key){
        return key;
    }
    if(options.escapeNumericKeys && key.replace(/\d/g,'').trim().length==0){
        return '__$EscapedKey$__' +key;
    }
    return key;

}

function unescapeKey(key:string,options:SerializeOptions):string{
    if(!key){
        return key;
    }
    options = options || {};
    if(options.escapeNumericKeys
        &&util.stringStartsWith(key,'__$EscapedKey$__')
        &&key.substring('__$EscapedKey$__'.length).replace(/\d/g,'').trim().length==0){
        return key.substring('__$EscapedKey$__'.length);
    }
    return key;
}