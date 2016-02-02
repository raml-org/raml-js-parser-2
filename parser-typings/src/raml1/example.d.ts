/// <reference path="../../typings/main.d.ts" />
import highLevel = require("./highLevelAST");
import typeSystem = require("./definition-system/typeSystem");
export declare function createExamples(typeDefinition: highLevel.ITypeDefinition): typeSystem.IExpandableExample[];
export declare function createExampleFromSpec(exampleSpecNode: highLevel.IHighLevelNode): typeSystem.IExpandableExample;
/**
 * Default implementation of example.
 */
export declare class ExpandableExampleImpl implements typeSystem.IExpandableExample {
    private attribute;
    private _built;
    private _isEmpty;
    private _isJSONString;
    private _isXMLString;
    private _isYAML;
    private _stringRepresentation;
    private _jsonRepresentation;
    constructor(attribute: highLevel.IAttribute);
    /**
     * Returns true if the application in question does not have an example set directly.
     * It is still possible that while application has no direct example, references may have
     * example pieces, current example may be expanded with.
     */
    isEmpty(): boolean;
    /**
     * Whether the original example is JSON string.
     */
    isJSONString(): boolean;
    /**
     * Whether the original example is XML string.
     */
    isXMLString(): boolean;
    /**
     * Whether original example is set up as YAML.
     */
    isYAML(): boolean;
    /**
     * Returns representation of this example as a string.
     * This method works for any type of example.
     */
    asString(): string;
    /**
     * Returns representation of this example as JSON object.
     * This works for examples being JSON strings and YAML objects.
     * It -may- work for XML string examples, but is not guaranteed.
     */
    asJSON(): any;
    /**
     * Returns an original example. It is string for XML and JSON strings,
     * or JSON object for YAML example.
     */
    original(): any;
    /**
     * Expands the example with what its application references can provide.
     * Returns null or expansion result as string. XML examples are not supported.
     */
    expandAsString(): string;
    /**
     * Expands the example with what its application references can provide.
     * Returns null or expansion result as JSON object. XML examples are not supported.
     */
    expandAsJSON(): any;
    private buildIfNeeded();
    private build();
    /**
     * Gets sample contents from declaring node.
     * Returns either a string, json object for YAML, or null
     */
    private internalExampleContent();
    private testExampleJson(content);
    private testExampleXML(content);
    private getTypeDefinition();
}
export declare class EmptyExpandableExample implements typeSystem.IExpandableExample {
    private typeDefinition;
    constructor(typeDefinition?: highLevel.ITypeDefinition);
    isEmpty(): boolean;
    isJSONString(): boolean;
    isXMLString(): boolean;
    isYAML(): boolean;
    asString(): string;
    asJSON(): any;
    original(): any;
    expandAsString(): string;
    expandAsJSON(): any;
}
