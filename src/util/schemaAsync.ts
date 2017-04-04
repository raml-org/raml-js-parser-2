/// <reference path="../../typings/main.d.ts" />
import _ = require("underscore");
import xmlutil = require('./xmlutil');
import contentprovider = require('./contentprovider');
import lowLevel = require("../raml1/lowLevelAST");
import util = require("./index");

import resourceRegistry = require("../raml1/jsyaml/resourceRegistry");
import def = require('@evches/raml-definition-system');

var su = def.getSchemaUtils();

export function isScheme(content) {
    try {
        var schemeObject = JSON.parse(content);

        return schemeObject['$schema'];
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

    return schemaObject.getMissingReferences([], true);
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