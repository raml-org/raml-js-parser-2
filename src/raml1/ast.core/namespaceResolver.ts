/// <reference path="../../../typings/main.d.ts" />

import ll=require("../lowLevelAST")
import path = require("path")
import universes = require("../tools/universe");
import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import yaml = require("yaml-ast-parser")
import universeHelpers = require("../tools/universeHelpers");

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

                if(x.parent()==null) {

                    var nodeUnit = x.unit();
                    var localPath = nodeUnit.absolutePath();
                    if(visited[localPath]){
                        return;
                    }
                    visited[localPath] = true;
                    if(localPath!=unit.absolutePath()){
                        this._hasFragments[unit.absolutePath()] = true;
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
                    if(y.includedFrom()){
                        y=y.parent();
                    }
                    visit(y);
                });
                if(x.parent()==null){
                    visited[x.unit().absolutePath()] = false;
                }

            };
            visit(unit.ast());
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
        this.calculateExpandedNamespaces(unit);
        return this._hasFragments[unit.absolutePath()] ? true : false;
    }

    unitModel(unit:ll.ICompilationUnit):UnitModel{
        var aPath = unit.absolutePath();
        var result = this._unitModels[aPath];
        if(!result){
            result = new UnitModel(unit);
            this._unitModels[aPath] = result;
        }
        return result;
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

    addElement(node:ll.ILowLevelASTNode){
        this.array.push(node);
        this.map[node.key()] = node;
    }

    hasElement(name:string):boolean{
        return ( this.map[name] != null );
    }

    getElement(name:string):ll.ILowLevelASTNode{
        return this.map[name];
    }

    isEmpty(){
        return this.array.length == 0;
    }
}

export class UnitModel{

    constructor(public unit:ll.ICompilationUnit){
        this.initCollections();
    }

    resourceTypes:ElementsCollection;

    traits:ElementsCollection;

    securitySchemes:ElementsCollection;

    annotationTypes:ElementsCollection;

    types:ElementsCollection;


    private initCollections(){

        this.types = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.types.name);
        this.annotationTypes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.annotationTypes.name);
        this.securitySchemes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.securitySchemes.name);
        this.traits = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.traits.name);
        this.resourceTypes = new ElementsCollection(def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name);

        var rootNode = this.unit.ast();
        if(!rootNode){
            return;
        }
        if(!this.isLibraryBaseDescendant(this.unit)){
            return;
        }
        var isRAML08 = (hlImpl.ramlFirstLine(this.unit.contents())[1] == "0.8");
        for(var ch of rootNode.children()){
            var key = ch.key();

            if(key==def.universesInfo.Universe10.LibraryBase.properties.types.name){
                this.contributeCollection(this.types,ch.children());
            }
            else if(key==def.universesInfo.Universe10.LibraryBase.properties.annotationTypes.name){
                this.contributeCollection(this.annotationTypes,ch.children());            }
            else if(key==def.universesInfo.Universe10.LibraryBase.properties.securitySchemes.name){
                this.contributeCollection(this.securitySchemes,ch.children(),isRAML08);
            }
            else if(key==def.universesInfo.Universe10.LibraryBase.properties.traits.name){
                this.contributeCollection(this.traits,ch.children(),isRAML08);
            }
            else if(key==def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name){
                this.contributeCollection(this.resourceTypes,ch.children(),isRAML08);
            }
        }

    }

    private contributeCollection(c:ElementsCollection,nodes:ll.ILowLevelASTNode[],isRAML08=false){
        var _nodes:ll.ILowLevelASTNode[];
        if(isRAML08){
            _nodes = [];
            nodes.forEach(x=>{
                var children = x.children();
                if(children.length > 0) {
                    _nodes.push(children[0]);
                }
            });
        }
        else{
            _nodes = nodes;
        }
        _nodes.forEach(x=>c.addElement(x));
    }

    private libTypeDescendants:{[key:string]:boolean};

    private isLibraryBaseDescendant(unit:ll.ICompilationUnit) {

        var fLine = hlImpl.ramlFirstLine(unit.contents());
        if (!fLine) {
            return false;
        }
        if (fLine.length < 3 || !fLine[2]) {
            return true;
        }
        let typeName = fLine[2];
        if (!this.libTypeDescendants) {
            this.libTypeDescendants = {};
            let u = def.getUniverse("RAML10");
            let libType = u.type(def.universesInfo.Universe10.LibraryBase.name);
            [libType].concat(libType.allSubTypes()).forEach(x=>this.libTypeDescendants[x.nameId()] = true);
        }
        return this.libTypeDescendants[typeName];
    }
}



function extendsValue(u:ll.ICompilationUnit){

    var node = u.ast();
    var eNode = _.find(node.children(), x=>x.key()==universes.Universe10.Extension.properties.extends.name);
    return eNode && eNode.value();
}