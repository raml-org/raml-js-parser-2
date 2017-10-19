import defs=require("raml-definition-system")
import hl=require("./highLevelAST")
import ll=require("./lowLevelAST")
import _=require("underscore")
import proxy=require("./ast.core/LowLevelASTProxy")
import def=defs;
import high=require("./highLevelAST");
import builder=require("./ast.core/builder")
import search=require("../search/search-interface")
import mutators=require("./ast.core/mutators")
import linter=require("./ast.core/linter")
import expander=require("./ast.core/expander")
import typeBuilder=require("./ast.core/typeBuilder")
import universes=require("./tools/universe")
import jsyaml=require("./jsyaml/jsyaml2lowLevel")
import textutil=require('../util/textutil')
import ParserCore = require("./wrapped-ast/parserCore")
import services=def
import yaml=require("yaml-ast-parser")
import core=require("./wrapped-ast/parserCore");
import wrapperHelper=require("./wrapped-ast/wrapperHelper");
import jsonSerializerHL = require("../util/jsonSerializerHL");
import factory10 = require("./artifacts/raml10factory")
import factory08 = require("./artifacts/raml08factory")
import universeHelpers = require("./tools/universeHelpers")
import resourceRegistry = require("./jsyaml/resourceRegistry")
import rTypes=defs.rt;
import path=require("path");
type NodeClass=def.NodeClass;
type IAttribute=high.IAttribute

import contentprovider = require('../util/contentprovider')
import utils = require('../utils')

let messageRegistry = require("../../resources/errorMessages");

type IHighLevelNode=hl.IHighLevelNode
export function qName(x:hl.IHighLevelNode,context:hl.IHighLevelNode):string{
    //var dr=search.declRoot(context);
    var nm=x.name();
    if(proxy.LowLevelProxyNode.isInstance(context.lowLevel())){
        if(proxy.LowLevelProxyNode.isInstance(x.lowLevel())){
            return nm;
        }
        var rootUnit = context.root().lowLevel().unit();
        var resolver = (<jsyaml.Project>rootUnit.project()).namespaceResolver();
        var unit = x.lowLevel().unit();
        let usesInfo = resolver.resolveNamespace(context.lowLevel().unit(), unit);
        if(usesInfo != null) {
            var ns = usesInfo.namespace();
            if (ns != null) {
                return ns + "." + nm;
            }
        }
    }
    if (x.lowLevel().unit()!=context.lowLevel().unit()){
        var root:BasicASTNode=<BasicASTNode><any>context;
        while (true) {
            if (root.lowLevel().includePath()||root.parent()==null) {
                if (!root.unitMap) {
                    root.unitMap = {};
                    root.asElement().elements().forEach(x=> {
                        if (x.definition().key() == universes.Universe10.UsesDeclaration) {
                            var mm = x.attr("value");
                            if (mm) {
                                var unit = x.root().lowLevel().unit().resolve(mm.value());
                                if (unit != null) {
                                    var key = x.attr("key");
                                    if (key) {
                                        root.unitMap[unit.absolutePath()] = key.value();
                                    }
                                }
                            }
                        }
                    });
                }
                var prefix = root.unitMap[x.lowLevel().unit().absolutePath()];
                if (prefix) {
                    return prefix + "." + nm;
                }
            }
            if (!root.parent()){
                break;
            }
            else {
                root = <BasicASTNode><any>root.parent();
            }
        }
    }
    return nm;
}

export class BasicASTNode implements hl.IParseResult {
    private _hashkey : string;

    unitMap:{ [path:string]:string };

    private static CLASS_IDENTIFIER = "highLevelImpl.BasicASTNode";

    protected _reuseMode:boolean;

    protected _isReused:boolean;

    protected _jsonCache:any;

    protected _valueSource:hl.IParseResult;

    public static isInstance(instance : any) : instance is BasicASTNode {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),BasicASTNode.CLASS_IDENTIFIER);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = [];

        return superIdentifiers.concat(BasicASTNode.CLASS_IDENTIFIER);
    }

    getKind() : hl.NodeKind {
        return hl.NodeKind.BASIC
    }
    asAttr():hl.IAttribute{
        return null;
    }
    asElement():hl.IHighLevelNode{
        return null;
    }
    hashkey() {
        if (!this._hashkey) this._hashkey = this.parent() ? this.parent().hashkey() + "/" + this.name() : this.name(); 
        return this._hashkey;
    }
    
    root():hl.IHighLevelNode{
        if (this.parent()){
            return this.parent().root();
        }
        return <any>this;
    }

    version(){
        return "";
    }

    getLowLevelStart() {
        if(this.lowLevel().kind() === jsyaml.Kind.SCALAR) {
            return this.lowLevel().start();
        }

        return this.lowLevel().keyStart();
    }

    getLowLevelEnd() {
        if(this.lowLevel().kind() === jsyaml.Kind.SCALAR) {
            return this.lowLevel().end();
        }

        return this.lowLevel().keyEnd();
    }

    private _implicit:boolean=false;
    private values:{[name:string]:any}={}
    _computed:boolean;
    constructor(protected _node:ll.ILowLevelASTNode,private _parent:hl.IHighLevelNode){
        if(_node) {
            _node.setHighLevelParseResult(this);
        }
    }
    knownProperty:hl.IProperty
    needSequence:boolean
    needMap:boolean
    invalidSequence:boolean
    unresolvedRef:string
    errorMessage: {
        entry: any,
        parameters: any
    }

    isSameNode(n:hl.IParseResult){
        if (n) {
            if (n.lowLevel().actual() == this.lowLevel().actual()) {
                return true;
            }
        }
        return false;
    }
    checkContextValue(name:string,value:string,thisObj:any):boolean{
        var vl=this.computedValue(name);
        if (vl&&vl.indexOf(value)!=-1){
            return true;//FIXME
        }

        return value==vl||value=='false';
    }

    printDetails(indent?:string) : string {
        return (indent? indent : "")+"Unkown\n";
    }

    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?:string) : string {
        return (indent? indent : "")+"Unkown\n";
    }

    errors():hl.ValidationIssue[]{
        var errors:hl.ValidationIssue[]=[];
        var q = createBasicValidationAcceptor(errors, this);
        this.validate(q);
        return errors;
    }

    markCh() {
        var n:any = this.lowLevel();
        while(proxy.LowLevelProxyNode.isInstance(n)){
            n = (<proxy.LowLevelProxyNode>n).originalNode();
        }
        n = n._node ? n._node : n;
        if (n['markCh']) {
            return true;
        }
        n['markCh'] = 1;
    }

    unmarkCh(){
        var n:any=this.lowLevel();
        while(proxy.LowLevelProxyNode.isInstance(n)){
            n = (<proxy.LowLevelProxyNode>n).originalNode();
        }
        n=n._node?n._node:n;
        delete n['markCh'];
    }

    validate(v:hl.ValidationAcceptor):void{

        linter.validate(this,v);
        for(var pluginIssue of applyNodeValidationPlugins(this)){            
            v.accept(pluginIssue);
        }
        for(var pluginIssue of applyNodeAnnotationValidationPlugins(this)){
            v.accept(pluginIssue);
        }
    }
    allowRecursive(){
        return false;
    }


    setComputed(name:string,v:any){
        this.values[name]=v;
    }

    setValueSource(n:hl.IParseResult){
        this._valueSource = n;
    }

    computedValue(name:string):any{
        var vl=this.values[name];
        if (!vl){
            if(this.parent()) {
                return this.parent().computedValue(name)
            }
            else if(this._valueSource){
                return this._valueSource.computedValue(name);
            }
            else if(this.isElement()){
                let master = this.asElement().getMaster();
                if(master){
                    return master.computedValue(name);
                }
            }
        }
        return vl;
    }

    lowLevel():ll.ILowLevelASTNode {
        return this._node;
    }


    name(){
        var c=this.lowLevel().key();
        if (!c){
            return "";
        }
        return c;
    }

    optional():boolean{
        var llNode = this.lowLevel();
        var ownValue = llNode.optional();
        if(llNode.key()!=null ){
            return ownValue;
        }

        var p = this.property();
        if(!p||!p.isMultiValue()) {
            return ownValue;
        }
        var llParent = llNode.parent();
        while(llParent&&llParent.highLevelNode()==null){
            if(llParent.kind()==yaml.Kind.MAPPING){
                return llParent.optional();
            }
            llParent = llParent.parent();
        }
        return ownValue;
    }

    parent():hl.IHighLevelNode {
        return this._parent;
    }
    
    setParent(parent: hl.IHighLevelNode) {
        this._parent = parent;
    }
    
    isElement(){
        return false;
    }
    directChildren():hl.IParseResult[] {
        return this.children();
    }

    children():hl.IParseResult[] {
        return [];
    }

    isAttached():boolean {
        return this.parent()!=null;
    }

    isImplicit():boolean {
        return this._implicit;
    }

    isAttr():boolean{
        return false;
    }
    isUnknown():boolean{
        return true;
    }
    id():string{
        if (this.cachedId){
            return this.cachedId;
        }
        if (this._parent){
            var parentId=this.parent().id();
            parentId+="."+this.name();
            var sameName=(<BasicASTNode><any>this.parent()).directChildren().filter(x=>x.name()==this.name());
            if (sameName.length>1){
                var ind=sameName.indexOf(this);
                parentId+="["+ind+"]"
            }
            this.cachedId=parentId;
            return parentId;
        }
        this.cachedId= "";
        return this.cachedId;
    }

    localId():string{
        return this.name();
    }
    cachedId: string
    cachedFullId: string

    resetIDs(){
        this.cachedId = null;
        this.cachedFullId = null;
    }

    fullLocalId() : string {
        if (this.cachedFullId){
            return this.cachedFullId;
        }
        if (this._parent){
            var result=".";
            if(this.property()!=null&&universeHelpers.isAnnotationsProperty(this.property())){
                result += this.lowLevel().key();
            }
            else {
                result += this.name();
            }

            var sameName=(<BasicASTNode><any>this.parent()).directChildren().filter(x=>x.name()==this.name());
            if (sameName.length>1){
                var ind=sameName.indexOf(this);
                result+="["+ind+"]"
            }
            this.cachedFullId=result;
            return result;
        }
        this.cachedFullId= this.localId();
        return this.cachedFullId;
    }

    property():hl.IProperty{
        return null;
    }

    reuseMode():boolean{
        return this._reuseMode;
    }

    setReuseMode(val:boolean){
        this._reuseMode = val;
    }

    isReused(){
        return this._isReused;
    }

    setReused(val:boolean){
        this._isReused = val;
        this.children().forEach(x=>(<BasicASTNode>x).setReused(val));
    }

    setJSON(val:any){
        this._jsonCache = val;
    }

    getJSON(){
        return this._jsonCache;
    }
}


