import ll=require("../lowLevelAST")
import path = require("path")
import universes = require("../tools/universe");
import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import yaml = require("yaml-ast-parser")
import universeHelpers = require("../tools/universeHelpers");
import referencepatcherLL = require("./referencePatcherLL");

import resourceRegistry = require('../jsyaml/resourceRegistry');
import hlImpl = require("../highLevelImpl");
import def = require("raml-definition-system");
import _ = require("underscore");
import util = require("../../util/index");

export class NamespaceResolver{

    private expandedAbsToNsMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private _expandedNSMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private byPathMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private byNsMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private _hasFragments: {[key:string]:boolean} = {};

    private _unitModels: {[key:string]:UnitModel} = {};

    hasTemplates(unit:ll.ICompilationUnit){
        var uModel = this.unitModel(unit);
        if(!uModel.traits.isEmpty()||!uModel.resourceTypes.isEmpty()){
            return true;
        }
        var epMap = this.expandedPathMap(unit);
        if(epMap) {
            for (var p of Object.keys(epMap)) {
                var u = epMap[p].unit;
                var uModel1 = this.unitModel(u);
                if (!uModel1.traits.isEmpty() || !uModel1.resourceTypes.isEmpty()) {
                    return true;
                }
            }
        }
        var eValue = extendsValue(unit);
        while(eValue){
            unit = unit.resolve(eValue);
            if(unit){
                uModel = this.unitModel(unit);
                if(!uModel.traits.isEmpty()||!uModel.resourceTypes.isEmpty()){
                    return true;
                }
                eValue = extendsValue(unit);
            }
            else {
                eValue = null;
            }
        }
        return false;
    }

    resolveNamespace(from:ll.ICompilationUnit, to:ll.ICompilationUnit):UsesInfo{

        if(to==null){
            return null;
        }
        var toPath = to.absolutePath();
        var unitMap = this.expandedPathMap(from);
        if(!unitMap){
            return null;
        }
        var usesInfo = unitMap[toPath];
        return usesInfo;
    }

    expandedNSMap(unit:ll.ICompilationUnit) {
        var aPath = unit.absolutePath();
        let result = this._expandedNSMap[aPath];
        if(result===undefined) {
            var pm = this.expandedPathMap(unit);
            if (!pm) {
                result = null;
            }
            else{
                result = {};
                for(var ap of Object.keys(pm)){
                    var uInfo = pm[ap];
                    result[uInfo.namespace()] = uInfo;
                }
            }
            this._expandedNSMap[aPath] = result;
        }
        return result;
    }

    expandedPathMap(unit:ll.ICompilationUnit) {
        var fromPath = unit.absolutePath();
        var unitMap = this.expandedAbsToNsMap[fromPath];
        if (unitMap===undefined) {
            unitMap = this.calculateExpandedNamespaces(unit);
            if(Object.keys(unitMap).length==0){
                unitMap = null;
            }
            this.expandedAbsToNsMap[fromPath] = unitMap;
        }
        return unitMap;
    }

