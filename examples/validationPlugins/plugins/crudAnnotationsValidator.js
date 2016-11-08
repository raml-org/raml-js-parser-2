
var PLUGIN_ID = "CRUD_MARKER_ANNOTATION_VALIDATOR";

var annotationName = "CRUDMarker";

var operationToMethod = {
    "createElement" : "post",
    "retrieveElement" : "get",
    "retrieveCollection" : "get",
    "updateElement" : "put",
    "deleteElement" : "delete"
};

var focusedAnnotations = {

    retrieveCollection: true,

    retrieveCollectionElement: true,

    updateCollectionElement: true

};

function validateEntry(node){

    if(!node){
        return null;
    }
    var astNode = node.entry();
    if(!astNode.isElement()){
        return null;
    }
    var def = astNode.definition();
    if(def.nameId()!="Method"){
        return null;
    }
    var aMap = node.annotationsMap();
    var a = aMap[annotationName];
    if(!a){
        return null;
    }
    var val = a.value();
    if(!val){
        return null;
    }
    var operation = val['operation'];
    if(!operation){
        return;
    }
    var methodName = astNode.name().toLowerCase();
    var expectedMethod = operationToMethod[operation];
    if(expectedMethod != methodName){
        return [{
            node:astNode,
            message: "The '" + operation + "' operation is expected to be implemented by a '" + expectedMethod + "' method",
            isWarning: true
        }];
    }
    return null;
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
var astAnnotationValidators = rv.astAnnotationValidators;
if(!astAnnotationValidators){
    astAnnotationValidators = [];
    rv.astAnnotationValidators = astAnnotationValidators;
}

if(astAnnotationValidators.filter(function(x){
        return x.id() == PLUGIN_ID;
    }).length==0) {
    astAnnotationValidators.push(plugin);
}