/// <reference path="../../../typings/main.d.ts" />
import def=require("raml-definition-system")
import _=require("underscore")
import fs=require("fs")
import marked = require('marked');
import services=def

export function def2Doc(t:def.NodeClass,refPrefix:string=''):string{
    //result.push("<input type='checkbox' />Hello</input>")

    return head() + hide() +
        //generateAdjust("inherited","Show inherited properties") +
        //generateAdjust("issue","Show issues") +
        //generateAdjust("clarify","Show things to clarify") +
        "<h1 id='-a-name-appendix'><a name='Index'>Index of used types</a></h1>" +
        genIndex(t,{},refPrefix).map(x=>'<li>'+x+'</li>').join("\n") +
        genRelatedTypesHierarchy(t,refPrefix).join("\n") +
        "<h1 id='-a-name-appendix'><a name='TypeTables'>Type tables</a></h1><hr/>" +
        genDoc(t,{},refPrefix).join("\n");
}
function head(){
    return `<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>IUniverseDescriptor | RAML JS Parser 2</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="./assets/css/main.css">
    <script src="./assets/js/modernizr.js"></script>
    <style>
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 10px;
        }
    </style>
</head>
`;
}

export function hide(){
    return `<script>
    function hide(className,visible){
        var visibleString=visible?"visible":"none";
        var els=document.getElementsByClassName(className)
        for (var i=0;i<els.length;i++){
            els.item(i).setAttribute('style','display:'+visibleString)
        }

    }</script>
    `
}

export function generateAdjust(className:string,label:string){
    return `
    <input type='checkbox' checked="checked" onchange="hide('${className}',arguments[0].srcElement.checked)">${label}</input>
    `
}

var shouldSkip = {
    StringType:"string",
    BooleanType:"boolean",
    NumberType:"number",
    ValueType:"Value"
}

function genIndex(t:def.IType,covered:{ [name:string]:boolean},refPrefix:string=''){
    var result:string[]=[];
    if (t===undefined){
        return result;
    }
    covered[t.nameId()]=true;
    t.allProperties().forEach(x=>{
        var r= x.range();
        if (shouldSkip[r.nameId()]){
            return;
        }
        if (!covered[r.nameId()]){
            covered[r.nameId()]=true;
            if (!r.hasValueTypeInHierarchy()){

                result=result.concat(genIndex(<def.NodeClass>r,covered,refPrefix));
            }
            else{
                if (r.hasValueTypeInHierarchy()){
                    result=result.concat(genIndex(<def.ValueType>r,covered,refPrefix));
                }
            }
        }
    })
    //result.push("<li>")
    result.push(genRef(t,refPrefix));
    //result.push("</li>")
    t.allSubTypes().forEach(r=>{
        if (!covered[r.nameId()]){
            if (!r.hasValueTypeInHierarchy()){
                covered[r.nameId()]=true;

                result=result.concat(genIndex(<def.NodeClass>r,covered,refPrefix));
            }
        }
    })
   return result.sort();
}


/**
 * Functional wrapper on top of gatherTypes
 */
function gatherTypes2(root:def.IType): def.IType[] {
    var dict: { [name:string]:def.IType} = {};
    var types: def.IType[] = [];
    gatherTypes( root, dict );
    Object.keys( dict ).forEach( k => types.push( dict[k] ) );
    return types;
}


function gatherTypes(t:def.IType,covered:{ [name:string]:def.IType}):void{
    if (!t){
        return;
    }
    covered[t.nameId()]=t;
    t.allProperties().forEach(x=>{
        var r= x.range();

        if (!covered[r.nameId()]){
            covered[r.nameId()]=<def.IType>r;
            if (!r.hasValueTypeInHierarchy()){
                gatherTypes(<def.NodeClass>r,covered);
            }
            else{
                if (r.hasValueTypeInHierarchy()){
                    gatherTypes(<def.ValueType>r,covered);
                }
            }
        }
    })
    t.allSubTypes().forEach(r=>{
        if (!covered[r.nameId()]){
            if (!r.hasValueTypeInHierarchy()){
                covered[r.nameId()]=<def.IType>r;
                gatherTypes(<def.NodeClass>r,covered);
            }
        }
    })
    t.superTypes().forEach(r=>{
        if (!covered[r.nameId()]){
            covered[r.nameId()]=<def.IType>r;
            gatherTypes(<def.NodeClass>r,covered);

        }
    })
}

