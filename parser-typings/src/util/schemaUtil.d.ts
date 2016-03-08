/// <reference path="../../typings/main.d.ts" />
import lowLevel = require("../raml1/lowLevelAST");
export declare class ValidationResult {
    result: any;
    num: number;
}
export declare class JSONSchemaObject {
    private schema;
    private root;
    jsonSchema: any;
    constructor(schema: string, root: lowLevel.ICompilationUnit);
    getType(): string;
    validateObject(object: any): void;
    private rootPath();
    getMissingReferences(references: any[], normalize?: boolean): any[];
    contentAsync(reference: any): Promise<any>;
    private getSchemaPath(schema, normalize?);
    private patchSchema(schema);
    private collectRefContainers(rootObject, refContainers);
    validate(content: any, alreadyAccepted?: any[]): void;
    private setupId(json, path);
    private normalizePath(url);
    private resolvePath(context, relativePath);
    private isAbsolutePath(uri);
    private acceptErrors(key, errors, throwImmediately?);
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
export declare function getJSONSchema(content: string, root: lowLevel.ICompilationUnit): any;
export declare function getXMLSchema(content: string): any;
export declare function createSchema(content: string, root: lowLevel.ICompilationUnit): Schema;
export declare function isScheme(content: any): any;
export declare function startDownloadingReferencesAsync(schemaContent: string, unit: lowLevel.ICompilationUnit): Promise<lowLevel.ICompilationUnit>;
export declare function getReferences(schemaContent: any, unit: any): any;
