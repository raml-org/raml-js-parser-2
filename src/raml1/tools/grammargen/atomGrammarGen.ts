/// <reference path="../../../../typings/main.d.ts" />
import def=require("raml-definition-system")
import hl=require("../../highLevelAST")
import services=def;

import _=require("underscore")
import fs=require("fs");
import path=require("path")
//TODO implement pragrammatic grammar at some point
/**
 *Generates grammar for Atom from definition system at this moment we will use context free grammar
 *
 */
function iteratePropeties(u:def.Universe){
    var result="";
    var pNames:{ [name:string]:hl.IProperty[]}={};
    u.types().forEach(x=>{
        x.allProperties().forEach(p=>{
            if (pNames[p.nameId()]){
                if (_.indexOf(pNames[p.nameId()],p)==-1){
                    pNames[p.nameId()].push(p);
                }
            }
            else{
                pNames[p.nameId()]=[p];
            }
        })
    });
    Object.keys(pNames).forEach(x=> {
        var props:hl.IProperty[] = pNames[x];
        var kinds = _.uniq(props.map(x=>x.getAdapter(services.RAMLPropertyService).getPropertyGrammarType()));
        if (kinds.length > 1) {
            throw new Error("Different properties with same name should have same grammar kind at this moment");
        }
        result+=generateNodePropertyDefinition(props[0]);
    });
    return result;
}
function generateKeyTemplate(p:hl.IProperty){
    if (p.enumOptions()&&p.getAdapter(services.RAMLPropertyService).isKey()){
            return p.enumOptions().join("|");
    }
    if (p.keyPrefix()!=null){
        return escape(p.keyPrefix())+"([^:]+)"//FIXME
    }
    //if (p.i)
    return p.nameId();
}
function escape(n:string){
    return n.replace("/","\\\\/");
}
function generateNodePropertyDefinition(p:hl.IProperty):string{
var propKind=p.getAdapter(services.RAMLPropertyService).getPropertyGrammarType();
    if (!propKind){
        propKind="constant.character.method.yaml"
    }
var keyTemplate=generateKeyTemplate(p);
    var end="\\\\z|\\\\n"
    var tab="\\\\t";
    var lineEnd="((?:(\\\\![\\\\w\\\\!]+)\\\\s+?)?|\\\\Z|(?#))"
var tag=`
  {
    'begin': '^[ ${tab}]*(${keyTemplate})(:)${lineEnd}'
    'beginCaptures':
      '1':
        'name': '${propKind}'
      '2':
        'name': 'punctuation.colon.key-value.yaml'
      '3':
        'name': 'support.type.tag.yaml'
    'end': '$'
    'name': 'meta.method'
    'patterns': [
      {
        'begin': '#'
        'beginCaptures':
          '0':
            'name': 'punctuation.definition.comment.yaml'
        'end': '${end}'
        'name': 'comment.line.number-sign.yaml'
      }
      {
        'include': '#scalars'
      }
    ]
  }
`
return tag;
}
export function composeGrammar(u:def.Universe):string{
    var s=fs.readFileSync(path.resolve(__dirname,"grammarTemplate.cson")).toString();
    var ip="$INSERTION_POINT";
    var startIndex=s.indexOf(ip);
    return s.substr(0,startIndex)+iteratePropeties(u)+s.substr(startIndex+ip.length);

}