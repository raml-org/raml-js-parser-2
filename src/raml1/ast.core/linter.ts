
/// <reference path="../../../typings/main.d.ts" />

import jsyaml=require("../jsyaml/jsyaml2lowLevel")
import defs=require("raml-definition-system")
import hl=require("../highLevelAST")
import ll=require("../lowLevelAST")

import _=require("underscore")
import yaml=require("yaml-ast-parser")
import def=require( "raml-definition-system");
import high=require("../highLevelAST");
type Error=yaml.Error
import hlimpl=require("../highLevelImpl")
import su=require("../../util/schemaUtil")
import linterApi=require("./linterApi")
import core=require("../wrapped-ast/parserCore")
import path=require("path")
import fs=require("fs");
import universes=require("../tools/universe")
import universeHelpers=require("../tools/universeHelpers")
import universeProvider=require("../definition-system/universeProvider")
import services=def
import typeBuilder=require("./typeBuilder")
import OverloadingValidator=require("./overloadingValidator")
import OverloadingValidator08=require("./overloadingValidator08")
import expander=require("./expander")
import builder = require('./builder')
import search = require("./search")
import rtypes=def.rt;
import util=require("../../util/textutil")

import contentprovider = require('../../util/contentprovider');

var mediaTypeParser=require("media-typer")

import xmlutil = require('../../util/xmlutil')
import {error} from "util";
import {LowLevelWrapperForTypeSystem} from "../highLevelImpl";
import {find} from "../../util/index";
var changeCase = require('change-case');
var pluralize = require('pluralize');

type ASTNodeImpl=hlimpl.ASTNodeImpl;
type ASTPropImpl=hlimpl.ASTPropImpl;

class LinterSettings{
    validateNotStrictExamples=true;
}
var settings=new LinterSettings();

export interface PropertyValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor);
}

export interface IShema{
    validate(pObje:any,cb:hl.ValidationAcceptor,strict:boolean);
}
var loophole= require("loophole")
function evalInSandbox(code:string,thisArg:any,args:any[]) {
    return new loophole.Function(code).call(thisArg,args);
}

var MAX_RECURSION_LEVEL = 400;

export var RESERVED_TEMPLATE_PARAMETERS = {
    "resourcePathName" : "Part of the resource path following the rightmost \"/\"",
    "methodName" : "Method name",
    "resourcePath": "Path of the resource"
}

var lintWithFile = function (customLinter:string, acceptor:hl.ValidationAcceptor, astNode:hl.IHighLevelNode) {
    if (fs.existsSync(customLinter)) {
        try {
            var content = fs.readFileSync(customLinter).toString();
            var factr = new LinterExtensionsImpl(acceptor);
            evalInSandbox(content, factr, null);
            factr.visit(astNode);
        } catch (e) {
            console.log("Error in custom linter")
            console.log(e);
        }
    }
};
function checkPropertyQuard  (n:hl.IAttribute|hl.IHighLevelNode, v:hl.ValidationAcceptor) {
    var pr = n.property();
    if (pr) {
        (<defs.Property>pr).getContextRequirements().forEach(x=> {
            if (!(<hlimpl.BasicASTNode><any>n).checkContextValue(x.name, x.value,x.value)) {
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT, x.name + " should be " + x.value + " to use property " + pr.nameId(), n))
            }
        });
    }
    return pr;
};

function lintNode(astNode:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) {
    if(typeof fs === "undefined") {
        return;
    }

    if(!fs) {
        return;
    }

    var fsMethods = ['exists', 'readFile', 'writeFile', 'readdir', 'existsSync', 'readFileSync', 'writeFileSync', 'readdirSync'];

    var existingFsFields = Object.keys(fs);

    for(var i = 0; i < fsMethods.length; i++) {
        if(!fs[fsMethods[i]]) {
            return;
        }
    }

    var ps = astNode.lowLevel().unit().absolutePath();
    var dr = path.dirname(ps);
    var customLinter = path.resolve(dr, "raml-lint.js");
    lintWithFile(customLinter, acceptor, astNode);
    var dir=path.resolve(dr,".raml")
    if (fs.existsSync(dir)){
        var st=fs.statSync(dir);
        if (st.isDirectory()){
            var files=fs.readdirSync(dir);
            files.forEach(x=>{
                if (x.indexOf("-lint.js")!=-1){
                    lintWithFile(path.resolve(dir,x),acceptor,astNode);
                }
                //console.log(x);
            })
        }
    }
};
class LinterExtensionsImpl implements linterApi.ErrorFactory<core.BasicNode>,linterApi.Linter{

    constructor(private acceptor:hl.ValidationAcceptor){

    }
    error(w:core.BasicNode,message:string){
        this.acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,message,w.highLevel()));
    }
    errorOnProperty(w:core.BasicNode,property: string,message:string){
        var pr=w.highLevel().attr(property);
        this.acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,message,pr));
    }
    warningOnProperty(w:core.BasicNode,property: string,message:string){
        var pr=w.highLevel().attr(property);
        this.acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,message,pr,true));
    }

    warning(w:core.BasicNode,message:string){
        this.acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,message,w.highLevel(),true));
    }
    nodes:{ [name:string]:linterApi.LinterRule<any>[]}={}

    registerRule(nodeType:string,rule: linterApi.LinterRule<any>){
        var q=this.nodes[nodeType];
        if (!q){
            q=[];
            this.nodes[nodeType]=q;
        }
        q.push(rule);
    }

    visit(h:hl.IHighLevelNode){
        var nd=h.definition();
        this.process(nd,h);
        nd.allSuperTypes().forEach(x=>this.process(x,h));
        h.elements().forEach(y=>this.visit(y));
    }
    process(d:hl.ITypeDefinition,h:hl.IHighLevelNode){
        if (d instanceof def.NodeClass) {
            if (!d.getAdapter(services.RAMLService).getDeclaringNode()) {
                var rules = this.nodes[d.nameId()];
                if (rules) {
                    rules.forEach(x=>x(h.wrapperNode(), this));
                }
            }
        }
    }
}
class StackNode{
    prev:StackNode
    next: StackNode;
    value: any;

    toString(){
        if (this.prev){
            return this.value+"."+this.prev.toString();
        }
        return this.value;
    }

    last(){
        if (this.prev){
            return this.prev.last();
        }
        return this;
    }


}


function isTypeOrSchema(d:hl.IProperty){
    return d.nameId()==universes.Universe10.TypeDeclaration.properties.type.name||d.nameId()==universes.Universe10.TypeDeclaration.properties.schema.name;
}
function isExampleProp(d:hl.IProperty){
    if (!d.domain()){
        return;
    }
    if (d.domain().getAdapter(services.RAMLService).isUserDefined()){
        return false;
    }
    return (d.nameId()==universes.Universe10.TypeDeclaration.properties.example.name)&&( d.domain().key()!=universes.Universe10.DocumentationItem&& d.domain().key()!=universes.Universe08.DocumentationItem);
}
/**
 * For descendants of templates returns template type. Returns null for all other nodes.
 */
function typeOfContainingTemplate(h:hl.IHighLevelNode):string{
    var declRoot=h;
    while (true){
        if (declRoot.definition().getAdapter(services.RAMLService).isInlinedTemplates()){
            return declRoot.definition().nameId();
        }
        var np=declRoot.parent();
        if (!np){
            break;
        }
        else{
            declRoot=np;
        }

    }
    return null;
}

