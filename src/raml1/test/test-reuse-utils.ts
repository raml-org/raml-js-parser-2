/// <reference path="../../../typings/main.d.ts" />
import index = require("../../index");
import assert = require("assert");
import RamlWrapper = require("../artifacts/raml10parserapi");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import yaml = require("yaml-ast-parser");
import hlimpl = require("../highLevelImpl");
import hl = require("../highLevelAST");
import util = require("./test-utils");
import fs = require("fs");
import ll = require("../lowLevelAST");

var DEFAULT_TYPING_SEQUENCE = [

    'Api.types',
    'Api.resourceTypes',
    'Api.traits',
    'Resource',
    'Method',
    'Method.body',
    'Method.responses',
];

class PropertiesSelection {
    allowed:{[key:string]:boolean} = {};

    prohibited:{[key:string]:boolean} = {};

    iterated:{[key:string]:boolean} = {};
}

enum Kind {
    ALLOWED, ITERATED, PROHIBITED
}

class SelectionRestriction{

    constructor(private _type:string, private _property:string, private _kind:Kind){}

    type():string { return this._type; }

    property():string { return this._property; }

    iterated():boolean { return this._kind == Kind.ITERATED; }

    allowed():boolean { return this._kind == Kind.ALLOWED; }

    prohibited():boolean { return this._kind == Kind.PROHIBITED; }
}

class PropertySelector {

    constructor(private restrictionSequence:string[]){
        this.init();
    }

    private init() {
        this.cache = {};
        for (var i = 0; i < this.restrictionSequence.length; i++) {

            let str = this.restrictionSequence[i];
            let kind:Kind = Kind.ALLOWED;
            if(i == this.index){
                kind = Kind.ITERATED;
            }
            else if(i>this.index){
                kind = Kind.PROHIBITED;
            }
            let typeName:string;
            let propertyName:string;
            let ind = str.indexOf(".");
            if (ind >= 0) {
                typeName = str.substring(0, ind);
                propertyName = str.substring(ind + 1);
            }
            else {
                typeName = str;
            }
            let restriction = new SelectionRestriction(typeName, propertyName, kind);
            if (propertyName) {
                let typeMap = this.typePropertyRestrictions[typeName];
                if (!typeMap) {
                    typeMap = {};
                    this.typePropertyRestrictions[typeName] = typeMap;
                }
                typeMap[propertyName] = restriction;
            }
            else {
                this.typeRestrictions[typeName] = restriction;
            }
        }
    }

    private typeRestrictions:{[key:string]:SelectionRestriction} = {};

    private typePropertyRestrictions:{[key:string]:{[key:string]:SelectionRestriction}} = {};

    private cache:{[key:string]:PropertiesSelection} = {};

    private index = 0;

    checkNode(node:hl.IHighLevelNode):PropertiesSelection{

        let definition = node.definition();
        let defName = definition.nameId();

        let result = this.cache[defName];
        if(result){
            return result;
        }
        result = new PropertiesSelection();
        this.cache[defName] = result;
        var typeMap = this.typePropertyRestrictions[defName];

        for(var prop of definition.allProperties()){
            var propName = prop.nameId();
            var rangeName= prop.range().nameId();
            var restriction = this.typeRestrictions[rangeName];
            if(!restriction || !restriction.allowed()){
                if(typeMap) {
                    let restriction2 = typeMap[propName];
                    if(!restriction || (restriction2&&(restriction2.allowed()||restriction2.iterated()))){
                        restriction = restriction2;
                    }
                }
            }
            if(restriction){
                if(restriction.iterated()){
                    result.iterated[propName] = true;
                }
                else if(restriction.prohibited()){
                    result.prohibited[propName] = true;
                }
                else if(restriction.allowed()){
                    result.allowed[propName] = true;
                }
            }
        }
        return result;
    }

    increment(){
        this.index++;
        this.init();
    }

}

class TextRange {

    constructor( private llNode:ll.ILowLevelASTNode, private _iterated=false,keyOnly=false){
        let content = llNode.unit().contents();
        this._start = llNode.start();
        if(keyOnly){
            let keyEnd = llNode.keyEnd();
            let colonIndex = content.indexOf(":",keyEnd);
            if(colonIndex<0){
                throw new Error();
            }
            this._end = colonIndex + 1;
        }
        else {
            this._end = llNode.end();
            var isSequence = llNode.parent() && (llNode.parent().kind() == yaml.Kind.SEQ);
            
            if(isSequence){
                let sInd = this._start-1;
                let seqStart = content.charAt(sInd);
                while(sInd>0 && seqStart != '[' && seqStart != '-' && seqStart != ','){                    ;
                    seqStart = content.charAt(--sInd);
                }
                this._start = sInd;
                if(seqStart=="["||seqStart==','){
                    let eInd = this._end;
                    let seqEnd = content.charAt(eInd);
                    while(eInd<content.length && seqEnd != ',' && seqEnd != ']'){                    ;
                        seqEnd = content.charAt(++eInd);
                    }
                    if(seqEnd==']'){
                        this._end = eInd+1;
                    }
                }
            }
        }
        this._text = content.substring(this._start,this._end);
    }

