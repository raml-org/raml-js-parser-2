/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST");
import hl=require("../highLevelAST");
import hlimpl=require("../highLevelImpl");
import yaml=require("yaml-ast-parser");
import jsyaml=require("../jsyaml/jsyaml2lowLevel");
import json=require("../jsyaml/json2lowLevel");
import util=require("../../util/index");
import proxy=require("./LowLevelASTProxy");
import universeDef=require("../tools/universe");
import _ = require("underscore");
import universeHelpers = require("../tools/universeHelpers");
import namespaceResolver = require("./namespaceResolver");
import def = require("raml-definition-system");
import typeExpressions = def.rt.typeExpressions;
import expander=require("./expanderLL");

import referencePatcherHL = require("./referencePatcher");

var changeCase = require('change-case');

var transitionsMap:TransitionMap;

function initTransitions(){

    if(transitionsMap){
        return;
    }
    transitionsMap = {};
    for(var key of Object.keys(transitions)){
        var trSchema = transitions[key];
        var tr = new Transition(key,trSchema,transitionsMap);
        transitionsMap[key] = tr;
    }
    for(var key of Object.keys(transitionsMap)){
        transitionsMap[key].init();
    }
}

const transitions = {

    "Api" : {
        "traits" : {
            "/.+/" : "$Trait"
        },
        "resourceTypes" : {
            "/.+/" : "$ResourceType"
        },
        "types" : {
            "/.+/" : "$TypeDeclaration"
        },
        "annotationTypes" : {
            "/.+/" : "$TypeDeclaration"
        },
        "baseUriParameters" : {
            "/.+/" : "$TypeDeclaration"
        },
        "securedBy" : "$SecuritySchemeReferences",
        "/\/.+/" : "$Resource",
        "/\\(.+\\)/" : "$Annotation"
    },
    "Resource" : {
        "get" : "$Method",
        "put" : "$Method",
        "post" : "$Method",
        "delete"  : "$Method",
        "options" : "$Method",
        "head" : "$Method",
        "patch"  : "$Method",
        "is" : "$TraitReferences",
        "type" : {
            "$action": "##patchResourceTypeReference"
        },
        "uriParameters" : {
            "/.+/" : "$TypeDeclaration"
        },
        "securedBy" : "$SecuritySchemeReferences",
        "/\\(.+\\)/" : "$Annotation",
        "/\/.+/" : "$Resource",
        "$action" : "##filterTraits"
    },
    "Method" : {
        "body" : "$Body",
        "responses" : {
            "/\\d{3,3}/" : "$Response"
        },
        "is" : "$TraitReferences",
        "queryParameters" : {
            "/.+/" : "$TypeDeclaration"
        },
        "headers" : {
            "/.+/" : "$TypeDeclaration"
        },
        "securedBy" : "$SecuritySchemeReferences",
        "/\\(.+\\)/" : "$Annotation",
        "$action" : "##filterTraits"
    },
    "ResourceType" : {
        "get" : "$Method",
        "put" : "$Method",
        "post" : "$Method",
        "delete"  : "$Method",
        "options" : "$Method",
        "head" : "$Method",
        "patch"  : "$Method",
        "is" : "$TraitReferences",
        "type" : {
            "$action": "##patchResourceTypeReference"
        },
        "uriParameters" : {
            "/.+/" : "$TypeDeclaration"
        },
        "securedBy" : "$SecuritySchemeReferences",
        "/\\(.+\\)/" : "$Annotation"
    },
    "Trait" : {
        "body" : "$Body",
        "responses" : {
            "/\\d{3,3}/" : "$Response"
        },
        "queryParameters" : {
            "/.+/" : "$TypeDeclaration"
        },
        "headers" : {
            "/.+/" : "$TypeDeclaration"
        },
        "securedBy" : "$SecuritySchemeReferences",
        "/\\(.+\\)/" : "$Annotation"
    },
    "Response" : {
        "body" : "$Body",
        "/\\(.+\\)/" : "$Annotation"
    },
    "Body" : {
        "oneOf" : [
            {
                "$conditions" : [
                    "isBodyWithDefaultMediaType"
                ],
                "$action" : "$TypeDeclaration"
            },
            {
                "/.+/" : "$TypeDeclaration"
            }
        ]
    },
    "TypeDeclaration" : {
        "oneOf" : [
            {
                "$conditions" : [
                    "isScalar"
                ],
                "$action" : "##patch"
            },
            {
                "$conditions" : [
                    "isArray"
                ],
                "$action" : "$TypeDeclaration",
                "$toChildren" : true
            },
            {
                "type" : "$TypeDeclaration",
                "items" : "$TypeDeclaration",
                "properties" : {
                    "/.+/" : "$TypeDeclaration"
                },
                "facets" : {
                    "/.+/" : "$TypeDeclaration"
                },
                "/\\(.+\\)/" : "$Annotation"
            }
        ],
    },
    "Annotation" : {
        "$action" : "##patchAnnotationName"
    },
    "TraitReferences" : {
        "$action" : "##patchTraitReference",
        "$toChildren" : true
    },
    "SecuritySchemeReferences" : {
        "$action" : "##patchSecuritySchemeReference",
        "$toChildren" : true
    }
};