    private calculateExpandedNamespaces(_unit:ll.ICompilationUnit):{[key:string]:UsesInfo}{

        var rootPath = path.dirname(_unit.absolutePath());
        var result:{[key:string]:UsesInfo} = {};
        var usesInfoArray:UsesInfo[] = [];
        while (_unit) {
            usesInfoArray.push(new UsesInfo([], _unit, ""));
            var u = _unit;
            _unit = null;
            var node = u.ast();
            if (node && node.kind() != yaml.Kind.SCALAR) {

                var fLine = hlImpl.ramlFirstLine(u.contents());
                if (fLine && fLine.length == 3 && (
                    fLine[2] == def.universesInfo.Universe10.Overlay.name ||
                    fLine[2] == def.universesInfo.Universe10.Extension.name)) {
                    var eValue = extendsValue(u);
                    if(eValue) {
                        _unit = u.resolve(eValue);

                        if (_unit && resourceRegistry.isWaitingFor(_unit.absolutePath())) {
                            _unit = null;
                        }
                    }
                }
            }
        }

        for(var i = 0 ; i < usesInfoArray.length ; i++){
            
            var visited = {};
            var usedUnits = {};

            var info = usesInfoArray[i];
            var unit = info.unit;
            let unitAbsPath = unit.absolutePath();
            var node = unit.ast();
            if(!node || node.kind() == yaml.Kind.SCALAR){
                continue;
            }
            var steps = info.steps() + 1;
            var visit = (x:ll.ILowLevelASTNode)=>{
                if(!x) {
                    return;
                }
                var children = x.children();
                var nodeUnit = x.unit();
                var localPath = nodeUnit.absolutePath();

                if(x.parent()==null) {
                    if(visited[localPath]){
                        return;
                    }
                    visited[localPath] = true;
                    if(localPath!=unitAbsPath){
                        let fLine = hlImpl.ramlFirstLine(nodeUnit.contents());
                        if(fLine && fLine.length==3 && fLine[1] == "1.0") {
                            this._hasFragments[unitAbsPath] = true;
                        }
                    }
                    var map = this.pathMap(nodeUnit);
                    if(map) {
                        for (var absPath of Object.keys(map)) {

                            var childInfo = map[absPath];
                            var segments = info.namespaceSegments.concat(childInfo.namespaceSegments);
                            var usesNodes = info.usesNodes.concat(childInfo.usesNodes);
                            var existing = result[absPath];
                            if (existing) {
                                if (existing.steps() < steps) {
                                    continue;
                                }
                                else if (existing.steps() == steps
                                    && this.lexLessEq(existing.namespaceSegments, segments)) {
                                    continue;
                                }
                            }
                            var includePath;
                            var childInclude = childInfo.includePath;
                            var absChildPath = childInfo.absolutePath();
                            if (path.isAbsolute(info.includePath) || ll.isWebPath(info.includePath)) {
                                includePath = absChildPath;
                            }
                            else if (path.isAbsolute(childInclude) || ll.isWebPath(childInclude)) {
                                includePath = absChildPath;
                            }
                            else {
                                if(ll.isWebPath(rootPath)!=ll.isWebPath(absChildPath)){
                                    includePath = absChildPath;
                                }
                                else if(rootPath.length>0 && absChildPath.length > 0
                                    && rootPath.charAt(0).toLowerCase() != absChildPath.charAt(0).toLowerCase()){
                                    //Windows case of library being located on different drive
                                    includePath = absChildPath;
                                }
                                else {
                                    includePath = path.relative(rootPath, absChildPath);
                                }
                            }
                            includePath = includePath.replace(/\\/g, "/");
                            var ui = new UsesInfo(usesNodes, childInfo.unit, includePath);
                            if(!usedUnits[ui.absolutePath()]) {
                                result[absPath] = ui;
                                usesInfoArray.push(ui);
                                usedUnits[ui.absolutePath()] = true;
                            }
                        }
                    }
                }
                children.forEach(y=>{
                    if(y.valueKind()==yaml.Kind.INCLUDE_REF){
                        let includedUnit = nodeUnit.resolve(y.includePath());
                        if(includedUnit) {
                            if (!includedUnit.isRAMLUnit()) {
                                return;
                            }
                            visit(includedUnit.ast());
                        }
                    }
                    else {
                        visit(y);
                    }
                });
                if(x.parent()==null){
                    visited[localPath] = false;
                }

            };
            visit(node);
        }
        var namespaces:any={};
        for(var key of Object.keys(result)){
            var info = result[key];
            var ns = info.namespace();
            var i = 0;
            while(namespaces[ns]){
                ns = info.namespace() + i++;
            }
            if(ns!=info.namespace()){
                info.namespaceSegments = ns.split(".");
            }
            namespaces[ns] = true;
        }
        return result;
    }

    pathMap(unit:ll.ICompilationUnit) {
        var fromPath = unit.absolutePath();
        var unitMap = this.byPathMap[fromPath];
        if (unitMap===undefined) {
            unitMap = this.calculateNamespaces(unit);
            if(Object.keys(unitMap).length==0){
                unitMap = null;
            }
            this.byPathMap[fromPath] = unitMap;
        }
        return unitMap;
    }

