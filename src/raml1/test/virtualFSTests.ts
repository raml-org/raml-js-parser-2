'use strict';
var vfs = require("./virtualFS/vfs");

import resolverAPI = require("../jsyaml/resolversApi");
import index = require("../../index");
import path = require("path");
import fs = require("fs");
import parserCore = require("../wrapped-ast/parserCore");
import testUtils = require("./test-utils");
import Q = require("q");

var isWin = /^win/.test(process.platform);

if (typeof window === 'undefined') {
    var chai           = require('chai');
    var expect         = chai.expect;
    var should         = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
} else {
    chai.should();
}

describe('Parser', function() {
    this.timeout(15000);
    it('Basic test for virtual file system integration', function (done) {
        testAPI("./vfsTests/test001/api.raml").should.be.fulfilled.and.notify(done);
    });

    it('Include path exceeding file system root must cause warning 1', function (done) {

        testAPI("./vfsTests/test002/api.raml").should.be.rejectedWith(
            /Resolved include path exceeds file system root/).and.notify(done);
    });

    it('Basic test for includes in subfolders', function (done) {
        testAPI("./vfsTests/test003/api.raml").should.be.fulfilled.and.notify(done);
    });

    it('Include path exceeding file system root must cause warning 2', function (done) {
        testAPI("./vfsTests/test004/api.raml").should.be.rejectedWith(
            /Resolved include path exceeds file system root/).and.notify(done);
    });
});

function testAPI(_apiPath:string):any{
    
    var apiPath = testUtils.data(_apiPath);
    var apiDir = path.dirname(apiPath);
    var apiRelPath = "/"+path.basename(apiPath);
    var contents = getContent(apiDir,apiDir);
    var paths = Object.keys(contents).sort();
    if(paths[0]=="/"){
        paths = paths.slice(1);
    }
    
    var vfsInstance = vfs.getInstance();

    var fsResolver:resolverAPI.FSResolver = {
        content: (path:string):string => {
            throw new Error("Synchronous loading is prohibited");
        },

        contentAsync: (path:string)=>{
            if(isWin){
                var ind = path.indexOf(":");
                if(ind<0||ind==path.length-1){
                    throw new Error("Invalid Windows path");
                }
                path = path.substring(ind+1).replace(/\\/g,"/");
            }
            return vfsInstance.load(path);
        }
    };
    
    var putEntry = function(ind:number):Promise<void>{
        
        if(ind<paths.length){
            var key = paths[ind];
            var content = contents[key];
            if(content===null){
                return vfsInstance.createFolder(key).then(x=>{
                    return putEntry(ind+1);  
                });
            }
            else{
                return vfsInstance.save(key,content).then(x=>{
                    return putEntry(ind+1);
                });
            }            
        }
    };
    
    return vfsInstance.directory("/").then(x=>{
            return putEntry(0);
        }).then(x=> {
            return index.loadApi(apiRelPath, {
                fsResolver: fsResolver
            });
        }).then(x=>{
            return inspect(x);
        });
    
}

function getContent(p:string, rootDir:string, result:any = {}){
    var keyPath = "/"+path.relative(rootDir,p).replace(/\\/g,"/");
    if(fs.lstatSync(p).isDirectory()){
        result[keyPath] = null;
        for(var ch of fs.readdirSync(p)){
            var resolved = path.resolve(p,ch);
            getContent(resolved,rootDir,result);
        }
    }
    else{
        result[keyPath] = fs.readFileSync(p).toString();
    }
    return result;
}

function inspect(node:parserCore.BasicNode):Promise<void>{
    if(!node){
        return Promise.reject(new Error("Failed to load RAML"));
    }
    var errors = node.errors();
    if(errors && errors.length>0){
        var rejectMessage = errors.map(e=>e.message).join("\n");
        return Promise.reject(new Error(rejectMessage));
    }
}