var parser = require("../../dist/index");
var path = require("path");
require("./plugins/resourceUriValidationPlugin");
require("./plugins/crudAnnotationsValidator");
require("./plugins/uninheritedTypesDetector");
require("./plugins/xmlAnnotationsValidator");

var node = parser.loadApiSync(path.resolve(__dirname,"./raml/api.raml"));
console.log(JSON.stringify(node.toJSON({"rootNodeDetails":true}),null,2));