function restrictUnknownNodeError(node:hlimpl.BasicASTNode) {
    var parentNode = node.parent();
    var issue = null;
    var parentDef = parentNode.definition();
    if (parentNode && parentDef instanceof def.UserDefinedClass) {
        var parentProperty = parentNode.property();
        if (universeHelpers.isIsProperty(parentProperty)
            || universeHelpers.isTypeProperty(parentProperty)) {
            var paramName = node.name();
            if (RESERVED_TEMPLATE_PARAMETERS[paramName] != null) {
                //Handling reserved parameter names;
                issue = createIssue(hl.IssueCode.INVALID_PROPERTY, "Invalid parameter name: " + paramName + " is reserved", node);
            }
            else {
                issue = createIssue(hl.IssueCode.UNKNOWN_NODE, "Unused parameter: " + paramName, node);
            }
        }

    }
    if(!issue){
        var propName = node.name();
        var universe08 = universeProvider("RAML08");
        var isRAML08 = parentDef.universe().version()== universe08.version();
        if(isRAML08) {
            var parameterTypeName = universes.Universe08.Parameter.name;
            var typeDeclarationTypeName = universes.Universe10.TypeDeclaration.name;
            if (isRAML08 && parentDef.isAssignableFrom(parameterTypeName)) {
                var possibleDefs:def.IType[]
                    = universe08.type(parameterTypeName).allSubTypes().filter(x=>
                        universes.Universe08[x.nameId()]['properties'][propName] != null);

                var possibleDefsMap = {};
                for(var i = 0 ; i < possibleDefs.length ; i++){
                    var x = possibleDefs[i];
                    if(possibleDefsMap[x.nameId()]){
                        continue;
                    }
                    var valueRequirements = (<def.NodeClass>x).valueRequirements();
                    if(!(valueRequirements && valueRequirements.length!=0)){
                        continue;
                    }
                    var typeRquirements = valueRequirements.filter(x=>x.name=='type').map(x=>x.value);
                    if(typeRquirements.length==0){
                        continue;
                    }
                    var runtimeName = typeRquirements[0];
                    possibleDefsMap[x.nameId()] = runtimeName;
                    x.allSubTypes().forEach(y=>possibleDefs.push(y));
                }
                var runtimeNames = Object.keys(possibleDefsMap).map(x=>possibleDefsMap[x]).sort();;
                if (runtimeNames.length > 0) {
                    var namesStr = runtimeNames.map((x,i)=>{
                        var x1 = `'${x}'`;
                        if(i==runtimeNames.length-1){
                            return x1;
                        }
                        if(i==runtimeNames.length-2){
                            return x1 + ' or ';
                        }
                        return x1 + ', ';

                    }).join('');
                    var message = `Property '${propName}' can only be used if type is ${namesStr}`;
                    issue = createIssue(hl.IssueCode.ILLEGAL_PROPERTY, message, node);
                }
            }
        }
    }

    return issue;
};
export function validateBasic(node:hlimpl.BasicASTNode,v:hl.ValidationAcceptor, requiredOnly: boolean = false){
    var parentNode = node.parent();
    if (node.lowLevel()) {
        if (node.lowLevel().keyKind()==yaml.Kind.MAP){

            v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Node key can not be map", node));

        }
        if (node.lowLevel().keyKind()==yaml.Kind.SEQ){
            if (node.lowLevel().value()==null){
                var isPattern=false;
                if (node.isElement()){
                    if (node.asElement().definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
                        isPattern=true;
                    }
                }
                if (!isPattern) {
                    v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Node key can not be sequence", node));
                }
            }
        }
        if (parentNode==null) {
            node.lowLevel().errors().forEach(x=> {
                var ps= (<any>x).mark?(<any>x).mark.position:0;
                var em = {
                    code: hl.IssueCode.YAML_ERROR,
                    message: x.message,
                    node: null,
                    start: ps,
                    end: ps + 1,
                    isWarning: false,
                    path: node.lowLevel().unit() == node.root().lowLevel().unit() ? null : node.lowLevel().unit().path(),
                    unit: node.lowLevel().unit()
                }
                v.accept(em)
            });
        }
    }

    if (node.errorMessage){
        v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, node.errorMessage, node));
        return;
    }
    if (node.isUnknown()){
        if (node.name().indexOf("<<")!=-1){
            if (typeOfContainingTemplate(parentNode)!=null){
                new TraitVariablesValidator().validateName(node,v);
                return;
            }
        }
        if (node.needSequence){
            v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "node: " + node.name()+" should be wrapped in sequence", node));
        }
        if (node.unresolvedRef){
            v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "reference: " + node.lowLevel().value()+" can not be resolved", node));

        }
        if (node.knownProperty&&node.lowLevel().value()!=null){
            //if (!node.lowLevel().)
            if (node.lowLevel().includeErrors().length==0) {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "property " + node.name() + " can not have scalar value", node));
            }
        }
        else {
            var issue = restrictUnknownNodeError(node);
            if(!issue){
                issue = createIssue(hl.IssueCode.UNKNOWN_NODE, "Unknown node: " + node.name(), node);
            }
            v.accept(issue);
        }
    }
    if (node.markCh()&&!node.allowRecursive()){

        v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Recursive definition: " + node.name(), node));
        return;
    }
    try {
        node.directChildren().filter(child => {
            return !requiredOnly || (child.property && child.property() && child.property().isRequired());
        }).forEach(x => {
            if ((<any>x).errorMessage){
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, (<hlimpl.BasicASTNode>x).errorMessage, node));
            }
            x.validate(v)
        });
    }finally{
        node.unmarkCh();
    }
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
export function validate(node:hl.IParseResult,v:hl.ValidationAcceptor){
    if (!node.parent()){
        try {
            validateIncludes(<hlimpl.BasicASTNode>node, v);
        } finally {
            cleanupIncludesFlag(<hlimpl.BasicASTNode>node, v);
        }
    }
    if (node.isAttr()){
        new CompositePropertyValidator().validate(<hl.IAttribute>node,v);
    }
    else if (node.isElement()){

        var highLevelNode = <hl.IHighLevelNode>node;

        if (highLevelNode.definition().isAnnotationType()||highLevelNode.property()&&highLevelNode.property().nameId()=="annotations"){
            new FixedFacetsValidator().validate(highLevelNode,v);
            return;
        }
        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.UsesDeclaration.name)){
            var vn=highLevelNode.attr(universes.Universe10.UsesDeclaration.properties.value.name);
            if (vn&&vn.value()){
                var rs=highLevelNode.lowLevel().unit().resolve(vn.value());
                if (!rs){
                    v.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE,"Can not resolve library from path:"+vn.value(),highLevelNode,false));
                }
                else{

                   var issues:hl.ValidationIssue[]=[];
                   rs.highLevel().validate({
                       begin(){

                       },
                       accept(x:hl.ValidationIssue){
                            issues.push(x);
                       },
                       end(){

                       }
                   });
                   if (issues.length>0){
                       var brand=createIssue(hl.IssueCode.UNRESOLVED_REFERENCE,"Issues in the used library:"+vn.value(),highLevelNode,false);
                       issues.forEach(x=>{x.unit=rs;x.path=rs.absolutePath();});
                       brand.extras=issues;
                       v.accept(brand);
                   }
                }
            }
        }
        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
            if (typeOfContainingTemplate(highLevelNode)){
                if (hasTemplateArgs(highLevelNode.lowLevel())) {
                    return;
                }
            }
            highLevelNode.attrs().forEach(a=>{
                var range =a.property().range().key();
                if (range==universes.Universe08.RelativeUriString||range==universes.Universe10.RelativeUriString){
                    new UriValidator().validate(a,v);
                    return;
                }
                if (range==universes.Universe08.FullUriTemplateString||range==universes.Universe10.FullUriTemplateString){
                    new UriValidator().validate(a,v);
                    return;
                }
                if (a.property().getAdapter(services.RAMLPropertyService).isKey()) {
                    var nameId = node.property() && node.property().nameId();
                    if (nameId == universes.Universe08.Resource.properties.uriParameters.name
                        || nameId == universes.Universe08.Resource.properties.baseUriParameters.name) {
                        //new UrlParameterNameValidator().validate(a, v);
                        return;
                    }
                    if (highLevelNode.property()) {
                        if (highLevelNode.property().nameId() ==
                            universes.Universe10.MethodBase.properties.body.name) {//FIXME
                            new MediaTypeValidator().validate(a, v);
                            return;
                        }
                    }
                }

            })
            if (highLevelNode.parent()&&!highLevelNode.parent().parent()){
                if (rtypes.builtInTypes().get(highLevelNode.name())){
                    v.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE,"redefining a built in type:"+highLevelNode.name(),highLevelNode));
                }
            }

            new RecurrentOverlayValidator().validate(highLevelNode, v);
            new RecurrentValidateChildrenKeys().validate(highLevelNode, v);
            new NodeSpecificValidator().validate(highLevelNode,v);
            new TypeDeclarationValidator().validate(highLevelNode,v);
            return;
        }

        var hasRequireds = highLevelNode.definition().requiredProperties() && highLevelNode.definition().requiredProperties().length > 0;

        var isAllowAny = highLevelNode.definition().getAdapter(services.RAMLService).getAllowAny();

        if(isAllowAny) {
            if(hasRequireds) {
                validateBasic(<hlimpl.BasicASTNode>node,v, true);
            }
        } else {
            validateBasic(<hlimpl.BasicASTNode>node,v);
        }
        new UriParametersValidator().validate(highLevelNode,v);

        new CompositeNodeValidator().validate(highLevelNode,v);
        new TemplateCyclesDetector().validate(highLevelNode,v);
    }
    else{
        validateBasic(<hlimpl.BasicASTNode>node,v);
    }
    new OptionalPropertiesValidator().validate(node,v);
}
function cleanupIncludesFlag(node:hl.IParseResult,v:hl.ValidationAcceptor) {
    var val=<any>node.lowLevel().actual();
    delete val._inc;
    node.children().forEach(x=>cleanupIncludesFlag(x,v));

}
function validateIncludes(node:hl.IParseResult,v:hl.ValidationAcceptor) {
    var val=<any>node.lowLevel().actual();

    if (val._inc){
        return;
    }
    if (node.isElement()){
        var vl=node.name();
        if (typeof vl=="string") {
            if (vl != null && vl.indexOf(" ") != -1) {
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Keys should not have spaces '" + vl + "'", node))
            }
        }
    }
    val._inc=true;
    if (node.lowLevel()) {
        node.lowLevel().includeErrors().forEach(x=> {
            var em = createIssue(hl.IssueCode.UNABLE_TO_RESOLVE_INCLUDE_FILE, x, node);
            v.accept(em)
        });
    }
    node.children().forEach(x=>validateIncludes(x,v));

}
var validateRegexp = function (cleanedValue:string, v:hl.ValidationAcceptor, node:hl.IParseResult) {
    try {
        new RegExp(cleanedValue)
    } catch (Error) {
        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Illegal pattern " + cleanedValue, node))
    }
};
class TraitVariablesValidator{


    validateName(node:hl.IParseResult,acceptor:hl.ValidationAcceptor){
        var name = node.name();
        if(name) {
            var start = node.lowLevel().keyStart();
            this.check(name, start, node, acceptor);
        }
    }

    validateValue(node:hl.IAttribute,acceptor:hl.ValidationAcceptor){

        var value = node.value();
        if(typeof(value)==='string') {
            var start = node.lowLevel().valueStart();
            this.check(value, start, node, acceptor);
        }
    }

    check(str:string,start:number,node:hl.IParseResult,acceptor:hl.ValidationAcceptor):hl.ValidationIssue[]{

        var errors:hl.ValidationIssue[] = [];
        var prev = 0;
        for (var i = str.indexOf('<<'); i >= 0; i = str.indexOf('<<', prev)) {
            var i0 = i;
            i += '<<'.length;
            prev = str.indexOf('>>', i);
            var paramOccurence = str.substring(i, prev);

            var ind = paramOccurence.lastIndexOf('|');
            var paramName = ind >= 0 ? paramOccurence.substring(0, ind) : paramOccurence;
            if (paramName.trim().length == 0) {
                var msg = "Trait or resource type parameter name must contain non whitespace characters";
                var issue = createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, msg, node, false);
                issue.start = start + i;
                issue.end = start + prev;
                acceptor.accept(issue);
            }
            if (ind != -1) {
                ind++;
                var transformerName = paramOccurence.substring(ind).trim();
                var functionNames = expander.getTransformNames();

                if (!_.find(functionNames, functionName =>
                    transformerName === functionName || transformerName === ('!' + functionName))) {

                    var msg = "Unknown function applied to parameter: " + transformerName;
                    var issue = createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, msg, node, false);
                    issue.start = start + ind;
                    issue.end = start + prev;
                    acceptor.accept(issue);
                }
            }
            prev += '>>'.length;
        }
        return errors;

    }
}

class MethodBodyValidator  implements PropertyValidator {
    static methodsWithoutRequestBody: string[] = ['trace'];

    validate(node: hl.IAttribute, validationAcceptor: hl.ValidationAcceptor) {
        var methodNode = node.parent();

        if(!methodNode) {
            return;
        }

        if(!(methodNode.definition().isAssignableFrom(universes.Universe08.Method.name) || methodNode.definition().isAssignableFrom(universes.Universe10.Method.name))) {
            return;
        }

        var hasBody = _.find(methodNode.lowLevel() && methodNode.lowLevel().children() || [], child => {
            var keyValue = child.key();

            return keyValue && (universes.Universe08.MethodBase.properties.body.name === keyValue || universes.Universe10.MethodBase.properties.body.name === keyValue);
        });

        if(hasBody && _.find(MethodBodyValidator.methodsWithoutRequestBody, methodDisabled => methodNode.name() === methodDisabled)) {
            validationAcceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, 'Request body is disabled for "' + methodNode.name() + '" method.', methodNode));
        }
    }
}

class CompositePropertyValidator implements PropertyValidator{
    validate(node:hl.IAttribute,v:hl.ValidationAcceptor){

        var pr = checkPropertyQuard(node, v);
        var vl=node.value();
        if (!node.property().range().hasStructure()){
            if (vl instanceof hlimpl.StructuredValue&&!(<def.Property>node.property()).isSelfNode()){
                //TODO THIS SHOULD BE MOVED TO TYPESYSTEM FOR STS AT SOME MOMENT
                if (isTypeOrSchema(node.property())){
                    if (node.property().domain().key()==universes.Universe08.BodyLike){
                        var structValue=<hlimpl.StructuredValue>vl;
                        var newNode=new hlimpl.ASTNodeImpl(node.lowLevel(),node.parent(),<hl.INodeDefinition>node.parent().definition().universe().type(universes.Universe08.BodyLike.name),node.property());
                        newNode.validate(v);
                        return;
                    }
                }
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Scalar is expected here",node))
            }
            else {
                if (node.lowLevel().valueKind()!=yaml.Kind.SCALAR&&node.lowLevel().valueKind()!=yaml.Kind.INCLUDE_REF&&!node.property().getAdapter(services.RAMLPropertyService).isKey()){
                    if ((!node.property().isMultiValue())) {
                        var k=node.property().range().key();
                        if (k==universes.Universe08.StringType||k==universes.Universe08.MarkdownString||k==universes.Universe08.MimeType) {
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "property '" + node.name() + "' must be a string", node))
                        }
                    }
                }
            }
        }


        if (typeof vl=='string'&&vl.indexOf("<<")!=-1){
            if (vl.indexOf(">>")>vl.indexOf("<<")){
                new TraitVariablesValidator().validateValue(node,v);
                if (typeOfContainingTemplate(node.parent())!=null){
                    return;
                }

            }
            //validate functions;
        }

        new MethodBodyValidator().validate(node, v);

        if ((node.property().range().key() == universes.Universe08.MimeType||
            node.property().range().key() == universes.Universe10.MimeType)||
            (node.property().nameId()==universes.Universe10.TypeDeclaration.properties.name.name
            &&node.parent().property().nameId()==
            universes.Universe10.MethodBase.properties.body.name)) {//FIXME
            new MediaTypeValidator().validate(node,v);
            return;
        }

        if (isExampleProp(node.property())){
            new ExampleValidator().validate(node, v);
        }
        if (node.property().nameId()==universes.Universe10.TypeDeclaration.properties.name.name){
            //TODO MOVE TO DEF SYSTEM
            var nameId = node.parent().property()&&node.parent().property().nameId();
            if (nameId == universes.Universe08.Resource.properties.uriParameters.name
                    || nameId == universes.Universe08.Resource.properties.baseUriParameters.name) {
//                    new UrlParameterNameValidator().validate(node, v);
                    return;
            }
        }

        var range =node.property().range().key();
        if (range==universes.Universe08.RelativeUriString||range==universes.Universe10.RelativeUriString){
            new UriValidator().validate(node,v);
            return;
        }
        if (range==universes.Universe08.FullUriTemplateString||range==universes.Universe10.FullUriTemplateString){
            new UriValidator().validate(node,v);
            return;
        }

        if ("pattern" == node.name() && universes.Universe10.StringType == node.definition().key()
            && node.parent().definition().isAssignableFrom("StringTypeDeclaration")) {
            validateRegexp(node.value(), v, node);
        }
        if ("name" == node.name() && universes.Universe10.StringType == node.definition().key()
            && (typeof node.value() == "string")
            && (<string>node.value()).indexOf("[") == 0
            && (<string>node.value()).lastIndexOf("]") == (<string>node.value()).length - 1) {

            if(node.parent() instanceof hlimpl.ASTNodeImpl &&
                universes.Universe10.ObjectTypeDeclaration.properties.properties.name == (<hlimpl.ASTNodeImpl>node.parent()).property().nameId()){

                if (node.parent().parent() instanceof hlimpl.ASTNodeImpl &&
                    universes.Universe10.ObjectTypeDeclaration == (<hlimpl.ASTNodeImpl>node.parent().parent()).definition().key()) {
                    var cleanedValue = (<string>node.value()).substr(1, (<string>node.value()).length - 2)
                    validateRegexp(cleanedValue, v, node);
                }
            }
        }

        if ((<defs.Property>pr).isReference()||pr.isDescriminator()){
            new DescriminatorOrReferenceValidator().validate(node,v);
        }
        else{
            new NormalValidator().validate(node,v);
        }
    }
}

