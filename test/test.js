console.log('RAML 1.0 JS Parser Test');

require('../src/bundle');

var RAML = global.RAML;

var path = require("path");

var api = RAML.loadApi(path.resolve(__dirname, "../raml-specs/XKCD/api.raml")).getOrElse(null);

console.log( "Some method name: " + api.resources()[0].methods()[0].method() );

console.log(console.log(JSON.stringify(RAML.toJSON(api), null, 2)));