    nsMap(unit:ll.ICompilationUnit) {
        var fromPath = unit.absolutePath();
        var unitMap = this.byNsMap[fromPath];
        if (unitMap===undefined) {
            var map = this.pathMap(unit);
            if(map==null){
                unitMap = null;
            }
            else {
                unitMap = {};
                for(var aPath of Object.keys(map)){
                    var info = map[aPath];
                    unitMap[info.namespace()] = info;
                }
            }
            this.byNsMap[fromPath] = unitMap;
        }
        return unitMap;
    }
    
    private calculateNamespaces(unit:ll.ICompilationUnit):{[key:string]:UsesInfo}{
        
        var rootPath = path.dirname(unit.absolutePath());
        var result:{[key:string]:UsesInfo} = {};
        var rootNode = unit.ast();
        var usesNodes = rootNode.children().filter(x=>x.key()
                ==universes.Universe10.FragmentDeclaration.properties.uses.name);

        if(rootNode.actual()&&rootNode.actual()["usesNode"]){
            usesNodes = [(<ll.ILowLevelASTNode>rootNode.actual()["usesNode"])];
        }
        if(usesNodes.length==0){
            return result;
        }
        
        var usesDeclarationNodes:ll.ILowLevelASTNode[] = [];
        for (var un of usesNodes) {
            usesDeclarationNodes = usesDeclarationNodes.concat(un.children());
        }

        if(usesDeclarationNodes.length==0){
            return result;
        }
        
        for (var un of usesDeclarationNodes) {

            var value = un.value();
            var libUnit = unit.resolve(value);
            if(libUnit==null){
                continue;
            }

            var usesNodes = [ un ];
            var absPath = libUnit.absolutePath();
            
            var includePath;
            if (path.isAbsolute(value) || ll.isWebPath(value)) {
                includePath = libUnit.absolutePath();
            }
            else {
                includePath = path.relative(rootPath, libUnit.absolutePath());
            }
            includePath = includePath.replace(/\\/g, "/");
            var ui = new UsesInfo(usesNodes, libUnit, includePath);
            result[absPath] = ui;
        }

        var node = unit.ast();
        if (node && node.kind() != yaml.Kind.SCALAR) {

            var fLine = hlImpl.ramlFirstLine(unit.contents());
            if (fLine.length == 3 && (
                fLine[2] == def.universesInfo.Universe10.Overlay.name ||
                fLine[2] == def.universesInfo.Universe10.Extension.name)) {
                var eNode = _.find(node.children(), x=>x.key()==universes.Universe10.Extension.properties.extends.name);
                if(eNode) {
                    var eValue = eNode.value(true);
                    var extendedUnit:ll.ICompilationUnit;
                    try {
                        extendedUnit = unit.resolve(eValue);
                    }
                    catch (e) {
                    }
                    if (extendedUnit) {
                        var m = this.pathMap(extendedUnit);
                        if (m) {
                            for (var k of Object.keys(m)) {
                                result[k] = m[k];
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    private lexLessEq(a:string[], b:string[]):boolean{
        
        if(a.length>b.length){
            return false;
        }
        if(a.length<b.length){
            return true;
        }
        for(var i = 0 ; i < a.length ; i++){
            var seg_a = a[i];
            var seg_b = b[i];
            if(seg_a < seg_b){
                return true;
            }
            else if(seg_a > seg_b){
                return false;
            }
        }
        return true;
    }
    
    hasFragments(unit:ll.ICompilationUnit):boolean{
        if(!unit.isRAMLUnit()){
            return false;
        }
        let fLine = hlImpl.ramlFirstLine(unit.contents());
        if(!fLine || fLine.length < 2 || fLine[1] != "1.0"){
            return false;
        }
        this.expandedPathMap(unit);
        return this._hasFragments[unit.absolutePath()] ? true : false;
    }

    unitModel(unit:ll.ICompilationUnit,passed?:{[key:string]:boolean}):UnitModel{
        let aPath = unit.absolutePath();
        let result = this._unitModels[aPath];
        if(result){
            return result;
        }
        result = new UnitModel(unit);
        this._unitModels[aPath] = result;
        initUnitModel(result,this,passed);
        return result;
    }

    deleteUnitModel(aPath:string){
        delete this._unitModels[aPath];
    }

    getComponent(
        rootUnit:ll.ICompilationUnit,
        type:string,
        namespace:string,
        name:string,
        passed?:{[key:string]:boolean}){
        let nsMap = this.expandedNSMap(rootUnit);
        if (nsMap) {
            let referencedUnit = rootUnit;
            if(namespace){
                let uInfo = nsMap[namespace];
                referencedUnit = uInfo ? uInfo.unit : null;
            }
            if (referencedUnit) {
                let uModel = this.unitModel(referencedUnit,passed);
                let templateCollection = <ElementsCollection>(<any>uModel)[type];
                if (templateCollection && ElementsCollection.isInstance(templateCollection)) {
                    let tModel = templateCollection.getTemplateModel(name);
                    if(!tModel.isInitialized()){
                        initTemplateModel(tModel,this,passed);
                    }
                    return tModel
                }
            }
        }
    }
}

export class UsesInfo{

    constructor(
        public usesNodes:ll.ILowLevelASTNode[],
        public unit:ll.ICompilationUnit,
        public includePath:string
    ){
        this.namespaceSegments = this.usesNodes.map(x=>x.key());
    }

    namespaceSegments:string[];

    steps():number{
        return this.namespaceSegments.length;
    }

    namespace():string{
        return this.namespaceSegments.join(".");
    }

    absolutePath():string{
        return this.unit.absolutePath();
    }

}

export class ElementsCollection{
    private static CLASS_IDENTIFIER = "namespaceResolver.ElementsCollection";

    public static isInstance(instance : any) : instance is ElementsCollection {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),ElementsCollection.CLASS_IDENTIFIER);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = [];

        return superIdentifiers.concat(ElementsCollection.CLASS_IDENTIFIER);
    }

    constructor(public name:string){}

    array:ll.ILowLevelASTNode[] = [];

    map:{[key:string]:ll.ILowLevelASTNode} = {};

    templateModels:{[key:string]:TemplateModel};

    hasElement(name:string):boolean{
        return ( this.map[name] != null );
    }

    getElement(name:string):ll.ILowLevelASTNode{
        return this.map[name];
    }

    getTemplateModel(name:string){
        if(!this.templateModels){
            return null;
        }
        return this.templateModels[name];
    }

    isEmpty(){
        return this.array.length == 0;
    }
}

export class UnitModel{

    constructor(public unit:ll.ICompilationUnit){
        this.init();
    }

    master:UnitModel;

    resourceTypes:ElementsCollection;

    traits:ElementsCollection;

    securitySchemes:ElementsCollection;

    annotationTypes:ElementsCollection;

    types:ElementsCollection;

    private _extensionChain:UnitModel[];

    private _extensionSet:{[key:string]:UnitModel};

    private _type:string;

    type():string{
        return this._type;
    }

    private init(){

        this.types = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.types.name);
        this.annotationTypes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.annotationTypes.name);
        this.securitySchemes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.securitySchemes.name);
        this.traits = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.traits.name);
        this.resourceTypes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name);

        var fLine = hlImpl.ramlFirstLine(this.unit.contents());
        if (fLine) {
            if (fLine.length < 3 || !fLine[2]) {
                this._type = def.universesInfo.Universe10.Api.name;
            }
            else {
                this._type = fLine[2];
            }
        }
    }

