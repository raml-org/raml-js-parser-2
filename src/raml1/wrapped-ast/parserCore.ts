import hl=require("../highLevelAST");
import ll=require("../lowLevelAST");
import hlImpl=require("../highLevelImpl");
import jsyaml=require("../jsyaml/jsyaml2lowLevel");
import json=require("../jsyaml/json2lowLevel");
import def=require("raml-definition-system");
var ramlService=def;
import json2lowlevel = require('../jsyaml/json2lowLevel');
import defaultCalculator = require("./defaultCalculator");
import search=require("../ast.core/search");
import universeHelpers = require("../tools/universeHelpers")
import tckDumper = require("../../util/TCKDumper")
import yaml=require("yaml-ast-parser")

import parserCoreApi = require("./parserCoreApi")

export type AbstractWrapperNode=hl.AbstractWrapperNode;
export type BasicNode=hl.BasicNode;
export type SerializeOptions=hl.SerializeOptions;
export type ValueMetadata=hl.ValueMetadata



export class BasicNodeImpl implements hl.BasicNode{

    private defaultsCalculator : defaultCalculator.AttributeDefaultsCalculator;

    _meta:NodeMetadataImpl = new NodeMetadataImpl(false,false,
        universeHelpers.isMethodType(this.highLevel().definition())&&this.optional());


    /**
     * @hidden
     **/
    constructor(protected _node:hl.IHighLevelNode,setAsWrapper:boolean=true){
        if(setAsWrapper) {
            _node.setWrapperNode(this);
        }
    }

    /**
     * @hidden
     **/
    wrapperClassName():string{
        return 'BasicNodeImpl';
    }

    kind():string{
        return 'BasicNode';
    }

    /**
     * @return Direct ancestor in RAML hierarchy
     **/
    parent():BasicNode{
        var parent = this._node.parent()
        return parent ? parent.wrapperNode() : null;
    }

    /**
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel():hl.IHighLevelNode{
        return this._node;
    }

    /**
     * @hidden
     **/
    protected attributes(name:string,constr?:(attr:hl.IAttribute)=>any):any[]{
        var attrs:hl.IAttribute[] = this._node.attributes(name);
        if(!attrs || attrs.length == 0){
            var defaultValue = this.getDefaultsCalculator().
            attributeDefaultIfEnabled(this._node, this._node.definition().property(name));
            if (defaultValue == null) return [];
            return Array.isArray(defaultValue) ? defaultValue : [ defaultValue ];
        }
        //TODO not sure if we want to artificially create missing attributes having
        //default values
        return attributesToValues(attrs,constr);
    }

    /**
     * @hidden
     **/
    protected attribute(name:string,constr?:(attr:hl.IAttribute)=>any):any{
        var attr:hl.IAttribute = this._node.attr(name);

        if (constr && !(
                constr == this.toString ||
                constr == this.toBoolean ||
                constr == this.toNumber ||
                constr == this.toAny
            )) {
            //we're not putting values directly inside anything, besides the default
            //convertors for default types we support
            if (attr == null) return null;
            return constr(attr);
        }

        var attributeValue = attr ? attr.value():null;
        if(attributeValue == null){
            attributeValue = this.getDefaultsCalculator().
                attributeDefaultIfEnabled(this._node, this._node.definition().property(name))
        }

        if (attributeValue == null) return null;

        if(constr){
            return constr(attributeValue);
        }
        else{
            return attributeValue;
        }
    }

    /**
     * @hidden
     **/
    protected elements(name:string):any[]{
        var elements:hl.IHighLevelNode[] = this._node.elementsOfKind(name);
        if(!elements){
            return null;
        }
        return elements.map(x=>x.wrapperNode());
    }

    /**
     * @hidden
     **/
    protected element(name:string):any{
        var element:hl.IHighLevelNode = this._node.element(name);
        if(!element){
            return null;
        }
        return element.wrapperNode();
    }

    /**
     * Append node as child
     * @param node node to be appended
     **/
    add(node:BasicNodeImpl){
        this.highLevel().add(node.highLevel());
    }

    /**
     * Append node as property value
     * @param node node to be set as property value
     * @param prop name of property to set value for
     **/
    addToProp(node:BasicNodeImpl,prop:string){
        var hl=<any>node.highLevel();
        var pr=(<def.NodeClass>this.highLevel().definition()).property(prop);
        (<any>hl)._prop=pr;
        this.highLevel().add(hl);
    }

