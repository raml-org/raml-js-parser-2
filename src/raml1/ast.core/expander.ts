/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import hl=require("../highLevelAST");
import hlimpl=require("../highLevelImpl");
import yaml=require("yaml-ast-parser");
import util=require("../../util/index");
import proxy=require("./LowLevelASTProxy");
import RamlWrapper=require("../artifacts/raml10parserapi");
import RamlWrapperImpl=require("../artifacts/raml10parser");
import RamlWrapper08=require("../artifacts/raml08parserapi");
import RamlWrapper08Impl=require("../artifacts/raml08parser");
import wrapperHelper=require("../wrapped-ast/wrapperHelper");
import wrapperHelper08=require("../wrapped-ast/wrapperHelper08");
import pluralize = require("pluralize")
import universeDef=require("../tools/universe");
import _ = require("underscore");
import core = require("../wrapped-ast/parserCore");
import referencePatcher = require("./referencePatcher");
import namespaceResolver = require("./namespaceResolver");
import def = require("raml-definition-system");
import universeHelpers = require("../tools/universeHelpers");
var mediaTypeParser = require("media-typer");
var changeCase = require('change-case');

export function expandTraitsAndResourceTypes<T>(api:T):T{
    // if(!((<any>api).kind
    //     && ((<any>api).kind() == "Api" || (<any>api).kind() == "Overlay" || (<any>api).kind() == "Extension"))){
    if(!(api instanceof RamlWrapperImpl.ApiImpl || api instanceof RamlWrapper08Impl.ApiImpl)){
        return null;
    }

    return <T><any>new TraitsAndResourceTypesExpander()
.expandTraitsAndResourceTypes(<RamlWrapper.Api|RamlWrapper08.Api><any>api);
}

export function expandLibraries(api:RamlWrapper.Api):RamlWrapper.Api{
    return new LibraryExpander().expandLibraries(api);
}

