/// <reference path="../../typings/main.d.ts" />
import _ = require("underscore");
import xmlutil = require('./xmlutil');
import contentprovider = require('./contentprovider');
import lowLevel = require("../raml1/lowLevelAST");
import util = require("./index");

import resourceRegistry = require("../raml1/jsyaml/resourceRegistry");

var ZSchema=require("z-schema");

export class ValidationResult{
    result:any;
    num:number;
}

var useLint=true;

class ErrorsCache {
    errors = {};

    get(key) {
        return this.errors[key];
    }

    set(key, value) {
        this.errors[key] = value;
    }
}

var globalCache = new ErrorsCache();

export class JSONSchemaObject {
    jsonSchema: any;

    constructor(private schema:string, private provider: contentprovider.ContentProvider){
        if(!schema||schema.trim().length==0||schema.trim().charAt(0)!='{'){
            throw new Error("Invalid JSON schema content");
        }

        var jsonSchemaObject;

        try {
            var jsonSchemaObject = JSON.parse(schema);
        } catch(err){
            throw new Error("It is not JSON schema");
        }

        if(!jsonSchemaObject){
            return
        }

        try{
            var api = require('json-schema-compatibility');

            this.setupId(jsonSchemaObject, this.provider.contextPath());

            jsonSchemaObject =api.v4(jsonSchemaObject);
        } catch (e){
            throw new Error('Can not parse schema'+schema)
        }

        delete jsonSchemaObject['$schema']

        this.jsonSchema=jsonSchemaObject;
    }

    getType() : string {
        return "source.json";
    }

    validateObject (object:any){
        //TODO Validation of objects
        //xmlutil(content);
        this.validate(JSON.stringify(object));
    }

    getMissingReferences(references: any[], normalize: boolean = false): any[] {
        var result = [];

        var validator = new ZSchema();


        references.forEach(references => validator.setRemoteReference(references.reference, references.content || {}));

        try {
            validator.validateSchema(this.jsonSchema);
        } catch (Error) {
            //we should never be exploding here, instead we'll report this error later
            return []
        }

        var result = <any[]>validator.getMissingRemoteReferences();

        return normalize ? result.map(reference => this.provider.normalizePath(reference)) : result;
    }

    contentAsync(reference): Promise<any> {
        var remoteSchemeContent;

        var api = require('json-schema-compatibility');

        var contentPromise = this.provider.contentAsync(reference);

        if(!contentPromise) {
            return Promise.resolve({
                reference: reference,
                content: null,
                error: new Error('Reference not found: ' + reference)
            });
        }

        var result = contentPromise.then(cnt => {
            var content: any = {reference: reference};

            try {
                var jsonObject = JSON.parse(cnt);

                this.setupId(jsonObject, this.provider.normalizePath(reference));

                remoteSchemeContent = api.v4(jsonObject);

                delete remoteSchemeContent['$schema'];

                content.content = remoteSchemeContent;
            } catch(exception) {
                content.error = exception;
            }

            return content;
        });

        return result;
    }

    private getSchemaPath(schema, normalize: boolean = false) {
        if(!schema) {
            return "";
        }

        if(!schema.id) {
            return "";
        }

        var id = schema.id.trim();

        if(!(id.lastIndexOf('#') === id.length - 1)) {
            return id;
        }

        var result =  id.substr(0, id.length -1);

        if(!normalize) {
            return result;
        }

        return this.provider.normalizePath(result);
    }

    private patchSchema(schema) {
        if(!schema) {
            return schema;
        }

        if(!schema.id) {
            return schema;
        }

        var id = schema.id.trim();

        if(!(id.lastIndexOf('#') === id.length - 1)) {
            return schema;
        };

        var currentPath = id.substr(0, id.length -1);

        if(!this.provider.isAbsolutePath(currentPath)) {
            return schema;
        }

        currentPath = this.provider.normalizePath(currentPath);

        var refContainers = [];

        this.collectRefContainers(schema, refContainers);

        refContainers.forEach(refConatiner => {
            var reference = refConatiner['$ref'];

            if(typeof reference !== 'string') {
                return;
            }

            if(reference.indexOf('#') === 0) {
                return;
            }

            if(!this.provider.isAbsolutePath(reference)) {
                refConatiner['$ref'] = this.provider.resolvePath(currentPath, reference).replace(/\\/g,'/');
            }
        });
    }

    private collectRefContainers(rootObject, refContainers) {
        Object.keys(rootObject).forEach(key => {
            if(key === '$ref') {
                refContainers.push(rootObject);

                return;
            }

            if(!rootObject[key]) {
                return;
            }

            if(typeof rootObject[key] === 'object') {
                this.collectRefContainers(rootObject[key], refContainers);
            }
        });
    }

