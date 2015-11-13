/// <reference path="../../typings/tsd.d.ts" />
import hl = require("./highLevelAST");
export interface BaseNode {
    type: string;
}
export interface Union extends BaseNode {
    first: BaseNode;
    rest: BaseNode;
}
export interface CodeAndType {
    code: string;
    expr: BaseNode;
}
export interface Responses extends BaseNode {
    codes: CodeAndType[];
}
export interface Parens {
    expr: BaseNode;
    arr: number;
}
export interface Literal {
    value: string;
    arr?: number;
    params?: BaseNode[];
}
export declare function validate(str: string, node: hl.IAttribute, cb: hl.ValidationAcceptor): void;
export declare function getType(node: hl.IHighLevelNode, expression: string, defined: {
    [name: string]: hl.ITypeDefinition;
}, toRuntime?: boolean): hl.ITypeDefinition;
/**
 * Only use it for example validaation at this point, lets think about it after release.
 * @param node
 * @param expression
 * @param defined
 * @param toRuntime
 * @returns {any}
 */
export declare function getType2(node: hl.IHighLevelNode, expression: string, defined: {
    [name: string]: hl.ITypeDefinition;
}, toRuntime?: boolean): hl.ITypeDefinition;
export declare function deriveType(node: hl.IHighLevelNode, r: BaseNode, toRuntime?: boolean, defining?: {
    [name: string]: hl.ITypeDefinition;
}): any;
export declare function nodeToString(r: BaseNode): string;
export declare function validateNode(r: BaseNode, node: hl.IAttribute, cb: hl.ValidationAcceptor): boolean;
