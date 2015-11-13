import hl = require("./highLevelAST");
import hlImpl = require("./highLevelImpl");
export interface AbstractWrapperNode {
    wrapperClassName(): string;
}
export interface BasicSuperNode extends AbstractWrapperNode {
    parent(): BasicSuperNode;
    highLevel(): hl.IHighLevelNode;
    errors(): hl.ValidationIssue[];
    definition(): hl.ITypeDefinition;
    runtimeDefinition(): hl.ITypeDefinition;
}
export declare class BasicSuperNodeImpl implements BasicSuperNode {
    protected _node: hl.IHighLevelNode;
    constructor(_node: hl.IHighLevelNode);
    wrapperClassName(): string;
    parent(): BasicSuperNode;
    highLevel(): hl.IHighLevelNode;
    attributes(name: string, constr?: (attr: hl.IAttribute) => any): any[];
    attribute(name: string, constr?: (attr: hl.IAttribute) => any): any;
    elements(name: string): any[];
    element(name: string): any;
    add(node: BasicSuperNodeImpl): void;
    addToProp(node: BasicSuperNodeImpl, prop: string): void;
    remove(node: BasicSuperNodeImpl): void;
    dump(): string;
    toString(attr: hl.IAttribute): string;
    toBoolean(attr: hl.IAttribute): boolean;
    toNumber(attr: hl.IAttribute): any;
    errors(): hl.ValidationIssue[];
    definition(): hl.ITypeDefinition;
    runtimeDefinition(): hl.ITypeDefinition;
}
export declare function toStructuredValue(node: hl.IAttribute): hlImpl.StructuredValue;
