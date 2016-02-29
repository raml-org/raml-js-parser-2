/// <reference path="../../../typings/main.d.ts" />
import hl = require("../highLevelAST");
import ll = require("../lowLevelAST");
export declare class BasicNodeBuilder implements hl.INodeBuilder {
    shouldDescriminate: boolean;
    process(node: hl.IHighLevelNode, childrenToAdopt: ll.ILowLevelASTNode[]): hl.IParseResult[];
    private isTypeDeclarationShortcut(node, property);
    private processChildren(childrenToAdopt, aNode, res, allowsQuestion, km);
}
export declare function doDescrimination(node: hl.IHighLevelNode): any;