export class Scope{

    hasRootMediaType:boolean;
}

type TransitionMap = {[key:string]:Transition};

export enum TransitionKind{
    BASIC, ONE_OF, ACTION, MIXED
}

class Transition{

    constructor(public title:string, public localMap:any,public globalMap:TransitionMap){}

    private staticTransitions: TransitionMap;

    private regexpTransitions: {
        regexp: RegExp,
        transition:Transition
    }[];

    conditions:string[];

    children:Transition[];

    kind:TransitionKind;

    action:Action;
    
    applyToChildren:boolean = false;

    processNode(node:ll.ILowLevelASTNode,state:State){

        if(this.kind == TransitionKind.ONE_OF){
            for(var ch of this.children){
                if(ch.checkConditions(node,state)){
                    this.applyMappedTransition(node,ch,state);
                    break;
                }
            }
            return;
        }
        if(this.kind == TransitionKind.BASIC || this.kind == TransitionKind.MIXED){
            for(var chNode of node.children()){
                var key = chNode.key();
                if(!key){
                    continue;
                }
                var tr = this.staticTransitions[key];
                if(!tr){
                    for(var regexpEntry of this.regexpTransitions){
                        if(key.match(regexpEntry.regexp)){
                            tr = regexpEntry.transition;
                            break;
                        }
                    }
                }
                if(tr){
                    this.applyMappedTransition(chNode,tr,state);
                }
            }
        }
        if(this.kind == TransitionKind.ACTION || this.kind == TransitionKind.MIXED){
            if(this.action!=null) {
                this.action(node, state);
            }
            else{
                this.applyMappedTransition(node,this.children[0],state);
            }
        }

    }

    applyMappedTransition(node:ll.ILowLevelASTNode,tr:Transition,state:State){
        var appended1 = state.appendUnitIfNeeded(node);
        if(tr.applyToChildren){
            for(var chNode of node.children()){
                var appended2 = state.appendUnitIfNeeded(chNode);
                tr.processNode(chNode,state);
                if(appended2) {
                    state.popUnit();
                }
            }
        }
        else{
            tr.processNode(node,state);
        }
        if(appended1){
            state.popUnit();
        }
    }

    checkConditions(node:ll.ILowLevelASTNode,state:State){
        if(!this.conditions){
            return true;
        }
        let result = true;
        for(var condition of this.conditions){
            if(condition == "isScalar"){
                result = result && (node.kind() == yaml.Kind.SCALAR||node.valueKind() == yaml.Kind.SCALAR);
                if(result) {
                    var value = node.value(true);
                    if (!value) {
                        result = false;
                    }
                    else if (typeof value == "string") {
                        value = value.trim();
                        if (!value) {
                            result = false;
                        }
                        else {
                            var ch0 = value[0];
                            var ch1 = value[value.length - 1];
                            if ((ch0 === "{" && ch1 == "}") || (ch0 === "<" && ch1 == ">")) {
                                result = false;
                            }
                        }
                    }
                }
                else{
                    result = false;
                }
            }
            else if(condition == "isArray"){
                result = node.valueKind() == yaml.Kind.SEQ;
            }
            else if(condition=="isBodyWithDefaultMediaType"){
                if(state.globalScope.hasRootMediaType) {
                    result = result && (_.find(node.children(), x=>x.key() && x.key().indexOf("/") >= 0) == null);
                }
                else{
                    result = false;
                }
            }
        }
        return result;
    }

