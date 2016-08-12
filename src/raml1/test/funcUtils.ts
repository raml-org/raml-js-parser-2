/// <reference path="../../../typings/main.d.ts" />

export function find(highLevel, name) {
    if(!highLevel) {
        return;
    }
    
    if(highLevel.definition && highLevel.definition()) {
        var type = highLevel.definition();

        var superType = findSupers(type, name);

        if(superType) {
            return {highLevel: highLevel, super: superType};
        }

        var subType = findSubs(type, name);

        if(subType) {
            return {highLevel: highLevel, super: subType};
        }

        var actual = type.universe().type(name);

        if(actual && firstType(actual) === firstType(type)) {
            return {highLevel: highLevel, super: actual};
        } 
    }

    var children1 = (highLevel.children && highLevel.children()) || [];
    var children2 = (highLevel.directChildren && highLevel.directChildren()) || [];

    var children = children1.concat(children2);
    
    for(var i = 0; i < children.length; i++) {
        var res = find(children[i], name);
        
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