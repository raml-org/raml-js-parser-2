/// <reference path="../../typings/main.d.ts" />
import _ = require("underscore")
import path = require('path');
import URL = require('url');
import fs = require('fs');
import lowLevel = require("../raml1/lowLevelAST");
import util = require("./index");

import resourceRegistry = require("../raml1/jsyaml/resourceRegistry");

export class ContentProvider {
    constructor(private unit: lowLevel.ICompilationUnit) {
        
    }
    
    contextPath() {
        if(!this.unit) {
            return "";
        }

        var rootPath = this.unit.absolutePath();

        return rootPath || "";
    }

    normalizePath(url) {
        if (!url) {
            return url;
        }

        var result;

        if (!isWebPath(url)) {
            result = path.normalize(url);
        } else {
            var prefix = url.toLowerCase().indexOf('https') === 0 ? 'https://' : 'http://';

            result = prefix + path.normalize(url.substring(prefix.length));
        }

        return result;
    }
    
    content(reference) {
        var normalized = this.normalizePath(reference);
        if(path.isAbsolute(normalized)&&!isWebPath(normalized)){
            normalized = path.relative(path.dirname(this.unit.absolutePath()),normalized);
        }
        var unit = this.unit.resolve(normalized);
        
        if(!unit) {
            return "";
        }
        
        return unit.contents() || "";
    }

    contentAsync(reference): Promise<string> {
        var absolutePath = this.normalizePath(reference);

        var unitPromise = this.unit.resolveAsync(absolutePath);

        if (!unitPromise) {
            return Promise.resolve("");
        }

        var result = unitPromise.then(unit => {
            return (unit && unit.contents()) || "";
        });

        return result;
    }

    hasAsyncRequests() {
        return resourceRegistry.hasAsyncRequests();
    }

    resolvePath(context, relativePath) {
        if(!relativePath || !context) {
            return relativePath;
        }

        var result;

        if(!isWebPath(context)) {
            result =  path.resolve(path.dirname(context), relativePath);
        } else {
            result = URL.resolve(context,relativePath);
        }

        return result;
    }

    isAbsolutePath(uri) {
        if(!uri) {
            return false;
        }

        if(isWebPath(uri)) {
            return true;
        }

        return path.isAbsolute(uri);
    }
    
    promiseResolve(arg: any): Promise<any> {
        return Promise.resolve(arg);
    }
}

function isWebPath(str):boolean {
    if (str == null) return false;

    return util.stringStartsWith(str, "http://") || util.stringStartsWith(str, "https://");
}