    init(){

        this.conditions = this.localMap["$conditions"];

        var oneOf = this.localMap["oneOf"];
        if(oneOf){
            this.kind = TransitionKind.ONE_OF;
            this.children = oneOf.map((x,i)=>new Transition(`${this.title}[${i}]`,x,this.globalMap));
            this.children.forEach(x=>x.init());
        }
        else{
            var actionName = this.localMap["$action"];
            if(actionName){
                if(this.localMap["$toChildren"]){
                    this.applyToChildren = true;
                }
                if(Object.keys(this.localMap).filter(x=>x.charAt(0)!="$").length==0) {
                    this.kind = TransitionKind.ACTION;
                }
                else{
                    this.kind = TransitionKind.MIXED;
                }
                if(util.stringStartsWith(actionName,"##")) {
                    if (actionName == "##patch") {
                        this.action = patchTypeAction;
                    }
                    else if (actionName == "##patchTraitReference") {
                        this.action = patchTraitsAction;
                    }
                    else if (actionName == "##patchResourceTypeReference") {
                        this.action = patchResourceTypesAction;
                    }
                    else if (actionName == "##patchAnnotationName") {
                        this.action = patchAnnotationNameAction;
                    }
                    else if (actionName == "##patchSecuritySchemeReference") {
                        this.action = patchSecuritySchemeReferenceAction;
                    }
                    else if (actionName == "##filterTraits") {
                        this.action = filterTraits;
                    }
                }
                else if(actionName.charAt(0)=="$"){
                    this.children = [ this.globalMap[actionName.substring(1)] ];
                }
            }
            if(this.kind==null) {
                this.kind = TransitionKind.BASIC;
            }
            else if(this.kind == TransitionKind.ACTION){
                return;
            }
            this.regexpTransitions = [];
            this.staticTransitions = {};
            for (var key of Object.keys(this.localMap).filter(x=>x.charAt(0) != "$")) {
                if (!key) {
                    continue;
                }
                key = key.trim();
                if (!key) {
                    continue;
                }
                var trObj = this.localMap[key];
                var tr:Transition;
                if (typeof trObj === "string") {
                    if (trObj.charAt(0) == "$") {
                        tr = this.globalMap[trObj.substring(1)];
                    }
                }
                else if (typeof trObj == "object" && !Array.isArray(trObj)) {
                    tr = new Transition(`${this.title}.${key}`,trObj, this.globalMap);
                    tr.init();
                }
                if (!tr) {
                    continue;
                }
                if (key.charAt(0) == "/") {
                    var regexp = new RegExp(key.substring(1, key.length - 1));
                    this.regexpTransitions.push({
                        regexp: regexp,
                        transition: tr
                    });
                }
                else {
                    this.staticTransitions[key] = tr;
                }
            }
        }
    }
}

export class State{

    constructor(
        public referencePatcher:ReferencePatcher,
        public rootUnit:ll.ICompilationUnit,
        public globalScope:Scope,
        public resolver:namespaceResolver.NamespaceResolver){
        this.units = [ rootUnit ];
    }

    units:ll.ICompilationUnit[];

    lastUnit():ll.ICompilationUnit{
        return this.units[this.units.length-1];
    }

    appendUnitIfNeeded(node:ll.ILowLevelASTNode|ll.ICompilationUnit):boolean{
        if(jsyaml.CompilationUnit.isInstance(node)){
            var unit = <ll.ICompilationUnit>node;
            if (unit.absolutePath() != this.lastUnit().absolutePath()) {
                this.units.push(unit);
                return true;
            }
            return false;
        }
        var originalNode = toOriginal(<ll.ILowLevelASTNode>node);
        var originalUnit = originalNode.unit();
        if(originalNode.valueKind()==yaml.Kind.INCLUDE_REF){
            var ref = originalNode.includePath();
            var includedUnit = originalUnit.resolve(ref);
            if(includedUnit) {
                this.units.push(includedUnit);
                return true;
            }
            return false;
        }
        else {
            if (originalUnit.absolutePath() != this.lastUnit().absolutePath()) {
                this.units.push(originalUnit);
                return true;
            }
            return false;
        }
    }
    popUnit() {
        this.units.pop();
    }

}

interface Action{
    (node:ll.ILowLevelASTNode,state:State):boolean
}



function patchTypeAction(node:ll.ILowLevelASTNode,state:State){
    state.referencePatcher.patchType(node,state);
    return false;
}

function patchTraitsAction(node:ll.ILowLevelASTNode,state:State){
    if(node.kind()!=yaml.Kind.SCALAR){
        if(node.key()==null){
            node = node.children()[0];
        }
    }
    state.referencePatcher.patchReference(node,state,"traits");
    return false;
}

