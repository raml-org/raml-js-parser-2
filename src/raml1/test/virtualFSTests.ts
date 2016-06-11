'use strict';
var vfs = require("./virtualFS/vfs")
import resolverAPI = require("../jsyaml/resolversApi")
import index = require("../../index")
import path = require("path")
import parserCore = require("../wrapped-ast/parserCore")

var isWin = /^win/.test(process.platform);

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
        return vfs.load(path);
    }
}

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

        var apiPath = "/api.raml";

        var content = `#%RAML 1.0
title: Test API`;

        vfs.save(apiPath,content).then(x=>{
            return index.loadApi(apiPath,{
                fsResolver: fsResolver
            });
        }).then(x=>{
            return inspect(x);
        }).should.be.fulfilled.and.notify(done);
    });

    it('Include path exceeding file system root must cause warning', function (done) {

        var apiPath = "/api.raml";
        var resourcePath = "/res/res.raml";
        var resourceFolderPath = "/res";

        var apiContent = `#%RAML 1.0
title: Test API
/resource: !include ../res/res.raml`;

        var resourceContent = `get:
post:
put:
delete:`;

        vfs.save(apiPath, apiContent).then(x=> {
            return vfs.directory("/");
        }).then(x=> {
            return vfs.createFolder(resourceFolderPath);
        }).then(x=> {
            return vfs.save(resourcePath, resourceContent);
        }).then(x=> {
            return index.loadApi(apiPath, {
                fsResolver: fsResolver
            });
        }).then(x=>{
            return inspect(x);
        }).should.be.rejectedWith(/Resolving the include path exceeds file system root/).and.notify(done);
    });
});

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