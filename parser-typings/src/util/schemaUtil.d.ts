/// <reference path="../../typings/main.d.ts" />
export declare class ValidationResult {
    result: any;
    num: number;
}
export declare class JSONSchemaObject {
    private schema;
    jsonSchema: any;
    constructor(schema: string);
    getType(): string;
    validateObject(object: any): void;
    validate(content: string): void;
}
export interface ValidationError {
    code: string;
    params: string[];
    message: string;
    path: string;
}
export declare class XMLSchemaObject {
    private schema;
    constructor(schema: string);
    getType(): string;
    validate(content: string): void;
    validateObject(object: any): void;
}
export interface Schema {
    getType(): string;
    validate(content: string): void;
    validateObject(object: any): void;
}
export declare function getJSONSchema(content: string): any;
export declare function getXMLSchema(content: string): any;
export declare function createSchema(content: string): Schema;
