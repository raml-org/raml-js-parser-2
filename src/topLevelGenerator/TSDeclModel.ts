/// <reference path="../../typings/main.d.ts" />
import tsutil   = require("./tsutil");
import Opt=require("../Opt");

import _ = require("underscore");
import assert = require("assert")

export interface NameFilter{
    (schemaName:string):boolean
}
export interface IConfig{

    /**
     * if set to true it will be possible to pass numbers to string parameters
     * @type {boolean}
     */
    numberIsString:boolean
    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
    createTypesForResources:boolean


    /**
     * If this option is set to true query parameters will be placed as second argument when method has body
     */
    queryParametersSecond:boolean


    /**
     * If this option is set to true .get() will be collapsed to ()
     */
    collapseGet:boolean

    /**
     * If this option is set to true method references will be collapsed if it is only method in the resource
     * foo.get() => foo()
     */
    collapseOneMethod:boolean

    /**
     * If this option is set to true media type parameters will be removed from declarations
     */
    collapseMediaTypes:boolean

    /**
     * For example, let resource 'somerRes' have GET, POST and PUT methods.
     * If 'false', generates get(), post() and put() for 'someResource'
     * If 'true', generates getSomeRes(), postSomeRes() and putSomeRes() for
     * parent of 'someRes'. If 'someRes' does not itself has child resources, it is not generated.
     * @type {boolean}
     */
    methodNamesAsPrefixes:boolean

    /**
     * If this option is set to 'true', the executor combines request and response into a HAR entry
     * and places it into the '__$harEntry__' field of ramlscript response.
     */
    storeHarEntry:boolean

    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
    createTypesForParameters
    /**
     * It true geneartor will try to reuse parameter types when possible
     * and redeclare using type =
     */
    reuseTypeForParameters:boolean

    /**
     * If true will not reuse structural types for schemas
     */
    createTypesForSchemaElements:boolean

    /* It true geneartor will try to reuse parameter types when possible
     * and redeclare using type =
     */
    reuseTypesForSchemaElements:boolean

    /**
     * If 'true', exception is thrown for statuses > 399
     */
    throwExceptionOnIncorrectStatus:boolean

    /**
     * generate asynchronous client
     **/
        async:boolean

    debugOptions:{
        generateImplementation:boolean;
        generateSchemas:boolean;
        generateInterface:boolean;
        schemaNameFilter:NameFilter
    }

    /**
     * Whether to overwrite the 'node_modules' folder for the generated notebook.
     * If the folder is known to be consistent, the option may be set to 'false'
     * in order to save time.
     */
    overwriteModules:boolean
}

export var MODEL_CLASS_MODEL_ELEMENT = '$resource-model-element';

export var MODEL_CLASS_TYPE_DECLARATION = '$type-declaration';

export var MODEL_CLASS_INTERFACE = '$interface-declaration';

export var MODEL_CLASS_CLASS_DECLARATION = '$class-declaration';

export var MODEL_CLASS_ANNOTATION_DECLARATION = '$annotation-declaration';

export var MODEL_CLASS_ENUM_DECLARATION = '$enum-declaration';

export var MODEL_CLASS_TYPE_ASSERTION = '$type-assertion';

export var MODEL_CLASS_API_MODULE = '$api-module';

export var MODEL_CLASS_UNIVERSE = '$universe';

export var MODEL_CLASS_MEMBER = '$member';

export var MODEL_CLASS_UNION_TYPE_REFERENCE = '$union-type-reference';

export var MODEL_CLASS_SIMPLE_TYPE_REFERENCE = '$simple-type-reference';

export var MODEL_CLASS_FUNCTION_REFERENCE = '$function-reference';

export var MODEL_CLASS_ARRAY_REFERENCE = '$array-reference';

export var MODEL_CLASS_DECLARED_INTERFACE_REFERENCE = '$declared-interface-reference';

export var MODEL_CLASS_ANY_TYPE_REFERENCE = '$any-type-reference';

export var MODEL_CLASS_STRUCTURAL_TYPE_REFERENCE = '$structural-type-reference';

export var MODEL_CLASS_PARAM = '$param';

export var MODEL_CLASS_STRING_VALUE = '$string-value';

export var MODEL_CLASS_ARRAY_VALUE = '$array-value';

