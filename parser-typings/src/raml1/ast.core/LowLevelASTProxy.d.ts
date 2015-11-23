/// <reference path="../../../typings/tsd.d.ts" />
import ll = require("../lowLevelAST");
import hl = require("../highLevelAST");
import yaml = require("../jsyaml/yamlAST");
import Error = require("../jsyaml/js-yaml/exception");
export declare class LowLevelProxyNode implements ll.ILowLevelASTNode {
    protected _parent: ll.ILowLevelASTNode;
    protected _transformer: ValueTransformer;
    constructor(_parent: ll.ILowLevelASTNode, _transformer: ValueTransformer);
    protected _original: ll.ILowLevelASTNode;
    private _highLevelNode;
    private _highLevelParseResult;
    private _keyOverride;
    actual(): any;
    transformer(): ValueTransformer;
    original(): ll.ILowLevelASTNode;
    start(): number;
    end(): number;
    value(): any;
    includeErrors(): string[];
    includePath(): string;
    setKeyOverride(_key: string): void;
    key(): string;
    children(): ll.ILowLevelASTNode[];
    parent(): ll.ILowLevelASTNode;
    unit(): ll.ICompilationUnit;
    anchorId(): string;
    errors(): Error[];
    anchoredFrom(): ll.ILowLevelASTNode;
    includedFrom(): ll.ILowLevelASTNode;
    visit(v: ll.ASTVisitor): void;
    addChild(n: ll.ILowLevelASTNode): void;
    execute(cmd: ll.CompositeCommand): void;
    dump(): string;
    dumpToObject(): any;
    keyStart(): number;
    keyEnd(): number;
    valueStart(): number;
    valueEnd(): number;
    isValueLocal(): boolean;
    kind(): yaml.Kind;
    valueKind(): yaml.Kind;
    show(msg: string): void;
    setHighLevelParseResult(highLevelParseResult: hl.IParseResult): void;
    highLevelParseResult(): hl.IParseResult;
    setHighLevelNode(highLevel: hl.IHighLevelNode): void;
    highLevelNode(): hl.IHighLevelNode;
    text(unitText: string): string;
    copy(): LowLevelCompositeNode;
    markup(json?: boolean): string;
    nodeDefinition(): hl.INodeDefinition;
    includesContents(): boolean;
}
export declare class LowLevelCompositeNode extends LowLevelProxyNode {
    protected fromMainTree: boolean;
    constructor(node: ll.ILowLevelASTNode, parent: LowLevelCompositeNode, transformer: ValueTransformer, fromMainTree?: boolean);
    protected _adoptedNodes: LowLevelValueTransformingNode[];
    protected _children: LowLevelCompositeNode[];
    adoptedNodes(): ll.ILowLevelASTNode[];
    original(): LowLevelValueTransformingNode;
    parent(): LowLevelCompositeNode;
    adopt(node: ll.ILowLevelASTNode, transformer: ValueTransformer): void;
    value(): any;
    children(): ll.ILowLevelASTNode[];
    private buildKey(y);
    private collectChildrenWithKeys();
    valueKind(): yaml.Kind;
    includePath(): string;
    key(): string;
}
export declare class LowLevelValueTransformingNode extends LowLevelProxyNode {
    constructor(node: ll.ILowLevelASTNode, parent: ll.ILowLevelASTNode, transformer: ValueTransformer);
    value(): any;
    children(): ll.ILowLevelASTNode[];
    parent(): LowLevelValueTransformingNode;
}
export interface ValueTransformer {
    transform(val: any): any;
    error(): string;
}
