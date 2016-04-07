/// <reference path="../../typings/main.d.ts" />

import ts=require("typescript")
import tsm=require("./tsASTMatchers")
import path=require("path")
import fs=require("fs")
import tsStructureParser=require("ts-structure-parser")

var ns:{[key:string]:boolean} = {'RamlWrapper':true};

export class HelperMethod{

    constructor(
        public originalName:string,
        public wrapperMethodName:string,
        public returnType:tsStructureParser.TypeModel,
        public args:Arg[],
        public meta:Meta) {

    }
    targetWrappers():string[]{

        var isValid = true;
        var result:string[] = [];
        this.args.forEach(x=>{

            var arr = flatten(x.type,ns);
            if(arr.length==0){
                return;
            }
            if(!isValid || result.length!=0){
                result = [];
                isValid = false;
                return;
            }
            result = result.concat(arr);
        });
        return result;
    }

    callArgs():Arg[]{
        return this.args.map(x=>{
            if(flatten(x.type,ns).length==0){
                return x;
            }
            return {
                name: "this",
                type: null
            }
        });
    }
}

export interface Arg{

    name:string;

    type:tsStructureParser.TypeModel;
}

export interface Meta{

    name?:string

    comment?:string

    override?:boolean

    primary?:boolean

    deprecated?: boolean
}


export function getHelperMethods(srcPath:string):HelperMethod[]{

    var result:HelperMethod[] = [];
    var content = fs.readFileSync(path.resolve(srcPath)).toString();

    var mod = ts.createSourceFile("sample.ts",content,ts.ScriptTarget.ES3,true);

    tsm.Matching.visit(mod,x=>{

        var node = <any>x;
        if(node.kind==ts.SyntaxKind.FunctionDeclaration){

            var meta = getMeta(node,content);
            if(!meta){
                return;
            }
            var originalName = node.name.text;
            var wrapperMethodName = originalName;
            if(meta.name){
                wrapperMethodName = meta.name;
            }
            else{
                meta.name = originalName;
            }
            var wrapperMethodName = meta.name ? meta.name : originalName;
            var args = node.parameters ? node.parameters.map(a=>readArg(a,srcPath)) : [];
            var override = meta.override ? meta.override : false;
            var returnType = tsStructureParser.buildType(node.type, srcPath);
            result.push( new HelperMethod(originalName,wrapperMethodName, returnType,args,meta) );
        }
    });
    return result;
}

var refineComment = function (comment) {
    return comment.replace(/^\s*\/\*+/g,'').replace(/\*+\/\s*$/g,'').split('\n')
        .map(x=>x.replace(/^\s*\/\//g, '').replace(/^\s*\* {0,1}/g,'')).join('\n').trim();
};
function getMeta(node,content:string):Meta{

    var cRange:any = ts.getLeadingCommentRanges(content,node.pos);
    if(!cRange){
        return null;
    }

    var comment = cRange.map(x=>content.substring(x.pos,x.end)).join('\n');

    var ind = comment.indexOf('__$helperMethod__');
    if(ind<0){
        return null;
    }
    ind += '__$helperMethod__'.length;

    var indMeta = comment.indexOf('__$meta__');
    if(indMeta<0){
        return { comment: refineComment(comment.substring(ind)) };
    }

    var commentStr = refineComment(comment.substring(ind,indMeta));

    var indMetaObj = comment.indexOf('{',indMeta);
    if(indMetaObj<0){
        return { comment: commentStr};
    }

    try{
        var meta = JSON.parse(refineComment(comment.substring(indMetaObj)));
        meta.comment = commentStr.trim().length >0 ? commentStr : null;
        meta.override = meta.override || false
        meta.primary = meta.primary || false
        meta.deprecated = meta.deprecated || false;
        return meta;
    }
    catch(e){
        console.log(e);
    }

    return {};
}

function readArg(node,srcPath:string):Arg{

    var name = node.name.text;

    var type = tsStructureParser.buildType(node.type,srcPath);
    return {
        name:name,
        type:type
    }


}

export function flatten(t:tsStructureParser.TypeModel,namespaces?:{[key:string]:boolean}):string[]{

    if(t.typeKind==tsStructureParser.TypeKind.ARRAY){
        if(namespaces) {
            return [];
        }
        else{
            return [ flatten((<tsStructureParser.ArrayType>t).base)[0]+'[]' ];
        }
    }
    else if(t.typeKind==tsStructureParser.TypeKind.BASIC){
        var bt = (<tsStructureParser.BasicType>t);

        var str = bt.basicName;
        var nameSpace = bt.nameSpace && bt.nameSpace.trim();
        if(nameSpace!=null && nameSpace.length>0 && nameSpace!="RamlWrapper"){
            str = nameSpace + "." + str;
        }
        if(bt.typeArguments && bt.typeArguments.length!=0){
            str += `<${bt.typeArguments.map(x=>flatten(x)).join(', ')}>`
        }
        if(namespaces) {
            if (bt.nameSpace) {
                return namespaces[bt.nameSpace] ? [ str ] : [];
            }
            else{
                return [];
            }
        }
        return [ str ];
    }
    else if (t.typeKind==tsStructureParser.TypeKind.UNION){
        var ut = <tsStructureParser.UnionType>t;
        var result:string[] = [];
        ut.options.forEach(x=>result=result.concat(flatten(x,namespaces)));
        return result;
    }
    return [];
}