function patchResourceTypesAction(node:ll.ILowLevelASTNode,state:State){
    var children = node.children();
    if(children.length>0){
        state.referencePatcher.patchReference(children[0],state,"resourceTypes");        
    }
    else{
        var pNode = (<proxy.LowLevelCompositeNode>node);
        var pScalar = new proxy.LowLevelCompositeNode(jsyaml.createScalar(node.value()),null,pNode.transformer(),"RAML10",true);
        state.referencePatcher.patchReference(pScalar,state,"resourceTypes");
        pNode.setValueOverride(pScalar.value());
    }
    //state.referencePatcher.patchReference(children[0],state,"resourceTypes");
    return false;
}

function patchAnnotationNameAction(node:ll.ILowLevelASTNode, state:State){
    let key = toOriginal(node).key();
    let pNode = <proxy.LowLevelCompositeNode>node;
    let transformer = pNode.transformer();
    let patchedReference = state.referencePatcher.resolveReferenceValue(
        key.substring(1,key.length-1),state,<expander.DefaultTransformer>transformer,"annotationTypes");
    if(patchedReference) {
        state.referencePatcher.registerPatchedReference(patchedReference);
        pNode.setKeyOverride(`(${patchedReference.value()})`);
    }
    return false;
}

function patchSecuritySchemeReferenceAction(node:ll.ILowLevelASTNode, state:State){
    
    if(node.key()=="securedBy"){
        node = node.children()[0];
    }
    state.referencePatcher.patchReference(node, state, "securitySchemes");
    return false;
}

function filterTraits(node:ll.ILowLevelASTNode, state:State){

    let isNode = _.find(node.children(),x=>x.key()==def.universesInfo.Universe10.MethodBase.properties.is.name);
    if(isNode){
        (<proxy.LowLevelCompositeNode>isNode).filterChildren();
    }
    return false;
}

export class ReferencePatcher {

    constructor(protected mode:referencePatcherHL.PatchMode = referencePatcherHL.PatchMode.DEFAULT){}

    private _outerDependencies:{[key:string]:referencePatcherHL.DependencyMap} = {};

    private _libModels:{[key:string]:namespaceResolver.UnitModel} = {};

    process(apiNode:ll.ILowLevelASTNode,
            rootNode = apiNode,
            typeName = "Api",
            _removeUses:boolean = false,
            _patchNodeName:boolean = false,
            collectionName?:string) {

        initTransitions();
        var scope = new Scope();
        scope.hasRootMediaType = (_.find(apiNode.children(), x=>x.key() == "mediaType") != null);
        var rootUnit = rootNode.unit();
        var resolver = (<jsyaml.Project>rootUnit.project()).namespaceResolver();
        var state = new State(this,rootUnit, scope, resolver);
        var entryPoint = transitionsMap[typeName];
        if(entryPoint) {
            entryPoint.processNode(apiNode, state);
        }

        if (_patchNodeName) {
            this.patchNodeName(apiNode, state, collectionName);
        }
        if (_removeUses) {
            this.removeUses(apiNode);
        }
        else {
            this.patchUses(apiNode, resolver);
        }
        apiNode["libProcessed"] = true;
        //this.resetHighLevel(apiNode);
    }


