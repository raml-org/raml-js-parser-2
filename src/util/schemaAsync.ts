
import _ = require("underscore");
import xmlutil = require('./xmlutil');
import contentprovider = require('./contentprovider');
import lowLevel = require("../parser/lowLevelAST");
import util = require("./index");

import resourceRegistry = require("../parser/jsyaml/resourceRegistry");
import def = require('raml-definition-system');

var su = def.getSchemaUtils();

export function isScheme(content) {
    if(!content||!content.trim()||content.trim().charAt(0)!="{"){
        return false;
    }
    try {
        var schemeObject = JSON.parse(content);

        return schemeObject && (typeof schemeObject === "object");
    } catch(exception) {
        return xmlutil.isXmlScheme(content);
    }
}

export function startDownloadingReferencesAsync(schemaContent: string, unit: lowLevel.ICompilationUnit): Promise<lowLevel.ICompilationUnit>{
    if(xmlutil.isXmlScheme(schemaContent)) {
        return su.getXMLSchema(schemaContent, new contentprovider.ContentProvider(unit)).loadSchemaReferencesAsync().then(() => unit);
    }
    
    var schemaObject = su.getJSONSchema(schemaContent, new contentprovider.ContentProvider(unit));

    var missedReferences = schemaObject.getMissingReferences([]).map(reference => schemaObject.contentAsync(reference));

    if(missedReferences.length === 0) {
        return Promise.resolve(unit);
    }

    var allReferences = Promise.all(missedReferences);

    var result = getRefs(allReferences, schemaObject);

    return result.then(() => unit);
}

export function getReferences(schemaContent, unit) {
    var schemaObject = su.createSchema(schemaContent, new contentprovider.ContentProvider(unit));
    if(schemaObject && schemaObject.getMissingReferences) {
        return schemaObject.getMissingReferences([], true);
    }
    return [];
}

function getRefs(promise, schemaObject) {
    return promise.then(references => {
        if(references.length > 0) {
            var missedRefs = schemaObject.getMissingReferences(references);

            if(missedRefs.length === 0) {
                return [];
            }

            var promises = [];

            missedRefs.forEach(ref => {
                promises.push(schemaObject.contentAsync(ref));
            });

            return getRefs(Promise.all(promises.concat(references)), schemaObject);
        }

        return Promise.resolve([]);
    });
}