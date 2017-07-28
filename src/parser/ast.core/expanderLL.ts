/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST");
import jsyaml = require("../jsyaml/jsyaml2lowLevel");
import hl=require("../highLevelAST");
import hlimpl=require("../highLevelImpl");
import yaml=require("yaml-ast-parser");
import util=require("../../util/index");
import proxy=require("./LowLevelASTProxy");
import RamlWrapper=require("../artifacts/raml10parserapi");
import pluralize = require("pluralize")
import _ = require("underscore");
import core = require("../wrapped-ast/parserCore");
import referencePatcher = require("./referencePatcherLL");
import referencePatcherHL = require("./referencePatcher");
import namespaceResolver = require("./namespaceResolver");
import def = require("raml-definition-system");
import universeHelpers = require("../tools/universeHelpers");
import linter=require("../ast.core/linter")
let messageRegistry = require("../../../resources/errorMessages");
var mediaTypeParser = require("media-typer");

var changeCase = require('change-case');

export function expandTraitsAndResourceTypes<T>(api:T):T{

    if(!core.BasicNodeImpl.isInstance(api)){
        // if(!((<any>api).kind
        //     && ((<any>api).kind() == "Api" || (<any>api).kind() == "Overlay" || (<any>api).kind() == "Extension"))){
        return null;
    }
    var apiNode = <core.BasicNodeImpl><any>api;
    var hlNode = expandTraitsAndResourceTypesHL(apiNode.highLevel());
    if(!hlNode){
        return null;
    }
    var result = <core.BasicNodeImpl>hlNode.wrapperNode();
    result.setAttributeDefaults(apiNode.getDefaultsCalculator().isEnabled());
    return <T><any>result;
}

export function expandTraitsAndResourceTypesHL(api:hl.IHighLevelNode):hl.IHighLevelNode{
    if(api==null){
        return null;
    }
    var definition = api.definition();
    if(!(definition&&universeHelpers.isApiSibling(definition))){
        return null;
    }
    var result = new TraitsAndResourceTypesExpander().expandTraitsAndResourceTypes(api);
    return result;
}

export function expandLibraries(api:RamlWrapper.Api):RamlWrapper.Api{
    if(!api){
        return null;
    }
    var hlNode = expandLibrariesHL(api.highLevel());
    if(!hlNode){
        return null;
    }
    var result = <RamlWrapper.Api>hlNode.wrapperNode();
    (<any>result).setAttributeDefaults((<any>api).getDefaultsCalculator().isEnabled());
    return result;
}

export function expandLibrary(lib:RamlWrapper.Library):RamlWrapper.Library{
    if(!lib){
        return null;
    }
    var hlNode = expandLibraryHL(lib.highLevel());
    if(!hlNode){
        return null;
    }
    var result = <RamlWrapper.Library>hlNode.wrapperNode();
    (<any>result).setAttributeDefaults((<any>lib).getDefaultsCalculator().isEnabled());
    return result;
}

export function expandLibrariesHL(api:hl.IHighLevelNode):hl.IHighLevelNode{
    return new LibraryExpander().expandLibraries(api);
}

export function expandLibraryHL(lib:hl.IHighLevelNode):hl.IHighLevelNode{
    return new LibraryExpander().expandLibrary(lib);
}

