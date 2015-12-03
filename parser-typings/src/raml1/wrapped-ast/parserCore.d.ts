import hl = require("../highLevelAST");
import hlImpl = require("../highLevelImpl");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import json2lowlevel = require('../jsyaml/json2lowLevel');
export interface AbstractWrapperNode {
    /***
     * @hidden
     ***/
    wrapperClassName(): string;
    /***
     * @return Actual name of instance interface
     ***/
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
    errors(): RamlParserError[];
    /***
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /***
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
    /***
     * Turn model node into an object. Should not be relied on for API analysis and manipulation by the parser users.
     * @param node Model node
     * @return Stringifyable object representation of the node.
     ***/
    toJSON(serializeOptions?: json2lowlevel.SerializeOptions): any;
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
    errors(): RamlParserError[];
    /***
     * @return object representing class of the node
     **/
    definition(): hl.ITypeDefinition;
    /***
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition(): hl.ITypeDefinition;
    toJSON(serializeOptions?: json2lowlevel.SerializeOptions): any;
}
export interface AttributeNode extends AbstractWrapperNode {
    /***
     * @return Underlying High Level attribute node
     ***/
    highLevel(): hl.IAttribute;
}
export declare class AttributeNodeImpl implements AttributeNode {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Underlying High Level attribute node
     ***/
    highLevel(): hl.IAttribute;
    /***
     * @hidden
     */
    wrapperClassName(): string;
    getKind(): string;
}
/***
 * @hidden
 ***/
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
}
export interface RamlParserError {
    code: hl.IssueCode;
    message: string;
    path: string;
    start: number;
    end: number;
    line?: number;
    column?: number;
    isWarning: boolean;
}
export interface ApiLoadingError extends Error {
    errors: RamlParserError[];
}
