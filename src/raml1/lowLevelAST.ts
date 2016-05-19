
/**
 * Created by kor on 05/05/15.
 */
import yaml=require("yaml-ast-parser")
import highlevel=require("./highLevelAST")
import {IParseResult} from "../index";
import resolversApi=require("./jsyaml/resolversApi")

export interface ICompilationUnit{

    contents():string

    path():string
    absolutePath():string

    isTopLevel():boolean

    ast():ILowLevelASTNode;

    clone():ICompilationUnit;
    isDirty():boolean;

    isRAMLUnit():boolean

    project():IProject;

    lexerErrors():Error[];

    resolve(p:string):ICompilationUnit;


    resolveAsync(p:string):Promise<ICompilationUnit>;

    /**
     * gathers includes over ast without actual resolving of units;
     */
    getIncludeNodes(): { includePath(): string}[]

    updateContent(newContent:string);//unsafe remove later

    lineMapper():LineMapper;

    highLevel():IParseResult;
    expandedHighLevel():highlevel.IParseResult

    /**
     * Returns true if this unit is overlay or extension, false otherwise.
     */
    isOverlayOrExtension() : boolean;

    /**
     * Returns master reference if presents, null otherwise.
     */
    getMasterReferenceNode() : ILowLevelASTNode;
    //ramlVersion():string
}

export interface IProject{
    units():ICompilationUnit[];//returns units with apis in this folder

    unit(path:string,absolute?:boolean):ICompilationUnit

    unitAsync(path:string):Promise<ICompilationUnit>

    lexerErrors():Error[]

    deleteUnit(n:string);

    cloneWithResolver(r:any):IProject

    cloneWithResolver(newResolver:resolversApi.FSResolver,httpResolver?:resolversApi.HTTPResolver):IProject;


    execute(cmd:CompositeCommand)

    executeTextChange(textCommand:TextChangeCommand);//this may result in broken nodes?

    addListener(listener:IASTListener);

    removeListener(listener:IASTListener)

    addTextChangeListener(listener:ITextChangeCommandListener);
    removeTextChangeListener(listener:ITextChangeCommandListener);

    setCachedUnitContent(path:string,content?:string)
}
export interface IASTListener{
    (delta:ASTDelta)
}

export interface ITextChangeCommandListener{
    (delta:TextChangeCommand)
}
export class ASTDelta{
    commands:ASTChangeCommand[]
}
export interface ASTVisitor{
    (node:ILowLevelASTNode):boolean
}

export interface IncludeReference {
    getFragments(): string[];
    getIncludePath(): string;
    asString(): string;
    encodedName(): string;
}
export interface ILowLevelASTNode{

    start():number
    end():number

    value(toString?:boolean):any

    hasInnerIncludeError():boolean
    includeErrors():string[]

    includePath():string

    includeReference(): IncludeReference

    key():string

    optional():boolean

    actual(): any

    children():ILowLevelASTNode[];
    parent():ILowLevelASTNode;

    unit():ICompilationUnit

    /**
     * Returns a unit, which is a base for include reference.
     * This method should be called when a node may potentially hbe defined in several units
     * at once (in case of expansion) and caller needs a unit, which is a base for this node's
     * include statement.
     *
     * If this node has no include statement, return value of the method should be equal to the result of
     * unit() method call.
     */
    includeBaseUnit():ICompilationUnit

    anchorId():string

    errors():Error[]

    anchoredFrom():ILowLevelASTNode;//back link in anchorId
    includedFrom():ILowLevelASTNode;//back link in includepath
    visit(v:ASTVisitor)

    addChild(n:ILowLevelASTNode, pos?: number)

    execute(cmd:CompositeCommand)
    isAnnotatedScalar():boolean

    dump():string
    dumpToObject(full?:boolean):any

    keyStart():number;
    keyEnd():number;

    valueStart():number;
    valueEnd():number;

    isValueLocal():boolean;

    kind(): yaml.Kind;

    valueKind(): yaml.Kind;
    keyKind(): yaml.Kind;

    show(msg: string, lev?: number, text?: string);
    markup(json?: boolean): string;

    highLevelParseResult():highlevel.IParseResult


    setHighLevelParseResult(highLevel:highlevel.IParseResult)

    highLevelNode():highlevel.IHighLevelNode

    setHighLevelNode(highLevelParseResult:highlevel.IHighLevelNode)

    text(unitText: string): string;

    copy(): ILowLevelASTNode

    nodeDefinition(): highlevel.INodeDefinition;

    /**
     * Indicates that contents of this node are !included
     */
    includesContents() : boolean;
}

