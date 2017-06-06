/// <reference path="../../../typings/main.d.ts" />
import ll=require("../lowLevelAST")
import hl=require("../highLevelAST")
import hlImpl=require("../highLevelImpl")
import yaml=require("yaml-ast-parser")
import json=require("../jsyaml/json2lowLevel")
var stringify=require("json-stable-stringify")
import impl=require("../jsyaml/jsyaml2lowLevel")
import util=require("../../util/index")
import universes=require("../tools/universe")
import def = require("raml-definition-system")
import refResolvers=require("../jsyaml/includeRefResolvers")
import universeHelpers = require("../tools/universeHelpers");
import referencePatcher = require("./referencePatcher");
var _ = require("underscore");

export class LowLevelProxyNode implements ll.ILowLevelASTNode{

    private static CLASS_IDENTIFIER = "LowLevelASTProxy.LowLevelProxyNode";

    public static isInstance(instance : any) : instance is LowLevelProxyNode {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),LowLevelProxyNode.CLASS_IDENTIFIER);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = [];

        return superIdentifiers.concat(LowLevelProxyNode.CLASS_IDENTIFIER);
    }

    constructor(
        protected _parent:ll.ILowLevelASTNode,
        protected _transformer:ValueTransformer,
        protected ramlVersion:string){}

    protected _originalNode:ll.ILowLevelASTNode;

    private _highLevelNode:hl.IHighLevelNode;

    private _highLevelParseResult:hl.IParseResult;

    protected _keyOverride:string;

    protected _valueOverride:string;

    hasInnerIncludeError(){
        return this._originalNode.hasInnerIncludeError();
    }

    keyKind(){
        return this._originalNode.keyKind();
    }
    primaryNode():ll.ILowLevelASTNode{
        return null;
    }
    isAnnotatedScalar(){
        return this._originalNode.isAnnotatedScalar()
    }

    actual(){
        if (this._originalNode){
            return this._originalNode.actual();
        }
        return this;
    }

    transformer():ValueTransformer{ return this._transformer; }

    setTransformer(tr:ValueTransformer) {
        this._transformer = tr;
    }

    originalNode():ll.ILowLevelASTNode{
        return this._originalNode;
    }

    start():number { return this._originalNode.start(); }

    end():number { return this._originalNode.end(); }

    value(toString?:boolean):any {
        throw new Error('The method must be overridden');
    }

    includeErrors():string[] { return this._originalNode.includeErrors(); }

    includePath():string { return this._originalNode.includePath(); }

    includeReference():refResolvers.IncludeReference { return this._originalNode.includeReference(); }

    setKeyOverride(_key:string){
        this._keyOverride=_key;
    }

    setValueOverride(value:any){
        this._valueOverride=value;
    }

    key(raw:boolean=false):string {
        if (this._keyOverride){
            return this._keyOverride;
        }
        return (<any>this._originalNode).key(raw);
    }

    optional():boolean{
        return this.originalNode().optional();
    }

    children():ll.ILowLevelASTNode[] {

        throw new Error('The method must be overridden');
    }

    parent():ll.ILowLevelASTNode { return this._parent;}

    unit():ll.ICompilationUnit { return this._originalNode.unit(); }

    containingUnit():ll.ICompilationUnit { return this._originalNode.containingUnit(); }

    includeBaseUnit():ll.ICompilationUnit { return this._originalNode.unit(); }

    anchorId():string { return this._originalNode.anchorId(); }

    errors():Error[] { return this._originalNode.errors(); }

    anchoredFrom():ll.ILowLevelASTNode{ return this._originalNode.anchoredFrom(); }

    includedFrom():ll.ILowLevelASTNode{ return this._originalNode.includedFrom() }

    visit(v:ll.ASTVisitor) {
        if(v(this)) {
            this.children().forEach(x=>x.visit(v));
        }
    }

    //TODO
    addChild(n:ll.ILowLevelASTNode){}

    //TODO
    execute(cmd:ll.CompositeCommand){}

    //TODO
    dump():string{ return null; }

    dumpToObject(full:boolean):any{
        var serialized = json.serialize2(this,full);
        //var serialized = json.serialize(this);
        if(this.kind() == yaml.Kind.MAPPING){
            var obj:any = {};
            obj[this.key(true)] = serialized;
            return obj;
        }
        return serialized;
    }


    keyStart():number { return this._originalNode.keyStart(); }

    keyEnd():number { return this._originalNode.keyEnd(); }

    valueStart():number { return this._originalNode.valueStart(); }

    valueEnd():number { return this._originalNode.valueEnd(); }

    isValueLocal():boolean { return this._originalNode.isValueLocal(); }

    kind(): yaml.Kind { return this._originalNode.kind(); }

    valueKind(): yaml.Kind { return this._originalNode.valueKind(); }

    anchorValueKind(){ return this._originalNode.anchorValueKind(); }

    resolvedValueKind(){ return this._originalNode.resolvedValueKind() };

    show(msg: string) { this._originalNode.show(msg); }

    setHighLevelParseResult(highLevelParseResult:hl.IParseResult){
        this._highLevelParseResult = highLevelParseResult;
    }

    highLevelParseResult():hl.IParseResult{
        return this._highLevelParseResult;
    }

    setHighLevelNode(highLevel:hl.IHighLevelNode){
        this._highLevelNode = highLevel;
    }

    highLevelNode():hl.IHighLevelNode{
        if(this._highLevelNode) {
            return this._highLevelNode;
        }
        return this._originalNode.highLevelNode();
    }

    text(unitText:string):string{
        throw new Error("not implemented");
    }

    copy():LowLevelCompositeNode{
        throw new Error("not implemented");
    }

    markup(json?: boolean): string {
        throw new Error("not implemented");
    }

    nodeDefinition(): hl.INodeDefinition{
        return impl.getDefinitionForLowLevelNode(this);
    }

    includesContents() : boolean {
        return this._originalNode.includesContents();
    }

    root(): ll.ILowLevelASTNode {
        var node:ll.ILowLevelASTNode = this;
        while(node.parent()) {
            var p = node.parent();
            node = p;
        }
        return node;
    }

    find(name: string): ll.ILowLevelASTNode {
        var found: ll.ILowLevelASTNode = null;
        this.children().forEach(y=>{
            if (y.key() && y.key() == name){
                if(!found) found = y;
            }
        });
        return found;
    }

    isMap(): boolean {
        return this.kind() == yaml.Kind.MAP;
    }

    isMapping(): boolean {
        return this.kind() == yaml.Kind.MAPPING;
    }

    isSeq(): boolean {
        return this.kind() == yaml.Kind.SEQ;
    }

    isScalar(): boolean {
        return this.kind() == yaml.Kind.SCALAR;
    }

    isValueSeq(): boolean {
        return this.valueKind() == yaml.Kind.SEQ;
    }

    isValueMap(): boolean {
        return this.valueKind() == yaml.Kind.MAP;
    }

    isValueInclude(): boolean {
        return this.valueKind() == yaml.Kind.INCLUDE_REF;
    }

    isValueScalar(): boolean {
        return this.valueKind() == yaml.Kind.SCALAR;
    }

    definingUnitSequence():ll.ICompilationUnit[]{
        let key = referencePatcher.toOriginal(this).key();
        let tr = this.transformer();
        if(!tr){
            return null;
        }
        return tr.definingUnitSequence(key);
    }
}