function genRelatedTypesHierarchy(t:def.IType,refPrefix:string=''):string[]{
    var allTypes:{ [name:string]:def.IType}={}
    var rs:string[]=[];
    rs.push("<h1 id='-a-name-appendix'><a name='TypeHierarchy'>Complete Type hierarchy</a></h1>");
    gatherTypes(t,allTypes);
    rs.push('<ul>');
    Object.keys(allTypes).forEach(x=>{
        var tp=allTypes[x];
        if (tp.superTypes().length==0){
            rs.push(`<li>${genRef(tp,refPrefix)+genListChildren(tp,0,refPrefix)}</li>`);
        }
    })
    rs.push('</ul>');
    return rs;
}

function genListChildren(t:def.IType,level:number,refPrefix:string=''):string{
    var rs="<ul>";
    t.subTypes().forEach(x=>{

        rs+="<li>"+genRef(<def.IType>x,refPrefix);
        rs+=genListChildren(<def.IType>x,level+1,refPrefix);
        rs+="</li>"
    })
    rs+="</ul>"
    return rs;
}
export function genDoc(t:def.NodeClass,covered:{ [name:string]:boolean},refPrefix:string=''){
    var result:string[]=[];
    if (!t){
        return result;
    }
    covered[t.nameId()]=true;
    t.allProperties().filter(x=>!x.getAdapter(services.RAMLPropertyDocumentationService).isHidden()).forEach(x=>{
       var r= x.range();
        if (shouldSkip[r.nameId()]){
            return;
        }
        if (!covered[r.nameId()]){
            covered[r.nameId()]=true;
            if (!r.hasValueTypeInHierarchy()&&!r.hasUnionInHierarchy()){

                result=result.concat(genDoc(<def.NodeClass>r,covered,refPrefix));
            }
            else{
                if (r.hasValueTypeInHierarchy()){
                    result=result.concat(generateValueTypeDocumentation(<def.ValueType>r,refPrefix));
                }
            }
        }
    })
    result.push(table(new ClassDataProvider2(t),true,refPrefix));
    t.allSubTypes().forEach(r=>{
        if (!covered[r.nameId()]){
            if (!r.hasValueTypeInHierarchy()){
                covered[r.nameId()]=true;
                result=result.concat(genDoc(<def.NodeClass>r,covered,refPrefix));
            }
        }
    })

    return result;
}
export function genClassTable(t:def.NodeClass,includeSuperTypes:boolean, refPrefix:string=''){
    return table(new ClassDataProvider2(t,includeSuperTypes), refPrefix.indexOf('ref')>=0,refPrefix)
}

export interface IColumn<T>{
    title():string
    value(c:T,refPrefix:string):any;
    extraStyles(c:T):string;
    widthAsPercent():number
}
export interface IRow<T>{
    value():T
    getClassName():string
    getColumnValue(c:IColumn<T>,refPrefix:string):any // delegates to IColumn::value()
    extraStyles(c:IColumn<T>):any
}
export interface ITableDataProvider<T>{

   getColumns():IColumn<T>[];
   getRows():IRow<T>[];
   title():string
   about(refPrefix:string):string
}
export class PropertyProvider implements IRow<def.Property>{

    constructor(private _clazz:def.NodeClass, private _property:def.Property){

    }
    value(){
        return this._property
    }

    getColumnValue(c:IColumn<def.Property>,refPrefix:string=''){
        return c.value(this._property,refPrefix);
    }

    getClassName():string{
        return this._clazz==this._property.domain()?"owned":"inherited"
    }


    extraStyles(c:IColumn<def.Property>):string {
        return c.extraStyles(this._property);
    }
}
export class NameColumn implements IColumn<def.Property>{


    extraStyles(c:def.Property):string {
        return "";
    }

    title():string {
        return "Property";
    }

    value(c:def.Property):any {
        //let docTableName = c.getAdapter(services.RAMLPropertyDocumentationService).docTableName();
        //let name = (docTableName ? docTableName : c.nameId());
        let name = c.nameId();
        return "<strong>" + name + "</strong>" +(c.isRequired()?"":"?")+(c.isKey()?"<em> (key) </em>":"");
    }

    widthAsPercent = ()=>25
}
export class DescriptionColumn implements IColumn<def.Property>{

    extraStyles(c:def.Property):string {
        return "";
    }

    title():string {
        return "Description";
    }

    value(c:def.Property):any {
        return c.description();
    }
    widthAsPercent = ()=>45
}

export class MarkdownDescriptionColumn extends DescriptionColumn{

    extraStyles(c:def.Property):string {
        return "";
    }

