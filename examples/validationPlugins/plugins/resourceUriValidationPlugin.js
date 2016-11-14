
var PLUGIN_ID = "RESOURCE_URI_VALIDATOR";

function validateUri(node){

    if(!node || !node.isElement()){
        return null;
    }
    var defName = node.definition().nameId();
    if(defName != "Resource"){
        return null;
    }
    var uriAttr = node.attr("relativeUri");
    if(uriAttr) {
        var uri = uriAttr.value();
        try {
            var invalidCharacters = uri.match(/[^/a-zA-Z0-9\{\}]+/g);
            if (invalidCharacters) {
                return [ {
                    node: uriAttr,
                    message: "Uri contains invalid characters: " +
                        invalidCharacters.map(function(ch){return "'"+ch+"'"}).join(", ")
                } ];
            }
        }
        catch(e){
            console.log(e);
        }
    }
    return null;
}

var plugin = {

    process: function(x){
        return validateUri(x);
    },

    id: function(){ return PLUGIN_ID; }
    
};

var rv = global.ramlValidation;
if(!rv){
    rv = {};
    global.ramlValidation = rv;
}
var nodeValidators = rv.nodeValidators;
if(!nodeValidators){
    nodeValidators = [];
    rv.nodeValidators = nodeValidators;
}

if(nodeValidators.filter(function(x){
        return x.id() == PLUGIN_ID;
    }).length==0) {
    nodeValidators.push(plugin);
}