export var MODEL_CLASS_API_ELEMENT_DECLARATION = '$api-element-declaration';

export var MODEL_CLASS_CONSTRUCTOR = '$constructor';

export interface TSModelVisitor {
    startTypeDeclaration(decl:TSTypeDeclaration):boolean;
    endTypeDeclaration(decl:TSTypeDeclaration):void;
    betweenElements():void;
    startVisitElement(decl:TSAPIElementDeclaration):boolean;
    endVisitElement(decl:TSAPIElementDeclaration):void;
}

export interface Serializer{

    serialize(model:TSModelElement<any>, forImplementation?:boolean):string

}

export interface IModelElement{

    modelClass():string;
}

//TODO HIDE Fields from unmanagable modification
//TODO Refine type decl type ref hieararchy a bit more
//TODO add classes, generics, metadata
export class TSModelElement<T extends TSModelElement<any>> implements IModelElement {

    protected _parent:TSModelElement<any>;
    private _children:T[]
    protected _config:IConfig

    _comment:string;

    meta:{[key:string]:any} = {}

    private _annotations:IAnnotationReference[] = []

    annotations():IAnnotationReference[]{
        return this._annotations;
    }

    patchParent(parent:TSModelElement<any>){
        this._parent=parent;//FIXME
    }

    isEmpty():boolean {
        return this._children.length == 0;
    }
    parent():TSModelElement<any>{return this._parent}

    children():T[] {
        return this._children;
    }

    comment():string{ return this._comment; }

    root():TSAPIModule{
        if (this._parent==Universe){
            return <TSAPIModule>(<any>this);
        }
        return this._parent.root();
    }

    constructor(parent:TSModelElement<any> = Universe,config?:IConfig) {
        this.setParent(parent);

        if (config) this._config = config;

        this._children = [];
    }

    protected setParent(parent:TSModelElement<any>) {
        if (!parent) return;
        this._parent = parent;
        this._config = parent._config;
        this._parent.addChild(this);
    }

    removeChild(child:T){
        if (child.parent()==this){
            this._children=this._children.filter(x=>x!=child);
        }
        child.patchParent(Universe);
    }

    addChild(child:T){
        if(child.parent()){
            child.parent().removeChild(child);
        }
        child.patchParent(this);
        this._children.push(child);
    }

    serializeToString():string {
        throw new Error("You should override serialize to string always");
    }

    modelClass():string{
        return MODEL_CLASS_MODEL_ELEMENT; }
}
//TODO It should become an interface
export class TSTypeDeclaration extends TSModelElement<TSAPIElementDeclaration> {

    canBeOmmited = () => this.locked ? false : this.children().every( x => x.optional )

    locked:boolean=false;

    extras:string[]=[""];

    addCode(code:string):void{
        this.extras.push(code)
    }

    toReference():TSTypeReference<any>{throw new Error("Implement in subclasses");}

    hash(){ return this.serializeToString(); }

    isFunctor() {
        return this.children().some(x=>x.isAnonymousFunction())
    }

    constructor(parent:TSModelElement<any> = null){
        super(parent);
    }

    getFunctor() {
        return _.find( this.children(), x => x.isAnonymousFunction() )
    }

    visit(v:TSModelVisitor) {
        if (v.startTypeDeclaration(this)) {
            this.children().forEach((x, i, arr) => {
                x.visit(v)
                if (i != arr.length - 1) v.betweenElements();
            })
            v.endTypeDeclaration(this);
        }
    }

    modelClass():string{
        return MODEL_CLASS_TYPE_DECLARATION; }
}

export class TSInterface extends TSTypeDeclaration {


    name:string
    extends:TSTypeReference<any>[]=[];
    implements:TSTypeReference<any>[]=[];
    typeParameters:string[];

    typeSignature():string{
        var modelName = this.name;
        if(this.typeParameters && this.typeParameters.length > 0){
            modelName += "<"+this.typeParameters.join(',')+">";
        }
        return modelName;
    }

    hash(){ return this.children().filter(x=>!x.isPrivate).map( x =>  "\n" + x.serializeToString() + "\n" ).join('') }

    toReference():TSTypeReference<any>{return new TSDeclaredInterfaceReference(Universe,this.name,this)}


