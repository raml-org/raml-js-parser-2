import searchImpl=require("./search-implementation")
import hl=require("../parser/highLevelAST")
import ll=require("../parser/lowLevelAST")
import hlimpl=require("../parser/highLevelImpl")
import def=require("raml-definition-system")
import sourceFinder = require("./sourceFinder")

/**
 * Finds declaration of the entity located in the particular compilation unit at offset.
 *
 * @param unit - compilation unit.
 * @param offset - character offset in unit counting from 0.
 * @param nodePart - optionally specifies the relevant instruction part of the node.
 * @returns {ll.ICompilationUnit|hl.IParseResult} - either the declaration node or compilation unit
 */
export function findDeclaration(unit:ll.ICompilationUnit, offset:number,
                                nodePart? : LocationKind):ll.ICompilationUnit|hl.IParseResult {
    return searchImpl.findDeclaration(unit,offset,<any>nodePart);
}

/**
 * Result of find usage call
 */
export interface FindUsagesResult{

    /**
     * High-level node at offset.
     */
    node:hl.IHighLevelNode

    /**
     * High-level nodes, which use the entity defined by the node at offset.
     */
    results:hl.IParseResult[]
}

/**
 * Finds usages of the entity located in the particular compilation unit at offset.
 * @param unit - compilation unit.
 * @param offset - character offset in unit counting from 0.
 * @returns {FindUsagesResult}
 */
export function findUsages(unit:ll.ICompilationUnit, offset:number):FindUsagesResult{
    return searchImpl.findUsages(unit,offset);
}

/**
 * Finds global declarations (high-level nodes defined at the top-level of the unit) of the unit,
 * current node belongs to. If current unit is included by the external unit, also adds up declarations of the
 * external unit.
 * @param n
 * @returns {hl.IHighLevelNode[]}
 */
export function globalDeclarations(n:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return searchImpl.globalDeclarations(n);
}

/**
 * Finds references for the node starting from a given root. In a general case its better to use findUsages method.
 * @param root - root of the unit to start from.
 * @param node - node to find references for,
 * @param result - array to put results to.
 */
export function refFinder(root:hl.IHighLevelNode,node:hl.IHighLevelNode,result:hl.IParseResult[]):void{
    searchImpl.refFinder(root, node, result);
}

/**
 * Finds declaration of the entity set by a node.
 * @param node - node, which declaration to find
 * @param nodePart - optionally specifies the relevant instruction part of the node.
 * @returns {ll.ICompilationUnit|hl.IParseResult} - either the declaration node or compilation unit
 */
export function findDeclarationByNode(node : hl.IParseResult,
                                      nodePart? : LocationKind):ll.ICompilationUnit|hl.IParseResult {
    return searchImpl.findDeclarationByNode(node, nodePart);
}

/**
 * Location kind inside the instruction
 */
export enum LocationKind{
    /**
     * In value
     */
    VALUE_COMPLETION,

    /**
     * In key
     */
    KEY_COMPLETION,

    /**
     * In path
     */
    PATH_COMPLETION,

    /**
     * In directive
     */
    DIRECTIVE_COMPLETION,

    /**
     * In RAML version
     */
    VERSION_COMPLETION,

    /**
     * In annotation
     */
    ANNOTATION_COMPLETION,

    /**
     * In key of the sequence
     */
    SEQUENCE_KEY_COPLETION,

    /**
     * In comment
     */
    INCOMMENT
}

/**
 * Determines location kind inside the instruction.
 * @param text - RAML code
 * @param offset - offeset counting from 0.
 * @returns {any}
 */
export function determineCompletionKind(text:string,offset:number):LocationKind{
    return <any>searchImpl.determineCompletionKind(text,offset);
}

/**
 * Determines names, which can appear in a certain place of code defined by a node and a proprty.
 * @param property - definition property
 * @param node - node.
 * @returns {string[]} - list of names
 */
export function enumValues(property:hl.IProperty,node:hl.IHighLevelNode):string[]{
    return searchImpl.enumValues(<any>property,node);
}

/**
 * Returns a string representation of node name in a context. In case of deep unit dependencies returns contcatenated path.
 * @param node - node, which name to determine
 * @param context - sets up a node, which unit is used as a context to calculate potential unit paths from
 * @returns {string}
 */
export function qName(node:hl.IHighLevelNode,context:hl.IHighLevelNode):string{
    return hlimpl.qName(node,context);
}

