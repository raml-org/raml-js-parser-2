/// <reference path="../../../typings/tsd.d.ts" />
import hl = require("../highLevelAST");
import ll = require("../lowLevelAST");
export declare function resolveRamlPointer(point: hl.IHighLevelNode, path: string): hl.IHighLevelNode;
export declare var declRoot: (h: hl.IHighLevelNode) => hl.IHighLevelNode;
export declare function globalDeclarations(h: hl.IHighLevelNode): hl.IHighLevelNode[];
export declare function findDeclarations(h: hl.IHighLevelNode): hl.IHighLevelNode[];
export declare function extractName(cleaned: string, offset: number): string;
export interface FindUsagesResult {
    node: hl.IHighLevelNode;
    results: hl.IParseResult[];
}
export declare function findUsages(unit: ll.ICompilationUnit, offset: number): FindUsagesResult;
export declare function findDeclaration(unit: ll.ICompilationUnit, offset: number): ll.ICompilationUnit | hl.IParseResult;
export declare function findExampleContentType(node: hl.IAttribute): hl.INodeDefinition;
export declare function parseDocumentationContent(attribute: hl.IAttribute, type: hl.INodeDefinition): hl.IHighLevelNode;
export declare function isExampleNodeContent(node: hl.IAttribute): boolean;
export declare function determineCompletionKind(text: string, offset: number): LocationKind;
export declare enum LocationKind {
    VALUE_COMPLETION = 0,
    KEY_COMPLETION = 1,
    PATH_COMPLETION = 2,
    DIRECTIVE_COMPLETION = 3,
    VERSION_COMPLETION = 4,
    ANNOTATION_COMPLETION = 5,
    SEQUENCE_KEY_COPLETION = 6,
    INCOMMENT = 7,
}
export declare function resolveReference(point: ll.ILowLevelASTNode, path: string): ll.ILowLevelASTNode;
/**
 * return all sub types of given type visible from parent node
 * @param range
 * @param parentNode
 * @returns ITypeDefinition[]
 */
export declare var subTypesWithLocals: (range: hl.ITypeDefinition, parentNode: hl.IHighLevelNode) => hl.ITypeDefinition[];
export declare var subTypesWithName: (tname: string, parentNode: hl.IHighLevelNode, backup: {
    [name: string]: hl.ITypeDefinition;
}) => hl.ITypeDefinition;
export declare var schemasWithName: (tname: string, parentNode: hl.IHighLevelNode, backup: {
    [name: string]: hl.ITypeDefinition;
}) => hl.ITypeDefinition;
export declare var nodesDeclaringType: (range: hl.ITypeDefinition, n: hl.IHighLevelNode) => hl.IHighLevelNode[];
export declare function findAllSubTypes(p: hl.IProperty, n: hl.IHighLevelNode): hl.ITypeDefinition[];
export declare function allChildren(node: hl.IHighLevelNode): hl.IParseResult[];
export declare function refFinder(root: hl.IHighLevelNode, node: hl.IHighLevelNode, result: hl.IParseResult[]): void;