export class StructuredValue implements hl.IStructuredValue{

    private _pr:def.Property

    private static CLASS_IDENTIFIER = "highLevelImpl.StructuredValue";

    public static isInstance(instance : any) : instance is StructuredValue {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),StructuredValue.CLASS_IDENTIFIER);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = [];

        return superIdentifiers.concat(StructuredValue.CLASS_IDENTIFIER);
    }

    constructor(private node:ll.ILowLevelASTNode,private _parent:hl.IHighLevelNode,_pr:hl.IProperty,private kv=null){
        this._pr=<def.Property>_pr;
    }

    valueName(): string {
        var res:string=null;
        if (this.kv){
            res=this.kv;
        }
        res=this.node.key();
        if (this._pr&&this._pr.isAnnotation()){
            if (res&&res.charAt(0)=='('){
                res=res.substring(1,res.length-1);
            }
        }
        return res;
    }

    children():StructuredValue[]{
        return this.node.children().map(x=>new StructuredValue(x,null,null));
    }

    lowLevel():ll.ILowLevelASTNode{
        return this.node;
    }

    private _hl:hl.IHighLevelNode;



    toHighLevel(parent?: hl.IHighLevelNode):hl.IHighLevelNode{
        if (!parent && this._parent) parent = this._parent;
        if (this._hl){
            return this._hl;
        }
        var vn=this.valueName();
        let p = parent;
        if(proxy.LowLevelProxyNode.isInstance(this.node)){
            let uSeq = (<proxy.LowLevelProxyNode>this.node).definingUnitSequence();
            let p1 = uSeq && uSeq[0] && uSeq[0].highLevel().asElement();
            let path1 = p1 && p1.lowLevel().unit().absolutePath();
            if(path1 == parent.lowLevel().unit().absolutePath()){
                p1 = parent;
            }
            else if(path1==parent.root().lowLevel().unit().absolutePath()){
                p1 = parent.root();
            }
            p = p1 || p;
        }
        var cands=search.referenceTargets(this._pr, p).filter(x=>qName(x,p)==vn);
        if (cands&&cands[0]){
            var tp=(<hl.IHighLevelNode>cands[0]).localType();
            var node=new ASTNodeImpl(this.node,parent,<hl.INodeDefinition>tp,this._pr);
            if (this._pr){
                this._pr.childRestrictions().forEach(y=>{
                    node.setComputed(y.name,y.value)
                })
            }
            this._hl=node;
            return node;
        }
        //if (this._pr.range()){
        //    var node=new ASTNodeImpl(parent.lowLevel(),parent,this._pr.range(),this._pr);
        //    if (this._pr){
        //        this._pr.childRestrictions().forEach(y=>{
        //            node.setComputed(y.name,y.value)
        //        })
        //    }
        //    return node;
        //}
        return null;
    }

    toHighLevel2(parent?: hl.IHighLevelNode):hl.IHighLevelNode{
        if (!parent && this._parent) parent = this._parent;
        var vn=this.valueName();
        var cands=search.referenceTargets(this._pr,parent).filter(x=>qName(x,parent)==vn);
        if (cands&&cands[0]){
            var tp=(<hl.IHighLevelNode>cands[0]).localType();
            var node=new ASTNodeImpl(this.node,parent,<hl.INodeDefinition>tp,this._pr);
            if (this._pr){
                this._pr.childRestrictions().forEach(y=>{
                    node.setComputed(y.name,y.value)
                })
            }
            return node;
        }
        if (this._pr.range()){
            var node=new ASTNodeImpl(this.node.parent(),parent,this._pr.range(),this._pr);
            if (this._pr){
                this._pr.childRestrictions().forEach(y=>{
                    node.setComputed(y.name,y.value)
                })
            }
            return node;
        }
        return null;
    }

    resetHighLevelNode(){
        this._hl = null;
    }
}

/**
 * Instanceof for StructuredValue class
 * @param node
 * @returns
 */
export function isStructuredValue(node : any) : node is StructuredValue {
    var anyNode = <any>node;
    return anyNode && anyNode.valueName && anyNode.toHighLevel && anyNode.toHighLevel2;
}

export class ASTPropImpl extends BasicASTNode implements  hl.IAttribute {

    private static CLASS_IDENTIFIER_ASTPropImpl = "highLevelImpl.ASTPropImpl";

