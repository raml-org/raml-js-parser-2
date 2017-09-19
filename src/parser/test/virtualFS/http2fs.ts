import resolverApi = require("../../jsyaml/resolversApi");
import fs = require("fs");
import path = require("path");
import Q = require("q");
import querystring = require("querystring");

export var DOMAIN = "WWW.__TESTDATA__.com";

export function getHttpResolver():resolverApi.HTTPResolver{
    return new Http2FSResolverAsync();
}

export class Http2FSResolverAsync implements resolverApi.HTTPResolver{

    private rootDataDir:string;

    getResource(url:string):resolverApi.Response{
        throw new Error("Sync resolver method not allowed.");
    }

    getResourceAsync(url:string):Promise<resolverApi.Response>{

        var ind = url.toLocaleLowerCase().indexOf(DOMAIN.toLocaleLowerCase());
        if(ind<0){
            return Promise.reject(new Error("Url supposed to belong to the \""+DOMAIN+"\" domain."));
        }
        var subPath = global.escape(url.substring(ind+DOMAIN.length+1));
        return this.getRootDir().then(dataDir=>{
            
            var absPath = path.resolve(dataDir,subPath);
            return new Promise(function(resolve, reject) {

                if(!fs.existsSync(absPath)){
                    resolve({
                        content: null,
                        errorMessage: "File does not exist: " + absPath
                    });
                }
                var content;
                try{
                    content = fs.readFileSync(absPath).toString();
                    resolve({
                        content: content,
                        errorMessage: null
                    });
                    
                }
                catch(e){
                    resolve({
                        content: null,
                        errorMessage: typeof e == "string" ? e : e.toString()
                    });
                }
            });
        },err=>{
            console.log("HUI3");
            var errMessage = null;
            if(err!=null){
                errMessage = (typeof err == "string") ? err : err.toString();
            }
            return Promise.resolve({
                content: null,
                errorMessage: errMessage
            });
        });
    }

    getRootDir():Promise<string>{

        if(this.rootDataDir!=null){
            return Promise.resolve(this.rootDataDir);
        }
        var dir = __dirname;
        while(!fs.existsSync(path.resolve(dir,"package.json"))){
            var parent = path.resolve(dir,"../");
            if(parent==dir){
                return Promise.reject(new Error("Unable to detect project root"));
            }
            dir = parent;
        }
        this.rootDataDir = path.resolve(dir,"./src/parser/test/data");
        return Promise.resolve(this.rootDataDir);
    }

}

