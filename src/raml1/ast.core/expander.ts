/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST")
import hl=require("../highLevelAST")
import hlimpl=require("../highLevelImpl")
import yaml=require("yaml-ast-parser")
import impl=require("../jsyaml/jsyaml2lowLevel")
import util=require("../../util/index")
import proxy=require("./LowLevelASTProxy")
import RamlWrapper=require("../artifacts/raml10parserapi")
import RamlWrapperImpl=require("../artifacts/raml10parser")
import RamlWrapper08=require("../artifacts/raml08parserapi")
import RamlWrapper08Impl=require("../artifacts/raml08parser")
import factory10 = require("../artifacts/raml10factory")
import factory08=require("../artifacts/raml08factory")
import wrapperHelper=require("../wrapped-ast/wrapperHelper")
import wrapperHelper08=require("../wrapped-ast/wrapperHelper08")
import path=require('path')
import fs=require('fs')
import pluralize = require("pluralize")
import universeProvider=require ("../definition-system/universeProvider");
import universeDef=require("../tools/universe");

var changeCase = require('change-case');

export function expandTraitsAndResourceTypes<T>(api:T):T{
    if(!(api instanceof RamlWrapperImpl.ApiImpl || api instanceof RamlWrapper08Impl.ApiImpl)){
        return null;
    }

    return <T><any>new TraitsAndResourceTypesExpander()
.expandTraitsAndResourceTypes(<RamlWrapper.Api|RamlWrapper08.Api><any>api);
}

export function mergeAPIs(masterUnit:ll.ICompilationUnit, extensionsAndOverlays:ll.ICompilationUnit[],
    mergeMode: hlimpl.OverlayMergeMode) : hl.IHighLevelNode {
    var masterApi = hlimpl.fromUnit(masterUnit);
    if(!masterApi) throw new Error("couldn't load api from " + masterUnit.absolutePath());

    if (!extensionsAndOverlays || extensionsAndOverlays.length == 0) {
        return <hl.IHighLevelNode>masterApi;
    }

    var highLevelNodes:hlimpl.ASTNodeImpl[] = [];
    for(var i = 0 ; i < extensionsAndOverlays.length ; i++){

        var unit = extensionsAndOverlays[i];
        var hlNode = hlimpl.fromUnit(unit);
        if(!hlNode){
            throw new Error("couldn't load api from " + unit.absolutePath());
        }
        highLevelNodes.push(<hlimpl.ASTNodeImpl>hlNode);
    }

    var lastExtensionOrOverlay = mergeHighLevelNodes(masterApi, highLevelNodes, mergeMode);
    return lastExtensionOrOverlay;
}

function mergeHighLevelNodes(masterApi, highLevelNodes, mergeMode):hlimpl.ASTNodeImpl {
    var currentMaster = masterApi;
    highLevelNodes.forEach(currentApi=> {

        (<hlimpl.ASTNodeImpl>currentApi).overrideMaster(currentMaster);
        (<hlimpl.ASTNodeImpl>currentApi).setMergeMode(mergeMode);

        currentMaster = currentApi;
    });
    return currentMaster;
};

class TraitsAndResourceTypesExpander {

    private traitMap:{[key:string]:RamlWrapper.Trait|RamlWrapper08.Trait};

    private resourceTypeMap:{[key:string]:RamlWrapper.ResourceType|RamlWrapper08.ResourceType};

    private ramlVersion:string;