    isOverlayOrExtension() {
        return this._type == def.universesInfo.Universe10.Overlay.name
            || this._type == def.universesInfo.Universe10.Extension.name;
    }

    extensionSet():{[key:string]:UnitModel}{
        if(!this._extensionSet){
            this._extensionSet = {};
            this._extensionChain = [];
            let um:UnitModel = this;
            while(um){
                let aPath = um.unit.absolutePath();
                if(this._extensionSet[aPath]){
                    break;
                }
                this._extensionSet[aPath] = um;
                this._extensionChain.push(um);
                um = um.master;
            }
        }
        return this._extensionSet;
    }
    extensionChain():UnitModel[]{
        if(!this._extensionChain){
            this.extensionSet();
        }
        return this._extensionChain;
    }
}



function extendsValue(u:ll.ICompilationUnit){

    var node = u.ast();
    var eNode = _.find(node.children(), x=>x.key()==universes.Universe10.Extension.properties.extends.name);
    return eNode && eNode.value();
}

var transitionsMap: referencepatcherLL.TransitionMap;

function initTransitions(){

    if(transitionsMap){
        return;
    }
    transitionsMap = {};
    for(var key of Object.keys(referencepatcherLL.transitions)){
        var trSchema = referencepatcherLL.transitions[key];
        var tr = new referencepatcherLL.Transition(key,trSchema,transitionsMap);
        transitionsMap[key] = tr;
    }
    var factory = new NamespaceResolverActionsAndConditionsFactory();
    for(var key of Object.keys(transitionsMap)){
        transitionsMap[key].init(factory);
    }
}

