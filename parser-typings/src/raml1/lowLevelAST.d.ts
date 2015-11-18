/// <reference path="../../typings/tsd.d.ts" />
/**
 * Created by kor on 05/05/15.
 */
import Error = require("./jsyaml/js-yaml/exception");
import yaml = require("./jsyaml/yamlAST");
import highlevel = require("./highLevelAST");
import hi = require("./highLevelImpl");
import jsyaml = require("./jsyaml/jsyaml2lowLevel");
export interface ICompilationUnit {
    contents(): string;
    path(): string;
    absolutePath(): string;
    isTopLevel(): boolean;
    ast(): ILowLevelASTNode;
    clone(): ICompilationUnit;
    isDirty(): boolean;
    isRAMLUnit(): boolean;
    project(): IProject;
    lexerErrors(): Error[];
    resolve(p: string): ICompilationUnit;
    resolveAsync(p: string): Promise<ICompilationUnit>;
    /**
     * gathers includes over ast without actual resolving of units;
     */
    getIncludeNodes(): ILowLevelASTNode[];
    updateContent(newContent: string): any;
}
export interface IProject {
    units(): ICompilationUnit[];
    unit(path: string): ICompilationUnit;
    unitAsync(path: string): Promise<ICompilationUnit>;
    lexerErrors(): Error[];
    execute(cmd: CompositeCommand): any;
    executeTextChange(textCommand: TextChangeCommand): any;
    addListener(listener: IASTListener): any;
    removeListener(listener: IASTListener): any;
    addTextChangeListener(listener: ITextChangeCommandListener): any;
    removeTextChangeListener(listener: ITextChangeCommandListener): any;
}
export interface IASTListener {
    (delta: ASTDelta): any;
}
export interface ITextChangeCommandListener {
    (delta: TextChangeCommand): any;
}
export declare class ASTDelta {
    commands: ASTChangeCommand[];
}
export interface ASTVisitor {
    (node: ILowLevelASTNode): boolean;
}
export interface ILowLevelASTNode {
    start(): number;
    end(): number;
    value(): any;
    includeErrors(): string[];
    includePath(): string;
    key(): string;
    actual(): any;
    children(): ILowLevelASTNode[];
    parent(): ILowLevelASTNode;
    unit(): ICompilationUnit;
    anchorId(): string;
    errors(): Error[];
    anchoredFrom(): ILowLevelASTNode;
    includedFrom(): ILowLevelASTNode;
    visit(v: ASTVisitor): any;
    addChild(n: ILowLevelASTNode, pos?: number): any;
    execute(cmd: CompositeCommand): any;
    dump(): string;
    dumpToObject(full?: boolean): any;
    keyStart(): number;
    keyEnd(): number;
    valueStart(): number;
    valueEnd(): number;
    isValueLocal(): boolean;
    kind(): yaml.Kind;
    valueKind(): yaml.Kind;
    show(msg: string, lev?: number, text?: string): any;
    markup(json?: boolean): string;
    highLevelParseResult(): highlevel.IParseResult;
    setHighLevelParseResult(highLevel: highlevel.IParseResult): any;
    highLevelNode(): highlevel.IHighLevelNode;
    setHighLevelNode(highLevelParseResult: highlevel.IHighLevelNode): any;
    text(unitText: string): string;
    copy(): ILowLevelASTNode;
    nodeDefinition(): highlevel.INodeDefinition;
}
export declare enum CommandKind {
    ADD_CHILD = 0,
    REMOVE_CHILD = 1,
    MOVE_CHILD = 2,
    CHANGE_KEY = 3,
    CHANGE_VALUE = 4,
    INIT_RAML_FILE = 5,
}
export declare class TextChangeCommand {
    offset: number;
    constructor(offset: number, replacementLength: number, text: string, unit: ICompilationUnit, target?: ILowLevelASTNode);
    replacementLength: number;
    text: string;
    unit: ICompilationUnit;
    target: ILowLevelASTNode;
    isUndefined: boolean;
}
export declare class CompositeCommand {
    source: any;
    timestamp: number;
    commands: ASTChangeCommand[];
}
export declare class ASTChangeCommand {
    constructor(kind: CommandKind, target: ILowLevelASTNode, value: string | ILowLevelASTNode, position: number);
    toSeq: boolean;
    insertionPoint: ILowLevelASTNode | jsyaml.InsertionPoint;
    kind: CommandKind;
    target: ILowLevelASTNode;
    value: string | ILowLevelASTNode;
    position: number;
}
export declare function setAttr(t: ILowLevelASTNode, value: string): ASTChangeCommand;
export declare function setAttrStructured(t: ILowLevelASTNode, value: hi.StructuredValue): ASTChangeCommand;
export declare function setKey(t: ILowLevelASTNode, value: string): ASTChangeCommand;
export declare function removeNode(t: ILowLevelASTNode, child: ILowLevelASTNode): ASTChangeCommand;
export declare function insertNode(t: ILowLevelASTNode, child: ILowLevelASTNode, insertAfter?: ILowLevelASTNode | jsyaml.InsertionPoint, toSeq?: boolean): ASTChangeCommand;
export declare function initRamlFile(root: ILowLevelASTNode, newroot: ILowLevelASTNode): ASTChangeCommand;
export interface ILowLevelEnvironment {
    createProject(path: string): IProject;
}