    expandTraitsAndResourceTypes(_api:RamlWrapper.Api|RamlWrapper08.Api):RamlWrapper.Api|RamlWrapper08.Api {

        var isRAML1 = _api instanceof RamlWrapperImpl.ApiImpl;
        var api:RamlWrapper.Api = <RamlWrapper.Api>_api;
        var traits:RamlWrapper.Trait[] = wrapperHelper.allTraits(api);
        var resourceTypes:RamlWrapper.ResourceType[] = wrapperHelper.allResourceTypes(api);
        //if ((!traits || traits.length == 0) && (!resourceTypes || resourceTypes.length == 0)) {
        //    return api;
        //}
        if (traits.length==0&&resourceTypes.length==0){
            return _api;
        }
        this.ramlVersion = _api.highLevel().definition().universe().version();

        var hlNode = this.createHighLevelNode(<hlimpl.ASTNodeImpl>api.highLevel());
        var result:RamlWrapper.Api|RamlWrapper08.Api = isRAML1
            ? factory10.buildWrapperNode(hlNode)
            : factory08.buildWrapperNode(hlNode);

        (<any>result).setAttributeDefaults((<any>_api).getDefaultsCalculator().isEnabled());

        this.traitMap = {};
        this.resourceTypeMap = {};

        (<hlimpl.ASTNodeImpl>result.highLevel()).setMergeMode(
            (<hlimpl.ASTNodeImpl>_api.highLevel()).getMergeMode());

        if (traits) {
            traits.forEach(x=>this.traitMap[wrapperHelper.qName(x)] = x);
        }
        if (resourceTypes) {
            resourceTypes.forEach(x=>this.resourceTypeMap[wrapperHelper.qName(x)] = x);
        }

        var resources:(RamlWrapper.Resource|RamlWrapper08.Resource)[] = result.resources();
        resources.forEach(x=>this.processResource(x));
        return result;
    }

    private createHighLevelNode(api:hlimpl.ASTNodeImpl):hlimpl.ASTNodeImpl {

        var highLevelNodes:hlimpl.ASTNodeImpl[] = [];
        var node = api;
        while(node) {

            var llNode:ll.ILowLevelASTNode = node.lowLevel();
            var topComposite:proxy.LowLevelCompositeNode = new proxy.LowLevelCompositeNode(
                llNode, null, null, this.ramlVersion);
            var nodeType = node.definition();
            var newNode = new hlimpl.ASTNodeImpl(topComposite, null, <any>nodeType, null);
            highLevelNodes.push(newNode);

            node = <hlimpl.ASTNodeImpl>node.getMaster();
        }
        var masterApi = highLevelNodes.pop();
        highLevelNodes = highLevelNodes.reverse();
        var mergeMode = api.getMergeMode();
        return mergeHighLevelNodes(masterApi,highLevelNodes, mergeMode);
    }

    processResource(resource:RamlWrapper.Resource|RamlWrapper08.Resource) {

        var resourceData:ResourceGenericData[] = this.collectResourceData(resource);

        if (resource instanceof RamlWrapperImpl.ResourceImpl){
            var mb=<RamlWrapperImpl.ResourceImpl>resource;
            //var signature=mb.signature();
            //if (signature) {
            //    var trait=sig.convertToTrait(sig.parse(mb.highLevel().attr("signature")))
            //    var cm=trait.highLevel().lowLevel();
            //    var vl=resource.relativeUri().value();
            //    var indExof=vl.lastIndexOf(".");
            //    if (indExof!=-1) {
            //        var composite = new proxy.LowLevelCompositeNode(cm, null, null);
            //        (<any>trait.highLevel())._node = composite;
            //        (<proxy.LowLevelCompositeNode>resource.highLevel().lowLevel()).setKeyOverride(vl.substr(0,indExof))
            //        var me=new RamlWrapper.MethodImpl(vl.substr(indExof+1));
            //        var rt=new RamlWrapper.ResourceTypeImpl("$$$signature");
            //        rt.add(me);
            //        trait.highLevel().elements().forEach(x=>me.highLevel().add(x));
            //        var composite = new proxy.LowLevelCompositeNode(rt.highLevel().lowLevel(), null, null);
            //        (<any>rt.highLevel())._node = composite;
            //        var val:GenericData = {
            //            name: "$$$signature",
            //            node: rt,
            //            transformer: null
            //        };
            //        resourceData = (<ResourceGenericData[]>[ {
            //            resourceType:val,
            //            traits: [],
            //            methodTraits: {}
            //        } ]).concat(resourceData);
            //    }
            //}
        }
        var resourceLowLevel = <proxy.LowLevelCompositeNode>resource.highLevel().lowLevel();
        resourceData.filter(x=>x.resourceType!=null).forEach(x=> {
            var resourceTypeLowLevel = <proxy.LowLevelCompositeNode>x.resourceType.node.highLevel().lowLevel();
            var resourceTypeTransformer = new DefaultTransformer(resource,x.resourceType.transformer);
            resourceLowLevel.adopt(resourceTypeLowLevel, resourceTypeTransformer)
        });

        var methods:(RamlWrapper.Method|RamlWrapper08.Method)[] = resource.methods();
        methods.forEach(m=> {

            var methodLowLevel = <proxy.LowLevelCompositeNode>m.highLevel().lowLevel();
            var name = m.method();
            resourceData.forEach(x=>{

                var methodTraits = x.methodTraits[name];
                if(methodTraits){
                    methodTraits.forEach(x=>{
                        var traitLowLevel = x.node.highLevel().lowLevel();
                        var traitTransformer = new DefaultTransformer(m,x.transformer);
                        methodLowLevel.adopt(traitLowLevel,traitTransformer);
                    });
                }

                var resourceTraits = x.traits;
                if(resourceTraits){
                    resourceTraits.forEach(x=> {
                        var traitLowLevel = x.node.highLevel().lowLevel();
                        var traitTransformer = new DefaultTransformer(m,x.transformer);
                        methodLowLevel.adopt(traitLowLevel, traitTransformer);
                    });
                }
            });
        });

        var resources:(RamlWrapper.Resource|RamlWrapper08.Resource)[] = resource.resources();
        resources.forEach(x=>this.processResource(x));
    }

