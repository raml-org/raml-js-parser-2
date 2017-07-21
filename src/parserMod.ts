import parser10api = require("./parser/artifacts/raml10parserapi")
import parser10impl = require("./parser/artifacts/raml10parser")
import coreApi=require("./parser/wrapped-ast/parserCoreApi");
import coreImpl=require("./parser/wrapped-ast/parserCore");
import highLevel = require("./parser/highLevelAST");
import stubs = require("./parser/stubs");
import defSys = require("raml-definition-system")
import jsyaml=require("./parser/jsyaml/jsyaml2lowLevel")
import ll=require("./parser/lowLevelAST")


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
    var exampleSpecType = defSys.getUniverse("RAML10").type(defSys.universesInfo.Universe10.ExampleSpec.name);
    var examplePropName = defSys.universesInfo.Universe10.TypeDeclaration.properties.example.name;
    var hlParent = type.highLevel();
    var llParent = hlParent.lowLevel();
    var exampleNodes = hlParent.children().filter(x=>x.lowLevel().key()==examplePropName);
    var llNode = jsyaml.createNode(examplePropName);
    
    ll.setAttr(llNode,example);
    
    if(exampleNodes.length>0) {
        ll.removeNode(llParent, exampleNodes[0].lowLevel());
        (<any>exampleNodes[0])._node = llNode;
        ll.insertNode(llParent, llNode);
    }
    
    (<any>hlParent).createAttr && (<any>hlParent).createAttr(examplePropName, example); 
}

export function addChild(parent : highLevel.BasicNode, child : highLevel.BasicNode) : void {
    (<coreImpl.BasicNodeImpl> parent).add(<coreImpl.BasicNodeImpl>child);
}