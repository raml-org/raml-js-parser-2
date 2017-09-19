/***
 *
 *
 * ATTENTION! The script is used by the gulp build
 *
 *
 **/
import fs=require("fs")
import wrapped=require("./wrappedParserGen")
import def = require("raml-definition-system");
import path = require("path")

//target paths

var artifactsFolderPath = "../../src/parser/artifacts";
var parserInterfaceTargetPath10=path.join(__dirname, artifactsFolderPath + "/raml10parserapi.ts").toString();
var parserImplementationTargetPath10=path.join(__dirname, artifactsFolderPath + "/raml10parser.ts").toString();

var parserInterfaceTargetPath08=path.join(__dirname, artifactsFolderPath + "/raml08parserapi.ts").toString();
var parserImplementationTargetPath08=path.join(__dirname, artifactsFolderPath + "/raml08parser.ts").toString();

var factoryTargetPath10=path.join(__dirname, artifactsFolderPath + "/raml10factory.ts").toString();
var factoryTargetPath08=path.join(__dirname, artifactsFolderPath + "/raml08factory.ts").toString();

//generation

var universe10 = def.getUniverse("RAML10");
var apiType10=universe10.type("Api");
var parserGenerator10 = wrapped.def2Parser(apiType10);
var parserInterfaceContent10 = parserGenerator10.serializeInterfaceToString();
var parserImplementationContent10 = parserGenerator10.serializeImplementationToString();
var factoryContent10 = parserGenerator10.nodeFactory("../../parser/highLevelAST","./raml10parser");
if (!fs.existsSync(path.dirname(parserInterfaceTargetPath10))) {
    fs.mkdirSync(path.dirname(parserInterfaceTargetPath10));
}
fs.writeFileSync(parserInterfaceTargetPath10, parserInterfaceContent10);
fs.writeFileSync(parserImplementationTargetPath10, parserImplementationContent10);
fs.writeFileSync(factoryTargetPath10, factoryContent10);


var universe08 = def.getUniverse("RAML08");
var apiType08=universe08.type("Api");
var parserGenerator08 = wrapped.def2Parser(apiType08);
var parserInterfaceContent08 = parserGenerator08.serializeInterfaceToString();
var parserImplementationContent08 = parserGenerator08.serializeImplementationToString();
var factoryContent08 = parserGenerator08.nodeFactory("../../parser/highLevelAST","./raml08parser");
if (!fs.existsSync(path.dirname(parserInterfaceTargetPath08))) {
    fs.mkdirSync(path.dirname(parserInterfaceTargetPath08));
}
fs.writeFileSync(parserInterfaceTargetPath08, parserInterfaceContent08);
fs.writeFileSync(parserImplementationTargetPath08, parserImplementationContent08);
fs.writeFileSync(factoryTargetPath08, factoryContent08);

// fs.writeFileSync(docmodel,docGen.def2Doc(<defs.NodeClass>apiType10))


// var universe08 = universeProvider("RAML08");
// var apiType08=universe08.type("Api");
// var parserGenerator08 = wrapped.def2Parser(apiType08);
// var parserContent08 = parserGenerator08.serializeToString();
// var factoryContent08 = parserGenerator08.nodeFactory("../highLevelAST","./raml08parser");
// fs.writeFileSync(parserTargetPath08, parserContent08);
// fs.writeFileSync(factoryTargetPath08, factoryContent08);

//var rmodel=path.resolve(__dirname,"./artifacts/runtimeModel.ts").toString();

// var atomGrammarmodel=path.resolve(__dirname,"../grammargen/raml.cson").toString();
// var aceGrammarmodel=path.resolve(__dirname,"../grammargen/raml.js").toString();

//fs.writeFileSync(atomGrammarmodel,atomGrammarGen.composeGrammar(universe10))
//fs.writeFileSync(aceGrammarmodel,aceGrammarGen.composeGrammar(universe10))
// import t3=require("./artifacts/raml10parser")
//fs.writeFileSync(rmodel,runtimeModelGen.def2Model(apiType10))