    patchType(node:ll.ILowLevelASTNode, state:State) {

        var collectionName = "types";

        var llNode = <proxy.LowLevelProxyNode>node;
        var value = node.value(true).toString();

        var gotExpression = referencePatcherHL.checkExpression(value);
        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();
        var stringToPatch = value;
        var escapeData:referencePatcherHL.EscapeData = {status: referencePatcherHL.ParametersEscapingStatus.NOT_REQUIRED};
        var additionalUnits = transformer ? transformer.unitsChain : null;
        if (transformer != null || value.indexOf("<<") >= 0) {
            var actualNode = toOriginal(llNode);
            var actualValue = actualNode.value();
            escapeData = referencePatcherHL.escapeTemplateParameters(actualValue);
            if (escapeData.status == referencePatcherHL.ParametersEscapingStatus.OK) {
                if (gotExpression) {
                    stringToPatch = escapeData.resultingString;
                }
                else {
                    stringToPatch = actualValue;
                }
            }
            else {
                transformer = null;
            }
        }
        var appendedAdditional:boolean[];
        if (additionalUnits) {
            appendedAdditional = [];
            for (var u of additionalUnits) {
                appendedAdditional.push(state.appendUnitIfNeeded(u));
            }
        }
        var appendedAttrUnit = state.appendUnitIfNeeded(node);

        let newValue:string;
        if (gotExpression) {
            var expressionPatchFailed = false;
            var expr = typeExpressions.parse(stringToPatch);
            var gotPatch = false;
            typeExpressions.visit(expr, x=> {
                if (x.type == "name") {
                    var lit = <typeExpressions.Literal>x;
                    var typeName = lit.value;
                    var unescapeData:referencePatcherHL.EscapeData = {status: referencePatcherHL.ParametersEscapingStatus.NOT_REQUIRED};
                    var unescaped:string;
                    if (escapeData.status == referencePatcherHL.ParametersEscapingStatus.OK) {
                        unescaped = escapeData.substitutions[typeName];
                        if (unescaped == null) {
                            unescapeData = referencePatcherHL.unescapeTemplateParameters(
                                typeName, escapeData.substitutions);
                            if (unescapeData.status == referencePatcherHL.ParametersEscapingStatus.OK) {
                                typeName = unescapeData.resultingString;
                            }
                            else if (unescapeData.status == referencePatcherHL.ParametersEscapingStatus.ERROR) {
                                expressionPatchFailed = true;
                                return;
                            }
                        }
                        else {
                            typeName = unescaped;
                        }
                    }
                    if (transformer == null && (unescaped != null || unescapeData.status == referencePatcherHL.ParametersEscapingStatus.OK)) {
                        lit.value = typeName;
                        return;
                    }
                    //var patchTransformedValue = true;
                    //if(typeName.indexOf("<<")>=0&&this.isCompoundValue(typeName)){
                    //    patchTransformedValue = false;
                    //}
                    var patched = this.resolveReferenceValue(
                        typeName, state, transformer, collectionName);//, patchTransformedValue);
                    if (patched != null) {
                        lit.value = patched.value();
                        gotPatch = true;
                        this.registerPatchedReference(patched);
                    }
                }
            });
            if (gotPatch && !expressionPatchFailed) {
                newValue = typeExpressions.serializeToString(expr);
            }
            else {
                newValue = value;
            }
        }
        else if (!(escapeData.status == referencePatcherHL.ParametersEscapingStatus.OK && transformer == null)) {
            if (stringToPatch.indexOf("<<") >= 0 && referencePatcherHL.isCompoundValue(stringToPatch)) {
                stringToPatch = value;
                transformer = null;
            }
            var patched = this.resolveReferenceValue(stringToPatch, state, transformer, collectionName);
            if (patched != null) {
                this.registerPatchedReference(patched);
                newValue = patched.value();
            }
        }
        if (newValue != null) {
            llNode.setValueOverride(newValue);
        }
        if (appendedAttrUnit) {
            state.popUnit();
        }
        if (appendedAdditional) {
            for (var i = 0; i < appendedAdditional.filter(x=>x).length; i++) {
                state.popUnit();
            }
        }

        return false;
    }


    resolveReferenceValue(stringToPatch:string,
                          state:State,
                          transformer:expander.DefaultTransformer,
                          collectionName:string):referencePatcherHL.PatchedReference {
        var isAnnotation = collectionName == "annotationTypes";
        var newValue:referencePatcherHL.PatchedReference;
        if (transformer) {
            if (stringToPatch && stringToPatch.indexOf("<<") >= 0) {
                var doContinue = true;
                var byNSMap = state.resolver.nsMap(state.rootUnit);
                //var types = (<hlimpl.ASTNodeImpl>rootUnit.highLevel()).types();
                var newValue1 = transformer.transform(stringToPatch, true, ()=>doContinue, (val, tr)=> {
                    var newVal = this.resolveReferenceValueBasic(val, state, collectionName, tr.unitsChain);
                    if (newVal == null) {
                        newVal = new referencePatcherHL.PatchedReference(
                            null, val, collectionName, state.rootUnit, referencePatcherHL.PatchMode.DEFAULT);
                    }
                    let referencedUnit:ll.ICompilationUnit;
                    let newNS = newVal.namespace();
                    if(newNS){
                        let referencedUsesInfo = byNSMap[newNS];
                        if(referencedUsesInfo) {
                            referencedUnit = referencedUsesInfo.unit
                        }
                    }
                    if(!referencedUnit){
                        referencedUnit = state.rootUnit;
                    }
                    var unitModel = state.resolver.unitModel(referencedUnit);
                    if(isAnnotation){
                        if (unitModel.annotationTypes.hasElement(newVal.name())) {
                            doContinue = false;
                        }
                        else {
                            doContinue = false;
                        }
                    }
                    else if (unitModel.types.hasElement(newVal.name())) {
                        doContinue = false;
                    }
                    else {
                        doContinue = false;
                    }
                    return newVal;
                });
                newValue = newValue1.value;
            }
        }
        if (newValue === undefined || !referencePatcherHL.instanceOfPatchedReference(newValue)) {
            newValue = this.resolveReferenceValueBasic(stringToPatch, state, collectionName);
        }
        return newValue;
    }


