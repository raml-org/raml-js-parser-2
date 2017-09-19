import utils = require("./test-utils");
import assert = require("assert")

import fs = require("fs");

export var found08 = {};
export var found10 = {};

var loaded = false;

function getFound(highLevel) {
    var found = highLevel.definition().universe().version() === "RAML10" ? found10 : found08;

    return found;
}

var wrapperMethods = ['kind', 'RAMLVersion', 'wrapperClassName', 'annotations', 'scalarsAnnotations', 'value'];

export function loadWrappersData() {
    if(!loaded) {
        var dataDir = utils.data("./functions/data");

        var dataPath08 = dataDir + '/RAML08data.json';
        var dataPath10 = dataDir + '/RAML10data.json';
        
        found08 = JSON.parse(fs.readFileSync(dataPath08).toString());
        found10 = JSON.parse(fs.readFileSync(dataPath10).toString());
    }
}

export function callMethods(wrapper, holder, name) {
    if(holder.called) {
        Object.keys(holder.called).forEach(method => {
            var ret = toData(wrapper[method]());

            assert.equal(ret, holder.called[method], "wrong result of calling " + name + "." + method + "().");
        });

        return;
    }

    holder.called = {};

    wrapperMethods.forEach(method => {
        try {
            var ret = toData(wrapper[method]());

            holder.called[method] = ret;
        } catch (exception) {
            
        }
    });
}

function toData(obj): any {
    if(typeof obj === 'string') {
        return obj;
    }

    if(obj.length) {
        return obj.length;
    }

    if(typeof obj === 'object') {
        return (obj.name && obj.name()) || (obj.nameId && obj.nameId()) || (obj.key && obj.key());
    }

    return obj;
}

export function storeIfNeededFor(highLevel) {
    var dataDir = utils.data("./functions/data");

    var dataPath = dataDir + '/' + highLevel.definition().universe().version() + 'data.json';

    if(fs.exists(dataPath)) {
        return;
    }

    var founds = getFound(highLevel);

    var data = {};

    Object.keys(founds).forEach(key => {
        var found = founds[key];
        var record: any = {};

        data[key] = record;

        record.id = found.highLevel.id();
        record.super = found.super.nameId();
        record.called = found.called;
    });

    var text = JSON.stringify(data, null, '\t');

    fs.writeFileSync(dataPath, text);
}

export function find(highLevel, name, generate = false) {
    if(!generate) {
        return findAs(highLevel, name, 'record');
    }

    var res= findAs(highLevel, name, 'supertype');

    if(!res) {
        res = findAs(highLevel, name, 'subtype');
    }

    if(!res) {
        res = findAs(highLevel, name, 'oneparent');
    }

    if(res) {
        var found = getFound(highLevel);

        found[name] = res;
    }

    return res;
}

export function findAs(highLevel, name, kind) {
    if(!highLevel) {
        return;
    }

    var type = highLevel.definition && highLevel.definition();

    if(type && kind === 'record') {
        var founds = getFound(highLevel);

        var record = founds[name];

        if(record && highLevel.id() === record.id) {
            return {highLevel: highLevel, super: type.universe().type(record.super), called: record.called};
        }
    } else if(type) {
        var type = highLevel.definition();

        if(kind === 'supertype') {
            var superType = findSupers(type, name);

            if(superType) {
                return {highLevel: highLevel, super: superType};
            }
        }

        if(kind === 'subtype') {
            var subType = findSubs(type, name);

            if(subType) {
                return {highLevel: highLevel, super: subType};
            }
        }
        if(kind === 'oneparent') {
            var actual = type.universe().type(name);

            if(actual && firstType(actual) === firstType(type)) {
                return {highLevel: highLevel, super: actual};
            }
        }
    }

    var children1 = (highLevel.children && highLevel.children()) || [];
    var children2 = (highLevel.directChildren && highLevel.directChildren()) || [];

    var children = children1.concat(children2);
    
    for(var i = 0; i < children.length; i++) {
        var res = findAs(children[i], name, kind);
        
        if(res) {
            return res;
        }
    }
    
    return null;
}

function findSupers(type, name) {
    if(type.nameId() === name) {
        return type;
    }
    var supers = type.allSuperTypes();

    for(var i = 0; i < supers.length; i++) {
        var res = findSupers(supers[i], name);

        if(res) {
            return res;
        }
    }

    return null;
}

function findSubs(type, name) {
    if(type.nameId() === name) {
        return type;
    }
    var subs = type.allSubTypes();

    for(var i = 0; i < subs.length; i++) {
        var res = findSubs(subs[i], name);

        if(res) {
            return res;
        }
    }

    return null;
}

function firstType(type, previous = null) {
    var supers = type.allSuperTypes();
    
    if(!supers || supers.length === 0) {
        return previous || type;
    }
    
    for(var i = 0; i < supers.length; i++) {
        var res = firstType(supers[i], type);
        
        if(res) {
            return res;
        }
    }
    
    return null;
}

