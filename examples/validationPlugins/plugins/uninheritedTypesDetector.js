
var PLUGIN_ID = "UNUSED_TYPES_DETECTOR";

function validateType(t,reg){

    if(!t){
        return null;
    }
    if(!t.getExtra("GLOBAL")){
        return null;
    }
    var subTypes = t.allSubTypes();
    if(!subTypes || subTypes.length == 0){
        return [{
            "isWarning": true,
            "message": "Type '" + t.name() + "' is not inherited"
        }];
    }
    return null;
}

var plugin = {

    process: function(x,reg){
        return validateType(x,reg);
    },

    id: function(){ return PLUGIN_ID; }

};

var rv = global.ramlValidation;
if(!rv){
    rv = {};
    global.ramlValidation = rv;
}
var typeValidators = rv.typeValidators;
if(!typeValidators){
    typeValidators = [];
    rv.typeValidators = typeValidators;
}
if(typeValidators.filter(function(x){
        return x.id() == PLUGIN_ID;
    }).length==0) {
    typeValidators.push(plugin);
}
