console.log('RAML 1.0 JS Parser Modularization Test');

var path = require("path");
var raml1Parser = require('../src/raml1Parser');

//unclear what this should look like: should loadApi take an array of paths?
var paths = [
    'librarybooks.raml',
    'monitoringOverlay.raml',
    'administrativeExtension.raml',
    'spanishOverlay.raml',
    'publicInstanceExtension.raml'
];
paths = paths.map(function(ramlPath) {
    return path.resolve(__dirname, path.join("../raml-specs/modularization", ramlPath));
});
var api = raml1Parser.loadApi(paths).getOrElse(null);

api.errors().forEach(function(x){
    console.log(JSON.stringify({
        code: x.code,
        message: x.message,
        path: x.path,
        start: x.start,
        end: x.end,
        isWarning: x.isWarning
    },null,2));
});

console.log( "Some method name: " + api.resources()[0].methods()[0].method() );

console.log(JSON.stringify(raml1Parser.toJSON(api), null, 2));