export function isValid(t:hl.ITypeDefinition,h:hl.IHighLevelNode,value: any, p: hl.IProperty, attr?:hl.IAttribute){
    if (t.hasArrayInHierarchy()){
                return isValidArray(t,h,value,p,attr);
    }
    else if (t.hasValueTypeInHierarchy()){
            return isValidValueType(t,h,value,p,attr)
    }
    return true;
}
function isValidArray(t:hl.ITypeDefinition,h:hl.IHighLevelNode, v:any,p:hl.IProperty, attr?:hl.IAttribute):any{
    if (t.arrayInHierarchy().componentType()) {
        return isValid(t.arrayInHierarchy().componentType(),h, v, p);
    }
    return true;
}
function isValidValueType(t:hl.ITypeDefinition,h:hl.IHighLevelNode, v:any,p:hl.IProperty, attr?:hl.IAttribute):any{
    //FIXME
    try {

        if (t.key() ==universes.Universe10.AnnotationRef) {
            var targets=search.referenceTargets(p,h);
            var actualAnnotation=<hl.IHighLevelNode>_.find(targets,x=>hlimpl.qName(x,h)==v);
            if (actualAnnotation!=null){
                var attrs=actualAnnotation.attributes("allowedTargets");
                if (attrs){
                    var aVals=attrs.map(x=>x.value());
                    if (aVals.length>0){
                        var found=false;
                        //no we should actually check that we are applying annotation properly
                        var tps=h.definition().allSuperTypes();
                        tps=tps.concat([h.definition()])
                        var tpNames=tps.map(x=>x.nameId());
                        aVals.forEach(x=>{
                            //FIXME this is deeply wrong code
                            if (x=="API"){
                                x="Api"
                            }
                            if (x=="NamedExample"){
                                x="ExampleSpec"
                            }
                            if (x=="SecurityScheme"){
                                x="AbstractSecurityScheme"
                            }
                            if (x=="SecuritySchemeSettings"){
                                x="SecuritySchemeSettings"
                            }
                            if (_.find(tpNames,y=>y==x)){
                                found=true;
                            }
                            else{
                                if(x=="Parameter"){
                                    if (h.computedValue("location")){
                                        found=true;
                                    }
                                }
                                if(x=="Field"){
                                    if (h.computedValue("field")){
                                        found=true;
                                    }
                                }
                            }
                        });
                        if (!found){
                            return new Error("annotation "+v+" can not be placed at this location, allowed targets are:"+aVals)
                        }
                    }
                }
            }
            return tm;
        }
        if (t.key() == universes.Universe08.SchemaString||t.key() == universes.Universe10.SchemaString) {
            var tm = su.createSchema(v, new contentprovider.ContentProvider(h.lowLevel().unit()));
            if (tm instanceof Error){
                (<any>tm).canBeRef=true;
            }
            return tm;
        }
        if (t.key() == universes.Universe08.StatusCodeString||t.key() == universes.Universe10.StatusCodeString){
            var err:Error = validateResponseString(v);
            if(err!=null){
                return err;
            }
        }
        if (t.key() == universes.Universe08.JSonSchemaString||t.key() == universes.Universe10.JSonSchemaString) {
            var jsshema = su.getJSONSchema(v, new contentprovider.ContentProvider(h.lowLevel().unit()));

            if (jsshema instanceof Error){
                (<any>jsshema).canBeRef=true;
            }
            return jsshema;
        }
        if (t.key() == universes.Universe08.XMLSchemaString||t.key() == universes.Universe10.XMLSchemaString) {
            var xmlschema = su.getXMLSchema(v);

            if (xmlschema instanceof Error){
                (<any>xmlschema).canBeRef=true;
            }
            return xmlschema;
        }
        if (t.key() == universes.Universe08.BooleanType||t.isAssignableFrom(universes.Universe10.BooleanType.name)) {
            if (!(v === 'true' || v === 'false' || v === true || v === false)){
                return new Error("'true' or 'false' is expected here")
            }
            if(attr){
                var stringValue = attr.lowLevel().value(true);
                if (!(stringValue === 'true' || stringValue === 'false')){
                    return new Error("'true' or 'false' is expected here")
                }
            }
        }
        if (t.key() == universes.Universe08.NumberType||t.isAssignableFrom(universes.Universe10.NumberType.name)) {
            var q=parseFloat(v);
            if (isNaN(q)){
                return new Error("the value of "+p.nameId()+" must be a number")
            }
        }
        if (t.key() == universes.Universe08.StringType||t.isAssignableFrom(universes.Universe10.StringType.name)) {
            if (v === null) {
                //checking if there is at least something in the node.
                //We have many tests and APIs with the text like 'propertyName:' without a value. I do not know if such cases are
                //actually valid, but not reporting this for now.
                if (h && p) {
                    var highLevelProperty = h.attr(p.nameId());
                    if (highLevelProperty) {
                        var lowLevelChildren = highLevelProperty.lowLevel().children();
                        if (lowLevelChildren && lowLevelChildren.length > 0) {
                            return new Error(p.nameId() + " must be a string")
                        }
                    }
                }

            }
        }
        return true;
    } catch (e){
        e.canBeRef=true;//FIXME
        return e;
    }
}

class NormalValidator implements PropertyValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        var vl=node.value();
        var pr=<def.Property>node.property();

        var range=pr.range();

            var dnode=range.getAdapter(services.RAMLService).getDeclaringNode();
            if (dnode) {
                var rof = dnode.parsedType();
                var dp=node.parent().lowLevel().dumpToObject();
                var vl=dp[node.parent().name()];
                var isVal=pr.canBeValue();
                var val=isVal?vl:vl[pr.nameId()];
                var validateObject=rof.validate(val,true);
                if (!validateObject.isOk()) {
                    validateObject.getErrors().forEach(e=>cb.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, e.getMessage(), node, false)));
                }
            }

        var v=cb;
        if (node.lowLevel().keyKind()!=yaml.Kind.SEQ) {
            var validation = isValid(pr.range(),node.parent(), vl, pr,node);
        }
        else{
            validation=true;
        }
        if (validation instanceof Error){
            if (!(<any>validation).canBeRef){
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>validation).message, node));
                validation=null;
                return;
            }
        }
        if (!validation||validation instanceof Error){//FIXME
            if (pr.nameId()!='value') {//FIXME
                if (!checkReference(pr, node, vl, v)) {
                    if (pr.nameId()==universes.Universe10.TypeDeclaration.properties.schema.name
                        ||universes.Universe10.TypeDeclaration.properties.type.name){
                        if (vl&&vl.trim()&&(pr.domain().key()==universes.Universe08.BodyLike
                            ||pr.domain().key()==universes.Universe10.TypeDeclaration)){
                            var testSchema=vl.trim().charAt(0);//FIXME
                            if (testSchema!='{'&&testSchema!='<'){
                                return;
                            }
                        }
                        //return ;//
                    }
                    var decl = (<hlimpl.ASTPropImpl>node).findReferencedValue();
                    if (decl instanceof Error) {
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>decl).message, node));
                    }
                    if (!decl){
                        if (vl) {
                            if (pr.nameId() == universes.Universe10.TypeDeclaration.properties.schema.name) {
                                var z=vl.trim();
                                if (z.charAt(0)!='{'&&z.charAt(0)!='<') {
                                    if (vl.indexOf('|') != -1 || vl.indexOf('[]') != -1 || vl.indexOf("(") != -1) {
                                        return;
                                    }
                                }
                            }
                        }
                        if (validation instanceof Error&&vl){
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>validation).message, node));
                            validation=null;
                            return;
                        }
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Empty value is not allowed here", node));
                    }
                }
            }
            else{
                var vl=node.value();
                var message="Invalid value schema:"+vl
                if (validation instanceof Error){
                    message=validation.message;
                }
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, message, node));
            }
        }
        var values=pr.enumOptions();
        if (values) {
            if (typeof values == 'string') {
                if (values != vl) {
                    if (vl && (vl.indexOf("x-") == 0) && pr.nameId() == universes.Universe08.AbstractSecurityScheme.properties.type.name) {//Some magic I copied a from a couple of lines below @Denis
                        //return true;
                    }
                    else {
                        v.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Invalid value:" + vl + " allowed values are:" + values, node));
                    }
                }
            }
            else if (values.length > 0) {
                if (!_.find(values, x=>x == vl)) {
                    if (vl && (vl.indexOf("x-") == 0)  && pr.nameId() == universes.Universe08.AbstractSecurityScheme.properties.type.name) {//FIXME move to def system
                        //return true;
                    }
                    else {
                        v.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Invalid value:" + vl + " allowed values are:" + values.join(","), node));
                    }
                }
            }
        }
    }
}

class UriValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        try{
            var values:string[]=new UrlParameterNameValidator().parseUrl(node.value());
            if (values.some(x=>x=="version")&&node.property().nameId()=="baseUri"){
               var version= node.root().attr("version")

               if (!version){
                   cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "missing version", node,false))
               }
            }

            if (values.some(x=>x.length == 0)) {
                cb.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, "URI parameter must have name specified", node,false))
            }
        }
        catch (e){
            cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, e.message, node,false))
        }
    }
}
class MediaTypeValidator implements PropertyValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        try {
            var v = node.value();
            if (!v){
                return;
            }
            if (v == "*/*") {
                return
            }
            if (v.indexOf("/*")==v.length-2){
                v=v.substring(0,v.length-2)+"/xxx";
            }
            if (v=="body"){
                if (node.parent().parent()) {
                    var ppc=node.parent().parent().definition().key();
                    if (ppc===universes.Universe08.Response||ppc===universes.Universe10.Response||
                        node.parent().parent().definition().isAssignableFrom(universes.Universe10.MethodBase.name)) {
                        v=node.parent().computedValue("mediaType")
                    }
                }
            }


            var res = mediaTypeParser.parse(v);
            var types = {
                application: 1,
                audio: 1,
                example: 1,
                image: 1,
                message: 1,
                model: 1,
                multipart: 1,
                text: 1,
                video: 1
            }
            if (!types[res.type]) {
                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unknown media type 'type'", node))
            }
        }catch (e){
            cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, ""+e.message, node))
        }
        if (node.value()&&node.value()==("multipart/form-data")||node.value()==("application/x-www-form-urlencoded")){
            if (node.parent()&&node.parent().parent()&&node.parent().parent().property()) {
                if (node.parent().parent().property().nameId() == universes.Universe10.MethodBase.properties.responses.name) {
                    cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Form related media types can not be used in responses", node))
                }
            }
        }
        return;
    }
}
//class SignatureValidator implements PropertyValidator{
//    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
//        var vl=node.value();
//        var q = vl?vl.trim():"";
//        if (q.length > 0 ) {
//            try {
//                //ramlSignature.validate(vl, node, cb);
//            }catch (e){
//                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Error during signature parse:"+e.message,node))
//            }
//            return;
//        }
//        return;
//    }
//}
export class UrlParameterNameValidator implements PropertyValidator{