    constructor(p:TSModelElement<any>, name:string) {
        super(p)
        this.name = name;
    }
    decl(){
        return "interface"
    }

    serializeToString() {
        var body = this.hash();
        return this.insertComment() + "export "+this.decl() +" "+ this.name.concat(this.extendsString()+this.implementsString())+
            "{" +this.extras.join("\n")+ body + "}\n"
    }

    private  extendsString():string{
        if(this.extends.length>0){
            return " extends "+this.extends.map(x=>x.serializeToString()).join(",")
        }
        return "";
    }

    private  implementsString():string{
        if(this.implements.length>0){
            return " implements "+this.implements.map(x=>x.serializeToString()).join(",")
        }
        return "";
    }

    insertComment():string{
        if(!this._comment){
            return '';
        }
        return formattedComment(this._comment,0);
    }

    modelClass():string{
        return MODEL_CLASS_INTERFACE; }

}
//TODO INCORRECT INHERITANCE CHAIN
export class TSClassDecl extends TSInterface{

    decl(){
        return "class"
    }

    modelClass():string{
        return MODEL_CLASS_CLASS_DECLARATION; }

}

export class TSAnnotationDecl extends TSInterface{

    decl(){
        return "annotation"
    }

    modelClass():string{
        return MODEL_CLASS_ANNOTATION_DECLARATION; }

    toReference():TSTypeReference<any>{return new TSDeclaredAnnotationReference(Universe,this.name,this)}

}

export class TSEnumDecl extends TSInterface{

    decl(){
        return "enum"
    }

    enumConstants:string[]

    modelClass():string{
        return MODEL_CLASS_ENUM_DECLARATION;
    }

}


export class TSTypeAssertion extends TSTypeDeclaration{

    toReference():TSTypeReference<any>{return new TSSimpleTypeReference(Universe,this._name)}

    constructor(p:TSModelElement<any>, private _name:string,private _ref:TSTypeReference<any>) {
        super(p);
    }

    serializeToString() {
        return "export type " + this._name + "=" + this._ref.serializeToString()+"\n";
    }

    ref():TSTypeReference<any>{ return this._ref; }

    name():string{ return this._name; }

    modelClass():string{
        return MODEL_CLASS_TYPE_ASSERTION; }
}

export class TSUniverse extends TSModelElement<any>{

    constructor() {
        // super(this);
        //commented this call out as the new version of TS compiler does not eat this. For a reason.

        //so now first calling super with a fake parent
        super(new TSModelElement<any>());

        //and now setting a real parent as self
        //(not sure why we do this originally, I would put null here, creating a cycle doesnt look good)
        this.setParent(this);
    }

    addChild(child:any){
    }

    setConfig(cfg:IConfig){ this._config = cfg; }

    getConfig():IConfig{ return this._config; }

    modelClass():string{
        return MODEL_CLASS_UNIVERSE; }
}
export var Universe=new TSUniverse();

export class TSAPIModule extends TSModelElement<TSInterface>{

    serializer:Serializer

    getInterface(nm:string):Opt<TSInterface>{
        return new Opt(_.find(this.children(),x=>x.name==nm));
    }

    serializeToString():string {

        var typeMap:{[key:string]:TSInterface} = {};
        this.children().forEach(x=>typeMap[x.name]=x);

        var covered:{[key:string]:boolean} = {};
        var sorted:TSInterface[] = []
        var append = function(t:TSInterface){
            if(covered[t.name]){
                return;
            }
            covered[t.name] = true;
            var refs:TSTypeReference<any>[] = t.extends;
            refs.forEach(ref=> {
                    if (ref instanceof TSSimpleTypeReference) {
                        var name = (<TSSimpleTypeReference>ref).name;
                        var st = typeMap[name];
                        if (st) {
                            append(st);
                        }
                    }
                }
            );
            sorted.push(t);
        }
        this.children().forEach(x=>append(x));
        return sorted.map(x=>x.serializeToString()).join("\n")
    }

    modelClass():string{
        return MODEL_CLASS_API_MODULE; }
}


export interface NoChildren extends TSModelElement<NoChildren> {
}

export class TSMember<T extends TSModelElement<any>> extends TSModelElement<T> {
    optional:boolean;

    modelClass():string{
        return MODEL_CLASS_MEMBER; }
}