    collectResourceData(
        obj:RamlWrapper.Resource|RamlWrapper.ResourceType|RamlWrapper08.Resource|RamlWrapper08.ResourceType,
        arr:ResourceGenericData[] = [],
        transformer?:proxy.ValueTransformer,
        occuredResourceTypes:{[key:string]:boolean}={}):ResourceGenericData[]
    {

        var ownTraits = this.extractTraits(obj,transformer);

        var methodTraitsMap:{[key:string]:GenericData[]} = {};
        var methods:(RamlWrapper.Method|RamlWrapper08.Method)[] = obj.methods();
        methods.forEach(x=>{
            var methodTraits = this.extractTraits(x,transformer);
            if(methodTraits&&methodTraits.length>0){
                methodTraitsMap[x.method()] = methodTraits;
            }
        });

        var rtData:GenericData;
        var rt:RamlWrapper.ResourceTypeRef|RamlWrapper08.ResourceTypeRef = obj.type();
        if (rt&&!occuredResourceTypes[rt.name()]) {
            occuredResourceTypes[rt.name()] = true;
            rtData = this.readGenerictData(rt, this.resourceTypeMap, 'resource type', transformer);
        }
        arr.push({
            resourceType:rtData,
            traits:ownTraits,
            methodTraits:methodTraitsMap
        });

        if(rtData) {
            this.collectResourceData(
                <RamlWrapper.ResourceType|RamlWrapper08.ResourceType>rtData.node,
                arr,rtData.transformer,occuredResourceTypes);
        }
        return arr;
    }

    extractTraits(obj:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper.Resource|RamlWrapper.Method
        |RamlWrapper08.ResourceType|RamlWrapper08.Resource|RamlWrapper08.Method,
                  _transformer?:proxy.ValueTransformer,
                  occuredTraits:{[key:string]:boolean} = {}):GenericData[]
    {
        var arr:GenericData[] = [];
        for (var i = -1; i < arr.length ; i++){

            var gd:GenericData = i < 0 ? null : arr[i];
            var _obj = gd ? gd.node : obj;
            var transformer:proxy.ValueTransformer = gd ? gd.transformer : _transformer;

            if(!_obj['is']){
                continue;
            }
            (<any>_obj).is().forEach(x=> {
                var traitData = this.readGenerictData(x, this.traitMap, 'trait', transformer);
                if (traitData) {
                    var name = traitData.name;
                    if (!occuredTraits[name]) {
                        occuredTraits[name] = true;
                        arr.push(traitData);
                    }
                }
            });
        }

        if (obj instanceof RamlWrapperImpl.MethodImpl){
            var mb=<RamlWrapper.Method>obj;
            //var signature=mb.signature();
            //if (signature) {
            //    var trait=sig.convertToTrait(sig.parse(mb.highLevel().attr("signature")))
            //    var cm=trait.highLevel().lowLevel();
            //    var composite=new proxy.LowLevelCompositeNode(cm,null,null);
            //    (<any>trait.highLevel())._node=composite;
            //    var val:GenericData={
            //        name:"$$$signature",
            //        node:trait,
            //        transformer:null
            //    }
            //    occuredTraits["$$$signature"]=true;
            //    arr = [val].concat(arr);
            //    //this.extractTraits(trait, occuredTraits);
            //}
        }
        return arr;
    }


