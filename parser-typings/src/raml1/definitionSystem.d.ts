/// <reference path="../../typings/tsd.d.ts" />
import highLevel = require("./highLevelAST");
import selector = require("./selectorMatch");
import defs = require("./definitionSystem");
/**
 * What is our universe at first we have node types
 * they have following fundamental properties:
 * some nodes can fold to another kinds of nodes
 *
 */
export interface IType extends highLevel.ITypeDefinition {
    name(): string;
    description(): string;
    isValueType(): boolean;
    isUnionType(): boolean;
    properties(): Property[];
    annotations(): Annotation[];
    universe(): Universe;
}
export declare class Annotation {
    private _name;
    constructor(_name: string);
    name(): string;
}
export declare class Described {
    private _name;
    private _description;
    constructor(_name: any, _description?: string);
    name(): string;
    description(): string;
    private _issues;
    private _toClarify;
    private _itCovers;
    private _tags;
    private _version;
    withIssue(description: string): defs.Described;
    withTag(description: string): defs.Described;
    withClarify(description: string): defs.Described;
    getCoveredStuff(): string[];
    withThisFeatureCovers(description: string): defs.Described;
    withVersion(verstion: string): void;
    version(): string;
    issues(): string[];
    toClarify(): string[];
    tags(): string[];
    withDescription(d: string): defs.Described;
}
export declare class ValueRequirement {
    name: string;
    value: string;
    constructor(name: string, value: string);
}
export declare class AbstractType extends Described {
    _universe: Universe;
    private _path;
    isRuntime(): boolean;
    _superTypes: highLevel.ITypeDefinition[];
    _subTypes: highLevel.ITypeDefinition[];
    _annotations: Annotation[];
    _requirements: ValueRequirement[];
    _aliases: string[];
    _consumesRef: boolean;
    _defining: string[];
    union(): highLevel.IUnionType;
    isUserDefined(): boolean;
    private fixedFacets;
    isArray(): boolean;
    isUnion(): boolean;
    fixFacet(name: string, v: any): void;
    protected _af: {
        [name: string]: any;
    };
    getFixedFacets(): {
        [name: string]: any;
    };
    protected contributeFacets(x: {
        [name: string]: any;
    }): void;
    _node: highLevel.IHighLevelNode;
    setDeclaringNode(n: highLevel.IHighLevelNode): void;
    getDeclaringNode(): highLevel.IHighLevelNode;
    toRuntime(): highLevel.ITypeDefinition;
    setConsumesRefs(b: boolean): void;
    definingPropertyIsEnough(v: string): void;
    getDefining(): string[];
    getConsumesRefs(): boolean;
    private _fDesc;
    addAlias(al: string): void;
    getAliases(): string[];
    private _nameAtRuntime;
    isValid(h: highLevel.IHighLevelNode, v: any, p: highLevel.IProperty): boolean;
    getPath(): string;
    withFunctionalDescriminator(code: string): void;
    _methods: {
        name: string;
        text: string;
    }[];
    addMethod(name: string, text: string): void;
    methods(): {
        name: string;
        text: string;
    }[];
    setNameAtRuntime(name: string): void;
    getNameAtRuntime(): string;
    getFunctionalDescriminator(): string;
    constructor(_name: string, _universe: Universe, _path: string);
    getRuntimeExtenders(): any[];
    universe(): defs.Universe;
    superTypes(): highLevel.ITypeDefinition[];
    isAssignableFrom(typeName: string): boolean;
    subTypes(): highLevel.ITypeDefinition[];
    allSubTypes(): highLevel.ITypeDefinition[];
    allSuperTypes(): highLevel.ITypeDefinition[];
    private allSuperTypesRecurrent(t, m, result);
    addRequirement(name: string, value: string): void;
    valueRequirements(): defs.ValueRequirement[];
    annotations(): defs.Annotation[];
}
export declare class ValueType extends AbstractType implements IType, highLevel.IValueTypeDefinition {
    private _restriction;
    constructor(name: any, _universe: Universe, path: string, description?: string, _restriction?: ValueRestriction);
    hasStructure(): boolean;
    isValid(h: highLevel.IHighLevelNode, v: any, p: highLevel.IProperty): any;
    isValueType(): boolean;
    isUnionType(): boolean;
    properties(): any[];
    allProperties(): Property[];
    private _declaredBy;
    globallyDeclaredBy(): NodeClass[];
    setGloballyDeclaredBy(c: NodeClass): void;
    getValueRestriction(): defs.ValueRestriction;
    match(r: highLevel.IParseResult): boolean;
}
export declare class EnumType extends ValueType {
    values: string[];
}
export declare class ReferenceType extends ValueType {
    private referenceTo;
    constructor(name: string, path: string, referenceTo: string, _universe: Universe);
    getReferencedType(): NodeClass;
    hasStructure(): boolean;
}
export declare class ScriptingHookType extends ValueType {
    private refTo;
    constructor(name: string, path: string, refTo: string, _universe: Universe);
    getReferencedType(): NodeClass;
}
export declare class NodeClass extends AbstractType implements IType, highLevel.INodeDefinition {
    protected _properties: Property[];
    private _isAbstract;
    private _declaresType;
    private _runtimeExtenders;
    private _inlinedTemplates;
    private _contextReq;
    private _actuallyExports;
    private _convertsToGlobal;
    private _allowAny;
    private _allowQuestion;
    private _referenceIs;
    private _canInherit;
    private _allowValueSet;
    private _allowValue;
    private _isAnnotation;
    private _annotationChecked;
    protected _isRuntime: boolean;
    protected _representationOf: NodeClass;
    protected _allFacets: Property[];
    isRuntime(): boolean;
    isUserDefined(): boolean;
    getRepresentationOf(): defs.NodeClass;
    toRuntime(): defs.NodeClass;
    allFacets(ps?: {
        [name: string]: highLevel.ITypeDefinition;
    }): Property[];
    facet(name: string): defs.Property;
    isDeclaration(): boolean;
    isAnnotation(): boolean;
    allowValue(): boolean;
    printDetails(): string;
    withCanInherit(clazz: string): void;
    getCanInherit(): string[];
    getReferenceIs(): string;
    withReferenceIs(fname: string): void;
    withAllowQuestion(): void;
    requiredProperties(): Property[];
    getAllowQuestion(): boolean;
    withAllowAny(): void;
    getAllowAny(): boolean;
    withActuallyExports(pname: string): void;
    withConvertsToGlobal(pname: string): void;
    getConvertsToGlobal(): string;
    getActuallyExports(): string;
    withContextRequirement(name: string, value: string): void;
    getContextRequirements(): {
        name: string;
        value: string;
    }[];
    isGlobalDeclaration(): boolean;
    findMembersDeterminer(): defs.Property;
    isTypeSystemMember(): boolean;
    hasStructure(): boolean;
    getExtendedType(): IType;
    setInlinedTemplates(b: boolean): defs.NodeClass;
    isInlinedTemplates(): boolean;
    setExtendedTypeName(name: string): void;
    getRuntimeExtenders(): defs.IType[];
    createStubNode(p: highLevel.IProperty, key?: string): highLevel.IHighLevelNode;
    createProperty(parent: highLevel.IHighLevelNode, key?: string): highLevel.IProperty;
    descriminatorValue(): string;
    match(r: highLevel.IParseResult, alreadyFound: highLevel.ITypeDefinition): boolean;
    private _props;
    allProperties(ps?: {
        [name: string]: highLevel.ITypeDefinition;
    }): Property[];
    constructor(_name: string, universe: Universe, path: string, _description?: string);
    isValueType(): boolean;
    isAbstract(): boolean;
    isUnionType(): boolean;
    property(propName: string): Property;
    propertyIndex(name: string): number;
    allPropertyIndex(name: string): number;
    properties(): Property[];
    getKeyProp(): Property;
    registerProperty(p: Property): void;
    allRuntimeProperties(ps?: {
        [name: string]: highLevel.ITypeDefinition;
    }): Property[];
}
export declare class UserDefinedClass extends NodeClass {
    private _rprops;
    private _runtimeProperties;
    private addRuntimeProperty(p);
    isArray(): boolean;
    uc: boolean;
    isUnion(): boolean;
    isUserDefined(): boolean;
    protected contributeFacets(x: {
        [name: string]: any;
    }): void;
    protected findFacets(node: highLevel.IHighLevelNode, x: {
        [name: string]: any;
    }): void;
    constructor(name: string, universe: Universe, hl: highLevel.IHighLevelNode, path: string, description: string);
    initRuntime(): void;
    _value: boolean;
    isValueType(): boolean;
    componentType(): any;
    union(): any;
    toRuntime(): defs.NodeClass;
    allRuntimeProperties(ps?: {
        [name: string]: highLevel.ITypeDefinition;
    }): Property[];
    getRuntimeProperties(): defs.Property[];
}
export declare class AnnotationType extends UserDefinedClass {
    allProperties(ps?: {
        [name: string]: highLevel.ITypeDefinition;
    }): Property[];
}
export declare class Universe extends Described implements highLevel.IUniverse {
    private _parent;
    private _classes;
    private _uversion;
    private _topLevel;
    private _typedVersion;
    setTopLevel(t: string): void;
    getTopLevel(): string;
    setTypedVersion(tv: string): void;
    getTypedVersion(): string;
    version(): string;
    setUniverseVersion(version: string): void;
    types(): IType[];
    type(name: string): defs.IType;
    getType(name: any): highLevel.ITypeDefinition;
    register(t: IType): defs.Universe;
    private aMap;
    registerAlias(a: string, t: IType): void;
    unregister(t: IType): defs.Universe;
    constructor(name?: string, _parent?: Universe, v?: string);
    registerSuperClass(t0: IType, t1: IType): void;
}
export interface Status {
    isOk(): boolean;
    message(): string;
}
export declare class ValueRestriction {
    test(n: highLevel.IAttribute, p: Property, value: any): Status;
}
/**
 * references element in upper hierarchy
 */