    private checkBaseUri(node:hl.IAttribute,c, vl, v:hl.ValidationAcceptor) {
        var bu = c.root().attr("baseUri")

        if (bu) {
            var tnv = bu.value();
            try {
                var pNames = this.parseUrl(tnv);
                if (!_.find(pNames, x=>x == vl)) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", node))
                }

            } catch (e) {

            }
        }
        else {
            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", node))
        }
    }
    parseUrl(value:string):string[]{//FIXME INHERITANCE
        var result=[]
        var temp="";
        var inPar=false;
        var count=0;
        for (var a=0;a<value.length;a++){
            var c=value[a];
            if (c=='{'){
                count++;
                inPar=true;
                continue;
            }
            if (c=='}'){
                count--;
                inPar=false;
                result.push(temp);
                temp="";
                continue;
            }
            if (inPar){
                temp+=c;
            }
        }
        if (count>0){
            throw new Error("Unmatched '{'")
        }
        if (count<0){
            throw new Error("Unmatched '}'")
        }
        return result;
    }

    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        var vl=node.value();
        if (node.parent().property().nameId()==universes.Universe10.Api.properties.baseUri.name){
            var c=node.parent().parent();
            this.checkBaseUri(node,c, vl, cb);
            return;
        }
        var c=node.parent().parent();
        var tn=c.name();
        if (c.definition().key()===universes.Universe10.Api||
            c.definition().key()===universes.Universe08.Api){
            this.checkBaseUri(node,c, vl, cb);
            return;
        }
        if (c.definition().key() == universes.Universe10.ResourceType ||
            c.definition().key() == universes.Universe08.ResourceType){
            return;
        }

        try {
            var pNames=this.parseUrl(tn);
            var foundInLocalParameters = _.find(pNames,x=>x==vl);
            if (!foundInLocalParameters) {
                var baseUri = node.root().attr(universes.Universe10.Api.properties.baseUri.name)

                if (baseUri&&node.name()===universes.Universe08.Api.properties.baseUriParameters.name) {
                    var baseUriValue = baseUri.value();
                    if (baseUriValue) {
                        pNames = this.parseUrl(baseUriValue);
                        if (pNames && pNames.length > 0) {
                            if (_.find(pNames, x=>x == vl)) return
                        }
                    }
                }

                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Unused url parameter '"+vl+"'",node))
            }

        } catch (e){

        }
    }
}

//TODO this should be probably moved to a more general file/module
export var typeToName = {}

typeToName[universes.Universe08.Trait.name] = "trait";
typeToName[universes.Universe08.ResourceType.name] = "resource type";
typeToName[universes.Universe10.Trait.name] = "trait";
typeToName[universes.Universe10.AnnotationTypeDeclaration.name] = "annotation type";
typeToName[universes.Universe10.ResourceType.name] = "resource type";
typeToName[universes.Universe10.AbstractSecurityScheme.name] = "security scheme";
typeToName[universes.Universe10.Method.name] = "method";
typeToName[universes.Universe08.Method.name] = "method";
typeToName[universes.Universe10.Resource.name] = "resource";
typeToName[universes.Universe08.Resource.name] = "resource";
typeToName[universes.Universe10.Api.name] = "api";
typeToName[universes.Universe08.Api.name] = "api";
typeToName[universes.Universe10.Response.name] = "response";
typeToName[universes.Universe08.Response.name] = "response";
typeToName[universes.Universe08.BodyLike.name] = "body";


export var parameterPropertyToName = {}
parameterPropertyToName[universes.Universe08.HasNormalParameters.properties.headers.name] = "header";
parameterPropertyToName[universes.Universe08.HasNormalParameters.properties.queryParameters.name] = "query parameter";
parameterPropertyToName[universes.Universe08.Api.properties.uriParameters.name] = "uri parameter";
parameterPropertyToName[universes.Universe08.Api.properties.baseUriParameters.name] = "base uri parameter";
parameterPropertyToName[universes.Universe08.BodyLike.properties.formParameters.name] = "form parameter";
parameterPropertyToName[universes.Universe10.HasNormalParameters.properties.headers.name] = "header";
parameterPropertyToName[universes.Universe10.HasNormalParameters.properties.queryParameters.name] = "query parameter";
parameterPropertyToName[universes.Universe10.ResourceBase.properties.uriParameters.name] = "uri parameter";
parameterPropertyToName[universes.Universe10.Api.properties.baseUriParameters.name] = "base uri parameter";
parameterPropertyToName[universes.Universe10.MethodBase.properties.body.name] = "body";


export function getHumanReadableNodeName(astNode:hl.IParseResult) {
    if (!astNode) return null;

    if (astNode.isElement()) {
        var element = <hl.IHighLevelNode> astNode;
        var definition = element.definition();
        if (definition && typeToName.hasOwnProperty(definition.nameId())) {
            return typeToName[definition.nameId()];
        }

        if (definition.isAssignableFrom(universes.Universe10.TypeDeclaration.name) ||
            definition.isAssignableFrom(universes.Universe08.Parameter.name)) {

            if (element.property() && parameterPropertyToName.hasOwnProperty(element.property().nameId())) {

                return parameterPropertyToName[element.property().nameId()];
            }

            if (element.property() && element.parent() &&
                element.property().nameId() == universes.Universe10.LibraryBase.properties.types.name &&
                element.parent().definition() && element.parent().definition().isAssignableFrom(
                    universes.Universe10.LibraryBase.name)) {

                return "type";
            }

            if (element.property() && element.parent() &&
                element.property().nameId() == universes.Universe10.LibraryBase.properties.securitySchemes.name &&
                element.parent().definition() && element.parent().definition().isAssignableFrom(
                    universes.Universe10.LibraryBase.name)) {

                return "security scheme";
            }
        }
    }

    return null;
}

function isValidPropertyValue(pr:def.Property,vl:string,c:hl.IHighLevelNode):boolean{
        var node=<any>search.declRoot(c);
        if (!node._cach){
            node._cach={};
        }
        var id=pr.id();
        if (pr.domain()){
            id+=pr.domain().nameId();
        }
        if (id) {
            var cached=node._cach[id];
            if (cached) {
                return cached[vl] != null;
            }
        }
        var vls=search.enumValues(pr,c);
        var mm={}
        vls.forEach(x=>mm[x]=1);
        if (pr.id()){
            node._cach[id]=mm;
        }
        return mm[vl]!=null;
}
function checkReference(pr:def.Property, astNode:hl.IAttribute, vl:string, cb:hl.ValidationAcceptor):boolean {

    checkTraitReference(pr, astNode, cb);
    checkResourceTypeReference(pr, astNode, cb);

    if (!vl){
        return;
    }
    if (vl=='null'){
        if (pr.isAllowNull()){
            return;
        }
    }

    var adapter = (<def.Property>pr).getAdapter(services.RAMLPropertyService);

    var valid = isValidPropertyValue(pr,vl,astNode.parent());

    if(!valid && astNode.lowLevel().unit().absolutePath() !== astNode.parent().lowLevel().unit().absolutePath()) {
        valid = isValidPropertyValue(pr,vl, <hl.IHighLevelNode>hlimpl.fromUnit((<any>astNode).lowLevel().unit()));
    }

    if (!valid) {
        if (typeof vl=='string') {
            if ((vl.indexOf("x-") == 0) && pr.nameId() == universes.Universe10.TypeDeclaration.properties.type.name) {//FIXME move to def system
                return true;
            }
        }

        var expected = (adapter.isReference && adapter.isReference() && adapter.referencesTo && adapter.referencesTo() && adapter.referencesTo().nameId && adapter.referencesTo().nameId());

        var referencedToName = typeToName[expected] || nameForNonReference(astNode);

        var message = referencedToName ? ("Unrecognized " + referencedToName + " '" + vl + "'.") : ("Unresolved reference: " + vl);

        var spesializedMessage = specializeReferenceError(message, pr, astNode)
        cb.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, spesializedMessage, astNode));

        return true;
    }
    return false;
}

function checkTraitReference(property:def.Property, astNode:hl.IAttribute, acceptor:hl.ValidationAcceptor) {
    //"is" property value must be an array
    if (!universeHelpers.isIsProperty(property)) {
        return;
    }
    var lowLevel = astNode.lowLevel();
    if (lowLevel == null) {
        return;
    }

    //trying to find "is" mapping, looking 2 nodes up max
    var isMappingNode = null;

    var lowLevelParent = lowLevel.parent();
    var lowLevelParentParent = lowLevelParent != null? lowLevelParent.parent() : null;
    if (lowLevel.kind() == yaml.Kind.MAPPING && lowLevel.key() && lowLevel.key() == "is") {
        isMappingNode = lowLevel;
    } else if (lowLevelParent != null &&
        lowLevelParent.kind() == yaml.Kind.MAPPING && lowLevelParent.key() && lowLevelParent.key() == "is") {
        isMappingNode = lowLevelParent;
    } else if (lowLevelParentParent != null &&
        lowLevelParentParent.kind() == yaml.Kind.MAPPING && lowLevelParentParent.key() && lowLevelParentParent.key() == "is") {
        isMappingNode = lowLevelParentParent;
    }

    if (isMappingNode == null) {
        return;
    }

    //having a single value is bad
    if (isMappingNode.value() != null && (!isMappingNode.children() || isMappingNode.children().length == 0)) {
        acceptor.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE,"property 'is' must be an array",astNode));
    }

    //only maps and scalars are allowed as direct children
    var illegalChildFound = false;
    isMappingNode.children().forEach(child=>{
        if (child.kind() != yaml.Kind.SCALAR && child.kind() != yaml.Kind.MAP) {
            illegalChildFound = true;
        }
    })

    if (illegalChildFound) {
        acceptor.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE,"property 'is' must be an array",astNode));
    }
}

function checkResourceTypeReference(property:def.Property, astNode:hl.IAttribute, acceptor:hl.ValidationAcceptor) {
    if (!universeHelpers.isTypeProperty(property)) {
        return;
    }

    if (!universeHelpers.isResourceTypeRefType(astNode.definition())) {
        return;
    }

    var lowLevel = astNode.lowLevel();
    if (astNode.value() == null && lowLevel && lowLevel.children() &&
        lowLevel.children().length == 0) {
        if (lowLevel.kind() == yaml.Kind.MAPPING && lowLevel.valueKind() != null) {
            //no value, no children in the mapping, but some value, that means empty map or something like this.
            acceptor.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, "resource type name must be provided", astNode));
        }
    } else if (astNode.value() == null && lowLevel && lowLevel.children() &&
        lowLevel.children().length > 1) {

        //more than a single resource type in a list / map
        acceptor.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE,
            "a resource or resourceType can inherit from a single resourceType", astNode));
    }
}

/**
 * Sometimes we need a more specialized message for the bad references, which diviate from a general algorithm.
 * Like listing possible values etc.
 * This method is responsible for such cases.
 * @param originalMessage
 * @param pr
 * @param astNode
 * @returns {string}
 */
function specializeReferenceError(originalMessage: string, property:def.Property, astNode:hl.IAttribute) : string {
    if (property.nameId()=="type"&&property.domain().universe().version()=="RAML08"){
        if (property.domain().isAssignableFrom(universes.Universe08.Parameter.name)) {
            return "type can be either of: string, number, integer, file, date or boolean";
        }
    }

    if (astNode.parent() != null && universeHelpers.isSecuritySchemaType(astNode.parent().definition())) {
        return originalMessage +
            " Allowed values are:OAuth 1.0,OAuth 2.0,Basic Authentication,DigestSecurityScheme Authentication,x-{other}";
    }


    return originalMessage;
}

function nameForNonReference(astNode: hl.IAttribute): any {
    var propertyName = astNode && astNode.lowLevel() && astNode.lowLevel().key();

    if(propertyName === universes.Universe10.AbstractSecurityScheme.properties.type.name) {
        var domain = astNode.parent() && astNode.parent().definition() && astNode.parent().definition().nameId();

        if(domain === universes.Universe10.AbstractSecurityScheme.name) {
            return "security scheme type";
        }
    }else if(propertyName === universes.Universe08.BodyLike.properties.schema.name) {
        var domain = astNode.parent() && astNode.parent().definition() && astNode.parent().definition().nameId();

        if(domain === universes.Universe08.BodyLike.name) {
            return "schema";
        }
    }
}


class DescriminatorOrReferenceValidator implements PropertyValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        var vl=node.value();
        var valueKey=vl;
        var pr=<def.Property>node.property();
        if (typeof vl=='string'){
            checkReference(pr, node, vl,cb);
            if (pr.range() instanceof defs.ReferenceType){
                var t=<defs.ReferenceType>pr.range();
                if (true){
                    var mockNode=jsyaml.createNode(""+vl,<any>node.lowLevel().parent());
                    mockNode._actualNode().startPosition=node.lowLevel().valueStart();
                    mockNode._actualNode().endPosition=node.lowLevel().valueEnd();
                    var stv=new hlimpl.StructuredValue(mockNode,node.parent(),node.property())
                    var hn = stv.toHighLevel()
                    if (hn) {
                        hn.validate(cb);
                    }
                }
            }
        }
        else if (vl != null){
            var st=<hlimpl.StructuredValue>vl;
            if (st) {
                valueKey=st.valueName();
                var vn = st.valueName();
                if (!checkReference(pr, node, vn,cb)) {
                    var hnode = st.toHighLevel()
                    if(hnode) hnode.validate(cb);
                }
            }
            else{
                valueKey=null;
            }
        } else {
            //there is no value, but still a reference: calling checkReference with null value
            if (node.definition().isAssignableFrom(universes.Universe10.Reference.name)) {
                checkReference(pr, node, null, cb);
            }
        }

        if (valueKey) {
            var validation = isValid(pr.range(),node.parent(), valueKey, pr);
            if (validation instanceof Error) {
                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, (<Error>validation).message, node));
                validation = null;
            }
        }
    }
}
interface NodeValidator{

