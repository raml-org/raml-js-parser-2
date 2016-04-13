import parser10api = require("./raml1/artifacts/raml10parserapi")
import parser10impl = require("./raml1/artifacts/raml10parser")
import coreApi=require("./raml1/wrapped-ast/parserCoreApi");
import coreImpl=require("./raml1/wrapped-ast/parserCore");
import highLevel = require("./raml1/highLevelAST")


export function createTypeDeclaration(typeName : string) : parser10api.TypeDeclaration {
    return new parser10impl.TypeDeclarationImpl(typeName);
}

export function createObjectTypeDeclaration(typeName : string) : parser10api.ObjectTypeDeclaration {
    return new parser10impl.ObjectTypeDeclarationImpl(typeName);
}
//TODO it would be probably better to generate modification interface too

export function setTypeDeclarationSchema(type: parser10api.TypeDeclaration, schema : string) {
    (<parser10impl.TypeDeclarationImpl> type).setSchema(schema);
}

export function setTypeDeclarationExample(type: parser10api.TypeDeclaration, example : string) {
    (<parser10impl.TypeDeclarationImpl> type).setExample(example);
}

export function addChild(parent : highLevel.BasicNode, child : highLevel.BasicNode) : void {
    (<coreImpl.BasicNodeImpl> parent).add(<coreImpl.BasicNodeImpl>child);
}