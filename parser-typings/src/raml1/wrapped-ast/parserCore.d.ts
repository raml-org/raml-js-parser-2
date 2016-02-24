import hl = require("../highLevelAST");
import ll = require("../lowLevelAST");
import hlImpl = require("../highLevelImpl");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import json2lowlevel = require('../jsyaml/json2lowLevel');
import defaultCalculator = require("./defaultCalculator");
export interface AbstractWrapperNode {
    /**
     * @hidden
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface BasicNode extends AbstractWrapperNode {
    /**
     * @return Direct ancestor in RAML hierarchy
     **/
    parent(): BasicNode;
    /**
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    /**
     * @return Array of errors
     **/
    errors(): RamlParserError[];
    /**
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /**
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
    /**
     * Turn model node into an object. Should not be relied on for API analysis and manipulation by the parser users.
     * @param node Model node
     * @return Stringifyable object representation of the node.
     **/
    toJSON(serializeOptions?: json2lowlevel.SerializeOptions): any;
    /**
     * @return For siblings of traits or resource types returns an array of optional properties names.
     **/
    optionalProperties(): string[];
    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional(): boolean;
    meta(): NodeMetadata;
}
export declare class BasicNodeImpl implements BasicNode {
    protected _node: hl.IHighLevelNode;
    private defaultsCalculator;
    _meta: NodeMetadataImpl;
    /**
     * @hidden
     **/
    constructor(_node: hl.IHighLevelNode, setAsWrapper?: boolean);
    /**
     * @hidden
     **/
    wrapperClassName(): string;
    kind(): string;
    /**
     * @return Direct ancestor in RAML hierarchy
     **/
    parent(): BasicNode;
    /**
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    /**
     * @hidden
     **/
    protected attributes(name: string, constr?: (attr: hl.IAttribute) => any): any[];
    /**
     * @hidden
     **/
    protected attribute(name: string, constr?: (attr: hl.IAttribute) => any): any;
    /**
     * @hidden
     **/
    protected elements(name: string): any[];
    /**
     * @hidden
     **/
    protected element(name: string): any;
    /**
     * Append node as child
     * @param node node to be appended
     **/
    add(node: BasicNodeImpl): void;
    /**
     * Append node as property value
     * @param node node to be set as property value
     * @param prop name of property to set value for
     **/
    addToProp(node: BasicNodeImpl, prop: string): void;
    /**
     * Remove node from children set
     * @param node node to be removed
     **/
    remove(node: BasicNodeImpl): void;
    /**
     * @return YAML string representing the node
     **/
    dump(): string;
    toString(arg: any): string;
    toBoolean(arg: any): boolean;
    toNumber(arg: any): any;
    /**
     * @return Array of errors
     **/
    errors(): RamlParserError[];
    /**
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /**
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
    toJSON(serializeOptions?: json2lowlevel.SerializeOptions): any;
    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional(): boolean;
    /**
     * @return For siblings of traits or resource types returns an array of optional properties names.
     **/
    optionalProperties(): string[];
    /**
     * @hidden
     **/
    getDefaultsCalculator(): defaultCalculator.AttributeDefaultsCalculator;
    /**
     * @hidden
     **/
    setAttributeDefaults(attributeDefaults: boolean): void;
    attributeDefaults(): boolean;
    meta(): NodeMetadata;
}
export interface AttributeNode extends AbstractWrapperNode {
    /**
     * @return Underlying High Level attribute node
     **/
    highLevel(): hl.IAttribute;
    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional(): boolean;
    meta(): ValueMetadata;
}
export declare class AttributeNodeImpl implements AttributeNode {
    protected attr: hl.IAttribute;
    protected _meta: ValueMetadataImpl;
    constructor(attr: hl.IAttribute);
    /**
     * @return Underlying High Level attribute node
     **/
    highLevel(): hl.IAttribute;
    /**
     * @hidden
     **/
    wrapperClassName(): string;
    kind(): string;
    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional(): boolean;
    meta(): ValueMetadataImpl;
}
/**
 * @hidden
 **/