    value(c:def.Property):any {
        var mdd = c.getAdapter(services.RAMLPropertyDocumentationService).markdownDescription();
        if(mdd){
            return mdd;
        }
        return super.value(c);
    }
}

export class RangeColumn implements IColumn<def.Property>{

    extraStyles(c:def.Property):string {
        return c.isValueProperty()?"background-color:lightgray;":"background-color:yellow";
    }

    title():string {
        return "Range and Notes";
    }

    widthAsPercent = ()=>30

    value(c:def.Property,refPrefix=''):any {

        var ver = '1.0';
        if(refPrefix&&refPrefix.length>0 && refPrefix.indexOf('08')>=0){
            ver = '0.8';
        }
        if(refPrefix) {
            refPrefix = `/references/${ver}/#raml-${ver.replace('.', '')}-ref-`;
        }

        //var rs=`<a href='${refPrefix}${c.range().name()}' >${c.range().name()}</a>`+(c.isMultiValue()?"[]":"");

        var rs = "";
        var documentationService = c.getAdapter(services.RAMLPropertyDocumentationService);
        if (!documentationService.valueDescription() || documentationService.valueDescription().trim().length == 0) {
            rs = c.range().nameId()+(c.isMultiValue()?"[]":"");
        }
        //if (shouldSkip[c.range().name()]){
        //    rs=shouldSkip[c.range().name()]+(c.isMultiValue()?"[]":"");
        //}

        if (c.enumOptions()&&c.nameId()!='allowedTargets'){
            rs+="<br>one of: "+c.enumOptions().join(", ")
            if (c.domain().getAdapter(services.RAMLService).getRuntimeExtenders().length>0){
                rs+="<p>(this enum is open and allows extension by dynamically contributed types declared by ";
                c.domain().getAdapter(services.RAMLService).getRuntimeExtenders().forEach(x=>{rs+=genRef(x)})
                rs+=")</p>"
            }
        }
        if (c.domain().getAdapter(services.RAMLService).getRuntimeExtenders().length!=0&&c.isDescriminator()){
            rs+=" also allows runtime value extensions from "+c.domain().getAdapter(services.RAMLService).getRuntimeExtenders()[0].nameId();
        }
        if (c.defaultValue()){
            rs+='<p><em>Default value:'+c.defaultValue()+"</em></p>"
        }
        if (c.getAdapter(services.RAMLPropertyParserService).isSystem()){
            rs+="<small>(System value )</small>"
        }
        if (c.inheritedContextValue()){
            rs+="<p><small>can inherit value from context property:"+c.inheritedContextValue()+"</p></small>";

        }
        if (c.getCanBeDuplicator()){
            //TODO NEED BETTER DESC
            rs+="<p><small>this property may be repeated multiple times, and it will cause duplication of parent node with extra attributes " +
            "inherited or overriden from this mapping children(only used for multiple parameter types)</small></p>";

        }
        if (c.isDescriminator()){
            rs+="<b>Descriminating Property</b>";
        }
        if (c.getContextRequirements().length>0) {
            rs+='<h3>Context requirements:</h3>'
            c.getContextRequirements().forEach(x=> {
                rs += "<p class='req'><span >" + x.name + "=" + x.value + "</span></p>"
            })
        }

        return rs;
    }
}
export class ValueTypeColumn extends RangeColumn{

    extraStyles(c:def.Property):string {
        return "";//c.isValueProperty()?"background-color:lightgray;":"background-color:yellow";
    }

    title():string {
        return "Value type";
    }

    value(c:def.Property,refPrefix=''):any {
        var vd = c.getAdapter(services.RAMLPropertyDocumentationService).valueDescription();
        if(vd!=null){
            var sv = super.value(c,refPrefix);
            if(sv.indexOf('href')>=0){
                vd += '<br>' + sv;
            }
            return vd;
        }
        return super.value(c,refPrefix);
    }
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

export class ClassDataProvider implements ITableDataProvider<def.Property>{

    constructor(private _node:def.NodeClass,private _includeSuper=true){
        if (!this._node){
            console.log("error")
        }
    }

