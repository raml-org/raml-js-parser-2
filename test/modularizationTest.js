console.log('RAML 1.0 JS Parser Modularization Test');

var path = require("path");
var raml1Parser = require('../src/raml1Parser');

//unclear what this should look like: should loadApi take an array of paths?
var paths = [
    'librarybooks.raml',
    'monitoringOverlay.raml',
    'spanishOverlay.raml',
    'administrativeExtension.raml',
    'spanishAdministrativeOverlay.raml',
    'publicInstanceExtension.raml'
];
paths = paths.map(function(ramlPath) {
    return path.resolve(__dirname, path.join("../raml-specs/modularization", ramlPath));
});
var api = raml1Parser.loadApiSync(paths[0], paths.slice(1));

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

console.log(
    "Content from master librarybooks.raml:",
    api.getChildResource('/books')
        .absoluteUri() // /books
);

console.log(
    "Content from monitoringOverlay.raml:",
    api.getChildResource('/books')
        .getChildMethod('get')[0]
        .annotations()[0]
        .value()
        .children()[1]
        .lowLevel()
        .value() //randomBooksFetch
);

console.log(
    "Content from spanishOverlay.raml:",
    api.getChildResource('/books')
        .description()
        .value() //La colección de libros de la biblioteca
);

console.log(
    "Content from administrativeExtension.raml:",
    api.getChildResource('/books')
        .getChildMethod('post')[0]
        .method() //post
);

console.log(
    "Content from spanishAdministrativeOverlay.raml:",
    api.getChildResource('/books')
        .getChildMethod('post')[0]
        .description()
        .value() //A?adir un nuevo libro para la colecci?n
);

console.log(
    "Content from publicInstanceExtension.raml:",
    api.baseUri().value() //http://api.piedmont-library.com
);