/// <reference path="../../../typings/main.d.ts" />
import yaml = require("./yamlAST");
import lowlevel = require("../lowLevelAST");
import highlevel = require("../highLevelAST");
import Error = require("./js-yaml/exception");
import rr = require("./resourceRegistry");
export declare var Kind: {
    SCALAR: yaml.Kind;
};
export declare class MarkupIndentingBuffer {
    text: string;
    indent: string;
    constructor(indent: string);
    isLastNL(): boolean;
    addWithIndent(lev: number, s: string): void;
    addChar(ch: string): void;
    append(s: string): void;
}
export declare class CompilationUnit implements lowlevel.ICompilationUnit {
    private _path;
    private _content;
    private _tl;
    private _project;
    private _apath;
    constructor(_path: any, _content: any, _tl: any, _project: Project, _apath: string);
    private stu;
    private _lineMapper;
    isStubUnit(): boolean;
    resolveAsync(p: string): Promise<lowlevel.ICompilationUnit>;
    getIncludeNodes(): lowlevel.ILowLevelASTNode[];
    cloneToProject(p: Project): CompilationUnit;
    clone(): CompilationUnit;
    stub(): CompilationUnit;
    isDirty(): boolean;
    absolutePath(): string;
    isRAMLUnit(): boolean;
    contents(): string;
    resolve(p: string): lowlevel.ICompilationUnit;
    path(): string;
    private errors;
    lexerErrors(): Error[];
    ast(): ASTNode;
    private _node;
    isTopLevel(): boolean;
    updateContent(n: string): void;
    updateContentSafe(n: string): void;
    project(): Project;
    lineMapper(): lowlevel.LineMapper;
}
export interface FSResolver {
    /**
     * Load file content synchronosly
     * @param path File path
     * @return File content as string
     **/
    content(path: string): string;
    /**
     * Load file content asynchronosly
     * @param path File path
     * @return File content as string
     **/
    contentAsync(path: string): Promise<string>;
}
/**
 * @hidden
 **/