    /**
     * Remove node from children set
     * @param node node to be removed
     **/
    remove(node:BasicNodeImpl){
        this.highLevel().remove(node.highLevel());
    }

    /**
     * @return YAML string representing the node
     **/
    dump(){
        return this.highLevel().dump("yaml");
    }

    toString(arg:any):string{
        var obj : any;
        //kind of instanceof for hl.IAttribute without actually calling instanceof
        if (arg.lowLevel && arg.property) {
            obj = (<hl.IAttribute>arg).value();
        }
        else {
            obj = arg;
        }

        return obj != null ? obj.toString() : obj;
    }
    toAny(arg:any):any{
        return arg;
    }

    toBoolean(arg:any):boolean{
        var obj : any;
        //kind of instanceof for hl.IAttribute without actually calling instanceof
        if (arg.lowLevel && arg.property) {
            obj = (<hl.IAttribute>arg).value();
        }
        else {
            obj = arg;
        }

        return obj != null ? obj.toString() == 'true' : obj;
    }

    toNumber(arg:any){
        var obj : any;
        //kind of instanceof for hl.IAttribute without actually calling instanceof
        if (arg.lowLevel && arg.property) {
            obj = (<hl.IAttribute>arg).value();
        }
        else {
            obj = arg;
        }

        if(!obj){
            return obj;
        }
        try{
            var nValue = parseFloat(obj.toString());
            return nValue;
        }
        catch(e){}
        return Number.MAX_VALUE;
    }

    /**
     * @return Array of errors
     **/
    errors():RamlParserError[]{

        var issues = [];
        var highLevelErrors=this._node.errors()
        if(highLevelErrors!=null) {
            issues = issues.concat(highLevelErrors);
        }
        var lineMapper = this._node.lowLevel().unit().lineMapper();
        var result = issues.map(x=>{

            var startPoint = null;
            try {
                startPoint = lineMapper.position(x.start);
            }
            catch(e){
                console.warn(e);
            }

            var endPoint = null;
            try {
                endPoint = lineMapper.position(x.end);
            }
            catch(e){
                console.warn(e);
            }

            var path:string;
            if(x.path) {
                path = x.path;
            }
            else if(x.node) {
                path = x.node.lowLevel().unit().path();
            }
            else{
                path = search.declRoot(this.highLevel()).lowLevel().unit().path();
            }

            return {
                code: x.code,
                message: x.message,
                path: path,
                start: x.start,
                end: x.end,
                line: startPoint.errorMessage ? null : startPoint.line,
                column: startPoint.errorMessage ? null : startPoint.column,
                range: [startPoint, endPoint],
                isWarning: x.isWarning
            };
        });
        return result;
    }

    /**
     * @return object representing class of the node
     **/
    definition():hl.ITypeDefinition {
        return this.highLevel().definition();
    }

    /**
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition():hl.ITypeDefinition {
        if (universeHelpers.isTypeDeclarationSibling(this.highLevel().definition())) {
            return this.highLevel().localType();
        }
        return null;
    }

    toJSON(serializeOptions?:tckDumper.SerializeOptions):any{
        return new tckDumper.TCKDumper(serializeOptions).dump(this);
    }

    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional():boolean{
        var highLevel = this.highLevel();
        return highLevel != null ? highLevel.optional() : false;
    }

    /**
     * @return For siblings of traits or resource types returns an array of optional properties names.
     **/
    optionalProperties():string[]{
        if(!this.highLevel()){
            return [];
        }
        return this.highLevel().optionalProperties();
    }

    /**
     * @hidden
     **/
    getDefaultsCalculator() : defaultCalculator.AttributeDefaultsCalculator {
        if (this.defaultsCalculator) {
            return this.defaultsCalculator;
        }

        if (this.parent()) {
            this.defaultsCalculator = (<BasicNodeImpl>this.parent()).getDefaultsCalculator();
        }

        if (!this.defaultsCalculator) {
            this.defaultsCalculator = new defaultCalculator.AttributeDefaultsCalculator(false);
        }

        return this.defaultsCalculator;
    }