    resolveReferenceValueBasic(_value:string,
                               state:State,
                               collectionName:string,
                               unitsOverride?:ll.ICompilationUnit[]):referencePatcherHL.PatchedReference {

        if (_value == null || typeof(_value) != "string") {
            return null;
        }

        var isType = collectionName == "types" || collectionName == "annotationTypes";
        var gotQuestion = isType && util.stringEndsWith(_value, "?");
        var value = gotQuestion ? _value.substring(0, _value.length - 1) : _value;

        var ind = value.lastIndexOf(".");

        var referencedUnit:ll.ICompilationUnit;
        var plainName:string;
        var units = unitsOverride || state.units;
        if (ind >= 0) {
            var oldNS = value.substring(0, ind);
            plainName = value.substring(ind + 1);

            for (var i = units.length; i > 0; i--) {
                var localUnit = units[i - 1];
                var nsMap = state.resolver.nsMap(localUnit);
                if (nsMap == null) {
                    continue;
                }
                var info = nsMap[oldNS];
                if (info == null) {
                    continue;
                }
                referencedUnit = info.unit;
                if (referencedUnit != null) {
                    break;
                }
            }
        }
        else {
            if (isType && def.rt.builtInTypes().get(value) != null) {
                return null;
            }
            plainName = value;
            referencedUnit = units[units.length - 1];
        }
        if (referencedUnit == null || referencedUnit.absolutePath() == state.rootUnit.absolutePath()) {
            return null;
        }
        var usesInfo = state.resolver.resolveNamespace(state.rootUnit, referencedUnit);
        if (usesInfo == null) {
            return null;
        }
        var newNS = usesInfo.namespace();
        if (newNS == null) {
            return null;
        }
        if (this.mode == referencePatcherHL.PatchMode.PATH) {
            var aPath = referencedUnit.absolutePath().replace(/\\/g, "/");
            if (!ll.isWebPath(aPath)) {
                aPath = "file://" + aPath;
            }
            newNS = `${aPath}#/${collectionName}`;
        }
        if (gotQuestion) {
            plainName += "?";
        }
        return new referencePatcherHL.PatchedReference(newNS, plainName, collectionName, referencedUnit, this.mode);
    }

    patchNodeName(node:ll.ILowLevelASTNode, state:State, collectionName:string) {

        var llNode = <proxy.LowLevelProxyNode>node;
        var key = llNode.key();
        var isAnnotation = (collectionName == "annotationTypes");
        if (isAnnotation) {
            key = key.substring(1, key.length-1);
        }
        var patched = this.resolveReferenceValueBasic(key, state, collectionName, [llNode.unit()]);
        if (patched != null) {
            this.registerPatchedReference(patched);
            var patchedValue = patched.value();
            if (isAnnotation) {
                patchedValue = `(${patchedValue})`;
            }
            llNode.setKeyOverride(patchedValue);
        }
    }

    patchReference(attr:ll.ILowLevelASTNode,state:State,collectionName:string,force=false){

        var llNode:proxy.LowLevelProxyNode = <proxy.LowLevelProxyNode>attr;
        if(!(proxy.LowLevelProxyNode.isInstance(llNode))){
            return;
        }
        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();

        if(attr.kind() == yaml.Kind.SCALAR){
            let stringToPatch = llNode.value();
            if(transformer!=null){
                var actualNode = toOriginal(llNode);
                stringToPatch = actualNode.value();
            }
            var newValue = this.resolveReferenceValue(stringToPatch,state,transformer,collectionName);
            if(newValue!=null){
                var newValue1 = newValue.value();
                llNode.setValueOverride(newValue1);
                this.registerPatchedReference(newValue);
            }
        }
        else{
            // var sValue = <hlimpl.StructuredValue>value;
            // var hlNode = sValue.toHighLevel();
            // if(hlNode) {
            //     for (var attr of hlNode.attrs()) {
            //         if (universeHelpers.isSchemaStringType(attr.definition())) {
            //             this.patchReferenceAttr(attr, rootNode, resolver, units, true);
            //         }
            //     }
            // }
            var key = toOriginal(attr).key();
            let stringToPatch = key;
            // if(transformer!=null){
            //     var actualNode = toOriginal(sValue.lowLevel());
            //     stringToPatch = actualNode.key();
            // }
            if(key!=null){
                // if(isAnnotation){
                //     stringToPatch = stringToPatch.substring(1,stringToPatch.length-1);
                // }
                var newValue = this.resolveReferenceValue(stringToPatch,state,transformer,collectionName);
                if(newValue!=null) {
                    var newValue1 = /*isAnnotation ? `(${newValue.value()})` :*/ newValue.value();
                    (<proxy.LowLevelProxyNode>attr).setKeyOverride(newValue1);
                    this.registerPatchedReference(newValue);
                }
            }
            // attr = attr.children()[0];
            // this.patchNodeName(attr,state,collectionName);
        }

    }

