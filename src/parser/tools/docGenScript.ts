import fs=require("fs")
import def = require("raml-definition-system");
import path = require("path");
import mkdirp = require("mkdirp");
import docGen = require("./docGen");

let universe10 = def.getUniverse("RAML10");
let universe08 = def.getUniverse("RAML08");
let apiType10=universe10.type("Api");
let apiType08=universe08.type("Api");

let documentationFolder = "../../../documentation";
let docTablesFile10=path.join(__dirname, documentationFolder + "/RAML10Classes.html").toString();
let docTablesFile08=path.join(__dirname, documentationFolder + "/RAML08Classes.html").toString();
mkdirp.sync(path.dirname(docTablesFile10));
fs.writeFileSync(docTablesFile10,docGen.def2Doc(<def.NodeClass>apiType10));
fs.writeFileSync(docTablesFile08,docGen.def2Doc(<def.NodeClass>apiType08));