    /**
     * @hidden
     **/
    setAttributeDefaults(attributeDefaults : boolean) : void {
        this.defaultsCalculator = new defaultCalculator.AttributeDefaultsCalculator(attributeDefaults);
    }

    attributeDefaults():boolean{
        return this.getDefaultsCalculator() && this.getDefaultsCalculator().isEnabled();
    }

    meta():NodeMetadata{
        return fillElementMeta(this);
    }

    RAMLVersion():string{
        return this.highLevel().definition().universe().version();
    }
}



export class AttributeNodeImpl implements parserCoreApi.AttributeNode{

    protected attr:hl.IAttribute;

    protected _meta:ValueMetadataImpl = new ValueMetadataImpl();

    constructor(attr:hl.IAttribute ){
        this.attr = attr;
    }

    /**
     * @return Underlying High Level attribute node
     **/
    highLevel(  ):hl.IAttribute{return this.attr;}

    /**
     * @hidden
     **/
    wrapperClassName():string{
        return 'AttributeNodeImpl';
    }

    kind():string{
        return 'AttributeNode';
    }

    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional():boolean{
        var highLevel = this.highLevel();
        return highLevel != null ? highLevel.optional() : false;
    }

    meta():ValueMetadataImpl{
        return this._meta;
    }

    RAMLVersion():string{
        return this.highLevel().definition().universe().version();
    }
}


/**
 * @hidden
 **/
export function toStructuredValue(node:hl.IAttribute):hlImpl.StructuredValue{
    var value = node.value();
    if(typeof value ==='string'||value==null){
        var mockNode=jsyaml.createNode(value);
        mockNode._actualNode().startPosition=node.lowLevel().valueStart();
        mockNode._actualNode().endPosition=node.lowLevel().valueEnd();
        var stv=new hlImpl.StructuredValue(mockNode,node.parent(),node.property());
        return stv;
    }
    else{
        return <hlImpl.StructuredValue>value;
    }
}

export  type RamlParserError=hl.RamlParserError;

export interface ApiLoadingError extends Error{

    parserErrors:RamlParserError[]
}

export class TypeInstanceImpl{

    constructor(nodes:ll.ILowLevelASTNode|ll.ILowLevelASTNode[]){
        if(!Array.isArray(nodes)){
            this.node = <ll.ILowLevelASTNode>nodes;
        }
        else{
            this.children = <ll.ILowLevelASTNode[]>nodes;
        }
    }

    protected node:ll.ILowLevelASTNode;

    protected children:ll.ILowLevelASTNode[];

    properties() {
        return this.getChildren().map(x=>new TypeInstancePropertyImpl(x));
    }

    private getChildren() {
        return (this.node && this.node.children()) || this.children;
    }

    value(){
        return this.node && this.node.value();
    }

    isScalar(){
        if(!this.node){
            return false;
        }
        if(this.node.children().length != 0){
            return false;
        }
        var hl = this.node.highLevelNode();
        if(hl){
            var prop = hl.property();
            var range = prop.range();
            if(range) {
                return range.isValueType();
            }
        }
        return true;
    }

    toJSON():any{
        return new tckDumper.TCKDumper().serializeTypeInstance(this);
    }
}

export class TypeInstancePropertyImpl{

    constructor(protected node:ll.ILowLevelASTNode){}

    name(){
        return this.node.key();
    }

    value(){
        if(this.isArray()){
            var children = this.node.children();
            return children.length > 0 ? new TypeInstanceImpl(children[0]) : null;
        }
        else{
            return new TypeInstanceImpl(this.node);
        }
    }

    values(){
        return this.isArray()
            ? this.node.children().map(x=>new TypeInstanceImpl(x))
            : [ new TypeInstanceImpl(this.node) ];
    }

    isArray(){
        var children = this.node.children();
        if(children.length > 0 && children[0].key()==null){
            return true;
        }
        var hl = this.node.highLevelNode();
        if(hl){
            var prop = hl.property();
            if(prop) {
                var range = prop.range();
                if(range) {
                    return range.isArray();
                }
            }
        }
        return this.node.valueKind() == yaml.Kind.SEQ;
    }
}

export type ValueMetaData=hl.ValueMetadata;
export type NodeMetadata=hl.NodeMetadata;

