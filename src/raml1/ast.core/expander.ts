/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST")
import hl=require("../highLevelAST")
import hlimpl=require("../highLevelImpl")
import yaml=require("yaml-ast-parser")
import jsyaml=require("../jsyaml/jsyaml2lowLevel")
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
import namespaceResolver = require("./namespaceResolver")
import defSys = require("raml-definition-system")
import typeExpressions = defSys.rt.typeExpressions


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
        if(this.ramlVersion=="RAML10") {
            this.appendGlobalTemplatesAsChildren(result);
            result.highLevel().resetChildren();
            patchNamespaces(<RamlWrapper.Api>result);
        }
        result.highLevel().resetChildren();
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

        var resourceData:ResourceGenericData[] = this.collectResourceData(resource,resource);


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

    appendGlobalTemplatesAsChildren(apiNode:core.BasicNode){
        
        var masterPaths = {};
        var masterNode = apiNode;
        while(masterNode){
            let llNode = masterNode.highLevel().lowLevel();
            var unit = llNode.unit();
            var absPath = unit.absolutePath();
            if(masterPaths[absPath]){
                break;
            }
            masterPaths[absPath]=true;
            if(masterNode.kind()==universeDef.Universe10.Extension.name
                ||masterNode.kind()==universeDef.Universe10.Overlay.name) {
                var extendsValue = (<RamlWrapper.Extension>apiNode).extends();
                var extendedUnit = unit.resolve(extendsValue);
                if (extendedUnit) {
                    var hlNode = extendedUnit.highLevel();
                    if (!hlNode.isElement()) {
                        break;
                    }
                    var masterNode = hlNode.asElement().wrapperNode();
                }
                else {
                    break;
                }
            }
            else{
                break;
            }
        }
        
        var traitsPropName = universeDef.Universe10.LibraryBase.properties.traits.name;
        var resourceTypesPropName = universeDef.Universe10.LibraryBase.properties.resourceTypes.name;

        var rootLl = <proxy.LowLevelCompositeNode>apiNode.highLevel().lowLevel();
        if((<proxy.LowLevelProxyNode>rootLl.originalNode()).originalNode()
                instanceof proxy.LowLevelProxyNode){
            return;
        }        
        var traitsNode:proxy.LowLevelCompositeNode;
        var resourceTypesNode:proxy.LowLevelCompositeNode;
        for(var ch of rootLl.children()){
            if(ch.key()== traitsPropName){
                traitsNode = <proxy.LowLevelCompositeNode>ch;
            }
            else if(ch.key()== resourceTypesPropName){
                resourceTypesNode = <proxy.LowLevelCompositeNode>ch;
            }
        }
        if(this.globalTraits.length>0) {
            if(!traitsNode){
                var yamlNode = jsyaml.createMapNode(traitsPropName);
                traitsNode = rootLl.replaceChild(null,yamlNode);
                yamlNode.setUnit(rootLl.unit());
            }
            for (let wn of this.globalTraits) {
                var ll = wn.highLevel().lowLevel();
                var nodePath = ll.unit().absolutePath();
                if (!masterPaths[nodePath]) {
                    traitsNode.replaceChild(null, ll);
                }
            }
        }
        if(this.globalResourceTypes.length>0) {
            if(!resourceTypesNode){
                var yamlNode = jsyaml.createMapNode(resourceTypesPropName);
                resourceTypesNode = rootLl.replaceChild(null,yamlNode);
                yamlNode.setUnit(rootLl.unit());
            }
            for (let wn of this.globalResourceTypes) {
                var ll = wn.highLevel().lowLevel();
                var nodePath = ll.unit().absolutePath();
                if (!masterPaths[nodePath]) {
                    resourceTypesNode.replaceChild(null, ll);
                }
            }
        }
        
        
    }

    collectResourceData(
        original:RamlWrapper.Resource|RamlWrapper08.Resource,
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
            rtData = this.readGenerictData(original,
                rt, obj.highLevel(), this.resourceTypeMap, this.globalResourceTypes, 'resource type', transformer);
        }
        arr.push({
            resourceType:rtData,
            traits:ownTraits,
            methodTraits:methodTraitsMap
        });

        if(rtData) {
            this.collectResourceData(original,
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
                var traitData = this.readGenerictData(obj,
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

    readGenerictData(r:core.BasicNode,obj:RamlWrapper.TraitRef|RamlWrapper.ResourceTypeRef|RamlWrapper08.TraitRef|RamlWrapper08.ResourceTypeRef,
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
                var ds=new DefaultTransformer(<any>r,null);
                Object.keys(scalarParams).forEach(x=>{
                    var q=ds.transform(scalarParams[x]);
                    //if (q.value){
                        if (q) {
                            if (typeof q!=="object") {
                                scalarParams[x] = q;
                            }
                        }
                    //}
                });
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

                if(val===null||val===undefined){
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
        super(delegate!=null?delegate.templateKind:"",delegate!=null?delegate.templateName:"");
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
        var ll=this.owner.highLevel().lowLevel();
        var node = ll instanceof proxy.LowLevelProxyNode?(<proxy.LowLevelValueTransformingNode>(<proxy.LowLevelCompositeNode>ll).originalNode()).originalNode():ll;
        var last=null;
        while(node){
            var key = node.key();
            if(key!=null) {
                if (util.stringStartsWith(key, '/')) {
                    if (!resourcePathName) {
                        var arr = key.split('/');
                        for (var i=arr.length-1;i>=0;i--){
                            var seg=arr[i];
                            if (seg.indexOf('{')==-1){
                                resourcePathName = arr[i];
                                break;
                            }
                            if (seg.length>0) {
                                last = seg;
                            }
                        }

                    }
                    resourcePath = key + resourcePath;
                }
                else {
                    methodName = key;
                }
            }
            node = node.parent();
        }
        if (!resourcePathName){
            if (last){
            resourcePathName="";
            }
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


var transitionTemplates = {

    "_##map_Api" : {
        "traits" : {
            "_##all_" : "_##map_Trait"
        },
        "resourceTypes" : {
            "_##all_" : "_##map_ResourceType"
        },
        "securitySchemes" : {
            "_##all_" : {
                "describedBy" : "_##map_Method"
            }
        },

        "_##startswith_" : {
            "/" : "_##map_Resource"
        }
    },

    "_##map_Resource" : {

        "_##startswith_" : {
            "/" : "_##map_Resource"
        },

        "queryParameters" : "_##map_parameters",
        "uriParameters" : "_##map_parameters",
        "headers" : "_##map_parameters",

        "get"     : "_##map_Method",
        "post"    : "_##map_Method",
        "put"     : "_##map_Method",
        "delete"  : "_##map_Method",
        "patch"   : "_##map_Method",
        "options" : "_##map_Method",
        "head"    : "_##map_Method",

        "securedBy" : "_##patch_",
        "is" : "_##patch_",
        "type" : "_##patch_"
    },
    
    "_##map_Method" : {
        "queryParameters" : "_##map_parameters",
        "uriParameters" : "_##map_parameters",
        "headers" : "_##map_parameters",

        "securedBy" : "_##patch_",
        "is" : "_##patch_",
        "body": "_##map_body",
        "responses": {
            "_##all_": {
                "headers" : "_##map_parameters",
                "body" : "_##map_body"
            }
        }
    },
    
    "_##map_TypeDeclaration" : {
        
        "type": "_##patch_",
        "schema": "_##patch_",
        "items": "_##patch_",
        "facets": "_##map_parameters",
        "properties": "_##map_parameters",
        "patternProperties": "_##map_parameters",
    },
    
    "_##map_parameters" : {
        "_##patchScalar_" : true,
        "_##all_" : "_##map_TypeDeclaration"
    },

    "_##map_body" : {

        "_##condition_" : {
            "defaultMediaType" : "_##map_TypeDeclaration"
        },
        "_##regexp_" : {
            ".+/.+" : "_##map_TypeDeclaration"
        }
    },
    
    "_##map_Trait" : [
        "_##map_Method",
        "_##patchKey_"
    ],
    
    "_##map_ResourceType" : [
        "_##map_Resource",
        "_##patchKey_"
    ]

}

class TransitionState{
    
    constructor(private _position:any,parent:TransitionState){
        if(parent){
            this._globalConditions = parent._globalConditions;
        }
    }

    private _globalConditions:{[key:string]:any};

    public position(): any{
        return this._position;
    }

    condition(key:string):any{
        return this._globalConditions && this._globalConditions[key];
    }
    
    globalConditions():{[key:string]:any}{
        return this._globalConditions;
    }

    setGlobalConditions(gc:{[key:string]:any}){
        this._globalConditions = gc;
    }
}

class TransitionEngine {

    private regExps: {[key:string]:RegExp};

    start(node:ll.ILowLevelASTNode){
        var position = transitionTemplates["_##map_Api"];
        var defaultMediaType
            = node.children().filter(ch=>
                ch.key()==universeDef.Universe10.Api.properties.mediaType.name).length > 0;

        var globalConditions = {
            defaultMediaType: defaultMediaType
        }
        var state = this.newState(node,position,null);
        state.setGlobalConditions(globalConditions);
        this.transit(node,state);
    }

    protected transit(node:ll.ILowLevelASTNode,state:TransitionState){

        if(node.kind() == yaml.Kind.SEQ){
            for(var ch of node.children()){
                this.transit(ch,state);
            }
        }

        var position = state.position();
        var conditions = position["_##condition_"];
        if(conditions){
            for(var cKey of Object.keys(conditions)){
                if(state.condition(cKey)){
                    this.processMatch(node,conditions[cKey],state);
                }
            }
        }

        var all = position["_##all_"];
        if(all){
            for( var ch of node.children()){
                this.processMatch(ch,all,state);
            }
        }
        
        var starsWithRules = position["_##startswith_"];
        var startsWithKeys = starsWithRules ? Object.keys(starsWithRules) : null;
        var regExpRules = position["_##regexp_"];
        var regexpKeys = regExpRules ? Object.keys(regExpRules) : null;

        for( var ch of node.children()){
            var chKey = ch.key();
            if(startsWithKeys){
                for(var sKey of startsWithKeys){
                    if(util.stringStartsWith(chKey,sKey)){
                        this.processMatch(ch,starsWithRules[sKey],state);
                        continue;
                    }
                }
            }
            if(regexpKeys){
                for(var rxKey of regexpKeys){
                    var regexp = this.getRegexp(rxKey);
                    if(regexp && chKey.match(regexp)){
                        this.processMatch(ch,regExpRules[rxKey],state);
                        continue;
                    }
                }
            }
            var rule = position[chKey];
            if(rule){
                this.processMatch(ch,rule,state);
            }
        }
    }

    protected processMatch(node:ll.ILowLevelASTNode,position:any,state:TransitionState){

        var newPosition:any=position;
        if(typeof(newPosition)=="string"){
            if(newPosition=="_##patch_"){
                var newState = this.newState(node, newPosition, state);
                this.applyPatch(node,newState);
                return;
            }
            else if(newPosition=="_##patchKey_"){
                var newState = this.newState(node, newPosition, state);
                this.applyPatch(node,newState,true);
                return;
            }
            else if(util.stringStartsWith(newPosition,"_##map_")){
                while(typeof(newPosition)=="string") {
                    newPosition = transitionTemplates[newPosition];
                }
            }
        }
        if(Array.isArray(newPosition)){
            for(var pos of newPosition){
                this.processMatch(node,pos,state);
            }
            return;
        }
        if(typeof(newPosition)=="object"){
            if(newPosition["_##patchScalar_"] && node.kind()==yaml.Kind.SCALAR){
                this.applyPatch(node,state);
            }
            else {
                var newState = this.newState(node, newPosition, state);
                this.transit(node, newState);
            }
        }
    }

    protected newState(node:ll.ILowLevelASTNode,pos:any,state:TransitionState):TransitionState {
        return new TransitionState(pos, state);
    }

    protected applyPatch(node:ll.ILowLevelASTNode,state:TransitionState,key:boolean=false){
        if(node.kind() == yaml.Kind.SEQ || node.valueKind() == yaml.Kind.SEQ){
            for(var ch of node.children()){
                var newState = this.newState(ch, state.position(), state);
                this.applyPatch(ch,newState,key);
            }
            if(node instanceof proxy.LowLevelCompositeNode){
                (<proxy.LowLevelCompositeNode>node).filterChildren();
            }
        }
        else {
            this.doApplyPatch(node, state, key);
        }
    }

    protected doApplyPatch(node:ll.ILowLevelASTNode,state:TransitionState, key:boolean){}

    protected getRegexp(str:string){
        if(!this.regExps){
            this.regExps = {};
        }
        var rx = this.regExps[str];
        if(!rx){
            rx = new RegExp(str);
            this.regExps[str] = rx;
        }
        return rx;
    }
}


class NamespacePatcherState extends TransitionState{

    rootUnit:ll.ICompilationUnit;

    unit:ll.ICompilationUnit;

    namespaceSources:ll.ICompilationUnit[];
}

class NamespacePatcher extends TransitionEngine{

    usedNamespaces:{[key:string]:boolean} = {};

    private resolver:namespaceResolver.NamespaceResolver
        = new namespaceResolver.NamespaceResolver();

    processApi(api:RamlWrapper.Api){

        var apiMap = transitionTemplates["_##map_Api"];

        var state = new NamespacePatcherState(apiMap,null);
        var llNode = api.highLevel().lowLevel();
        var unit = llNode.unit();
        state.rootUnit = unit;
        state.namespaceSources = [ unit ];
        state.unit = unit;

        var defaultMediaType
            = llNode.children().filter(ch=>
            ch.key()==universeDef.Universe10.Api.properties.mediaType.name).length > 0;

        var globalConditions = {
            defaultMediaType: defaultMediaType
        }
        state.setGlobalConditions(globalConditions);

        this.transit(llNode,state);
        this.patchAnnotations(llNode,state);
        this.patchUses(llNode);
    }

    protected newState(node:ll.ILowLevelASTNode,pos:any,_parentState:TransitionState):NamespacePatcherState {
        
        var parentState = <NamespacePatcherState>_parentState;
        var newState = new NamespacePatcherState(pos, _parentState);
        newState.rootUnit = parentState.rootUnit;

        var oNode = this.toOriginal(node);
        var oUnit = oNode.unit();
        newState.unit = oUnit;
        
        if(parentState.unit.absolutePath() == oUnit.absolutePath()){
            newState.namespaceSources = parentState.namespaceSources;
        }
        else {
            var ramlFirstLine = ll.ramlFirstLine(oUnit.contents());
            if (ramlFirstLine) {
                newState.namespaceSources = parentState.namespaceSources.concat(oUnit);
            }
            else{
                newState.namespaceSources = parentState.namespaceSources;
            }
        }
        return newState;
    }

    protected doApplyPatch(node:ll.ILowLevelASTNode,_state:TransitionState, toKey:boolean){

        if(!(node instanceof proxy.LowLevelProxyNode)){
            return;
        }
        if((<proxy.LowLevelProxyNode>(<proxy.LowLevelProxyNode>node).originalNode()).originalNode()
            instanceof proxy.LowLevelProxyNode){
            return;
        }

        var state = <NamespacePatcherState>_state;
        if(state.rootUnit.absolutePath()==state.unit.absolutePath()){
            return;
        }
        
        if(toKey){
            var key = node.key();
            var patched = this.patchNamespace(key,state);
            if(patched!=null){
                (<proxy.LowLevelCompositeNode>node).setKeyOverride(patched);
            }
            return;
        }

        var value = node.value();
        if(typeof(value)=="string"){
            if(value.indexOf("<<")>=0) {
                return;
            }
            var gotExpression = false;
            for(var i = 0 ; i < value.length ; i++ ) {
                var ch = value.charAt(i);
                if (ch == "|" || ch == "(" || ch == "[") {
                    gotExpression = true;
                    break;
                }
            }
            if (gotExpression) {
                var expr = typeExpressions.parse(value);
                var gotPatch = false;
                typeExpressions.visit(expr, x=> {
                    if (x.type == "name") {
                        var lit = <typeExpressions.Literal>x;
                        var patched = this.patchNamespace(lit.value, state);
                        if (patched != null) {
                            lit.value = patched;
                            gotPatch = true;
                        }
                    }
                });
                if (gotPatch) {
                    var newValue = typeExpressions.serializeToString(expr);
                    (<proxy.LowLevelCompositeNode>node).setValueOverride(newValue);
                }
            }
            else {
                var patched = this.patchNamespace(value, state);
                if (patched != null) {
                    (<proxy.LowLevelCompositeNode>node).setValueOverride(patched);
                }
            }

        }
        else if(value != null){
            var pNode = <proxy.LowLevelCompositeNode>value;
            var key = pNode.key();
            var patched = this.patchNamespace(key,state);
            if(patched!=null){
                (<proxy.LowLevelCompositeNode>pNode).setKeyOverride(patched);
            }
        }
        //this.printInfo(node,_state);
    }
    
    protected patchNamespace(value:string,state:NamespacePatcherState):string{
        
        var ind = value.lastIndexOf(".");
        var unit:ll.ICompilationUnit;
        var name:string;
        if(ind<0){
            unit = state.unit;
            name = value;
            if(defSys.rt.builtInTypes().get(name)!=null){
                return null;
            }
        }
        else{
            var oldNS = value.substring(0,ind);
            name = value.substring(ind+1);
            for(var i = state.namespaceSources.length ; i > 0 ; i--) {
                var map = this.resolver.nsMap(state.namespaceSources[i-1]);
                var info = map && map[oldNS];
                if (info) {
                    unit = info.unit;
                    break;
                }
            }
        }
        var newNS = this.resolver.resolveNamespace(state.rootUnit,unit);
        if(newNS==null){
            return null;
        }
        else if(newNS == ""){
            return name;
        }
        this.usedNamespaces[newNS] = true;
        var result = newNS + "." + name;
        return result;
    }


    protected patchAnnotations(node:ll.ILowLevelASTNode,state:NamespacePatcherState){

        var self = this;
        var visit = function(x:ll.ILowLevelASTNode,state:NamespacePatcherState){

            for(var ch of x.children()){
                var newState = self.newState(ch,null,state);
                visit(ch,newState);
            }

            if(state.unit.absolutePath()==state.rootUnit.absolutePath()){
                return;
            }
            var key = x.key();
            if(key==null){
                return;
            }
            if(!util.stringStartsWith(key,"(")||!util.stringEndsWith(key,")")){
                return;
            }
            var annotation = key.substring(1,key.length-1);
            var patched = self.patchNamespace(annotation, state);
            if(patched != null){
                var patchedKey = "("+patched+")";
                (<proxy.LowLevelProxyNode>x).setKeyOverride(patchedKey);
            }
        }
        visit(node,state);
    }

    protected printInfo(node:ll.ILowLevelASTNode, state:TransitionState) {
        var n = node;
        var arr = [];
        while (n) {
            var key = n.key();
            if (key) {
                arr.push(key);
            }
            n = n.parent();
        }
        var str = arr.reverse().join(".");
        var namespaceSources = (<NamespacePatcherState>state).namespaceSources;
        if(namespaceSources) {
            for (var s of namespaceSources) {
                str += ("\n  " + s.absolutePath());
            }
        }
        str += "\n";
        console.log(str);
    }
    
    protected toOriginal(node:ll.ILowLevelASTNode){
        for(var i = 0; i<2 && node instanceof proxy.LowLevelProxyNode; i++){
            node = (<proxy.LowLevelProxyNode>node).originalNode();
        }
        return node;
    }

    protected patchUses(node:ll.ILowLevelASTNode){
        if(!(node instanceof proxy.LowLevelCompositeNode)){
            return;
        }
        var unit = node.unit();
        var extendedUnitMap = this.resolver.expandedPathMap(unit);
        if(extendedUnitMap==null){
            return;
        }
        var unitMap = this.resolver.pathMap(unit);
        if(!unitMap){
            unitMap = {};
        }
        
        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesNodes = originalChildren.filter(x=>
            x.key()==universeDef.Universe10.FragmentDeclaration.properties.uses.name);

        var oNode = this.toOriginal(node);
        var yamlNode = oNode;
        while(yamlNode instanceof proxy.LowLevelProxyNode){
            yamlNode = (<proxy.LowLevelProxyNode>yamlNode).originalNode();
        }

        var usesInfos = Object.keys(unitMap).map(x=>extendedUnitMap[x]);
        var extendedUsesInfos = Object.keys(extendedUnitMap).map(x=>extendedUnitMap[x])
            .filter(x=>!unitMap[x.absolutePath()]&&this.usedNamespaces[x.namespace()]);

        var u = node.unit();
        var unitPath = u.absolutePath();

        var newUses = jsyaml.createMapNode("uses");
        newUses["_parent"] = <jsyaml.ASTNode>yamlNode;
        newUses.setUnit(yamlNode.unit());
        for (var ui of usesInfos.concat(extendedUsesInfos)) {
            var up = ui.absolutePath();
            var ip = ui.includePath;
            var mapping = jsyaml.createMapping(ui.namespace(), ip);
            mapping.setUnit(yamlNode.unit());
            newUses.addChild(mapping);
        }

        if(usesNodes.length>0){
            cNode.replaceChild(usesNodes[0],newUses);
        }
        else{
            cNode.replaceChild(null,newUses);
        }      

        while(node instanceof proxy.LowLevelProxyNode){
            node = (<proxy.LowLevelProxyNode>node).originalNode();
        }
        node.actual()["usesNode"] = newUses;
    }
}

function patchNamespaces(api:RamlWrapper.Api){
    new NamespacePatcher().processApi(api);
    var hpr = api.highLevel();
    if(hpr){
        hpr.resetChildren();
    }
    hpr["clearTypesCache"]();
}