    public static isInstance(instance : any) : instance is ASTPropImpl {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),ASTPropImpl.CLASS_IDENTIFIER_ASTPropImpl);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = super.getClassIdentifier();

        return superIdentifiers.concat(ASTPropImpl.CLASS_IDENTIFIER_ASTPropImpl);
    }

    definition():hl.IValueTypeDefinition {
        return this._def;
    }
    asAttr():hl.IAttribute{
        return this;
    }

    errors():hl.ValidationIssue[]{
        var errors:hl.ValidationIssue[]=[];
        var q:hl.ValidationAcceptor= createBasicValidationAcceptor(errors,this);
        this.parent().validate(q);
        return errors;
    }

    isString(){
        if (this._def) {
            if (this._def.key() === universes.Universe08.StringType || this._def.key() == universes.Universe10.StringType) {
                return true;
            }
        }
        return false;
    }
    isAnnotatedScalar(){
        if (!this.property().isAnnotation()&&!this.property().isKey()) {
            return this.lowLevel().isAnnotatedScalar();
        }
        return false;
    }


    annotations():hl.IAttribute[]{
        var ch = this.lowLevel().children();
        var annotations:hl.IAttribute[] = [];
        var u = this.definition().universe().type(universes.Universe10.Annotable.name);
        if (!u) {
            return annotations;
        }
        var pr = u.property("annotations");
        for (var i = 0; i < ch.length; i++) {
            var child = ch[i];
            var key = child.key();
            if (key != null && key[0] == ("(") && key[key.length - 1] == (")")) {
                var attr = new ASTPropImpl(child, this.parent(), pr.range(), pr);
                annotations.push(attr);
            }
        }
        return annotations;
    }

    constructor(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, private _def:hl.IValueTypeDefinition, private _prop:hl.IProperty, private fromKey:boolean = false) {
        super(node, parent)

    }

    getKind() : hl.NodeKind {
        return hl.NodeKind.ATTRIBUTE
    }

    owningWrapper():{node:ParserCore.BasicNode; property:string}{
        return {
            node: this.parent().wrapperNode(),
            property: this.name()
        };
    }

    patchType(t:hl.IValueTypeDefinition){
        this._def=t;
    }


    findReferenceDeclaration():hl.IHighLevelNode{
        var targets=search.referenceTargets(this.property(),this.parent());
        var vl=this.value();
        if (StructuredValue.isInstance(vl)){
            var st=<StructuredValue>vl;
            var nm=st.valueName();
        }
        else{
            var nm=""+vl;
        }
        var t:hl.IHighLevelNode=_.find(targets,x=>qName(x,this.parent())==nm)
        return t;
    }
    findReferencedValue(){
        var c=this.findReferenceDeclaration();
        if (c){
            var vl=c.attr("value");
            var ck=c.definition().key();
            if (ck===universes.Universe08.GlobalSchema) {
                if (vl) {
                    var actualValue = vl.value();
                    if (actualValue) {
                        var rf = linter.isValid(this._def,this.parent(),actualValue,vl.property(),vl);
                        return rf;
                    }
                }
                return null;
            }
        }
        return c;
    }

    isElement() {
        return false;
    }

    property():defs.Property {
        return <defs.Property>this._prop;
    }

    convertMultivalueToString(value: string): string {
        //|\n  xxx\n  yyy\n  zzz
        var gap = 0;
        var pos = 2;
        while(value[pos] == ' ') {
            gap++;
            pos++;
        }
        //console.log('gap: ' + gap);
        var lines = textutil.splitOnLines(value);
        lines = lines.map(line=> {
            //console.log('line: ' + line);
            return line.substring(gap, line.length);
        });
        return lines.join('');
    }
    _value: string

    overrideValue(value:string){
        this._value = value;
    }

    private _sval:StructuredValue;
    value():any {
        if (this._value!=null){
            return this._value
        }
        this._value=this.calcValue();
        return this._value;
    }

    plainValue():any{
        let val = this.value();
        if(StructuredValue.isInstance(val)){
            var sVal = (<StructuredValue>val);
            var llNode = sVal.lowLevel();
            val = llNode ? llNode.dumpToObject() : null;

            var prop = this.property();
            var rangeType = prop.range();
            var propName = prop.nameId();
            if (rangeType.isAssignableFrom("Reference")) {
                var key = Object.keys(val)[0];
                var name = sVal.valueName();
                var refVal = val[key];
                if (refVal === undefined) {
                    refVal = null;
                }
                val = {
                    name: name,
                    structuredValue: refVal
                }
            }
            else if (propName == "type") {
                var llNode = this.lowLevel();
                var tdl = null;
                var td = def.getUniverse("RAML10").type(universes.Universe10.TypeDeclaration.name);
                var hasType = def.getUniverse("RAML10").type(universes.Universe10.LibraryBase.name);
                var tNode = new ASTNodeImpl(llNode, this.parent(), td, hasType.property(universes.Universe10.LibraryBase.properties.types.name))
                tNode.patchType(builder.doDescrimination(tNode));
                val = tNode;
            }
            else if (propName == "items" && typeof val === "object") {
                var isArr = Array.isArray(val);
                var isObj = !isArr;
                if (isArr) {
                    isObj = _.find(val, x=>typeof(x) == "object") != null;
                }
                if (isObj) {
                    val = null;
                    var a = this.parent().lowLevel();
                    var tdl = null;
                    a.children().forEach(x=> {
                        if (x.key() == "items") {
                            var td = def.getUniverse("RAML10").type(universes.Universe10.TypeDeclaration.name);
                            var hasType = def.getUniverse("RAML10").type(universes.Universe10.LibraryBase.name);
                            var tNode = new ASTNodeImpl(x, this.parent(), td, hasType.property(universes.Universe10.LibraryBase.properties.types.name));
                            tNode.patchType(builder.doDescrimination(tNode));
                            val = tNode;
                        }
                    });
                }
            }
        }
        return val;
    }

    private calcValue():any{
        if (this._computed){
            return this.computedValue(this.property().nameId());
        }
        if (this.fromKey) {
            var parent = this.parent()
            var definition = parent.definition();
            if(definition.universe().version()=="RAML08"){
                return this._node.key();
            }
            if(universeHelpers.isNameProperty(this.property())) {
                if (definition.isAssignableFrom(universes.Universe10.TypeDeclaration.name)) {
                    var requiredAttr = parent.attr("required");
                    if(requiredAttr&&requiredAttr.value()!=null){
                        return this._node.optional() ? this._node.key()+"?" : this._node.key();
                    }
                }
            }
            return this._node.key();
        }
        if (this.property().isAnnotation()&&this._node.key()&&this._node.key()!='annotations'){
            return new StructuredValue(<ll.ILowLevelASTNode>this._node,this.parent(),this._prop);
        }

        var isString = valueMustBeString(this);

        var actualValue = this._node.value(isString); //TODO FIXME
        if (this.property().isSelfNode()){
            if (!actualValue||jsyaml.ASTNode.isInstance(actualValue)){
                actualValue=this._node;
                if (actualValue.children().length==0){
                    actualValue=null;
                }
            }
        }
        if (jsyaml.ASTNode.isInstance(actualValue)||proxy.LowLevelProxyNode.isInstance(actualValue)) {
            var isAnnotatedScalar=false;
            if (!this.property().range().hasStructure()){
                if (this._node.isAnnotatedScalar()){
                    this._node.children().forEach(x=>{
                        if (x.key()==="value"){
                            actualValue=x.value(isString);
                            isAnnotatedScalar=true;
                        }
                    })
                }
            }
            if (!isAnnotatedScalar) {
                if (this._sval){
                    return this._sval;
                }
                this._sval= new StructuredValue(<ll.ILowLevelASTNode>actualValue, this.parent(), this._prop);
                return this._sval;
            }
        }
        if(typeof(actualValue)=='string'&&textutil.isMultiLineValue(actualValue)) {
            var res = this.convertMultivalueToString(actualValue);
            //console.log('converted: [' + textutil.replaceNewlines(res) + ']');
            return res;
        }
        if (actualValue==null&&this._node.children().length>0
            &&this.property()&&(universeHelpers.isTypeOrSchemaProperty(this.property())||universeHelpers.isItemsProperty(this.property()))
            &&this.parent()&&universeHelpers.isTypeDeclarationDescendant(this.parent().definition())){
            return new StructuredValue(<ll.ILowLevelASTNode>this._node,this.parent(),this._prop);
        }
        return actualValue;
    }

    name() {
        return this._prop.nameId();
    }

    printDetails(indent?:string) : string {
        var className = this.definition().nameId()
        var definitionClassName = this.property().range().nameId()

        var result = (indent?indent:"") +
            (this.name() + " : " + className
            + "[" + definitionClassName + "]"
            + "  =  " + this.value()) + (this.property().isKey()&&this.optional()?"?":"")
            + "\n";

        if (StructuredValue.isInstance(this.value())){
            var structuredHighLevel : any = (<StructuredValue>this.value()).toHighLevel();
            if (structuredHighLevel && structuredHighLevel.printDetails) {
                result += structuredHighLevel.printDetails(indent + "\t");
            }
        }

        return result;
    }

    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?:string) : string {
        var className = this.definition().nameId()

        var result = (indent?indent:"") +
            (this.name() + " : " + className
            + "  =  " + this.value()) +
            "\n";

        if (StructuredValue.isInstance(this.value())){
            var structuredHighLevel : any = (<StructuredValue>this.value()).toHighLevel();
            if (structuredHighLevel && structuredHighLevel.testSerialize) {
                result += structuredHighLevel.testSerialize((indent?indent:"") + "  ");
            } else {
                var lowLevel = (<StructuredValue>this.value()).lowLevel();

                var dumpObject = lowLevel.dumpToObject();
                var dump = JSON.stringify(dumpObject)
                var indentedDump = "";
                var dumpLines = dump.split("\n")
                dumpLines.forEach(dumpLine=>indentedDump+=((indent?indent:"") + "  " + dumpLine + "\n"))

                result += indentedDump + "\n";
            }
        }

        return result;
    }

    isAttr():boolean {
        return true;
    }

    isUnknown():boolean {
        return false;
    }

    setValue(value: string|StructuredValue) {
        mutators.setValue(this,value);
        this._value=null;
    }
    setKey(value: string) {
        mutators.setKey(this,value);
        this._value=null;
    }

    children():hl.IParseResult[] {
        return [];
    }


    addStringValue(value: string) {
        mutators.addStringValue(this,value);
        this._value=null;
    }
    
    addStructuredValue(sv: StructuredValue) {
        mutators.addStructuredValue(this,sv)
        this._value=null;
    }

    addValue(value: string|StructuredValue) {
        if(!this.property().isMultiValue()) throw new Error(messageRegistry.SETVALUE_ONLY_MULTI_VALUES_PROPERTIES.message);
        if(typeof value == 'string') {
            this.addStringValue(<string>value);
        } else {
            this.addStructuredValue(<StructuredValue>value);
        }
        this._value=null;

    }

    isEmbedded(): boolean {
        var keyname = (<jsyaml.ASTNode>this.lowLevel()).asMapping().key.value;
        //console.log('propery: ' + this.property().name());
        //console.log('mapping: ' + keyname);
        return this.property().canBeValue() && keyname != this.property().nameId();
    }

    remove() {
        mutators.removeAttr(this)
    }

    setValues(values: string[]) {
        mutators.setValues(this,values);
        this._value=null;

    }

    isEmpty(): boolean {
        if(!this.property().isMultiValue()) throw new Error(messageRegistry.ISEMPTY_ONLY_MULTI_VALUES_ATTRIBUTES.message);
        //console.log('remove: ' + this.name());
        var node = this.parent();
        var llnode = <jsyaml.ASTNode>node.lowLevel();
        //node.lowLevel().show('Parent:');
        var attrs = node.attributes(this.name());
        //console.log('attributes: ' + attrs.length);
        if(attrs.length == 0) {
            return true;
        } else if(attrs.length == 1) {
            var anode = <jsyaml.ASTNode>attrs[0].lowLevel();
            //console.log('attribute : ' + anode.kindName());
            //anode.show("ATTR:");
            if(anode.isMapping() && anode.value() == null) {
                // that's crazy but it means zero length array indeed )
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    
    isFromKey():boolean{
        return this.fromKey;
    }

}

function valueMustBeString(attr:hl.IAttribute):boolean {

    let prop = attr.property();
    if(!prop){
        return false;
    }

    let parent = attr.parent();
    let parentDef = parent && parent.definition();
    if(!parentDef){
        return false;
    }

    if(parentDef.universe().version()=="RAML08"){
        if(universeHelpers.isStringTypeDeclarationDescendant(parentDef)){
            if(universeHelpers.isExampleProperty(prop)
                ||universeHelpers.isDefaultValue(prop)
                ||universeHelpers.isEnumProperty(prop)){
                return true;
            }
        }
    }
    else{
        if(universeHelpers.isTypeOrSchemaProperty(prop)
            && universeHelpers.isTypeDeclarationDescendant(parentDef)){
            return false;
        }
    }
    if(!universeHelpers.isStringTypeType(prop.range())){
        return false;
    }
    return true;
};


/**
 * Instanceof for ASTPropImpl class
 * @param node
 * @returns
 */
export function isASTPropImpl(node : any) : node is ASTPropImpl {
    var anyNode = <any>node;
    return anyNode && anyNode.isString && anyNode.isFromKey && anyNode.isEmbedded;
}

var nodeBuilder=new builder.BasicNodeBuilder()

export enum OverlayMergeMode {
    MERGE,
    AGGREGATE
}
export interface ParseNode {

    key():string

    value():any

    children():ParseNode[];

    childWithKey(k:string):ParseNode;

    kind(): number

    getMeta(key:string): any

    addMeta(key:string,value:any)
}


export class LowLevelWrapperForTypeSystem extends defs.SourceProvider implements ParseNode{

    private _toMerge:LowLevelWrapperForTypeSystem;

    private static CLASS_IDENTIFIER_LowLevelWrapperForTypeSystem = "highLevelImpl.LowLevelWrapperForTypeSystem";

    public static isInstance(instance : any) : instance is LowLevelWrapperForTypeSystem {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),LowLevelWrapperForTypeSystem.CLASS_IDENTIFIER_LowLevelWrapperForTypeSystem);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = super.getClassIdentifier();

        return superIdentifiers.concat(LowLevelWrapperForTypeSystem.CLASS_IDENTIFIER_LowLevelWrapperForTypeSystem);
    }

    constructor(protected _node:ll.ILowLevelASTNode, protected _highLevelRoot:hl.IHighLevelNode){
        super()

        var v=<ASTNodeImpl>_highLevelRoot.root();
        var mst=v.getMaster();
        if (mst&&this._node===_highLevelRoot.lowLevel()){
            var master=(<ASTNodeImpl>_highLevelRoot).getMasterCounterPart();
            if (master){
                this._toMerge=new LowLevelWrapperForTypeSystem(master.lowLevel(),master);
            }
        }
    }

    private ownMeta:{[key:string]:any};

    contentProvider() {
        var root = this._node && this._node.includeBaseUnit() && ((this._node.includePath && this._node.includePath()) ? this._node.includeBaseUnit().resolve(this._node.includePath()) : this._node.includeBaseUnit());

        return new contentprovider.ContentProvider(root);
    }
    
    key(){
        var vl=this._node.key();
        if (this._node.optional()){
            vl=vl+"?";
        }
        return vl;
    }
    value(){
        var vk=this._node.resolvedValueKind();
        if (vk===yaml.Kind.SEQ){
            return this.children().map(x=>x.value());
        }
        else if (vk===yaml.Kind.MAP){
            var vl= this._node.dumpToObject(false);
            return vl[this.key()];
        }
        else if (this._node.kind()==yaml.Kind.MAP){
            var vl= this._node.dumpToObject(false);
            return vl;
        }
        var val = this._node.value();
        // if(val==null){
        //     val = this._node.value(true);
        // }
        return val;
    }
    _children:LowLevelWrapperForTypeSystem[];


    childByKey:{
        [key:string]:LowLevelWrapperForTypeSystem;
    };
    children(){
        if (this._children){
            return this._children;
        }

        let isUses = this.key()=="uses";
        if(isUses){
            let parent = this._node.parent();
            let grandParent = parent.parent();
            if(grandParent!=null){
                if(this._node.unit().absolutePath()==grandParent.unit().absolutePath()){
                    isUses = false;
                }
            }
        }
        if (isUses){
            this._children= this._node.children().map(x=>new UsesNodeWrapperFoTypeSystem(x,this._highLevelRoot))
        }
        else{
            this._children=this._node.children().map(x=>new LowLevelWrapperForTypeSystem(x,this._highLevelRoot));
        }
        this.childByKey={};
        for (var i=0;i<this._children.length;i++){
            var c=this._children[i];
            this.childByKey[c.key()]=c;
        }
        if (this._toMerge){
            var mrg=this._toMerge.children();
            for (var i=0;i<mrg.length;i++){
                var c=mrg[i];
                var existing=this.childByKey[c.key()];
                if (existing){
                    existing._toMerge=c;
                }
                else{
                    this._children.push(c);
                    this.childByKey[c.key()]=c;
                }

            }
        }
        return this._children;
    }
    childWithKey(k:string):ParseNode
    {
        if (!this._children){
            this.children();
        }
        return this.childByKey[k];
    }
    kind(){
        var vk=this._node.valueKind();
        if (vk==yaml.Kind.MAPPING||vk===null){
            return rTypes.NodeKind.MAP;
        }
        if (vk==yaml.Kind.MAP){
            return rTypes.NodeKind.MAP;
        }
        var knd=this._node.kind();
        if (knd==yaml.Kind.MAP){
            return rTypes.NodeKind.MAP;
        }
        if (vk==yaml.Kind.SEQ){
            return rTypes.NodeKind.ARRAY;
        }
        if (vk==yaml.Kind.INCLUDE_REF || vk==yaml.Kind.ANCHOR_REF){
            if (this._node.children().length>0){
                //we can safely assume that it is map in the type system in this case
                return rTypes.NodeKind.MAP;
            }
        }
        return rTypes.NodeKind.SCALAR;
    }

    getSource() : any {
        if (!this._node) return null;
        var highLevelNode = this._node.highLevelNode();
        if (!highLevelNode) {
            var position = this._node.start()
            var result = search.deepFindNode(this._highLevelRoot, position, position, true, false);

            if (result) {
                this._node.setHighLevelParseResult(result);
                if (ASTNodeImpl.isInstance(result)) {
                    this._node.setHighLevelNode(<ASTNodeImpl>result)
                }
            }

            return result;
        }
        return highLevelNode;
    }
    
    node():ll.ILowLevelASTNode{
        return this._node;
    }

    getMeta(key:string):any{
        if(this.ownMeta && this.ownMeta.hasOwnProperty(key)){
            return this.ownMeta[key];
        }
        return proxy.LowLevelProxyNode.isInstance(this._node)
            && (<proxy.LowLevelProxyNode>this._node).getMeta(key);
    }

    addMeta(key:string,value:any){
        if(!this.ownMeta){
            this.ownMeta = {};
        }
        this.ownMeta[key] = value;
    }
}
export class UsesNodeWrapperFoTypeSystem extends LowLevelWrapperForTypeSystem{
    children(){
        var s=this._node.unit().resolve(this.value());
        if (s && s.isRAMLUnit() && s.contents().trim().length > 0){
            return new LowLevelWrapperForTypeSystem(s.ast(), this._highLevelRoot).children();
        }
        return [];
    }