export function mergeAPIs(masterUnit:ll.ICompilationUnit, extensionsAndOverlays:ll.ICompilationUnit[],
                          mergeMode: hlimpl.OverlayMergeMode) : hl.IHighLevelNode {
    var masterApi = hlimpl.fromUnit(masterUnit);
    if(!masterApi) throw new Error("couldn't load api from " + masterUnit.absolutePath());

    if (!extensionsAndOverlays || extensionsAndOverlays.length == 0) {
        return masterApi.asElement();
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

    var lastExtensionOrOverlay = mergeHighLevelNodes(masterApi.asElement(), highLevelNodes, mergeMode);
    return lastExtensionOrOverlay;
}

function mergeHighLevelNodes(
    masterApi:hl.IHighLevelNode,
    highLevelNodes:hl.IHighLevelNode[],
    mergeMode,
    rp:referencePatcher.ReferencePatcher = null,
    expand = false):hl.IHighLevelNode {

    var expander:TraitsAndResourceTypesExpander;
    var currentMaster = masterApi;
    for(var currentApi of highLevelNodes) {



        if(expand&&(proxy.LowLevelProxyNode.isInstance(currentMaster.lowLevel()))) {
            if(!expander){
                expander = new TraitsAndResourceTypesExpander();
            }
            expander.expandHighLevelNode(currentMaster, rp, masterApi,expand);
        }
        (<hlimpl.ASTNodeImpl>currentApi).overrideMaster(currentMaster);
        (<hlimpl.ASTNodeImpl>currentApi).setMergeMode(mergeMode);

        currentMaster = currentApi;
    }
    return currentMaster;
};


export class TraitsAndResourceTypesExpander {

    private ramlVersion:string;

    private defaultMediaType:string;

    private namespaceResolver:namespaceResolver.NamespaceResolver;

    expandTraitsAndResourceTypes(
        api:hl.IHighLevelNode,
        rp:referencePatcher.ReferencePatcher = null,
        forceProxy:boolean=false):hl.IHighLevelNode {

        this.init(api);

        var llNode = api.lowLevel();
        if(!llNode) {
            return api;
        }
        if(llNode.actual().libExpanded){
            return api;
        }

        var hlNode = this.createHighLevelNode(<hlimpl.ASTNodeImpl>api,false,rp);
        if (api.definition().key()==def.universesInfo.Universe10.Overlay){
            return hlNode;
        }
        let unit = api.lowLevel().unit();
        var hasFragments = (<jsyaml.Project>unit.project()).namespaceResolver().hasFragments(unit);
        var result = this.expandHighLevelNode(hlNode, rp, api,hasFragments);
        if (!result){
            return api;
        }
        return result;
    }

    init(api:hl.IHighLevelNode) {
        let llNode = api.lowLevel();
        let firstLine = hlimpl.ramlFirstLine(llNode.unit().contents());
        if(firstLine && firstLine.length >= 2 && firstLine[1]=="0.8"){
            this.ramlVersion = "RAML08";
        }
        else{
            this.ramlVersion = "RAML10";
        }
        let mediaTypeNodes = llNode.children().filter(x=>
            x.key()==def.universesInfo.Universe10.Api.properties.mediaType.name);

        if(mediaTypeNodes.length>0) {
            this.defaultMediaType = mediaTypeNodes[0].value();
        }

        let unit = api.lowLevel().unit();
        let project = <jsyaml.Project>unit.project();
        project.setMainUnitPath(unit.absolutePath());
        this.namespaceResolver = (<jsyaml.Project>project).namespaceResolver();
    }

    expandHighLevelNode(
        hlNode:hl.IHighLevelNode,
        rp:referencePatcher.ReferencePatcher,
        api:hl.IHighLevelNode,
        forceExpand=false) {

        this.init(hlNode);

        (<hlimpl.ASTNodeImpl>hlNode).setMergeMode((<hlimpl.ASTNodeImpl>api).getMergeMode());

        var templateApplied = false;
        var llNode = hlNode.lowLevel();
        if(proxy.LowLevelCompositeNode.isInstance(llNode)) {
            var resources = extractResources(llNode);
            resources.forEach(x=> templateApplied = this.processResource(x) || templateApplied);
        }
        if(!(templateApplied||forceExpand||hlNode.getMaster()!=null)){
            return null;
        }
        if(hlimpl.ASTNodeImpl.isInstance(hlNode)) {
            var hnode = <hlimpl.ASTNodeImpl>hlNode;
            if(hnode.reusedNode()!=null) {
                hnode.setReuseMode(true);
            }
        }
        if (this.ramlVersion=="RAML10") {
            rp = rp || new referencePatcher.ReferencePatcher();
            rp.process(llNode);
            llNode.actual().referencePatcher = rp;
        }
        return hlNode;
    }

    // private getTemplate<T extends core.BasicNode>(
    //     name:string,
    //     context:hl.IHighLevelNode,
    //     cache:{[key:string]:{[key:string]:T}},
    //     globalList:T[]):T{
    //
    //     var unitPath = context.lowLevel().unit().path();
    //     var unitCache = cache[unitPath];
    //     if(!unitCache){
    //         unitCache = {};
    //         cache[unitPath] = unitCache;
    //     }
    //     var val = unitCache[name];
    //
    //     if(val!==undefined){
    //         return val;
    //     }
    //     val = null;
    //     val = _.find(globalList,x=>hlimpl.qName(x.highLevel(),context)==name);
    //     if(!val){
    //         val = null;
    //     }
    //     unitCache[name] = val;
    //     return val;
    // }

    public createHighLevelNode(
        _api:hl.IHighLevelNode,
        merge:boolean=true,
        rp:referencePatcher.ReferencePatcher = null,
        forceProxy=false,
        doInit=true):hl.IHighLevelNode {

        if(doInit) {
            this.init(_api);
        }

        var api = <hlimpl.ASTNodeImpl>_api;
        var highLevelNodes:hlimpl.ASTNodeImpl[] = [];

        var node = api;
        while(node) {

            var llNode:ll.ILowLevelASTNode = node.lowLevel();
            var topComposite:ll.ILowLevelASTNode;
            var fLine = hlimpl.ramlFirstLine(llNode.unit().contents());
            if ((fLine && (fLine.length<3 || fLine[2] != def.universesInfo.Universe10.Overlay.name)) || forceProxy){
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
            var extNode = _.find(llNode.children(),x=>x.key()==def.universesInfo.Universe10.Overlay.properties.extends.name);
            if(extNode){}
            node = <hlimpl.ASTNodeImpl>node.getMaster();
        }
        var masterApi = highLevelNodes.pop();
        highLevelNodes = highLevelNodes.reverse();
        var mergeMode = api.getMergeMode();
        var result = mergeHighLevelNodes(masterApi,highLevelNodes, mergeMode, rp, forceProxy);
        (<hlimpl.ASTNodeImpl>result).setReusedNode(api.reusedNode());
        return result;
    }

    private processResource(resource:proxy.LowLevelCompositeNode,_nodes:ll.ILowLevelASTNode[]=[]):boolean {
        var result = false;
        var nodes = _nodes.concat(resource);

        var resourceData:ResourceGenericData[] = this.collectResourceData(resource,resource,undefined,undefined,nodes);

        if(!proxy.LowLevelProxyNode.isInstance(resource)){
            return result;
        }
        resource.preserveAnnotations();
        resource.takeOnlyOriginalChildrenWithKey(
            def.universesInfo.Universe10.ResourceBase.properties.type.name);
        resource.takeOnlyOriginalChildrenWithKey(
            def.universesInfo.Universe10.FragmentDeclaration.properties.uses.name);
        resourceData.filter(x=>x.resourceType!=null).forEach(x=> {
            var resourceTypeLowLevel = <proxy.LowLevelCompositeNode>x.resourceType.node;
            var resourceTypeTransformer = x.resourceType.transformer;
            resourceTypeTransformer.owner = resource;
            resource.adopt(resourceTypeLowLevel, resourceTypeTransformer);
            result = true;
        });

        let methods = resource.children().filter(x=>isPossibleMethodName(x.key()));
        for(var m of methods){
            let name = m.key();
            m.takeOnlyOriginalChildrenWithKey(
                def.universesInfo.Universe10.FragmentDeclaration.properties.uses.name);

            var allTraits:GenericData[]=[]
            resourceData.forEach(x=>{

                var methodTraits = x.methodTraits[name];
                if(methodTraits){
                    allTraits = allTraits.concat(methodTraits);
                    methodTraits.forEach(x=>{
                        var traitLowLevel = x.node;
                        var traitTransformer = x.transformer;
                        traitTransformer.owner = m;
                        m.adopt(traitLowLevel,traitTransformer);
                        result = true;
                    });
                } else {

                }

                var resourceTraits = x.traits;
                if(resourceTraits){
                    allTraits = allTraits.concat(resourceTraits);
                    resourceTraits.forEach(x=> {
                        var traitLowLevel = x.node;
                        var traitTransformer = x.transformer;
                        traitTransformer.owner = m;
                        m.adopt(traitLowLevel, traitTransformer);
                        result = true;
                    });
                }
            });
            // if(resource.definition().universe().version()=="RAML10") {
            //     this.appendTraitReferences(m, allTraits);
            // }
        };

        var resources = extractResources(resource);
        resources.forEach(x=>result = this.processResource(x,nodes) || result);
        methods.forEach(x=>this.mergeBodiesForMethod(x));
        return result;
    }

    private mergeBodiesForMethod(method: proxy.LowLevelCompositeNode) {
        let llNode = method;
        if (!proxy.LowLevelCompositeNode.isInstance(llNode)) {
            return;
        }

        if (this.defaultMediaType == null) {
            return;
        }
        let bodyNode: proxy.LowLevelCompositeNode;
        let bodyNodesArray: proxy.LowLevelCompositeNode[] = [];
        let llChildren = llNode.children();
        for(var ch of llChildren){
            if(ch.key()==def.universesInfo.Universe10.Method.properties.body.name){
                bodyNode = ch;
            }
            else if(ch.key()==def.universesInfo.Universe10.Method.properties.responses.name){
                let responses = ch.children();
                for(var response of responses){
                    let responseChildren = response.children();
                    for(var respCh of responseChildren){
                        if(respCh.key()==def.universesInfo.Universe10.Response.properties.body.name){
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
            this.mergeBodies(n);
        }
    }

    private mergeBodies(bodyNode:proxy.LowLevelCompositeNode):boolean{
        let explicitCh:proxy.LowLevelCompositeNode;
        let implicitPart:proxy.LowLevelCompositeNode[] = [],
            otherMediaTypes:proxy.LowLevelCompositeNode[] = [];

        let newAdopted:{node:ll.ILowLevelASTNode,transformer:proxy.ValueTransformer}[] = [];
        let map:ll.ILowLevelASTNode[] = [];
        let gotImplicitPart = false;
        for(let ch of bodyNode.children()){
            let key = ch.key();
            if(key==this.defaultMediaType){
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
            let mapping = yaml.newMapping(yaml.newScalar(this.defaultMediaType),yaml.newMap([]));
            let newNode = new jsyaml.ASTNode(mapping,oNode.unit(),<jsyaml.ASTNode>oNode,null,null);
            explicitCh = bodyNode.replaceChild(null,newNode);
        }
        explicitCh.patchAdoptedNodes(newAdopted);
        return true;
    }

    private collectResourceData(
        original:ll.ILowLevelASTNode,
        obj:ll.ILowLevelASTNode,
        arr:ResourceGenericData[] = [],
        transformer?:ValueTransformer,
        nodesChain:ll.ILowLevelASTNode[]=[],
        occuredResourceTypes:{[key:string]:boolean}={}):ResourceGenericData[]

    {
        nodesChain = nodesChain.concat([obj]);
        var ownTraits = this.extractTraits(obj,transformer,nodesChain);

        var methodTraitsMap:{[key:string]:GenericData[]} = {};
        for(var ch of obj.children()) {

            var mName = ch.key();
            if(!isPossibleMethodName(mName)){
                continue;
            }
            var methodTraits = this.extractTraits(ch, transformer, nodesChain);
            if (methodTraits && methodTraits.length > 0) {
                methodTraitsMap[mName] = methodTraits;
            }
        }

        var rtData:GenericData;
        var rtRef = _.find(obj.children(),x=>x.key()==def.universesInfo.Universe10.ResourceBase.properties.type.name);
        if(rtRef!=null) {
            var units = toUnits1(nodesChain);
            if(rtRef.valueKind() == yaml.Kind.SCALAR){
                rtRef = jsyaml.createScalar(rtRef.value());
            }
            rtData = this.readGenerictData(original, rtRef, obj, 'resource type', transformer, units);
        }

        var result = {
            resourceType:rtData,
            traits:ownTraits,
            methodTraits:methodTraitsMap
        };
        arr.push(result);

        if(rtData) {
            var rt = rtData.node;
            var qName = rt.key() + "/" + rt.unit().absolutePath();
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

    private extractTraits(obj:ll.ILowLevelASTNode,
                          _transformer:ValueTransformer,
                          nodesChain:ll.ILowLevelASTNode[],
                          occuredTraits:{[key:string]:boolean} = {}):GenericData[]
    {
        nodesChain = nodesChain.concat([obj]);
        var arr:GenericData[] = [];
        for (var i = -1; i < arr.length ; i++){

            var gd:GenericData = i < 0 ? null : arr[i];
            var _obj = gd ? gd.node : obj;
            var units = gd ? gd.unitsChain : toUnits1(nodesChain);
            var transformer:ValueTransformer = gd ? gd.transformer : _transformer;

            for(var x of _obj.children().filter(x=>x.key()==def.universesInfo.Universe10.MethodBase.properties.is.name)){
                for(var y of x.children()){
                    var unitsChain = toUnits2(units, y);
                    var traitData = this.readGenerictData(obj,
                        y, _obj, 'trait', transformer, unitsChain);

                    if (traitData) {
                        var name = traitData.name;
                        //if (!occuredTraits[name]) {
                        occuredTraits[name] = true;
                        arr.push(traitData);
                        //}
                    }
                }
            };
        }
        return arr;
    }

    private readGenerictData(r:ll.ILowLevelASTNode,obj:ll.ILowLevelASTNode,
                             context:ll.ILowLevelASTNode,
                             template:string,
                             transformer:ValueTransformer,
                             unitsChain:ll.ICompilationUnit[]=[]):GenericData {

        let value = <any>obj.value();
        if(!value){
            return;
        }
        let name:string;
        let propName = pluralize.plural(changeCase.camelCase(template));
        let hasParams = false;
        if (typeof(value) == 'string') {
            name = value;
        }
        else if(jsyaml.ASTNode.isInstance(value)||proxy.LowLevelProxyNode.isInstance(value)) {
            hasParams = true;
            name = (<ll.ILowLevelASTNode>value).key();
        }
        else{
            return null;
        }
        if(!name){
            return null;
        }

        if (transformer) {
            name = transformer.transform(name).value;
        }
        let scalarParamValues:{[key:string]:string} = {};
        let scalarParams:{[key:string]:ll.ILowLevelASTNode} = {};
        let structuredParams:{[key:string]:ll.ILowLevelASTNode} = {};

        let node = getDeclaration(name, propName, this.namespaceResolver, unitsChain);
        if (node) {
            let ds = new DefaultTransformer(<any>r, null, unitsChain);
            if (hasParams) {
                if (this.ramlVersion == 'RAML08') {
                    value.children().forEach(x=>scalarParamValues[x.key()] = x.value());
                }
                else {
                    for(let x of value.children()){
                        let llNode = referencePatcher.toOriginal(x);
                        if (x.resolvedValueKind() == yaml.Kind.SCALAR) {
                            scalarParamValues[x.key()] = llNode.value();
                            scalarParams[x.key()] = llNode;
                        }
                        else {
                            structuredParams[x.key()] = llNode;
                        }
                    };
                }
                Object.keys(scalarParamValues).forEach(x=> {
                    let q = ds.transform(scalarParamValues[x]);
                    //if (q.value){
                    if (q) {
                        if (typeof q !== "object") {
                            scalarParamValues[x] = q;
                        }
                    }
                    //}
                });
            }


            let valTransformer = new ValueTransformer(
                template, name, unitsChain, scalarParamValues, scalarParams, structuredParams, transformer);
            let resourceTypeTransformer = new DefaultTransformer(null, valTransformer, unitsChain);
            return {
                name: name,
                transformer: resourceTypeTransformer,
                parentTransformer: transformer,
                node: node,
                ref: obj,
                unitsChain: unitsChain
            };
        }

        return null;
    }
    //
    // private appendTraitReferences(
    //     m:hl.IHighLevelNode,
    //     traits:GenericData[]){
    //
    //     if(traits.length==0){
    //         return;
    //     }
    //
    //     var traitsData = traits.map(x=>{
    //         return {
    //             node: x.ref.lowLevel(),
    //             transformer: x.parentTransformer
    //         };
    //     });
    //     referencePatcher.patchMethodIs(m,traitsData);
    // }
}

export class LibraryExpander{

    expandLibraries(_api:hl.IHighLevelNode):hl.IHighLevelNode{
        var api = _api;
        if(api==null){
            return null;
        }
        if(proxy.LowLevelCompositeNode.isInstance(api.lowLevel())){
            api = api.lowLevel().unit().highLevel().asElement();
        }
        var expander = new TraitsAndResourceTypesExpander();
        var rp = new referencePatcher.ReferencePatcher();
        var hlNode:hl.IHighLevelNode = expander.createHighLevelNode(api,true,rp,true);
        var result = expander.expandHighLevelNode(hlNode, rp, api,true);
        this.processNode(rp,result);
        return result;
    }

    expandLibrary(_lib:hl.IHighLevelNode):hl.IHighLevelNode{
        let lib = _lib;
        if(lib==null){
            return null;
        }
        if(proxy.LowLevelCompositeNode.isInstance(lib.lowLevel())){
            lib = lib.lowLevel().unit().highLevel().asElement();
        }
        let expander = new TraitsAndResourceTypesExpander();
        let rp = new referencePatcher.ReferencePatcher();
        let hlNode:hl.IHighLevelNode = expander.createHighLevelNode(lib,true,rp,true);
        let llNode = <proxy.LowLevelCompositeNode>hlNode.lowLevel();
        rp.process(llNode);
        rp.expandLibraries(llNode,true);
        return hlNode;
    }

    processNode(rp:referencePatcher.ReferencePatcher, hlNode:hl.IHighLevelNode){
        if(hlNode==null){
            return;
        }
        var master = <hl.IHighLevelNode>(<hlimpl.ASTNodeImpl>hlNode).getMaster();
        this.processNode(rp,master);
        var llNode = hlNode.lowLevel();
        var fLine = hlimpl.ramlFirstLine(llNode.unit().contents());
        if(fLine.length==3&&fLine[2]=="Overlay"){
            rp.process(llNode);
        }
        rp.expandLibraries(<proxy.LowLevelCompositeNode>llNode);
    }
}

function toUnits1(nodes:ll.ILowLevelASTNode[]):ll.ICompilationUnit[]{
    var result:ll.ICompilationUnit[] = [];
    for(var n of nodes){
        toUnits2(result,n,true);
    }
    return result;
}
function toUnits2(chainStart:ll.ICompilationUnit[], node:ll.ILowLevelASTNode, append:boolean=false):ll.ICompilationUnit[]{

    var result = append ? chainStart : chainStart.concat([]);
    var unit = node.unit();
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

export function toUnits(node:ll.ILowLevelASTNode):ll.ICompilationUnit[]{
    var nodes:ll.ILowLevelASTNode[] = [];
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
        public scalarParamValues?:{[key:string]:string},
        public scalarParams?:{[key:string]:ll.ILowLevelASTNode},
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
                let paramName = obj.substring(2,obj.length-2);
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
                let paramName:string;

                var transformers = getTransformersForOccurence(paramOccurence);

                if(transformers.length>0) {
                    var ind = paramOccurence.indexOf('|');
                    paramName = paramOccurence.substring(0,ind).trim();
                    val = this.scalarParamValues[paramName];
                    if(val && typeof(val) == "string" && val.indexOf("<<")>=0&&this.vDelegate){
                        val = this.vDelegate.transform(val,toString,doBreak,callback).value;
                    }
                    if(val) {
                        if(referencePatcherHL.PatchedReference.isInstance(val)){
                            val = (<referencePatcherHL.PatchedReference>val).value();
                        }
                        for(var tr of transformers) {
                            val = tr(val);
                        }
                    }
                } else {
                    paramName = paramOccurence.trim();
                    val = this.scalarParamValues[paramName];
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

    substitutionNode(node:ll.ILowLevelASTNode,chain:ll.ILowLevelASTNode[]=[]) {
        var paramName = this.paramName(node);
        let result = paramName && (this.scalarParams[paramName]||this.structuredParams[paramName]);
        if(!result){
            return null;
        }
        chain.push(result);
        if(this.vDelegate){
            return this.vDelegate.substitutionNode(result,chain) || result;
        }
        return result;
    }

    paramNodesChain(node:ll.ILowLevelASTNode):ll.ILowLevelASTNode[]{
        let chain:ll.ILowLevelASTNode[]=[];
        this.substitutionNode(referencePatcher.toOriginal(node),chain);
        return chain.length > 0 ? chain : null;
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

        if(this.scalarParamValues && this.scalarParamValues[str]){
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
        public owner:proxy.LowLevelCompositeNode,
        public delegate: ValueTransformer,
        unitsChain:ll.ICompilationUnit[]
    ){
        super(delegate!=null?delegate.templateKind:"",delegate!=null?delegate.templateName:"",unitsChain);
    }

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
        var ll=this.owner;
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
        this.scalarParamValues = {
            resourcePath: resourcePath,
            resourcePathName: resourcePathName
        };
        if(methodName){
            this.scalarParamValues['methodName'] = methodName;
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

    substitutionNode(node:ll.ILowLevelASTNode,chain:ll.ILowLevelASTNode[]=[]) {
        return this.delegate ? this.delegate.substitutionNode(node,chain) : null;
    }

    _definingUnitSequence(str:string):ll.ICompilationUnit[]{

        if(this.scalarParamValues && this.scalarParamValues[str]){
            return this.unitsChain;
        }
        if(this.delegate){
            return this.delegate._definingUnitSequence(str);
        }
        return null;
    }
}

interface GenericData{

    node:ll.ILowLevelASTNode;

    ref:ll.ILowLevelASTNode;

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

var possibleMethodNames;

function isPossibleMethodName(n:string){
    if(!possibleMethodNames){
        possibleMethodNames = {};
        var methodType = def.getUniverse("RAML10").type(def.universesInfo.Universe10.Method.name);
        for(var opt of methodType.property(def.universesInfo.Universe10.Method.properties.method.name).enumOptions()){
            possibleMethodNames[opt] = true;
        }
    }
    return possibleMethodNames[n];
}

function getDeclaration(
    elementName:string,
    propName:string,
    resolver:namespaceResolver.NamespaceResolver,
    _units:ll.ICompilationUnit[]):ll.ILowLevelASTNode{

    if(!elementName){
        return null;
    }

    var ns = "";
    var name = elementName;
    var ind = elementName.lastIndexOf(".");
    if(ind>=0){
        ns = elementName.substring(0,ind);
        name = elementName.substring(ind+1);
    }
    var result:ll.ILowLevelASTNode;
    var gotLibrary = false;
    var units:ll.ICompilationUnit[] = _units;
    for(var i = units.length ; i > 0 ; i--){
        var u = units[i-1];
        var fLine = hlimpl.ramlFirstLine(u.contents());
        var className = fLine && fLine.length==3 && fLine[2];
        if(className==def.universesInfo.Universe10.Library.name){
            if (gotLibrary) {
                break;
            }
            gotLibrary = true;
        }
        var actualUnit = u;
        if(ns){
            actualUnit = null;
            var map = resolver.nsMap(u);
            if(map) {
                var info = map[ns];
                if (info) {
                    actualUnit = info.unit;
                }
            }
        }
        if(!actualUnit){
            continue;
        }
        var uModel = resolver.unitModel(actualUnit);
        var c = <namespaceResolver.ElementsCollection>uModel[propName];
        if(!namespaceResolver.ElementsCollection.isInstance(c)){
            continue;
        }
        result = c.getElement(name);
        if(result){
            break;
        }
        if(i==1){
            if(className==def.universesInfo.Universe10.Extension.name ||
                className==def.universesInfo.Universe10.Overlay.name){

                let extendedUnit = namespaceResolver.extendedUnit(u);
                if(extendedUnit){
                    i++;
                    _units[0] = extendedUnit;
                }
            }
        }
    }
    return result;
}

function extractResources(llNode:proxy.LowLevelCompositeNode):proxy.LowLevelCompositeNode[] {
    var resources = llNode.children().filter(x=> {
        var key = x.key();
        return key && (key.length > 0) && (key.charAt(0) == "/");
    });
    return resources;
};


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