    validate(node:hl.IHighLevelNode,cb:hl.ValidationAcceptor);
}
interface NameToInt{
    [name:string]:number
}

var allowOverride = { resources: 1, queryParameters: 1, headers: 1, body: 1, methods: 1,responses: 1 }
class RAMLVersionAndFragmentValidator implements NodeValidator{


    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){
        var u=(<hlimpl.ASTNodeImpl>node).universe();
        var tv=u.getTypedVersion();
        if (tv){
            if (util.startsWith(tv,"#%")) {
                if (tv !== "#%RAML 0.8" && tv !== "#%RAML 1.0") {
                    var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Unknown version of RAML expected to see one of '#%RAML 0.8' or '#%RAML 1.0'", node)
                    v.accept(i);

                }
                var tl=u.getTopLevel();
                if (tl){
                    if (tl!=node.definition().nameId()){
                        if (node.definition().nameId()=="Api") {
                            var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Unknown top level type:" + tl, node)
                            v.accept(i);
                        }
                    }
                }
            }
        }
    }

}
class RequiredPropertiesAndContextRequirementsValidator implements NodeValidator{
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){

        (node.definition()).getAdapter(services.RAMLService).getContextRequirements().forEach(x=>{
            if (!(<hlimpl.ASTNodeImpl>node).checkContextValue(x.name,x.value,x.value)){
                var message=x.name+` should be ${x.value} to use type ${node.definition().nameId()}`;
                if (x.name=='location'&&x.value=="ParameterLocation.FORM"){
                    message="file type can be only used in web forms"
                }
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT,message,node))
            }
        });
        node.definition().requiredProperties().forEach(x=>{
            var r=x.range();
            if (r.hasArrayInHierarchy()){
                r=r.arrayInHierarchy().componentType();
            }
            if (r.hasValueTypeInHierarchy()) {
                var nm = node.attr(x.nameId());
                var gotValue = false;
                if (nm!=null){
                    if(nm.lowLevel().kind()==yaml.Kind.SCALAR
                        ||nm.lowLevel().valueKind()==yaml.Kind.SCALAR
                        ||nm.lowLevel().kind()==yaml.Kind.INCLUDE_REF
                        ||nm.lowLevel().valueKind()==yaml.Kind.INCLUDE_REF){
                        if(nm.value()!=null){
                            gotValue = true;
                        }
                    }
                    else if (nm.lowLevel().children().length!=0) {
                        gotValue = true;
                    }
                }
                if(!gotValue){
                    var msg="Missing required property " + x.nameId();

                    if (node.definition().getAdapter(services.RAMLService).isInlinedTemplates()){
                        msg="value was not provided for parameter: "+x.nameId();
                    }
                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, msg, node)
                    v.accept(i);
                }
            }
            else{
                var el = node.elementsOfKind(x.nameId());
                if (!el||el.length==0) {
                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, "Missing required property " + x.nameId(), node)
                    v.accept(i);
                }
            }
        });
    }
}
class ScalarQuoteValidator implements NodeValidator {
    validate(node:hl.IHighLevelNode, v:hl.ValidationAcceptor) {
        var r = node.lowLevel().unit();
        node.lowLevel().visit(x=> {
            if (x.unit() != r) {
                return false;
            }
            if (x.value() && (<any>x)._node && (<any>x)._node.value) {
                if ((<any>x)._node.value.doubleQuoted) {
                    var ind = (x.value() + "").indexOf(":");
                    var nl = (x.value() + "").indexOf("\n");
                    if (ind != -1 && nl != -1 && (!x.includePath() || x.includePath().length == 0)) {
                        var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Suspicious double quoted multiline scalar, it is likely that you forgot closing \" " + x.value(), node, true)
                        i.start = (<any>x)._node.value.startPosition;
                        i.end = (<any>x)._node.value.endPosition;
                        if (i.start == i.end) {
                            i.end++;
                        }
                        v.accept(i);
                    }
                }
            }
            return true;
        })
    }
}
class FixedFacetsValidator implements NodeValidator {
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor) {
        var nc=node.definition();
        var dnode=nc.getAdapter(services.RAMLService).getDeclaringNode();
        if (dnode) {
            var rof = dnode.parsedType();
            var dp=node.lowLevel().dumpToObject(true);
            if (dp){
                dp=dp[Object.keys(dp)[0]];}
            if (!dp){
                if (nc.isAnnotationType()){
                    if (nc.isAssignableFrom(universes.Universe10.StringType.name)){
                        dp="";
                    }
                }
            }
            var validateObject=rof.validate(dp,true,false);
            if (!validateObject.isOk()) {
                validateObject.getErrors().forEach(e=>v.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, e.getMessage(), mapPath( node,e), false)));
            }
        }
    }
}

class TypeDeclarationValidator implements NodeValidator{
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor) {
        var nc=node.definition();
        var rof = node.parsedType();
        var validateObject=rof.validateType(node.types().getAnnotationTypeRegistry());
        if (!validateObject.isOk()) {
            validateObject.getErrors().forEach(e=>{v.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, e.getMessage(),mapPath( node,e), e.isWarning()))});
        }
    }
}
function mapPath(node:hl.IHighLevelNode,e:rtypes.IStatus):hl.IParseResult{
    var src= e.getValidationPath();

    return findElementAtPath(node,src);
}

function findElementAtPath(n:hl.IParseResult,p:rtypes.IValidationPath):hl.IParseResult{
    if (!p){
        return n;
    }
    var chld=n.children();
    for (var i=0;i<chld.length;i++){
        if (chld[i].name()=== p.name){
            return findElementAtPath(chld[i], p.child)
        }
    }
    var lchld= n.lowLevel().children();
    for (var i=0;i<lchld.length;i++){
        if (lchld[i].key()=== p.name){
            var nn=new hlimpl.BasicASTNode(lchld[i],<hl.IHighLevelNode>n);
            return findElementAtPath(nn, p.child)
        }
    }
    return n;
}

class CompositeNodeValidator implements NodeValidator {
    validate(node:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) {
        if (node.definition().isAnnotationType()){
            return;
        }
        if (node.lowLevel().keyKind()==yaml.Kind.SEQ){

                var isPattern=node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)
                if (!isPattern) {
                    acceptor.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Node key can not be sequence", node));
                }

        }
        if (node.definition().key()==universes.Universe08.GlobalSchema){
            if (node.lowLevel().valueKind()!=yaml.Kind.SCALAR&&node.lowLevel().valueKind()!=yaml.Kind.INCLUDE_REF){
                acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"schema "+node.name()+" must be a string",node))
            }

        }
        if (!node.parent()) {
            new RAMLVersionAndFragmentValidator().validate(node, acceptor);

            //Note: overloading validator now checks for oveloading and rejects it
            if (node.definition().key() == universes.Universe08.Api || node.definition().key() == universes.Universe10.Api) {
                new OverloadingValidator().validateApi(<any>node.wrapperNode(), acceptor)

                //if (node.definition().universe().version() != "RAML08") {
                //    new OverloadingValidator().validateApi(<any>node.wrapperNode(), acceptor)
                //}
                //else{
                //    new OverloadingValidator08().validateApi(<any>node.wrapperNode(), acceptor)
                //}
            }
            new ScalarQuoteValidator().validate(node, acceptor);
            lintNode(node, acceptor);
            //now we should validate overloading combinations
        }
        new OverlayNodesValidator().validate(node, acceptor);
        var nc = node.definition();
        if (nc.key()==universes.Universe08.BodyLike){
            if (node.lowLevel().children().map(x=>x.key()).some(x=>x==="formParameters")){
                if (node.parent()&&node.parent().definition().key()==universes.Universe08.Response) {
                    var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "form parameters can not be used in response", node)
                    acceptor.accept(i);
                }
                else if (node.lowLevel().children().map(x=>x.key()).some(x=>x==="schema"||x==="example")){
                    var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "formParameters cannot be used together with the example or schema properties", node)
                    acceptor.accept(i);
                }
            }
        }
        //validation of enum values;
            if (node.definition().isAssignableFrom(universes.Universe08.Parameter.name)
                ||node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){

                var vls=node.attributes("enum").map(x=>x.value());
                if (vls.length!=_.uniq(vls).length){
                    var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "enum contains duplicated values", node)
                    acceptor.accept(i);
                }

                if(node.definition().isAssignableFrom(universes.Universe08.NumberTypeDeclaration.name) || node.definition().isAssignableFrom(universes.Universe10.NumberTypeDeclaration.name)) {
                    var isInteger = node.definition().isAssignableFrom(universes.Universe08.IntegerTypeDeclaration.name) || node.definition().isAssignableFrom(universes.Universe10.IntegerTypeDeclaration.name);

                    node.attributes("enum").forEach(attribute => {
                        var value = isInteger ? parseInt(attribute.value()) : parseFloat(attribute.value());

                        var isValid = isInteger ? !isNaN(value) && attribute.value().indexOf('.') === -1 : !isNaN(value);

                        if(!isValid) {
                            var issue = createIssue(hl.IssueCode.NODE_HAS_VALUE, (isInteger ? "Integer" : "Number") + " is expected", attribute);

                            acceptor.accept(issue);
                        }
                    });
                }
            }

        if (universeHelpers.isResourceTypeType(node.definition())){
            if(node.value()==null&&node.lowLevel().value(true)==="null") {
                acceptor.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Resource type can not be null", node))
            }
        }
        checkPropertyQuard(node, acceptor);
        var nodeValue = node.value();
        if ((typeof nodeValue == 'string'
            || typeof nodeValue == 'number'
            || typeof nodeValue == 'boolean')
            && !node.definition().getAdapter(services.RAMLService).allowValue()) {
            if (node.parent()) {
                var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "node " + node.name() + " can not be a scalar", node)
                acceptor.accept(i);
            }
        }
        new RequiredPropertiesAndContextRequirementsValidator().validate(node, acceptor);
        new ValidateChildrenKeys().validate(node, acceptor);


        new NodeSpecificValidator().validate(node, acceptor);
    }
}

class BaseUriParameterValidator implements NodeValidator {
    validate(node:hl.IHighLevelNode,acceptor:hl.ValidationAcceptor) {
        //we cant have "version" base uri parameter
        var nameAttributeValue = node.attrValue(universes.Universe10.TypeDeclaration.properties.name.name);
        if ("version" == nameAttributeValue) {

            //I dont like the message, but its coming from JS 0.8 parser @Denis
            acceptor.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY,
                "version parameter not allowed here", node));
        }
    }
}

class NodeSpecificValidatorRegistryEntry implements NodeValidator {

    private definitions : any[];
    private propertyName : string;
    private assignableFrom : boolean;
    private validator : NodeValidator;

    /**
     *
     * @param definition - array of definitions from universes
     * @param propertyName - name of the property. May be null, then property is not tested.
     * @param assignableFrom - whether instead of direct definition comparison, the tested node will be checked
     * for assignability from the specified definitions
     */
    constructor(definitions : any[], propertyName : string, validator: NodeValidator, assignableFrom = false) {
        this.definitions = definitions;
        this.propertyName = propertyName;
        this.assignableFrom = assignableFrom;
        this.validator = validator;
    }

    /**
     * Checks whether this entry is applicable to the node. If so, invokes its validator.
     * @param node
     * @param cb
     */
    validate(node:hl.IHighLevelNode,acceptor:hl.ValidationAcceptor) {
        var nodeDefinition = node.definition();
        if (nodeDefinition == null) return;

        var definitionMatched = false;
        if (!this.assignableFrom) {
            definitionMatched =
                this.definitions.some(currentDefinition=>currentDefinition===nodeDefinition);
        } else {
            definitionMatched =
                this.definitions.some(currentDefinition=>nodeDefinition.isAssignableFrom(currentDefinition.name));
        }

        if (!definitionMatched) return;

        if (this.propertyName != null) {
            if (node.property() == null) return;

            if (node.property().nameId() != this.propertyName) return;
        }

        //definition and property matched, invoking validator
        this.validator.validate(node, acceptor);
    }
}
/**
 * A central switch for validations specific to a particular node.
 * In future it would be nice to migrate all node-specific validation scattered around the code here.
 */
