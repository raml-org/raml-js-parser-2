/// <reference path="../../../typings/main.d.ts" />

import ll=require("../lowLevelAST")
import path = require("path")
import universes = require("../tools/universe");
import jsyaml = require("../jsyaml/jsyaml2lowLevel")
import universeHelpers = require("../tools/universeHelpers");

export class NamespaceResolver{

    private expandedAbsToNsMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private byPathMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private byNsMap:{[key:string]:{[key:string]:UsesInfo}} = {};

    private _hasFragments: {[key:string]:boolean} = {};

    resolveNamespace(from:ll.ICompilationUnit, to:ll.ICompilationUnit):string{

        if(to==null){
            return null;
        }
        var toPath = to.absolutePath();
        var unitMap = this.expandedPathMap(from);
        if(!unitMap){
            return null;
        }
        var usesInfo = unitMap[toPath];
        return usesInfo != null ? usesInfo.namespace() : null;
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
            var hlNode = u.highLevel();
            if (hlNode.isElement()) {
                var hlElem = hlNode.asElement();
                var definition = hlElem.definition();
                if (universeHelpers.isOverlayType(definition) || universeHelpers.isExtensionType(definition)) {
                    var eValue = hlElem.attr(universes.Universe10.Extension.properties.extends.name).value();
                    _unit = u.resolve(eValue);
                }
            }
        }

        for(var i = 0 ; i < usesInfoArray.length ; i++){

            var info = usesInfoArray[i];
            var unit = info.unit;
            var hlPR = unit.highLevel();
            if(!hlPR.isElement()){
                continue;
            }
            var steps = info.steps() + 1;
            var visit = (x:ll.ILowLevelASTNode)=>{

                var children = x.children();

                if(x.parent()==null) {

                    var nodeUnit = x.unit();
                    if(nodeUnit.absolutePath()!=unit.absolutePath()){
                        this._hasFragments[unit.absolutePath()] = true;
                    }
                    var map = this.pathMap(nodeUnit);
                    if(map) {
                        for (var absPath of Object.keys(map)) {

                            var childInfo = map[absPath];
                            var segments = info.namespaceSegments.concat(childInfo.namespaceSegments);
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
                            if (path.isAbsolute(info.includePath) || ll.isWebPath(info.includePath)) {
                                includePath = childInfo.absolutePath();
                            }
                            else if (path.isAbsolute(childInclude) || ll.isWebPath(childInclude)) {
                                includePath = childInfo.absolutePath();
                            }
                            else {
                                includePath = path.relative(rootPath, childInfo.absolutePath());
                            }
                            includePath = includePath.replace(/\\/g, "/");
                            var ui = new UsesInfo(segments, childInfo.unit, includePath);
                            result[absPath] = ui;
                            usesInfoArray.push(ui);
                        }
                    }
                }
                children.forEach(y=>{
                    if(y.includedFrom()){
                        y=y.parent();
                    }
                    visit(y);
                });

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
            var key = un.key();
            var value = un.value();
            var libUnit = unit.resolve(value);
            if(libUnit==null){
                continue;
            }

            var segments = [ key ];
            var absPath = libUnit.absolutePath();
            
            var includePath;
            if (path.isAbsolute(value) || ll.isWebPath(value)) {
                includePath = libUnit.absolutePath();
            }
            else {
                includePath = path.relative(rootPath, libUnit.absolutePath());
            }
            includePath = includePath.replace(/\\/g, "/");
            var ui = new UsesInfo(segments, libUnit, includePath);
            result[absPath] = ui;
        }

        var hlNode = unit.highLevel();
        if (hlNode.isElement()) {
            var hlElem = hlNode.asElement();
            var definition = hlElem.definition();
            if (universeHelpers.isOverlayType(definition) || universeHelpers.isExtensionType(definition)) {
                var eValue = hlElem.attr(universes.Universe10.Extension.properties.extends.name).value();
                var extendedUnit:ll.ICompilationUnit;
                try {
                    extendedUnit = unit.resolve(eValue);
                }
                catch(e){}
                if(extendedUnit){
                    var m = this.pathMap(extendedUnit);
                    if(m){
                        for(var k of Object.keys(m)){
                            result[k] = m[k];
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
}

export class UsesInfo{

    constructor(
        public namespaceSegments:string[],
        public unit:ll.ICompilationUnit,
        public includePath:string
    ){}

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