function templateKey(path:string, kind: string, name:string) {
    return `${path}|${kind}|${name}`;
};

export class TemplateModel{

    constructor(public name:string, public kind:string, public node:ll.ILowLevelASTNode, public typeValuedParameters:any){}

    isInitialized():boolean{
        return this.typeValuedParameters != null;
    }

    id():string{
        return `${this.node.unit().absolutePath()}|${this.kind}|${this.node.key()}`;
    }
}

export class NamespaceResolverActionsAndConditionsFactory implements referencepatcherLL.ActionsAndCondtionsFactory{

    parent = new referencepatcherLL.ReferencePatcherActionsAndConditionsFactory()

    action(actionName:string):referencepatcherLL.Action{
        var action:referencepatcherLL.Action = dummyAction;
        if (actionName == "##patch") {
            action = checkTypeValue;
        }
        else if(actionName == "##patchAnnotationName"){
            action = checkAnnotationNameValue;
        }
        else if(actionName=="##patchResourceTypeReference"){
            action = checkResourceTypeReferenceAction;
        }
        else if(actionName=="##patchTraitReference"){
            action = checkTraitReferenceAction;
        }
        return action;
    }

    condition(name:string):referencepatcherLL.Condition{
        return this.parent.condition(name);
    }

}

function checkTraitReferenceAction(node:ll.ILowLevelASTNode, state:referencepatcherLL.State){
    let kind = def.universesInfo.Universe10.LibraryBase.properties.traits.name;
    if(node.kind()!=yaml.Kind.SCALAR){
        if(node.key()==null){
            node = node.children()[0];
        }
    }
    if(node.kind()==yaml.Kind.SCALAR){
        return false;
    }
    checkReferenceAction(node, state, kind);
    return false;
}

function checkResourceTypeReferenceAction(node:ll.ILowLevelASTNode, state:referencepatcherLL.State){
    if(node.valueKind()==yaml.Kind.SCALAR){
        return;
    }
    if(node.children().length==0){
        return;
    }
    node = node.children()[0];
    let kind = def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name;
    checkReferenceAction(node, state, kind);
    return false;
}

function checkTypeValue(node:ll.ILowLevelASTNode,state:referencepatcherLL.State){
    var value = node.value();
    if(typeof value != "string"){
        return false;
    }
    checkStringValue(value, state);
    return false;
}

function checkAnnotationNameValue(node:ll.ILowLevelASTNode,state:referencepatcherLL.State){
    let key = node.key();
    if(!key){
        return false;
    }
    let annotationName = key.substring(1,key.length-1);
    checkStringValue(annotationName, state);
}