class NodeSpecificValidator implements NodeValidator {

    private static entries : NodeSpecificValidatorRegistryEntry[] = NodeSpecificValidator.createRegistry();

    private static createRegistry() : NodeSpecificValidatorRegistryEntry[] {
        var result: NodeSpecificValidatorRegistryEntry[] = [];

        NodeSpecificValidator.registerValidator(result,
            [universes.Universe10.TypeDeclaration, universes.Universe08.Parameter],
            universes.Universe10.Api.properties.baseUriParameters.name,
            new BaseUriParameterValidator(), true);

        return result;
    }

    private static registerValidator(listToAddTo : NodeSpecificValidatorRegistryEntry[],
        definitions : any[], propertyName : string,
        validator: NodeValidator, assignableFrom = false) {

        var entry = new NodeSpecificValidatorRegistryEntry(
            definitions,propertyName,validator,assignableFrom);

        listToAddTo.push(entry);
    }

    validate(node:hl.IHighLevelNode,acceptor:hl.ValidationAcceptor) {
        NodeSpecificValidator.entries.forEach(entry=>entry.validate(node, acceptor));
    }
}


class OverlayNodesValidator implements NodeValidator{

    /**
     * Checks that this node is in white list and
     * makes itself and all of its children allowed to exist in overlay even
     * if there is no master counterpart
     * @param node
     * @param root
     * @returns {boolean}
     */
    private allowsAnyChildren(node:hl.IHighLevelNode, root: hl.IHighLevelNode) : boolean {
        var property = node.property();
        var definition = node.definition();

        //accepting new annotation types
        if ((universeHelpers.isAnnotationTypeType(definition) || universeHelpers.isTypeDeclarationTypeOrDescendant(definition))
            &&  universeHelpers.isAnnotationTypesProperty(property)) return true;

        //accepting new top-level type declarations
        if (node.parent() == root && universeHelpers.isTypesProperty(property)
            && universeHelpers.isTypeDeclarationTypeOrDescendant(definition)) return true;

        //as we allow types, it is logical to also allow schemas as "schemas are only aliases for types"
        if (universeHelpers.isSchemasProperty(property)
            && universeHelpers.isTypeDeclarationTypeOrDescendant(definition)) return true;

        //accepting documentation
        if (node.parent() == root && universeHelpers.isDocumentationProperty(property)
            && universeHelpers.isDocumentationType(definition)) return true;

        //accepting annotations
        if (universeHelpers.isAnnotationsProperty(property)
            /*&& (universeHelpers.isAnnotationRefTypeOrDescendant(definition) ||
                definition.isAnnotationType())*/) return true;

        //uses allowed
        if (universeHelpers.isUsesProperty(property)) return true;

        //examples allowed
        if (universeHelpers.isExamplesProperty(property)) return true;

        return false;
    }

    /**
     * Checks that this node is allowed to exist in overlay even if there is no master counterpart
     * due to it or its parent being in the white list.
     * @param node
     * @param root
     */
    private nodeAllowedDueToParent(node:hl.IHighLevelNode, root: hl.IHighLevelNode) : boolean {
        var currentNode = node;
        while(currentNode != root && currentNode != null) {
            if (this.allowsAnyChildren(currentNode, root)) {
                return true;
            }

            currentNode = currentNode.parent();
        }

        return false;
    }

    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){
        var root = node.root();

        var property = node.property();
        var definition = node.definition();

        //we are only validating overlays
        if (!universeHelpers.isOverlayType(root.definition())) return;

        //for root only validate properties
        if (node == root)
        {
            this.validateProperties(node, v);
            return;
        }

        //we have a whitelist of IHighLevelNodes allowed to be added in an overlay like new types, annotation types,
        //annotation etc. The contents of such nodes is checked here.
        if (this.nodeAllowedDueToParent(node, root)) return;

        //checking for a node, this node overrides
        var overrides = (<ASTNodeImpl>root).knownIds();
        if (!overrides){
            //should never happen
            return;
        }

        var override = overrides.hasOwnProperty(node.id());
        if (override) {

            //overrides are allowed, but we need to check properties, this override potentially brings in or changes:
            this.validateProperties(node, v);
            return;
        }

        //otherwise reporting an illegal node:
        v.accept(createIssue(hl.IssueCode.ONLY_OVERRIDE_ALLOWED,
            "This node does not override any node from master api:" + node.id(), node));
    }

    private validateProperties(node:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) : void {
        node.attrs().forEach(attribute=>{

            //ignoring key properties as they are not overriding anything
            if (attribute.property().getAdapter(services.RAMLPropertyService).isKey()) {
                return;
            }

            //ignoring nodes, which are not coming from this node, but from is master chain
            if (attribute.parent() != node) {
                return;
            }

            //yes, that also happens!
            if (attribute.isElement()) {
                return;
            }

            //title allowed
            if (universeHelpers.isTitlePropertyName(attribute.name())) return;

            //description allowed
            if (universeHelpers.isDescriptionPropertyName(attribute.name())) return;

            //displayName allowed
            if (universeHelpers.isDisplayNamePropertyName(attribute.name())) return;

            //usage allowed
            if (universeHelpers.isUsagePropertyName(attribute.name())) return;

            //example allowed
            if (universeHelpers.isExampleProperty(attribute.property())) return;

            //masterRef allowed
            if (universeHelpers.isMasterRefProperty(attribute.property())) return;

            //annotations allowed
            if (universeHelpers.isAnnotationsProperty(attribute.property())) return;

            //uses allowed
            if (universeHelpers.isUsesProperty(attribute.property())) return;

            //reporting the error
            var message : string = "Property " + attribute.name() +
                " is not allowed to be overriden or added in overlays";
            acceptor.accept(createIssue(hl.IssueCode.ONLY_OVERRIDE_ALLOWED, message, attribute));
        })
    }

}

class RecurrentOverlayValidator implements  NodeValidator{
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){
        var z=new OverlayNodesValidator();
        z.validate(node,v);
        node.elements().forEach(x=>this.validate(x,v));
    }
}
class RecurrentValidateChildrenKeys implements NodeValidator{

    val(node:ll.ILowLevelASTNode,v:hl.ValidationAcceptor,p:hl.IParseResult){
        if (node.kind()==yaml.Kind.MAP||node.kind()==yaml.Kind.MAPPING){
            var ms:any={};
            node.children().forEach(x=>{
                var c= x.key();
                if (c) {
                    if (ms.hasOwnProperty(c)) {
                        var issue = createIssue(hl.IssueCode.KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT, "keys should be unique", p, false);
                        if (x.unit() == p.lowLevel().unit()) {
                            issue.start = x.keyStart();
                            issue.end = x.keyEnd();
                        }
                        v.accept(issue);
                    }
                    ms[c] = 1;
                }
            });
        }
        node.children().forEach(x=>{
            this.val(x,v,p);
        });
    }
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){
        this.val(node.lowLevel(), v,node);


    }
}
class ValidateChildrenKeys implements NodeValidator {

    validate(node:hl.IHighLevelNode,acceptor:hl.ValidationAcceptor){

        //validation is being performed at high level instead of low-level
        //to provide more meaningful and specific error messages

        this.validateChildElements(node, acceptor);


        var lowLevelChildren=node.lowLevel().children();
        var keyToLowLevelChildren : {[key:string] : ll.ILowLevelASTNode[]}
            = _.groupBy(lowLevelChildren.filter(x=>x.key()!=null),x=>x.key());




        this.validateChildAttributes(node, keyToLowLevelChildren, acceptor);

        this.validateUnrecognizedLowLevelChildren(node, keyToLowLevelChildren, acceptor);
    }

    validateChildElements(node:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) {

        //testing for child elements having equal keys

        var keyToElements:{[key:string]:hlimpl.ASTNodeImpl[]}={}

        var childElements=(<hlimpl.ASTNodeImpl>node).directChildren().filter(x=>x.isElement());
        childElements.forEach(childNode=> {
            var childElement = (<hlimpl.ASTNodeImpl>childNode);

            if ((<any>childElement)["_computed"]){
                return;
            }
            if (!childElement.name()){
                return //handling nodes with no key (documentation)
            }

            var elementKey=childElement.name()+childElement.property().nameId();

            if (keyToElements.hasOwnProperty(elementKey)){
                if (!childElement.isNamePatch()) {
                    keyToElements[elementKey].push(childElement);
                }
            }
            else{
                keyToElements[elementKey]=[childElement];
            }
        });

        Object.keys(keyToElements).forEach(key=>{
            var childElements = keyToElements[key];

            if (!childElements || childElements.length < 2) return;

            childElements.forEach(childElement=>{
                var message = "";

                var humanReadableName = getHumanReadableNodeName(childElement);
                if (humanReadableName) {

                    var capitalized = humanReadableName.charAt(0).toUpperCase() + humanReadableName.slice(1);

                    var message = capitalized + " '" + childElement.name() + "' already exists";

                } else {
                    message = childElement.name() + " already exists in this context";
                }

                var issue = createIssue(hl.IssueCode.KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT,
                    message, childElement);
                acceptor.accept(issue)
            })
        })

    }

    validateChildAttributes(node:hl.IHighLevelNode,
                            keyToLowLevelChildren : {[key:string] : ll.ILowLevelASTNode[]},
                            acceptor:hl.ValidationAcceptor) {



        var highLevelAttributes = this.getHighLevelAttributes(node);

        var nameToHighLevelAttributes=_.groupBy(highLevelAttributes,x=>x.name());

        var allowsAnyAndHasRequireds = this.allowsAnyAndHasRequireds(node);

        Object.keys(nameToHighLevelAttributes).forEach(attributeName=>{
            if(nameToHighLevelAttributes[attributeName].length < 2) {
                return;
            }

            var isUnknown = nameToHighLevelAttributes[attributeName][0].isUnknown();

            var isMultiValue = !isUnknown && nameToHighLevelAttributes[attributeName][0].property().isMultiValue();

            if(isMultiValue && (node.definition().isAssignableFrom(universes.Universe08.SecuritySchemeSettings.name) ||
                node.definition().isAssignableFrom(universes.Universe10.SecuritySchemeSettings.name))) {
                isMultiValue = keyToLowLevelChildren[attributeName] && keyToLowLevelChildren[attributeName].length === 1;
            }

            if ((isUnknown && allowsAnyAndHasRequireds) || !isMultiValue ||
                (isMultiValue && keyToLowLevelChildren[attributeName] != null && keyToLowLevelChildren[attributeName].length > 1)){
                //we blame even multivalue properties if they have duplicated low-level keys as YAML forbids this

                nameToHighLevelAttributes[attributeName].forEach(attribute=>{
                    var message = "property already used: '"+ (attribute.property() ? attribute.property().nameId() : attribute.name()) + "'";
                    var humanReadableParent = getHumanReadableNodeName(attribute.parent());
                    if (humanReadableParent) {
                        var capitalizedParent = humanReadableParent.charAt(0).toUpperCase() + humanReadableParent.slice(1);
                        message = capitalizedParent + " " + message;
                    }

                    var issue=createIssue(hl.IssueCode.PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,
                        message,attribute);

                    acceptor.accept(issue);
                })
            }
        })
    }

    validateUnrecognizedLowLevelChildren(node:hl.IHighLevelNode,
                                         keyToLowLevelChildren : {[key:string] : ll.ILowLevelASTNode[]},
                                         acceptor:hl.ValidationAcceptor) {

        var highLevelChildren=(<hlimpl.ASTNodeImpl>node).directChildren();
        var nameToHighLevelChildren=_.groupBy(highLevelChildren,x=>x.name());

        Object.keys(keyToLowLevelChildren).forEach(lowLevelChildKey=>{
            if (lowLevelChildKey) {
                if (keyToLowLevelChildren[lowLevelChildKey].length > 1&&!nameToHighLevelChildren[lowLevelChildKey]) {
                    if(node.definition().isAssignableFrom(universes.Universe10.ObjectTypeDeclaration.name)) {
                        return;
                    }

                    var message = "property already used: '" + lowLevelChildKey + "'";
                    var humanReadableNode = getHumanReadableNodeName(node);
                    if (humanReadableNode) {
                        var capitalizedParent = humanReadableNode.charAt(0).toUpperCase() + humanReadableNode.slice(1);
                        message = capitalizedParent + " " + message;
                    }

                    keyToLowLevelChildren[lowLevelChildKey].forEach(lowLevelChild=>{
                        var i = createLLIssue(hl.IssueCode.PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,
                            message, lowLevelChild,node);

                        i.start = lowLevelChild.keyStart();
                        i.end = lowLevelChild.keyEnd();

                        acceptor.accept(i)
                    })
                }
            }
        })
    }