export interface TSTypeReference<T extends TSModelElement<any>> extends TSModelElement<T> {

    array():boolean
    locked:boolean;

    canBeOmmited():boolean;


    isFunctor():boolean;

    getFunctor():TSAPIElementDeclaration;

    union(q:TSTypeReference<any>):TSTypeReference<any>
}


export class TSUnionTypeReference extends TSModelElement<TSTypeReference<any>> implements TSTypeReference<TSTypeReference<any>>{

    array = ():boolean => false;
    locked:boolean;
    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    //TODO FIXIT FIX IT WITH MIX IN
    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var map = {}
        this.children().filter(x=>x instanceof TSSimpleTypeReference)
            .forEach(x=>map[(<TSSimpleTypeReference>x).name] = true);

        var gotNew = false;
        var flat = flattenUnionType(q);
        flat.forEach(x=>{
            if(x instanceof TSSimpleTypeReference) {
                gotNew = gotNew || !map[(<TSSimpleTypeReference>q).name];
            }
            else{
                gotNew = true;
            }
        })
        if(!gotNew){
            return this;
        }
        var r=new TSUnionTypeReference();
        this.children().forEach(x=>r.addChild(x));
        flat.forEach(x=>r.addChild(x));
        return r;
    }



    isFunctor():boolean{
        return false;
    }

    canBeOmmited():boolean{
        return false;
    }

    serializeToString():string {
        return this.children().map(x=>x.serializeToString()).join(" | ");
    }

    removeChild(child:TSTypeReference<any>){}

    addChild(child:TSTypeReference<any>){
        this.children().push(child);
    }

    modelClass():string{
        return MODEL_CLASS_UNION_TYPE_REFERENCE; }
}

export class TSSimpleTypeReference extends TSModelElement<NoChildren> implements TSTypeReference<NoChildren> {

    locked:boolean;

    typeParameters:TSTypeReference<any>[]

    isEmpty():boolean {
        return false;
    }


    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    isFunctor():boolean {
        return false;
    }
    array = ():boolean => false;

    constructor(p:TSModelElement<any>, tn:string) {
        super(p);
        this.name = tn;
    }

    union(q:TSTypeReference<any>):TSTypeReference<any>{

        var flat = flattenUnionType(q);
        var gotThis = false;
        flat.filter(x=>x instanceof TSSimpleTypeReference).map(x=><TSSimpleTypeReference>x)
            .forEach(x=>gotThis = gotThis || (x.name == this.name));

        if(gotThis){
            return q;
        }
        var r=new TSUnionTypeReference();
        r.addChild(this);
        flat.forEach(x=>r.addChild(x));
        return r;
    }

    name:string

    genericStr = ():string => this.typeParameters && this.typeParameters.length > 0
        ?'<' + this.typeParameters.map( p => p.serializeToString() ).join(',') + '>'
        : '';

    serializeToString() {
        return this.name + this.genericStr();
    }

    modelClass():string{
        return MODEL_CLASS_SIMPLE_TYPE_REFERENCE; }
}
export class TSFunctionReference extends TSModelElement<NoChildren> implements TSTypeReference<NoChildren> {

    locked:boolean;

    rangeType:TSTypeReference<any>=new AnyType();

    parameters:Param[] = [];

    isEmpty():boolean {
        return false;
    }

    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    isFunctor():boolean {
        return true;
    }
    array = ():boolean => false;

    constructor(p:TSModelElement<any>) {
        super(p);
    }

    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    serializeToString() {
        return this.paramStr() + '=>' + this.rangeType.serializeToString();
    }

    paramStr = (appendDefault:boolean=false):string => '(' + this.parameters
        .filter(x=>!x.isEmpty())
        .map( p => p.serializeToString(appendDefault) )
        .join(', ') + ')'

    modelClass():string{
        return MODEL_CLASS_FUNCTION_REFERENCE; }
}


export class TSArrayReference extends TSModelElement<NoChildren> implements TSTypeReference<NoChildren> {

    locked:boolean;

    componentType:TSTypeReference<any>;

    isEmpty():boolean {
        return this.componentType ? true : false;
    }

    getFunctor():TSAPIElementDeclaration {
        return this.componentType.getFunctor();
    }

    canBeOmmited():boolean {
        return false;
    }

