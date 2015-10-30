console.log('RAML 1.0 JS Parser Test');

require('../src/bundle');

var path = require("path");

var api = global.RAML.loadApi(path.resolve(__dirname, "../raml-specs/XKCD/api.raml")).getOrElse(null);

console.log( "Some method name: " + api.resources()[0].methods()[0].method() );

console.log(console.log(JSON.stringify(global.RAML.toJSON(api), null, 2)));