    title() {
        return this._node ? this._node.nameId() : 'unknown type';
    }
    about(refPrefix:string=''){
        if(!this._node) {
            return "<p>Can not process unknown type.</p>";
        }

        var rs="";
        if (this._node.superTypes().length>0){
            this._node.valueRequirements().forEach(y=>{
                rs+="requires "+y.name+'='+y.value;
            })
            this._node.superTypes().forEach(x=>{

                rs+=" extends "+genRef(<def.IType>x,refPrefix);
            })
        }
        if (this._node.getAdapter(services.RAMLService).getAllowAny()){
            rs+="<h3>This node allows any children</h3>";
        }
        if (this._node.getAdapter(services.RAMLService).isGlobalDeclaration()){
            rs+="Globally declarates referencable instance of "
            if (this._node.getAdapter(services.RAMLService).getActuallyExports()&&this._node.getAdapter(services.RAMLService).getActuallyExports()!="$self"){

                var tp=this._node.property(this._node.getAdapter(services.RAMLService).getActuallyExports()).range();
                rs+=genRef(tp,refPrefix)
            }
            else{
                rs+=genRef(this._node,refPrefix);
            }
            rs+=""
        }
        var arr:string[]=[];
        appendMethodDocs(this._node,arr);
        rs+=arr.join("\n")
        if (this._node.getAdapter(services.RAMLService).getContextRequirements().length>0) {
            rs+='<h3>Context requirements:</h3>'
            this._node.getAdapter(services.RAMLService).getContextRequirements().forEach(x=> {
                rs+="<li>"+x.name+"="+x.value+"</li>";
            })

        }

        rs+="<p>Description:"
        if (!this._node.description()){
            rs+= "Not described yet"
        }
        rs+=this._node.description();
        rs+="</p>"
        return rs;
    }

    getColumns():IColumn<def.Property>[]{
        return [new NameColumn(),new RangeColumn(),new DescriptionColumn()];
    }
    getRows(){
        if(!this._node) {
            return[];
        }
        if (this._includeSuper) {
            return this._node.allProperties().filter(x=>!x.getAdapter(services.RAMLPropertyDocumentationService).isHidden()
                && !(<def.Property>x).isKey()).map(x=>new PropertyProvider(this._node, x));
        }
        return this._node.properties().filter(x=>!x.getAdapter(services.RAMLPropertyDocumentationService).isHidden()
                && !(<def.Property>x).isKey()).map(x=>new PropertyProvider(this._node,<def.Property> x));

    }
}

export class ClassDataProvider2 extends ClassDataProvider{

    getColumns():IColumn<def.Property>[]{
        return [new NameColumn(),new MarkdownDescriptionColumn(),new ValueTypeColumn()];
    }
}
function genRef(x:def.IType, refPrefix:string=''){
return "<a href='#"+refPrefix+x.nameId()+"'>"+x.nameId()+"</a>";
}
var appendMethodDocs = function (v:def.AbstractType, result:string[]) {
    //if (v.methods().length > 0) {
    //    result.push("<h3>Exports methods:</h3>")
    //    v.methods().forEach(x=> {
    //        result.push("<h4>" + x.name + "</h4>" + "<code>" + x.text + "</code>");
    //    })
    //}
};
export function generateValueTypeDocumentation(v:def.ValueType,refPrefix:string=''):string{

    var result:string[]= [
        `<h2 class="a" id="${refPrefix}${v.nameId()}">${v.nameId()}</h2>`,
        marked( v.description() ),
        "<table>"
    ];
    appendMethodDocs(v, result);
    if (def.EnumType.isInstance(v)){
        var et=<def.EnumType>v;
        result.push("Enum values:")
        result.push("<ul>")
        et.values.forEach(x=>result.push("<li>"+x+"</li>"))
        result.push("</ul>")
    }
    if (def.ReferenceType.isInstance(v)){
        var refType=<def.ReferenceType>v;
        result.push("Instantiation of "+genRef(refType.getReferencedType()));

    }

    return result.join("\n");
}
export function table(d:ITableDataProvider<any>,isInRefSection:boolean=false,refPrefix:string=''):string{
    var result:string[]= [];
    if(isInRefSection){
        result.push(`<h2 class="a"><a name='${refPrefix}${d.title()}'>${d.title()}</a></h2>`);
        result.push(d.about(refPrefix));
    }
    result.push("<table>");
    result.push("<tr>")
    d.getColumns().forEach(x=>{result.push(
        `<th width="${x.widthAsPercent()}%">${x.title()}</th>`)});
    result.push("</tr>")
    d.getRows().forEach(x=>{
        result.push(`<tr class="${x.getClassName()}">`)
        d.getColumns().forEach(y=>{
            result.push(`<td>`)
            result.push(x.getColumnValue(y,refPrefix));
            result.push("</td>")
        })
        result.push("<tr>");
    })
    result.push("</table>")
    return result.join("\n")
}

