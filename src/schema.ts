import su=require("./util/schemaUtil")
import ll=require("./raml1/lowLevelAST")
import refResolvers=require("./raml1/jsyaml/includeRefResolvers")
import schemaGenApi = require("./raml1/tools/schemaModelGenApi")
import schemaGenImpl = require("./raml1/tools/schemaModelGen")

import contentprovider = require('./util/contentprovider');

export interface Schema {
    getType(): string;
    validate(content: string): void;
    validateObject(object:any):void;
}
export function createSchema(c:string,u:ll.ICompilationUnit):Schema{
    return su.createSchema(c,new contentprovider.ContentProvider(u));
}

export function getXMLSchema(c:string):Schema{
    return su.getXMLSchema(c);
}

export function getJSONSchema(c:string,u:ll.ICompilationUnit):Schema{
    return su.getJSONSchema(c, new contentprovider.ContentProvider(u));
}

export interface IncludeReference {
    getFragments(): string[];
    getIncludePath(): string;
    asString(): string;
    encodedName(): string;
}
export function completeReference(includePath: string,
                                  includeReference : IncludeReference, content: string) : string[] {
    return refResolvers.completeReference(includePath,includeReference,content);
}

export function getIncludePath(p:string):string{
    return refResolvers.getIncludePath(p);
}
export function getIncludeReference(p:string):IncludeReference{
    return refResolvers.getIncludeReference(p);
}

export function createSchemaModelGenerator() : schemaGenApi.SchemaToModelGenerator {
    return new schemaGenImpl.SchemaToModelGenerator();
}

export function createModelToSchemaGenerator() : schemaGenApi.ModelToSchemaGenerator {
    return new schemaGenImpl.ModelToSchemaGenerator();
}