    private _text:string;

    private index = 0;

    private _start:number;

    private _end:number;

    start():number{ return this._start; }

    end():number{ return this._end; }

    iterated():boolean { return this._iterated }

    text():string{ return this._text }

    nextIteration():string{
        if(!this._iterated){
            return null;
        }
        if(this.index>=this._text.length){
            return null;
        }
        return this._text.substring(0,this.index++);
    }

}

class TextCollector {

    constructor(public selector:PropertySelector){}

    createIterationSequience(hlNode:hl.IHighLevelNode,globalIterated=false):TextRange[] {

        var propData = this.selector.checkNode(hlNode);
        if(Object.keys(propData.prohibited).length==0
            && Object.keys(propData.iterated).length==0){
            return null;
        }

        var processedProperties:any = {};
        var children = hlNode.children().sort((x,y)=>{
            return x.lowLevel().start() - y.lowLevel().start();
        });
        var llNode = hlNode.lowLevel();
        var result:TextRange[] = llNode.key() != null ? [ new TextRange(llNode,globalIterated,true) ] : [];
        var allChildrenAllowed = true;
        for(var ch of children) {

            let iterated = globalIterated;
            let prop:hl.IProperty;
            let propName:string;
            let chElement:hl.IHighLevelNode;
            let chAttr:hl.IAttribute;

            if (ch.isElement()) {
                chElement = ch.asElement();
                prop = chElement.property();
            }
            else if (ch.isAttr()) {
                chAttr = ch.asAttr();
                prop = chAttr.property();
            }
            if (prop) {
                propName = prop.nameId();
                if(propData.allowed[propName]){

                }
                else if(propData.iterated[propName]) {
                    allChildrenAllowed = false;
                    iterated = true;
                }
                else if (propData.prohibited[propName] || processedProperties[propName]) {
                    allChildrenAllowed = false;
                    continue;
                }

            }

            let llChild = ch.lowLevel();
            if (llChild == llNode) {
                continue;
            }
            let chResult:TextRange[];
            if (chElement) {
                chResult = this.createIterationSequience(ch.asElement(),iterated);
                if (chResult) {
                    allChildrenAllowed = false;
                }
            }
            if(!chResult) {
                chResult = [ new TextRange(llChild,iterated) ];
            }
            if(chResult){
                if(!processedProperties[propName]){
                    let llParent = llChild.parent();
                    while (llParent && llParent != llNode) {
                        if (llParent.kind() == yaml.Kind.MAPPING) {
                            result.push(new TextRange(llParent, iterated, true));
                        }
                        llParent = llParent.parent();
                    }
                    processedProperties[propName] = true;
                }
                chResult.forEach(x=>result.push(x));
            }
        }
        if(allChildrenAllowed){
            return null;
        }
        return result;
    }

}

class TextTyper {

    constructor(rootNode:hl.IHighLevelNode,selector:PropertySelector){
        this.sequence = new TextCollector(selector).createIterationSequience(rootNode);
        this.content = rootNode.lowLevel().unit().contents();
        this.contentWS = this.content.replace(/[^\s]/g,' ');
        let i1 = this.content.indexOf("#%RAML");
        let i2 = this.content.indexOf("\n",i1);
        if(i1<0){
            i2 = this.content.length;
        }
        this.startingSegment = this.content.substring(0,i2);
    }

    private sequence:TextRange[];

    private content:string;

    private contentWS:string;

    private startingSegment;

    private startChain = 0;

    hasNext():boolean{ return this.startChain < this.sequence.length; }

    next():string{
        var result = ""+this.startingSegment;
        var prev = this.startingSegment.length;
        var hasIteration = false;
        for(var i = this.startChain ; i < this.sequence.length ; i++){
            var seg = this.sequence[i];
            var segText:string;
            if(seg.iterated()){
                if(hasIteration) {
                    segText = "";
                }
                else{
                    segText = seg.nextIteration();
                    if (segText == null) {
                        segText = seg.text();
                    }
                    else {
                        hasIteration = true;
                        this.startChain = i;
                    }
                }
            }
            else{
                segText = seg.text();
            }
            var start = seg.start();
            if(start>prev){
                segText = this.contentWS.substring(prev,start) + segText;
            }
            if(!hasIteration){
                this.startChain = i;
                this.startingSegment += segText;
            }
            result += segText;
            prev = seg.end();
        }
        if(!hasIteration){
            this.startChain++;
        }

        return result;
    }

}