export declare class ReferenceTo extends ValueRestriction {
    private _requiredClass;
    constructor(_requiredClass: NodeClass);
    requiredClass(): defs.NodeClass;
}
/**
 * should be fixed set
 */
export declare class FixedSetRestriction extends ValueRestriction {
    private _allowedValues;
    constructor(_allowedValues: any[]);
    values(): any[];
}
/**
 * should be reg exp
 */
export declare class RegExpRestriction extends ValueRestriction {
    private _regExp;
    constructor(_regExp: RegExp);
    regeExp(): RegExp;
}
export declare class UnionType implements IType {
    private _base;
    constructor(_base: IType[]);
    isUserDefined(): boolean;
    isRuntime(): boolean;
    isArray(): boolean;
    isUnion(): boolean;
    union(): any;
    getRuntimeExtenders(): any[];
    methods(): any[];
    superTypes(): highLevel.ITypeDefinition[];
    allSuperTypes(): any[];
    isAssignableFrom(typeName: string): boolean;
    subTypes(): highLevel.ITypeDefinition[];
    name(): string;
    hasStructure(): boolean;
    description(): string;
    isValid(): boolean;
    universe(): defs.Universe;
    match(r: highLevel.IParseResult): boolean;
    allSubTypes(): highLevel.ITypeDefinition[];
    annotations(): Annotation[];
    allProperties(): Property[];
    getAlternatives(): IType[];
    valueRequirements(): {
        name: string;
        value: string;
    }[];
    toRuntime(): highLevel.ITypeDefinition;
    properties(): defs.Property[];
    isValueType(): boolean;
    isUnionType(): boolean;
}
export declare class PropertyTrait {
}
export declare class DefinesImplicitKey extends PropertyTrait {
    private _where;
    private _childKeyDefined;
    constructor(_where: NodeClass, _childKeyDefined: NodeClass);
    where(): defs.NodeClass;
    definesKeyOf(): defs.NodeClass;
}
export declare class ExpansionTrait extends PropertyTrait {
    constructor();
}
export declare function prop(name: string, desc: string, domain: NodeClass, range: IType): Property;
export declare class ChildValueConstraint {
    name: string;
    value: string;
    constructor(name: string, value: string);
}
export interface FacetValidator {
    (value: any, facetValue: any): string;
}
export declare class Property extends Described implements highLevel.IProperty {
    private _ownerClass;
    private _nodeRange;
    private _groupName;
    private _keyShouldStartFrom;
    private _isMultiValue;
    private _isFromParentValue;
    private _isFromParentKey;
    private _isRequired;
    private _key;
    private _traits;
    private _enumOptions;
    private _isEmbedMap;
    private _defaultVal;
    private _isSystem;
    private _declaresFields;
    private _describes;
    private _descriminates;
    private _propertyGrammarType;
    private _inheritsValueFromContext;
    private _canBeDuplicator;
    private _isAllowNull;
    private _canBeValue;
    private _isInherited;
    private _oftenKeys;
    private _vprovider;
    private _suggester;
    private _selfNode;
    private _selector;
    private _docTableName;
    private _isHidden;
    private _markdownDescription;
    private _valueDescription;
    private _noDirectParse;
    withNoDirectParse(): void;
    isNoDirectParse(): boolean;
    setDocTableName(val: string): void;
    docTableName(): string;
    setHidden(val: boolean): void;
    isHidden(): boolean;
    setMarkdownDescription(val: string): void;
    markdownDescription(): string;
    setValueDescription(val: string): void;
    valueDescription(): string;
    isExampleProperty(): boolean;
    private facetValidator;
    getFacetValidator(): defs.FacetValidator;
    setFacetValidator(f: FacetValidator): void;
    withSelfNode(): void;
    isSelfNode(): boolean;
    getSelector(h: highLevel.IHighLevelNode): selector.Selector;
    setSelector(s: selector.Selector | string): defs.Property;
    valueDocProvider(): highLevel.IValueDocProvider;
    setValueDocProvider(v: highLevel.IValueDocProvider): defs.Property;
    suggester(): highLevel.IValueSuggester;
    setValueSuggester(s: highLevel.IValueSuggester): void;
    enumOptions(): string[];
    getOftenKeys(): string[];
    withOftenKeys(keys: string[]): defs.Property;
    withCanBeValue(): defs.Property;
    withInherited(w: boolean): void;
    isInherited(): boolean;
    isAllowNull(): boolean;
    withAllowNull(): void;
    isDescriminator(): boolean;
    getCanBeDuplicator(): boolean;
    isValue(): boolean;
    canBeValue(): boolean;
    setCanBeDuplicator(): boolean;
    inheritedContextValue(): string;
    withInheritedContextValue(v: string): defs.Property;
    withPropertyGrammarType(pt: string): void;
    getPropertyGrammarType(): string;
    private _contextReq;
    private _vrestr;
    withContextRequirement(name: string, value: string): void;
    getContextRequirements(): {
        name: string;
        value: string;
    }[];
    withDescriminating(b: boolean): defs.Property;
    isDescriminating(): boolean;
    withDescribes(a: string): defs.Property;
    withValueRewstrinction(exp: string, message: string): defs.Property;
    getValueRestrictionExpressions(): {
        exp: string;
        message: string;
    }[];
    describesAnnotation(): boolean;
    describedAnnotation(): string;
    createAttr(val: any): highLevel.IAttribute;
    private _newInstanceName;
    isReference(): boolean;
    referencesTo(): IType;
    newInstanceName(): string;
    withThisPropertyDeclaresFields(b?: boolean): defs.Property;
    isThisPropertyDeclaresTypeFields(): boolean;
    withNewInstanceName(name: string): defs.Property;
    private determinesChildValues;
    addChildValueConstraint(c: ChildValueConstraint): void;
    setDefaultVal(s: any): defs.Property;
    defaultValue(): any;
    getChildValueConstraints(): ChildValueConstraint[];
    childRestrictions(): {
        name: string;
        value: any;
    }[];
    isSystem(): boolean;
    withSystem(s: boolean): defs.Property;
    isEmbedMap(): boolean;
    withEmbedMap(): defs.Property;
    _id: any;
    id(): any;
    isValidValue(vl: string, c: highLevel.IHighLevelNode): boolean;
    enumValues(c: highLevel.IHighLevelNode): string[];
    texpr: boolean;
    teDef: boolean;
    isTypeExpr(): boolean;
    priority(): number;
    referenceTargets(c: highLevel.IHighLevelNode): highLevel.IHighLevelNode[];
    getEnumOptions(): string[];
    withEnumOptions(op: string[]): defs.Property;
    withDomain(d: NodeClass): defs.Property;
    withRange(t: IType): defs.Property;
    getTraits(): PropertyTrait[];
    keyPrefix(): string;
    isAnnotation(): boolean;
    matchKey(k: string): boolean;
    withMultiValue(v?: boolean): defs.Property;
    withFromParentValue(v?: boolean): defs.Property;
    withFromParentKey(v?: boolean): defs.Property;
    isFromParentKey(): boolean;
    isFromParentValue(): boolean;
    withGroupName(gname: string): defs.Property;
    withRequired(req: boolean): defs.Property;
    unmerge(): defs.Property;
    merge(): defs.Property;
    withKey(isKey: boolean): defs.Property;
    /**
     * TODO THIS STUFF SHOULD BE MORE ABSTRACT (LATER...)
     * @param keyShouldStartFrom
     * @returns {Property}
     */
    withKeyRestriction(keyShouldStartFrom: string): defs.Property;
    _keyRegexp: string;
    withKeyRegexp(regexp: string): void;
    getKeyRegexp(): string;
    domain(): NodeClass;
    range(): IType;
    isKey(): boolean;
    isValueProperty(): boolean;
    isRequired(): boolean;
    isMultiValue(): boolean;
    isMerged(): boolean;
    isPrimitive(): boolean;
    groupName(): string;
}
export declare class Array extends NodeClass {
    dimensions: number;
    component: highLevel.ITypeDefinition;
    isArray(): boolean;
    isUserDefined(): boolean;
    componentType(): highLevel.ITypeDefinition;
    findFacets(node: highLevel.IHighLevelNode, x: {
        [name: string]: any;
    }): void;
    isValid(h: highLevel.IHighLevelNode, v: any, p: highLevel.IProperty): any;
    toRuntime(): defs.Array;
}
export declare class ExternalType extends NodeClass {
    schemaString: string;
    node: highLevel.IHighLevelNode;
    isUserDefined(): boolean;
}
export declare class Union extends NodeClass implements highLevel.IUnionType {
    left: highLevel.ITypeDefinition;
    right: highLevel.ITypeDefinition;
    leftType(): highLevel.ITypeDefinition;
    rightType(): highLevel.ITypeDefinition;
    isUserDefined(): boolean;
    toRuntime(): defs.Union;
    union(): defs.Union;
    isUnion(): boolean;
    isArray(): boolean;
}
export declare class UserDefinedProp extends Property {
    _node: highLevel.IParseResult;
    _displayName: string;
    withDisplayName(name: string): void;
    getDisplayName(): string;
    node(): highLevel.IParseResult;
}
