/// <reference path="../../../typings/underscore/underscore.d.ts" />
export interface INamedEntity {
    nameId(): string;
    description(): any;
    getAdapter<T>(adapterType: {
        new (arg?: any): T;
    }): T;
    annotations(): IAnnotation[];
    addAnnotation(a: IAnnotation): any;
    removeAnnotation(a: IAnnotation): any;
}
export interface NamedId {
    name: string;
}
export interface ITyped {
    getType(): ITypeDefinition;
}
export interface IAnnotation extends INamedEntity, ITyped {
    /***
     * names of the parameters that are specified here
     */
    parameterNames(): string[];
    /**
     * value of the parameter with name
     * @param name
     */
    parameter(name: string): any;
}
export interface ITypeDefinition extends INamedEntity {
    key(): NamedId;
    /**
     * list os super types
     */
    superTypes(): ITypeDefinition[];
    /**
     * list of sub types
     */
    subTypes(): ITypeDefinition[];
    /**
     * list of all subtypes not including this type
     */
    allSubTypes(): ITypeDefinition[];
    /**
     * List of all super types not including this type
     */
    allSuperTypes(): ITypeDefinition[];
    /**
     * Propertis decared in this type
     */
    properties(): IProperty[];
    facet(n: string): IProperty;
    /**
     *
     *
     * List off all properties (declared in this type and super types),
     * did not includes properties fixed to fixed facet use facet for them
     */
    allProperties(visited?: any): IProperty[];
    /**
     * true if represents value type
     */
    isValueType(): boolean;
    /**
     * true if it is an array type
     */
    isArray(): boolean;
    /**
     * casting to array type
     */
    array(): IArrayType;
    /**
     * true if it is an union type
     */
    isUnion(): boolean;
    /**
     * returns representation of this stuff as union type
     */
    union(): IUnionType;
    isAnnotationType(): boolean;
    annotationType(): IAnnotationType;
    /**
     * true if this type values have internal structure
     */
    hasStructure(): boolean;
    /**
     * List of value requirements for this type,
     * used to discriminate a type from a list of subtype
     */
    valueRequirements(): ValueRequirement[];
    /**
     * parent universe
     */
    universe(): IUniverse;
    /**
     * return true if this type is assignable to a given type
     * @param typeName
     */
    isAssignableFrom(typeName: string): boolean;
    /**
     * return property by it name looks in super classes
     * but will not return anything if property is a fixed with facet
     * @param name
     */
    property(name: string): IProperty;
    /**
     * helper method to get required properties only
     */
    requiredProperties(): IProperty[];
    /**
     * @return map of fixed facet names to fixed facet values;
     */
    getFixedFacets(): {
        [name: string]: any;
    };
}
export interface FacetValidator {
    (value: any, facetValue: any): string;
}
export interface IValueDocProvider {
    (v: string): string;
}
/**
 * represent array types
 */
export interface IArrayType extends ITypeDefinition {
    componentType(): ITypeDefinition;
}
/**
 * represent union types
 */
export interface IUnionType extends ITypeDefinition {
    leftType(): ITypeDefinition;
    rightType(): ITypeDefinition;
}
/**
 * collection of types
 */