    isFunctor():boolean {
        return this.componentType.isFunctor();
    }
    array = ():boolean => true;

    constructor(componentType:TSTypeReference<any>=new AnyType()) {
        super(Universe);
        this.componentType = componentType;
    }

    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    serializeToString() {
        return this.componentType.serializeToString() + '[]';
    }

    modelClass():string{
        return MODEL_CLASS_ARRAY_REFERENCE; }
}

export interface IAnnotationReference{

    name:string

    values:{[key:string]:Value}

    value(key:string):Value
}


export class TSDeclaredInterfaceReference extends TSSimpleTypeReference{

    isEmpty():boolean {
        return false;
    }



    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    constructor(p:TSModelElement<any>, tn:string,private _data:TSInterface) {
        super(p, tn);
    }

    getOriginal(){
        return this._data;
    }

    modelClass():string{
        return MODEL_CLASS_DECLARED_INTERFACE_REFERENCE; }
}

export class TSAnnotationReference extends TSSimpleTypeReference implements IAnnotationReference{

    constructor(p:TSModelElement<any>, tn:string, values:{[key:string]:Value} = {}) {
        super(p,tn);
        this.values = values;
    }

    values:{[key:string]:Value}

    value(key:string='value'):Value{ return this.values[key] }
}

export class TSDeclaredAnnotationReference extends TSDeclaredInterfaceReference implements IAnnotationReference{

    values:{[key:string]:Value} = {}

    value(key:string='value'):Value{ return this.values[key] }
}

export class AnyType extends TSSimpleTypeReference{

    constructor(nm:string="any") {
        super(Universe, nm);
    }
    union(q:TSTypeReference<any>):TSTypeReference<any>{
        return q;
    }

    modelClass():string{
        return MODEL_CLASS_ANY_TYPE_REFERENCE; }
}

export class TSStructuralTypeReference extends TSTypeDeclaration implements TSTypeReference<TSAPIElementDeclaration> {
    visitReturnType(v:TSModelVisitor) {
        //v.visitStructuralReturn(this);
        this.visit(v);
    }
    toReference():TSTypeReference<any>{return this}


    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    array = ():boolean => false;


    constructor(parent:TSModelElement<any> = Universe){
        super(parent);
    }

    serializeToString() {
        var body = this.children().map(x=> `\n${x.serializeToString()}\n` ).join('')
        return "{" + body + "}";
    }

    canBeOmmited = () => this.locked ? false : this.children().every( x => x.optional )

    modelClass():string{
        return MODEL_CLASS_STRUCTURAL_TYPE_REFERENCE; }
}

export enum ParamLocation{
    URI, BODY, OPTIONS, OTHER
}

export class Param extends TSModelElement<TSTypeReference<any>> {
    name:string
    ptype:TSTypeReference<any>;
    optional:boolean;
    location:ParamLocation;
    defaultValue:any;

    isEmpty(): boolean {
        return this.ptype.isEmpty()
    }

    constructor(
        p:TSAPIElementDeclaration,
        nm:string,
        location:ParamLocation,
        tp:TSTypeReference<any> = new TSSimpleTypeReference(Universe, "string"),
        defaultValue?:any) {
        super(p);
        this.name = nm;
        this.ptype = tp;
        this.location = location;
        this.defaultValue = defaultValue;
    }

    serializeToString(appendDefault:boolean = false) {
        //return this.name + (this.optional ? "?" : "") + ":" + this.ptype.serializeToString() + (this.ptype.canBeOmmited() ? "?" : "");
        return this.name + (this.optional || (this.defaultValue && !appendDefault) ? "?" : "")
            + (":" + this.ptype.serializeToString() + (this.ptype.canBeOmmited() ? "?" : ""))
            + (appendDefault && this.defaultValue ? '='+JSON.stringify(this.defaultValue) : '');
    }

    modelClass():string{
        return MODEL_CLASS_PARAM; }
}
export interface Value extends TSMember<NoChildren>{

    value():any
}
export class StringValue extends TSMember<NoChildren> implements Value{

    constructor(private _value:string){
        super();
    }

    value():string {
        return this._value;
    }

    serializeToString():string {
        return `"${this._value}"`
    }

    modelClass():string{
        return MODEL_CLASS_STRING_VALUE; }
}

