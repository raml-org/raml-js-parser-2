import lowLevel = require("./lowLevelAST")
import ds=require("raml-definition-system")
import typeSystem=ds.rt.nominalTypes;
import rTypes=ds.rt;
export type ITypeDefinition=typeSystem.ITypeDefinition;
export type IProperty=typeSystem.IProperty;
export interface AbstractWrapperNode {

    /**
     * @hidden
     **/
    wrapperClassName():string

    /**
     * @return Actual name of instance interface
     **/
    kind():string

    /**
     * @return RAML version of the node. "RAML10" for RAML 1.0 and "RAML08" for RAML 0.8.
     */
    RAMLVersion():string
}
export interface SerializeOptions{

    /**
     * For root nodes additional details can be included into output. If the option is set to `true`,
     * node content is returned as value of the **specification** root property. Other root properties are:
     *
     * * **ramlVersion** version of RAML used by the specification represented by the node
     * * **type** type of the node: Api, Overlay, Extension, Library, or any other RAML type in fragments case
     * * **errors** errors of the specification represented by the node
     * @default false
     */
    rootNodeDetails?:boolean

    /**
     * Whether to serialize metadata
     * @default true
     */
    serializeMetadata?:boolean


    dumpSchemaContents?: boolean
}
export interface BasicNode extends AbstractWrapperNode{

    /**
     * @return Direct ancestor in RAML hierarchy
     **/
    parent():BasicNode

    /**
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel():IHighLevelNode

    /**
     * @return Array of errors
     **/
    errors():RamlParserError[]

    /**
     * @return object representing class of the node
     **/
    definition():ITypeDefinition

    /**
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition():ITypeDefinition

    /**
     * Turns model node into an object.
     * @param node Model node
     * @return Stringifyable object representation of the node.
     **/
    toJSON(serializeOptions?:SerializeOptions):any

    /**
     * @return For siblings of traits or resource types returns an array of optional properties names.
     **/
    optionalProperties():string[]

    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional():boolean

    meta():NodeMetadata
}

export type INamedEntity=typeSystem.INamedEntity;

export type NamedId=typeSystem.NamedId;

export interface ValueMetadata{

    /**
     * Returns 'true', if the actual value is missing, and returned value has
     * been obtained from the RAML document by means of some rule.
     * @default false
     */
    calculated():boolean;

    /**
     * Returns 'true', if the actual value is missing, and returned value is
     * stated in the RAML spec as default for the property
     * @default false
     */
    insertedAsDefault():boolean;

    /**
     * Returns 'true' for optional siblings of traits and resource types
     * @default false
     */
    optional():boolean;

    /**
     * Returns 'true', if all values are default.
     */
    isDefault():boolean;

    toJSON():any;
}
export interface RamlParserError {

    /**
     * Error identifier
     */
    code: string;

    /**
     * Messag text
     */
    message: string;

    /**
     * File path
     */
    path: string;

    /**
     * RangeObject describing start and end of error location
     */
    range:RangeObject;

    /**
     * Whether the message is warning or not
     */
    isWarning: boolean;
    
    trace?:RamlParserError[];
}

export interface RangeObject{

    start: MarkerObject;

    end: MarkerObject;
}

export interface MarkerObject{

    line:number;

    column:number;

    position:number;
}

export interface NodeMetadata extends ValueMetadata{

    /**
     * Returns metadata for those properties of the node, whose type is primitive or an array of primitive.
     */
    primitiveValuesMeta():{[key:string]:ValueMetadata};
}

export type IArrayType =typeSystem.IArrayType

export type IUnionType = typeSystem.IUnionType;
export type IExpandableExample=typeSystem.IExpandableExample;

export type INodeDefinition = ITypeDefinition;
export interface IValueTypeDefinition extends ITypeDefinition{}
export type IUniverse= typeSystem.IUniverse;
export interface IValueDocProvider{
    (v:string):string
}
export interface IValueSuggester{
    (node:IHighLevelNode):string[]
}


export enum NodeKind {
    BASIC,
    NODE,
    ATTRIBUTE
}
export enum RAMLVersion{
    RAML10,
    RAML08
}
export interface IParseResult {

    hashkey(): string;

    /**
     * retrieve errors if any
     */
    errors():ValidationIssue[]

    /**
     * The underlaying node of the low level AST
     */
    lowLevel():lowLevel.ILowLevelASTNode

    name():string

    /**
     * Whether the element is an optional sibling of trait or resource type
     **/
    optional():boolean;

    /**
     * Returns AST root node
     */
    root():IHighLevelNode

    /**
     * Whether the nodes have the same underlying YAML node
     */
    isSameNode(n:IParseResult):boolean;

    /**
     * Parent AST node
     */
    parent():IHighLevelNode;

    /**
     * Specify parent AST node
     */
    setParent(node: IParseResult);

    /**
     * Child nodes obtained
     * 1. from AST directly
     * 2. by applying overlays and extensions if any
     */
    children():IParseResult[];

