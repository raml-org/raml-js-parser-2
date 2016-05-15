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
import _ = require("underscore");
import core = require("../wrapped-ast/parserCore")

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


    private traitMap:{[key:string]:{[key:string]:RamlWrapper.Trait|RamlWrapper08.Trait}};

    private resourceTypeMap:{[key:string]:{[key:string]:RamlWrapper.ResourceType|RamlWrapper08.ResourceType}};

    private globalTraits:(RamlWrapper.Trait|RamlWrapper08.Trait)[];

    private globalResourceTypes:(RamlWrapper.ResourceType|RamlWrapper08.ResourceType)[];

    private ramlVersion:string;

    expandTraitsAndResourceTypes(api:RamlWrapper.Api|RamlWrapper08.Api):RamlWrapper.Api|RamlWrapper08.Api {
        if (api.definition().key()==universeDef.Universe10.Overlay){
            return api;
        }
        this.ramlVersion = api.highLevel().definition().universe().version();
        var factory = this.ramlVersion=="RAML10" ? factory10 : factory08;

        var isRAML1 = api instanceof RamlWrapperImpl.ApiImpl;

        this.globalTraits = this.ramlVersion=="RAML10"
            ? wrapperHelper.allTraits(<RamlWrapper.Api>api)
            : wrapperHelper08.allTraits(<RamlWrapper08.Api>api);

        this.globalResourceTypes  = this.ramlVersion=="RAML10"
            ? wrapperHelper.allResourceTypes(<RamlWrapper.Api>api)
            : wrapperHelper08.allResourceTypes(<RamlWrapper08.Api>api);
        //if ((!traits || traits.length == 0) && (!resourceTypes || resourceTypes.length == 0)) {
        //    return api;
        //}
        if (this.globalTraits.length==0&&this.globalResourceTypes.length==0){
            return api;
        }
        
        var hlNode = this.createHighLevelNode(<hlimpl.ASTNodeImpl>api.highLevel());
        var result:RamlWrapper.Api|RamlWrapper08.Api = factory.buildWrapperNode(hlNode);

        (<any>result).setAttributeDefaults((<any>api).getDefaultsCalculator().isEnabled());

        this.traitMap = {};
        this.resourceTypeMap = {};

        (<hlimpl.ASTNodeImpl>result.highLevel()).setMergeMode(
            (<hlimpl.ASTNodeImpl>api.highLevel()).getMergeMode());

        var resources:(RamlWrapper.Resource|RamlWrapper08.Resource)[] = result.resources();
        resources.forEach(x=>this.processResource(x));
        return result;
    }

    private getTemplate<T extends core.BasicNode>(
        name:string,
        context:hl.IHighLevelNode,
        cache:{[key:string]:{[key:string]:T}},
        globalList:T[]):T{

        var unitPath = context.lowLevel().unit().path();
        var unitCache = cache[unitPath];
        if(!unitCache){
            unitCache = {};
            cache[unitPath] = unitCache;
        }
        var val = unitCache[name];

        if(val!==undefined){
            return val;
        }
        val = null;
        val = _.find(globalList,x=>hlimpl.qName(x.highLevel(),context)==name);
        if(!val){
            val = null;
        }
        unitCache[name] = val;
        return val;
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
            rtData = this.readGenerictData(
                rt, obj.highLevel(), this.resourceTypeMap, this.globalResourceTypes, 'resource type', transformer);
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
                var traitData = this.readGenerictData(
                    x, _obj.highLevel(), this.traitMap, this.globalTraits, 'trait', transformer);

                if (traitData) {
                    var name = traitData.name;
                    //if (!occuredTraits[name]) {
                        occuredTraits[name] = true;
                        arr.push(traitData);
                    //}
                }
            });
        }
        return arr;
    }

    readGenerictData(obj:RamlWrapper.TraitRef|RamlWrapper.ResourceTypeRef|RamlWrapper08.TraitRef|RamlWrapper08.ResourceTypeRef,
                     context:hl.IHighLevelNode,
                     cache:{[key:string]:{[key:string]:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper08.Trait|RamlWrapper08.ResourceType}},
                     globalList:(RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper08.Trait|RamlWrapper08.ResourceType)[],
                     template:string,
                     transformer?:proxy.ValueTransformer):GenericData {

        var value = <any>obj.value();
        if (typeof(value) == 'string') {
            if (transformer) {
                value = transformer.transform(value).value;
            }
            var node = this.getTemplate(value,context,cache,globalList);
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
            var scalarParams:{[key:string]:string} = {};
            var structuredParams:{[key:string]:ll.ILowLevelASTNode} = {};

            var node = this.getTemplate(name,context,cache,globalList);;
            //var t = hlimpl.typeFromNode(node.highLevel());
            if (node) {

                if (this.ramlVersion == 'RAML08') {
                    if(transformer) {
                        sv.children().forEach(x=>scalarParams[x.valueName()] = transformer.transform(x.lowLevel().value()).value);
                    }
                    else{
                        sv.children().forEach(x=>scalarParams[x.valueName()] = x.lowLevel().value());
                    }
                }
                else {
                    sv.children().forEach(x=>{
                        var llNode = x.lowLevel();
                        if(llNode.valueKind()==yaml.Kind.SCALAR) {
                            scalarParams[x.valueName()] = llNode.value()
                        }
                        else{
                            structuredParams[x .valueName()] = llNode;
                        }
                    });
                }
                return {
                    name: name,
                    transformer: new ValueTransformer(template, name, scalarParams, structuredParams),
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
        public templateKind:string,
        public templateName:string,
        public params?:{[key:string]:string},
        public structuredParams?:{[key:string]:ll.ILowLevelASTNode}){
    }

    transform(obj:any,toString?:boolean){

        var undefParams:{[key:string]:boolean} = {};

        var errors:hl.ValidationIssue[] = [];
        if(typeof(obj)==='string'){
            if(this.structuredParams&&util.stringStartsWith(obj,"<<")&&util.stringEndsWith(obj,">>")){
                var paramName = obj.substring(2,obj.length-2);
                var structuredValue = this.structuredParams[paramName];
                if(structuredValue!=null){
                   return { value:structuredValue.value(toString), errors: errors };
                }
            }
            var str:string = <string>obj;
            var buf = new TransformationBuffer();
            var prev = 0;
            for(var i = str.indexOf('<<'); i >=0 ; i = str.indexOf('<<',prev)){
                buf.append(str.substring(prev,i));
                var i0 = i;
                i += '<<'.length;
                prev = str.indexOf('>>',i);
                if (prev==-1){
                    break;
                }
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

    children(node:ll.ILowLevelASTNode):ll.ILowLevelASTNode[]{
        var substitution = this.substitutionNode(node);
        if(substitution){
            return substitution.children();
        }
        return null;
    }

    valueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        var substitution = this.substitutionNode(node);
        if(substitution){
            return substitution.valueKind();
        }
        return null;
    }

    private substitutionNode(node:ll.ILowLevelASTNode) {
        var paramName = this.paramName(node);
        return paramName && this.structuredParams[paramName];
    }
    
    private paramName(node:ll.ILowLevelASTNode):string {
        var paramName:string = null;
        if (node.valueKind() == yaml.Kind.SCALAR) {
            var val = ("" + node.value()).trim();
            if (util.stringStartsWith(val, "<<") && util.stringEndsWith(val, ">>")) {
                paramName = val.substring(2, val.length - 2);
            }
        }
        return paramName;
    }
}

export class DefaultTransformer extends ValueTransformer{

    constructor(
        owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase,
        delegate: ValueTransformer
    ){
        super(delegate.templateKind,delegate.templateName);
        this.owner = owner;
        this.delegate = delegate;
    }

    owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase;

    delegate:ValueTransformer;

    transform(obj:any,toString?:boolean){

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
        var result = this.delegate != null ? this.delegate.transform(ownResult.value,toString) : ownResult.value;
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

    children(node:ll.ILowLevelASTNode):ll.ILowLevelASTNode[]{
        return this.delegate != null ? this.delegate.children(node) : null;
    }

    valueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        return this.delegate != null ? this.delegate.valueKind(node) : null;
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