export enum CommandKind{
    ADD_CHILD,
    REMOVE_CHILD,
    MOVE_CHILD,
    CHANGE_KEY,
    CHANGE_VALUE,
    INIT_RAML_FILE
}
export class TextChangeCommand{
    offset:number;

    constructor(offset:number, replacementLength:number, text:string, unit:ICompilationUnit, target: ILowLevelASTNode = null) {
        this.offset = offset;
        this.replacementLength = replacementLength;
        this.text = text;
        this.unit = unit;
        this.target = target;
    }

    replacementLength:number;
    text:string;
    unit:ICompilationUnit;
    target: ILowLevelASTNode;
    isUndefined: boolean;
}

export class CompositeCommand{
    source:any;
    timestamp:number;
    commands:ASTChangeCommand[]=[]
}

export enum InsertionPointType {
    NONE, START, END, POINT
}

export interface InsertionPoint {

    type:InsertionPointType;
    point:ILowLevelASTNode;
}

export class ASTChangeCommand{
    constructor(kind:CommandKind, target:ILowLevelASTNode, value:string|ILowLevelASTNode, position:number) {
        this.kind = kind;
        this.target = target;
        this.value = value;
        this.position = position;
    }
    toSeq:boolean=false;
    insertionPoint:ILowLevelASTNode|InsertionPoint;
    kind:CommandKind;
    target:ILowLevelASTNode;
    value: string|ILowLevelASTNode;
    position:number;//only relevant for children modification
}
export function setAttr(t:ILowLevelASTNode,value:string):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_VALUE,t,value,-1)
}
export function setAttrStructured(t:ILowLevelASTNode,value:highlevel.IStructuredValue):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_VALUE,t,value.lowLevel(),-1)
}
export function setKey(t:ILowLevelASTNode,value:string):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_KEY,t,value,-1)
}
export function removeNode(t:ILowLevelASTNode,child:ILowLevelASTNode):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.REMOVE_CHILD,t,child,-1)
}


export function insertNode(t:ILowLevelASTNode,child:ILowLevelASTNode,insertAfter:ILowLevelASTNode|InsertionPoint=null,toSeq:boolean=false):ASTChangeCommand{
    var s= new ASTChangeCommand(CommandKind.ADD_CHILD,t,child,-1);
    s.insertionPoint=insertAfter;
    s.toSeq=toSeq;
    return s;
}
export function initRamlFile(root:ILowLevelASTNode, newroot:ILowLevelASTNode):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.INIT_RAML_FILE,root,newroot,-1);
}

export interface ILowLevelEnvironment{
    createProject(path:string):IProject
}

export interface TextPosition{

    /**
     * Line number, starting from one
     */
    line: number

    /**
     * Column number, starting from one
     */
    column: number

    /**
     * Character index in whole text, starting from zero
     */
    position: number
}

export interface LineMapper{

    position(pos:number):TextPosition

}

export class LineMapperImpl implements LineMapper{

    constructor(private content:string, private absPath:string){}

    private mapping: number[];


    position(_pos:number):TextPosition{

        var pos = _pos;
        this.initMapping();
        for(var i = 0 ; i < this.mapping.length; i++){
            var lineLength = this.mapping[i];
            if(pos < lineLength){
                return {
                    line: i,
                    column: pos,
                    position: _pos
                }
            }
            pos -= lineLength;
        }

        if (pos == 1) {
            //sometimes YAML library reports an error at a position of document length + 1, no idea what they want
            //to tell us that way
            return {
                line: this.mapping.length - 1,
                column: this.mapping[this.mapping.length-1]-1,
                position: _pos-1
            }
        }


        throw new Error(`Character position exceeds text length: ${_pos} > + ${this.content.length}.
Unit path: ${this.absPath}`);
    }

    initMapping(){

        if(this.mapping!=null){
            return;
        }

        if(this.content==null){
            throw new Error(`Line Mapper has been given null content${this.absPath!=null
                ?('. Path: ' + this.absPath): ' and null path.'}`);
        }
        this.mapping = [];

        var ind = 0;
        var l = this.content.length;
        for(var i = 0 ; i < l; i++){

            if(this.content.charAt(i)=='\r'){
                if(i < l-1 && this.content.charAt(i+1)=='\n'){
                    this.mapping.push(i-ind + 2);
                    ind = i+2;
                    i++;
                }
                else{
                    this.mapping.push(i-ind + 1);
                    ind = i+1;
                }
            }
            else if(this.content.charAt(i)=='\n'){
                this.mapping.push(i-ind + 1);
                ind = i+1;
            }
        }
        this.mapping.push(l-ind);
    }
}