function checkStringValue(value: string, state: referencepatcherLL.State) {
    if (util.stringStartsWith(value, "<<") && util.stringEndsWith(value, ">>")) {
        value = value.substring("<<".length, value.length - ">>".length);
        if (value.indexOf("<<") < 0) {
            state.meta.params[value] = true;
        }
    }
};


function checkReferenceAction(node: ll.ILowLevelASTNode, state: referencepatcherLL.State, kind: string) {

    let reusingParams: {
        setParam: string
        readParam: string
    }[] = [];
    for (let ch of node.children()) {
        if (ch.valueKind() != yaml.Kind.SCALAR) {
            continue;
        }
        let val = ch.value();
        if (typeof val != 'string') {
            continue;
        }
        if (!(util.stringStartsWith(val, "<<") && util.stringEndsWith(val, ">>"))) {
            continue;
        }
        val = val.substring(2, val.length - 2);
        if (val.indexOf("<<") >= 0) {
            continue;
        }
        reusingParams.push({
            setParam: ch.key(),
            readParam: val
        });
    }
    if (reusingParams.length == 0) {
        return;
    }
    let templateName = node.key();
    let arr: number[] = [];
    let l = templateName.length;
    for (let i = 0; i < l; i++) {
        if (templateName.charAt(i) == ".") {
            arr.push(i);
        }
    }
    let tm: TemplateModel;
    if (arr.length > 0) {
        for (let i = arr.length - 1; i >= 0; i--) {
            let ind = arr[i];
            let ns = templateName.substring(0, ind);
            let name = templateName.substring(ind + 1, l);
            tm = state.resolver.getComponent(state.rootUnit, kind, ns, name, state.meta.passed);
        }
    }
    else {
        tm = state.resolver.getComponent(state.rootUnit, kind, null, templateName, state.meta.passed);
    }
    if (tm && tm.isInitialized()) {
        for (let e of reusingParams) {
            if (tm.typeValuedParameters[e.setParam]) {
                state.meta.params[e.readParam] = true;
            }
        }
    }
};

function dummyAction(node:ll.ILowLevelASTNode,state:referencepatcherLL.State){
    return false;
}

export function extendedUnit(u:ll.ICompilationUnit):ll.ICompilationUnit{

    var node = u.ast();
    var eNode = _.find(node.children(), x=>x.key()==universes.Universe10.Extension.properties.extends.name);
    var eValue = eNode && eNode.value();
    if(!eValue){
        return null;
    }
    return u.resolve(eValue);
}

export function initUnitModel(result:UnitModel,resolver:NamespaceResolver,passed?:{[key:string]:boolean}){

    var rootNode = result.unit.ast();
    if(!rootNode){
        return;
    }
    if(!isLibraryBaseDescendant(result.unit)){
        return;
    }
    var isRAML08 = (hlImpl.ramlFirstLine(result.unit.contents())[1] == "0.8");
    for(let ch of rootNode.children()){
        let key = ch.key();

        if(key==def.universesInfo.Universe10.LibraryBase.properties.types.name){
            contributeCollection(result.types,ch.children());
        }
        else if(key==def.universesInfo.Universe10.LibraryBase.properties.annotationTypes.name){
            contributeCollection(result.annotationTypes,ch.children());            }
        else if(key==def.universesInfo.Universe10.LibraryBase.properties.securitySchemes.name){
            contributeCollection(result.securitySchemes,ch.children(),isRAML08);
        }
        else if(key==def.universesInfo.Universe10.LibraryBase.properties.traits.name){
            contributeCollection(result.traits,ch.children(),isRAML08);
        }
        else if(key==def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name){
            contributeCollection(result.resourceTypes,ch.children(),isRAML08);
        }
    }

    if(!isRAML08){
        let resourceTypeModels = result.resourceTypes.templateModels;
        let resourceTypes = resourceTypeModels
            && Object.keys(resourceTypeModels).map(x=>resourceTypeModels[x]) || [];

        let traitModels = result.traits.templateModels;
        let traits = traitModels
            && Object.keys(traitModels).map(x=>traitModels[x]) || [];

        for(let tr of traits){
            initTemplateModel(tr,resolver,passed);
        }
        for(let rt of resourceTypes){
            initTemplateModel(rt,resolver,passed);
        }
    }

    if(result.isOverlayOrExtension()) {
        let rootNode = result.unit.ast();
        let extendsAttrs = rootNode.children().filter(x =>
        x.key() == def.universesInfo.Universe10.Overlay.properties.extends.name);
        if (extendsAttrs.length > 0) {
            let eAttr = extendsAttrs[0];
            let eVal = eAttr.value();
            if (eVal) {
                let masterUnit = result.unit.resolve(eVal);
                if (masterUnit) {
                    let masterUnitModel = resolver.unitModel(masterUnit);
                    result.master = masterUnitModel;
                }
            }
        }
    }
}

