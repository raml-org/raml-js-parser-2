/// <reference path="../../../typings/main.d.ts" />
/**
 * Created by kor on 05/05/15.
 */
import Error = require("./js-yaml/exception");
import lowlevel = require("../lowLevelAST");
import highlevel = require("../highLevelAST");
import yaml = require("./yamlAST");
export declare class CompilationUnit implements lowlevel.ICompilationUnit {
    protected _absolutePath: string;
    protected _path: string;
    protected _content: string;
    protected _project: lowlevel.IProject;
    protected _isTopoLevel: boolean;
    protected serializeOptions: SerializeOptions;
    constructor(_absolutePath: string, _path: string, _content: string, _project: lowlevel.IProject, _isTopoLevel: boolean, serializeOptions?: SerializeOptions);
    protected _node: AstNode;
    absolutePath(): string;
    clone(): any;
    contents(): string;
    lexerErrors(): Error[];
    path(): string;
    isTopLevel(): boolean;
    ast(): AstNode;
    isDirty(): boolean;
    getIncludeNodes(): lowlevel.ILowLevelASTNode[];
    resolveAsync(p: string): Promise<lowlevel.ICompilationUnit>;
    isRAMLUnit(): boolean;
    project(): lowlevel.IProject;
    updateContent(newContent: string): void;
    ramlVersion(): string;
    lineMapper(): lowlevel.LineMapper;
    resolve(p: string): lowlevel.ICompilationUnit;
}
export declare class AstNode implements lowlevel.ILowLevelASTNode {
    private _unit;
    protected _object: any;
    protected _parent: AstNode;
    protected options: SerializeOptions;
    protected _key: string;
    keyKind(): any;
    constructor(_unit: CompilationUnit, _object: any, _parent?: AstNode, options?: SerializeOptions, _key?: string);
    private _highLevelNode;
    private _highLevelParseResult;
    private _isOptional;
    start(): number;
    end(): number;
    value(): any;
    actual(): any;
    includeErrors(): any[];
    includePath(): any;
    includeReference(): any;
    key(): string;
    optional(): boolean;
    children(): any;
    parent(): AstNode;
    unit(): CompilationUnit;
    anchorId(): any;
    errors(): any[];
    anchoredFrom(): AstNode;
    includedFrom(): AstNode;
    visit(v: lowlevel.ASTVisitor): void;
    dumpToObject(): any;
    addChild(n: lowlevel.ILowLevelASTNode): void;
    execute(cmd: lowlevel.CompositeCommand): void;
    dump(): string;
    keyStart(): number;
    keyEnd(): number;
    valueStart(): number;
    valueEnd(): number;
    isValueLocal(): boolean;
    kind(): yaml.Kind;
    valueKind(): any;
    show(msg: string): void;
    setHighLevelParseResult(highLevelParseResult: highlevel.IParseResult): void;
    highLevelParseResult(): highlevel.IParseResult;
    setHighLevelNode(highLevel: highlevel.IHighLevelNode): void;
    highLevelNode(): highlevel.IHighLevelNode;
    text(unitText: string): string;
    copy(): AstNode;
    markup(json?: boolean): string;
    nodeDefinition(): highlevel.INodeDefinition;
    includesContents(): boolean;
}
export interface SerializeOptions {
    escapeNumericKeys?: boolean;
    writeErrors?: boolean;
}
export declare function serialize(node: lowlevel.ILowLevelASTNode, options?: SerializeOptions): any;