export function simulateTypingForFile(
    filePath:string,
    restrictions:string[]=DEFAULT_TYPING_SEQUENCE,
    enableReuse=true){

    let hlNode = index.loadApiSync(filePath).highLevel();
    let ps = new PropertySelector(restrictions);
    
    
    for(var i = 0 ; i < restrictions.length ; i++) {
        let reuseNode:hl.IHighLevelNode;
        let tt = new TextTyper(hlNode, ps);
        while (tt.hasNext()) {
            let text = tt.next();
            reuseNode = testEditingStep(text,filePath,reuseNode,true);
            //console.log(text);
        }
        ps.increment();
    }
}


export function testEditingStep(
    newContent:string,
    specPath:string,
    reuseNode:hl.IHighLevelNode,
    enableReuse:boolean,
    expectReuse?:boolean):hl.IHighLevelNode {
    
    if(!enableReuse){
        reuseNode = null;
    }

    let resolver = new jsyaml.FSResolverImpl();
    let fsResolver = {
        content: (path) => {
            if (path == specPath) {
                return newContent;
            }
            return resolver.content(path);
        },
        contentAsync: (path) => {
            return Promise.resolve("");
        }
    };

    let reusingApi = (<RamlWrapper.Api>index.loadRAMLSync(specPath, [], {
        reusedNode: reuseNode,
        fsResolver: fsResolver
    })).expand();

    if(!reuseNode){
        return reusingApi.highLevel();
    }

    if (expectReuse != null) {
        if (expectReuse) {
            if ((<hlimpl.ASTNodeImpl>reusingApi.highLevel()).reusedNode() == null) {
                throw new Error("Reuse is expected");
            }
        }
        else {
            if ((<hlimpl.ASTNodeImpl>reusingApi.highLevel()).reusedNode() != null) {
                throw new Error("Reuse is NOT expected");
            }
        }
    }

    let nonReusingApi = (<RamlWrapper.Api>index.loadRAMLSync(specPath, [], {
        fsResolver: fsResolver
    })).expand();

    let apiJSON = nonReusingApi.toJSON({rootNodeDetails: true});
    let apiReuseJSON = reusingApi.toJSON({rootNodeDetails: true});

    if (checkErrorPositions(apiJSON["errors"])) {

        let diff = util.compare(apiReuseJSON, apiJSON);
        if (diff.length != 0) {
            let message = `DIFFERENCE DETECTED FOR ${specPath}
${newContent}

${diff.map(x=>x.message("actual", "expected")).join("\n\n")}`;
            throw new Error(message);
        }
    }

    return reusingApi.highLevel();
}

function checkErrorPositions(errs: Object[]): Boolean{
    for(var e of errs){
        if (e["column"]==undefined){
            return false;
        }
        if (e["line"] == undefined) {
            return false;
        }
        if (e["position"] == undefined) {
            return false;
        }
        if(!e['range']){
            return false;
        }
        if (e["range"]["end"] == undefined) {
            return false;
        }
        if (e["range"]["start"] == undefined){
            return false;
        }
    }
    return true;
}

export function testReuseByBasicTyping(specPath:string,byWords=true,enableReuse=true) {

    let fileContent: string = fs.readFileSync(specPath, "utf8");
    let i1 = fileContent.indexOf("#%RAML");
    if(i1<0){
        throw new Error(`Not a RAML file: ${specPath}`);
    }
    let i2 = fileContent.indexOf("\n",i1);
    if(i2<0){
        i2 = fileContent.length;
    }
    else{
        i2 += "\n".length;
    }

    let prevNode:hl.IHighLevelNode;
    let contentBuffer = fileContent.substr(0, i2);

    if(byWords){
        let words = fileContent.substring(i2).split(/(\s+)/);
        for (var i = 0; i < words.length; i++) {
            contentBuffer += words[i];
            try {
                prevNode = testEditingStep(contentBuffer, specPath, prevNode, enableReuse);
            }
            catch (e) {
                console.error(e);
                assert(false);
            }
        }
    }
    else {
        for (var i = contentBuffer.length; i < fileContent.length; i++) {
            contentBuffer += fileContent.charAt(i);
            try {
                prevNode = testEditingStep(contentBuffer, specPath, prevNode, enableReuse);
            }
            catch (e) {
                console.error(e);
                assert(false);
            }
        }
    }
}