function initTemplateModel(
    tm:TemplateModel,
    resolver:NamespaceResolver,
    passed:{[key:string]:boolean}={}){

    let tr = transitionsMap[tm.kind];
    if(!tr){
        return;
    }

    let id = tm.id();
    if(passed[id]){
        return;
    }
    passed[id] = true;
    try {
        let scope = new referencepatcherLL.Scope();
        let rootUnit = tm.node.unit().project().getMainUnit();
        if (rootUnit) {
            let rootUnitAST = rootUnit.ast();
            let fLine = hlImpl.ramlFirstLine(rootUnit.contents());
            if (rootUnitAST && fLine.length == 3) {
                let universe = fLine[1] == "1.0" ? def.getUniverse("RAML10") : def.getUniverse("RAML08");
                if (universe) {
                    let tName = fLine[2];
                    let type = universe.type(tName);
                    if (type && universeHelpers.isApiSibling(type)) {
                        scope.hasRootMediaType = (_.find(rootUnitAST.children(), x => x.key() == "mediaType") != null);
                    }
                }
            }
        }
        let state = new referencepatcherLL.State(null, tm.node.unit(), scope, resolver);
        state.meta.params = {};
        state.meta.passed = passed;
        tr.processNode(tm.node, state);
        tm.typeValuedParameters = state.meta.params;
    }
    finally {
        delete passed[id];
    }
}

export function isLibraryBaseDescendant(unit:ll.ICompilationUnit) {

    var fLine = hlImpl.ramlFirstLine(unit.contents());
    if (!fLine) {
        return false;
    }
    if (fLine.length < 3 || !fLine[2]) {
        return true;
    }
    let typeName = fLine[2];
    let u = def.getUniverse("RAML10");
    if(!u){
        return false;
    }
    let t = u.type(typeName);
    if(!t){
        return false;
    }
    return universeHelpers.isLibraryBaseSibling(t);
}

function contributeCollection(c:ElementsCollection,nodes:ll.ILowLevelASTNode[],isRAML08=false){
    let _nodes:ll.ILowLevelASTNode[];
    if(isRAML08){
        _nodes = [];
        nodes.forEach(x=>{
            let children = x.children();
            if(children.length > 0) {
                _nodes.push(children[0]);
            }
        });
    }
    else{
        _nodes = nodes;
    }
    _nodes.forEach(x=>{
        c.array.push(x);
        let name = x.key();
        c.map[name] = x;
        let tm = createTemplateModel(x,c.name);
        if(tm){
            if(!c.templateModels){
                c.templateModels = {};
            }
            c.templateModels[name] = tm;
        }
    });
}

function createTemplateModel(node:ll.ILowLevelASTNode,collectionName:string):TemplateModel{
    let kind:string;
    if(collectionName == def.universesInfo.Universe10.LibraryBase.properties.traits.name){
        kind = def.universesInfo.Universe10.Trait.name;
    }
    else if(collectionName == def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name){
        kind = def.universesInfo.Universe10.ResourceType.name;
    }
    if(!kind){
        return;
    }
    initTransitions();
    let tr = transitionsMap[kind];
    if(!tr){
        return null;
    }
    let name = node.key();
    return new TemplateModel(name,kind,node,null);
}