    anchor(){
        return this._node.actual();
    }
    childWithKey(k:string):ParseNode
    {

        var mm=this.children();
        for (var i=0;i<mm.length;i++){
            if (mm[i].key()==k){
                return mm[i];
            }
        }
        return null;
    }
}
export function auxiliaryTypeForExample(node:hl.IHighLevelNode) {
    var typeYamlNode = yaml.newMap([yaml.newMapping(yaml.newScalar("example"), node.lowLevel().actual())]);
    var typesNode = yaml.newMapping(yaml.newScalar("types")
        , yaml.newMap([yaml.newMapping(yaml.newScalar("__AUX_TYPE__"), typeYamlNode)]));
    var yamlNode = yaml.newMap([typesNode]);
    var llNode = new jsyaml.ASTNode(yamlNode, node.lowLevel().unit(), null, null, null);
    var types = rTypes.parseFromAST(new LowLevelWrapperForTypeSystem(llNode, node));
    var nominal = rTypes.toNominal(types.types()[0], x=>null);
    return nominal;
};
export class ASTNodeImpl extends BasicASTNode implements  hl.IEditableHighLevelNode{


    private _types:rTypes.IParsedTypeCollection;
    private _ptype:rTypes.IParsedType;

    private static CLASS_IDENTIFIER_ASTNodeImpl = "highLevelImpl.ASTNodeImpl";