    readGenerictData(obj:RamlWrapper.TraitRef|RamlWrapper.ResourceTypeRef|RamlWrapper08.TraitRef|RamlWrapper08.ResourceTypeRef,
                     globalMap:{[key:string]:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper08.Trait|RamlWrapper08.ResourceType},
                     template:string,
                     transformer?:proxy.ValueTransformer):GenericData {

        var value = <any>obj.value();
        if (typeof(value) == 'string') {
            if (transformer) {
                value = transformer.transform(value).value;
            }
            var node = globalMap[value];
            if (node) {
                return {
                    name: value,
                    transformer: null,
                    node: node
                };
            }
        }
        else if (value instanceof hlimpl.StructuredValue) {
            var sv = <hlimpl.StructuredValue>value;
            var name = sv.valueName();
            if (transformer) {
                name = transformer.transform(name).value;
            }
            var params:{[key:string]:string} = {};

            var node = globalMap[name];
            //var t = hlimpl.typeFromNode(node.highLevel());
            if (node) {

                if (this.ramlVersion == 'RAML08' && transformer) {
                    sv.children().forEach(x=>params[x.valueName()] = transformer.transform(x.lowLevel().value()).value);
                }
                else {
                    sv.children().forEach(x=>params[x.valueName()] = x.lowLevel().value());
                }
                return {
                    name: name,
                    transformer: new ValueTransformer(template, name, params),
                    node: node
                };
            }
        }
        return null;
    }

}

class TransformMatches {
    name: string;

    regexp: RegExp;

    static leftTransformRegexp: RegExp = /\|\s*!\s*/;
    static rightTransformRegexp: RegExp = /\s*$/;

    transformer: (arg: string) => string;

    constructor(name, transformer: (string) => string) {
        this.name = name;

        this.regexp = new RegExp(TransformMatches.leftTransformRegexp.source + name + TransformMatches.rightTransformRegexp.source);

        this.transformer = transformer;
    }
}

var transformers: TransformMatches[] = [
    new TransformMatches("singularize", (arg: string) => pluralize.singular(arg)),
    new TransformMatches("pluralize", (arg: string) => pluralize.plural(arg)),
    new TransformMatches("uppercase", (arg: string) => arg ? arg.toUpperCase() : arg),
    new TransformMatches("lowercase", (arg: string) => arg ? arg.toLowerCase() : arg),

    new TransformMatches("lowercamelcase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        return changeCase.camelCase(arg);
    }),

    new TransformMatches("uppercamelcase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        var lowerCamelCase = changeCase.camelCase(arg);

        return lowerCamelCase[0].toUpperCase() + lowerCamelCase.substring(1, lowerCamelCase.length);
    }),

    new TransformMatches("lowerunderscorecase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        var snakeCase = changeCase.snake(arg);

        return snakeCase.toLowerCase();
    }),

    new TransformMatches("upperunderscorecase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        var snakeCase = changeCase.snake(arg);

        return snakeCase.toUpperCase();
    }),

    new TransformMatches("lowerhyphencase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        var paramCase = changeCase.param(arg);

        return paramCase.toLowerCase();
    }),

    new TransformMatches("upperhyphencase", (arg: string) => {
        if(!arg) {
            return arg;
        }

        var paramCase = changeCase.param(arg);

        return paramCase.toUpperCase();
    })
];

export function getTransformNames(): string[] {
    return transformers.map(transformer => transformer.name);
}

export function getTransformerForOccurence(occurence: string) {
    var result;

    for(var i = 0; i < transformers.length; i++) {
        if(occurence.match(transformers[i].regexp)) {
            result = transformers[i].transformer;

            break;
        }
    }

    return result;
}

class TransformationBuffer{
    
    buf:any = null;
    
    append(value:any){
        if(value !== "") {
            if (this.buf != null) {
                if (value != null) {
                    if (typeof(this.buf) != "string") {
                        this.buf = "" + this.buf;
                    }
                    this.buf += value;
                }
            }
            else if (value !== "") {
                this.buf = value;
            }
        }
    }

    value():any{
        return this.buf != null ? this.buf : "";
    }
}

export class ValueTransformer implements proxy.ValueTransformer{