export interface IUniverse {
    /**
     * type for a given name
     * @param name
     */
    type(name: any): ITypeDefinition;
    /**
     * version of this universe
     */
    version(): string;
    /**
     * All types in universe
     */
    types(): ITypeDefinition[];
    /**
     * highlevel information about universe
     */
    matched(): {
        [name: string]: NamedId;
    };
}
export interface IProperty extends INamedEntity {
    /**
     * name of the property
     */
    nameId(): string;
    /**
     * returns true if this property matches the a given property name
     * (it is important for additional and pattern properties)
     * @param k
     */
    matchKey(k: string): boolean;
    /**
     * range of the property (basically it is type)
     */
    range(): ITypeDefinition;
    /**
     * domain of the property (basically declaring type)
     */
    domain(): ITypeDefinition;
    /**
     * facet validator which is associated with this property
     */
    getFacetValidator(): FacetValidator;
    /**
     * true if this property is required to fill
     */
    isRequired(): boolean;
    /**
     * true if this property can have multiple values
     */
    isMultiValue(): boolean;
    /**
     * true if this property range is one of built in value types
     */
    isPrimitive(): boolean;
    /**
     * true if this property range is a value type
     */
    isValueProperty(): boolean;
    /**
     * return a prefix for a property name - used for additional properties
     */
    keyPrefix(): string;
    /**
     * return a pattern for a property name - used for a pattern properties
     */
    getKeyRegexp(): string;
    /**
     * returns a default value for this property
     */
    defaultValue(): any;
    /**
     * if this property range is constrained to a fixed set of values it will return the values
     */
    enumOptions(): string[];
    /**
     * true if this property is a discriminator
     */
    isDescriminator(): boolean;
}
export interface Injector {
    inject(a: Adaptable): any;
}
export declare function registerInjector(i: Injector): void;
export declare class Adaptable {
    private adapters;
    addAdapter(q: any): void;
    constructor();
    getAdapter<T>(adapterType: {
        new (p?: any): T;
    }): T;
}
export declare class Described extends Adaptable {
    private _name;
    private _description;
    constructor(_name: any, _description?: string);
    nameId(): string;
    description(): string;
    private _tags;
    private _version;
    private _annotations;
    addAnnotation(a: IAnnotation): void;
    removeAnnotation(a: IAnnotation): void;
    annotations(): any[];
    tags(): string[];
    withDescription(d: string): Described;
}
export declare class ValueRequirement {
    name: string;
    value: string;
    /**
     *
     * @param name name of the property to discriminate
     * @param value expected value of discriminating property
     */
    constructor(name: string, value: string);
}
export declare class Annotation extends Described implements IAnnotation {
    private type;
    private parameters;
    constructor(type: IAnnotationType, parameters: {
        [name: string]: any;
    });
    parameterNames(): string[];
    parameter(name: string): any;
    getType(): IAnnotationType;
}
export interface IAnnotationType extends ITypeDefinition {
    parameters(): ITypeDefinition[];
    allowedTargets(): any;
    allowRepeat(): boolean;
}
export declare class AbstractType extends Described implements ITypeDefinition {
    _universe: IUniverse;
    private _path;
    _key: NamedId;
    properties(): IProperty[];
    private _props;
    protected _allFacets: IProperty[];
    printDetails(): string;
    allFacets(ps?: {
        [name: string]: ITypeDefinition;
    }): IProperty[];
    facet(name: string): IProperty;
    typeId(): string;
    allProperties(ps?: {
        [name: string]: ITypeDefinition;
    }): IProperty[];
    property(propName: string): IProperty;
    isValueType(): boolean;
    isAnnotationType(): boolean;
    hasStructure(): boolean;
    key(): NamedId;
    _superTypes: ITypeDefinition[];
    _subTypes: ITypeDefinition[];
    _requirements: ValueRequirement[];
    isUserDefined(): boolean;
    private fixedFacets;
    isArray(): boolean;
    array(): any;
    uc: boolean;
    union(): any;
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
    private _nameAtRuntime;
    getPath(): string;
    setNameAtRuntime(name: string): void;
    getNameAtRuntime(): string;
    constructor(_name: string, _universe?: IUniverse, _path?: string);
    universe(): IUniverse;
    superTypes(): ITypeDefinition[];
    isAssignableFrom(typeName: string): boolean;
    annotationType(): IAnnotationType;
    subTypes(): ITypeDefinition[];
    allSubTypes(): ITypeDefinition[];
    allSuperTypes(): ITypeDefinition[];
    private allSuperTypesRecurrent(t, m, result);
    addSuperType(q: AbstractType): void;
    addRequirement(name: string, value: string): void;
    valueRequirements(): ValueRequirement[];
    requiredProperties(): IProperty[];
}
export declare class ValueType extends AbstractType implements ITypeDefinition {
    constructor(name: string, _universe?: IUniverse, path?: string, description?: string);
    hasStructure(): boolean;
    isValueType(): boolean;
    isUnionType(): boolean;
}
export declare class StructuredType extends AbstractType implements ITypeDefinition {
    _properties: IProperty[];
    hasStructure(): boolean;
    propertyIndex(name: string): number;
    addProperty(name: string, range: ITypeDefinition): Property;
    allPropertyIndex(name: string): number;
    properties(): IProperty[];
    registerProperty(p: IProperty): void;
}
export declare class Property extends Described implements IProperty {
    private _ownerClass;
    private _nodeRange;
    protected _groupName: string;
    protected _keyShouldStartFrom: string;
    protected _enumOptions: string[];
    private _isRequired;
    private _isMultiValue;
    private _defaultVal;
    private _descriminates;
    withMultiValue(v?: boolean): Property;
    withDescriminating(b: boolean): Property;
    withRequired(req: boolean): Property;
    isRequired(): boolean;
    withKeyRestriction(keyShouldStartFrom: string): Property;
    withDomain(d: StructuredType): Property;
    setDefaultVal(s: any): Property;
    defaultValue(): any;
    isPrimitive(): boolean;
    withRange(t: ITypeDefinition): Property;
    isValueProperty(): boolean;
    enumOptions(): string[];
    keyPrefix(): string;
    withEnumOptions(op: string[]): Property;
    _keyRegexp: string;
    withKeyRegexp(regexp: string): Property;
    getKeyRegexp(): string;
    matchKey(k: string): boolean;
    private facetValidator;
    getFacetValidator(): FacetValidator;
    setFacetValidator(f: FacetValidator): void;
    domain(): StructuredType;
    range(): ITypeDefinition;
    isMultiValue(): boolean;
    isDescriminator(): boolean;
}
export declare class Union extends AbstractType implements IUnionType {
    left: ITypeDefinition;
    right: ITypeDefinition;
    key(): any;
    leftType(): ITypeDefinition;
    rightType(): ITypeDefinition;
    isUserDefined(): boolean;
    union(): Union;
    isUnion(): boolean;
    isArray(): boolean;
}
export declare class Array extends AbstractType implements IArrayType {
    dimensions: number;
    component: ITypeDefinition;
    isArray(): boolean;
    array(): Array;
    isUserDefined(): boolean;
    componentType(): ITypeDefinition;
    key(): any;
}
