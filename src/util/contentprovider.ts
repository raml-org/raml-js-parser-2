/// <reference path="../../typings/main.d.ts" />
import _ = require("underscore")
import path = require('path');
import URL = require('url');
import fs = require('fs');
import lowLevel = require("../raml1/lowLevelAST");
import util = require("./index");
import ll = require("../raml1/lowLevelAST");

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
            result = path.normalize(url).replace(/\\/g,"/");
        } else {
            var prefix = url.toLowerCase().indexOf('https') === 0 ? 'https://' : 'http://';

            result = prefix + path.normalize(url.substring(prefix.length)).replace(/\\/g,"/");
        }

        return result;
    }
    
    content(reference) {
        var normalized = this.normalizePath(reference);

        //Absolute local paths are understand as relative to rootRAML
        //by 'unit.resolve()'. In order to make it understand the input properly,
        //all absolute local paths must be switched to relative form
        var unitPath = this.toRelativeIfNeeded(normalized);
        var unit = this.unit.resolve(unitPath);
        
        if(!unit) {
            return "";
        }
        
        return unit.contents() || "";
    }

    contentAsync(reference): Promise<string> {
        var normaized = this.normalizePath(reference);
        
        //Absolute local paths are understand as relative to rootRAML
        //by 'unit.resolveAsync()'. In order to make it understand the input properly,
        //all absolute local paths must be switched to relative form
        var unitPath = this.toRelativeIfNeeded(normaized);
        var unitPromise = this.unit.resolveAsync(unitPath);

        if (!unitPromise) {
            return Promise.resolve("");
        }

        var result = unitPromise.then(unit => {
            return (unit && unit.contents()) || "";
        });

        return result;
    }

    private toRelativeIfNeeded(normaized:any|any) {
        var unitPath = normaized;
        if (path.isAbsolute(normaized) && !isWebPath(normaized)) {
            unitPath = path.relative(path.dirname(this.unit.absolutePath()), normaized);
        }
        return unitPath;
    }

    hasAsyncRequests() {
        return resourceRegistry.hasAsyncRequests();
    }

    resolvePath(context, relativePath) {
        //Using standard way of resolving references occured in RAML specs
        return ll.buildPath(relativePath,context,this.unit.project().getRootPath());
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
    return ll.isWebPath(str);
}