export function expandLibrary(lib:RamlWrapper.Library):RamlWrapper.Library{
    return new LibraryExpander().expandLibrary(lib);
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

function mergeHighLevelNodes(
    masterApi,
    highLevelNodes,
    mergeMode,
    rp:referencePatcher.ReferencePatcher = null,
    expand = false):hlimpl.ASTNodeImpl {

    var currentMaster = masterApi;
    for(var currentApi of highLevelNodes) {
        
        

        if(expand&&(proxy.LowLevelProxyNode.isInstance(currentMaster.lowLevel()))) {
            currentMaster = new TraitsAndResourceTypesExpander().expandHighLevelNode(
                currentMaster, rp, masterApi.wrapperNode()).highLevel();
        }
        (<hlimpl.ASTNodeImpl>currentApi).overrideMaster(currentMaster);
        (<hlimpl.ASTNodeImpl>currentApi).setMergeMode(mergeMode);

        currentMaster = currentApi;
    }
    return currentMaster;
};

export class TraitsAndResourceTypesExpander {

    private hasGlobalTraits = false;

    private hasGlobalResourceTypes = false;

    private ramlVersion:string;

    expandTraitsAndResourceTypes(
        api:RamlWrapper.Api|RamlWrapper08.Api,
        rp:referencePatcher.ReferencePatcher = null,
        forceProxy:boolean=false):RamlWrapper.Api|RamlWrapper08.Api {

        this.init(api);

        var llNode = api.highLevel().lowLevel();
        if(!llNode) {
            return api;
        }
        if(llNode.actual().libExpanded){
            return api;
        }

        var unit = llNode.unit();
        var hasFragments = (<jsyaml.Project>unit.project()).namespaceResolver().hasFragments(unit);
        var hasTemplates = (<jsyaml.Project>unit.project()).namespaceResolver().hasTemplates(llNode.unit());
        if (!(hasTemplates||hasFragments)&&!forceProxy){
            return api;
        }

        var hlNode = this.createHighLevelNode(<hlimpl.ASTNodeImpl>api.highLevel(),false,rp);
        if (api.definition().key()==universeDef.Universe10.Overlay){
            return <RamlWrapper.Api>hlNode.wrapperNode();
        }
        var result = this.expandHighLevelNode(hlNode, rp, <core.BasicNodeImpl><any>api);
        return result;
    }

    init(api:RamlWrapper08.Api|RamlWrapper.Api) {
        var hlNode = api.highLevel();
        this.ramlVersion = hlNode.definition().universe().version();
    }

    expandHighLevelNode(
        hlNode:hl.IHighLevelNode,
        rp:referencePatcher.ReferencePatcher,
        api:core.BasicNodeImpl) {

        this.init(<any>api);
        var result:RamlWrapper.Api|RamlWrapper08.Api = <RamlWrapper.Api|RamlWrapper08.Api>hlNode.wrapperNode();

        (<any>result).setAttributeDefaults((<any>api).getDefaultsCalculator().isEnabled());

        (<hlimpl.ASTNodeImpl>result.highLevel()).setMergeMode(
            (<hlimpl.ASTNodeImpl>api.highLevel()).getMergeMode());

        var resources:(RamlWrapper.Resource|RamlWrapper08.Resource)[] = result.resources();
        resources.forEach(x=>this.processResource(x));

        if (this.ramlVersion=="RAML10") {
            rp = rp || new referencePatcher.ReferencePatcher();
            rp.process(hlNode);
            hlNode.lowLevel().actual().referencePatcher = rp;
        }
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

    public createHighLevelNode(
        _api:hl.IHighLevelNode,
        merge:boolean=true,
        rp:referencePatcher.ReferencePatcher = null,
        forceProxy=false):hlimpl.ASTNodeImpl {

        var api = <hlimpl.ASTNodeImpl>_api;
        var highLevelNodes:hlimpl.ASTNodeImpl[] = [];

        var node = api;
        while(node) {

            var llNode:ll.ILowLevelASTNode = node.lowLevel();
            var topComposite:ll.ILowLevelASTNode;
            if (api.definition().key()!=universeDef.Universe10.Overlay||forceProxy){
                if(proxy.LowLevelCompositeNode.isInstance(llNode)){
                    llNode = (<proxy.LowLevelCompositeNode>(<proxy.LowLevelCompositeNode>llNode).originalNode()).originalNode();
                }
                topComposite = new proxy.LowLevelCompositeNode(
                    llNode, null, null, this.ramlVersion);
            }
            else{
                topComposite = llNode;
            }

            
            
            var nodeType = node.definition();
            var newNode = new hlimpl.ASTNodeImpl(topComposite, null, <any>nodeType, null);
            newNode.setUniverse(node.universe());
            highLevelNodes.push(newNode);
            if(!merge){
                break;
            }
            node = <hlimpl.ASTNodeImpl>node.getMaster();
        }
        var masterApi = highLevelNodes.pop();
        highLevelNodes = highLevelNodes.reverse();
        var mergeMode = api.getMergeMode();
        return mergeHighLevelNodes(masterApi,highLevelNodes, mergeMode, rp, forceProxy);
    }

    private processResource(resource:RamlWrapper.Resource|RamlWrapper08.Resource,_nodes:hl.IParseResult[]=[]) {
        var nodes = _nodes.concat(resource.highLevel());

        var resourceData:ResourceGenericData[] = this.collectResourceData(resource,resource,undefined,undefined,nodes);


        var resourceLowLevel = <proxy.LowLevelCompositeNode>resource.highLevel().lowLevel();
        resourceLowLevel.preserveAnnotations();
        resourceLowLevel.takeOnlyOriginalChildrenWithKey(
            def.universesInfo.Universe10.ResourceBase.properties.type.name);
        resourceLowLevel.takeOnlyOriginalChildrenWithKey(
            def.universesInfo.Universe10.FragmentDeclaration.properties.uses.name);
        resourceData.filter(x=>x.resourceType!=null).forEach(x=> {
            var resourceTypeLowLevel = <proxy.LowLevelCompositeNode>x.resourceType.node.highLevel().lowLevel();
            var resourceTypeTransformer = x.resourceType.transformer;
            resourceTypeTransformer.owner = resource;
            resourceLowLevel.adopt(resourceTypeLowLevel, resourceTypeTransformer)
        });

        var methods:(RamlWrapper.Method|RamlWrapper08.Method)[] = resource.methods();
        
        methods.forEach(m=> {

            var methodLowLevel = <proxy.LowLevelCompositeNode>m.highLevel().lowLevel();
            if(proxy.LowLevelCompositeNode.isInstance(methodLowLevel)) {
                methodLowLevel.takeOnlyOriginalChildrenWithKey(
                    def.universesInfo.Universe10.FragmentDeclaration.properties.uses.name);
            }
            var name = m.method();
            var allTraits:GenericData[]=[]
            resourceData.forEach(x=>{

                var methodTraits = x.methodTraits[name];
                if(methodTraits){
                    allTraits = allTraits.concat(methodTraits);
                    methodTraits.forEach(x=>{
                        var traitLowLevel = x.node.highLevel().lowLevel();
                        var traitTransformer = x.transformer;
                        traitTransformer.owner = m;
                        methodLowLevel.adopt(traitLowLevel,traitTransformer);
                    });
                }

                var resourceTraits = x.traits;
                if(resourceTraits){
                    allTraits = allTraits.concat(resourceTraits);
                    resourceTraits.forEach(x=> {
                        var traitLowLevel = x.node.highLevel().lowLevel();
                        var traitTransformer = x.transformer;
                        traitTransformer.owner = m;
                        methodLowLevel.adopt(traitLowLevel, traitTransformer);
                    });
                }                
            });
            // if(resource.definition().universe().version()=="RAML10") {
            //     this.appendTraitReferences(m, allTraits);
            // }
        });

        var resources:(RamlWrapper.Resource|RamlWrapper08.Resource)[] = resource.resources();
        resources.forEach(x=>this.processResource(x,nodes));
        (<(RamlWrapper.Method|RamlWrapper08.Method)[]>resource.methods())
            .forEach(x=>this.mergeBodiesForMethod(x.highLevel()));
    }

    private mergeBodiesForMethod(method: hl.IHighLevelNode) {
        let llNode = <proxy.LowLevelCompositeNode>method.lowLevel();
        if (!proxy.LowLevelCompositeNode.isInstance(llNode)) {
            return;
        }
        let defaultMediaType
            = method.computedValue(universeDef.Universe10.Api.properties.mediaType.name);

        if (defaultMediaType == null) {
            return;
        }
        let bodyNode: proxy.LowLevelCompositeNode;
        let bodyNodesArray: proxy.LowLevelCompositeNode[] = [];
        let llChildren = llNode.children();
        for(var ch of llChildren){
            if(ch.key()==universeDef.Universe10.Method.properties.body.name){
                bodyNode = ch;
            }
            else if(ch.key()==universeDef.Universe10.Method.properties.responses.name){
                let responses = ch.children();
                for(var response of responses){
                    let responseChildren = response.children();
                    for(var respCh of responseChildren){
                        if(respCh.key()==universeDef.Universe10.Response.properties.body.name){
                            bodyNodesArray.push(respCh);
                        }
                    }
                }
            }
        }
        if(bodyNode){
            bodyNodesArray.push(bodyNode);
        }
        for(var n of bodyNodesArray){
            this.mergeBodies(n, defaultMediaType);
        }
    }

    private mergeBodies(bodyNode:proxy.LowLevelCompositeNode, defaultMediaType:string):boolean{
        let explicitCh:proxy.LowLevelCompositeNode;
        let implicitPart:proxy.LowLevelCompositeNode[] = [],
            otherMediaTypes:proxy.LowLevelCompositeNode[] = [];

        let newAdopted:{node:ll.ILowLevelASTNode,transformer:proxy.ValueTransformer}[] = [];
        let map:ll.ILowLevelASTNode[] = [];
        let gotImplicitPart = false;
        for(let ch of bodyNode.children()){
            let key = ch.key();
            if(key==defaultMediaType){
                explicitCh = ch;
                newAdopted.push({node:referencePatcher.toOriginal(ch),transformer:ch.transformer()});
            }
            else {
                try{
                    parseMediaType(key);
                    otherMediaTypes.push(ch);
                }
                catch(e){
                    let oParent = referencePatcher.toOriginal(ch).parent();
                    if(map.indexOf(oParent)<0) {
                        newAdopted.push({node:oParent,transformer:ch.transformer()});
                        map.push(oParent);
                    }
                    if(sufficientTypeAttributes[ch.key()]){
                        gotImplicitPart = true;
                    }
                    implicitPart.push(ch);
                }
            }
        }
        if(implicitPart.length==0||(explicitCh==null&&otherMediaTypes.length==0)){
            return false;
        }
        if(!gotImplicitPart) {
            return;
        }
        for(let ch of implicitPart){
            bodyNode.removeChild(ch);
        }
        if(explicitCh==null){
            let oNode = referencePatcher.toOriginal(bodyNode);
            let mapping = yaml.newMapping(yaml.newScalar(defaultMediaType),yaml.newMap([]));
            let newNode = new jsyaml.ASTNode(mapping,oNode.unit(),<jsyaml.ASTNode>oNode,null,null);
            explicitCh = bodyNode.replaceChild(null,newNode);
        }
        explicitCh.patchAdoptedNodes(newAdopted);
        return true;
    }

    private collectResourceData(
        original:RamlWrapper.Resource|RamlWrapper08.Resource,
        obj:RamlWrapper.Resource|RamlWrapper.ResourceType|RamlWrapper08.Resource|RamlWrapper08.ResourceType,
        arr:ResourceGenericData[] = [],
        transformer?:ValueTransformer,
        nodesChain:hl.IParseResult[]=[],
        occuredResourceTypes:{[key:string]:boolean}={}):ResourceGenericData[]
        
    {
        nodesChain = nodesChain.concat([obj.highLevel()]);
        var ownTraits = this.extractTraits(obj,transformer,nodesChain);

        var methodTraitsMap:{[key:string]:GenericData[]} = {};
        var methods:(RamlWrapper.Method|RamlWrapper08.Method)[] = obj.methods();
        methods.forEach(x=>{
            var methodTraits = this.extractTraits(x,transformer,nodesChain);
            if(methodTraits&&methodTraits.length>0){
                methodTraitsMap[x.method()] = methodTraits;
            }
        });

        var rtData:GenericData;
        var rtRef:RamlWrapper.ResourceTypeRef|RamlWrapper08.ResourceTypeRef = obj.type();
        if(rtRef!=null) {
            var units = toUnits1(nodesChain);
            rtData = this.readGenerictData(original, rtRef, obj.highLevel(), 'resource type', transformer, units);
        }

        var result = {
            resourceType:rtData,
            traits:ownTraits,
            methodTraits:methodTraitsMap
        };
        arr.push(result);

        if(rtData) {
            var rt = <RamlWrapper.ResourceType|RamlWrapper08.ResourceType>rtData.node;
            var qName = hlimpl.qName(rt.highLevel(),original.highLevel());
            if(!occuredResourceTypes[qName]) {
                occuredResourceTypes[qName] = true;
                this.collectResourceData(
                    original, rt, arr, rtData.transformer, nodesChain, occuredResourceTypes);
            }
            else{
                result.resourceType = null;
            }
        }
        return arr;
    }

    private extractTraits(obj:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper.Resource|RamlWrapper.Method
        |RamlWrapper08.ResourceType|RamlWrapper08.Resource|RamlWrapper08.Method,
                  _transformer:ValueTransformer,
                  nodesChain:hl.IParseResult[],
                  occuredTraits:{[key:string]:boolean} = {}):GenericData[]
    {
        nodesChain = nodesChain.concat([obj.highLevel()]);
        var arr:GenericData[] = [];
        for (var i = -1; i < arr.length ; i++){

            var gd:GenericData = i < 0 ? null : arr[i];
            var _obj = gd ? gd.node : obj;
            var units = gd ? gd.unitsChain : toUnits1(nodesChain);
            var transformer:ValueTransformer = gd ? gd.transformer : _transformer;

            if(!_obj['is']){
                continue;
            }
            (<any>_obj).is().forEach(x=> {
                var unitsChain = toUnits2(units,x.highLevel());
                var traitData = this.readGenerictData(obj,
                    x, _obj.highLevel(), 'trait', transformer,unitsChain);

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

    private readGenerictData(r:core.BasicNode,obj:RamlWrapper.TraitRef|RamlWrapper.ResourceTypeRef|RamlWrapper08.TraitRef|RamlWrapper08.ResourceTypeRef,
                     context:hl.IHighLevelNode,
                     template:string,
                     transformer:ValueTransformer,
                     unitsChain:ll.ICompilationUnit[]=[]):GenericData {

        var value = <any>obj.value();
        var propName = pluralize.plural(changeCase.camelCase(template));
        if (typeof(value) == 'string') {
            if (transformer) {
                value = transformer.transform(value).value;
            }
            var _node = referencePatcher.getDeclaration(value,propName,unitsChain);
            if (_node) {
                var node = <any>_node.wrapperNode();
                return {
                    name: value,
                    transformer: null,
                    parentTransformer: transformer,
                    node: node,
                    ref:obj,
                    unitsChain: unitsChain
                };
            }
        }
        else if (hlimpl.StructuredValue.isInstance(value)) {
            var sv = <hlimpl.StructuredValue>value;
            var name = sv.valueName();
            if (transformer) {
                name = transformer.transform(name).value;
            }
            var scalarParams:{[key:string]:string} = {};
            var structuredParams:{[key:string]:ll.ILowLevelASTNode} = {};

            var _node = referencePatcher.getDeclaration(name,propName,unitsChain);
            if (_node) {
                var node = <any>_node.wrapperNode();
                if (this.ramlVersion == 'RAML08') {
                    sv.children().forEach(x=>scalarParams[x.valueName()] = x.lowLevel().value());
                }
                else {
                    sv.children().forEach(x=>{
                        var llNode = x.lowLevel();
                        if(llNode.resolvedValueKind()==yaml.Kind.SCALAR) {
                            scalarParams[x.valueName()] = llNode.value();
                        }
                        else{
                            structuredParams[x.valueName()] = llNode;
                        }
                    });
                } 
                var ds=new DefaultTransformer(<any>r,null,unitsChain);
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
                var valTransformer = new ValueTransformer(template, name, unitsChain, scalarParams, structuredParams,transformer);
                var resourceTypeTransformer = new DefaultTransformer(null,valTransformer,unitsChain);
                return {
                    name: name,
                    transformer: resourceTypeTransformer,
                    parentTransformer: transformer,
                    node: node,
                    ref:obj,
                    unitsChain: unitsChain
                };
            }
        }
        return null;
    }
}

export class LibraryExpander{

    expandLibraries(_api:RamlWrapper.Api):RamlWrapper.Api{
        var api = _api;
        if(api==null){
            return null;
        }
        if(proxy.LowLevelCompositeNode.isInstance(api.highLevel().lowLevel())){
            api = <RamlWrapper.Api>api.highLevel().lowLevel().unit().highLevel().asElement().wrapperNode();            
        }
        var expander = new TraitsAndResourceTypesExpander();
        var rp = new referencePatcher.ReferencePatcher();
        var hlNode:hl.IHighLevelNode = expander.createHighLevelNode(api.highLevel(),true,rp,true);

        var result = <RamlWrapper.Api>expander.expandHighLevelNode(hlNode, rp, <any>api);
        this.processNode(rp,result.highLevel());
        return result;
    }

    expandLibrary(_lib:RamlWrapper.Library):RamlWrapper.Library{
        let lib = _lib;
        if(lib==null){
            return null;
        }
        if(proxy.LowLevelCompositeNode.isInstance(lib.highLevel().lowLevel())){
            lib = <RamlWrapper.Library>lib.highLevel().lowLevel().unit().highLevel().asElement().wrapperNode();
        }
        let expander = new TraitsAndResourceTypesExpander();
        let rp = new referencePatcher.ReferencePatcher();
        let hlNode:hl.IHighLevelNode = expander.createHighLevelNode(lib.highLevel(),true,rp,true);
        rp.process(hlNode);
        rp.expandLibraries(hlNode);
        let result = <RamlWrapper.Library>hlNode.wrapperNode();
        return result;
    }
    
    processNode(rp:referencePatcher.ReferencePatcher, hlNode:hl.IHighLevelNode){
        if(hlNode==null){
            return;
        }
        var master = <hl.IHighLevelNode>(<hlimpl.ASTNodeImpl>hlNode).getMaster();
        this.processNode(rp,master);
        if(universeHelpers.isOverlayType(hlNode.definition())){
            rp.process(hlNode);
        }
        rp.expandLibraries(hlNode);
    }
}

function toUnits1(nodes:hl.IParseResult[]):ll.ICompilationUnit[]{
    var result:ll.ICompilationUnit[] = [];
    for(var n of nodes){
        toUnits2(result,n,true);
    }
    return result;
}
function toUnits2(chainStart:ll.ICompilationUnit[], node:hl.IParseResult, append:boolean=false):ll.ICompilationUnit[]{

    var result = append ? chainStart : chainStart.concat([]);
    var unit = node.lowLevel().unit();
    if(unit==null){
        return result;
    }
    if(result.length==0){
        result.push(unit);
    }
    else{
        var prevPath = result[result.length-1].absolutePath();
        if(unit.absolutePath()!=prevPath){
            result.push(unit);
        }
    }
    return result;
}

export function toUnits(node:hl.IParseResult):ll.ICompilationUnit[]{
    var nodes:hl.IParseResult[] = [];
    while(node){
        nodes.push(node);
        node = node.parent();
    }
    return toUnits1(nodes);
}

class TransformMatches {
    name: string;

    regexp: RegExp;

    static leftTransformRegexp: RegExp = /\s*!\s*/;
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

export function getTransformersForOccurence(occurence: string) {
    var result = [];
    
    var functions = occurence.split("|").slice(1);
    for(var f of functions) {
        for (var i = 0; i < transformers.length; i++) {
            if (f.match(transformers[i].regexp)) {
                result.push(transformers[i].transformer);
                break;
            }
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
        public unitsChain: ll.ICompilationUnit[],
        public params?:{[key:string]:string},
        public structuredParams?:{[key:string]:ll.ILowLevelASTNode},
        public vDelegate?:ValueTransformer){
    }

    transform(
        obj:any,
        toString?:boolean,
        doBreak?:()=>boolean,
        callback?:(obj:any,transformer:DefaultTransformer)=>any){

        var undefParams:{[key:string]:boolean} = {};

        var errors:hl.ValidationIssue[] = [];
        if(typeof(obj)==='string'){
            if(this.structuredParams&&util.stringStartsWith(obj,"<<")&&util.stringEndsWith(obj,">>")){
                var paramName = obj.substring(2,obj.length-2);
                var structuredValue = this.structuredParams[paramName];
                if(structuredValue!=null){
                   return { value:structuredValue, errors: errors };
                }
            }
            var str:string = <string>obj;
            var buf = new TransformationBuffer();
            var prev = 0;
            for(var i = str.indexOf('<<'); i >=0 ; i = str.indexOf('<<',prev)){
                buf.append(str.substring(prev,i));
                var i0 = i;
                i += '<<'.length;
                prev = this.paramUpperBound(str, i);
                if (prev==-1){
                    break;
                }
                var paramOccurence = str.substring(i,prev);
                prev += '>>'.length;

                var originalString = str.substring(i0,prev);

                var val;
                var paramName;

                var transformers = getTransformersForOccurence(paramOccurence);

                if(transformers.length>0) {
                    var ind = paramOccurence.indexOf('|');
                    paramName = paramOccurence.substring(0,ind).trim();
                    val = this.params[paramName];
                    if(val && typeof(val) == "string" && val.indexOf("<<")>=0&&this.vDelegate){
                        val = this.vDelegate.transform(val,toString,doBreak,callback).value;
                    }
                    if(val) {
                        if(referencePatcher.PatchedReference.isInstance(val)){
                            val = (<referencePatcher.PatchedReference>val).value();
                        }
                        for(var tr of transformers) {
                            val = tr(val + '');
                        }
                    }
                } else {
                    paramName = paramOccurence.trim();
                    val = this.params[paramName];
                    if(val && typeof(val) == "string" && val.indexOf("<<")>=0&&this.vDelegate){
                        val = this.vDelegate.transform(val,toString,doBreak,callback).value;
                    }
                }

                if(val===null||val===undefined){
                    undefParams[paramName] = true;
                    val = originalString;
                }
                buf.append(val);
            }

            // var upArr = Object.keys(undefParams);
            // if(upArr.length>0){
            //     var errStr = upArr.join(', ').trim();
            //     var message = `Undefined ${this.templateKind} parameter${upArr.length>1?'s':''}: ${errStr}`;
            //     var error = {
            //         code: hl.IssueCode.MISSING_REQUIRED_PROPERTY,
            //         isWarning: false,
            //         message: message,
            //         node: null,
            //         start: -1,
            //         end: -1,
            //         path: null
            //     }
            //     errors.push(error);
            // }
            buf.append(str.substring(prev,str.length));
            return { value:buf.value(), errors: errors };
        }
        else{
            return { value:obj, errors: errors };
        }
    }

    private paramUpperBound(str:string, pos:number) {
        var count = 0;
        for(var i = pos; i < str.length ;i ++){
            if(util.stringStartsWith(str,"<<",i)){
                count++;
                i++;
            }
            else if(util.stringStartsWith(str,">>",i)){
                if(count==0){
                    return i;
                }
                count--;
                i++;
            }
        }
        return str.length;
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

    anchorValueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        var substitution = this.substitutionNode(node);
        if(substitution && substitution.valueKind()==yaml.Kind.ANCHOR_REF){
            return substitution.anchorValueKind();
        }
        return null;
    }

    resolvedValueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        var substitution = this.substitutionNode(node);
        return substitution && substitution.resolvedValueKind();
    }

    includePath(node:ll.ILowLevelASTNode):string{
        var substitution = this.substitutionNode(node);
        if(substitution){
            return substitution.includePath();
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

    definingUnitSequence(str:string){
        if(str.length<2){
            return null;
        }
        if(str.charAt(0)=="("&&str.charAt(str.length-1)==")"){
            str = str.substring(1,str.length-1);
        }
        if(str.length<4){
            return null;
        }
        if(str.substring(0,2)!="<<"){
            return null;
        }
        if(str.substring(str.length-2,str.length)!=">>"){
            return null;
        }
        let _str = str.substring(2,str.length-2);
        if(_str.indexOf("<<")>=0||_str.indexOf(">>")>=0){
            return null;
        }
        return this._definingUnitSequence(_str);
    }

    _definingUnitSequence(str:string):ll.ICompilationUnit[]{

        if(this.params && this.params[str]){
            return this.unitsChain;
        }
        if(this.vDelegate){
            return this.vDelegate._definingUnitSequence(str);
        }
        return null;
    }
}

export class DefaultTransformer extends ValueTransformer{

    constructor(
        owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase,
        delegate: ValueTransformer,
        unitsChain:ll.ICompilationUnit[]
    ){
        super(delegate!=null?delegate.templateKind:"",delegate!=null?delegate.templateName:"",unitsChain);
        this.owner = owner;
        this.delegate = delegate;
    }

    owner:RamlWrapper.ResourceBase|RamlWrapper.MethodBase|RamlWrapper08.Resource|RamlWrapper08.MethodBase;

    delegate:ValueTransformer;

    transform(
        obj:any,
        toString?:boolean,
        doContinue?:()=>boolean,
        callback?:(obj:any,transformer:DefaultTransformer)=>any){

        if(obj==null||(doContinue!=null&&!doContinue())){
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
            ownResult = super.transform(obj,toString,doContinue,callback);
        }
        var result = this.delegate != null
            ? this.delegate.transform(ownResult.value,toString,doContinue,callback)
            : ownResult.value;
        if(doContinue!=null&&doContinue()&&callback!=null){
            result.value = callback(result.value,this);
        }
        return result;
    }

    private initParams(){

        var methodName:string;
        var resourcePath:string = "";
        var resourcePathName:string;
        var ll=this.owner.highLevel().lowLevel();
        var node = ll;
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

    includePath(node:ll.ILowLevelASTNode):string{
        return this.delegate != null ? this.delegate.includePath(node) : null;
    }

    anchorValueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        return this.delegate != null ? this.delegate.anchorValueKind(node) : null;
    }

    resolvedValueKind(node:ll.ILowLevelASTNode):yaml.Kind{
        return this.delegate != null ? this.delegate.resolvedValueKind(node) : null;
    }

    _definingUnitSequence(str:string):ll.ICompilationUnit[]{

        if(this.params && this.params[str]){
            return this.unitsChain;
        }
        if(this.delegate){
            return this.delegate._definingUnitSequence(str);
        }
        return null;
    }

}

interface GenericData{

    node:RamlWrapper.Trait|RamlWrapper.ResourceType|RamlWrapper.Resource|RamlWrapper.Method
        |RamlWrapper08.Trait|RamlWrapper08.ResourceType|RamlWrapper08.Resource|RamlWrapper08.Method;
    
    ref:RamlWrapper.TraitRef|RamlWrapper.ResourceTypeRef|RamlWrapper08.TraitRef|RamlWrapper08.ResourceTypeRef;

    name:string;

    transformer:DefaultTransformer;

    parentTransformer:ValueTransformer;

    unitsChain:ll.ICompilationUnit[];
}

interface ResourceGenericData{

    resourceType:GenericData

    traits:GenericData[]

    methodTraits:{[key:string]:GenericData[]}
}

var defaultParameters = [ 'resourcePath', 'resourcePathName', 'methodName' ];

const sufficientTypeAttributes:any = {};
sufficientTypeAttributes[def.universesInfo.Universe10.TypeDeclaration.properties.type.name] = true;
sufficientTypeAttributes[def.universesInfo.Universe10.TypeDeclaration.properties.example.name] = true;
sufficientTypeAttributes[def.universesInfo.Universe08.BodyLike.properties.schema.name] = true;
sufficientTypeAttributes[def.universesInfo.Universe10.ObjectTypeDeclaration.properties.properties.name] = true;

export function parseMediaType(str:string){
    if (!str){
        return null;
    }
    if (str == "*/*") {
        return null;
    }
    if (str.indexOf("/*")==str.length-2){
        str=str.substring(0,str.length-2)+"/xxx";
    }
    return mediaTypeParser.parse(str);
}