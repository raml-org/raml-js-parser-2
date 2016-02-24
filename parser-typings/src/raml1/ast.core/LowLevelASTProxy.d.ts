/// <reference path="../../../typings/main.d.ts" />
import ll = require("../lowLevelAST");
import hl = require("../highLevelAST");
import yaml = require("../jsyaml/yamlAST");
import Error = require("../jsyaml/js-yaml/exception");
import refResolvers = require("../jsyaml/includeRefResolvers");
export declare class LowLevelProxyNode implements ll.ILowLevelASTNode {
    protected _parent: ll.ILowLevelASTNode;
    protected _transformer: ValueTransformer;
    protected ramlVersion: string;
    constructor(_parent: ll.ILowLevelASTNode, _transformer: ValueTransformer, ramlVersion: string);
    protected _originalNode: ll.ILowLevelASTNode;
    private _highLevelNode;
    private _highLevelParseResult;
    private _keyOverride;
    keyKind(): yaml.Kind;
    actual(): any;
    transformer(): ValueTransformer;
    originalNode(): ll.ILowLevelASTNode;
    start(): number;
    end(): number;
    value(toString?: boolean): any;
    includeErrors(): string[];
    includePath(): string;
    includeReference(): refResolvers.IncludeReference;
    setKeyOverride(_key: string): void;
    key(): string;
    optional(): boolean;
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
    private isPrimary;
    constructor(node: ll.ILowLevelASTNode, parent: LowLevelCompositeNode, transformer: ValueTransformer, ramlVersion: string, isPrimary?: boolean);
    protected _adoptedNodes: LowLevelValueTransformingNode[];
    protected _children: LowLevelCompositeNode[];
    adoptedNodes(): ll.ILowLevelASTNode[];
    primaryNode(): LowLevelValueTransformingNode;
    parent(): LowLevelCompositeNode;
    adopt(node: ll.ILowLevelASTNode, transformer: ValueTransformer): void;
    value(toString?: boolean): any;
    children(): ll.ILowLevelASTNode[];
    private buildKey(y);
    private collectChildrenWithKeys();
    private skipKey(key, isPrimary);
    valueKind(): yaml.Kind;
    includePath(): string;
    includeReference(): refResolvers.IncludeReference;
    optional(): boolean;
}
export declare class LowLevelValueTransformingNode extends LowLevelProxyNode {
    constructor(node: ll.ILowLevelASTNode, parent: ll.ILowLevelASTNode, transformer: ValueTransformer, ramlVersion: string);
    value(toString?: boolean): any;
    children(): ll.ILowLevelASTNode[];
    parent(): LowLevelValueTransformingNode;
    key(): string;
}
export interface ValueTransformer {
    transform(value: any): {
        value: any;
        errors: hl.ValidationIssue[];
    };
}