    filterMultiValueAnnotations(node:hl.IHighLevelNode,
                                keyToLowLevelChildren : {[key:string] : ll.ILowLevelASTNode[]},
                                acceptor:hl.ValidationAcceptor) {
        var highLevelAttributes = this.getHighLevelAttributes(node);

        var computedAnnotationsMultiplValues=false;

        Object.keys(keyToLowLevelChildren).forEach(lowLevelChildKey=>{
            if (lowLevelChildKey.charAt(0) !== '(' || keyToLowLevelChildren[lowLevelChildKey].length < 2) { return }



        })
    }

    getHighLevelAttributes(node:hl.IHighLevelNode) : hl.IParseResult[] {

        var allowsAnyAndHasRequireds = this.allowsAnyAndHasRequireds(node);

        return (<hlimpl.ASTNodeImpl>node).directChildren().filter(x => x.isAttr() || allowsAnyAndHasRequireds);
    }

    allowsAnyAndHasRequireds(node:hl.IHighLevelNode) : boolean {
        var requireds = (<hlimpl.ASTNodeImpl>node).definition().requiredProperties();
        var hasRequireds = requireds && requireds.length > 0;

        var ramlService = (<hlimpl.ASTNodeImpl>node).definition().getAdapter(services.RAMLService);
        var isAllowAny = ramlService && ramlService.getAllowAny();

        var anyExceptRequireds = isAllowAny && hasRequireds;

        return anyExceptRequireds;
    }
}

/**
 * validates examples
 */
export class ExampleValidator implements PropertyValidator{

    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        //check if we expect to do strict validation

        var strictValidation=this.isStrict(node);
        if (!strictValidation){
            if (!settings.validateNotStrictExamples){
                return;
            }
        }

        var pObj=this.parseObject(node,cb,strictValidation);
        if (!pObj){
            return;
        }
        var schema=this.aquireSchema(node);
        if (schema){
            schema.validate(pObj,cb,strictValidation);
        }
    }

    private isExampleNode(node:hl.IAttribute) : boolean {

        return this.isSingleExampleNode(node) || this.isExampleNodeInMultipleDecl(node);
    }

    private isSingleExampleNode(node:hl.IAttribute) : boolean {
        return node.name() == universes.Universe10.TypeDeclaration.properties.example.name;
    }

    private isExampleNodeInMultipleDecl(node:hl.IAttribute) : boolean {
        var parent = node.parent()
        if (parent) {
            return universeHelpers.isExampleSpecType(parent.definition());
        }

        return false;
    }

    private findParentSchemaOrTypeAttribute(node:hl.IAttribute) : hl.IAttribute {
        var attribute = node.parent().attr(universes.Universe10.TypeDeclaration.properties.schema.name);
        if (attribute) {
            return attribute;
        }

        attribute = node.parent().attr(universes.Universe10.TypeDeclaration.properties.type.name);
        if (attribute) {
            return attribute;
        }

        if(!node.parent()) {
            return null;
        }

        attribute = node.parent().parent().attr(universes.Universe10.TypeDeclaration.properties.schema.name);
        if (attribute) {
            return attribute;
        }

        attribute = node.parent().parent().attr(universes.Universe10.TypeDeclaration.properties.type.name);
        if (attribute) {
            return attribute;
        }

        return null;
    }

    aquireSchema(node:hl.IAttribute):IShema{
        var sp=node.parent().definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name);

        if (this.isExampleNode(node)){

            var sampleRoot : hl.IParseResult = node;
            if (this.isExampleNodeInMultipleDecl(node)) {
                sampleRoot = node.parent();
            }

            if(sampleRoot.parent()) {
                if (sampleRoot.parent().definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name) && sampleRoot.parent().parent() === null) {
                    sp = false;
                } else if (sampleRoot.parent().property().nameId() == universes.Universe10.LibraryBase.properties.types.name) {
                    sp = false;
                }
                if (sampleRoot.parent().parent()) {
                    var ppc = sampleRoot.parent().parent().definition().key();
                    if (ppc == universes.Universe08.Method || ppc == universes.Universe10.Method) {
                        if (sampleRoot.parent().property().nameId() == universes.Universe10.HasNormalParameters.properties.queryParameters.name) {

                        }
                        else {
                            sp = true;
                        }
                    }
                    if (ppc == universes.Universe08.Response || ppc == universes.Universe10.Response) {
                        sp = true;
                    }
                }
            }
        }
        if (node.parent().definition().key()==universes.Universe08.BodyLike||sp){
            //FIXME MULTIPLE INHERITANCE
            var sa = this.findParentSchemaOrTypeAttribute(node);
            if (sa){
                var val=sa.value();
                if (val instanceof hlimpl.StructuredValue){
                    return null;
                }
                var strVal=(""+val).trim();
                var so:su.Schema=null
                if (strVal.charAt(0)=="{"){
                    try {
                        so = su.getJSONSchema(strVal, new contentprovider.ContentProvider(sa.lowLevel().unit()));
                    } catch (e){
                        return null;
                    }
                }
                if (strVal.charAt(0)=="<"){
                    try {
                         so = su.getXMLSchema(strVal);
                    } catch (e){
                        return null;
                    }
                }
                if(so){
                    return {
                        validate(pObje:any,cb:hl.ValidationAcceptor,strict:boolean){
                            try {
                                if (pObje.__$validated){
                                    return;
                                }
                                so.validateObject(pObje);
                            }catch(e){
                                if (e.message=="Cannot assign to read only property '__$validated' of object"){
                                    return;
                                }
                                if (e.message=="Object.keys called on non-object"){
                                    return;
                                }
                                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Example does not conform to schema:"+e.message,node,!strict));
                                return;
                            }
                            //validate using classical schema;
                        }
                    }
                }
                else{
                    if(strVal.length>0){
                        var nodeParent = node.parent();

                        var grandParent = nodeParent && nodeParent.parent();

                        var owner = nodeParent && nodeParent.definition() && nodeParent.definition().isAssignableFrom(universes.Universe10.ObjectTypeDeclaration.name) && nodeParent;

                        owner =  owner || (grandParent && grandParent.definition() && grandParent.definition().isAssignableFrom(universes.Universe10.ObjectTypeDeclaration.name) && grandParent);
                        if (owner) {

                                return this.typeValidator(owner, node);

                        }
                    }
                }
            }
        }
        return this.getSchemaFromModel(node);
    }
    getSchemaFromModel(node:hl.IAttribute):IShema{
        var p=node.parent();
        // if (node.property().nameId()==universes.Universe10.ExampleSpec.properties.content.name){
        //     p=p.parent();
        // }
        return this.typeValidator(p, node);

    }

    private typeValidator(p:hl.IHighLevelNode, node:hl.IAttribute) {
        const newVar = {
            validate(pObje:any, cb:hl.ValidationAcceptor, strict:boolean){

                var pt = p.parsedType();
                if (pt && !pt.isUnknown()) {
                    if (typeof pObje === "number" && pt.isString()) {
                        pObje = "" + pObje;
                    }
                    if (typeof pObje === "boolean" && pt.isString()) {
                        pObje = "" + pObje;
                    }
                    var validateObject = pt.validate(pObje, true);
                    if (!validateObject.isOk()) {
                        validateObject.getErrors().forEach(e=>cb.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, e.getMessage(), node, !strict)));
                    }
                }
            }
        };
        return newVar
    };

    toObject(h:hl.IAttribute,v:hlimpl.StructuredValue,cb:hl.ValidationAcceptor){
        var res= v.lowLevel().dumpToObject(true);
        this.testDublication(h,v.lowLevel(),cb);
        if (res["example"]){
            return res["example"];
        }
        if (res["content"]){
            return res["content"];
        }
    }
    testDublication(h:hl.IAttribute, v:ll.ILowLevelASTNode,cb:hl.ValidationAcceptor){
        var map={}
        v.children().forEach(x=>{
            if (x.key()) {
                if (map[x.key()]) {
                    cb.accept(createIssue(hl.IssueCode.KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT, "Keys should be unique", new hlimpl.BasicASTNode(x, h.parent())))
                }
                map[x.key()] = x;
            }
            this.testDublication(h,x,cb)
        })
    }
    parseObject(node:hl.IAttribute,cb:hl.ValidationAcceptor,strictValidation:boolean):any{
        var pObj:any=null;
        var vl=node.value();
        var mediaType=getMediaType(node);
        if (vl instanceof hlimpl.StructuredValue){
            //validate in context of type/schema
            pObj=this.toObject(node,<hlimpl.StructuredValue>vl,cb);
        }
        else{
            if (mediaType){
                if (isJson(mediaType)){
                    try{
                        pObj=JSON.parse(vl);
                    }catch (e){
                        cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Can not parse JSON:"+e.message,node,!strictValidation));
                        return;
                    }
                }
                if (isXML(mediaType)){
                    try {
                        pObj = xmlutil(vl);
                    }
                    catch (e){
                        cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Can not parse XML:"+e.message,node,!strictValidation));
                        return;
                    }
                }
            }
            else{
                try{
                    if (vl&&vl.length>0&&(vl.trim().charAt(0)=='['||vl.trim().charAt(0)=='{'||vl.trim().charAt(0)=='<')) {
                        pObj = JSON.parse(vl);
                    }
                    else {
                        if (vl=="true"){
                            return true;
                        }
                        else if (vl=="false"){
                            return false;
                        }
                        else{
                            var n=parseFloat(vl);
                            if (!isNaN(n)){
                                return n;
                            }
                        }
                        return vl;
                    }
                }catch (e){

                    if (vl.trim().indexOf("<")==0){
                        try {
                            pObj = xmlutil(vl);
                        }
                        catch (e){
                            cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Can not parse XML:"+e.message,node,!strictValidation));
                            return;
                        }
                    }
                    else {
                        //cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Can not parse JSON:" + e.message, node, !strictValidation));
                        return vl;
                    }
                }
            }
        }
        return pObj;
    }

    private isStrict(node) {
        var strictValidation:boolean = false;
        var strict = node.parent().attr("strict")
        if (strict) {
            if (strict.value() == 'true') {
                strictValidation = true;
            }
        }
        return strictValidation;
    }
}

var toReadableName = function (template:string, toLowerCase?:boolean, pluralize_?:boolean) {
    var templateName = changeCase.sentence(template);
    if(!toLowerCase) {
        templateName =  changeCase.ucFirst(templateName);
    }
    if(pluralize_) {
        templateName = pluralize.plural(templateName);
    }
    return templateName;
};
class OptionalPropertiesValidator implements NodeValidator, PropertyValidator {

    validate(node:hl.IParseResult, v:hl.ValidationAcceptor) {

        if(node.isAttr()){
            if(!node.optional()){
                return;
            }
            var attr:hl.IAttribute = <hl.IAttribute>node;
            var prop = attr.property();
            if(prop.isMultiValue()||prop.range().isArray()){
                return;
            }
            if(!(<def.Property>prop).isFromParentKey()) {
                var template = typeOfContainingTemplate(attr.parent());
                if (template) {
                    if (prop.isValueProperty()) {
                        var templateNamePlural = toReadableName(template,true,true);
                        var message = "Optional scalar properties are not allowed in "
                            + templateNamePlural + " and their descendants: " + attr.name() + "?";
                        var issue = createIssue(hl.IssueCode.INVALID_PROPERTY, message, attr, false);
                        v.accept(issue);
                    }
                }
            }
        }
        else if(node.isElement()){
            var aNode = <hlimpl.ASTNodeImpl>node;
            var prop = aNode.property();
            var allowsQuestion = aNode.allowsQuestion();
            if(!allowsQuestion){
                var propName = prop ? toReadableName(prop.nameId(),true,true) : 'API root';
                aNode.optionalProperties().forEach(x=>{
                    aNode.children().forEach(y=>{
                        var message = "Optional properties are not allowed in "
                            + propName + ": " + y.lowLevel().key() + "?";
                        var issue = createIssue(hl.IssueCode.INVALID_PROPERTY, message, node, false);
                        v.accept(issue);
                    });
                });
            }

            //if(node.optional()){
            //    if(universeHelpers.isIsProperty(prop)){
            //        var template = typeOfContainingTemplate(aNode.parent());
            //        if(template) {
            //            var templateNamePlural = toReadableName(template);
            //            var message = "Optional scalar properties are not allowed in "
            //                 + templateNamePlural + " and their descendants: " + prop.nameId() + "?";
            //            var issue = createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT, message, node, false);
            //            v.accept(issue);
            //        }
            //    }
            //}
        }


    }
}

