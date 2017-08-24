import hl = require("../highLevelAST")

export interface SchemaToModelGenerator {
    generateTo(api: hl.IHighLevelNode, schema:string, title? : string): string[];
}

export interface ModelToSchemaGenerator {
    generateSchema(node: hl.IHighLevelNode): any;
}