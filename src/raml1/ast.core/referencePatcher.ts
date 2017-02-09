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
import expander=require("./expander");
import builder = require("./builder");

export enum PatchMode{
    DEFAULT, PATH
}

export class ReferencePatcher{
    
    constructor(protected mode:PatchMode = PatchMode.DEFAULT){}

    private _outerDependencies:{[key:string]:DependencyMap} = {};

    private _libModels:{[key:string]:LibModel} = {};

    process(
        hlNode:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode=hlNode,
        removeUses:boolean=false,
        patchNodeName:boolean=false){
        if(hlNode.lowLevel()["libProcessed"]){
            return;
        }
        var resolver = (<jsyaml.Project>hlNode.lowLevel().unit().project()).namespaceResolver();
        this.patchReferences(hlNode,rootNode,resolver);
        if(patchNodeName){
            this.patchNodeName(hlNode,rootNode.lowLevel().unit(),resolver);
        }
        if(removeUses){
            this.removeUses(hlNode);
        }
        else {
            this.patchUses(hlNode, resolver);
        }
        this.resetTypes(hlNode);
        hlNode.lowLevel()["libProcessed"] = true;
    }

    patchReferences(
        node:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode = node,
        resolver:namespaceResolver.NamespaceResolver=new namespaceResolver.NamespaceResolver(),
        units:ll.ICompilationUnit[] = [ rootNode.lowLevel().unit() ]){

        if( (<hlimpl.BasicASTNode><any>node).isReused()){
            return;
        }

        var isNode:proxy.LowLevelCompositeNode;
        if(node.definition().property(universeDef.Universe10.TypeDeclaration.properties.annotations.name)!=null){
            var cNode = <proxy.LowLevelCompositeNode>node.lowLevel();
            if(!(proxy.LowLevelCompositeNode.isInstance(cNode))){
                return;
            }
            var isPropertyName = universeDef.Universe10.MethodBase.properties.is.name;
            var traitNodes = node.attributes(isPropertyName);
            if(traitNodes.length!=0) {                                
                isNode = patchMethodIs(node,traitNodes.map(x=>x.lowLevel()).map(x=>{
                    if(!proxy.LowLevelProxyNode.isInstance(x)){
                        return {
                            node: x,
                            transformer: null
                        }
                    }
                    return{
                        node: x,
                        transformer: (<proxy.LowLevelProxyNode>x).transformer()
                    };
                }));
            }
        }

        var attrs = node.attrs();
        for(var attr of attrs){
            var appended = this.appendUnitIfNeeded(attr,units);
            this.patchReferenceAttr(attr,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }

        if(universeHelpers.isTypeDeclarationDescendant(node.definition())){
            var appended = this.appendUnitIfNeeded(node,units);
            this.patchType(node,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }
        
        var childNodes = node.elements();
        for( var ch of childNodes) {
            var appended = this.appendUnitIfNeeded(ch,units);
            this.patchReferences(ch,rootNode,resolver,units);
            this.popUnitIfNeeded(units,appended);
        }
        if(isNode){
            isNode.filterChildren();
            var directChildren = node.directChildren();
            if(directChildren){
                (<hlimpl.ASTNodeImpl>node)._children = this.filterTraitReferences(directChildren);
            }
            var mergedChildren = node.children();
            if(mergedChildren) {
                (<hlimpl.ASTNodeImpl>node)._mergedChildren = this.filterTraitReferences(mergedChildren);
            }
        }
    }
    
    private filterTraitReferences(children:hl.IParseResult[]):hl.IParseResult[]{
        var newChildren:hl.IParseResult[] = [];
        var map = {};
        for(var ch of children){
            var p = ch.property();
            if(!p||!universeHelpers.isIsProperty(p)){
                newChildren.push(ch);
                continue;
            }
            var key = JSON.stringify(json.serialize(ch.lowLevel()));
            if(map[key]){
                continue;
            }
            map[key] = true;
            newChildren.push(ch);
        }
        return newChildren;
    }

    patchReferenceAttr(
        attr:hl.IAttribute,
        rootNode:hl.IHighLevelNode,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[]){

        var property = attr.property();
        var range = property.range();
        if(!range.isAssignableFrom(universeDef.Universe10.Reference.name)){
            return;
        }
        var value = attr.value();
        if(value==null){
            return;
        }

        var llNode:proxy.LowLevelProxyNode = <proxy.LowLevelProxyNode>attr.lowLevel();
        if(!(proxy.LowLevelProxyNode.isInstance(llNode))){
            return;
        }
        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();
        
        var isAnnotation = universeHelpers.isAnnotationsProperty(property);
        if(typeof value == "string"){
            let stringToPatch = value;
            if(transformer!=null){
                var actualNode = toOriginal(llNode);
                stringToPatch = actualNode.value();
            }
            if(isAnnotation){
                stringToPatch = stringToPatch.substring(1,stringToPatch.length-1);
            }
            var newValue = this.resolveReferenceValue(
                stringToPatch,rootNode.lowLevel().unit(),units,resolver,transformer,range);
            if(newValue!=null){
                var newValue1 = isAnnotation ? `(${newValue.value()})` : newValue.value();
                (<proxy.LowLevelProxyNode>attr.lowLevel()).setValueOverride(newValue1);
                (<hlimpl.ASTPropImpl>attr).overrideValue(newValue1);
                this.registerPatchedReference(newValue);
            }
        }
        else{
            var sValue = <hlimpl.StructuredValue>value;
            var key = sValue.lowLevel().key();
            let stringToPatch = key;
            if(transformer!=null){
                var actualNode = toOriginal(sValue.lowLevel());
                stringToPatch = actualNode.key();
            }
            if(key!=null){
                if(isAnnotation){
                    stringToPatch = stringToPatch.substring(1,stringToPatch.length-1);
                }
                var newValue = this.resolveReferenceValue(
                    stringToPatch,rootNode.lowLevel().unit(),units,resolver,transformer,range);
                if(newValue!=null) {
                    var newValue1 = isAnnotation ? `(${newValue.value()})` : newValue.value();
                    (<proxy.LowLevelProxyNode>sValue.lowLevel()).setKeyOverride(newValue1);
                    this.registerPatchedReference(newValue);
                }
            }
        }

    }

    patchType(
        node:hl.IHighLevelNode,
        rootNode:hl.IHighLevelNode,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[]){

        var nodeType = node.definition();
        var localType = node.localType();
        if(localType.isAnnotationType()){
            var superTypes = localType.superTypes();
            if(superTypes.length>0) {
                localType = superTypes[0];
            }
        }
        var isExternal = localType.isExternal();
        if(!isExternal){
            for(var st of localType.superTypes()){
                isExternal = st.isExternal();
                if(isExternal){
                    break;
                }
            }
        }
        
        if(!isExternal) {

            var rootUnit = rootNode.lowLevel().unit();
            var rootPath = rootUnit.absolutePath();
            

            //if(rootPath != localPath) {
                var typeAttributes = node.attributes(universeDef.Universe10.TypeDeclaration.properties.type.name);
                if(typeAttributes.length==0){
                    typeAttributes = node.attributes(universeDef.Universe10.TypeDeclaration.properties.schema.name);
                }
            var itemsAttrs = node.attributes(universeDef.Universe10.ArrayTypeDeclaration.properties.items.name);
            typeAttributes = typeAttributes.concat(itemsAttrs);
            
                for( var typeAttr of typeAttributes) {
                    var llNode:proxy.LowLevelProxyNode = <proxy.LowLevelProxyNode>typeAttr.lowLevel();
                    if(!(proxy.LowLevelProxyNode.isInstance(llNode))){
                        continue;
                    }
                    var localUnit = typeAttr.lowLevel().unit();
                    var localPath = localUnit.absolutePath();

                    var value = typeAttr.value();
                    if(value == null){
                        continue;
                    }
                    if(typeof value == "string") {

                        var gotExpression = checkExpression(value);                        
                        var transformer:expander.DefaultTransformer = <expander.DefaultTransformer>llNode.transformer();
                        var stringToPatch = value;
                        var escapeData:EscapeData = { status: ParametersEscapingStatus.NOT_REQUIRED };
                        var additionalUnits = transformer ? transformer.unitsChain : null;
                        if(transformer!=null||value.indexOf("<<")>=0){                            
                            var actualNode = toOriginal(llNode);
                            var actualValue = actualNode.value();
                            escapeData = escapeTemplateParameters(actualValue);
                            if (escapeData.status == ParametersEscapingStatus.OK) {
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
                        if(additionalUnits){
                            appendedAdditional = [];
                            for(var u of additionalUnits){
                                appendedAdditional.push(this.appendUnitIfNeeded(u,units));
                            }
                        }
                        var appendedAttrUnit = this.appendUnitIfNeeded(typeAttr,units);
                        
                        let newValue:string;
                        if(gotExpression){
                            var expressionPatchFailed = false;
                            var expr = typeExpressions.parse(stringToPatch);
                            var gotPatch = false;
                            typeExpressions.visit(expr, x=> {
                                if (x.type == "name") {
                                    var lit = <typeExpressions.Literal>x;
                                    var typeName = lit.value;
                                    var unescapeData:EscapeData = { status: ParametersEscapingStatus.NOT_REQUIRED };
                                    var unescaped:string;
                                    if(escapeData.status == ParametersEscapingStatus.OK){
                                        unescaped = escapeData.substitutions[typeName];
                                        if(unescaped==null){
                                            unescapeData = unescapeTemplateParameters(
                                                typeName,escapeData.substitutions);
                                            if(unescapeData.status==ParametersEscapingStatus.OK){
                                                typeName = unescapeData.resultingString;
                                            }
                                            else if(unescapeData.status==ParametersEscapingStatus.ERROR){
                                                expressionPatchFailed = true;
                                                return;
                                            }
                                        }
                                        else{
                                            typeName = unescaped;
                                        }
                                    }
                                    if(transformer==null && (unescaped!=null||unescapeData.status==ParametersEscapingStatus.OK)){
                                        lit.value = typeName;
                                        return;
                                    }
                                    var patchTransformedValue = true;
                                    if(typeName.indexOf("<<")>=0&&this.isCompoundValue(typeName)){
                                        patchTransformedValue = false;
                                    }
                                    var patched = this.resolveReferenceValue(
                                        typeName, rootUnit, units, resolver, transformer, nodeType, patchTransformedValue);
                                    if (patched != null) {
                                        lit.value = patched.value();
                                        gotPatch = true;
                                        this.registerPatchedReference(patched);
                                    }
                                }
                            });
                            if(gotPatch&&!expressionPatchFailed) {
                                newValue = typeExpressions.serializeToString(expr);
                            }
                            else{
                                newValue = value;                                
                            }
                        }
                        else if(!(escapeData.status==ParametersEscapingStatus.OK && transformer==null)){
                            if(stringToPatch.indexOf("<<")>=0&&this.isCompoundValue(stringToPatch)){
                                stringToPatch = value;
                                transformer = null;
                            }
                            var patched = this.resolveReferenceValue(stringToPatch, rootUnit, units, resolver, transformer, nodeType);
                            if(patched!=null) {
                                this.registerPatchedReference(patched);
                                newValue = patched.value();
                            }
                        }
                        if (newValue != null) {
                            (<proxy.LowLevelProxyNode>typeAttr.lowLevel()).setValueOverride(newValue);
                            (<hlimpl.ASTPropImpl>typeAttr).overrideValue(null);
                        }
                        this.popUnitIfNeeded(units,appendedAttrUnit);
                        if(appendedAdditional){
                            for(var ap of appendedAdditional.reverse()){
                                this.popUnitIfNeeded(units,ap);
                            }
                        }
                    }
                    else{
                        var llTypeNode = typeAttr.lowLevel();
                        if(llTypeNode.key()!=typeAttr.property().nameId()){
                            llTypeNode = _.find(node.lowLevel().children(),x=>x.key()==typeAttr.property().nameId());
                        }
                        if(llTypeNode){
                            var def = node.definition().universe().type(universeDef.Universe10.TypeDeclaration.name);
                            var newNode = new hlimpl.ASTNodeImpl(llTypeNode,null,def,null);
                            var appended = this.appendUnitIfNeeded(newNode,units);
                            this.patchReferences(newNode,rootNode,resolver,units);
                            this.popUnitIfNeeded(units,appended);
                        }
                    }
                }
            // }
        }
    }

    private resolveReferenceValue(
        stringToPatch:string,
        rootUnit:ll.ICompilationUnit,
        units:ll.ICompilationUnit[],
        resolver:namespaceResolver.NamespaceResolver,
        transformer:expander.DefaultTransformer,
        range:def.ITypeDefinition,
        patchTransformedValue = true):PatchedReference
    {
        var isAnnotation = universeHelpers.isAnnotationRefTypeOrDescendant(range);
        var newValue:PatchedReference;
        if (transformer) {
            if (stringToPatch && stringToPatch.indexOf("<<") >= 0) {
                var doContinue = true;
                var types = (<hlimpl.ASTNodeImpl>rootUnit.highLevel()).types();
                var newValue1 = transformer.transform(stringToPatch, true, ()=>doContinue, (val, tr)=> {
                    var newVal = this.resolveReferenceValueBasic(val, rootUnit, resolver, tr.unitsChain, range);
                    if (newVal == null) {
                        newVal = new PatchedReference(null,val,this.collectionName(range),rootUnit,PatchMode.DEFAULT);
                    }
                    if(isAnnotation){
                        if (types.getAnnotationType(newVal.value()) != null) {
                            doContinue = false;
                        }
                        else {
                            doContinue = false;
                        }
                    }
                    else if (types.getType(newVal.value()) != null) {
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
        if (newValue === undefined || !instanceOfPatchedReference(newValue)) {
            newValue = this.resolveReferenceValueBasic(stringToPatch, rootUnit, resolver, units, range);
        }
        return newValue;
    }

    patchNodeName(
        hlNode:hl.IHighLevelNode,
        rootUnit:ll.ICompilationUnit,
        resolver:namespaceResolver.NamespaceResolver){
        
        var llNode = <proxy.LowLevelProxyNode>hlNode.lowLevel();
        var key = llNode.key();
        var range  = hlNode.definition();        
        if(universeHelpers.isTypeDeclarationSibling(range)) {
            var localType = hlNode.localType();
            if(localType.isAnnotationType()){
                range = localType;
            }
        }
        
        var patched = this.resolveReferenceValueBasic(key,rootUnit,resolver,[llNode.unit()],range);
        if(patched != null){
            llNode.setKeyOverride(patched.value());
        }
    }

    resolveReferenceValueBasic(
        _value:string,
        rootUnit:ll.ICompilationUnit,
        resolver:namespaceResolver.NamespaceResolver,
        units:ll.ICompilationUnit[],
        range:def.ITypeDefinition):PatchedReference{
        
        if(_value==null || typeof(_value)!="string"){
            return null;
        }

        var isType = universeHelpers.isTypeDeclarationDescendant(range);
        var gotQuestion = isType && util.stringEndsWith(_value,"?");
        var value = gotQuestion ? _value.substring(0,_value.length-1) : _value;

        var ind = value.lastIndexOf(".");

        var referencedUnit:ll.ICompilationUnit;
        var plainName:string;
        if (ind >= 0) {
            var oldNS = value.substring(0, ind);
            plainName = value.substring(ind + 1);

            for(var i = units.length ; i > 0 ; i--) {
                var localUnit = units[i-1];
                var nsMap = resolver.nsMap(localUnit);
                if(nsMap==null){
                    continue;
                }
                var info = nsMap[oldNS];
                if(info==null){
                    continue;
                }
                referencedUnit = info.unit;
                if(referencedUnit!=null){
                    break;
                }
            }
        }
        else {
            if(isType&&def.rt.builtInTypes().get(value)!=null){
                return null;
            }
            plainName = value;
            referencedUnit = units[units.length-1];
        }
        var collectionName = this.collectionName(range);
        if(referencedUnit==null||referencedUnit.absolutePath()==rootUnit.absolutePath()){
            return null;
        }
        var usesInfo = resolver.resolveNamespace(rootUnit, referencedUnit);
        if(usesInfo==null){
            return null;
        }
        var newNS = usesInfo.namespace();
        if (newNS == null) {
            return null;
        }
        if(this.mode == PatchMode.PATH){
            var aPath = referencedUnit.absolutePath().replace(/\\/g,"/");
            if(!ll.isWebPath(aPath)){
                aPath = "file://" + aPath;
            }
            newNS = `${aPath}#/${collectionName}`;
        }
        if(gotQuestion){
            plainName += "?";
        }
        return new PatchedReference(newNS,plainName,collectionName,referencedUnit,this.mode);
    }

    private patchUses(hlNode:hl.IHighLevelNode,resolver:namespaceResolver.NamespaceResolver){
        var node = hlNode.lowLevel();
        hlNode.children();
        if(!(proxy.LowLevelCompositeNode.isInstance(node))){
            return;
        }
        var unit = node.unit();
        var extendedUnitMap = resolver.expandedPathMap(unit);
        if(extendedUnitMap==null){
            return;
        }
        var unitMap = resolver.pathMap(unit);
        if(!unitMap){
            unitMap = {};
        }

        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesPropName = universeDef.Universe10.FragmentDeclaration.properties.uses.name;
        var usesNodes = originalChildren.filter(x=>x.key()== usesPropName);

        var oNode = toOriginal(node);
        var yamlNode = oNode;
        while(proxy.LowLevelProxyNode.isInstance(yamlNode)){
            yamlNode = (<proxy.LowLevelProxyNode>yamlNode).originalNode();
        }

        var usesInfos = Object.keys(unitMap).map(x=>extendedUnitMap[x]);
        var extendedUsesInfos = Object.keys(extendedUnitMap).map(x=>extendedUnitMap[x])
            .filter(x=>!unitMap[x.absolutePath()]/*&&this.usedNamespaces[x.namespace()]*/);

        var u = node.unit();
        var unitPath = u.absolutePath();


        var existingLibs = {};
        var usesNode:proxy.LowLevelCompositeNode;
        if(usesNodes.length>0){
            usesNode = <proxy.LowLevelCompositeNode>usesNodes[0];
            usesNode.children().forEach(x=>existingLibs[x.key()]=true);
        }
        else{
            var newUses = jsyaml.createMapNode("uses");
            newUses["_parent"] = <jsyaml.ASTNode>yamlNode;
            newUses.setUnit(yamlNode.unit());
            usesNode = cNode.replaceChild(null,newUses);
        }
        var usesProp = hlNode.definition().property(usesPropName);
        var usesType = usesProp.range(); 
        for (var ui of usesInfos.concat(extendedUsesInfos)) {
            var up = ui.absolutePath();
            if(existingLibs[ui.namespace()]){
                continue;
            }
            var ip = ui.includePath;
            var mapping = jsyaml.createMapping(ui.namespace(), ip);
            mapping.setUnit(yamlNode.unit());
            var hlUses = new hlimpl.ASTNodeImpl(mapping,hlNode,usesType,usesProp);
            (<hlimpl.ASTNodeImpl>hlNode)._children.push(hlUses);
            (<hlimpl.ASTNodeImpl>hlNode)._mergedChildren.push(hlUses);
            usesNode.replaceChild(null,mapping);
        }
    }

    removeUses(hlNode:hl.IHighLevelNode){
        var node = hlNode.lowLevel();
        if(!(proxy.LowLevelCompositeNode.isInstance(node))){
            return;
        }
        var cNode = <proxy.LowLevelCompositeNode>node;
        var originalChildren = node.children();
        var usesNodes = originalChildren.filter(x=>
            x.key()==universeDef.Universe10.FragmentDeclaration.properties.uses.name);
        if(usesNodes.length>0){
            cNode.removeChild(usesNodes[0]);
        }
        (<hlimpl.ASTNodeImpl>hlNode)._children = hlNode.directChildren().filter(x=>{
            var p = x.property();
            return p == null || !universeHelpers.isUsesProperty(p);
        });
        (<hlimpl.ASTNodeImpl>hlNode)._mergedChildren = hlNode.children().filter(x=>{
            var p = x.property();
            return p == null || !universeHelpers.isUsesProperty(p);
        });
    }

    resetTypes(hlNode:hl.IHighLevelNode) {
        for(var ch of hlNode.elements()){
            this.resetTypes(ch);
        }
        // for(var attr of hlNode.attrs()){
        //     (<hlimpl.ASTPropImpl>attr).patchType(null);
        // }
        delete hlNode.lowLevel().actual().types;
        delete hlNode["_ptype"];
        delete hlNode["_types"];
        (<hlimpl.ASTNodeImpl>hlNode).setAssociatedType(null);
    };

    appendUnitIfNeeded(node:hl.IParseResult|ll.ICompilationUnit,units:ll.ICompilationUnit[]):boolean{
        if(jsyaml.CompilationUnit.isInstance(node)){
            var unit = <ll.ICompilationUnit>node;
            if (unit.absolutePath() != units[units.length - 1].absolutePath()) {
                units.push(unit);
                return true;
            }
            return false;
        }
        var originalNode = toOriginal((<hl.IParseResult>node).lowLevel());
        var originalUnit = originalNode.unit();
        if(originalNode.valueKind()==yaml.Kind.INCLUDE_REF){
            var ref = originalNode.includePath();
            var includedUnit = originalUnit.resolve(ref);
            if(includedUnit) {
                units.push(includedUnit);
                return true;
            }
            return false;
        }
        else {
            if (originalUnit.absolutePath() != units[units.length - 1].absolutePath()) {
                units.push(originalUnit);
                return true;
            }
            return false;
        }
    }
    popUnitIfNeeded(units:ll.ICompilationUnit[],appended:boolean) {
        if (appended) {
            units.pop();
        }
    }

    registerPatchedReference(ref:PatchedReference){

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

    private collectionName(range:def.ITypeDefinition):string {
        var collectionName:string;
        if (universeHelpers.isResourceTypeRefType(range)||universeHelpers.isResourceTypeType(range)) {
            collectionName = def.universesInfo.Universe10.LibraryBase.properties.resourceTypes.name;
        }
        else if (universeHelpers.isTraitRefType(range)||universeHelpers.isTraitType(range)) {
            collectionName = def.universesInfo.Universe10.LibraryBase.properties.traits.name;
        }
        else if (universeHelpers.isSecuritySchemeRefType(range)||universeHelpers.isSecuritySchemaTypeDescendant(range)) {
            collectionName = def.universesInfo.Universe10.LibraryBase.properties.securitySchemes.name;
        }
        else if (universeHelpers.isAnnotationRefTypeOrDescendant(range)||range.isAnnotationType()) {
            collectionName = def.universesInfo.Universe10.LibraryBase.properties.annotationTypes.name;
        }
        else if (universeHelpers.isTypeDeclarationDescendant(range)) {
            collectionName = def.universesInfo.Universe10.LibraryBase.properties.types.name;
        }
        return collectionName;
    }

    expandLibraries(api:hl.IHighLevelNode){

        if(api.lowLevel().actual().libExpanded){
            return;
        }
        var llNode = api.lowLevel();
        var unit = llNode.unit();
        var rootPath = unit.absolutePath();
        var project = unit.project();
        var libModels:LibModel[] = [];
        var resolver = (<jsyaml.Project>llNode.unit().project()).namespaceResolver();
        var expandedPathMap = resolver.expandedPathMap(unit);
        if(expandedPathMap!=null) {
            var libPaths = Object.keys(expandedPathMap).sort();
            for (var ns of libPaths) {
                var libModel = this._libModels[ns];
                if (libModel == null) {
                    var libUnit = project.unit(ns, true);
                    var usesInfo = resolver.resolveNamespace(unit, libUnit);
                    if (libUnit && usesInfo != null && usesInfo.namespace() != null) {
                        libModel = this.extractLibModel(libUnit);
                    }
                }
                if (libModel) {
                    libModels.push(libModel);
                }
            }
            var gotContribution = false;
            for (var libModel of libModels) {
                for (var cName of Object.keys(libModel)) {
                    var collection:ElementsCollection = <ElementsCollection>libModel[cName];
                    if (ElementsCollection.isInstance(collection)) {
                        gotContribution = this.contributeCollection(api,collection) || gotContribution;
                    }
                }
            }
            api.resetChildren();
            this.resetTypes(api);
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
        api.lowLevel().actual().libExpanded = true;
        this.resetTypes(api);
    }

    private patchDependencies(api:hl.IHighLevelNode):boolean {
        var result = false;
        var apiPath = api.lowLevel().unit().absolutePath();
        for (var ch of api.children()) {
            if (!ch.isElement()||ch.lowLevel()["libProcessed"]) {
                continue;
            }
            var chNode = ch.asElement();
            this.removeUses(chNode);
            var chPath = ch.lowLevel().unit().absolutePath();
            if (chPath == apiPath && ch.lowLevel().includePath() == null) {
                continue;
            }
            var dependencies = this._outerDependencies[chPath];
            if(dependencies==null){
                continue;
            }
            var pName = chNode.property().nameId();
            var depCollection = dependencies[pName];
            if(depCollection==null){
                continue;
            }
            var chName = chNode.name();
            if(depCollection[chName]==null){
                continue;
            }
            this.process(chNode, api, true, true);
            result = true;
        }
        return result;
    }

    private removeUnusedDependencies(api:hl.IHighLevelNode) {
        var llNode = <proxy.LowLevelCompositeNode>api.lowLevel();
        var apiPath = llNode.unit().absolutePath();
        var children = [].concat(api.children());
        for (var ch of children) {
            var chLl = ch.lowLevel();
            if (ch.isElement()&&chLl["libProcessed"]) {
                continue;
            }
            var chPath = chLl.unit().absolutePath();
            if (chPath == apiPath) {
                continue;
            }
            (<proxy.LowLevelCompositeNode>chLl.parent()).removeChild(chLl);
        }
    }

    private contributeCollection(api:hl.IHighLevelNode, collection:ElementsCollection):boolean {

        var llApi = <proxy.LowLevelCompositeNode>api.lowLevel()
        if(collection.array.length==0){
            return false;
        }
        var name = collection.name;
        var prop = api.definition().property(name);
        var propRange = prop.range();
        var llNode:proxy.LowLevelCompositeNode = <proxy.LowLevelCompositeNode>_.find(
            llApi.children(),
            x=>x.key()==name);
        if(llNode==null){
            var n = jsyaml.createMapNode(name);
            llNode = llApi.replaceChild(null,n);
        }
        var result = false;
        var directChildren = (<hlimpl.ASTNodeImpl>api)._children;
        var mergedChildren = (<hlimpl.ASTNodeImpl>api)._mergedChildren;
        for(var e of collection.array){
            if(llNode.children().some(x=>{
                    var oNode = toOriginal(x);
                    if(oNode.unit().absolutePath()!=e.lowLevel().unit().absolutePath()){
                        return false;
                    }
                    return e.lowLevel().key()==oNode.key() && e.lowLevel().unit().absolutePath() == oNode.unit().absolutePath();
                })){
                continue;
            }
            var newLlNode = llNode.replaceChild(null,e.lowLevel());
            var newHLNode = new hlimpl.ASTNodeImpl(newLlNode,api,propRange,prop);
            if(name=="types"||name=="annotationTypes"){
                newHLNode.patchType(builder.doDescrimination(newHLNode));
            }
            directChildren.push(newHLNode);
            if(mergedChildren){
                mergedChildren.push(newHLNode);
            }
            result = true;
        }
        return result;
    }



    private extractLibModel(unit:ll.ICompilationUnit):LibModel{
        var result:LibModel = this._libModels[unit.absolutePath()];
        if(result!=null){
            return result;
        }
        result = new LibModel(unit);
        this._libModels[unit.absolutePath()] = result;
        var hlNode = (<jsyaml.CompilationUnit>unit).highLevel();
        if(hlNode && hlNode.isElement()){
            for(var cName of ["resourceTypes", "traits", "types", "annotationTypes", "securitySchemes"]){
                var collection = new ElementsCollection(cName);
                for(var el of hlNode.asElement().elementsOfKind(cName)){
                    collection.array.push(el);
                }
                result[cName] = collection;
            }
        }
        return result;
    }

    private isCompoundValue(str:string):boolean{
        var i0 = str.indexOf("<<");
        if(i0<0){
            return false;
        }
        if(i0!=0){
            return true;
        }
        var i1 = str.indexOf(">>",i0);
        if(i1+">>".length!=str.length){
            return true;
        }
        return false;
    }
}

export enum ParametersEscapingStatus{
    OK, NOT_REQUIRED, ERROR
}

export interface EscapeData{
    resultingString?: string,
    substitutions?: {[key:string]:string},
    status: ParametersEscapingStatus
}

var PARAM_OCCURENCE_STR = "__P_A_R_A_M_E_T_E_R__";

export function escapeTemplateParameters(str:string):EscapeData{
    if(str==null||typeof str != "string"){
        return { status: ParametersEscapingStatus.NOT_REQUIRED }
    }
    var resultingString = "";
    var map:{[key:string]:string} = {};
    var prev = 0;
    for(var i = str.indexOf("<<") ; i>=0 ; i = str.indexOf("<<",prev)){
        resultingString += str.substring(prev,i);
        prev = str.indexOf(">>",i);
        if(prev<0){
            return { status: ParametersEscapingStatus.ERROR };
        }
        prev += ">>".length;
        var paramStr = str.substring(i,prev);
        var substitution = PARAM_OCCURENCE_STR + i + PARAM_OCCURENCE_STR;
        map[substitution] = paramStr;
        resultingString+=substitution;
    }
    if(resultingString.length==0){
        return { status: ParametersEscapingStatus.NOT_REQUIRED }
    }
    resultingString += str.substring(prev,str.length);
    return {
        resultingString: resultingString,
        substitutions: map,
        status: ParametersEscapingStatus.OK
    };
}

export function unescapeTemplateParameters(str:string,substitutions:{[key:string]:string}):EscapeData{
    if(str==null){
        return { status: ParametersEscapingStatus.NOT_REQUIRED };
    }
    var resultingString = "";
    var prev = 0;
    for(var i = str.indexOf(PARAM_OCCURENCE_STR); i>=0 ; i = str.indexOf(PARAM_OCCURENCE_STR,prev)){
        prev = str.indexOf(PARAM_OCCURENCE_STR,i+1);
        prev += PARAM_OCCURENCE_STR.length;
        if(prev<0){
            return { status: ParametersEscapingStatus.ERROR };
        }
        var substitution = str.substring(i,prev);
        var originalParamOccurence = substitutions[substitution];
        if(originalParamOccurence==null){
            return { status: ParametersEscapingStatus.ERROR };
        }
        resultingString += originalParamOccurence;
    }
    if(resultingString.length==0){
        return { status: ParametersEscapingStatus.NOT_REQUIRED };
    }
    resultingString += str.substring(prev,str.length);
    return {
        resultingString: resultingString,
        substitutions: substitutions,
        status: ParametersEscapingStatus.OK
    };
}


function checkExpression(value:string) {
    var gotExpression = false;
    for (let i = 0; i < value.length; i++) {
        let ch = value.charAt(i);
        if (ch == "|" || ch == "(" || ch == "[") {
            gotExpression = true;
            break;
        }
    }
    return gotExpression;
};


export function patchMethodIs(node:hl.IHighLevelNode,traits:{
    node:ll.ILowLevelASTNode,
    transformer:proxy.ValueTransformer
}[]):proxy.LowLevelCompositeNode{
    
    var llMethod = <proxy.LowLevelCompositeNode>node.lowLevel();
    var ramlVersion = node.definition().universe().version();
    var originalLlMethod = toOriginal(llMethod);
    var isPropertyName = universeDef.Universe10.MethodBase.properties.is.name;
    var isNode = <proxy.LowLevelCompositeNode>_.find(
        llMethod.children(), x=>x.key() == isPropertyName);

    if(isNode==null){
        var newLLIsNode = new jsyaml.ASTNode(
            yaml.newMapping(yaml.newScalar(isPropertyName), yaml.newItems())
            ,originalLlMethod.unit(),<jsyaml.ASTNode>originalLlMethod,null,null);

        isNode = (<proxy.LowLevelCompositeNode>llMethod).replaceChild(null,newLLIsNode);
    }
    var originalIsNode = _.find(originalLlMethod.children(), x=>x.key()==isPropertyName);
    var childrenToPreserve = originalIsNode != null ? originalIsNode.children() : [];

    var newTraits = childrenToPreserve.concat(traits.map(x=>{
        var llChNode = prepareTraitRefNode(x.node,isNode);
        if(llChNode!=null) {
            var cNode = new proxy.LowLevelCompositeNode(llChNode, isNode, x.transformer, ramlVersion);
            return cNode;
        }
        return null;
    })).filter(x=>x!=null);
    isNode.setChildren(newTraits);
    isNode.filterChildren();
    newTraits = isNode.children();
    var directChildren = node.directChildren();
    var isProp = node.definition().property("is");
    var isPropRange = isProp.range();
    if(directChildren){
        directChildren = directChildren.filter(x=>{
            var p = x.property();
            return p==null || !universeHelpers.isIsProperty(p); 
        });        
        (<hlimpl.ASTNodeImpl>node)._children = directChildren.concat(newTraits.map(x=>
            new hlimpl.ASTPropImpl(x,node,isPropRange,isProp)
        ));
    }
    var mergedChildren = node.children();
    if(mergedChildren) {
        mergedChildren = mergedChildren.filter(x=>{
            var p = x.property();
            return p==null || !universeHelpers.isIsProperty(p);
        });
        (<hlimpl.ASTNodeImpl>node)._mergedChildren = mergedChildren.concat(newTraits.map(x=>
            new hlimpl.ASTPropImpl(x,node,isPropRange,isProp)
        ));
    }
    return isNode;
}

export function prepareTraitRefNode(llNode:ll.ILowLevelASTNode,llParent:ll.ILowLevelASTNode){

    llParent = toOriginal(llParent);
    llNode = toOriginal(llNode);
    var yNode = <yaml.YAMLNode>llNode.actual();
    if(yNode==null){
        return null;
    }
    if(llNode.key()==universeDef.Universe10.MethodBase.properties.is.name){
        yNode = (<jsyaml.ASTNode>llNode).yamlNode().value;
    }
    if(yNode==null){
        return null;
    }
    if(yNode.kind == yaml.Kind.SEQ){
        yNode = (<yaml.YAMLSequence>yNode).items[0];
    }
    if(yNode==null){
        return null;
    }
    var result = new jsyaml.ASTNode(yNode,llNode.unit(),<jsyaml.ASTNode>llParent,null,null);
    return result;
}

function toOriginal(node:ll.ILowLevelASTNode){
    for(var i = 0; i<2 && proxy.LowLevelProxyNode.isInstance(node); i++){
        node = (<proxy.LowLevelProxyNode>node).originalNode();
    }
    return node;
}

export class PatchedReference{

    constructor(
        private _namespace:string,
        private _name:string,
        private _collectionName:string,
        private _referencedUnit:ll.ICompilationUnit,
        private _mode:PatchMode){
        
        var l = this._name.length;
        if(this._name.charAt(l-1)=="?"){
            this.gotQuestion = true;
            this._name = this._name.substring(0,l-1);
        }
    }
    
    referencedNode: ll.ILowLevelASTNode;

    gotQuestion:boolean = false;

    namespace():string{ return this._namespace; }

    name():string{ return this._name; }

    collectionName():string{ return this._collectionName; }

    referencedUnit():ll.ICompilationUnit{ return this._referencedUnit; }
    
    mode():PatchMode{ return this._mode; }

    value():string{
        if(this._namespace==null){
            return this._name;
        }
        var delim = this._mode == PatchMode.PATH ? "/" : ".";
        return this._namespace + delim + this._name + (this.gotQuestion ? "?" : "");
    }
}

export function instanceOfPatchedReference(instance : any) : instance is PatchedReference {
    if (!instance) return false;
    
    return instance.namespace != null && typeof(instance.namespace) == "function" &&
        instance.name != null && typeof(instance.name) == "function" &&
        instance.collectionName != null && typeof(instance.collectionName) == "function" &&
        instance.referencedUnit != null && typeof(instance.referencedUnit) == "function" &&
        instance.mode != null && typeof(instance.mode) == "function";
}

class ElementsCollection{
    private static CLASS_IDENTIFIER = "referencePatcher.ElementsCollection";

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

    array:hl.IHighLevelNode[] = [];
}

class LibModel{
    
    constructor(public unit:ll.ICompilationUnit){}

    resourceTypes:ElementsCollection;

    traits:ElementsCollection;

    securitySchemes:ElementsCollection;

    annotationTypes:ElementsCollection;

    types:ElementsCollection;
    
    

}

type DependencyMap = {[key:string]:{[key:string]:PatchedReference}};

export function getDeclaration(
    elementName:string,
    typeName:string,
    resolver:namespaceResolver.NamespaceResolver,
    units:ll.ICompilationUnit[]):hl.IHighLevelNode{
    
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
    var result:hl.IHighLevelNode;
    var gotLibrary = false;
    for(var i = units.length ; i > 0 ; i--){
        var u = units[i-1];
        var hl = u.highLevel();
        if(hl.isElement()){
            if(universeHelpers.isLibraryType(hl.asElement().definition())){
                if(gotLibrary){
                    break;
                }
                gotLibrary = true;
            }
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
        var ahl = actualUnit.highLevel();
        if(!ahl || !ahl.isElement()){
            continue;
        }
        result = _.find(ahl.asElement().elementsOfKind(typeName),x=>x.name()==name);
        if(result){
            break;
        }
    }
    return result;
}