export class LowLevelCompositeNode extends LowLevelProxyNode{

    private static CLASS_IDENTIFIER_LowLevelCompositeNode = "LowLevelASTProxy.LowLevelCompositeNode";

    public static isInstance(instance : any) : instance is LowLevelCompositeNode {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),LowLevelCompositeNode.CLASS_IDENTIFIER_LowLevelCompositeNode);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = super.getClassIdentifier();

        return superIdentifiers.concat(LowLevelCompositeNode.CLASS_IDENTIFIER_LowLevelCompositeNode);
    }

    constructor(
        node:ll.ILowLevelASTNode,
        parent:LowLevelCompositeNode,
        transformer:ValueTransformer,
        ramlVersion:string,
        private isPrimary:boolean = true){
        super(parent,transformer,ramlVersion);

        var originalParent = this.parent() ? this.parent().originalNode() : null;
        if(LowLevelValueTransformingNode.isInstance(node)){
            this._originalNode = node;
        }
        else {
            this._originalNode = new LowLevelValueTransformingNode(
                node, originalParent, transformer, this.ramlVersion);
        }
        this._adoptedNodes.push(<LowLevelValueTransformingNode>this._originalNode);
    }

    //Colliding nodes of the initioal AST
    protected _adoptedNodes:LowLevelValueTransformingNode[] = [];

    protected _children:LowLevelCompositeNode[];

    protected _preserveAnnotations:boolean = false;
    
    protected isInsideResource:boolean;

    protected nonMergableChildren:{[key:string]:boolean} = {};

    adoptedNodes():ll.ILowLevelASTNode[]{
        return this._adoptedNodes;
    }

    primaryNode():LowLevelValueTransformingNode{
        return this.isPrimary ? <LowLevelValueTransformingNode>this._originalNode : null;
    }

    parent():LowLevelCompositeNode { return <LowLevelCompositeNode>this._parent;}

    adopt(node:ll.ILowLevelASTNode,transformer:ValueTransformer){

        if(!transformer){
            transformer = this._transformer;
        }
        var originalParent = this.parent() ? this.parent().originalNode() : null;
        var tNode = new LowLevelValueTransformingNode(node,originalParent,transformer,this.ramlVersion);
        this._adoptedNodes.push(tNode);
        if(this._children) {
            this._children.forEach(x=>(<LowLevelCompositeNode>x)._parent = null);
        }
        this._children = null;
        if(this.highLevelNode()) {
            this.highLevelNode().resetChildren();
        }
    }

    value(toString?:boolean):any {
        if(this._valueOverride){
            return this._valueOverride;
        }
        var val;
        var valuableNodes:ll.ILowLevelASTNode[] = this._adoptedNodes.filter(x=>x.value()!=null);
        if(valuableNodes.length>0){
            val = valuableNodes[0].value(toString);
        }
        else {
            val = this._originalNode.value(toString);
        }
        if(LowLevelValueTransformingNode.isInstance(val)){
            var key = (<LowLevelValueTransformingNode>val).key();
            if(key) {
                var n:LowLevelCompositeNode = this;
                while(n.children().length==1&&(n.kind()==yaml.Kind.MAPPING||n.kind()==yaml.Kind.MAP||n.kind()==yaml.Kind.SEQ)){
                    n = <LowLevelCompositeNode>n.children()[0];
                    if(n.originalNode().key()==key){
                        val = n;
                        break;
                    }
                }

            }
            this._valueOverride = val;
        }
        return val;
    }

    patchAdoptedNodes(entries:{node:ll.ILowLevelASTNode,transformer:ValueTransformer}[]){
        this._adoptedNodes = [];
        entries.forEach(x=>this.adopt(x.node,x.transformer));
        if(this._adoptedNodes.length>0){
            this._originalNode = this._adoptedNodes[0];
        }
        this.resetChildren();
    }

    children():LowLevelCompositeNode[] {

        if(this._children){
            return this._children;
        }
        var result:LowLevelCompositeNode[] = [];

        var canBeMap:boolean = false;
        var canBeSeq = false;
        for(var x of this._adoptedNodes){
            var adoptedNodeChildren = x.children();
            if(adoptedNodeChildren && adoptedNodeChildren.length > 0){
                canBeSeq = true;
                if( adoptedNodeChildren[0].key()){
                    if (this.originalNode().valueKind()!=yaml.Kind.SEQ) {
                        canBeMap = true;
                    }
                }
            }
            if(canBeMap&&canBeSeq){
                break;
            }
        }
        if (canBeMap) {
            result = this.collectChildrenWithKeys();
        }
        else if(canBeSeq){
            result = this.collectChildrenWithKeys();
            var map = {};
            this._adoptedNodes.forEach(x=>x.children().filter(y=>!y.key()).forEach(y=>{

                var isPrimary = x == this.primaryNode();
                var key = this.buildKey(y);

                if( !isPrimary && map[key] ){
                    //filtering away values with repeating keys
                    //primary node is not subjected to filtration
                    return;
                }
                map[key] = true;
                var transformer = x.transformer() ? x.transformer() : this.transformer();
                var ch = (LowLevelValueTransformingNode.isInstance(y))
                    ? (<LowLevelValueTransformingNode>y).originalNode() : y;
                result.push(new LowLevelCompositeNode(ch,this,transformer,this.ramlVersion,isPrimary));
            }));
        }
        else{
            result = [];
        }
        this._children = result;
        if(this._preserveAnnotations){
            this._children.forEach(x=>x.preserveAnnotations());
        }
        return result;
    }

    private buildKey(y:ll.ILowLevelASTNode):string {

        var obj = json.serialize(y);
        var def = this.nodeDefinition();
        if (def &&(def.key()==universes.Universe08.TraitRef||def.key()==universes.Universe08.ResourceTypeRef
            ||def.key()==universes.Universe10.TraitRef||def.key()==universes.Universe10.ResourceTypeRef)) {
            if(obj && typeof obj == 'object'){
                var keys = Object.keys(obj);
                if(keys.length>0){
                    obj = keys[0];
                }
            }
        }

        if (obj == null) return "";

        return stringify(obj);
    }

    private collectChildrenWithKeys():LowLevelCompositeNode[] {

        var result = [];
        var m:{[key:string]:ChildEntry[]} = {};

        for(var x of this._adoptedNodes){
            var isPrimary = x == this.primaryNode();
            for(var y of x.children()){
                var key = y.originalNode().key();
                if(this.nonMergableChildren[key]&&(x!=this._originalNode)){
                    continue;
                }
                if(key && x.transformer()){
                    var isAnnotation = key!=null
                        && this._preserveAnnotations
                        && util.stringStartsWith(key,"(")
                        && util.stringEndsWith(key,")");
                    if(!isAnnotation) {
                        key = x.transformer().transform(key).value;
                    }
                }
                if(this.skipKey(key,isPrimary)){
                    continue;
                }
                if(!key){
                    continue;
                }
                var arr:ChildEntry[] = m.hasOwnProperty(key) && m[key];
                if (!arr) {
                    arr = [];
                    m[key] = arr;
                }
                arr.push({ node:y.originalNode(), transformer: x.transformer(), isPrimary: isPrimary} );
            }
        }

        var ramlVersion = this.unit().highLevel().root().definition().universe().version();
        var isResource = this.key()&&this.key()[0]=="/";
        var methodType = def.getUniverse("RAML10").type(universes.Universe10.Method.name);
        var options = methodType.property(universes.Universe10.Method.properties.method.name).enumOptions()
        Object.keys(m).forEach(key=> {

            var arr = m[key];
            var allOptional = true;
            var hasPrimaryChildren = false;
            var isMethod = options.indexOf(key)>=0;
            arr.forEach(x=>{
                var isOpt = x.node.optional() &&
                    (ramlVersion != "RAML10" ||
                    (isResource && isMethod));
                allOptional = allOptional && isOpt;
                hasPrimaryChildren = hasPrimaryChildren || x.isPrimary;
            });
            if (hasPrimaryChildren) {

                var primaryChildren:LowLevelCompositeNode[] = [];
                arr.filter(x=>x.isPrimary).forEach(x=>{
                    var tr = x.transformer ? x.transformer : this.transformer();
                    primaryChildren.push(new LowLevelCompositeNode(x.node, this, tr, this.ramlVersion, true));
                });

                var primaryChild = primaryChildren[0];
                arr.filter(x=>!x.isPrimary).forEach(x=>{
                    primaryChild.adopt(x.node,x.transformer);
                });
                primaryChildren.forEach(x=>result.push(x));
            }
            else if (!allOptional) {

                var tr = arr[0].transformer ? arr[0].transformer : this.transformer();
                var primaryChild = new LowLevelCompositeNode(arr[0].node, this, tr, this.ramlVersion, false);
                for(var i = 1 ; i < arr.length ; i++){
                    primaryChild.adopt(arr[i].node,arr[i].transformer);
                }
                result.push(primaryChild);
            }
        });
        return result;
    }

    private isResource() {
        return this.highLevelNode() && universeHelpers.isResourceType(this.highLevelNode().definition());
    }

    private skipKey(key:string,isPrimary:boolean){
        if(isPrimary){
            return false;
        }
        if(this.ramlVersion!='RAML08'){
            return false;
        }
        var methodDef = universes.Universe08.Method;
        var resourceDef = universes.Universe08.Resource

        //if(key==hasNormalParametersDef.properties.displayName.name
        //    &&this.highLevelNode().definition().key().name==methodDef.name){
        //    return true;
        //}
        //if(key==resourceDef.properties.displayName.name
        //    &&this.highLevelNode().definition().key().name==resourceDef.name){
        //    return true;
        //}
        return false;
    }

    valueKind(): yaml.Kind {
        if(this._originalNode.kind()!=yaml.Kind.MAPPING){
            return null;
        }
        for(var i = 0 ; i < this._adoptedNodes.length; i++){
            var node = this._adoptedNodes[i];
            var yamlNode = (<any>node.originalNode()).actual();
            if(yamlNode && yamlNode.value!=null){
                return node.valueKind();
            }
        }
        return null;
    }

    includePath():string {

        for(var i = 0 ; i < this._adoptedNodes.length; i++){
            var node = this._adoptedNodes[i];
            var includePath = node.includePath();
            if(includePath!=null){
                return includePath;
            }
        }
        return null;
    }

    includeBaseUnit():ll.ICompilationUnit {

        for(var i = 0 ; i < this._adoptedNodes.length; i++){
            var node = this._adoptedNodes[i];
            var includePath = node.includePath();
            if(includePath!=null){
                return node.unit();
            }
        }
        return super.includeBaseUnit();
    }

    includeReference():refResolvers.IncludeReference {

        for(var i = 0 ; i < this._adoptedNodes.length; i++){
            var node = this._adoptedNodes[i];
            if(node.value()!=null){
                return node.includeReference();
            }
        }
        return null;
    }

    optional():boolean{
        return _.all(this._adoptedNodes,x=>x.optional());
    }


    replaceChild(
        oldNode:ll.ILowLevelASTNode,
        newNode:ll.ILowLevelASTNode,
        isPrimary=false,
        transformer:ValueTransformer=null):LowLevelCompositeNode{
        
        if(!this._children){
            this._children = [];
        }
        var newCNode:LowLevelCompositeNode;
        if(LowLevelCompositeNode.isInstance(newNode)){
            newCNode = <LowLevelCompositeNode>newNode;
            newCNode._parent = this;
        }
        else {
            newCNode = new LowLevelCompositeNode(newNode, this, null, this.ramlVersion);
        }
        if(oldNode==null){
            this._children.push(newCNode);
            return newCNode;
        }
        var ind = this._children.indexOf(<LowLevelCompositeNode>oldNode);
        if(ind>=0){
            this._children[ind] = newCNode;
        }
        else{
            this._children.push(newCNode);
        }
        return newCNode;
    }

    removeChild(oldNode:ll.ILowLevelASTNode):LowLevelCompositeNode{
        if(!this._children||oldNode==null){
            return;
        }
        var ind = this._children.indexOf(<LowLevelCompositeNode>oldNode);
        if(ind>=0){
            for(var i = ind ; i < this._children.length-1 ; i++){
                this._children[i] = this._children[i+1];                
            }
            this._children.pop();            
        }
    }

    setChildren(nodes:ll.ILowLevelASTNode[]):LowLevelCompositeNode{
        if(nodes==null){
            this._children = null;
            return;
        }
        this._children = nodes.map(x=>{
            if(LowLevelCompositeNode.isInstance(x)){
                return <LowLevelCompositeNode>x;
            }
            return new LowLevelCompositeNode(x,this,null,this.ramlVersion);
        });
        if(this._preserveAnnotations){
            this._children.forEach(x=>x.preserveAnnotations());
        }
    }

    resetChildren(){
        this._children = null;
    }

    preserveAnnotations(){
        this._preserveAnnotations = true;
        if(this._children) {
            this._children.forEach(x=>x.preserveAnnotations());
        }
    }

    filterChildren(){
        this.children();
        var map = {};
        var filtered:LowLevelCompositeNode[] = [];
        this._children.forEach(x=>{
            if(x.key()!=null){
                filtered.push(x);
                return;
            }
            var key = JSON.stringify(json.serialize(x));
            if(map[key]){
                return;
            }
            map[key] = true;
            filtered.push(x);
        });
        this._children = filtered;
    }

    containingUnit():ll.ICompilationUnit{
        var paths = {};
        for(var n of this.adoptedNodes()){
            var cu = n.containingUnit();
            if(cu) {
                paths[cu.absolutePath()] = true;
            }
        }
        if(Object.keys(paths).length<=1){
            return this._originalNode.containingUnit();
        }
        return null;
    }

    takeOnlyOriginalChildrenWithKey(key:string){
        this.nonMergableChildren[key] = true;
    }

}