/**
 * Return all sub types of a given type visible from the particular node.
 * @param type - type, which subtypes to find
 * @param context - context node to determine subtypes visibility.
 * @returns {ITypeDefinition[]} - list of subtypes
 */
export function subTypesWithLocals(type:hl.ITypeDefinition,context:hl.IHighLevelNode):hl.ITypeDefinition[]{
    return searchImpl.subTypesWithLocals(type,context);
}

/**
 * Finds nodes, which declare a type in the context of a specific node.
 * @param type - type, which declarations to find.
 * @param context - context node.
 * @returns {hl.IHighLevelNode[]} - list of results
 */
export function nodesDeclaringType(type:hl.ITypeDefinition,context:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return searchImpl.nodesDeclaringType(type,context);
}

/**
 * Checks if a particular attribute declares an example.
 * @param attribute
 * @returns {boolean}
 */
export function isExampleNodeContent(attribute:hl.IAttribute):boolean{
    return searchImpl.isExampleNodeContent(attribute);
}

/**
 * Finds the type, which declares the content of an example defined in the attribute.
 * @param attribute
 * @returns {hl.INodeDefinition}
 */
export function findExampleContentType(attribute:hl.IAttribute):hl.ITypeDefinition{
    return searchImpl.findExampleContentType(attribute);
}

/**
 * Parses the value of example attribute
 * @param attribute - attribute, which value to parse
 * @param definition - type, which defines example contents.
 * @returns {hl.IHighLevelNode}
 */
export function parseDocumentationContent(attribute:hl.IAttribute,definition:hl.ITypeDefinition):hl.IHighLevelNode{
    return searchImpl.parseDocumentationContent(attribute,definition);
}

/**
 * Parses example node contents.
 * @param exampleNode - example node, which value to parse
 * @param definition - type, which defines example contents.
 * @returns {hl.IHighLevelNode}
 */
export function parseStructuredExample(exampleNode: hl.IHighLevelNode, definition : hl.INodeDefinition) : hl.IHighLevelNode {
    return searchImpl.parseStructuredExample(exampleNode, definition);
}

/**
 * Checks whether the node defines an example.
 * @param node
 * @returns {boolean}
 */
export function isExampleNode(node : hl.IHighLevelNode) {
    return searchImpl.isExampleNode(node);
}

/**
 * Finds out, which references a particular node property targets.
 * @param property - node property.
 * @param node - node
 * @returns {hl.IHighLevelNode[]} - list of references
 */
export function referenceTargets(property:hl.IProperty,node:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return searchImpl.referenceTargets(property,node);
}

/**
 * This entity can provide its source as high-level node.
 */
export interface IHighLevelSourceProvider {
    getSource() : hl.IParseResult
}

/**
 * Finds out the source of the nominal type.
 * @param nominalType - type, which source to find.
 * @returns {IHighLevelSourceProvider} - source provider. both provider and its getSource() can be null
 */
export function getNominalTypeSource(
    nominalType : def.ITypeDefinition) : IHighLevelSourceProvider {

    return sourceFinder.getNominalTypeSource(nominalType);
}

/**
 * Finds out all subtypes of the type being a range of the property, in the context of the specific node.
 * @param property - property, which range type's subtypes to find.
 * @param node - context node.
 * @returns {hl.ITypeDefinition[]} - list of subtypes.
 */
export function findAllSubTypes(property:hl.IProperty,node:hl.IHighLevelNode):hl.ITypeDefinition[] {
    return searchImpl.findAllSubTypes(property, node);
}

/**
 * Finds the root of the unit of the particular node.
 * @param node
 * @returns {hl.IHighLevelNode}
 */
export function declRoot(node:hl.IHighLevelNode):hl.IHighLevelNode {
    return searchImpl.declRoot(node);
}

/**
 * Finds a node located in certain place of the code.
 * @param parent - searches inside this node
 * @param offset - start position
 * @param end - end position
 * @param goToOtherUnits - whether to check other units
 * @param returnAttrs - whether to return attributes, or only high level nodes
 * @returns {hl.IParseResult} - search result
 */
export function deepFindNode(parent:hl.IParseResult,offset:number,end:number, goToOtherUnits=true, returnAttrs=true):hl.IParseResult{
    return searchImpl.deepFindNode(parent, offset, end, goToOtherUnits, returnAttrs);
}

/**
 * Finds all children of the node, recursively.
 * @param node
 * @returns {hl.IParseResult[]}
 */
export function allChildren(node:hl.IHighLevelNode):hl.IParseResult[]{
    return searchImpl.allChildren(node);
}
