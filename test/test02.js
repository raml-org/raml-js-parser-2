console.log('RAML 1.0 JS Parser Test');

var path = require("path");
var raml1Parser = require('../src/raml1Parser');
var fs = require("fs")

var api = raml1Parser.loadApi(path.resolve(__dirname, "../raml-specs/XKCD/api.raml"),{
	
	expandTraitsAndResourceTypes: false,
	fsResolver: {
		content: function(path){ return fs.readFileSync(path).toString(); },
		list: function(path){ return fs.readDirSync(path); }
	}
});

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
