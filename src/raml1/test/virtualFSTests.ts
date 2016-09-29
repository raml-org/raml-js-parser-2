/// <reference path="../../../typings/main.d.ts" />
'use strict';
var vfs = require("./virtualFS/vfs");

import resolverAPI = require("../jsyaml/resolversApi");
import index = require("../../index");
import path = require("path");
import url = require("url");
import fs = require("fs");
import parserCore = require("../wrapped-ast/parserCore");
import testUtils = require("./test-utils");
import Q = require("q");
import http2fs = require("./virtualFS/http2fs");
import testUtil = require("./test-utils");

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

describe('Virtual File System Tests', function() {
    this.timeout(30000);
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
        // process.once("uncaughtException", function (error) {
        //     console.log("HEREHERE: " + error)
        // })
        testAPI("./vfsTests/test004/api.raml").should.be.rejectedWith(
            /Resolved include path exceeds file system root/).and.notify(done);

    });

    it("RAML references test", function (done) {
        testAPI("./vfsTests/ramlRefsTest001/api.raml").should.be.fulfilled.and.notify(done);
    });

    it("JSON references test", function (done) {
        testAPI("./vfsTests/jsonRefsTest001/api.raml").should.be.fulfilled.and.notify(done);
    });

    it("Uses test for extensions", function (done) {
        testAPI("./vfsTests/remoteExtend/local/extension.raml").should.be.fulfilled.and.notify(done);
    });

    it("Invalid includes 1", function (done) {
        testAPI("./vfsTests/invalidIncludeTest001/api.raml").should.be.rejectedWith(
            /Can not resolve library from path: 'lib.raml'/).and.notify(done);
    });

    it("Invalid includes 2", function (done) {
        testAPI("./vfsTests/invalidIncludeTest002/api.raml").should.be.rejectedWith(
            /Can not resolve example.json/).and.notify(done);
    });
});


describe('HTTP Asynchronous tests',function() {

    it("RAML references test", function (done) {
        testAPIHttpAsync(`./vfsTests/ramlRefsTest001/api.raml`).should.be.fulfilled.and.notify(done);
    });

    it("JSON references test", function (done) {
        testAPIHttpAsync(`./vfsTests/jsonRefsTest001/api.raml`).should.be.fulfilled.and.notify(done);
    });
});

export function testAPIHttpAsync(apiRelPath:string):any{

    var apiWebPath = url.resolve(`https://${http2fs.DOMAIN}`,apiRelPath);
    var apiLocalPath = testUtil.data(apiRelPath);
    var apiDir = path.dirname(apiLocalPath);

    var httpResolver = http2fs.getHttpResolver();
    return index.loadApi(apiWebPath, {
        fsResolver: null,
        httpResolver: httpResolver
    }).then(x=>{
        return inspect(x,apiDir);
    },y=>{
        console.warn(y);
        return Promise.reject(y);
    });

}


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

    var httpResolver = http2fs.getHttpResolver();
    return vfsInstance.directory("/").then(x=>{
            return putEntry(0);
        }).then(x=> {
            // index.loadApi(apiRelPath, {
            //     fsResolver: fsResolver,
            //     httpResolver: httpResolver
            // }).catch(function (theError) {
            //     console.log("Achtung!!!!!")
            //     console.log(theError)
            // })
            return index.loadApi(apiRelPath, {
                fsResolver: fsResolver,
                httpResolver: httpResolver
            });
        }).then(x=>{
            return inspect(x,apiDir);
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

function inspect(node:parserCore.BasicNode,apiDir:string):Promise<void>{
    // console.log("INSPECTING:" + apiDir)
    // try {


    if(!node){
        return Promise.reject(new Error("Failed to load RAML"));
    }
    if((<any>node).expand){
        node = (<any>node).expand();
    }
    var errors = node.errors();
    if(errors && errors.length>0){
        var rejectMessage = errors.map(e=>e.message).join("\n");
        return Promise.reject(new Error(rejectMessage));
    }
    var apiUnit = node.highLevel().lowLevel().unit();
    var apiFileName = path.basename(apiUnit.absolutePath());
    var tckJsonPath = path.resolve(apiDir,apiFileName).replace(".raml","-tck.json");

    var json = node.toJSON({rootNodeDetails:true});
    var pathRegExp = new RegExp('/errors\\[\\d+\\]/path');

    if(!fs.existsSync(tckJsonPath)){
        fs.writeFileSync(tckJsonPath,JSON.stringify(json,null,2));
    }
    var tckJson:any = JSON.parse(fs.readFileSync(tckJsonPath).toString());
    var diff = testUtil.compare(json,tckJson).filter(x=>{
        if(x.path.match(pathRegExp)){
            return false;
        }
        return true;
    });
    if(diff.length==0){
    }
    else{
        var message = `DIFFERENCE DETECTED FOR " + ${tckJsonPath}
${console.warn(diff.map(x=>x.message("actual","expected")).join("\n\n"))}`
        return Promise.reject(new Error(message));
    }
    // } catch (Error) {
    //     console.log("INSPECTION EXCEPTION!: " + Error)
    // }
}