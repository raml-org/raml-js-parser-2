/// <reference path="../../typings/main.d.ts" />
/**
 * Created by kor on 05/05/15.
 */
import lowLevel = require("./lowLevelAST");
import hi = require("./highLevelImpl");
import typeSystem = require("./definition-system/typeSystem");
import ParserCore = require("./wrapped-ast/parserCore");
export declare type INamedEntity = typeSystem.INamedEntity;
export declare type NamedId = typeSystem.NamedId;
export declare type ITypeDefinition = typeSystem.ITypeDefinition;
export declare type IArrayType = typeSystem.IArrayType;
export declare type IUnionType = typeSystem.IUnionType;
export declare type INodeDefinition = ITypeDefinition;
export declare type IProperty = typeSystem.IProperty;
export interface IValueTypeDefinition extends ITypeDefinition {
}
export declare type IUniverse = typeSystem.IUniverse;
export interface IValueDocProvider {
    (v: string): string;
}
export interface IValueSuggester {
    (node: IHighLevelNode): string[];
}
export declare enum NodeKind {
    BASIC = 0,
    NODE = 1,
    ATTRIBUTE = 2,
}
export declare enum RAMLVersion {
    RAML10 = 0,
    RAML08 = 1,
}
export interface IParseResult {
    hashkey(): string;
    errors(): ValidationIssue[];
    lowLevel(): lowLevel.ILowLevelASTNode;
    name(): string;
    optional(): boolean;
    root(): IHighLevelNode;
    isSameNode(n: IParseResult): boolean;
    parent(): IHighLevelNode;
    setParent(node: IParseResult): any;
    children(): IParseResult[];
    isAttached(): boolean;
    isImplicit(): boolean;
    isAttr(): boolean;
    asAttr(): IAttribute;
    isElement(): boolean;
    asElement(): IHighLevelNode;
    localId(): string;
    fullLocalId(): string;
    isUnknown(): boolean;
    property(): IProperty;
    id(): string;
    computedValue(name: string): any;
    validate(acceptor: ValidationAcceptor): void;
    printDetails(indent?: string): string;
    getKind(): NodeKind;
    getLowLevelStart(): any;
    getLowLevelEnd(): any;
    version(): any;
}
export interface Status {
    message: string;
}
export declare enum IssueCode {
    UNRESOLVED_REFERENCE = 0,
    YAML_ERROR = 1,
    UNKNOWN_NODE = 2,
    MISSING_REQUIRED_PROPERTY = 3,
    PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE = 4,
    KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT = 5,
    UNABLE_TO_RESOLVE_INCLUDE_FILE = 6,
    INVALID_VALUE_SCHEMA = 7,
    MISSED_CONTEXT_REQUIREMENT = 8,
    NODE_HAS_VALUE = 9,
    ONLY_OVERRIDE_ALLOWED = 10,
    ILLEGAL_PROPERTY_VALUE = 11,
}
export interface ValidationAcceptor {
    begin(): any;
    accept(issue: ValidationIssue): any;
    end(): any;
}
export interface ValidationAction {
    name: string;
    action: () => void;
}
export interface ValidationIssue {
    code: IssueCode;
    message: string;
    node: IParseResult;
    path: string;
    start: number;
    end: number;
    isWarning: boolean;
    actions?: ValidationAction[];
    extras?: ValidationIssue[];
    unit?: lowLevel.ICompilationUnit;
}
export interface INodeBuilder {
    process(node: IHighLevelNode, childrenToAdopt: lowLevel.ILowLevelASTNode[]): IParseResult[];
}
export interface IAttribute extends IParseResult {
    lowLevel(): lowLevel.ILowLevelASTNode;
    definition(): IValueTypeDefinition;
    property(): IProperty;
    value(): any;
    setValue(newValue: string | hi.StructuredValue): any;
    setValues(values: string[]): any;
    addValue(value: string | hi.StructuredValue): any;
    name(): string;
    localId(): string;
    remove(): any;
    isEmpty(): boolean;
    owningWrapper(): {
        node: ParserCore.BasicNode;
        property: string;
    };
}
export interface IHighLevelNode extends IParseResult {
    lowLevel(): lowLevel.ILowLevelASTNode;
    definition(): INodeDefinition;
    allowsQuestion(): boolean;
    property(): IProperty;
    children(): IParseResult[];
    attrs(): IAttribute[];
    attr(n: string): IAttribute;
    attrOrCreate(n: string): IAttribute;
    attrValue(n: string): string;
    attributes(n: string): IAttribute[];
    elements(): IHighLevelNode[];
    element(n: string): IHighLevelNode;
    elementsOfKind(n: string): IHighLevelNode[];
    isExpanded(): boolean;
    value(): any;
    propertiesAllowedToUse(): IProperty[];
    getExpandedVersion?(): IHighLevelNode;
    add(node: IHighLevelNode | IAttribute): any;
    remove(node: IHighLevelNode | IAttribute): any;
    dump(flavor: string): string;
    findElementAtOffset(offset: number): any;
    root(): IHighLevelNode;
    findReferences(): IParseResult[];
    copy(): IHighLevelNode;
    resetChildren(): void;
    findById(id: string): any;
    associatedType(): INodeDefinition;
    wrapperNode(): ParserCore.BasicNode;
    setWrapperNode(node: ParserCore.BasicNode): any;
    optionalProperties(): string[];
}
export interface IAcceptor<T> {
    calculationStarts(): any;
    acceptProposal(c: T): any;
    calculationComplete(): any;
}
export declare var universeProvider: any;
export declare function getFragmentDefenitionName(highLevelNode: IHighLevelNode): string;
export declare function fromUnit(l: lowLevel.ICompilationUnit): IParseResult;
