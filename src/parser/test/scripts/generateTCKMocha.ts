import path = require("path")
import tckUtil = require("./tckUtil")

var args = process.argv;
var tckDir = null;
var libExpandDir = null;
var mochaFile = null;
var mochaFileLibExpand = null;
var dataRoot = null;

for(var i = 0 ; i < args.length ; i++){
    if(i < args.length-1) {
        if (args[i] == "-tckDir") {
            tckDir = args[++i];
        }
        else if (args[i] == "-mochaFile") {
            mochaFile = args[++i];
        }
        else if (args[i] == "-dataRoot") {
            dataRoot = args[++i];
        }
        else if (args[i] == "-libExpandDir") {
            libExpandDir = args[++i];
        }
        else if (args[i] == "-mochaFileLibExpand") {
            mochaFileLibExpand = args[++i];
        }
    }
}
if(tckDir==null){
    tckDir = path.resolve(tckUtil.projectFolder(),"src/parser/test/data/TCK");
}
if(libExpandDir==null){
    libExpandDir = path.resolve(tckUtil.projectFolder(),"src/parser/test/data/LibraryExpansion");
}
if(mochaFile==null){
    mochaFile = path.resolve(tckUtil.projectFolder(),"src/parser/test/TCK2.ts");
}
if(mochaFileLibExpand==null){
    mochaFileLibExpand = path.resolve(tckUtil.projectFolder(),"src/parser/test/libraryExpansion.ts");
}
if(dataRoot==null){
    dataRoot = path.resolve(tckUtil.projectFolder(),"src/parser/test/data")
}
tckUtil.generateMochaSuite(
    tckDir,
    mochaFile,
    dataRoot,
    'Complete TCK Test Set'
);

tckUtil.generateMochaSuite(
    libExpandDir,
    mochaFileLibExpand,
    dataRoot,
    'Library Expansion Tests',
    { expandLib: true, serializeMetadata:true }
);

tckUtil.generateMochaSuite(
    path.resolve(tckUtil.projectFolder(),"src/parser/test/data/TCK-newFormat"),
    path.resolve(tckUtil.projectFolder(),"src/parser/test/TCK2-newFormat.ts"),
    dataRoot,
    'Complete TCK Test Set For New JSON Format',
    { newFormat: true, serializeMetadata:true }
);

tckUtil.generateMochaSuite(
    path.resolve(tckUtil.projectFolder(),"src/parser/test/data/LibraryExpansion-newFormat"),
    path.resolve(tckUtil.projectFolder(),"src/parser/test/libraryExpansion-newFormat.ts"),
    dataRoot,
    'Library Expansion Tests For NEW JSON Format',
    { newFormat: true, expandLib: true, serializeMetadata:true }
);

tckUtil.generateMochaSuite(
    path.resolve(tckUtil.projectFolder(),"src/parser/test/data/parser/UnfoldTypes/Default"),
    path.resolve(tckUtil.projectFolder(),"src/parser/test/unfoldTypes.ts"),
    dataRoot,
    'Types Unfolding Tests',
    { newFormat: true, unfoldTypes: true, typeReferences: true, serializeMetadata:true }
);

tckUtil.generateMochaSuite(
    path.resolve(tckUtil.projectFolder(),"src/parser/test/data/parser/UnfoldTypes/LibraryExpansion"),
    path.resolve(tckUtil.projectFolder(),"src/parser/test/unfoldTypesLibExpand.ts"),
    dataRoot,
    'Types Unfolding Tests (LibExpand)',
    { newFormat: true, unfoldTypes: true, typeReferences: true, expandLib: true, serializeMetadata:true }
);