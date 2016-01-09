/// <reference path="../../typings/main.d.ts" />
import defs = require("./definitionSystem");
import hl = require("./highLevelAST");
import ll = require("./lowLevelAST");
import ParserCore = require("./wrapped-ast/parserCore");
export declare function qName(x: hl.IHighLevelNode, context: hl.IHighLevelNode): string;
export declare class BasicASTNode implements hl.IParseResult {
    protected _node: ll.ILowLevelASTNode;
    private _parent;
    private _hashkey;
    getKind(): hl.NodeKind;
    asAttr(): hl.IAttribute;
    asElement(): hl.IHighLevelNode;
    hashkey(): string;
    root(): hl.IHighLevelNode;
    version(): string;
    getLowLevelStart(): number;
    getLowLevelEnd(): number;
    private _implicit;
    private values;
    _computed: boolean;
    constructor(_node: ll.ILowLevelASTNode, _parent: hl.IHighLevelNode);
    knownProperty: hl.IProperty;
    needSequence: boolean;
    unresolvedRef: string;
    errorMessage: string;
    isSameNode(n: hl.IParseResult): boolean;
    checkContextValue(name: string, value: string, thisObj: any): boolean;
    printDetails(indent?: string): string;
    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?: string): string;
    errors(): hl.ValidationIssue[];
    markCh(): boolean;
    unmarkCh(): void;
    validate(v: hl.ValidationAcceptor): void;
    allowRecursive(): boolean;
    setComputed(name: string, v: any): void;
    computedValue(name: string): any;
    lowLevel(): ll.ILowLevelASTNode;
    name(): string;
    optional(): boolean;
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
    fullLocalId(): string;
    property(): hl.IProperty;
}
export declare class StructuredValue {
    private node;
    private _parent;
    private kv;
    private _pr;
    constructor(node: ll.ILowLevelASTNode, _parent: hl.IHighLevelNode, _pr: hl.IProperty, kv?: any);
    valueName(): string;
    children(): StructuredValue[];
    lowLevel(): ll.ILowLevelASTNode;
    toHighLevel(parent?: hl.IHighLevelNode): hl.IHighLevelNode;
}
export declare class ASTPropImpl extends BasicASTNode implements hl.IAttribute {
    private _def;
    private _prop;
    private fromKey;
    definition(): hl.IValueTypeDefinition;
    asAttr(): hl.IAttribute;
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
    isElement(): boolean;
    property(): defs.Property;
    convertMultivalueToString(value: string): string;
    _value: string;
    value(): any;
    name(): string;
    printDetails(indent?: string): string;
    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?: string): string;
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
export declare enum OverlayMergeMode {
    MERGE = 0,
    AGGREGATE = 1,
}
export declare class ASTNodeImpl extends BasicASTNode implements hl.IHighLevelNode {
    private _def;
    private _prop;
    private _expanded;
    _children: hl.IParseResult[];
    _allowQuestion: boolean;
    _associatedDef: hl.INodeDefinition;
    _subTypesCache: {
        [name: string]: hl.ITypeDefinition[];
    };
    private _wrapperNode;
    private _isAux;
    private _auxChecked;
    private _knownIds;
    isInEdit: boolean;
    /**
     * Externally set master AST, should be only available for root nodes,
     * and only in the case when we merge multiple overlays/extensions.
     */
    private masterApi;
    /**
     * Depending on the merge mode, overlays and extensions are either merged with the master, or their trees are joined via aggregation
     * @type {OverlayMergeMode}
     */
    private overlayMergeMode;
    constructor(node: ll.ILowLevelASTNode, parent: hl.IHighLevelNode, _def: hl.INodeDefinition, _prop: hl.IProperty);
    patchProp(pr: hl.IProperty): void;
    getKind(): hl.NodeKind;
    wrapperNode(): ParserCore.BasicNode;
    asElement(): hl.IHighLevelNode;
    private buildWrapperNode();
    propertiesAllowedToUse(): hl.IProperty[];
    isAllowedToUse(p: hl.IProperty): boolean;
    allowRecursive(): boolean;
    setWrapperNode(node: ParserCore.BasicNode): void;
    setAssociatedType(d: hl.INodeDefinition): void;
    associatedType(): hl.INodeDefinition;
    knownIds(): {};
    findById(id: string): hl.IParseResult;
    isAuxilary(): boolean;
    private initilizeKnownIDs(api);
    private getMaster();
    /**
     * Forcefully sets a master unit for this API, which may be different from the one, current unit points to
     * via masterRef.
     * @param master
     */
    overrideMaster(master: hl.IParseResult): void;
    setMergeMode(mergeMode: OverlayMergeMode): void;
    getMergeMode(): OverlayMergeMode;
    private calculateMasterByRef();
    private resetAuxilaryState();
    printDetails(indent?: string): string;
    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?: string): string;
    private getExtractedChildren();
    allowsQuestion(): boolean;
    findReferences(): hl.IParseResult[];
    private _patchedName;
    setNamePatch(s: string): void;
    isNamePatch(): string;
    name(): any;
    findElementAtOffset(n: number): hl.IHighLevelNode;
    isElement(): boolean;
    private _universe;
    universe(): defs.Universe;
    setUniverse(u: defs.Universe): void;
    private _findNode(n, offset, end);
    isStub(): boolean;
    add(node: hl.IHighLevelNode | hl.IAttribute): void;
    remove(node: hl.IHighLevelNode | hl.IAttribute): void;
    dump(flavor: string): string;
    patchType(d: hl.INodeDefinition): void;
    children(): hl.IParseResult[];
    private mergeChildren(originalChildren, masterChildren);
    private mergeChild(result, originalChild, masterChild);
    directChildren(): hl.IParseResult[];
    resetChildren(): void;
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
    optionalProperties(): string[];
}