export declare function toStructuredValue(node: hl.IAttribute): hlImpl.StructuredValue;
export interface Options {
    /**
     * Module used for operations with file system
     **/
    fsResolver?: jsyaml.FSResolver;
    /**
     * Module used for operations with web
     **/
    httpResolver?: jsyaml.HTTPResolver;
    /**
     * Whether to return Api which contains errors.
     **/
    rejectOnErrors?: boolean;
    /**
     * If true, attribute defaults will be returned if no actual vale is specified in RAML code.
     * Affects only attributes.
     */
    attributeDefaults?: boolean;
}
export interface RamlParserError {
    /**
     * [[IssueCode]]
     */
    code: hl.IssueCode;
    /**
     * Messag text
     */
    message: string;
    /**
     * File path
     */
    path: string;
    /**
     * Start index in the whole text, starting from zero
     */
    start: number;
    /**
     * End index in the whole text, starting from zero
     */
    end: number;
    /**
     * Start line, starting from zero
     */
    line?: number;
    /**
     * Column index, starting from zero
     */
    column?: number;
    /**
     * Length two array of [[TextPosition]] describing start and end of error location
     */
    range: ll.TextPosition[];
    /**
     * Whether the message is warning or not
     */
    isWarning: boolean;
}
export interface ApiLoadingError extends Error {
    parserErrors: RamlParserError[];
}
export interface TypeInstance {
    properties(): TypeInstanceProperty[];
    isScalar(): boolean;
    value(): any;
}
export interface TypeInstanceProperty {
    name(): string;
    value(): TypeInstance;
    values(): TypeInstance[];
    isArray(): boolean;
}
export declare class TypeInstanceImpl implements TypeInstance {
    constructor(nodes: ll.ILowLevelASTNode | ll.ILowLevelASTNode[]);
    protected node: ll.ILowLevelASTNode;
    protected children: ll.ILowLevelASTNode[];
    properties(): TypeInstancePropertyImpl[];
    private getChildren();
    value(): any;
    isScalar(): any;
    toJSON(): any;
}
export declare class TypeInstancePropertyImpl implements TypeInstanceProperty {
    protected node: ll.ILowLevelASTNode;
    constructor(node: ll.ILowLevelASTNode);
    name(): string;
    value(): TypeInstanceImpl;
    values(): TypeInstanceImpl[];
    isArray(): any;
}
export interface ValueMetadata {
    /**
     * Returns 'true', if the actual value is missing, and returned value has
     * been obtained from the RAML document by means of some rule.
     * @default false
     */
    calculated(): boolean;
    /**
     * Returns 'true', if the actual value is missing, and returned value is
     * stated in the RAML spec as default for the property
     * @default false
     */
    insertedAsDefault(): boolean;
    /**
     * Returns 'true' for optional siblings of traits and resource types
     * @default false
     */
    optional(): boolean;
    /**
     * Returns 'true', if all values are default.
     */
    isDefault(): boolean;
    toJSON(): any;
}
export interface NodeMetadata extends ValueMetadata {
    /**
     * Returns metadata for those properties of the node, whose type is primitive or an array of primitive.
     */
    primitiveValuesMeta(): {
        [key: string]: ValueMetadata;
    };
}
export declare class ValueMetadataImpl implements ValueMetadata {
    protected _insertedAsDefault: boolean;
    protected _calculated: boolean;
    protected _optional: boolean;
    constructor(_insertedAsDefault?: boolean, _calculated?: boolean, _optional?: boolean);
    calculated(): boolean;
    insertedAsDefault(): boolean;
    setCalculated(): void;
    setInsertedAsDefault(): void;
    setOptional(): void;
    optional(): boolean;
    isDefault(): boolean;
    toJSON(): {};
}
export declare class NodeMetadataImpl extends ValueMetadataImpl implements NodeMetadata {
    valuesMeta: {
        [key: string]: ValueMetadata;
    };
    primitiveValuesMeta(): {
        [key: string]: ValueMetadata;
    };
    registerInsertedAsDefaultValue(propName: string): void;
    registerCalculatedValue(propName: string): void;
    registerOptionalValue(propName: string): void;
    resetPrimitiveValuesMeta(): void;
    isDefault(): boolean;
    toJSON(): {};
}
export declare function fillElementMeta(node: BasicNodeImpl): NodeMetadataImpl;