    patchUses(node:ll.ILowLevelASTNode, resolver:namespaceResolver.NamespaceResolver) {

        if (!(proxy.LowLevelCompositeNode.isInstance(node))) {
            return;
        }
        var unit = node.unit();
        var extendedUnitMap = resolver.expandedPathMap(unit);
        if (extendedUnitMap == null) {
            return;
        }
        var unitMap = resolver.pathMap(unit);
        if (!unitMap) {
            unitMap = {};
        }

        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesPropName = universeDef.Universe10.FragmentDeclaration.properties.uses.name;
        var usesNodes = originalChildren.filter(x=>x.key() == usesPropName);

        var oNode = toOriginal(node);
        var yamlNode = oNode;
        while (proxy.LowLevelProxyNode.isInstance(yamlNode)) {
            yamlNode = (<proxy.LowLevelProxyNode>yamlNode).originalNode();
        }

        var usesInfos = Object.keys(unitMap).map(x=>extendedUnitMap[x]);
        var extendedUsesInfos = Object.keys(extendedUnitMap).map(x=>extendedUnitMap[x])
            .filter(x=>!unitMap[x.absolutePath()]/*&&this.usedNamespaces[x.namespace()]*/);

        var unitPath = unit.absolutePath();
        var existingLibs = {};
        var usesNode:proxy.LowLevelCompositeNode;
        if (usesNodes.length > 0) {
            usesNode = <proxy.LowLevelCompositeNode>usesNodes[0];
            usesNode.children().forEach(x=>existingLibs[x.key()] = true);
        }
        else {
            var newUses = jsyaml.createMapNode("uses");
            newUses["_parent"] = <jsyaml.ASTNode>yamlNode;
            newUses.setUnit(yamlNode.unit());
            usesNode = cNode.replaceChild(null, newUses);
        }
        for (var ui of usesInfos.concat(extendedUsesInfos)) {
            var up = ui.absolutePath();
            if (existingLibs[ui.namespace()]) {
                continue;
            }
            var ip = ui.includePath;
            var mapping = jsyaml.createMapping(ui.namespace(), ip);
            mapping.setUnit(yamlNode.unit());
            usesNode.replaceChild(null, mapping);
        }
    }

    removeUses(node:ll.ILowLevelASTNode) {

        if (!(proxy.LowLevelCompositeNode.isInstance(node))) {
            return;
        }
        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesNodes = originalChildren.filter(x=>
        x.key() == universeDef.Universe10.FragmentDeclaration.properties.uses.name);
        if (usesNodes.length > 0) {
            cNode.removeChild(usesNodes[0]);
        }
    }

    registerPatchedReference(ref:referencePatcherHL.PatchedReference){

        var collectionName = ref.collectionName();
        if(!collectionName){
            return;
        }

        var aPath = ref.referencedUnit().absolutePath();
        var libMap = this._outerDependencies[aPath];
        if(libMap==null){
            libMap = {};
            this._outerDependencies[aPath] = libMap;
        }
        var collectionMap = libMap[collectionName];
        if(collectionMap == null){
            collectionMap = {};
            libMap[collectionName] = collectionMap;
        }
        collectionMap[ref.name()] = ref;
    }

    expandLibraries(api:proxy.LowLevelCompositeNode){

        if(api.actual().libExpanded){
            return;
        }
        var unit = api.unit();

        var project = unit.project();
        var libModels:namespaceResolver.UnitModel[] = [];
        var resolver = (<jsyaml.Project>project).namespaceResolver();
        var expandedPathMap = resolver.expandedPathMap(unit);
        if(expandedPathMap!=null) {
            var libPaths = Object.keys(expandedPathMap).sort();
            for (var libPath of libPaths) {
                var libModel = this._libModels[libPath];
                if (libModel == null) {
                    libModel = resolver.unitModel(expandedPathMap[libPath].unit);
                }
                if (libModel) {
                    libModels.push(libModel);
                }
            }
            var gotContribution = false;
            for (var libModel of libModels) {
                for (var cName of Object.keys(libModel)) {
                    var collection = <namespaceResolver.ElementsCollection>libModel[cName];
                    if (namespaceResolver.ElementsCollection.isInstance(collection)) {
                        gotContribution = this.contributeCollection(api,collection) || gotContribution;
                    }
                }
            }
            if (gotContribution) {
                var gotPatch = false;
                do {
                    gotPatch = this.patchDependencies(api);
                }
                while (gotPatch);
                this.removeUnusedDependencies(api);
            }
        }
        this.removeUses(api);
        api.actual().libExpanded = true;
        //this.resetHighLevel(api);
    }