export class ValueMetadataImpl implements ValueMetadata{

    constructor(
        protected _insertedAsDefault:boolean=false,
        protected _calculated:boolean=false,
        protected _optional:boolean = false){}

    calculated(){ return this._calculated; }

    insertedAsDefault(){ return this._insertedAsDefault; }

    setCalculated(){
        this._calculated = true;
    }

    setInsertedAsDefault(){
        this._insertedAsDefault = true;
    }

    setOptional(){
        this._optional = true;
    }

    optional(){
        return this._optional;
    }

    isDefault(){
        return !(this._insertedAsDefault||this._calculated||this._optional);
    }

    toJSON(){
        var obj = {};
        if(this._calculated){
            obj['calculated'] = true;
        }
        if(this._insertedAsDefault){
            obj['insertedAsDefault'] = true;
        }
        if(this._optional){
            obj['optional'] = true;
        }
        return obj;
    }
}

export class NodeMetadataImpl extends ValueMetadataImpl implements NodeMetadata{

    valuesMeta:{[key:string]:ValueMetadata} = {};

    primitiveValuesMeta():{[key:string]:ValueMetadata}{return this.valuesMeta;}

    registerInsertedAsDefaultValue(propName:string){
        var pMeta:ValueMetadataImpl = <ValueMetadataImpl>this.valuesMeta[propName];
        if(pMeta==null) {
            this.valuesMeta[propName] = new ValueMetadataImpl(true);
        }
        else{
            pMeta.setInsertedAsDefault();
        }
    }

    registerCalculatedValue(propName:string){
        var pMeta:ValueMetadataImpl = <ValueMetadataImpl>this.valuesMeta[propName];
        if(pMeta==null) {
            this.valuesMeta[propName] = new ValueMetadataImpl(false, true);
        }
        else{
            pMeta.setCalculated();
        }
    }

    registerOptionalValue(propName:string){
        var pMeta:ValueMetadataImpl = <ValueMetadataImpl>this.valuesMeta[propName];
        if (pMeta == null) {
            this.valuesMeta[propName] = new ValueMetadataImpl(false, false, true);
        }
        else{
            pMeta.setOptional();
        }
    }

    resetPrimitiveValuesMeta(){
        this.valuesMeta = {};
    }

    isDefault(){
        if(!super.isDefault()){
            return false;
        }
        return Object.keys(this.valuesMeta).length == 0;
    }

    toJSON(){
        var obj = super.toJSON();
        var valuesObj = {};
        var propKeys = Object.keys(this.valuesMeta);
        if(propKeys.length>0) {
            propKeys.forEach(x=>{
                var childMeta = this.valuesMeta[x].toJSON();
                if(Object.keys(childMeta).length>0) {
                    valuesObj[x] = childMeta;
                }
            });
            obj['primitiveValuesMeta'] = valuesObj;
        }
        return obj;
    }
}

export function fillElementMeta(node:BasicNodeImpl):NodeMetadataImpl{

    var meta = node._meta;
    meta.resetPrimitiveValuesMeta();
    var highLevelNode = node.highLevel();
    highLevelNode.definition().allProperties().forEach(p=>{

        var name = p.nameId();
        var attrs = highLevelNode.attributes(name);
        var gotValue = false;
        var optional = false;
        attrs.forEach(a=>{
            gotValue = gotValue || a.value() != null;
            optional = optional || a.optional();
        });
        if (!gotValue) {
            var calculator = node.getDefaultsCalculator();
            var defVal = calculator.attributeDefaultIfEnabled(highLevelNode, p);
            if(defVal!=null){
                var insertionKind = calculator.insertionKind(highLevelNode,p);
                if(insertionKind == defaultCalculator.InsertionKind.CALCULATED) {
                    meta.registerCalculatedValue(name);
                }
                else if(insertionKind == defaultCalculator.InsertionKind.BY_DEFAULT){
                    meta.registerInsertedAsDefaultValue(name);
                }
            }
        }
    });
    return meta;
}

export function attributesToValues(attrs:hl.IAttribute[], constr?:(attr:hl.IAttribute)=>any):any[]{

    if(constr){
        return attrs.map(x=>constr(x));
    }
    else{
        return attrs.map(x=>x.value());
    }
}
