
var PLUGIN_ID = "XML_ANNOTATIONS_VALIDATOR";

function validateEntry(node){

    if(!node){
        return null;
    }
    if(node.kind()!="AnnotatedType"){
        return null;
    }

    var issues = [];
    var aMap = node.annotationsMap();
    var xmlName = aMap["XMLName"];
    if(xmlName){
        var value = xmlName.value();
        if(value && typeof(value)=="string") {
            var match = value.match(/[<>]+/g);
            if (match) {
                issues.push({
                    "message": "XML name contains illegal character sequence: "
                    + match.map(function (x) {
                        return "'" + x + "'"
                    }).join(", "),
                    "path": {
                        "name" : "("+xmlName.name()+")"
                    }
                });
            }
        }
    }
    var xmlAttribute = aMap["XMLAttribute"];
    if(xmlAttribute){
        var type = node.entry();
        if(type.isObject() || type.isArray()){
            issues.push({
                "message": "Only primitives can be stored as XML atributes",
                "path":  {
                    "name" : "("+xmlAttribute.name() + ")"
                }
            });
        }
    }
    return issues;
}

var plugin = {

    process: function(x){
        return validateEntry(x);
    },

    id: function(){ return PLUGIN_ID; }

};

var rv = global.ramlValidation;
if(!rv){
    rv = {};
    global.ramlValidation = rv;
}
var typesystemAnnotationValidators = rv.typesystemAnnotationValidators;
if(!typesystemAnnotationValidators){
    typesystemAnnotationValidators = [];
    rv.typesystemAnnotationValidators = typesystemAnnotationValidators;
}

if(typesystemAnnotationValidators.filter(function(x){
        return x.id() == PLUGIN_ID;
    }).length==0) {
    typesystemAnnotationValidators.push(plugin);
}