    /**
     * Child nodes obtained from AST directly
     */
    directChildren():IParseResult[];

    /**
     * Whether the node is not the AST root
     */
    isAttached():boolean

    isImplicit():boolean

    /**
     * Whether the node is an attribute
     */
    isAttr():boolean

    /**
     * @return this for attribute nodes, and null otherwise
     */
    asAttr():IAttribute;

    /**
     * Whether the node is an element
     */
    isElement():boolean;

    /**
     * @return this for element nodes, and null otherwise
     */
    asElement():IHighLevelNode;

    localId():string;
    fullLocalId() : string;

    /**
     * Whether the node is unknown, i.e. can not justified by RAML syntax
     */
    isUnknown():boolean;

    /**
     * Each non root AST node appears to be a value of some RAML element property
     * The property is returned gor non root nodes. Null is returned for root.
     */
    property():IProperty;

    id():string

    computedValue(name:string):any

    /**
     * Apply validation using the input validation acceptor
     */
    validate(acceptor:ValidationAcceptor):void

    /**
     * Some text representation of the node
     */
    printDetails(indent?:string):string

    getKind() : NodeKind

    /**
     * Start position of the underlying low level AST node
     */
    getLowLevelStart()

    /**
     * End position of the underlying low level AST node
     */
    getLowLevelEnd()

    /**
     * RAML version
     */
    version();
}

export function isParseResult(object : any) : object is IParseResult {
    return object.asElement && object.getKind && object.asAttr && object.lowLevel;
}

export interface Status{
    message:string
}
export enum IssueCode{
 UNRESOLVED_REFERENCE,

 YAML_ERROR,

 UNKNOWN_NODE,

 MISSING_REQUIRED_PROPERTY,

 PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,
 //TODO IMPLEMENT
 KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT,

 UNABLE_TO_RESOLVE_INCLUDE_FILE,

 INVALID_VALUE_SCHEMA,

 MISSED_CONTEXT_REQUIREMENT,

 NODE_HAS_VALUE,

 ONLY_OVERRIDE_ALLOWED,

 ILLEGAL_PROPERTY_VALUE,

 ILLEGAL_PROPERTY,
     
 INVALID_PROPERTY
}
export interface ValidationAcceptor{
    begin()
    accept(issue: ValidationIssue);
    end();
    acceptUnique(issue: ValidationIssue);
}

/**
 * Sometimes the way we report the same error depends on the point of view:
 * which unit we consider the "primary" one.
 *
 * In example, the same application of extension to master API can be either treated
 * as a parser "opening" the extension (so extension is the primary unit), or as
 * "opening" master API and then applying extension to it (so master is the primary unit).
 *
 * In both cases the error is the same, but should be reported a bit differently.
 *
 * Thus we need to add primary unit info to the acceptor.
 */
export interface PointOfViewValidationAcceptor extends ValidationAcceptor {
    getPrimaryUnit() : lowLevel.ICompilationUnit;
}

export interface ValidationAction {
    name: string;
    action: () => void;
}

export interface ValidationIssue {
    code: string;
    message: string;
    node: IParseResult;
    path: string;
    start: number;
    end: number;
    isWarning: boolean;

    actions?: ValidationAction[];

    extras?:ValidationIssue[];
    unit?:lowLevel.ICompilationUnit;
}
export interface IStructuredValue{

    lowLevel():lowLevel.ILowLevelASTNode
    valueName():string
    toHighLevel(parent?: IHighLevelNode):IHighLevelNode;
}


export interface INodeBuilder {
    process(node: IHighLevelNode, childrenToAdopt: lowLevel.ILowLevelASTNode[]): IParseResult[];
}

export interface IAttribute extends IParseResult {

    /**
     * Value type representation
     */
    definition(): IValueTypeDefinition;

    /**
     * Attribute value
     */
    value(): any;

    /**
     * Set key to the underlying YAML node
     */
    setKey(k:string);

    /**
     * Set value to the underlying YAML node
     */
    setValue(newValue: string|IStructuredValue);

    /**
     * Set values to the underlying YAML node
     */
    setValues(values: string[]);

    /**
     * Append value to the underlying YAML node
     */
    addValue(value: string|IStructuredValue);

    /**
     * Remove trhe attribute from AST
     */
    remove();

    isEmpty(): boolean;

    owningWrapper():{node:BasicNode; property:string};

    /**
     * For references returns nAST node defining the referenced RAML element
     */
    findReferencedValue():IHighLevelNode

    /**
     * Whether the attribute represents an annotated scalar value
     */
    isAnnotatedScalar():boolean;

    /**
     * A list of annotations if any
     */
    annotations():IAttribute[];
}

export interface IHighLevelNode extends IParseResult {

    /**
     * Relevant types collection
     */
    types():rTypes.IParsedTypeCollection;

    /**
     * For type nodes returns runtime representation of the type
     */
    parsedType():rTypes.IParsedType;

    /**
     * For type nodes returns nominal representation of the type
     */
    localType():typeSystem.ITypeDefinition;

