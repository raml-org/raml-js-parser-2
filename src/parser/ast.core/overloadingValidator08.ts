import defs=require("raml-definition-system")
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")
import _=require("underscore")
import high=require("../highLevelAST");
import hlimpl=require("../highLevelImpl")
import linter=require("./linter")
import wrapperHelper=require("../wrapped-ast/wrapperHelper08")
import wrapper=require("../artifacts/raml08parserapi")
import wrapperImpl=require("../artifacts/raml08parser")
import path=require("path")
import fs=require("fs");
var messageRegistry = require("../../../resources/errorMessages");

function escapeUri(u:string){
    var ss="";
    var level=0;
    for (var i=0;i<u.length;i++){
        var c=u.charAt(i);
        if (level==0){
            ss=ss+c;
        }
        if (c=='{'){
            level++;
        }
        if (c=='}'){
            level--;
        }
    }
    return ss;
}

class OverloadingValidator{

    protected holder:{[path:string]:wrapper.Resource[]}={}
    protected conflicting:{[path:string]:wrapper.Resource[]}={}

     
    validateApi(q:wrapperImpl.ApiImpl,v:hl.ValidationAcceptor){
        q.resources().forEach(x=>{
            this.acceptResource(x);
            x.resources().forEach(y=>this.acceptResource(y));
        });
        for (var c in this.conflicting){
            var ms=this.conflicting[c];
            var notPushed=ms
            if (notPushed.length>1){
                notPushed.forEach(m=>{
                    v.accept(linter.createIssue1(messageRegistry.RESOURCES_SHARE_SAME_URI, {},m.highLevel(),false))
                })
            }

        }
    }
    acceptResource(x:wrapper.Resource){
        var uri=escapeUri(wrapperHelper.absoluteUri(x));
        var pos=this.holder[uri];
        if (!pos){
            pos=[];
            this.holder[uri]=pos;
        }
        pos.push(x);
        if (pos.length>1){
            this.conflicting[uri]=pos;
        }
    }

}
export = OverloadingValidator