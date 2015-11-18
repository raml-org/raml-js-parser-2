/// <reference path="../../typings/tsd.d.ts" />
import defs = require("./definitionSystem");
import hl = require("./highLevelAST");
import ll = require("./lowLevelAST");
import ParserCore = require("./wrapped-ast/parserCore");
export declare function qName(x: hl.IHighLevelNode, context: hl.IHighLevelNode): string;
export declare function evalInSandbox(code: string, thisArg: any, args: any[]): any;
export declare class BasicASTNode implements hl.IParseResult {
    protected _node: ll.ILowLevelASTNode;
    private _parent;
    private _hashkey;
    getKind(): hl.NodeKind;
    hashkey(): string;
    root(): hl.IHighLevelNode;
    private _implicit;
    private values;
    _computed: boolean;
    constructor(_node: ll.ILowLevelASTNode, _parent: hl.IHighLevelNode);
    knownProperty: hl.IProperty;
    needSequence: boolean;
    unresolvedRef: string;
    isSameNode(n: hl.IParseResult): boolean;
    checkContextValue(name: string, value: string, thisObj: any): boolean;
    printDetails(indent?: string): string;
    errors(): hl.ValidationIssue[];
    toRuntimeModel(): any;
    protected fillValue(type: hl.ITypeDefinition, val: any): any;
    markCh(): boolean;
    unmarkCh(): void;
    validate(v: hl.ValidationAcceptor): void;
    allowRecursive(): boolean;
    protected validateIncludes(v: any): void;
    setComputed(name: string, v: any): void;
    computedValue(name: string): any;
    lowLevel(): ll.ILowLevelASTNode;
    expansionSpec(): hl.ExpansionSpec;
    name(): string;
    parent(): hl.IHighLevelNode;
    setParent(parent: hl.IHighLevelNode): void;
    isElement(): boolean;
    directChildren(): hl.IParseResult[];
    children(): hl.IParseResult[];
    isAttached(): boolean;
    isImplicit(): boolean;
    isAttr(): boolean;
    isUnknown(): boolean;
    id(): string;
    localId(): string;
    property(): hl.IProperty;
}
export declare function createIssue(c: hl.IssueCode, message: string, node: hl.IParseResult, w?: boolean): hl.ValidationIssue;
export declare class StructuredValue {
    private node;
    private _parent;
    private kv;
    private _pr;
    constructor(node: ll.ILowLevelASTNode, _parent: hl.IHighLevelNode, _pr: hl.IProperty, kv?: any);
    valueName(): string;
    children(): StructuredValue[];
    lowLevel(): ll.ILowLevelASTNode;
    toHighlevel(parent?: hl.IHighLevelNode): hl.IHighLevelNode;
}
export declare function genStructuredValue(type: string, name: string, mappings: {
    key: string;
    value: string;
}[], parent: hl.IHighLevelNode): StructuredValue;
export declare class ASTPropImpl extends BasicASTNode implements hl.IAttribute {
    private _def;
    private _prop;
    private fromKey;
    definition(): hl.IValueTypeDefinition;
    isString(): boolean;
    constructor(node: ll.ILowLevelASTNode, parent: hl.IHighLevelNode, _def: hl.IValueTypeDefinition, _prop: hl.IProperty, fromKey?: boolean);
    getKind(): hl.NodeKind;
    owningWrapper(): {
        node: ParserCore.BasicNode;
        property: string;
    };
    patchType(t: hl.IValueTypeDefinition): void;
    findReferenceDeclaration(): hl.IHighLevelNode;
    findReferencedValue(): any;
    /**
     * TODO Split this method into the cases depending from property kind
     * @param v
     */
    validate(v: hl.ValidationAcceptor): void;
    toRuntime(): any;
    isElement(): boolean;
    property(): defs.Property;
    convertMultivalueToString(value: string): string;
    value(): any;
    name(): string;
    printDetails(indent?: string): string;
    isAttr(): boolean;
    isUnknown(): boolean;
    setValue(value: string | StructuredValue): void;
    setKey(value: string): void;
    children(): hl.IParseResult[];
    addStringValue(value: string): void;
    addStructuredValue(sv: StructuredValue): void;
    addValue(value: string | StructuredValue): void;
    isEmbedded(): boolean;
    remove(): void;
    setValues(values: string[]): void;
    isEmpty(): boolean;
}
export declare class ASTNodeImpl extends BasicASTNode implements hl.IHighLevelNode {
    private _def;
    private _prop;
    constructor(node: ll.ILowLevelASTNode, parent: hl.IHighLevelNode, _def: hl.INodeDefinition, _prop: hl.IProperty);
    private _expanded;
    _children: hl.IParseResult[];
    _allowQuestion: boolean;
    _associatedDef: hl.INodeDefinition;
    _subTypesCache: {
        [name: string]: hl.ITypeDefinition[];
    };
    private _wrapperNode;
    getKind(): hl.NodeKind;
    wrapperNode(): ParserCore.BasicNode;
    propertiesAllowedToUse(): hl.IProperty[];
    isAllowedToUse(p: hl.IProperty): boolean;
    allowRecursive(): boolean;
    setWrapperNode(node: ParserCore.BasicNode): void;
    setAssociatedType(d: hl.INodeDefinition): void;
    associatedType(): hl.INodeDefinition;
    private _isAux;
    private _auxChecked;
    private _knownIds;
    findById(id: string): any;
    isAuxilary(): boolean;
    private insideOfDeclaration();
    private isAllowedId();
    printDetails(indent?: string): string;
    private getExtractedChildren();
    allowsQuestion(): boolean;
    findReferences(): hl.IParseResult[];
    name(): any;
    findElementAtOffset(n: number): hl.IHighLevelNode;
    isElement(): boolean;
    private _universe;
    universe(): defs.Universe;
    setUniverse(u: defs.Universe): void;
    validate(v: hl.ValidationAcceptor): void;
    private isPrimitive(q);
    private isObject(q);
    private isArray(q);
    private isUnion(q);
    /**
     * !!!You cannot inherit from types of different kind at the same moment ( kinds are: union types, array types, object types, scalar types )
     * !!!You cannot inherit from types extending union types ( ex: you cannot extend from Pet if Pet = Dog | Cat )
     * You cannot inherit from multiple primitive types
     * !!! You cannot inherit from a type that extends Array type
     * Facets are always inherited
     * You can fix a previously defined facet to a value if the facet is defined on a superclass
     * Properties are only allowed on object types
     * You cannot create cyclic dependencies when inheriting
     * @param d
     * @param v
     * @param level
     * @param visited
     */
    private traverseDec(d, v, level, visited?);
    private _findNode(n, offset, end);
    isStub(): boolean;
    private findInsertionPointLowLevel(llnode, property, attr);
    private findInsertionPoint(node);
    add(node: hl.IHighLevelNode | hl.IAttribute): void;
    isInEdit: boolean;
    remove(node: hl.IHighLevelNode | hl.IAttribute): void;
    dump(flavor: string): string;
    patchType(d: hl.INodeDefinition): void;
    children(): hl.IParseResult[];
    directChildren(): hl.IParseResult[];
    resetChildren(): void;
    private findLastAttributeIndex();
    private findLastAttribute();
    isEmptyRamlFile(): boolean;
    initRamlFile(): void;
    createAttr(n: string, v: string): void;
    isAttr(): boolean;
    isUnknown(): boolean;
    value(): any;
    valuesOf(propName: string): hl.IHighLevelNode[];
    attr(n: string): hl.IAttribute;
    attrOrCreate(name: string): hl.IAttribute;
    attrValue(n: string): string;
    attributes(n: string): hl.IAttribute[];
    attrs(): hl.IAttribute[];
    elements(): hl.IHighLevelNode[];
    element(n: string): hl.IHighLevelNode;
    elementsOfKind(n: string): hl.IHighLevelNode[];
    definition(): hl.INodeDefinition;
    property(): hl.IProperty;
    isExpanded(): boolean;
    copy(): ASTNodeImpl;
    clearChildrenCache(): void;
}
export declare function typeFromNode(node: hl.IHighLevelNode): hl.ITypeDefinition;
export declare function createStub0(parent: hl.IHighLevelNode, property: string, key?: string): ASTNodeImpl;
export declare function createStub(parent: hl.IHighLevelNode, property: string, key?: string): ASTNodeImpl;
export declare function createResourceStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createMethodStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createResponseStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createBodyStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createUriParameterStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createQueryParameterStub(parent: hl.IHighLevelNode, key?: string): hl.IHighLevelNode;
export declare function createObjectFieldStub(parent: hl.IHighLevelNode, name: string): hl.IHighLevelNode;
