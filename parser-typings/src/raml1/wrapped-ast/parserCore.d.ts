import hl = require("../highLevelAST");
import hlImpl = require("../highLevelImpl");
export interface AbstractWrapperNode {
    /***
     * @hidden
     ***/
    wrapperClassName(): string;
    getKind(): string;
}
export interface BasicNode extends AbstractWrapperNode {
    /***
     * @return Direct ancestor in RAML hierarchy
     **/
    parent(): BasicNode;
    /***
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    /***
     * @return Array of errors
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
export declare class BasicNodeImpl implements BasicNode {
    protected _node: hl.IHighLevelNode;
    /***
     * @hidden
     */
    constructor(_node: hl.IHighLevelNode);
    /***
     * @hidden
     */
    wrapperClassName(): string;
    getKind(): string;
    /***
     * @return Direct ancestor in RAML hierarchy
     **/
    parent(): BasicNode;
    /***
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel(): hl.IHighLevelNode;
    /***
     * @hidden
     ***/
    protected attributes(name: string, constr?: (attr: hl.IAttribute) => any): any[];
    /***
     * @hidden
     ***/
    protected attribute(name: string, constr?: (attr: hl.IAttribute) => any): any;
    /***
     * @hidden
     ***/
    protected elements(name: string): any[];
    /***
     * @hidden
     ***/
    protected element(name: string): any;
    /***
     * Append node as child
     * @param node node to be appended
     ***/
    add(node: BasicNodeImpl): void;
    /***
     * Append node as property value
     * @param node node to be set as property value
     * @param prop name of property to set value for
     ***/
    addToProp(node: BasicNodeImpl, prop: string): void;
    /***
     * Remove node from children set
     * @param node node to be removed
     ***/
    remove(node: BasicNodeImpl): void;
    /***
     * @return YAML string representing the node
     ***/
    dump(): string;
    toString(attr: hl.IAttribute): string;
    toBoolean(attr: hl.IAttribute): boolean;
    toNumber(attr: hl.IAttribute): any;
    /***
     * @return Array of errors
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
 * @hidden
 ***/
export declare function toStructuredValue(node: hl.IAttribute): hlImpl.StructuredValue;