export class ArrayValue extends TSMember<NoChildren> implements Value{

    constructor(private _values:Value[]){
        super();
    }

    value():string {
        return this.serializeToString();
    }

    serializeToString():string {
        return `[ ${this._values.map(x=>x.value()).join(', ')} ]`
    }

    values():Value[] {
        return this._values;
    }

    modelClass():string{
        return MODEL_CLASS_ARRAY_VALUE; }
}


export class TSAPIElementDeclaration extends TSMember<TSTypeReference<any>> {
    name:string;
    rangeType:TSTypeReference<any>=new AnyType();
    parameters:Param[]
    optional:boolean;
    value:Value=null;

    isPrivate:boolean;
    isFunc:boolean;

    _body:string;

    visit(v:TSModelVisitor) {
        if (v.startVisitElement(this)) {
            if (this.rangeType) {
                if (this.rangeType instanceof TSStructuralTypeReference && !this.isInterfaceMethodWithBody()) {
                    (<TSStructuralTypeReference>this.rangeType).visitReturnType(v);
                }
            }
            v.endVisitElement(this);
        }
    }

    constructor(p:TSModelElement<any>, name:string) {
        super(p);
        this.name = name;
        this.parameters = [];
        this.rangeType = null;
        this.optional = false;
    }

    paramStr = (appendDefault:boolean=false):string => '( ' + this.parameters
        .filter(x=>!x.isEmpty())
        .map( p => this.serializeParam(p,appendDefault) )
        .join(',') + ' )'

    protected serializeParam = (p:Param, appendDefault:boolean):string => p.serializeToString(appendDefault)

    isFunction = ():boolean => this.parameters.length != 0||this.isFunc

    isAnonymousFunction = ():boolean => this.isFunction() && this.name === ''

    returnStr = ():string => this.rangeType ?  ':' + this.rangeType.serializeToString() : ''

    commentCode(){

        if(this.comment()){
            return formattedComment(this._comment,2);
        }

        return '';
    }

    serializeToString() {
        var x = (this.isPrivate ? 'private ' : '')
            + this.escapeDot(this.name)
            + (this.optional ? "?" : "")
            + (this.isFunction()? this.paramStr() : "")
            + this.returnStr();

        if (this.value){
            x+='='+this.value.value();
        }
        return this.commentCode() + x + (this.isFunction()&&this.isInterfaceMethodWithBody() ? '' : this.body());
    }
    body(){
        if (this._body==null)return "";
        return "{"+this._body+"}"
    }

    private escapeDot( name:string ): string {
        return tsutil.escapeTypescriptPropertyName( name )
    }

    isInterfaceMethodWithBody():boolean{ return false; }


    modelClass():string{
        return MODEL_CLASS_API_ELEMENT_DECLARATION; }
}

export class TSConstructor extends TSAPIElementDeclaration {
    constructor(p:TSModelElement<any>) {
        super(p,'constructor');
    }

    protected serializeParam = (p:Param, appendDefault:boolean):string => 'protected ' + p.serializeToString(appendDefault)

    modelClass():string{
        return MODEL_CLASS_CONSTRUCTOR; }
}


function flattenUnionType(ref:TSTypeReference<any>):TSTypeReference<any>[]{

    if(!(ref instanceof  TSUnionTypeReference)){
        return [ ref ];
    }

    var map:{[key:string]:TSSimpleTypeReference} = {};
    var arr:TSTypeReference<any>[] = [];
    ref.children().forEach(x=>this.flattenUnionType(<TSUnionTypeReference>x).forEach(y=>{
        if (y instanceof TSSimpleTypeReference) {
            var st = <TSSimpleTypeReference>y;
            var name = st.name;
            map[name] = st;
        }
        else {
            arr.push(y);
        }
    }));
    return arr.concat(_.sortBy(Object.keys(map).map(x=>map[x]),'name'));
}

function formattedComment(str:string,indents:number):string {

    var shift = '';
    for(var i = 0 ; i < indents ; i++){ shift += '    '; }

    return `
${shift}/**
${str.replace(/\*\//g, '* /').replace(/\r\n/g, '\n').split('\n').map(x=>shift + ' * ' + x.trim()).join('\n')}
${shift} **/
`;
}