    public static isInstance(instance : any) : instance is ASTNodeImpl {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),ASTNodeImpl.CLASS_IDENTIFIER_ASTNodeImpl);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = super.getClassIdentifier();

        return superIdentifiers.concat(ASTNodeImpl.CLASS_IDENTIFIER_ASTNodeImpl);
    }

    createIssue(error: any): hl.ValidationIssue {
        return linter.toIssue(error, this);
    }

    validate(v:hl.ValidationAcceptor):void{
        var k=this.definition().key();
        if (k==universes.Universe10.Api||k==universes.Universe08.Api||k==universes.Universe10.Extension){
            if (!this.isExpanded()){
                var nm=expander.expandTraitsAndResourceTypes(<any>this.wrapperNode());
                var hlnode=nm.highLevel();
                hlnode.resetChildren();
                hlnode.children();
                hlnode._expanded=true;
                (<ASTNodeImpl>hlnode).clearTypesCache();
                hlnode.validate(v);
                return;
            }
        }
        if (k==universes.Universe10.Overlay||k==universes.Universe10.Extension){
            this.clearTypesCache();
        }
        super.validate(v);
    }
    clearTypesCache(){
        this._types=null;
        
        if(!this.lowLevel()) {
            return;
        }
        
        var c=this.lowLevel().actual();
        c.types=null;
    }

    types():rTypes.IParsedTypeCollection{
        if (!this._types){
            if (this.parent()&&(this.definition().key()!==universes.Universe10.Library)){
                return this.parent().types();
            }
            else{
                var c=this.lowLevel().actual();
                if (c.types){
                    return c.types;
                }
                let unit = this.lowLevel().unit();
                if(unit) {
                    let project = <jsyaml.Project>unit.project();
                    if (unit.absolutePath() != project.getMainUnitPath()) {
                        let mainUnit = project.getMainUnit();
                        if (mainUnit) {
                            let nsr = project.namespaceResolver();
                            let eSet = nsr.unitModel(mainUnit).extensionSet();
                            if (!eSet[unit.absolutePath()]) {
                                let mainTypes = (<ASTNodeImpl>mainUnit.highLevel()).types();
                                if (mainTypes) {
                                    let usesInfo = nsr.resolveNamespace(mainUnit, unit);
                                    if(usesInfo) {
                                        let segments = usesInfo.namespaceSegments;
                                        let col = mainTypes;
                                        for (let ind = 0; ind < segments.length;) {
                                            let lib: rTypes.IParsedTypeCollection;
                                            for (let i = ind; i < segments.length; i++) {
                                                let ns = segments.slice(ind, i + 1).join(".");
                                                lib = col.library(ns);
                                                if (lib) {
                                                    ind = i + 1;
                                                    col = lib;
                                                }
                                            }
                                            if (lib == null) {
                                                col = null;
                                                break;
                                            }
                                        }
                                        if (col) {
                                            this._types = col;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if(!this._types) {
                    this._types = rTypes.parseFromAST(new LowLevelWrapperForTypeSystem(this.lowLevel(), this));
                    this._types.types().forEach(x => {
                        var convertedType = typeBuilder.convertType(this, x)
                        // if (defs.instanceOfHasExtra(convertedType)) {
                        convertedType.putExtra(defs.USER_DEFINED_EXTRA, true);
                        // }
                    });
                }
                c.types=this._types;
            }

        }
        return this._types;
    }

    setTypes(t:rTypes.IParsedTypeCollection){
        this._types=t;
    }

    parsedType():rTypes.IParsedType{

        if (!this._ptype){
            let llWrapper = new LowLevelWrapperForTypeSystem(this.lowLevel(), this);
            if(linter.typeOfContainingTemplate(this)){
                markTemplateTypes(llWrapper);
            }
            if(this.universe().version()=="RAML08"&&universeHelpers.isStringTypeDeclarationDescendant(this.definition())){
                llWrapper.addMeta("acceptAllScalarsAsStrings",true);
            }
            if (this.property()&&this.property().nameId()==universes.Universe10.MethodBase.properties.body.name){
                var isParametrizedType:boolean = this.isParametrizedType();
                this._ptype = rTypes.parseTypeFromAST(this.name(), llWrapper, this.types(),true,false,false,isParametrizedType);
            }
            else {
                var annotation=this.property()&&this.property().nameId()==universes.Universe10.LibraryBase.properties.annotationTypes.name;
                var tl=(!this.property())||(this.property().nameId()==universes.Universe10.LibraryBase.properties.types.name||this.property().nameId()==universes.Universe10.LibraryBase.properties.schemas.name);

                if (!annotation && this.parent() == null) {
                    var localUniverse = this.universe();
                    if (localUniverse && localUniverse.getOriginalTopLevelText()
                        && localUniverse.getOriginalTopLevelText() == "AnnotationTypeDeclaration"){
                        annotation = true;
                    }
                }

                this._ptype = rTypes.parseTypeFromAST(this.name(), llWrapper, this.types(),false,annotation,tl);
            }

            if (this.property() && universeHelpers.isTypesProperty(this.property())
                && this.parent() && universeHelpers.isApiType(this.parent().definition())) {
                //top level types declared via "types"
                // this._ptype.setExtra()
                if ((<any>this._ptype).putExtra) {
                    (<any>this._ptype).putExtra(defs.DEFINED_IN_TYPES_EXTRA, true);
                }
            }
            var potentialHasExtra = this._ptype;

            potentialHasExtra.putExtra(defs.USER_DEFINED_EXTRA, true);
            this._ptype.putExtra(defs.SOURCE_EXTRA, this);
        }



        return this._ptype;
    }

    private isParametrizedType():boolean {
        var isParametrizedType:boolean = false;
        var typeAttr = this.attr(universes.Universe10.TypeDeclaration.properties.type.name);
        if (typeAttr) {
            var typeAttrValue = typeAttr.value();
            if (typeof typeAttrValue == "string") {
                if (typeAttrValue.indexOf("<<") >= 0) {
                    var parent = this.parent();
                    while(parent!=null){
                        if(universeHelpers.isResourceTypeType(parent.definition())
                            ||universeHelpers.isTraitType(parent.definition())){
                            isParametrizedType = true;
                            break;
                        }
                        parent = parent.parent();
                    }
                }
            }
        }
        return isParametrizedType;
    }
    localType():hl.ITypeDefinition{
        return typeBuilder.typeFromNode(this);
    }

    private _expanded=false;
    _children:hl.IParseResult[];
    _allowQuestion:boolean=false;
    _associatedDef:hl.INodeDefinition;
    _subTypesCache:{ [name:string]:hl.ITypeDefinition[]}=null;
    private _wrapperNode:ParserCore.BasicNode;
    private _isAux:boolean
    private _auxChecked:boolean=false;
    private _knownIds:{[name:string]:hl.IParseResult};
    private _slaveIds:{[name:string]:hl.IParseResult};
    private _knownLowLevelIds:{[name:string]:ll.ILowLevelASTNode};

    isInEdit:boolean;

    /**
     * Externally set master AST, should be only available for root nodes,
     * and only in the case when we merge multiple overlays/extensions.
     */
    private masterApi : hl.IParseResult;

    /**
     * Depending on the merge mode, overlays and extensions are either merged with the master, or their trees are joined via aggregation
     * @type {OverlayMergeMode}
     */
    private overlayMergeMode : OverlayMergeMode = OverlayMergeMode.MERGE;

    /**
     * Slave of this master, if there is any
     */
    private slave : hl.IParseResult;

    private _reusedNode: IHighLevelNode;

    constructor(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode,private _def:hl.INodeDefinition,private _prop:hl.IProperty){
        super(node,parent)
        if(node) {
            node.setHighLevelNode(this);
        }
        if (proxy.LowLevelProxyNode.isInstance(node)){
            this._expanded=true;
        }
    }
    
    _computedKey:string;


    patchProp(pr:hl.IProperty){
        this._prop=pr;
    }


    getKind() : hl.NodeKind {
        return hl.NodeKind.NODE
    }

    wrapperNode():ParserCore.BasicNode{
        if(!this._wrapperNode){
            if(universeHelpers.isExampleSpecType(this.definition())){
                var nominal = auxiliaryTypeForExample(this);
                var spec = wrapperHelper.examplesFromNominal(nominal,this,true,false);
                return spec[0];
            }
            else {
                //forcing discrimination for fragments only
                var u = this.definition() && this.definition().universe();
                if(u && u.version()=="RAML10"){
                    if(!this.definition()||!this.definition().isAssignableFrom(def.universesInfo.Universe10.LibraryBase.name)){
                        this.children();
                    }
                }
                else {
                    this.children();
                }

                this._wrapperNode = this.buildWrapperNode();
            }
        }
        return this._wrapperNode;
    }
    asElement():hl.IHighLevelNode{
        return this;
    }
    private buildWrapperNode(){
        var ramlVersion = this.definition().universe().version();
        if(ramlVersion=='RAML10'){
            return factory10.buildWrapperNode(this);
        }
        else if(ramlVersion=='RAML08'){
            return factory08.buildWrapperNode(this);
        }
        return null;
    }

    propertiesAllowedToUse():hl.IProperty[]{
        return this.definition().allProperties().filter(x=>this.isAllowedToUse(x));
    }

    isAllowedToUse(p:hl.IProperty){
        var ok=true;
        if (p.getAdapter(services.RAMLPropertyService).isSystem()){
            return false;
        }
        (<def.Property>p).getContextRequirements().forEach(y=>{
            if (y.name.indexOf('(')!=-1){
                //TODO HANDLE IT LATER
                return true;
            }
            var vl=this.computedValue(y.name);

            if (vl){
                ok=ok&&(vl==y.value);
            }
            else{
                if (y.value){
                    ok=false;
                }
            }
        })
        return ok;
    }

    allowRecursive(){
        if (this.definition().getAdapter(services.RAMLService).isUserDefined()){
            return true;
        }
        return false;
    }
    setWrapperNode(node:ParserCore.BasicNode){
        this._wrapperNode = node;
    }

    setAssociatedType(d:hl.INodeDefinition){
        this._associatedDef=d;
    }

    associatedType():hl.INodeDefinition{
        return this._associatedDef;
    }

    knownIds(){
        //initializing ids if needed
        //TODO refactor workaround
        this.isAuxilary();

        if(this._knownIds) {
            return this._knownIds;
        } else {
            return {};
        }
    }

    findById(id:string){

        //we dont need re-indexing each time someone asks
        //node byu ID from a sub-nodes. Root most probably
        //already has everything indexed
        var currentRoot = this.root();
        if (currentRoot != this) {
            return currentRoot.findById(id);
        }

        if (!this._knownIds){
            this._knownIds={};
            var all=search.allChildren(<hl.IHighLevelNode>this);
            all.forEach(x=>this._knownIds[x.id()]=x);
        }

        if (this.isAuxilary()) {
            if (!this._slaveIds) {
                this._slaveIds={};
                this._slaveIds[this.id()] = this;
                var all=search.allChildren(<hl.IHighLevelNode>this);
                all.forEach(x=>this._slaveIds[x.id()]=x);
            }

            var nodeIndexedInSlave = this._slaveIds[id];
            if (nodeIndexedInSlave) return nodeIndexedInSlave;
        }

        return this._knownIds[id];
    }

    isAuxilary(){
        if(this._isAux){
            return true;
        }
        if (this._auxChecked){
            return false;
        }
        this._auxChecked=true;

        var masterApi = this.getMaster();

        if (masterApi){

            this._isAux=true;

            this.initilizeKnownIDs(masterApi)

            return true
        }
        return false;
    }

    private initilizeKnownIDs(api : hl.IParseResult) : void {
        this._knownIds={};

        var allChildren = search.allChildren(<hl.IHighLevelNode>api);

        allChildren.forEach(x=>this._knownIds[x.id()]=x);

        this._knownIds[""]=api;
    }

    getMaster() : hl.IParseResult {
        if (this.masterApi) {
            return this.masterApi;
        }

        var detectedMaster = this.calculateMasterByRef();
        if (detectedMaster) {
            (<ASTNodeImpl>detectedMaster).setSlave(this);
        }

        return detectedMaster;
    }

    /**
     * Forcefully sets a master unit for this API, which may be different from the one, current unit points to
     * via masterRef.
     * @param master
     */
    overrideMaster(master : hl.IParseResult) : void {
        this.masterApi = master;

        this.resetAuxilaryState();

        if (master) {
            (<ASTNodeImpl>master).setSlave(this);
        }
    }

    setSlave(slave: hl.IParseResult) : void {
        this.slave = slave;
    }

    setMergeMode(mergeMode : OverlayMergeMode) : void {
        this.overlayMergeMode = mergeMode;
        this.resetAuxilaryState();
    }

    getMergeMode() {
        return this.overlayMergeMode;
    }




    private calculateMasterByRef() : hl.IParseResult {

        var unit = this.lowLevel().unit();
        if (!unit) return null;

        var masterReferenceNode = unit.getMasterReferenceNode();

        if (!masterReferenceNode || !masterReferenceNode.value()) {
            return null;
        }
        var lc:any=this.lowLevel();
        if (lc.master){
            return lc.master;
        }
        var masterPath = masterReferenceNode.value();

        var masterUnit = (<jsyaml.Project>this.lowLevel().unit().project()).resolve(this.lowLevel().unit().path(),masterPath);
        if (!masterUnit) {
            return null;
        }
        var result = masterUnit.expandedHighLevel();
        (<ASTNodeImpl>result).setMergeMode(this.overlayMergeMode);
        lc.master=result;
        return result;
    }


    private resetAuxilaryState() {
        this._isAux = false;
        this._auxChecked = false;
        this._knownIds = null;
        this.clearChildrenCache();
    }

    printDetails(indent?:string) : string {
        var result : string = ""
        if (!indent) indent = ""
        var classname = this.definition().nameId()
        var definitionClasName = this.property() ? this.property().range().nameId() : ""
        var parentPropertyName = this.property() ? this.property().nameId() : "";
        result += indent + classname + "[" + definitionClasName + "]" + " <--- " +parentPropertyName + "\n"
        this.children().forEach(child=>{
            result += child.printDetails(indent + "\t")
        })
        return result
    }

    /**
     * Used for test comparison of two trees. Touching this will require AST tests update.
     * @param indent
     * @returns {string}
     */
    testSerialize(indent?:string) : string {
        var result : string = ""
        if (!indent) indent = ""
        var classname = this.definition().nameId()
        var parentPropertyName = this.property() ? this.property().nameId() : "";
        result += indent + classname + " <-- " +parentPropertyName + "\n"
        this.children().forEach(child=>{
            if ((<any>child).testSerialize) {
                result += (<any>child).testSerialize(indent + "  ")
            }
        })
        return result
    }

    private getExtractedChildren(){
        var r=<ASTNodeImpl>this.root();
        if (r.isAuxilary()){
            if (r._knownIds){
                var i=<hl.IHighLevelNode>r._knownIds[this.id()];
                if (i){
                    var v=i.children();
                    return v;
                }
            }
            return [];
        }
        return [];
    }
    getMasterCounterPart():hl.IHighLevelNode{
        var r=<ASTNodeImpl>this.root();
        if (r.isAuxilary()){
            if (r._knownIds){
                var i=<hl.IHighLevelNode>r._knownIds[this.id()];
                return i;
            }
            return null;
        }
        return null;
    }

    /**
     * Finds slave counterpart of this node.
     * @returns {any}
     */
    getSlaveCounterPart():hl.IHighLevelNode {
        let root = <ASTNodeImpl> this.root();

        if (!root.slave) return null;

        return (<ASTNodeImpl>root.slave).findById(this.id());
    }

    /**
     * Finds the slave counterpart of this node. If this slave has another slave in turn, recursivelly,
     * returns the last slave in the dependency sequence.
     */
    getLastSlaveCounterPart() : hl.IHighLevelNode {
        let root = <ASTNodeImpl> this.root();

        let currentSlave = <ASTNodeImpl> root.slave;
        if (currentSlave == null) return null;

        while (currentSlave.slave != null) {
            currentSlave = <ASTNodeImpl> currentSlave.slave;
        }

        if (this.id() == "") return currentSlave;

        return currentSlave.findById(this.id());
    }

    private getExtractedLowLevelChildren(n:ll.ILowLevelASTNode){
        var r=<ASTNodeImpl>this.root();
        if (r.isAuxilary()){
            if (r._knownLowLevelIds){
                var i=<ll.ILowLevelASTNode>r._knownLowLevelIds[this.id()];
                if (i){
                    return i.children();
                }
            }
            return [];
        }
        return [];
    }

    allowsQuestion():boolean{
        return this._allowQuestion||this.definition().getAdapter(services.RAMLService).getAllowQuestion();
    }

    findReferences():hl.IParseResult []{
        var rs:hl.IParseResult[]=[];
        search.refFinder(this.root(),this,rs);
        //TODO FIX ME
        if (rs.length>1) {
           rs=rs.filter(x=>x!=this&& x.parent()!=this);
        }
        //filtering out equal results
        var filteredReferences:hl.IParseResult[]=[];
        rs.forEach(ref => {
            if (!_.find(filteredReferences, existing=>existing==ref)) {
                filteredReferences.push(ref);
            }
        });
        return filteredReferences;
    }
    private  _patchedName:string;

    setNamePatch(s: string){
        this._patchedName=s;
    }
    isNamePatch(){
        return this._patchedName;
    }

    name(){
        if (this._patchedName){
            return this._patchedName
        }
        var ka=_.find(this.directChildren(),x=>x.property()&&x.property().getAdapter(services.RAMLPropertyService).isKey());
        if (ka&&ASTPropImpl.isInstance(ka)){
            var c = null;
            var defClass = this.definition();
            var ramlVersion = defClass.universe().version();
            if(defClass&&ramlVersion=="RAML10"&&(<ASTPropImpl>ka).isFromKey()) {
                var key = this._node.key();
                c = this._node.optional() ? key + "?" : key;
            }
            else{
                c = (<ASTPropImpl>ka).value();
            }
            return c;
        }
        return super.name();
    }

    findElementAtOffset(n:number):hl.IHighLevelNode{
        return this._findNode(this,n,n);
    }

    isElement(){
        return true;
    }

    private _universe:defs.Universe;
    universe():defs.Universe{
        if (this._universe){
            return this._universe;
        }
        return <any>this.definition().universe()
    }
    setUniverse(u:defs.Universe){
        this._universe=u;
    }

    private _findNode(n:hl.IHighLevelNode,offset:number,end:number):hl.IHighLevelNode{
        if (n==null){
            return null;
        }
        if (n.lowLevel()) {
            //var node:ASTNode=<ASTNode>n;
            if (n.lowLevel().start() <= offset && n.lowLevel().end() >= end) {
                var res:hl.IHighLevelNode = n;
                //TODO INCLUDES
                n.elements().forEach(x=> {
                    if (x.lowLevel().unit()!=n.lowLevel().unit()){
                        return;
                    }
                    var m = this._findNode(x, offset, end);
                    if (m) {
                        res = m;
                    }
                })
                return res;
            }
        }
        return null;
    }


    isStub(){
        return (!this.lowLevel().unit())||(<jsyaml.CompilationUnit>this.lowLevel().unit()).isStubUnit();
    }

    add(node: hl.IHighLevelNode|hl.IAttribute){
        mutators.addToNode(this,node)
    }

    remove(node:hl.IHighLevelNode|hl.IAttribute){
        mutators.removeNodeFrom(this,node);
    }

    dump(flavor:string):string{
        return this._node.dump()
    }

    patchType(d:hl.INodeDefinition){
        this._def=d;
        var ass=this._associatedDef;
        this._associatedDef=null;
        this._children=null;
        this._mergedChildren=null;
    }
    _mergedChildren:hl.IParseResult[];

    children():hl.IParseResult[] {

        var lowLevel = this.lowLevel();

        if(lowLevel && (<any>lowLevel).isValueInclude && (<any>lowLevel).isValueInclude() && resourceRegistry.isWaitingFor((<any>lowLevel).includePath())) {
            this._children = null;

            return [];
        }

        if (this._children){
            if (this._mergedChildren){
                return this._mergedChildren;
            }
            this._mergedChildren= this.mergeChildren(this._children, this.getExtractedChildren());
            return this._mergedChildren;
        }

        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            this._children=this._children.filter(x=>x!=null);
            //FIXME

            return this.mergeChildren(this._children, this.getExtractedChildren());
        }
        return [];
    }


    private mergeChildren(originalChildren : hl.IParseResult[],
                          masterChildren : hl.IParseResult[]) : hl.IParseResult[] {

        var root = <ASTNodeImpl>this.root();

        if (root.overlayMergeMode == OverlayMergeMode.AGGREGATE) {

            //simply joining the sets
            return originalChildren.concat(masterChildren);
        }
        else if (root.overlayMergeMode  == OverlayMergeMode.MERGE) {

            var result : hl.IParseResult[] = []

            originalChildren.forEach(originalChild => {

                var masterCounterpart = _.find(masterChildren,
                        masterChild => masterChild.fullLocalId() == originalChild.fullLocalId());

                if (!masterCounterpart) {
                    //we dont have a counterpart, so simply adding to result
                    result.push(originalChild);
                } else {

                    //there is a counterpart, so deciding what to do:
                    this.mergeChild(result, originalChild, masterCounterpart);
                }
            })

            masterChildren.forEach(masterChild => {

                var originalCounterpart = _.find(originalChildren,
                        originalChild => masterChild.fullLocalId() == originalChild.fullLocalId());

                if (!originalCounterpart) {
                    //we dont have a counterpart, so simply adding to result
                    result.push(masterChild);
                }
            })

            return result;
        }

        return null;
    }
    private mergeLowLevelChildren(originalChildren : ll.ILowLevelASTNode[],
                          masterChildren : ll.ILowLevelASTNode[]) : ll.ILowLevelASTNode[] {

        var root = <ASTNodeImpl>this.root();

        if (root.overlayMergeMode == OverlayMergeMode.AGGREGATE) {

            //simply joining the sets
            return originalChildren.concat(masterChildren);
        }
        else if (root.overlayMergeMode  == OverlayMergeMode.MERGE) {

            var result : ll.ILowLevelASTNode[] = []

            originalChildren.forEach(originalChild => {

                var masterCounterpart = _.find(masterChildren,
                    masterChild => masterChild.key() == originalChild.key());

                if (!masterCounterpart) {
                    //we dont have a counterpart, so simply adding to result
                    result.push(originalChild);
                } else {

                    //there is a counterpart, so deciding what to do:
                    this.mergeLowLevelChild(result, originalChild, masterCounterpart);
                }
            })

            masterChildren.forEach(masterChild => {

                var originalCounterpart = _.find(originalChildren,
                    originalChild => masterChild.key() == originalChild.key());

                if (!originalCounterpart) {
                    //we dont have a counterpart, so simply adding to result
                    result.push(masterChild);
                }
            })

            return result;
        }

        return null;
    }
    private mergeLowLevelChild(result : ll.ILowLevelASTNode[], originalChild : ll.ILowLevelASTNode,
                       masterChild : ll.ILowLevelASTNode) {

        if (originalChild.kind() != masterChild.kind()) {

            //should not happen theoretically
            result.push(originalChild);
            result.push(masterChild);
            return;
        }
        result.push(originalChild);
    }

    private mergeChild(result : hl.IParseResult[], originalChild : hl.IParseResult,
        masterChild : hl.IParseResult) {

        if (originalChild.getKind() != masterChild.getKind()) {

            //should not happen theoretically
            result.push(originalChild);
            result.push(masterChild);
            return;
        }

        if (originalChild.getKind() == hl.NodeKind.NODE) {

            result.push(originalChild);
            return;
        } else if (originalChild.getKind() == hl.NodeKind.ATTRIBUTE) {

            //if ((<ASTPropImpl>originalChild).name() == "displayName" ||
            //    (<ASTPropImpl>originalChild).name() == "title") {
            //    console.log("OriginalChildForDisplayName: " + (<ASTPropImpl>originalChild).value())
            //    console.log("MasterChildForDisplayName: " + (<ASTPropImpl>masterChild).value())
            //
            //}

            result.push(originalChild);
            return;
        } else if (originalChild.getKind() == hl.NodeKind.BASIC) {

            //we do not know what to do with basic nodes, so adding both.
            result.push(originalChild);
            result.push(masterChild);
            return;
        }
    }

    directChildren():hl.IParseResult[] {
        if (this._children){
            return this._children;
        }
        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            this._mergedChildren = null;
            return this._children;

        }
        return [];
    }

    resetChildren(){
        this._children = null;
        this._mergedChildren=null;
    }

    isEmptyRamlFile(): boolean {
        var llroot = <jsyaml.ASTNode>(<jsyaml.ASTNode>this.lowLevel()).root();
        return llroot.isScalar();
    }

    initRamlFile() {
        mutators.initEmptyRAMLFile(this);
    }

    createAttr(n:string,v:string){
        mutators.createAttr(this,n,v);
    }


    isAttr():boolean{
        return false;
    }
    isUnknown():boolean{
        return false;
    }
    value():any{
        return this._node.value();
    }

    valuesOf(propName:string):hl.IHighLevelNode[]{
        var pr= this._def.property(propName)
        if (pr!=null){
            return this.elements().filter(x=>x.property()==pr);
        }
        return [];
    }
    attr(n:string):hl.IAttribute{
        return _.find(this.attrs(),y=>y.name()==n);
    }

    attrOrCreate(name: string):hl.IAttribute{
        var a = this.attr(name);
        if(!a) this.createAttr(name, '');
        return this.attr(name);
    }

    attrValue(n:string):string {
        var a = this.attr(n);
        return a? a.value() : null;
    }

    attributes(n:string):hl.IAttribute[]{
        return _.filter(this.attrs(),y=>y.name()==n);
    }

    attrs():hl.IAttribute[]{
        var rs= <hl.IAttribute[]>this.children().filter(x=>x.isAttr());
        if (this._patchedName){
            var kp=_.find(this.definition().allProperties(),x=>x.getAdapter(services.RAMLPropertyService).isKey());
            if (kp) {
                var mm = new ASTPropImpl(this.lowLevel(), this, kp.range(), kp, true);
                mm._value = this._patchedName;
                return (<hl.IAttribute[]>[mm]).concat(rs);
            }
        }
        return rs;
    }

    elements():hl.IHighLevelNode[]{
        return <hl.IHighLevelNode[]>this.children()
            .filter(x=>!x.isAttr()&&!x.isUnknown())
    }
    element(n:string):hl.IHighLevelNode{
        var r= this.elementsOfKind(n)
        if (r.length>0){
            return r[0];
        }
        return null;
    }

    elementsOfKind(n:string):hl.IHighLevelNode[]{
        var r= this.elements().filter(x=>x.property().nameId()==n)
        return r;
    }

    definition():hl.INodeDefinition {
        return this._def;
    }

    property():hl.IProperty {
        return this._prop;
    }

    isExpanded():boolean {
        return this._expanded;
    }

    copy(): ASTNodeImpl {
        return new ASTNodeImpl(this.lowLevel().copy(), this.parent(), this.definition(), this.property());
    }

    clearChildrenCache() {
        this._children = null;
        this._mergedChildren=null;
    }

    optionalProperties():string[]{
        var def = this.definition();
        if(def==null){
            return [];
        }
        var result:string[] = [];
        var map = {};
        var children = this.lowLevel().children();
        children.forEach(x=>{
            if(x.optional()){
                map[x.key()] = true;
            }
        });
        var props = def.allProperties();
        props.forEach(x=>{
            var prop:def.Property = <def.Property>x;
            if(map[prop.nameId()]){
                result.push(prop.nameId());
            }
        });
        return result;
    }

    setReuseMode(val:boolean){
        this._reuseMode = val;
        if(this._children && this.lowLevel().valueKind()!=yaml.Kind.SEQ){
            this._children.forEach(x=>(<BasicASTNode>x).setReuseMode(val));
        }
    }

    reusedNode(): hl.IHighLevelNode{
        return this._reusedNode;
    }

    setReusedNode(n:hl.IHighLevelNode){
        this._reusedNode = n;
    }

    resetRuntimeTypes(){
        delete this._associatedDef;
        this.elements().forEach(x=>(<ASTNodeImpl>x).resetRuntimeTypes());
    }

    /**
     * Turns high level model node into an object.
     * @param options serialization options
     * @return Stringifyable object representation of the node.
     **/
    toJSON(options:jsonSerializerHL.SerializeOptions):any{
        return new jsonSerializerHL.JsonSerializer(options).dump(this);
    }
}

export var universeProvider = require("./definition-system/universeProvider");
var getDefinitionSystemType = function (contents:string,ast:ll.ILowLevelASTNode) {

    var rfl = ramlFirstLine(contents);
    var spec = (rfl && rfl[1])||"";
    var ptype = (rfl && rfl.length > 2 && rfl[2]) || "Api";
    var originalPType = rfl && rfl.length > 2 && rfl[2];
    var localUniverse = spec == "1.0" ? new def.Universe(null,"RAML10", universeProvider("RAML10"),"RAML10") : new def.Universe(null,"RAML08", universeProvider("RAML08"));

    if (ptype=='API'){
        ptype="Api"
    }
    else if (ptype=='NamedExample'){
        ptype="ExampleSpec"
    }
    else if (ptype=='DataType'){
        ptype="TypeDeclaration"
    }
    else if (ptype=='SecurityScheme'){
        ptype="AbstractSecurityScheme"
    }
    else if (ptype=='AnnotationTypeDeclaration'){
        ptype="TypeDeclaration"
    }


    localUniverse.setOriginalTopLevelText(originalPType);
    localUniverse.setTopLevel(ptype);
    localUniverse.setTypedVersion(spec);

    // localUniverse.setDescription(spec);
    return { ptype: ptype, localUniverse: localUniverse };
};

export function ramlFirstLine(content:string):RegExpMatchArray{
    return content.match(/^\s*#%RAML\s+(\d\.\d)\s*(\w*)\s*$/m);
}

export function getFragmentDefenitionName(highLevelNode: hl.IHighLevelNode): string {
    var contents = highLevelNode.lowLevel() && highLevelNode.lowLevel().unit() && highLevelNode.lowLevel().unit().contents();

    if (contents == null) {
        return null;
    }

    return getDefinitionSystemType(contents, highLevelNode.lowLevel()).ptype;
}

export function fromUnit(l: ll.ICompilationUnit): hl.IParseResult {
    if (l == null)
        return null;

    var contents = l.contents();
    var ast = l.ast();
    var __ret = getDefinitionSystemType(contents, ast);
    var ptype = __ret.ptype;
    var localUniverse = __ret.localUniverse;
    var apiType = localUniverse.type(ptype)

    if (!apiType) apiType = localUniverse.type("Api");

    var api = new ASTNodeImpl(ast, null, <any>apiType, null);
    api.setUniverse(localUniverse);
    //forcing discrimination for fragments only
    var u = apiType && apiType.universe();
    if(u && u.version()=="RAML10"){
        if(!apiType.isAssignableFrom(def.universesInfo.Universe10.LibraryBase.name)){
            api.children();
        }
    }
    else {
        api.children();
    }
    return api;
}





/**
 * Creates basic acceptor.
 * If primaryUnitPointerNode is provided, creates PointOfViewValidationAcceptor
 * instance with primary unit taken from the node.
 * @param errors
 * @param primaryUnitPointerNode
 * @returns {hl.ValidationAcceptor}
 */
export function createBasicValidationAcceptor(
    errors:hl.ValidationIssue[],
    primaryUnitPointerNode? : hl.IParseResult):hl.ValidationAcceptor{


    if (primaryUnitPointerNode) {
        var unit = primaryUnitPointerNode.root().lowLevel().unit();
        if (unit) {

            return new utils.PointOfViewValidationAcceptorImpl(errors, primaryUnitPointerNode.root())
        } else {
            return {
                accept(c:hl.ValidationIssue){
                    errors.push(c);
                },
                begin(){

                },
                end(){

                },
                acceptUnique(issue: hl.ValidationIssue){
                    for(var e of errors){
                        if(e.start==issue.start && e.message==issue.message){
                            return;
                        }
                    }
                    this.accept(issue);
                }
            };
        }
    }
}

export function isAnnotationTypeFragment(node:hl.IHighLevelNode):boolean{
    if(node.parent()!=null){
        return false;
    }
    var unit = node.lowLevel().unit();
    if(unit==null){
        return false;
    }
    var content = unit.contents();
    var fLine = ramlFirstLine(content);
    if(fLine.length<3){
        return false;
    }
    return fLine[2] == "AnnotationTypeDeclaration";
}

export class AnnotatedNode implements def.rt.tsInterfaces.IAnnotatedElement{

    constructor(protected _node:hl.IParseResult){};

    private _annotations:AnnotationInstance[];

    private _annotationsMap: {[key:string]:def.rt.tsInterfaces.IAnnotationInstance};

    kind():string{ return "AnnotatedNode"; }

    annotationsMap(): {[key:string]:def.rt.tsInterfaces.IAnnotationInstance}{
        if(!this._annotationsMap) {
            this._annotationsMap = {};
            this.annotations().forEach(x=>{
                var n = x.name();
                var ind = n.lastIndexOf(".");
                if(ind>=0){
                    n = n.substring(ind+1);
                }
                this._annotationsMap[n]=x
            });
        }
        return this._annotationsMap;
    }

    annotations(): def.rt.tsInterfaces.IAnnotationInstance[]{
        if(!this._annotations) {
            var aAttrs:hl.IAttribute[] = [];
            if (this._node.isElement()) {
                aAttrs = this._node.asElement().attributes(
                    def.universesInfo.Universe10.Annotable.properties.annotations.name);
            }
            else if(this._node.isAttr()){
                aAttrs = this._node.asAttr().annotations();
            }
            this._annotations = aAttrs.map(x=>new AnnotationInstance(x));
        }
        return this._annotations;
    }

    value():any{
        if(this._node.isElement()){
            return this._node.asElement().wrapperNode().toJSON();
        }
        else if(this._node.isAttr()){
            var val = this._node.asAttr().value();
            if(StructuredValue.isInstance(val)){
                return (<StructuredValue>val).lowLevel().dump();
            }
            return val;
        }
        return this._node.lowLevel().dump();
    }

    name():string{ return this._node.name(); }

    entry():hl.IParseResult{ return this._node; }

}

export class AnnotationInstance implements def.rt.tsInterfaces.IAnnotationInstance {

    constructor(protected attr:hl.IAttribute){}

    name():string{
        return this.attr.value().valueName();
    }
    /**
     * Annotation value
     */
    value(): any{
        var val = this.attr.value();
        if(StructuredValue.isInstance(val)){
            var obj = (<StructuredValue>val).lowLevel().dumpToObject();
            var key = Object.keys(obj)[0];
            return obj[key];
        }
        return val;
    }
    /**
     * Annotation definition type
     */
    definition(): def.rt.tsInterfaces.IParsedType{
        var parent = this.attr.parent();
        var vn = this.name();
        var cands = search.referenceTargets(this.attr.property(),parent).filter(
            x=>qName(x,parent)==vn);

        if(cands.length==0){
            return null;
        }
        return cands[0].parsedType();
    }
}

function toValidationIssue(x:hl.PluginValidationIssue, pluginId:string, node:hl.IParseResult) {
    var vi = x.validationIssue;
    if (!vi) {
        var issueCode = x.issueCode || pluginId;
        var node1 = x.node || node;
        var message = x.message || linter.createIssue1(messageRegistry.PLUGIN_REPORTS_AN_ERROR, {pluginId: pluginId}, node1, false).message;
        var isWarning = x.isWarning;
        vi = linter.createIssue(issueCode, message, node1, isWarning);
    }
    return vi;
};
/**
 * Apply registered node validation plugins to the type
 * @param node node to be validated
 * @returns an array of {NodeValidationPluginIssue}
 */

export function applyNodeValidationPlugins(node:hl.IParseResult):hl.ValidationIssue[] {

    var result:hl.ValidationIssue[] = [];
    var plugins = hl.getNodeValidationPlugins();
    for (var tv of plugins) {
        var issues:hl.PluginValidationIssue[] = tv.process(node);
        if (issues) {
            issues.forEach(x=>{
                var vi = toValidationIssue(x, tv.id(), node);
                result.push(vi);
            });
        }
    }
    return result;
}

/**
 * Apply registered node annotation validation plugins to the type
 * @param node node to be validated
 * @returns an array of {NodeValidationPluginIssue}
 */

export function applyNodeAnnotationValidationPlugins(
    node:hl.IParseResult):hl.ValidationIssue[] {

    var aEntry = new AnnotatedNode(node);
    var result:hl.ValidationIssue[] = [];
    var plugins = hl.getNodeAnnotationValidationPlugins();
    for (var tv of plugins) {
        var issues:hl.PluginValidationIssue[] = tv.process(aEntry);
        if (issues) {
            issues.forEach(x=>{
                var vi = toValidationIssue(x, tv.id(), node);
                result.push(vi);
            });
        }
    }
    return result;
}

export function toParserErrors(issues:hl.ValidationIssue[],node:hl.IHighLevelNode):hl.RamlParserError[]{

    var rawResult = issues.map(x=>basicError(x,node));
    var result:hl.RamlParserError[] = filterErrors(rawResult);
    return result;
}

function filterErrors(rawErrors:hl.RamlParserError[]):hl.RamlParserError[] {
    var result:hl.RamlParserError[] = [];
    var errorsMap = {};

    rawErrors.map(x=>{errorsMap[JSON.stringify(x)] = x});
    var keys: string[] = Object.keys(errorsMap);
    for (var i = 0; i < keys.length; i++){
        result.push(errorsMap[keys[i]]);
    }
    return result;
}

function basicError(x:hl.ValidationIssue,node:hl.IHighLevelNode):hl.RamlParserError {
    var lineMapper = (x.node && x.node.lowLevel() && x.node.lowLevel().unit().lineMapper())
        || node.lowLevel().unit().lineMapper();

    var startPoint = null;
    try {
        startPoint = lineMapper.position(x.start);
    }
    catch (e) {
        console.warn(e);
    }

    var endPoint = null;
    try {
        endPoint = lineMapper.position(x.end);
    }
    catch (e) {
        console.warn(e);
    }

    var path:string;
    if (x.path) {
        path = x.path;
    }
    else if (x.node) {
        path = x.node.lowLevel().unit().path();
    }
    else {
        path = search.declRoot(node).lowLevel().unit().path();
    }
    var eObj:any = {
        code: x.code,
        message: x.message,
        path: path,
        range: {
            start: startPoint,
            end: endPoint
        },
        isWarning: x.isWarning
    };
    if(x.extras && x.extras.length>0){
        eObj.trace = x.extras.map(y=>basicError(y,node));
    }
    return eObj;
}

function markTemplateTypes(node:ParseNode){
    if(node.kind()==yaml.Kind.SCALAR){
        if(checkIfHasTeplateParams(node.value())){
            node.addMeta("skipValidation", true);
        }
        return;
    }
    let typeNode = node.childWithKey(def.universesInfo.Universe10.TypeDeclaration.properties.type.name);
    let schemaNode = node.childWithKey(def.universesInfo.Universe10.TypeDeclaration.properties.schema.name);

    let typeNodes:ParseNode[] = [];
    if(typeNode) {
        if (typeNode.kind() == yaml.Kind.SEQ) {
            typeNodes = typeNodes.concat(typeNode.children());
        }
        else {
            typeNodes.push(typeNode);
        }
    }
    if(schemaNode) {
        if (schemaNode && schemaNode.kind() == yaml.Kind.SEQ) {
            typeNodes = typeNodes.concat(schemaNode.children());
        }
        else {
            typeNodes.push(schemaNode);
        }
    }
    let skipValidation = false;
    for(let tn of typeNodes){
        if(tn.kind()==yaml.Kind.SCALAR){
            let val = tn.value();
            skipValidation = skipValidation||checkIfHasTeplateParams(val);
        }
        else if(tn.kind()==yaml.Kind.MAP||tn.kind()==yaml.Kind.MAPPING){
            markTemplateTypes(tn);
        }
    }
    for(let ch of node.children()){
        let chKey = ch.key();
        if(checkIfHasTeplateParams(chKey)){
            ch.addMeta("skipValidation", true);
        }
        else if(typeof ch.value() === "string"){
            if(checkIfHasTeplateParams(ch.value())){
                ch.addMeta("skipValidation", true);
            }
        }
        else if(chKey && chKey.length>0
            && chKey.charAt(0)=="(" && chKey.charAt(chKey.length-1)==")"){
            if(hasTemplateArgs((<LowLevelWrapperForTypeSystem>ch).node())){
                ch.addMeta("skipValidation", true);
            }
        }
    }
    if(skipValidation){
        node.addMeta("skipValidation", true);
    }
    let pNode = node.childWithKey(def.universesInfo.Universe10.ObjectTypeDeclaration.properties.properties.name);
    checkTypePropertiesForTemplateParameters(pNode);
    let fNode = node.childWithKey(def.universesInfo.Universe10.TypeDeclaration.properties.facets.name);
    checkTypePropertiesForTemplateParameters(fNode);

    let iNode = node.childWithKey(def.universesInfo.Universe10.ArrayTypeDeclaration.properties.items.name);
    if(iNode){
        if(iNode.kind()==yaml.Kind.SCALAR){
            if(checkIfHasTeplateParams(iNode.value())){
                iNode.addMeta("skipValidation", true);
            }
        }
        else if(iNode.kind()==yaml.Kind.MAP||iNode.kind()==yaml.Kind.MAPPING){
            for(let p of iNode.children()){
                markTemplateTypes(p);
            }
        }
    }

}

function checkTypePropertiesForTemplateParameters(propertiesNode: ParseNode) {
    if (propertiesNode) {
        for (let p of propertiesNode.children()) {
            markTemplateTypes(p);
        }
    }
}

function checkIfHasTeplateParams(value:any){
    if(typeof value === "string") {
        let i0 = value.indexOf("<<");
        if (i0 >= 0 && value.indexOf(">>", i0) > 0) {
            return true;
        }
    }
    return false;
}

function hasTemplateArgs(node:ll.ILowLevelASTNode):boolean{
    var vl=node.value();
    if (typeof vl=="string"){
        if (vl.indexOf("<<")!=-1){
            return true;
        }
    }
    var x=node.children();
    for( var i=0;i< x.length;i++){
        if (hasTemplateArgs(x[i])){
            return true;
        }
    }
    return false;
}

export function actualPath(node: hl.IParseResult,checkIfDifferent=false) {
    let llNode = node.lowLevel();
    let ownPath = llNode.unit().absolutePath();
    let unit = actualUnit(llNode);
    let unitPath:string;
    if((llNode.kind() == yaml.Kind.INCLUDE_REF || llNode.valueKind() == yaml.Kind.INCLUDE_REF)
        && unit.absolutePath() == ownPath && llNode.includePath()){
        unitPath = llNode.includePath();
    }
    else if (unit.isRAMLUnit() && unit.ast()) {
        let iPath = unit.ast().includePath();
        if(iPath){
            unitPath = iPath;
        }
    }
    if(!unitPath) {
        unitPath = unit.absolutePath();
    }
    if(checkIfDifferent){
        if(ownPath==unitPath){
            return null;
        }
    }
    if (!ll.isWebPath(unitPath)) {
        let projectPath = unit.project().getRootPath();
        unitPath = path.relative(projectPath, unitPath).replace(/\\/g, '/');
    }
    return unitPath;
}

export function actualUnit(llNode:ll.ILowLevelASTNode) {
    let nodeUnit = llNode.unit();
    let unit = nodeUnit;
    while (llNode.kind() == yaml.Kind.INCLUDE_REF || llNode.valueKind() == yaml.Kind.INCLUDE_REF) {
        let iPath = llNode.includePath();
        let iUnit = unit.resolve(iPath);
        if (iUnit) {
            unit = iUnit;
            if (unit.isRAMLUnit()) {
                llNode = unit.ast();
            }
            else {
                break;
            }
        }
        else{
            break;
        }
    }
    return unit;
}