interface ChildEntry {
    node: ll.ILowLevelASTNode
    transformer: ValueTransformer
    isPrimary: boolean
}

export class LowLevelValueTransformingNode extends LowLevelProxyNode{

    private static CLASS_IDENTIFIER_LowLevelValueTransformingNode = "LowLevelASTProxy.LowLevelValueTransformingNode";

    public static isInstance(instance : any) : instance is LowLevelValueTransformingNode {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),LowLevelValueTransformingNode.CLASS_IDENTIFIER_LowLevelValueTransformingNode);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = super.getClassIdentifier();

        return superIdentifiers.concat(LowLevelValueTransformingNode.CLASS_IDENTIFIER_LowLevelValueTransformingNode);
    }

    constructor(
        node:ll.ILowLevelASTNode,
        parent:ll.ILowLevelASTNode,
        transformer:ValueTransformer,
        ramlVersion:string
        ){
        super(parent,transformer,ramlVersion);
        this._originalNode = node;
    }

    value(toString?:boolean):any {
        var val = this.originalNode().value(toString);
        var t = this.transformer();
        if(t){
            var transformationResult = t.transform(val,toString);
            val = transformationResult.value;
        }
        if (val != null && typeof val==="object" && !Array.isArray(val)){
            return new LowLevelValueTransformingNode(<ll.ILowLevelASTNode>val,this._parent,this._transformer,this.ramlVersion);
        }
        else if(val != null && toString){
            val = "" + val;
        }
        return val;
    }

    children():LowLevelValueTransformingNode[] {
        var childNodes:ll.ILowLevelASTNode[]=null;
        var originalNode = this.originalNode();
        if(this._transformer!=null) {
            var substitution = this._transformer.children(originalNode);
            if(substitution!=null){
                childNodes = substitution;
            }
        }
        if(childNodes==null){
            childNodes = originalNode.children();
        }
        return childNodes.map(x=>new LowLevelValueTransformingNode(x,this,this._transformer,this.ramlVersion));
    }

    valueKind():yaml.Kind{
        var kind = this._transformer && this._transformer.valueKind(this.originalNode());
        if(kind!=null){
            return kind;
        }
        return super.valueKind();
    }

    anchorValueKind():yaml.Kind{
        var kind = this._transformer && this._transformer.anchorValueKind(this.originalNode());
        if(kind!=null){
            return kind;
        }
        return super.anchorValueKind();
    }

    resolvedValueKind():yaml.Kind{
        var kind = this._transformer && this._transformer.resolvedValueKind(this.originalNode());
        if(kind!=null){
            return kind;
        }
        return super.resolvedValueKind();
    }

    includePath(){
        var includePath = this._transformer && this._transformer.includePath(this.originalNode());
        if(includePath!=null){
            return includePath;
        }
        return super.includePath();
    }

    parent():LowLevelValueTransformingNode { return <LowLevelValueTransformingNode>this._parent;}

    key(raw:boolean=false):string{
        var key = super.key(raw);
        if(this.transformer()!=null) {
            var transformed = this.transformer().transform(key).value;
            return (typeof(transformed)=="object") ? null : transformed;
        }
        return key;
    }

}


export interface ValueTransformer{

    transform(value:any,toString?:boolean):{
        value:any
        errors:hl.ValidationIssue[]
    }

    children(node:ll.ILowLevelASTNode):ll.ILowLevelASTNode[]

    valueKind(node:ll.ILowLevelASTNode):yaml.Kind

    anchorValueKind(node:ll.ILowLevelASTNode):yaml.Kind

    resolvedValueKind(node:ll.ILowLevelASTNode):yaml.Kind

    includePath(node:ll.ILowLevelASTNode):string

    definingUnitSequence(str:string):ll.ICompilationUnit[]
}

export function isLowLevelProxyNode(node : any) : node is LowLevelProxyNode {
    var anyNode = <any>node;
    return anyNode.valueName && anyNode.toHighLevel && anyNode.toHighLevel2;
}