    constructor(
        templateKind:string,
        templateName:string,
        params:{[key:string]:string}){

        this.templateKind = templateKind;
        this.templateName = templateName;
        this.params = params;
    }

    templateKind:string;

    templateName:string;

    params:{[key:string]:string};

    transform(obj:any){

        var undefParams:{[key:string]:boolean} = {};

        var errors:hl.ValidationIssue[] = [];
        if(typeof(obj)==='string'){
            var str:string = <string>obj;
            var buf = new TransformationBuffer();
            var prev = 0;
            for(var i = str.indexOf('<<'); i >=0 ; i = str.indexOf('<<',prev)){
                buf.append(str.substring(prev,i));
                var i0 = i;
                i += '<<'.length;
                prev = str.indexOf('>>',i);
                var paramOccurence = str.substring(i,prev);
                prev += '>>'.length;

                var originalString = str.substring(i0,prev);

                var val;
                var paramName;

                var transformer = getTransformerForOccurence(paramOccurence);

                if(transformer) {
                    var ind = paramOccurence.lastIndexOf('|');
                    paramName = paramOccurence.substring(0,ind).trim();
                    val = this.params[paramName];
                    if(val) {
                        val = transformer(val);
                    }
                } else {
                    paramName = paramOccurence.trim();
                    val = this.params[paramName];
                }

                if(!val){
                    undefParams[paramName] = true;
                    val = originalString;
                }
                buf.append(val);
            }

            var upArr = Object.keys(undefParams);
            if(upArr.length>0){
                var errStr = upArr.join(', ').trim();
                var message = `Undefined ${this.templateKind} parameter${upArr.length>1?'s':''}: ${errStr}`;
                var error = {
                    code: hl.IssueCode.MISSING_REQUIRED_PROPERTY,
                    isWarning: false,
                    message: message,
                    node: null,
                    start: -1,
                    end: -1,
                    path: null
                }
                errors.push(error);
            }
            buf.append(str.substring(prev,str.length));
            return { value:buf.value(), errors: errors };
        }
        else{
            return { value:obj, errors: errors };
        }
    }
}

export class DefaultTransformer extends ValueTransformer{

    constructor(
        owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase,
        delegate: ValueTransformer
    ){
        super(delegate.templateKind,delegate.templateName,null);
        this.owner = owner;
        this.delegate = delegate;
    }

    owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase;

    delegate:ValueTransformer;

    transform(obj:any){

        if(obj==null){
            return {
                value:obj,
                errors: []
            }
        }

        var ownResult:{ value:any; errors:hl.ValidationIssue[] } = {
            value:obj,
            errors: []
        };
        var gotDefaultParam = false;
        defaultParameters.forEach(x=>gotDefaultParam = gotDefaultParam || obj.toString().indexOf('<<'+x)>=0);
        if(gotDefaultParam) {
            this.initParams();
            ownResult = super.transform(obj);
        }
        var result = this.delegate.transform(ownResult.value);
        return result;
    }

    private initParams(){

        var methodName:string;
        var resourcePath:string = "";
        var resourcePathName:string;
        var node = (<proxy.LowLevelValueTransformingNode>(<proxy.LowLevelCompositeNode>this.owner.highLevel().lowLevel())
            .originalNode()).originalNode();
        while(node){
            var key = node.key();
            if(key!=null) {
                if (util.stringStartsWith(key, '/')) {
                    if (!resourcePathName) {
                        var arr = key.split('/');
                        resourcePathName = arr[arr.length-1].replace(/[\/\{\}]/g,'');
                    }
                    resourcePath = key + resourcePath;
                }
                else {
                    methodName = key;
                }
            }
            node = node.parent();
        }
        this.params = {
            resourcePath: resourcePath,
            resourcePathName: resourcePathName
        };
        if(methodName){
            this.params['methodName'] = methodName;
        }
    }

}

interface GenericData{

    node:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper.Resource|RamlWrapper.Method
        |RamlWrapper08.Trait|RamlWrapper08.ResourceType|RamlWrapper08.Resource|RamlWrapper08.Method;

    name:string

    transformer:ValueTransformer

}

interface ResourceGenericData{

    resourceType:GenericData

    traits:GenericData[]

    methodTraits:{[key:string]:GenericData[]}
}

var defaultParameters = [ 'resourcePath', 'resourcePathName', 'methodName' ];