export interface ExtendedFSResolver extends FSResolver {
    /**
     * List directory synchronosly
     * @param path Directory path
     * @return Names list of files located in the directory
     **/
    list(path: string): string[];
    /**
     * List directory asynchronosly
     * @param path Directory path
     * @return Names list of files located in the directory
     **/
    listAsync(path: string): Promise<string[]>;
}
export declare type Response = rr.Response;
export interface HTTPResolver {
    /**
     * Load resource by URL synchronously
     * @param url Resource URL
     * @return Resource content in string form
     **/
    getResource(url: string): Response;
    /**
     * Load resource by URL asynchronously
     * @param url Resource URL
     * @return Resource content in string form
     **/
    getResourceAsync(url: string): Promise<Response>;
}
export declare class HTTPResolverImpl implements HTTPResolver {
    private executor;
    getResource(url: string): Response;
    getResourceAsync(url: string): Promise<Response>;
    private toResponse(response, url);
}
export declare class FSResolverImpl implements ExtendedFSResolver {
    content(path: string): string;
    list(path: string): string[];
    contentAsync(path: string): Promise<string>;
    listAsync(path: string): Promise<string[]>;
}
export declare class Project implements lowlevel.IProject {
    private rootPath;
    private resolver;
    private _httpResolver;
    private listeners;
    private tlisteners;
    private pathToUnit;
    /**
     *
     * @param rootPath - path to folder where your root api is located
     * @param resolver
     * @param _httpResolver
     */
    constructor(rootPath: string, resolver?: FSResolver, _httpResolver?: HTTPResolver);
    cloneWithResolver(newResolver: FSResolver, httpResolver?: HTTPResolver): Project;
    setCachedUnitContent(pth: string, cnt: string, tl?: boolean): CompilationUnit;
    resolveAsync(unitPath: string, pathInUnit: string): Promise<lowlevel.ICompilationUnit>;
    resolve(unitPath: string, pathInUnit: string): CompilationUnit;
    units(): lowlevel.ICompilationUnit[];
    unitsAsync(): Promise<lowlevel.ICompilationUnit[]>;
    lexerErrors(): Error[];
    deleteUnit(p: string, absolute?: boolean): void;
    unit(p: string, absolute?: boolean): CompilationUnit;
    unitAsync(p: string, absolute?: boolean): Promise<lowlevel.ICompilationUnit>;
    visualizeNewlines(s: string): string;
    indent(node: ASTNode): string;
    startIndent(node: ASTNode): string;
    private canWriteInOneLine(node);
    private isOneLine(node);
    private recalcPositionsUp(target);
    private add2(target, node, toSeq, ipoint, json?);
    private isJsonMap(node);
    private isJsonSeq(node);
    private isJson(node);
    private remove(unit, target, node);
    private changeKey(unit, attr, newval);
    private executeReplace(r, txt, unit);
    private changeValue(unit, attr, newval);
    private initWithRoot(root, newroot);
    execute(cmd: lowlevel.CompositeCommand): void;
    replaceYamlNode(target: ASTNode, newNodeContent: string, offset: number, shift: number, unit: lowlevel.ICompilationUnit): void;
    executeTextChange2(textCommand: lowlevel.TextChangeCommand): void;
    executeTextChange(textCommand: lowlevel.TextChangeCommand): void;
    updatePositions(offset: number, n: yaml.YAMLNode): void;
    findNode(n: lowlevel.ILowLevelASTNode, offset: number, end: number): lowlevel.ILowLevelASTNode;
    addTextChangeListener(listener: lowlevel.ITextChangeCommandListener): void;
    removeTextChangeListener(listener: lowlevel.ITextChangeCommandListener): void;
    addListener(listener: lowlevel.IASTListener): void;
    removeListener(listener: lowlevel.IASTListener): void;
}
export declare class ASTNode implements lowlevel.ILowLevelASTNode {
    private _node;
    private _unit;
    private _parent;
    private _anchor;
    private _include;
    private cacheChildren;
    private _includesContents;
    _errors: Error[];
    constructor(_node: yaml.YAMLNode, _unit: lowlevel.ICompilationUnit, _parent: ASTNode, _anchor: ASTNode, _include: ASTNode, cacheChildren?: boolean, _includesContents?: boolean);
    actual(): any;
    _children: lowlevel.ILowLevelASTNode[];
    yamlNode(): yaml.YAMLNode;
    includesContents(): boolean;
    setIncludesContents(includesContents: boolean): void;
    gatherIncludes(s?: lowlevel.ILowLevelASTNode[], inc?: ASTNode, anc?: ASTNode, inOneMemberMap?: boolean): void;
    private _highLevelNode;
    private _highLevelParseResult;
    setHighLevelParseResult(highLevelParseResult: highlevel.IParseResult): void;
    highLevelParseResult(): highlevel.IParseResult;
    setHighLevelNode(highLevel: highlevel.IHighLevelNode): void;
    highLevelNode(): highlevel.IHighLevelNode;
    start(): number;
    errors(): Error[];
    parent(): ASTNode;
    recalcEndPositionFromChilds(): void;
    isValueLocal(): boolean;
    keyStart(): number;
    keyEnd(): number;
    valueStart(): number;
    valueEnd(): number;
    end(): number;
    _oldText: any;
    dump(): string;
    dumpToObject(full?: boolean): any;
    dumpNode(n: yaml.YAMLNode, full?: boolean): any;
    _actualNode(): yaml.YAMLNode;
    execute(cmd: lowlevel.CompositeCommand): void;
    updateFrom(n: yaml.YAMLNode): void;
    value(): any;
    printDetails(indent?: string): string;
    visit(v: lowlevel.ASTVisitor): void;
    key(): string;
    addChild(n: lowlevel.ILowLevelASTNode, pos?: number): void;
    removeChild(n: lowlevel.ILowLevelASTNode): void;
    includeErrors(): string[];
    children(inc?: ASTNode, anc?: ASTNode, inOneMemberMap?: boolean): lowlevel.ILowLevelASTNode[];
    canInclude(unit: lowlevel.ICompilationUnit): boolean;
    directChildren(inc?: ASTNode, anc?: ASTNode, inOneMemberMap?: boolean): lowlevel.ILowLevelASTNode[];
    anchorId(): string;
    unit(): lowlevel.ICompilationUnit;
    setUnit(unit: lowlevel.ICompilationUnit): void;
    includePath(): string;
    anchoredFrom(): lowlevel.ILowLevelASTNode;
    includedFrom(): lowlevel.ILowLevelASTNode;
    kind(): yaml.Kind;
    valueKind(): yaml.Kind;
    valueKindName(): string;
    kindName(): string;
    indent(lev: number, str?: string): string;
    replaceNewlines(s: string, rep?: string): string;
    shortText(unittext: string, maxlen?: number): string;
    nodeShortText(node: yaml.YAMLNode, unittext: string, maxlen?: number): string;
    show(message?: string, lev?: number, text?: string): void;
    showParents(message: string, lev?: number): number;
    inlined(kind: yaml.Kind): boolean;
    markupNode(xbuf: MarkupIndentingBuffer, node: yaml.YAMLNode, lev: number, json?: boolean): void;
    markup(json?: boolean): string;
    root(): lowlevel.ILowLevelASTNode;
    parentOfKind(kind: yaml.Kind): ASTNode;
    find(name: string): ASTNode;
    shiftNodes(offset: number, shift: number, exclude?: ASTNode): any;
    isMap(): boolean;
    isMapping(): boolean;
    isSeq(): boolean;
    isScalar(): boolean;
    asMap(): yaml.YamlMap;
    asMapping(): yaml.YAMLMapping;
    asSeq(): yaml.YAMLSequence;
    asScalar(): yaml.YAMLScalar;
    isValueSeq(): boolean;
    isValueMap(): boolean;
    isValueInclude(): boolean;
    isValueScalar(): boolean;
    valueAsSeq(): yaml.YAMLSequence;
    valueAsMap(): yaml.YamlMap;
    valueAsScalar(): yaml.YAMLScalar;
    valueAsInclude(): yaml.YAMLScalar;
    text(unitText?: string): string;
    copy(): ASTNode;
    nodeDefinition(): highlevel.INodeDefinition;
}
export declare enum InsertionPointType {
    NONE = 0,
    START = 1,
    END = 2,
    POINT = 3,
}
export declare class InsertionPoint {
    type: InsertionPointType;
    point: ASTNode;
    constructor(type: InsertionPointType, point?: ASTNode);
    static after(point: ASTNode): InsertionPoint;
    static atStart(): InsertionPoint;
    static atEnd(): InsertionPoint;
    static node(): InsertionPoint;
    show(msg: string): void;
}
export declare function createNode(key: string): ASTNode;
export declare function createMap(mappings: yaml.YAMLMapping[]): ASTNode;
export declare function createScalar(value: string): ASTNode;
export declare function createSeq(sn: yaml.YAMLSequence, parent: ASTNode, unit: CompilationUnit): ASTNode;
export declare function createSeqNode(key: string): ASTNode;
export declare function createMapNode(key: string): ASTNode;
export declare function createMapping(key: string, v: string): ASTNode;
export declare function toChildCahcingNode(node: lowlevel.ILowLevelASTNode): lowlevel.ILowLevelASTNode;
export declare function toIncludingNode(node: lowlevel.ILowLevelASTNode): lowlevel.ILowLevelASTNode;
export declare function getDefinitionForLowLevelNode(node: lowlevel.ILowLevelASTNode): highlevel.INodeDefinition;
export declare function fetchIncludesAsync(project: lowlevel.IProject, apiPath: string): Promise<lowlevel.ICompilationUnit>;