    private patchDependencies(api:proxy.LowLevelCompositeNode):boolean {
        var result = false;
        var apiPath = api.unit().absolutePath();
        for (var c of api.children()) {
            var collectionName = c.key();
            var typeName = collectionNames[collectionName];
            if(!typeName){
                continue;
            }
            for(var chNode of c.children()) {
                if (chNode["libProcessed"]) {
                    continue;
                }
                this.removeUses(chNode);
                var chPath = chNode.unit().absolutePath();
                if (chPath == apiPath && chNode.includePath() == null) {
                    continue;
                }
                var dependencies = this._outerDependencies[chPath];
                if (dependencies == null) {
                    continue;
                }
                var depCollection = dependencies[collectionName];
                if (depCollection == null) {
                    continue;
                }
                if (depCollection[chNode.key()] == null) {
                    continue;
                }
                this.process(chNode, api, typeName, true, true);
                result = true;
            }
        }
        return result;
    }

    private removeUnusedDependencies(api:proxy.LowLevelCompositeNode) {
        var llNode = api;
        var apiPath = llNode.unit().absolutePath();

        for(var c of api.children()) {
            if(!collectionNames[c.key()]){
                continue;
            }
            for (var chLl of [].concat(c.children())) {
                if (chLl["libProcessed"]) {
                    continue;
                }
                var chPath = chLl.unit().absolutePath();
                if (chPath == apiPath) {
                    continue;
                }
                (<proxy.LowLevelCompositeNode>c).removeChild(chLl);
            }
        }
    }

    private contributeCollection(api:proxy.LowLevelCompositeNode, collection:namespaceResolver.ElementsCollection):boolean {

        var llApi = api;
        if(collection.array.length==0){
            return false;
        }
        let name = collection.name;
        let llNode:proxy.LowLevelCompositeNode = <proxy.LowLevelCompositeNode>
            _.find(llApi.children(),x=>x.key()==name);

        if(llNode==null){
            var n = jsyaml.createMapNode(name);
            llNode = llApi.replaceChild(null,n);
        }
        let result = false;
        for(var e of collection.array){
            if(llNode.children().some(x=>{
                    var oNode = toOriginal(x);
                    if(oNode.unit().absolutePath()!=e.unit().absolutePath()){
                        return false;
                    }
                    return e.key()==oNode.key() && e.unit().absolutePath() == oNode.unit().absolutePath();
                })){
                continue;
            }
            llNode.replaceChild(null,e);
            result = true;
        }
        return result;
    }


    private resetHighLevel(apiNode:ll.ILowLevelASTNode){
        var hlNode = apiNode.highLevelNode();
        if(hlNode) {            
            resetTypes(hlNode);
            hlNode.resetChildren();
        }
    }
}


function toOriginal(node:ll.ILowLevelASTNode) {
    for (var i = 0; i < 2 && proxy.LowLevelProxyNode.isInstance(node); i++) {
        node = (<proxy.LowLevelProxyNode>node).originalNode();
    }
    return node;
}

function resetTypes(hlNode:hl.IHighLevelNode) {
    for(var ch of hlNode.elements()){
        resetTypes(ch);
    }
    for(var attr of hlNode.attrs()){
        var aVal = attr.value();
        if(hlimpl.StructuredValue.isInstance(aVal)){
            (<hlimpl.StructuredValue>aVal).resetHighLevelNode();
        }
    }
    delete hlNode.lowLevel().actual().types;
    delete hlNode["_ptype"];
    delete hlNode["_types"];
    (<hlimpl.ASTNodeImpl>hlNode).setAssociatedType(null);
};

const collectionNames = {
    "types" : "TypeDeclaration",
    "annotationTypes" : "TypeDeclaration",
    "traits" : "Trait",
    "resourceTypes" : "ResourceType",
    "securitySchemes" : "SecuritySchemePart"
}