class UriParametersValidator implements NodeValidator {

    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){

        var def = node.definition();

        var baseUriPropName = universes.Universe10.Api.properties.baseUri.name;
        var baseUriParamsPropName = universes.Universe10.Api.properties.baseUriParameters.name;
        var uriPropName = universes.Universe10.Resource.properties.relativeUri.name;
        var uriParamsPropName = universes.Universe10.ResourceBase.properties.uriParameters.name;

        if(universeHelpers.isApiSibling(def)){
            this.inspectParameters(node, v, baseUriPropName, baseUriParamsPropName);
        }
        else if (universeHelpers.isResourceType(def)){
            var rootNode = node.root();
            this.inspectParameters(node, v, baseUriPropName, baseUriParamsPropName,rootNode);
            this.inspectParameters(node, v, uriPropName, uriParamsPropName);
        }
        else if(universeHelpers.isResourceTypeType(def)){
            var rootNode = node.root();
            this.inspectParameters(node, v, baseUriPropName, baseUriParamsPropName,rootNode);
        }
    }

    private inspectParameters(node, v, uriPropName, paramsPropName,rootNode?) {
        rootNode = rootNode || node;
        var uriValue = '';
        var uriAttr = rootNode.attr(uriPropName);
        if (uriAttr) {
            uriValue = uriAttr.value();
            if (!uriValue) {
                uriValue = '';
            }
        }

        var paramElements = node.elementsOfKind(paramsPropName);
        paramElements.forEach(x=> {
            var nameAttr = x.attr(universes.Universe10.TypeDeclaration.properties.name.name);
            if (nameAttr) {
                var name = nameAttr.value();
                if (name != null) {
                    if (uriValue.indexOf('{' + name + '}') < 0) {
                        if(universeHelpers.isResourceTypeType(node.definition())){
                            if(name.indexOf('<<')>=0){
                                return;
                            }
                        }
                        var propNameReadable = pluralize.singular(changeCase.sentence(paramsPropName));
                        var message = changeCase.ucFirst(propNameReadable) + " unused";
                        var issue = createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, message, x, true);
                        v.accept(issue);
                    }
                }
            }
        });
    }
}

class TemplateCyclesDetector implements NodeValidator {

    validate(node:hl.IHighLevelNode, v:hl.ValidationAcceptor){

        var definition = node.definition();
        if(!(universeHelpers.isLibraryBaseSibling(definition)||universeHelpers.isApiType(definition))){
            return;
        }

        var resourceTypesProp = universes.Universe10.LibraryBase.properties.resourceTypes.name;
        var typeProp = universes.Universe10.ResourceBase.properties.type.name;
        var traitsProp = universes.Universe10.LibraryBase.properties.traits.name;
        var isProp = universes.Universe10.MethodBase.properties.is.name;

        var allResourceTypes = search.globalDeclarations(node)
            .filter(x=>universeHelpers.isResourceTypeType(x.definition()));

        var alltraits = search.globalDeclarations(node)
            .filter(x=>universeHelpers.isTraitType(x.definition()));

        this.checkCycles(allResourceTypes,typeProp,v);
        this.checkCycles(alltraits,isProp,v);
    }

    private checkCycles(templates:hl.IHighLevelNode[], propName:string, v:hl.ValidationAcceptor){

        var templatesMap:{[key:string]:hl.IHighLevelNode} = {}
        templates.forEach(x=>{
            var name = this.templateName(x);
            templatesMap[name] = x;
        });
        var templatesWithCycle:{[key:string]:boolean} = {}

        templates.forEach(template=>{

            var name = this.templateName(template);
            if(templatesWithCycle[name]){
                //skip checking templates which are already known to have cycles in definition;
                return;
            }
            this.findCyclesInDefinition(template, propName, templatesMap).forEach(cycle=> {
                //mark templates which have cycles in definitions
                cycle.forEach(x=>templatesWithCycle[x] = true);

                cycle = cycle.reverse();
                var message = toReadableName(template.definition().nameId())
                    + " definition contains cycle: " + cycle.join(" -> ");
                var issue = createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE, message, template, true);
                v.accept(issue);
            });
        });
    }

    private templateName(node) {
        var nameAttribute = node.attr(this.nameProperty);
        if(!nameAttribute){
            return null;
        }
        return nameAttribute.value();
    }

    private nameProperty = universes.Universe10.ResourceType.properties.name.name;

    private findCyclesInDefinition(
        node:hl.IHighLevelNode,
        propName:string,
        templatesMap:{[key:string]:hl.IHighLevelNode},
        occuredTemplates:{[key:string]:boolean}={}):string[][]{

        var name = this.templateName(node);
        if(occuredTemplates[name]){
            return [[ name ]];
        }
        var nextOccuredTemplates:{[key:string]:boolean}={};
        Object.keys(occuredTemplates).forEach(x=>nextOccuredTemplates[x]=occuredTemplates[x]);
        nextOccuredTemplates[name] = true;
        var occuredCycles:string[][] = [];

        var templatesRefs = node.attributes(propName);
        for(var i = 0 ; i < templatesRefs.length ; i++){
            var ref = templatesRefs[i];
            var val = ref.value();
            var refName = typeof(val)=='string' ? val : val.valueName();
            var template = templatesMap[refName];
            if(template!=null) {
                var newCycles = this.findCyclesInDefinition(
                    template, propName, templatesMap, nextOccuredTemplates);

                newCycles.forEach(x=>occuredCycles.push(x));
            }
        }

        occuredCycles.forEach(x=>x.push(name));
        return occuredCycles;
    }

}

export function isJson(s:string){
    return s.indexOf("json")!=-1;
}
export function isXML(s:string){
    return s.indexOf("xml")!=-1;
}
export function getMediaType(node:hl.IAttribute){
    var vl=getMediaType2(node);
    if (vl=='body'){
        var rootMedia=node.root().attr("mediaType");
        if (rootMedia){
            return rootMedia.value();
        }
        return null;
    }
    return vl;
}
function getMediaType2(node:hl.IAttribute){
    if (node.parent()) {
        var pc=node.parent().definition();
        if (pc.key()==universes.Universe08.BodyLike) {
            return node.parent().name();
        }
        if (node.parent().parent()) {
            var ppc=node.parent().parent().definition().key();
            if (ppc==universes.Universe08.Response||ppc==universes.Universe10.Response) {
                if (node.parent().property().nameId()==universes.Universe08.Response.properties.headers.name){
                    return null;
                }
                return node.parent().name();
            }
            if (ppc==universes.Universe08.Method||ppc==universes.Universe10.Method) {
                if (node.parent().property().nameId()==universes.Universe10.HasNormalParameters.properties.queryParameters.name
                    ||node.parent().property().nameId()==universes.Universe10.HasNormalParameters.properties.headers.name){
                    return null;
                }
                return node.parent().name();
            }
        }
    }
    return null;
}

var localError = function (node:hl.IParseResult, c, w, message,p:boolean,prop:hl.IProperty) {
    var contents = node.lowLevel().unit() && node.lowLevel().unit().contents();
    var contentLength = contents && contents.length;

    var st = node.lowLevel().start();
    var et = node.lowLevel().end();
    if (contentLength && contentLength >= et) {
        et = contentLength - 1;
    }

    if (node.lowLevel().key() && node.lowLevel().keyStart()) {
        var ks = node.lowLevel().keyStart();
        if (ks > 0) {
            st = ks;
        }
        var ke = node.lowLevel().keyEnd();
        if (ke > 0) {
            et = ke;
        }
    }
    if (et < st) {
        et = st + 1;
        //this happens for empty APIs, when we basically have nothing to parse
        if(node.isElement()) {
            var definition = (<hl.IHighLevelNode> node).definition();
            if (universeHelpers.isApiType(definition)) {
                st = contentLength == 0 ? 0: contentLength - 1;
                et = st;
            }
        }
    }
    if (prop&&!prop.getAdapter(services.RAMLPropertyService).isMerged()&&node.parent()==null){
        var nm= _.find(node.lowLevel().children(),x=>x.key()==prop.nameId());
        if (nm){
            var ks=nm.keyStart();
            var ke=nm.keyEnd();
            if (ks>0&&ke>ks){
                st=ks;
                et=ke;
            }

        }
    }

    return {
        code: c,
        isWarning: w,
        message: message,
        node: node,
        start: st,
        end: et,
        path: p?(node.lowLevel().unit() ? node.lowLevel().unit().path() : ""):null,
        extras:[],
        unit:node?node.lowLevel().unit():null
    }
};

var localLowLevelError = function (node:ll.ILowLevelASTNode, highLevelAnchor : hl.IParseResult,
                                   issueCode, isWarning, message,path:boolean) : hl.ValidationIssue {
    var contents = node.unit() && node.unit().contents();
    var contentLength = contents && contents.length;

    var st = node.start();
    var et = node.end();
    if (contentLength && contentLength >= et) {
        et = contentLength - 1;
    }

    if (node.key() && node.keyStart()) {
        var ks = node.keyStart();
        if (ks > 0) {
            st = ks;
        }
        var ke = node.keyEnd();
        if (ke > 0) {
            et = ke;
        }
    }


    return {
        code: issueCode,
        isWarning: isWarning,
        message: message,
        node: highLevelAnchor,
        start: st,
        end: et,
        path: path?(node.unit() ? node.unit().path() : ""):null,
        extras:[],
        unit:node?node.unit():null
    }
};

export function createIssue(c:hl.IssueCode, message:string,node:hl.IParseResult,w:boolean=false):hl.ValidationIssue{
    //console.log(node.name()+node.lowLevel().start()+":"+node.id());
    var original=null;
    var pr:hl.IProperty=null;
    if (node) {
        pr=node.property();

        if (node.lowLevel().unit() != node.root().lowLevel().unit()) {
            original=localError(node,c,w,message,true,pr);
            var v=node.lowLevel().unit();
            if (v) {
                //message = message + " " + v.path();
            }
            while(node.lowLevel().unit()!=node.root().lowLevel().unit()){
                pr=node.property();
                node=node.parent();
            }
        }
    }
    if (original){
        if (node.property()&&node.property().nameId()==universes.Universe10.FragmentDeclaration.properties.uses.name&&node.parent()!=null){
            pr=node.property();//FIXME there should be other cases
            node=node.parent();
        }
    }
    var error=localError(node, c, w, message,false,pr);
    if (original) {
        error.extras.push(original);
    }
    //console.log(error.start+":"+error.end)
    return error;
}

export function createLLIssue(issueCode:hl.IssueCode, message:string,node:ll.ILowLevelASTNode,
    rootCalculationAnchor: hl.IParseResult,isWarning:boolean=false):hl.ValidationIssue{
    var original=null;

    if (node) {

        if (rootCalculationAnchor.lowLevel().unit() != rootCalculationAnchor.root().lowLevel().unit()) {
            original=localLowLevelError(node,rootCalculationAnchor,issueCode,isWarning,message,true);
            var v=rootCalculationAnchor.lowLevel().unit();
            if (v) {
                message = message + " " + v.path();
            }
            while(rootCalculationAnchor.lowLevel().unit()!=rootCalculationAnchor.root().lowLevel().unit()){
                rootCalculationAnchor=rootCalculationAnchor.parent();
            }
        }
    }
    if (original){
        if (rootCalculationAnchor.property()&&rootCalculationAnchor.property().nameId()
            ==universes.Universe10.FragmentDeclaration.properties.uses.name&&rootCalculationAnchor.parent()!=null){
            rootCalculationAnchor=rootCalculationAnchor.parent();
        }
    }
    var error=localLowLevelError(node, rootCalculationAnchor, issueCode, isWarning, message,false);
    if (original) {
        error.extras.push(original);
    }
    //console.log(error.start+":"+error.end)
    return error;
}
export function validateResponseString(v:string):any{
    if (v.length!=3){
        return new Error("Status code should be 3 digits number with optional 'x' as wildcards");
    }
    for (var i=0;i<v.length;i++){
        var c=v[i];
        if (!_.find(['0','1','2','3','4','5','6','7','8','9','x','X'],x=>x==c)){
            return new Error("Status code should be 3 digits number with optional 'x' as wildcards");
        }
    }
    return null;
}