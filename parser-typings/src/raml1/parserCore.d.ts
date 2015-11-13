import hl = require("./highLevelAST");
import hlImpl = require("./highLevelImpl");
export interface AbstractWrapperNode {
    /***
     * @return actual name of instance class
     **/
    wrapperClassName(): string;
}
export interface BasicSuperNode extends AbstractWrapperNode {
    /***
     * @return direct ancestor in RAML hierarchy
     **/
    parent(): BasicSuperNode;
    /***
     * @return underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    /***
     * @return array of errors
     **/
    errors(): hl.ValidationIssue[];
    /***
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /***
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
}
export declare class BasicSuperNodeImpl implements BasicSuperNode {
    protected _node: hl.IHighLevelNode;
    constructor(_node: hl.IHighLevelNode);
    wrapperClassName(): string;
    /***
     * @return direct ancestor in RAML hierarchy
     **/
    parent(): BasicSuperNode;
    /***
     * @return underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    protected attributes(name: string, constr?: (attr: hl.IAttribute) => any): any[];
    protected attribute(name: string, constr?: (attr: hl.IAttribute) => any): any;
    protected elements(name: string): any[];
    protected element(name: string): any;
    /***
     * Append node as child
     * @param node node to be appended
     ***/
    add(node: BasicSuperNodeImpl): void;
    /***
     * Append node as property value
     * @param node node to be set as property value
     * @param prop name of property to set value for
     ***/
    addToProp(node: BasicSuperNodeImpl, prop: string): void;
    /***
     * Remove node from children set
     * @param node node to be removed
     ***/
    remove(node: BasicSuperNodeImpl): void;
    /***
     * @return YAML string representing the node
     ***/
    dump(): string;
    toString(attr: hl.IAttribute): string;
    toBoolean(attr: hl.IAttribute): boolean;
    toNumber(attr: hl.IAttribute): any;
    /***
     * @return array of errors
     **/
    errors(): hl.ValidationIssue[];
    /***
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /***
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
}
/***
 * Transform High Level attribute to StructuredValue object representing its value
 * @param node High Level attribute
 * @returns StructuredValue object
 */
export declare function toStructuredValue(node: hl.IAttribute): hlImpl.StructuredValue;