    /**
     * RAML type of the node
     */
    definition(): INodeDefinition;

    /**
     * Whether the node can appear as optional template property value
     */
    allowsQuestion(): boolean;

    /**
     * List child attributes
     */
    attrs():IAttribute[];

    /**
     * Retrieve attribute by property name. For multivalue properties returns the first attribute.
     */
    attr(n:string):IAttribute;

    /**
     * Retrieve attribute by name or create it if it does not exist
     */
    attrOrCreate(n:string):IAttribute;

    /**
     * Retrieve attribute value by name
     */
    attrValue(n:string):string;

    /**
     * Retrieve attributes by property name. For multivalue properties returns
     * a complete list of attributes.
     */
    attributes(n:string):IAttribute[];

    /**
     * List child elements
     */
    elements():IHighLevelNode[];

    /**
     * Retrieve element by property name. For multivalue properties returns the first element.
     */
    element(n:string):IHighLevelNode;

    /**
     * Retrieve elements by property name. For multivalue properties returns
     * a complete list of elements.
     */
    elementsOfKind(n: string): IHighLevelNode[];


    /**
     * Whether the AST has traits and resource types expanded
     */
    isExpanded(): boolean;

    /**
     * Scalar value representing the element value, if possible
     */
    value(): any;

    /**
     * All possible properties of the element
     */
    propertiesAllowedToUse():IProperty[];

    /**
     * Append child node
     */
    add(node: IHighLevelNode|IAttribute);

    /**
     * Remove child node
     */
    remove(node: IHighLevelNode|IAttribute);

    /**
     * Dump the element to YAML string
     */
    dump(flavor: string): string;

    /**
     * Retrieve the deepest element enclosing the position specified
     * @param offset text position
     */
    findElementAtOffset(offset: number):IHighLevelNode;

    /**
     * List all the references to the RAML element decalred in the node
     */
    findReferences(): IParseResult[];

    /**
     * Copy of the node having low level node and YAML node copies as underlying nodes
     */
    copy(): IHighLevelNode;

    /**
     * Clean the list of cached child nodes
     */
    resetChildren():void

    findById(id:string);


    associatedType():INodeDefinition;

    /**
     * Retrieve top level owner node
     */
    wrapperNode():BasicNode;

    /**
     * Override top level owner node
     */
    setWrapperNode(node:BasicNode);

    /**
     * A list of optional property names
     */
    optionalProperties():string[];

    /**
     * Convert typesystem error representation to parser error representation
     */
    createIssue(error:rTypes.IStatus): ValidationIssue;

    /**
     * Returns node master or null for top-level nodes.
     */
    getMaster() : IParseResult;

    /**
     * Gets whether this node is auxilary.
     */
    isAuxilary() : boolean;
}

export interface IEditableHighLevelNode extends IHighLevelNode {
    createAttr(n:string,v:string);
}

export interface IAcceptor<T> {
    calculationStarts();
    acceptProposal(c: T);
    calculationComplete();
}

export interface IStructuredValue {

    valueName(): string ;

    children():IStructuredValue[];

    lowLevel():lowLevel.ILowLevelASTNode;

    toHighLevel(parent?: IHighLevelNode):IHighLevelNode;

    toHighLevel2(parent?: IHighLevelNode):IHighLevelNode;
}

export interface PluginValidationIssue extends rTypes.tsInterfaces.PluginValidationIssue{

    issueCode?:string,
    message?:string,
    node?:IParseResult,
    isWarning?:boolean,
    validationIssue?:ValidationIssue
}

/**
 * Model of AST node validation plugin
 */
export interface INodeValidationPlugin{

    /**
     * Apply validation to AST node
     * @param node AST node
     * @return array of {ValidationIssue}
     */
    process(node:IParseResult):PluginValidationIssue[];

    /**
     * String ID of the plugin
     */
    id():string;
}


/**
 * Retrieve a list of registered node validation plugins
 */
export function getNodeValidationPlugins():INodeValidationPlugin[]{
    var rv:any = global.ramlValidation;
    if(rv){
        var nodeValidators = rv.nodeValidators;
        if(Array.isArray(nodeValidators)){
            return <INodeValidationPlugin[]>nodeValidators;
        }
    }
    return [];
}

/**
 * Retrieve a list of registered annotation node validation plugins
 */
export function getNodeAnnotationValidationPlugins():ASTAnnotationValidationPlugin[]{
    var rv:any = global.ramlValidation;
    if(rv){
        var astAnnotationValidators = rv.astAnnotationValidators;
        if(Array.isArray(astAnnotationValidators)){
            return <ASTAnnotationValidationPlugin[]>astAnnotationValidators;
        }
    }
    return [];
}


/**
 * Model of annotation validator
 */
export interface ASTAnnotationValidationPlugin {

    /**
     * validate annotated RAML element
     */
    process(entry:rTypes.tsInterfaces.IAnnotatedElement):PluginValidationIssue[];

    /**
     * String ID of the plugin
     */
    id():string;

}