    validate(content, alreadyAccepted = []) {
        var key = content + this.schema + this.provider.contextPath();

        var error = globalCache.get(key);

        if(error) {
            if(error instanceof Error) {
                throw error;
            }

            return;
        }

        var validator = new ZSchema();

        alreadyAccepted.forEach(accepted => validator.setRemoteReference(accepted.reference, accepted.content));

        validator.validate(JSON.parse(content), this.jsonSchema);

        var missingReferences = validator.getMissingRemoteReferences().filter(reference => !_.find(alreadyAccepted, acceptedReference => reference === acceptedReference.reference));

        if(!missingReferences || missingReferences.length === 0) {
            this.acceptErrors(key, validator.getLastErrors(), true);

            return;
        }

        var acceptedReferences = [];

        missingReferences.forEach(reference => {
            var remoteSchemeContent;

            var result: any = {reference: reference};

            try {
                var api = require('json-schema-compatibility');

                var jsonObject = JSON.parse(this.provider.content(reference));

                this.setupId(jsonObject, this.provider.normalizePath(reference));

                remoteSchemeContent = api.v4(jsonObject);

                delete remoteSchemeContent['$schema'];

                result.content = remoteSchemeContent;
            } catch(exception){
                result.error = exception;
            } finally {
                acceptedReferences.push(result);
            }
        });

        if(this.provider.hasAsyncRequests()) {
            return;
        }

        acceptedReferences.forEach(accepted => {
            alreadyAccepted.push(accepted);
        });

        this.validate(content, alreadyAccepted);
    }

    private setupId(json, path) {
        if(!path) {
            return;
        }

        if(!json) {
            return;
        }

        if(!json.id) {
            json.id = path.replace(/\\/g,'/') + '#';
        }

        this.patchSchema(json);
    }

    private acceptErrors(key, errors, throwImmediately = false) {
        if(errors && errors.length>0){
            var res= new Error("Content is not valid according to schema:"+errors.map(x=>x.message+" "+x.params).join(", "));

            (<any>res).errors=errors;

            globalCache.set(key, res);

            if(throwImmediately) {
                throw res;
            }

            return;
        }

        globalCache.set(key, 1);
    }
}
export interface ValidationError{
    code:string
    params:string[]
    message:string
    path:string
}

export class XMLSchemaObject{
    constructor(private schema:string){
        if (schema.charAt(0)!='<'){
            throw new Error("Invalid JSON schema")
        }
        xmlutil(schema);
    }

    getType() : string {
        return "text.xml";
    }

    validate (content:string){

        xmlutil(content);
    }

    validateObject (object:any){
        //TODO Validation of objects
        //xmlutil(content);
    }
}
export interface Schema {
    getType(): string;
    validate(content: string): void;
    validateObject(object:any):void;
}
export function getJSONSchema(content: string, provider: contentprovider.ContentProvider) {
    var rs = useLint ? globalCache.get(content) : false;
    if (rs && rs.provider) {
        return rs;
    }
    var res = new JSONSchemaObject(content, provider);
    globalCache.set(content, res);
    return res;
}

export function getXMLSchema(content: string) {
    var rs = useLint ? globalCache.get(content) : false;
    if (rs) {
        return rs;
    }
    var res = new XMLSchemaObject(content);
    if (useLint) {
        globalCache.set(content, res);
    }
}

export function createSchema(content: string, provider: contentprovider.ContentProvider): Schema {

    var rs = useLint ? globalCache.get(content) : false;
    if (rs) {
        return rs;
    }
    try {
        var res: Schema = new JSONSchemaObject(content, provider);
        if (useLint) {
            globalCache.set(content, res);
        }
        return res;
    }
    catch (e) {
        try {
            var res: Schema = new XMLSchemaObject(content);
            if (useLint) {
                globalCache.set(content, res);
            }
            return res;
        }
        catch (e) {
            if (useLint) {
                globalCache.set(content, new Error("Can not parse schema"))
            }
            return null;
        }
    }
}

export function isScheme(content) {
    try {
        var schemeObject = JSON.parse(content);

        return schemeObject['$schema'];
    } catch(exception) {
        return false;
    }
}

export function startDownloadingReferencesAsync(schemaContent: string, unit: lowLevel.ICompilationUnit): Promise<lowLevel.ICompilationUnit>{
    var schemaObject = getJSONSchema(schemaContent, new contentprovider.ContentProvider(unit));

    var missedReferences = schemaObject.getMissingReferences([]).map(reference => schemaObject.contentAsync(reference));

    if(missedReferences.length === 0) {
        return Promise.resolve(unit);
    }

    var allReferences = Promise.all(missedReferences);

    var result = getRefs(allReferences, schemaObject);

    return result.then(() => unit);
}

export function getReferences(schemaContent, unit) {
    var schemaObject = getJSONSchema(schemaContent, new contentprovider.ContentProvider(unit));

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
