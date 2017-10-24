import jsyaml= require ("../jsyaml/jsyaml2lowLevel")
import json= require ("../jsyaml/json2lowLevel")
var stringify=require("json-stable-stringify")
import proxy= require ("../ast.core/LowLevelASTProxy")
import hl= require ("../highLevelAST")
import ll= require ("../lowLevelAST")

import _=require("underscore")
import yaml=require("yaml-ast-parser")
import def=require( "raml-definition-system");
import high=require("../highLevelAST");
type Error=yaml.YAMLException
import hlimpl=require("../highLevelImpl")

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
import expander=require("./expander")
import expanderLL=require("./expanderLL")
import builder = require('./builder')
import search = require("../../search/search-interface")
import rtypes=def.rt;
import util=require("../../util/textutil")

import contentprovider = require('../../util/contentprovider');
import resourceRegistry = require('../jsyaml/resourceRegistry');

var su = def.getSchemaUtils();

var mediaTypeParser=require("media-typer")

import xmlutil = require('../../util/xmlutil')
import {error} from "util";
import {LowLevelWrapperForTypeSystem} from "../highLevelImpl";
import {find} from "../../util/index";
import {Operation, MethodBase, ResourceBase} from "../artifacts/raml10parserapi";
var changeCase = require('change-case');
var pluralize = require('pluralize');

let messageRegistry = require("../../../resources/errorMessages");

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
        (<def.Property>pr).getContextRequirements().forEach(x=> {
            if (!(<hlimpl.BasicASTNode><any>n).checkContextValue(x.name, x.value,x.value)) {
                v.accept(createIssue1(messageRegistry.CONTEXT_REQUIREMENT, { name: x.name, value: x.value, propName: pr.nameId()}, n));
            }
        });
    }
    return pr;
};

function lintNode(astNode:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) {
    var fsEnabled;

    try {
        fsEnabled = astNode.lowLevel().unit().project().fsEnabled();
    } catch(exception) {
        fsEnabled = true;
    }

    if(!fsEnabled) {
        return;
    }

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
        this.acceptor.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,{iValue:message},w.highLevel()));
    }
    errorOnProperty(w:core.BasicNode,property: string,message:string){
        var pr=w.highLevel().attr(property);
        this.acceptor.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,{iValue:message},pr));
    }
    warningOnProperty(w:core.BasicNode,property: string,message:string){
        var pr=w.highLevel().attr(property);
        this.acceptor.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,{iValue:message},pr,true));
    }

    warning(w:core.BasicNode,message:string){
        this.acceptor.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,{iValue:message},w.highLevel(),true));
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
        if (def.NodeClass.isInstance(d)) {
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
function isDefaultValueProp(d:hl.IProperty){
    if (!checkIfDomainIsUserDefined(d)){
        return false;
    }
    return (d.nameId()==universes.Universe10.TypeDeclaration.properties.default.name);
}
function isExampleProp(d:hl.IProperty){
    if (!checkIfDomainIsUserDefined(d)){
        return false;
    }
    return (d.nameId()==universes.Universe10.TypeDeclaration.properties.example.name);
}
function checkIfDomainIsUserDefined(d:hl.IProperty){
    if (!d.domain()){
        return false;
    }
    if (d.domain().getAdapter(services.RAMLService).isUserDefined()){
        return false;
    }
    return true;
}
function isSecuredBy(d:hl.IProperty){
    if (!checkIfDomainIsUserDefined(d)){
        return false;
    }
    return (d.nameId()==universes.Universe08.MethodBase.properties.securedBy.name);
}
/**
 * For descendants of templates returns template type. Returns null for all other nodes.
 */
export function typeOfContainingTemplate(h:hl.IParseResult):def.ITypeDefinition{
    if(!h.isElement()){
        h = h.parent();
    }
    let declRoot = h && h.asElement();
    while (declRoot){
        if (declRoot.definition().getAdapter(services.RAMLService).isInlinedTemplates()){
            return declRoot.definition();
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
    if (parentNode && def.UserDefinedClass.isInstance(parentDef)) {
        var parentProperty = parentNode.property();
        if (universeHelpers.isIsProperty(parentProperty)
            || universeHelpers.isTypeProperty(parentProperty)) {
            var paramName = node.name();
            if (RESERVED_TEMPLATE_PARAMETERS[paramName] != null) {
                //Handling reserved parameter names;
                issue = createIssue1(messageRegistry.INVALID_PARAMETER_NAME, { paramName : paramName}, node);
            }
            else {
                let colonIndex = paramName.indexOf(":");
                if(hlimpl.BasicASTNode.isInstance(node)&&colonIndex>=0){
                    let correctMapping = `${paramName.substring(0,colonIndex+1)} ${paramName.substring(colonIndex+1)}`;
                    issue = createIssue1(messageRegistry.UNUSED_PARAMETER_MISSING_SEPARATING_SPACE, {
                        paramName : paramName,
                        correctMapping: correctMapping}, node, true);
                }
                else {
                    issue = createIssue1(messageRegistry.UNUSED_PARAMETER, {paramName: paramName}, node, true);
                }
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
                    issue = createIssue1(messageRegistry.INVALID_PROPERTY_OWNER_TYPE,
                        {propName:propName,namesStr:namesStr}, node);
                }
            }
        }
    }

    return issue;
};

function validateTopLevelNodeSkippingChildren(node : hl.IParseResult,v:hl.ValidationAcceptor) {
    // if (!node.parent()){
    //     try {
    //         validateIncludes(<hlimpl.BasicASTNode>node, v);
    //     } finally {
    //         cleanupIncludesFlag(<hlimpl.BasicASTNode>node, v);
    //     }
    // }
    if (node.isElement()){
        if((<hlimpl.ASTNodeImpl>node).invalidSequence){
            var pName = node.property().nameId();
            pName = changeCase.sentenceCase(pluralize.singular(pName));
            v.acceptUnique(createLLIssue1(
                messageRegistry.SEQUENCE_NOT_ALLOWED_10,{propName:pName}
                ,node.lowLevel().parent().parent(),node));
        }

        var highLevelNode = node.asElement();

        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.LibraryBase.name)){
            var hasSchemas:boolean=false;
            var hasTypes:boolean=false;
            var vv:ll.ILowLevelASTNode;
            highLevelNode.lowLevel().children().forEach(x=>{
                if (x.key()=="schemas"){
                    hasSchemas=true;
                    vv=x;
                }
                if (x.key()=="types"){
                    hasTypes=true;
                }
            })
            if (hasSchemas&&hasTypes){
                v.accept(localLowLevelError(vv,highLevelNode,hl.IssueCode.ILLEGAL_PROPERTY_VALUE,false,"types and schemas are mutually exclusive",false));
            }
        }

        var hasRequireds = highLevelNode.definition().requiredProperties() && highLevelNode.definition().requiredProperties().length > 0;

        validateBasicFlat(<hlimpl.BasicASTNode>node,v);

        //new UriParametersValidator().validate(highLevelNode,v);

        new CompositeNodeValidator().validate(highLevelNode,v);
        new TemplateCyclesDetector().validate(highLevelNode,v);
    }
    else{
        validateBasicFlat(<hlimpl.BasicASTNode>node,v);
    }

    new OptionalPropertiesValidator().validate(node,v);
}

/**
 * Performs basic validation of a node on a single level, without proceeding to the node high-level children validation.
 * @param node
 * @param v
 * @param requiredOnly
 * @returns {boolean} - whether to continue validation after this one is finished, or there is no point for further validation.
 */
export function validateBasicFlat(node:hlimpl.BasicASTNode,v:hl.ValidationAcceptor, requiredOnly: boolean = false)
    : boolean {

    var parentNode = node.parent();
    var llValue = node.lowLevel().value();
    if (node.lowLevel()) {
        if (node.lowLevel().keyKind()==yaml.Kind.MAP){

            v.accept(createIssue1(messageRegistry.NODE_KEY_IS_A_MAP, {}, node));

        }
        if (node.lowLevel().keyKind()==yaml.Kind.SEQ){
            if (llValue==null){
                var isPattern=false;
                if (node.isElement()){
                    if (node.asElement().definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
                        isPattern=true;
                    }
                }
                if (!isPattern) {
                    v.accept(createIssue1(messageRegistry.NODE_KEY_IS_A_SEQUENCE, {}, node));
                }
            }
        }
        if (parentNode==null) {
            var cLength = node.lowLevel().unit().contents().length;
            node.lowLevel().errors().forEach(x=> {
                var ps= (<any>x).mark?(<any>x).mark.position:0;
                let pe = (ps >= cLength) ? ps : (ps + 1);
                if((<any>x).mark && (<any>x).mark.toLineEnd){
                    let content = (<any>x).mark.buffer;
                    let ind = content.indexOf("\n",ps);
                    if(ind<0){
                        ind = content.length;
                    }
                    if(ind<content.length && content.charAt(ind)=="\r"){
                        ind--;
                    }
                    pe = ind;
                }
                var em = {
                    code: "YAML_ERROR",//hl.IssueCode.YAML_ERROR,
                    message: x.message,
                    node: null,
                    start: ps,
                    end: pe,
                    isWarning: (<any>x).isWarning,
                    path: node.lowLevel().unit() == node.root().lowLevel().unit() ? null : node.lowLevel().unit().path(),
                    unit: node.lowLevel().unit()
                }
                v.accept(em)
            });
        }
    }

    if (node.isUnknown()){
        if ((typeof node.name() === "string") && node.name().indexOf("<<") >= 0){
            if (typeOfContainingTemplate(parentNode)!=null){
                new TraitVariablesValidator().validateName(node,v);
                return false;
            }
        }
        if (node.needSequence){
            v.accept(createIssue1(messageRegistry.SEQUENCE_REQUIRED, {name:node.name()}, node));
        }
        if (node.needMap){
            if(node.knownProperty){
                v.accept(createIssue1(messageRegistry.PROPERTY_MUST_BE_A_MAP_10, {propName : node.knownProperty.nameId()}, node));
            }
            else{
                v.accept(createIssue1(messageRegistry.MAP_REQUIRED, {}, node));
            }
            return false;
        }
        if (node.unresolvedRef){
            v.accept(createIssue1(messageRegistry.UNRESOLVED_REFERENCE, { ref : llValue}, node));

        }
        if (node.knownProperty){
            //if (!node.lowLevel().)
            if (node.lowLevel().includeErrors().length==0) {
                if(typeOfContainingTemplate(parentNode)
                    &&util.startsWith(llValue,"<<")
                    &&util.endsWith(llValue,">>")){
                    return false;
                }
                if (node.name()=="body"&&node.computedValue("mediaType")){
                    return false;
                }
                if (node.lowLevel().value()!='~') {
                    if(!checkIfIncludeTagIsMissing(node,v,messageRegistry.SCALAR_PROHIBITED.code,false)) {
                        v.accept(createIssue1(messageRegistry.SCALAR_PROHIBITED,
                            {propName: node.name()}, node));
                    }
                }
            }
        }
        else {
            let i0 = (typeof node.name() === "string") ? node.name().indexOf("<<") : -1;
            if(i0>0 && typeOfContainingTemplate(parentNode)
                && node.name().indexOf(">>",i0)){
                return false;
            }
            var issue = restrictUnknownNodeError(node);
            if(!issue){
                issue = createUnknownNodeIssue(node);
            }
            v.accept(issue);
        }
    }

    if(node.markCh()&&!node.allowRecursive()){
        if (!node.property()){
            return false;
        }
        v.accept(createIssue1(messageRegistry.RECURSIVE_DEFINITION, {name:node.name()}, node));
        return false;
    }

    if((<any>node).definition && (<any>node).definition().isAssignableFrom(universes.Universe10.Operation.name)) {
        var searchResult: QueryDeclarationsSearchResult = queryDeclarationsSearch((<any>node).wrapperNode());

        var queryStringNode = searchResult.queryStringComesFrom;
        var queryParamsNode = searchResult.queryParamsComesFrom;

        if(queryStringNode && queryParamsNode) {
            v.accept(createIssueForQueryDeclarations(queryStringNode, node, false));
            v.accept(createIssueForQueryDeclarations(queryParamsNode, node, true));
        }
    }

    var isOverlay = (<any>node).definition && (<any>node).definition() &&
        ((<any>node).definition().key() === universes.Universe10.Overlay ||
        (<any>node).definition().key() === universes.Universe10.Extension)

    if (isOverlay) {
        validateMasterFlat(node, v, requiredOnly);
    }

    return true;
}

function createUnknownNodeIssue(node:hlimpl.BasicASTNode):hl.ValidationIssue {
    let parentNode = node.parent();
    let issue:hl.ValidationIssue;
    if (parentNode) {
        let d = parentNode.definition();
        if(d) {
            let propName = node.name();
            let typeName = d.nameId();
            if(expanderLL.isPossibleMethodName(propName)){
                issue = createIssue1(
                    messageRegistry.INVALID_METHOD_USAGE, { typeName: typeName }, node);
            }
            else if (propName.charAt(0) == "/") {
                issue = createIssue1(
                    messageRegistry.INVALID_SUBRESOURCE_USAGE, { typeName: typeName }, node);
            }
            else {
                let u = d && d.universe();
                if (u) {
                    let propExists = PropertyNamesRegistry.getInstance().hasProperty(propName);
                    if (propExists) {
                        let uVersion: string
                        if (u.version() == "RAML10") {
                            uVersion = "RAML 1.0";
                        }
                        else if (u.version() == "RAML08") {
                            uVersion = "RAML 0.8";
                        }
                        if (uVersion) {
                            issue = createIssue1(
                                messageRegistry.INVALID_PROPERTY_USAGE, {
                                    propName: propName,
                                    typeName: typeName,
                                    ramlVersion: uVersion
                                }, node);
                        }
                    }
                }
            }
        }
    }
    if (!issue) {
        issue = createIssue1(messageRegistry.UNKNOWN_NODE, {name: node.name()}, node);
    }
    return issue;
};

function createIssueForQueryDeclarations(node: ll.ILowLevelASTNode | hl.IParseResult, parentNode: hl.IParseResult, isQueryParamsDeclaration: boolean): hl.ValidationIssue {
    var asLowLevel:ll.ILowLevelASTNode = <ll.ILowLevelASTNode>node;
    var asHighLevel:hl.IParseResult = <hl.IParseResult>node;

    var propertyName = isQueryParamsDeclaration ? universes.Universe10.Operation.properties.queryString.name : universes.Universe10.Operation.properties.queryParameters.name;

    if(asLowLevel.unit) {
        return createLLIssue1(messageRegistry.QUERY_STRING_AND_QUERY_PARAMETERS_ARE_MUTUALLY_EXCLUSIVE, {
            propName: propertyName
        }, asLowLevel, parentNode);
    } else {
        return createIssue1(messageRegistry.QUERY_STRING_AND_QUERY_PARAMETERS_ARE_MUTUALLY_EXCLUSIVE, {
            propName: propertyName
        }, asHighLevel);
    }
}

class QueryDeclarationsSearchResult {
    queryParamsComesFrom: ll.ILowLevelASTNode | hl.IParseResult;
    queryStringComesFrom: ll.ILowLevelASTNode | hl.IParseResult;
}

function queryDeclarationsSearch(operation: MethodBase): QueryDeclarationsSearchResult {
    return {
        queryParamsComesFrom: queryDeclarationSearch(operation, true),
        queryStringComesFrom: queryDeclarationSearch(operation, false)
    }
}

function queryDeclarationSearch(
    operation: MethodBase,
    isParamsSearch: boolean,
    checkParent=true,
    passed:{[key:string]:boolean} = {}): ll.ILowLevelASTNode | hl.IParseResult {
    if(!operation) {
        return null;
    }
    if((<any>operation).name){
        let name = (<any>operation).name();
        if(passed[name]){
            return;
        }
        passed[name] = true;
    }

    var declaredHere = queryDeclarationFromMethodBase(operation, isParamsSearch);

    if(declaredHere) {
        return declaredHere;
    }

    var traitRefs = (operation.is && operation.is()) || [];

    var declaredIn = _.find(traitRefs, traitRef => queryDeclarationSearch(
        traitRef.trait(), isParamsSearch, checkParent, passed));

    if(declaredIn) {
        return declaredIn.highLevel();
    }

    if(checkParent) {
        var resourceBase: ResourceBase = (<any>operation).parentResource && (<any>operation).parentResource();

        var found = resourceBase && queryDeclarationSearchInResourceBase(
            resourceBase, isParamsSearch, passed);

        if (found) {
            return found;
        }

        resourceBase = (<any>operation).parent && (<any>operation).parent();

        if (resourceBase && resourceBase.highLevel().definition().isAssignableFrom(universes.Universe10.ResourceBase.name)) {
            return queryDeclarationSearchInResourceBase(resourceBase, isParamsSearch, passed);
        }
    }

    return null;
}

function queryDeclarationSearchInResourceBase(
    resource: ResourceBase,
    isParamsSearch: boolean,
    passedTraits:{[key:string]:boolean} = {},
    passed:{[key:string]:boolean} = {}): ll.ILowLevelASTNode | hl.IParseResult {

    if((<any>resource).name){
        let name = (<any>resource).name();
        if(passed[name]){
            return;
        }
        passed[name] = true;
    }

    var traitRefs = resource.is();

    var declaredIn = _.find(traitRefs, traitRef => queryDeclarationSearch(
        traitRef.trait(), isParamsSearch, false, passedTraits));

    if(declaredIn) {
        return declaredIn.highLevel();
    }

    var resourceTypeRef = resource.type();

    var resourceType = resourceTypeRef && resourceTypeRef.resourceType();

    var foundInType = resourceType && queryDeclarationSearchInResourceBase(
        resourceType, isParamsSearch, passedTraits, passed);

    if(foundInType) {
        return resourceTypeRef.highLevel();
    }
}

function queryDeclarationFromMethodBase(operation: MethodBase, isParamsSearch: boolean): ll.ILowLevelASTNode | hl.IParseResult {
    if(isParamsSearch) {
        return queryParametersDeclarationFromMehodBase(operation);
    } else {
        return queryStringDeclarationFromMehodBase(operation);
    }
}

function queryParametersDeclarationFromMehodBase(operation: MethodBase): ll.ILowLevelASTNode | hl.IParseResult {
    var node = operation.highLevel();

    return (<any>node).lowLevel && <ll.ILowLevelASTNode>_.find((<any>node).lowLevel().children(), child => (<any>child).key && (<any>child).key() === universes.Universe10.Operation.properties.queryParameters.name);
}

function queryStringDeclarationFromMehodBase(operation: MethodBase): ll.ILowLevelASTNode | hl.IParseResult {
    var node = operation.highLevel();

    var highLevelResult = (<any>node).element(universes.Universe10.Operation.properties.queryString.name);

    return highLevelResult;
}

/**
 * Validates node master, but only on a single level, without recurring to high-level children.
 * @param node
 * @param acceptor
 */
function validateMasterFlat(node:hlimpl.BasicASTNode,acceptor:hl.ValidationAcceptor, requiredOnly: boolean = false) {

    if (node.parent()) return;

    var nodeAsElement = node.asElement();
    if (!nodeAsElement) return;

    if(!nodeAsElement.isAuxilary()) return;

    var master = nodeAsElement.getMaster();
    if (!master) return;

    validateTopLevelNodeSkippingChildren(master, acceptor);
}

export function validateBasic(node:hlimpl.BasicASTNode,v:hl.ValidationAcceptor, requiredOnly: boolean = false){

    if(!validateBasicFlat(node, v, requiredOnly)) {
        return;
    }

    try {
        var isOverlay = (<any>node).definition && (<any>node).definition() &&
            ((<any>node).definition().key() === universes.Universe10.Overlay ||
            (<any>node).definition().key() === universes.Universe10.Extension)

        var children = isOverlay ? node.children() : node.directChildren();

        children.filter(child => {
            return !requiredOnly || (child.property && child.property() && child.property().isRequired());
        }).forEach(x => {
            if (x && (<any>x).errorMessage){
                var em = (<any>x).errorMessage;
                v.accept(createIssue1(em.entry, em.parameters, x.name()?x:node));
                return;
            }

            x.validate(v)
        });
    }finally{
        node.unmarkCh();
    }
}

var createLibraryIssue = function (attr:hl.IAttribute, hlNode:hl.IHighLevelNode) {
    var start = hlNode.lowLevel().start();
    var usesNodes:hl.IHighLevelNode[] = [];
    if(start<0){
        var seq = hlNode.attr("key").value().split(".");
        var nodes:hl.IHighLevelNode[] = [];
        var parent = hlNode.parent();
        for(var segment of seq){
            var n = _.find(parent.elementsOfKind("uses"),x=>x.attr("key")&&x.attr("key").value()==segment);
            nodes.push(n);
            parent = n.lowLevel().unit().resolve(n.attr("value").value()).highLevel().asElement();
        }
        var issues = nodes.map(x=>createIssue1(messageRegistry.ISSUES_IN_THE_LIBRARY,
            {value: x.attr("value").value()}, x, true));
        issues = issues.reverse();
        for(var i = 0 ; i < issues.length-1 ; i++){
            issues[i].extras.push(issues[i+1]);
        }
        return issues[0];
    }
    else{
        usesNodes.push(hlNode);
    }
    return createIssue1(messageRegistry.ISSUES_IN_THE_LIBRARY,
        { value : attr.value()}, hlNode, true);
};
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
        if((<hlimpl.ASTNodeImpl>node).invalidSequence){
            var pName = node.property().nameId();
            v.acceptUnique(createLLIssue1(messageRegistry.SEQUENCE_NOT_ALLOWED_10,
                { propName: pName },node.lowLevel().parent().parent(),node,false));
        }

        var highLevelNode = node.asElement();
        if(universeHelpers.isExampleSpecType(highLevelNode.definition())){
            var hlChildren = highLevelNode.children();
            if(hlChildren.length==0){
                validateBasic(<hlimpl.BasicASTNode>node,v, true);
                return;
            }
            var content = hlChildren.filter(x=>{
                var propName = x.lowLevel().key();
                if(!propName){
                    return true;
                }
                if(propName.charAt(0)=="("&&propName.charAt(propName.length-1)==")"){
                    return false;
                }
                return highLevelNode.definition().property(propName)==null;
            });
            if(content.length>0){
                validateBasic(<hlimpl.BasicASTNode>node,v, true);
                return;
            }
        }

        if (highLevelNode.definition().isAnnotationType()||highLevelNode.property()&&highLevelNode.property().nameId()=="annotations"){
            new FixedFacetsValidator().validate(highLevelNode,v);
            return;
        }
        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.UsesDeclaration.name)){
            var vn=highLevelNode.attr(universes.Universe10.UsesDeclaration.properties.value.name);
            var libPath = vn && vn.value();
            if (libPath!=null && typeof libPath == "string"){
                var rs=highLevelNode.lowLevel().unit().resolve(libPath);
                if (!rs || rs.contents() === null){
                    v.accept(createIssue1(messageRegistry.INVALID_LIBRARY_PATH,
                        {path:libPath},highLevelNode,false));
                } else if(!resourceRegistry.isWaitingFor(libPath)){
                    var issues:hl.ValidationIssue[]=[];

                    if(rs.contents().trim().length === 0) {
                        v.accept(createIssue1(messageRegistry.EMPTY_FILE,
                            {path:libPath},highLevelNode,false));
                        return;
                    }

                    let hlNode = rs.highLevel().asElement();
                    let toValidate = new hlimpl.ASTNodeImpl(
                        hlNode.lowLevel(),hlNode.parent(),hlNode.definition(),hlNode.property());
                    toValidate.setValueSource(highLevelNode);
                    toValidate.validate(
                        hlimpl.createBasicValidationAcceptor(issues, toValidate));
                    if (issues.length>0){
                        var brand=createLibraryIssue(vn, highLevelNode);
                        issues.forEach(x=> {
                            x.unit = x.unit == null ? rs : x.unit;
                            if (!x.path) {
                                x.path = rs.absolutePath();
                            }
                        });
                        for(var issue of issues) {
                            var _issue = issue;
                            while(_issue.extras && _issue.extras.length>0){
                                _issue = _issue.extras[0];
                            }

                            if(_issue != brand) {
                                if(!_issue.extras) {
                                    _issue.extras = [];
                                }

                                _issue.extras.push(brand);
                            }
                            v.accept(issue);
                        }
                    }
                }
            }
        }
        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){
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
            // if (highLevelNode.parent()&&!highLevelNode.parent().parent()){
            //     if (rtypes.builtInTypes().get(highLevelNode.name())){
            //         v.accept(createIssue(hl.IssueCode.ILLEGAL_PROPERTY_VALUE,
            //              `redefining a built in type: '${highLevelNode.name()}'`,highLevelNode));
            //     }
            // }

            new RecurrentOverlayValidator().validate(highLevelNode, v);
            new RecurrentValidateChildrenKeys().validate(highLevelNode, v);
            new NodeSpecificValidator().validate(highLevelNode,v);
            new TypeDeclarationValidator().validate(highLevelNode,v);
            return;
        }
        if (highLevelNode.definition().isAssignableFrom(universes.Universe10.LibraryBase.name)){
            var hasSchemas:boolean=false;
            var hasTypes:boolean=false;
            var vv:ll.ILowLevelASTNode;
            highLevelNode.lowLevel().children().forEach(x=>{
                if (x.key()=="schemas"){
                    hasSchemas=true;
                    vv=x;
                }
                if (x.key()=="types"){
                    hasTypes=true;
                }
            })
            if (hasSchemas&&hasTypes){
                v.accept(createLLIssue1(messageRegistry.TYPES_AND_SCHEMAS_ARE_EXCLUSIVE,{},vv,highLevelNode));
            }
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
    if(!node.lowLevel()) {
        return;
    }

    var val=<any>node.lowLevel().actual();
    delete val._inc;
    node.children().forEach(x=>cleanupIncludesFlag(x,v));

}
function validateIncludes(node:hl.IParseResult,v:hl.ValidationAcceptor) {
    var llNode = node.lowLevel();

    if(!llNode) {
        return;
    }

    var val=<any>llNode.actual();

    if (val._inc){
        return;
    }
    if (node.isElement()){
        let vl=node.name();
        if(typeOfContainingTemplate(node)!=null){
            vl = vl.replace(/<<[^<>]*>>/g,'');
        }
        if (typeof vl=="string") {
            if (vl != null && vl.indexOf(" ") != -1) {
                v.accept(createIssue1(messageRegistry.SPACES_IN_KEY, { value : vl}, node,true));
            }
        }
    }
    val._inc=true;
    if (llNode) {

        llNode.includeErrors().forEach(x=> {
            var isWarn=false;
            if (node.lowLevel().hasInnerIncludeError()){
                isWarn=true;
            }
            var em = createIssue1(messageRegistry.INCLUDE_ERROR, { msg: x }, node,isWarn);
            v.accept(em)
        });
        var includePath = llNode.includePath();
        if(includePath!=null && !path.isAbsolute(includePath) && !ll.isWebPath(includePath)){
            var unitPath = llNode.unit().absolutePath();
            var exceeding = calculateExceeding(path.dirname(unitPath),includePath);
            if(exceeding>0){
                var em = createIssue1(messageRegistry.PATH_EXCEEDS_ROOT, {}, node,true);
                v.accept(em)
            }
        }
    }
    node.children().forEach(x=>validateIncludes(x,v));
    if(node.children().length==0&&llNode!=null){
        llNode.children().forEach(x=>validateIncludesLL(x,v,node));
    }

}

function validateIncludesLL(llNode:ll.ILowLevelASTNode,v:hl.ValidationAcceptor,node:hl.IParseResult) {
    llNode.includeErrors().forEach(x=> {
        var isWarn=false;
        if (llNode.hasInnerIncludeError()){
            isWarn=true;
        }
        var em = createLLIssue1(messageRegistry.INCLUDE_ERROR,{msg:x}, llNode,node,isWarn);
        v.accept(em)
    });
    var includePath = llNode.includePath();
    if(includePath!=null && !path.isAbsolute(includePath) && !ll.isWebPath(includePath)){
        var unitPath = llNode.unit().absolutePath();
        var exceeding = calculateExceeding(path.dirname(unitPath),includePath);
        if(exceeding>0){
            var em = createLLIssue1(messageRegistry.PATH_EXCEEDS_ROOT,{},llNode,node,true);
            v.accept(em)
        }
    }
    llNode.children().forEach(x=>validateIncludesLL(x,v,node));
}

var actualSegments = function (rootPath:string) {
    rootPath = rootPath.replace(/\\/g, "/").trim();
    if(rootPath.length>1 && rootPath.charAt(1)==":" && /^win/.test(process.platform)){
        rootPath = rootPath.substring(2);
    }
    var segments = rootPath.split("/");
    if (segments[0].length == 0) {
        segments = segments.slice(1);
    }
    if (segments.length > 0 && segments[segments.length - 1].length == 0) {
        segments = segments.slice(0, segments.length - 1);
    }
    return segments;
};
function calculateExceeding(rootPath:string,relativePath:string){

    var rootSegments = actualSegments(rootPath);
    var relativeSegments = actualSegments(relativePath);

    var count = rootSegments.length;

    var result = 0;
    for(var segment of relativeSegments){
        if(segment==".."){
            count--;
            if(count<0){
                result = Math.min(count,result);
            }
        }
        else{
            count++;
        }
    }
    return -1 * result;
}
var validateRegexp = function (cleanedValue:string, v:hl.ValidationAcceptor, node:hl.IParseResult) {
    try {
        new RegExp(cleanedValue)
    } catch (Error) {
        v.accept(createIssue1(messageRegistry.ILLEGAL_PATTERN, {value : cleanedValue}, node))
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

    hasTraitOrResourceTypeParent(node: hl.IParseResult) : boolean {
        var parent = node.parent();
        while(parent != null) {
            if (!parent.definition()) return false;
            if (universeHelpers.isTraitType(parent.definition())
                || universeHelpers.isResourceTypeType(parent.definition())) {
                return true;
            }

            parent = parent.parent();
        }

        return false;
    }

    check(str:string,start:number,node:hl.IParseResult,acceptor:hl.ValidationAcceptor):hl.ValidationIssue[]{

        if (!this.hasTraitOrResourceTypeParent(node)) return [];

        var errors:hl.ValidationIssue[] = [];
        var prev = 0;
        for (var i = str.indexOf('<<'); i >= 0; i = str.indexOf('<<', prev)) {
            var i0 = i;
            i += '<<'.length;
            prev = str.indexOf('>>', i);
            var paramOccurence = str.substring(i, prev);

            var ind = paramOccurence.indexOf('|');
            var paramName = ind >= 0 ? paramOccurence.substring(0, ind) : paramOccurence;
            if (paramName.trim().length == 0) {
                var msg = "Trait or resource type parameter name must contain non whitespace characters";
                var issue = createIssue1(
                    messageRegistry.TEMPLATE_PARAMETER_NAME_MUST_CONTAIN_NONWHITESPACE_CHARACTERS,{},node);
                issue.start = start + i;
                issue.end = start + prev;
                acceptor.accept(issue);
            }
            if (ind != -1) {
                ind++;
                var transformerNames = paramOccurence.split("|").slice(1).map(x=>x.trim());
                var functionNames = expander.getTransformNames();

                for(var transformerName of transformerNames) {
                    if (!_.find(functionNames, functionName =>
                        transformerName === functionName || transformerName === ('!' + functionName))) {

                        var issue = createIssue1(messageRegistry.UNKNOWN_FUNCTION,
                            {transformerName:transformerName}, node, false);
                        issue.start = start + ind;
                        issue.end = start + prev;
                        acceptor.accept(issue);
                    }
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
            validationAcceptor.accept(createIssue1(messageRegistry.REQUEST_BODY_DISABLED,
                { methodName: methodNode.name() }, methodNode));
        }
    }
}

class CompositePropertyValidator implements PropertyValidator{
    validate(node:hl.IAttribute,v:hl.ValidationAcceptor){

        var pr = checkPropertyQuard(node, v);
        var vl=node.value();
        let nodeParent = node.parent();
        let pDef = nodeParent.definition();
        var ramlVersion = pDef.universe().version();
        var isInsideTemplate = typeOfContainingTemplate(nodeParent)!=null;
        let nodeProperty = node.property();
        if (!nodeProperty.range().hasStructure()){
            if (hlimpl.StructuredValue.isInstance(vl)&&!(<def.Property>nodeProperty).isSelfNode()){

                //TODO THIS SHOULD BE MOVED TO TYPESYSTEM FOR STS AT SOME MOMENT
                if (isTypeOrSchema(nodeProperty)){
                    if (nodeProperty.domain().key()==universes.Universe08.BodyLike){
                        var structValue=<hlimpl.StructuredValue>vl;
                        var newNode=new hlimpl.ASTNodeImpl(node.lowLevel(),nodeParent,<hl.INodeDefinition>pDef.universe().type(universes.Universe08.BodyLike.name),nodeProperty);
                        newNode.validate(v);
                        return;
                    }
                }
                if(ramlVersion=="RAML10"&&isInsideTemplate){
                    return;
                }
                v.accept(createIssue1(messageRegistry.SCALAR_EXPECTED,{},node))
            }
            else {
                var vk=node.lowLevel().valueKind();
                if (node.lowLevel().valueKind()!=yaml.Kind.INCLUDE_REF&&!nodeProperty.getAdapter(services.RAMLPropertyService).isKey()){
                    if (!nodeProperty.isMultiValue()&&!(universeHelpers.isApiType(pDef)&&universeHelpers.isTitleProperty(nodeProperty))) {
                        var k=nodeProperty.range().key();
                        if (k==universes.Universe08.StringType||k==universes.Universe08.MarkdownString||k==universes.Universe08.MimeType) {
                            if (vk==yaml.Kind.SEQ||vk==yaml.Kind.MAPPING||vk==yaml.Kind.MAP||((nodeProperty.isRequired()||universeHelpers.isMediaTypeProperty(nodeProperty))&&(vk==null||vk===undefined))) {
                                if (!nodeProperty.domain().getAdapter(services.RAMLService).isInlinedTemplates()) {
                                    v.accept(createIssue1(messageRegistry.STRING_EXPECTED,
                                        {propName: node.name()}, node));
                                }
                            }
                        }
                    }
                }
            }
            if (node.isAnnotatedScalar()){

                var fvl=new FixedFacetsValidator()
                node.annotations().forEach(x=>{
                    var vl = x.value();
                    var highLevel=vl.toHighLevel();
                    if (!highLevel){
                        v.accept(createIssue1(messageRegistry.UNKNOWN_ANNOTATION,
                            {aName : vl.valueName()}, x));
                    }
                    else{
                        fvl.validate(highLevel,v);
                    }
                });
            }
        }


        var refName:string;
        if (typeof vl=='string'){
            refName = vl;
        }
        else if(hlimpl.StructuredValue.isInstance(vl)){
            refName = (<hlimpl.StructuredValue>vl).valueName();
        }
        if (refName && refName.indexOf("<<")!=-1){
            if (refName.indexOf(">>")>refName.indexOf("<<")){
                new TraitVariablesValidator().validateValue(node,v);
                if (isInsideTemplate){
                    return;
                }

            }
            //validate functions;
        }

        new MethodBodyValidator().validate(node, v);

        if ((nodeProperty.range().key() == universes.Universe08.MimeType||
            nodeProperty.range().key() == universes.Universe10.MimeType)||
            (nodeProperty.nameId()==universes.Universe10.TypeDeclaration.properties.name.name
            &&nodeParent.property().nameId()==
            universes.Universe10.MethodBase.properties.body.name)) {//FIXME
            new MediaTypeValidator().validate(node,v);
            return;
        }

        if (isExampleProp(nodeProperty)||isDefaultValueProp(nodeProperty)){
            // if (ramlVersion=="RAML08"){
            //     var llv=node.lowLevel().value();
            //     if (node.lowLevel().children().length>0){
            //         var valName = isExampleProp(node.property()) ? "'example'" : "'defaultValue'";
            //         v.accept(createIssue1(messageRegistry.STRING_EXPECTED_2,
            //             {propName: valName},node,false));
            //     }
            // }
            new ExampleAndDefaultValueValidator().validate(node, v);
        }
        if (isSecuredBy(nodeProperty)){
            if (ramlVersion=="RAML08"){
                var np=node.lowLevel().parent();
                var ysc=yaml.Kind.SEQ;
                if (proxy.LowLevelProxyNode.isInstance(node.lowLevel())){
                    if (np.valueKind()!=ysc){
                        v.accept(createIssue1(messageRegistry.SECUREDBY_LIST_08,{},node,false));
                    }
                }
                else{
                    if (np.kind()!=ysc){
                        v.accept(createIssue1(messageRegistry.SECUREDBY_LIST_08,{},node,false));
                    }
                }

            }
            new ExampleAndDefaultValueValidator().validate(node, v);
            if(ramlVersion=="RAML10"){
                if(hlimpl.StructuredValue.isInstance(vl)) {
                    var sv = <hlimpl.StructuredValue>vl;
                    var scopes = sv.children().filter(x=>x.valueName() == "scopes");
                    if (scopes.length > 0) {
                        var schema = node.findReferencedValue();
                        if (schema) {
                            var scopeNodes:hlimpl.StructuredValue[] = [];
                            scopes.forEach(scopeNode=> {
                                var children = scopeNode.children();
                                if (children.length > 0) {
                                    children.forEach(ch => {
                                        var strVal = ch.lowLevel().value();
                                        if (strVal != null && !(isInsideTemplate && strVal.indexOf("<<")>=0)) {
                                            scopeNodes.push(ch);
                                        }
                                    });
                                }
                                else {
                                    var strVal = scopeNode.lowLevel().value();
                                    if (strVal != null && !(isInsideTemplate && strVal.indexOf("<<")>=0)){
                                        scopeNodes.push(scopeNode);
                                    }
                                }
                            });
                            var allowedScopes = {};
                            var settingsNode = schema.element(def.universesInfo.Universe10.AbstractSecurityScheme.properties.settings.name);
                            if (settingsNode) {
                                var allowedScopesNodes = settingsNode.attributes(
                                    def.universesInfo.Universe10.OAuth2SecuritySchemeSettings.properties.scopes.name);

                                allowedScopesNodes.forEach(x=>allowedScopes[x.value()] = true);
                            }
                            for (var scope of scopeNodes) {
                                var scopeStr = scope.lowLevel().value();
                                if (!allowedScopes.hasOwnProperty(scopeStr)) {
                                    v.accept(createLLIssue1(messageRegistry.INVALID_SECURITY_SCHEME_SCOPE,
                                        {
                                            invalidScope: scopeStr,
                                            securityScheme: schema.name(),
                                            allowedScopes: Object.keys(allowedScopes).map(x=>`'${x}'`).join(", ")
                                        }, scope.lowLevel(), node, false));
                                }
                            }
                        }
                    }
                }
            }
        }
        if (nodeProperty.nameId()==universes.Universe10.TypeDeclaration.properties.name.name){
            //TODO MOVE TO DEF SYSTEM
            var nameId = nodeParent.property()&&nodeParent.property().nameId();
            if (nameId == universes.Universe08.Resource.properties.uriParameters.name
                || nameId == universes.Universe08.Resource.properties.baseUriParameters.name) {
//                    new UrlParameterNameValidator().validate(node, v);
                return;
            }
        }

        var range =nodeProperty.range().key();
        if (range==universes.Universe08.RelativeUriString||range==universes.Universe10.RelativeUriString){
            new UriValidator().validate(node,v);
            return;
        }

        if (range==universes.Universe08.FullUriTemplateString||range==universes.Universe10.FullUriTemplateString){
            new UriValidator().validate(node,v);
            return;
        }

        if ("pattern" == node.name() && universes.Universe10.StringType == node.definition().key()
            && pDef.isAssignableFrom("StringTypeDeclaration")) {
            validateRegexp(node.value(), v, node);
        }
        if ("name" == node.name() && universes.Universe10.StringType == node.definition().key()
            && (typeof node.value() == "string")
            && (<string>node.value()).indexOf("[") == 0
            && (<string>node.value()).lastIndexOf("]") == (<string>node.value()).length - 1) {

            if(hlimpl.ASTNodeImpl.isInstance(nodeParent) &&
                universes.Universe10.ObjectTypeDeclaration.properties.properties.name == (<hlimpl.ASTNodeImpl>nodeParent).property().nameId()){

                if (hlimpl.ASTNodeImpl.isInstance(nodeParent.parent()) &&
                    universes.Universe10.ObjectTypeDeclaration == (<hlimpl.ASTNodeImpl>nodeParent.parent()).definition().key()) {
                    var cleanedValue = (<string>node.value()).substr(1, (<string>node.value()).length - 2)
                    validateRegexp(cleanedValue, v, node);
                }
            }
        }

        if ((<def.Property>pr).isReference()||pr.isDescriminator()){
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

class ValidationError extends Error{

    private static CLASS_IDENTIFIER_ValidationError = "linter.ValidationError";

    public isWarning = false;

    public internalRange:def.rt.tsInterfaces.RangeObject;

    public internalPath: string;

    public filePath: string;

    public additionalErrors: ValidationError[];

    public static isInstance(instance : any) : instance is ValidationError {
        return instance != null && instance.getClassIdentifier
            && typeof(instance.getClassIdentifier) == "function"
            && _.contains(instance.getClassIdentifier(),ValidationError.CLASS_IDENTIFIER_ValidationError);
    }

    public getClassIdentifier() : string[] {
        var superIdentifiers = [];

        return superIdentifiers.concat(ValidationError.CLASS_IDENTIFIER_ValidationError);
    }

    constructor(public messageEntry:any, public parameters:any={}){
        super();
        this.getClassIdentifier = ValidationError.prototype.getClassIdentifier;
    }
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
                        	var list = aVals.map(x=>`'${x}'`).join(", ");
                            return new ValidationError(messageRegistry.INVALID_ANNOTATION_LOCATION,
                                { aName: v, aValues: list });
                        }
                    }
                }
            }
            return tm;
        }
        if (t.key() == universes.Universe08.SchemaString||t.key() == universes.Universe10.SchemaString) {
            var isTypeProp = false;
            if(def.UserDefinedProp.isInstance(p)){
                var udp = <def.UserDefinedProp>p;
                var src = udp.node();
                if(src){
                    var srcProp = src.property();
                    if(srcProp){
                        isTypeProp = universeHelpers.isTypeProperty(srcProp) || universeHelpers.isSchemaProperty(srcProp);
                    }
                }
            }
            if(isTypeProp){
                return false;
            }
            let isJSONorXML = v && v.trim().length > 0
                &&(v.trim().charAt(0)=="{"||v.trim().charAt(0)=="<");

            var tm = su.createSchema(v, contentProvider(h.lowLevel(),attr&&attr.lowLevel()));
            if(!tm){
                return tm;
            }
            else if (tm instanceof Error){
                (<any>tm).isWarning = true;
                if(!isJSONorXML) {
                    (<any>tm).canBeRef = true;
                }
            }
            else {
                var isJSON = false;
                try{
                    JSON.parse(v);
                    isJSON = true;
                }
                catch(e){};
                if(isJSON){
                    try {
                        tm.validateSelf();
                    }
                    catch(e){
                        e['isWarning'] = true;
                        return e;
                    }
                }
            }
            return tm;
        }
        if (t.key() == universes.Universe08.StatusCodeString||t.key() == universes.Universe10.StatusCodeString){
            var err:Error = validateResponseString(''+v);
            if(err!=null){
                return err;
            }
        }

        if (t.key() == universes.Universe08.BooleanType||t.isAssignableFrom(universes.Universe10.BooleanType.name)) {
            if (!(v === 'true' || v === 'false' || v === true || v === false)){
                return new ValidationError(messageRegistry.BOOLEAN_EXPECTED);
            }
            if(attr){
                var stringValue = attr.lowLevel().value(true);
                if (!(stringValue === 'true' || stringValue === 'false')){
                    return new ValidationError(messageRegistry.BOOLEAN_EXPECTED)
                }
            }
        }
        if (t.key() == universes.Universe08.NumberType||t.isAssignableFrom(universes.Universe10.NumberType.name)) {
            var q=parseFloat(v);
            if (isNaN(q)){
                return new ValidationError(messageRegistry.NUMBER_EXPECTED, {propName:p.nameId()});
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
                            return new ValidationError(messageRegistry.STRING_EXPECTED_3,
                                {propName:p.nameId()});
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
        if (dnode&&range.isUserDefined()) {
            var rof = dnode.parsedType();
            var dp=node.parent().lowLevel().dumpToObject();
            var tempVal=dp[node.parent().name()];
            var isVal=pr.canBeValue();
            var val=(isVal||(tempVal===null||tempVal===undefined))?tempVal:tempVal[pr.nameId()];
            var validateObject=rof.validate(val,true);
            if (!validateObject.isOk()) {
                validateObject.getErrors().forEach(e=>cb.accept(createIssue(
                    e.getCode(), e.getMessage(), node, false)));
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
                if(ValidationError.isInstance(validation)){
                    v.accept(createIssue2(<ValidationError>validation,node));
                }
                else {
                    v.accept(createIssue1(messageRegistry.SCHEMA_EXCEPTION, {msg: (<Error>validation).message}, node,(<any>validation).isWarning));
                }
                validation = null;
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
                        var c = (<hlimpl.ASTPropImpl>node).findReferenceDeclaration();
                        if(c) {
                            let resultingIssue:hl.ValidationIssue;
                            let trace:hl.ValidationIssue;
                            if (ValidationError.isInstance(decl)) {
                                let ve = <ValidationError>decl;
                                resultingIssue = createIssue2(ve, c);
                                trace = createIssue1(ve.messageEntry, {msg: ve.message}, node);
                            }
                            else {
                                resultingIssue = createIssue1(messageRegistry.SCHEMA_EXCEPTION, {msg: (<Error>decl).message}, c);
                                trace = createIssue1(messageRegistry.SCHEMA_EXCEPTION, {msg: (<Error>decl).message}, node);
                            }
                            resultingIssue.extras.push(trace);
                            v.accept(resultingIssue);
                        }
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
                            if(ValidationError.isInstance(validation)){
                                v.accept(createIssue2(<ValidationError>validation,node));
                            }
                            else {
                                v.accept(createIssue1(messageRegistry.SCHEMA_EXCEPTION, {msg:(<Error>validation).message}, node));
                            }
                            validation=null;
                            return;
                        }
                        if (node.property().isRequired()&&node.value()==null) {
                            v.accept(createIssue1(messageRegistry.EMPTY_VALUE_NOT_ALLOWED,{}, node));
                        }
                        else{
                            var ck=node.lowLevel().valueKind();
                            if (ck==yaml.Kind.MAP||ck==yaml.Kind.SEQ||ck==yaml.Kind.MAPPING){
                                v.accept(createIssue1(messageRegistry.EMPTY_VALUE_NOT_ALLOWED,{}, node));
                            }
                        }
                    }
                }
            }
            else{
                let toWarning = pr.range().key() == universes.Universe08.SchemaString;
                if (validation instanceof Error){
                    var message=validation.message;
                    if(!checkIfIncludeTagIsMissing(node, v, messageRegistry.SCHEMA_ERROR.code, toWarning)) {
                        v.accept(createIssue1(messageRegistry.SCHEMA_ERROR,
                            {msg: message}, node, toWarning));
                    }
                }
                else {
                    var vl=node.value();
                    v.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,
                        {iValue: vl}, node, toWarning));
                }
            }
        }
        var values=pr.enumOptions();
        if (values) {
            var apiDef = node.parent() && node.parent().definition();

            var isApi10 = apiDef && apiDef.isAssignableFrom(universes.Universe10.Api.name);
            var isApi08 = apiDef && apiDef.isAssignableFrom(universes.Universe08.Api.name);

            var isProtocols08 = pr.nameId() === universes.Universe08.Api.properties.protocols.name;
            var isProtocols10 = pr.nameId() === universes.Universe10.Api.properties.protocols.name;

            if(typeof vl !== 'string') {
                return;
            }

            if(((isApi08 || isApi10) && (isProtocols08 || isProtocols10)) && !isMixedCase(vl)) {
                vl = vl.toUpperCase();
            }
            if (typeof values == 'string') {
                if (values != vl) {
                    if (vl && (vl.indexOf("x-") == 0) && pr.nameId() == universes.Universe08.AbstractSecurityScheme.properties.type.name) {//Some magic I copied a from a couple of lines below @Denis
                        //return true;
                    }
                    else {
                        v.accept(createIssue1(messageRegistry.INVALID_VALUE, {iValue: vl,
                            aValues: `'${values}'` }, node));
                    }
                }
            }
            else if (values.length > 0) {
                if (!_.find(values, x=>x == vl)) {
                    if (vl && (vl.indexOf("x-") == 0)  && pr.nameId() == universes.Universe08.AbstractSecurityScheme.properties.type.name) {//FIXME move to def system
                        //return true;
                    }
                    else {
                        v.accept(createIssue1(messageRegistry.INVALID_VALUE, {iValue: vl,
                            aValues: values.map(x=>`'${x}'`).join(", ")}, node));
                    }
                }
            }
        }
    }
}

function isMixedCase(input: string): boolean {
    if(!input) {
        return false;
    }

    var lowerCase = input.toLowerCase();
    var upperCase = input.toUpperCase();

    if(!(input === lowerCase || input === upperCase)) {
        return true;
    }

    return false;
}

class UriValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        try{
            var values:string[]=new UrlParameterNameValidator().parseUrl(node.value() || '');
            if (values.some(x=>x=="version")&&node.property().nameId()=="baseUri"){
                var version= node.root().attr("version")

                if (!version){
                    cb.accept(createIssue1(messageRegistry.MISSING_VERSION,{}, node,false))
                }
            }

            if (values.some(x=>x.length == 0)) {
                cb.accept(createIssue1(messageRegistry.URI_PARAMETER_NAME_MISSING, {}, node,false))
            }
        }
        catch (e){
            cb.accept(createIssue1(messageRegistry.URI_EXCEPTION,{msg: e.message}, node,false))
        }
    }
}
class MediaTypeValidator implements PropertyValidator{
    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        try {
            let v = node.value();
            if (v=="body"){
                if (node.parent().parent()) {
                    let ppc=node.parent().parent().definition().key();
                    if (ppc===universes.Universe08.Response||ppc===universes.Universe10.Response||
                        node.parent().parent().definition().isAssignableFrom(universes.Universe10.MethodBase.name)) {
                        v=node.parent().computedValue("mediaType")
                    }
                }
            }
            if(typeOfContainingTemplate(node)!=null){
                if((typeof v === "string") && v.indexOf("<<")>=0){
                    return;
                }
            }
            let res = expander.parseMediaType(v);
            if(!res){
                return;
            }
            //check if type name satisfies RFC6338
            if (!res.type.match(/[\w\d][\w\d!#\$&\-\^_+\.]*/)) {
                cb.accept(createIssue1(messageRegistry.INVALID_MEDIATYPE, { mediaType: res.type}, node));
            }
        }catch (e){
            cb.accept(createIssue1(messageRegistry.MEDIATYPE_EXCEPTION,{ msg: e.message}, node))
        }
        if (node.value()&&node.value()==("multipart/form-data")||node.value()==("application/x-www-form-urlencoded")){
            if (node.parent()&&node.parent().parent()&&node.parent().parent().property()) {
                if (node.parent().parent().property().nameId() == universes.Universe10.MethodBase.properties.responses.name) {
                    cb.accept(createIssue1(messageRegistry.FORM_IN_RESPONSE, {}, node,true))
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
//                cb.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Error during signature parse: "+e.message,node))
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
                    v.accept(createIssue1(messageRegistry.UNUSED_URL_PARAMETER,{paramName: ""}, node));
                }

            } catch (e) {

            }
        }
        else {
            v.accept(createIssue1(messageRegistry.UNUSED_URL_PARAMETER,{paramName: ""}, node));
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
            throw new Error(applyTemplate(messageRegistry.INVALID_RESOURCE_NAME_UNMATCHED_SYMBOL, {symbol: "{"}))
        }
        if (count<0){
            throw new Error(applyTemplate(messageRegistry.INVALID_RESOURCE_NAME_UNMATCHED_SYMBOL, {symbol: "}"}))
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

                cb.accept(createIssue1(messageRegistry.UNUSED_URL_PARAMETER,{paramName: `'${vl}'`}, node));
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
parameterPropertyToName[universes.Universe08.MethodBase.properties.headers.name] = "header";
parameterPropertyToName[universes.Universe08.MethodBase.properties.queryParameters.name] = "query parameter";
parameterPropertyToName[universes.Universe08.Api.properties.uriParameters.name] = "uri parameter";
parameterPropertyToName[universes.Universe08.Api.properties.baseUriParameters.name] = "base uri parameter";
parameterPropertyToName[universes.Universe08.BodyLike.properties.formParameters.name] = "form parameter";
parameterPropertyToName[universes.Universe10.MethodBase.properties.headers.name] = "header";
parameterPropertyToName[universes.Universe10.MethodBase.properties.queryParameters.name] = "query parameter";
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
    if(proxy.LowLevelProxyNode.isInstance(c.lowLevel())){
        c = node;
    }
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

    let paramStart = (typeof vl === "string") ? vl.indexOf("<<") : -1;
    if (paramStart >= 0 && vl.indexOf(">>", paramStart) >= 0 && typeOfContainingTemplate(astNode) != null) {
        return;
    }

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

    let parentNode = astNode.parent();
    let valid = false;
    let hasChaining = proxy.LowLevelCompositeNode.isInstance(astNode.lowLevel())
        && (<proxy.LowLevelProxyNode>astNode.lowLevel()).getMeta("chaining");

    if(!hasChaining) {
        valid = isValidPropertyValue(pr, vl, parentNode);
        if (!valid && astNode.lowLevel().unit().absolutePath() !== parentNode.lowLevel().unit().absolutePath()) {
            valid = isValidPropertyValue(pr, vl, <hl.IHighLevelNode>hlimpl.fromUnit((<any>astNode).lowLevel().unit()));
        }
    }

    if (!valid) {
        if (typeof vl=='string') {
            if ((vl.indexOf("x-") == 0) && pr.nameId() == universes.Universe10.TypeDeclaration.properties.type.name) {//FIXME move to def system
                return true;
            }
        }

        var expected = (adapter.isReference && adapter.isReference() && adapter.referencesTo && adapter.referencesTo() && adapter.referencesTo().nameId && adapter.referencesTo().nameId());

        var referencedToName = typeToName[expected] || nameForNonReference(astNode);
        var parameters = {
            referencedToName: referencedToName,
            ref: vl,
            typeName: vl
        }
        var code = referencedToName ? messageRegistry.UNRECOGNIZED_ELEMENT
            : messageRegistry.UNRESOLVED_REFERENCE;

        var spesializedMessage = specializeReferenceError(code, pr, astNode, vl);
        let toWarning = pr.range().key()===universes.Universe08.SchemaString;
        if(!checkIfIncludeTagIsMissing(astNode, cb, spesializedMessage.code, toWarning)) {
            cb.accept(createIssue1(spesializedMessage, parameters, astNode, toWarning));
        }
        return true;
    }

    if(isDuplicateSibling(astNode) && universeHelpers.isTraitRefType(astNode.definition())) {
        cb.accept(createIssue1(messageRegistry.DUPLICATE_TRAIT_REFERENCE,{refValue: vl}, astNode));

        return true;
    }

    return false;
}

function isDuplicateSibling(attr: hl.IAttribute): boolean{
    var ramlVersion = attr.property().domain().universe().version();
    var siblingName:string;
    if(ramlVersion=="RAML10"){
        siblingName = stringify(json.serialize(attr.lowLevel()));
    }
    else{
        siblingName = attr.value() && attr.value().valueName && attr.value().valueName();
    }

    if(!siblingName) {
        return false;
    }

    var parent = attr.parent &&  attr.parent();

    if(!parent) {
        return false;
    }

    var propertyName = attr.name && attr.name();

    if(!propertyName) {
        return false;
    }

    var siblings = parent.attributes && parent.attributes(propertyName);

    if(!siblings) {
        return false;
    }

    if(siblings.length === 0) {
        return false;
    }

    var count = 0;

    siblings.forEach(sibling => {
        var name:string;
        if(ramlVersion=="RAML10"){
            siblingName = stringify(json.serialize(sibling.lowLevel()));
        }
        else {
            name = sibling.value && sibling.value() && sibling.value().valueName && sibling.value().valueName();
        }

        if(name === siblingName) {
            count++;
        }
    });

    return count > 1;
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
        acceptor.accept(createIssue1(messageRegistry.IS_IS_ARRAY,{},astNode));
    }

    //only maps and scalars are allowed as direct children
    var illegalChildFound = false;
    isMappingNode.children().forEach(child=>{
        if (child.kind() != yaml.Kind.SCALAR && child.kind() != yaml.Kind.MAP) {
            illegalChildFound = true;
        }
    })

    if (illegalChildFound) {
        acceptor.accept(createIssue1(messageRegistry.IS_IS_ARRAY,{},astNode));
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
            acceptor.accept(createIssue1(messageRegistry.RESOURCE_TYPE_NAME,{}, astNode));
        }
    } else if (astNode.value() == null && lowLevel && lowLevel.children() &&
        lowLevel.children().length > 1) {

        //more than a single resource type in a list / map
        acceptor.accept(createIssue1(messageRegistry.MULTIPLE_RESOURCE_TYPES,{}, astNode));
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
function specializeReferenceError(originalMessage: any,
                                  property:def.Property, astNode:hl.IAttribute, value:any):any {
    if (property.nameId()=="type"&&property.domain().universe().version()=="RAML08"){
        if (property.domain().isAssignableFrom(universes.Universe08.Parameter.name)) {
            return messageRegistry.TYPES_VARIETY_RESTRICTION;
        }
    }

    if (astNode.parent() != null && universeHelpers.isSecuritySchemaType(astNode.parent().definition())) {
        return messageRegistry.UNRECOGNIZED_SECURITY_SCHEME;
    }
    if(universeHelpers.isAnnotationsProperty(property)){

        let hasChaining = proxy.LowLevelCompositeNode.isInstance(astNode.lowLevel())
            && (<proxy.LowLevelProxyNode>astNode.lowLevel()).getMeta("chaining");

        let typeCollction = astNode.parent().types();
        let reg = typeCollction && typeCollction.getAnnotationTypeRegistry();
        if(hasChaining || reg && reg.getByChain(value)){
            return messageRegistry.LIBRARY_CHAINIG_IN_ANNOTATION_TYPE;
        }
        else{
            return messageRegistry.UNKNOWN_ANNOTATION_TYPE;
        }
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
            if (def.ReferenceType.isInstance(pr.range())){
                var t=<def.ReferenceType>pr.range();
                if (true){
                    var mockNode=jsyaml.createNode(""+vl,<any>node.lowLevel().parent(),node.lowLevel().unit());
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
        else if (hlimpl.StructuredValue.isInstance(vl)){
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
        } else if(typeof(vl) === "number" || typeof(vl) === "boolean") {
            if (node.definition().isAssignableFrom(universes.Universe10.Reference.name)) {
                checkReference(pr, node, vl + '', cb);
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
                if(ValidationError.isInstance(validation)){
                    cb.accept(createIssue2(<ValidationError>validation,node));
                }
                else {
                    cb.accept(createIssue1(messageRegistry.SCHEMA_EXCEPTION, {msg:(<Error>validation).message}, node,(<any>validation).isWarning));
                }
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
            if (tv !== "0.8" && tv !== "1.0") {
                var i = createIssue1(messageRegistry.UNKNOWN_RAML_VERSION, {}, node)
                v.accept(i);

            }
            var tl=u.getOriginalTopLevelText();
            if (tl){
                var parameters = { typeName: tl }
                if (tl!=node.definition().nameId()){
                    if (node.definition().nameId()=="Api") {
                        var i = createIssue1(messageRegistry.UNKNOWN_TOPL_LEVEL_TYPE,
                            parameters, node);
                        v.accept(i);
                    }
                } else if ("Api" == u.getOriginalTopLevelText()) {
                    var i = createIssue1(messageRegistry.REDUNDANT_FRAGMENT_NAME,parameters, node);
                    v.accept(i);
                }
            }
        }
    }

}
class RequiredPropertiesAndContextRequirementsValidator implements NodeValidator{
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){

        (node.definition()).getAdapter(services.RAMLService).getContextRequirements().forEach(x=>{
            if (!(<hlimpl.ASTNodeImpl>node).checkContextValue(x.name,x.value,x.value)){
                var parameters = { v1: x.name, v2: x.value, v3: node.definition().nameId() };
                var messageEntry = messageRegistry.CONTEXT_REQUIREMENT_VIOLATION;
                if (x.name=='location'&&x.value=="ParameterLocation.FORM"){
                    messageEntry = messageRegistry.WEB_FORMS;
                }
                v.accept(createIssue1(messageEntry, parameters,node));
            }
        });
        var t:proxy.ValueTransformer;
        var isInlinedTemplate = node.definition().getAdapter(services.RAMLService).isInlinedTemplates();
        if(isInlinedTemplate) {
            var paramsMap:{[key:string]:string} = {};
            for (var ch of node.lowLevel().children()) {
                paramsMap[ch.key()] = ch.value(true);
            }
            var templateKind = node.definition().isAssignableFrom(universes.Universe10.Trait.name) ? "trait" : "resource type";
            var unitsChain = expander.toUnits(node);
            var vt = new expander.ValueTransformer(templateKind, node.definition().nameId(),unitsChain,paramsMap);
            var parent = node.parent();
            var def = parent?parent.definition():node.definition();
            while(parent!=null && !universeHelpers.isResourceType(def)&&!universeHelpers.isMethodType(def)){
                parent = parent.parent();
            }
            t = new expander.DefaultTransformer(<any>parent, vt, unitsChain);
        }
        node.definition().requiredProperties().forEach(x=>{
            if (isInlinedTemplate){
                var paths:string[][] = x.getAdapter(services.RAMLPropertyService).meta("templatePaths");
                if(paths){
                    var parent = node.parent();
                    var hasSufficientChild = false;
                    for(var path of paths){
                        path = path.map(x=>t.transform(x).value);
                        if(this.checkPathSufficiency(parent.lowLevel(),path,parent)){
                            hasSufficientChild = true;
                            break;
                        }
                    }
                    if(!hasSufficientChild){
                        return;
                    }
                }
            }
            var r=x.range();
            if (r.hasArrayInHierarchy()){
                r=r.arrayInHierarchy().componentType();
            }
            if (r.hasValueTypeInHierarchy()) {
                var nm = node.attr(x.nameId());
                var gotValue = false;
                if (nm!=null){
                    if(nm.lowLevel().kind()==yaml.Kind.SCALAR||nm.lowLevel().resolvedValueKind()==yaml.Kind.SCALAR){
                        if(nm.value()!=null){
                            gotValue = true;
                        }
                    }
                    else if (nm.lowLevel().children().length!=0) {
                        gotValue = true;
                    }
                }
                if(!gotValue){
                    var parameters = { propName: x.nameId() };
                    var messageEntry = messageRegistry.MISSING_REQUIRED_PROPERTY;
                    if (isInlinedTemplate){
                        messageEntry = messageRegistry.VALUE_NOT_PROVIDED;
                    }
                    var i = createIssue1(messageEntry, parameters, node);
                    v.accept(i);
                }
            }
            else{
                var el = node.elementsOfKind(x.nameId());
                if (!el||el.length==0) {
                    var i = createIssue1(messageRegistry.MISSING_REQUIRED_PROPERTY,
                        { propName: x.nameId() }, node)
                    v.accept(i);
                }
            }
        });
    }
    checkPathSufficiency(node:ll.ILowLevelASTNode,
                         path:string[],
                         hlParent:hl.IHighLevelNode):boolean{

        if(hlParent==null||hlParent.definition()==null){
            return false;
        }

        var definition = hlParent.definition();
        if(universeHelpers.isResourceTypeType(definition)||universeHelpers.isTraitType(definition)){
            return true;
        }

        if(path.length==0){
            return false;
        }
        if(node==null){
            return false;
        }
        var segment = path[0];
        if(segment==null){
            return false;
        }
        if(segment=="/"){
            return this.checkPathSufficiency(node,path.slice(1),hlParent);
        }
        if(segment.length==0){
            return true;
        }
        var children = node.children().filter(x=>x.key()==segment);
        if(children.length==0){
            path.indexOf("/")<0;
        }
        var lowLevel:ll.ILowLevelASTNode = children[0];
        if(proxy.LowLevelCompositeNode.isInstance(lowLevel)){
            lowLevel = (<proxy.LowLevelCompositeNode>lowLevel).primaryNode();
        }
        if(lowLevel==null){
            return path.indexOf("/")<0;
        }
        if(lowLevel.key()=="type"){
            return true;
        }

        if(path.length==1){
            // if(hlName==prop.nameId()&&node.definition().nameId()==prop.domain().nameId()){
            //     return true;
            // }
            return lowLevel==null||lowLevel.value() == null;
        }
        else{
            var path1 = path.slice(1);
            return this.checkPathSufficiency(lowLevel,path1,hlParent);
        }

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
                        var i = createIssue1(messageRegistry.SUSPICIOUS_DOUBLEQUOTE,
                            {value:x.value()}, node, true);
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

            var validateObject=rof.validate(dp,false,false);
            if (!validateObject.isOk()) {
                if(universeHelpers.isAnnotationsProperty(node.property())){
                    validateObject.getErrors().forEach(e=>{
                        if(e.getMessage()=="nothing"){
                            let typeCollction = node.parent().types();
                            let reg = typeCollction && typeCollction.getAnnotationTypeRegistry();
                            let sVal = new hlimpl.StructuredValue(node.lowLevel(),node.parent(),node.property());
                            let aName = sVal.valueName();
                            let chained = rof.allFacets().filter(x=>x.kind()==def.tsInterfaces.MetaInformationKind.ImportedByChain);
                            if(chained.length>0 && reg && reg.getByChain(aName)){
                                let chainedType = chained[0].value();
                                v.accept(createIssue1(
                                    messageRegistry.LIBRARY_CHAINIG_IN_ANNOTATION_TYPE_SUPERTYPE,
                                    {typeName: aName, chainedType: chainedType}, node));
                            }
                            else{
                                v.accept(createIssue1(
                                    messageRegistry.UNKNOWN_ANNOTATION_TYPE,{typeName: aName}, node));
                            }
                        }
                        else{
                            v.accept(createIssue(e.getCode(), e.getMessage(), mapPath(node,e).node, false))
                        }
                    });
                }
                else{
                    validateObject.getErrors().forEach(e=>v.accept(createIssue(e.getCode(), e.getMessage(), mapPath(node,e).node, false)));
                }
            }
        }
    }
}

class TypeDeclarationValidator implements NodeValidator{

    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor) {
        let nc=node.definition();
        let rof = node.parsedType();
        let validateObject=rof.validateType(node.types().getAnnotationTypeRegistry());
        if (!validateObject.isOk()) {
            for( var e of validateObject.getErrors()){
                let n = extractLowLevelNode(e,node.lowLevel().unit().project());
                let issue;
                let mappingResult = mapPath( node,e);
                if(mappingResult.node==node && !mappingResult.internalPathUsed){
                    let vp = e.getValidationPath();
                    if(vp && vp.name == def.universesInfo.Universe10.TypeDeclaration.properties.type.name){
                        if(node.attr(def.universesInfo.Universe10.TypeDeclaration.properties.schema.name)){
                            let name = vp.name;
                            vp.name = def.universesInfo.Universe10.TypeDeclaration.properties.schema.name;
                            mappingResult = mapPath( node,e);
                            vp.name = name;
                        }
                    }
                }

                let internalRange = mappingResult.internalPathUsed ? null : e.getInternalRange();
                if(n){
                    issue = createLLIssue(e.getCode(), e.getMessage(),n,mappingResult.node, e.isWarning(),true,internalRange);
                    if(n.unit().absolutePath()!=node.lowLevel().unit().absolutePath()){
                        let trace = createIssue(e.getCode(), e.getMessage(), node, e.isWarning());
                        issue.extras.push(trace);
                    }
                }
                else {
                    if(e.getFilePath()&&e.getFilePath()!=node.lowLevel().unit().absolutePath()){
                        let u = node.lowLevel().unit().project().unit(e.getFilePath(),true);
                        if(u) {
                            let hlNode = u.highLevel();
                            if(hlNode) {
                                issue = createIssue(e.getCode(), e.getMessage(), hlNode, e.isWarning(), internalRange, true);
                                let trace = createIssue(e.getCode(), e.getMessage(), mappingResult.node, e.isWarning());
                                issue.extras.push(trace);
                            }
                        }
                    }
                    if(!issue){
                        if(checkIfIncludeTagIsMissing(mappingResult.node, v, e.getCode(), e.isWarning())){
                            continue;
                        }
                        issue = createIssue(e.getCode(), e.getMessage(), mappingResult.node, e.isWarning(), internalRange);
                    }
                }
                let actualFilePath = e.getFilePath();
                if(actualFilePath!=null){
                    let actualUnit = node.lowLevel().unit().project().unit(actualFilePath);
                    if(actualUnit) {
                        issue.unit = actualUnit;
                        issue.path = actualFilePath;
                    }
                }
                v.accept(issue);
            };
        }

        let examplesLowLevel = node.lowLevel() && _.find(node.lowLevel().children(),x=>x.key()=='examples');

        if(examplesLowLevel && examplesLowLevel.valueKind &&  examplesLowLevel.valueKind() === yaml.Kind.SEQ) {
            let issue = createLLIssue1(messageRegistry.MAP_EXPECTED,{}, examplesLowLevel, node, false);

            v.accept(issue);
        }
        if((node.property()&&universeHelpers.isAnnotationTypesProperty(node.property()))
            ||hlimpl.isAnnotationTypeFragment(node)){
            var atAttrs = node.attributes(universes.Universe10.TypeDeclaration.properties.allowedTargets.name);
            for(var attr of atAttrs){
                this.checkAnnotationTarget(attr,v);
            }
        }

    }

    private checkAnnotationTarget(attr:hl.IAttribute,v:hl.ValidationAcceptor){
        var val = attr.value();
        if(val==null){
            return;
        }

        if(typeof(val)!="string"){
            v.accept(createIssue1(messageRegistry.ANNOTATION_TARGET_MUST_BE_A_STRING, {}, attr, false));

            return;
        }

        var str:string = val;
        if(val.replace(/\w|\s/g,'').length>0){
            v.accept(createIssue1(messageRegistry.ALLOWED_TARGETS_MUST_BE_ARRAY,
                {}, attr, false));
        }
        else if(!this.annotables[str]){
            v.accept(createIssue1(messageRegistry.UNSUPPORTED_ANNOTATION_TARGET,
                {aTarget: str}, attr, false));
        }
    }

    private annotables:{[key:string]:boolean} = {
        "API" : true,
        "DocumentationItem" : true,
        "Resource" : true,
        "Method" : true,
        "Response" : true,
        "RequestBody" : true,
        "ResponseBody" : true,
        "TypeDeclaration" : true,
        "Example" : true,
        "ResourceType" : true,
        "Trait" : true,
        "SecurityScheme" : true,
        "SecuritySchemeSettings" : true,
        "AnnotationType" : true,
        "Library" : true,
        "Overlay" : true,
        "Extension" : true
    };
}

interface NodeMappingResult {

    node: hl.IParseResult,
    internalPathUsed: boolean
}

function mapPath(node:hl.IHighLevelNode,e:rtypes.IStatus):NodeMappingResult{
    var src= e.getValidationPath();
    let resultNode = findElementAtPath(node,src);
    let internalPath = e.getInternalPath();
    let internalPathUsed = false;
    if(internalPath){
        let internalNode = findElementAtPath(resultNode,internalPath);
        if(internalNode && internalNode != resultNode){
            resultNode = internalNode;
            internalPathUsed = true;
        }
    }
    return {
        node: resultNode,
        internalPathUsed: internalPathUsed
    };
}

function extractLowLevelNode(e:rtypes.IStatus,project:ll.IProject):ll.ILowLevelASTNode{
    var pn = e.getExtra(rtypes.SOURCE_EXTRA);
    if(hlimpl.LowLevelWrapperForTypeSystem.isInstance(pn)){
        return (<hlimpl.LowLevelWrapperForTypeSystem>pn).node();
    }
    // let filePath = e.getFilePath();
    // if(filePath){
    //     let unit = project.unit(filePath);
    //     if(unit){
    //         return unit.ast();
    //     }
    // }
    return null;
}

function findElementAtPath(n:hl.IParseResult,p:rtypes.IValidationPath):hl.IParseResult{
    if (!p){
        return n;
    }
    var chld=n.children().filter(ch=>{
        if(ch.isAttr()&&(<hlimpl.ASTPropImpl>ch.asAttr()).isFromKey()){
            return false;
        }
        return ch.name()=== p.name;
    });
    if(n.isElement()&&universeHelpers.isTypeDeclarationDescendant(n.asElement().definition())){

        var lNode = n.lowLevel();
        chld = _.uniq(n.directChildren().concat(n.children()))
            .filter(ch=>{
                if(ch.isAttr()&&(<hlimpl.ASTPropImpl>ch.asAttr()).isFromKey()){
                    return false;
                }
                return ch.name()=== p.name;
            }).sort((x,y)=>{
                var ll1 = x.lowLevel().parent();
                while(ll1 && ll1.kind() != yaml.Kind.MAPPING){
                    ll1 = ll1.parent()
                }
                var ll2 = y.lowLevel().parent();
                while(ll2 && ll2.kind() != yaml.Kind.MAPPING){
                    ll2 = ll2.parent();
                }
                if(ll1==lNode){
                    return -1;
                }
                else if(ll2==lNode){
                    return 1;
                }
                return 0;
        });
    }
    var ind = (p.child && typeof(p.child.name)=="number") ? <number>p.child.name : -1;
    if(ind>=0 && chld.length>ind){
        return findElementAtPath(chld[ind], p.child.child);
    }
    else if(chld.length>0){
        return findElementAtPath(chld[0], p.child)
    }

    if (!n.lowLevel()){
        return n;
    }
    var lchld= n.lowLevel().children();
    for (var i=0;i<lchld.length;i++){
        if (lchld[i].key()=== p.name){
            var nn=new hlimpl.BasicASTNode(lchld[i],<hl.IHighLevelNode>n);
            return findElementAtPath(nn, p.child)
        }
    }
    if (!isNaN(<any>p.name)) {
        if (lchld[p.name]) {
            var node = lchld[p.name];

            var nn = new hlimpl.BasicASTNode(node, <hl.IHighLevelNode>n);
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
                acceptor.accept(createIssue1(messageRegistry.NODE_KEY_IS_A_SEQUENCE, {}, node));
            }

        }
        var nodeName = node.name();
        if(nodeName==null){
            nodeName = node.lowLevel().key();
            if(nodeName==null){
                nodeName = "";
            }
        }
        if (node.definition().key()==universes.Universe08.GlobalSchema){
            if (node.lowLevel().valueKind()!=yaml.Kind.SCALAR){
                var isString=false;
                if (node.lowLevel().valueKind()==yaml.Kind.ANCHOR_REF||node.lowLevel().valueKind()==yaml.Kind.INCLUDE_REF){
                    var vl=node.lowLevel().value();
                    if (typeof vl==="string"){
                        isString=true;
                    }
                }
                if (!isString) {
                    acceptor.accept(createIssue1(messageRegistry.SCHEMA_NAME_MUST_BE_STRING,
                        {name: nodeName}, node))
                }
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
                    var i = createIssue1(messageRegistry.FORM_PARAMS_IN_RESPONSE, {}, node);
                    acceptor.accept(i);
                }
                else if (node.lowLevel().children().map(x=>x.key()).some(x=>x==="schema"||x==="example")){
                    var i = createIssue1(messageRegistry.FORM_PARAMS_WITH_EXAMPLE,{}, node);
                    acceptor.accept(i);
                }
            }
        }
        if (nc.key()==universes.Universe10.OAuth2SecuritySchemeSettings){
            var requireUrl=false;
            node.attributes("authorizationGrants").forEach(x=>{
                var vl=x.value();
                if (vl==="authorization_code"||vl==="implicit"){
                    requireUrl=true;
                }
                else if (vl!=="password"&&vl!=='client_credentials'){
                    if (vl&&typeof vl==="string"&&vl.indexOf("://")==-1&&vl.indexOf(":")==-1){
                        var i = createIssue1(messageRegistry.AUTHORIZATION_GRANTS_ENUM,{}, x)
                        acceptor.accept(i);
                    }
                }
            })
            if (requireUrl){
                if (!node.attr("authorizationUri")){
                    var i = createIssue1(messageRegistry.AUTHORIZATION_URI_REQUIRED, {}, node)
                    acceptor.accept(i);
                }
            }
        }
        //validation of enum values;
        if (node.definition().isAssignableFrom(universes.Universe08.Parameter.name)
            ||node.definition().isAssignableFrom(universes.Universe10.TypeDeclaration.name)){

            var vls=node.attributes("enum").map(x=>x.value());
            if (vls.length!=_.uniq(vls).length){
                var i = createIssue1(messageRegistry.REPEATING_COMPONENTS_IN_ENUM, {}, node)
                acceptor.accept(i);
            }

            if(node.definition().isAssignableFrom(universes.Universe08.NumberTypeDeclaration.name) || node.definition().isAssignableFrom(universes.Universe10.NumberTypeDeclaration.name)) {
                var isInteger = node.definition().isAssignableFrom(universes.Universe08.IntegerTypeDeclaration.name) || node.definition().isAssignableFrom(universes.Universe10.IntegerTypeDeclaration.name);

                node.attributes("enum").forEach(attribute => {
                    var value = isInteger ? parseInt(attribute.value()) : parseFloat(attribute.value());

                    var isValid = isInteger ? !isNaN(value) && attribute.value().indexOf('.') === -1 : !isNaN(value);

                    if(!isValid) {
                        var issue = createIssue1(isInteger
                            ? messageRegistry.INTEGER_EXPECTED
                            : messageRegistry.NUMBER_EXPECTED_2, {}, attribute);

                        acceptor.accept(issue);
                    }
                });
            }
        }

        if (universeHelpers.isResourceTypeType(node.definition())){
            if(node.value()==null&&node.lowLevel().value(true)==="null") {
                acceptor.accept(createIssue1(messageRegistry.RESOURCE_TYPE_NULL, {}, node))
            }
        }
        checkPropertyQuard(node, acceptor);
        var nodeValue = node.value();
        if ((typeof nodeValue == 'string'
            || typeof nodeValue == 'number'
            || typeof nodeValue == 'boolean')
            && !node.definition().getAdapter(services.RAMLService).allowValue()) {
            if (node.parent()) {
                if (nodeValue!='~') {
                    let isParameter = typeOfContainingTemplate(node) != null
                        && (typeof nodeValue == "string")
                        && util.startsWith(nodeValue,"<<")
                        && util.endsWith(nodeValue,">>")
                    let report = true;
                    if(nodeValue == ""){
                        var actualValue:any = node.lowLevel().actual()&&node.lowLevel().actual().value;
                        if(!actualValue || !(actualValue.doubleQuoted || actualValue.singleQuoted)){
                            report = false;
                        }
                    }
                    if(report && !isParameter && !checkIfIncludeTagIsMissing(node, acceptor, messageRegistry.SCALAR_PROHIBITED_2.code)) {
                        var i = createIssue1(messageRegistry.SCALAR_PROHIBITED_2, {name: nodeName}, node)
                        acceptor.accept(i);
                    }
                }
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

            acceptor.accept(createIssue1(messageRegistry.VERSION_NOT_ALLOWED,{}, node));
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
        if(root.isExpanded()){
            if(root.lowLevel().unit().absolutePath()!=node.lowLevel().unit().absolutePath()){
                return;
            }
        }

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
        v.accept(createIssue1(messageRegistry.INVALID_OVERLAY_NODE, {nodeId: node.id()}, node));
    }

    private validateProperties(node:hl.IHighLevelNode, acceptor:hl.ValidationAcceptor) : void {
        var root = node.root();
        var rootPath = root.lowLevel().unit().absolutePath();
        var isExpanded = root.isExpanded()

        node.attrs().forEach(attribute=>{

            if(isExpanded && rootPath!=attribute.lowLevel().unit().absolutePath()){
                return;
            }

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
            acceptor.accept(createIssue1(messageRegistry.INVALID_OVERRIDE_IN_OVERLAY,
                {propName: attribute.name()}, attribute));
        })
    }

}

class RecurrentOverlayValidator implements  NodeValidator{
    validate(node:hl.IHighLevelNode,v:hl.ValidationAcceptor){

        var z=new OverlayNodesValidator();
        z.validate(node,v);
        node.directChildren().forEach(x=>{ if (x.isElement()) {this.validate(x.asElement(),v)}});
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
                        var issue = createIssue1(messageRegistry.KEYS_SHOULD_BE_UNIQUE, {}, p, false);
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
                var parameters:any = { name: childElement.name() };
                var messageEntry = messageRegistry.ALREADY_EXISTS_IN_CONTEXT;
                if (humanReadableName) {
                    parameters.capitalized = changeCase.upperCaseFirst(humanReadableName);
                    messageEntry= messageRegistry.ALREADY_EXISTS;
                }

                var issue = createIssue1(messageEntry, parameters, childElement);
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
                    var parameters:any = {propName: attribute.property() ? attribute.property().nameId() : attribute.name()};
                    var messageEntry = messageRegistry.PROPERTY_USED;
                    var humanReadableParent = getHumanReadableNodeName(attribute.parent());
                    if (humanReadableParent) {
                        parameters.parent = changeCase.upperCaseFirst(humanReadableParent);
                        messageEntry = messageRegistry.PARENT_PROPERTY_USED;
                    }
                    var issue=createIssue1(messageEntry,parameters,attribute);
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
                    var parameters:any = {propName: lowLevelChildKey};
                    var messageEntry = messageRegistry.PROPERTY_USED;
                    var humanReadableNode = getHumanReadableNodeName(node);
                    if (humanReadableNode) {
                        parameters.parent = changeCase.upperCaseFirst(humanReadableNode);
                        messageEntry = messageRegistry.PARENT_PROPERTY_USED;
                    }
                    keyToLowLevelChildren[lowLevelChildKey].forEach(lowLevelChild=>{
                        var i = createLLIssue1(messageEntry,parameters,lowLevelChild,node);

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

function contentProvider(lowLevel: any,chLL?:any) {
    let root = lowLevel && lowLevel.includeBaseUnit() && ((lowLevel.includePath && lowLevel.includePath()) ? lowLevel.includeBaseUnit().resolve(lowLevel.includePath()) : lowLevel.includeBaseUnit());
    if(chLL){
        let root1 = chLL && chLL.includeBaseUnit() && ((chLL.includePath && chLL.includePath()) ? chLL.includeBaseUnit().resolve(chLL.includePath()) : chLL.includeBaseUnit());
        if(root1!=root){
            root = root1;
        }
    }

    return new contentprovider.ContentProvider(root);
}

/**
 * validates examples
 */
export class ExampleAndDefaultValueValidator implements PropertyValidator{

    validate(node:hl.IAttribute,cb:hl.ValidationAcceptor){
        //check if we expect to do strict validation

        var strictValidation=this.isStrict(node);
        if (!strictValidation){
            if (!settings.validateNotStrictExamples){
                return;
            }
        }

        var pObj=this.parseObject(node,cb,strictValidation);
        if (pObj==null){
            return;
        }
        var schema=this.aquireSchema(node);
        if (schema){
            let arg = pObj;
            if(typeof arg == "object"){
                arg = node.value();
            }
            schema.validate(arg,cb,strictValidation);
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
                        if (sampleRoot.parent().property().nameId() == universes.Universe10.MethodBase.properties.queryParameters.name) {

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
                if (hlimpl.StructuredValue.isInstance(val)){
                    return null;
                }
                var strVal=(""+val).trim();
                var so =null;
                if (strVal.charAt(0)=="{"){
                    try {
                        so = su.getJSONSchema(strVal, contentProvider(sa.lowLevel()));
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
                                if (so instanceof Error){
                                    cb.accept(createIssue1(messageRegistry.INVALID_VALUE_SCHEMA,{iValue:so.message},node,!strict));
                                    return;
                                }
                                so.validate(pObje);
                            }catch(e){
                                var illegalRequiredMessageStart = "Cannot assign to read only property '__$validated' of ";
                                if (e.message && e.message.indexOf(illegalRequiredMessageStart) == 0){
                                    var propertyName = e.message.substr(illegalRequiredMessageStart.length,
                                        e.message.length - illegalRequiredMessageStart.length);

                                    cb.accept(createIssue1(messageRegistry.INVALID_JSON_SCHEMA,
                                        {propName: propertyName},sa,!strict));
                                    return;
                                }
                                if (e.message=="Object.keys called on non-object"){
                                    return;
                                }
                                if(ValidationError.isInstance(e)){
                                    if(!checkIfIncludeTagIsMissing(node, cb, (<ValidationError>e).messageEntry.code, !strict)) {
                                        cb.accept(createIssue2(<ValidationError>e, node, !strict));
                                    }
                                    return;
                                }
                                cb.accept(createIssue1(messageRegistry.EXAMPLE_SCHEMA_FAILURE,
                                    {msg:e.message},node,!strict));
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
                    if (pt.getExtra("repeat")){
                        pObje=[pObje];
                    }
                    var validateObject = pt.validate(pObje, false);
                    if (!validateObject.isOk()) {
                        validateObject.getErrors().forEach(e=>cb.accept(
                            createIssue(e.getCode(),e.getMessage(), node, !strict, e.getInternalRange())));
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
                    cb.accept(createIssue1(messageRegistry.KEYS_SHOULD_BE_UNIQUE,
                        {}, new hlimpl.BasicASTNode(x, h.parent())))
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
        if (hlimpl.StructuredValue.isInstance(vl)){
            //validate in context of type/schema
            pObj=this.toObject(node,<hlimpl.StructuredValue>vl,cb);
        }
        else{
            if (mediaType){
                if (isJson(mediaType)){
                    try{
                        def.rt.getSchemaUtils().tryParseJSON(vl,true);
                        pObj=JSON.parse(vl);
                    }catch (e){
                        if(ValidationError.isInstance(e)){
                            if(!checkIfIncludeTagIsMissing(node, cb, (<ValidationError>e).messageEntry.code, !strictValidation)){
                                cb.accept(createIssue2(<ValidationError>e,node,!strictValidation));
                            }
                        }
                        else {
                            cb.accept(createIssue1(messageRegistry.CAN_NOT_PARSE_JSON,
                                {msg: e.message}, node, !strictValidation));
                        }
                        return;
                    }
                }
                if (isXML(mediaType)){
                    try {
                        pObj = xmlutil.parseXML(vl);
                    }
                    catch (e){
                        cb.accept(createIssue1(messageRegistry.CAN_NOT_PARSE_XML,
                            {msg:e.message},node,!strictValidation));
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
                        return vl;
                    }
                }catch (e){

                    if (vl.trim().indexOf("<")==0){
                        try {
                            pObj = xmlutil.parseXML(vl);
                        }
                        catch (e){
                            cb.accept(createIssue1(messageRegistry.CAN_NOT_PARSE_XML,
                                {msg:e.message},node,!strictValidation));
                            return;
                        }
                    }
                    else {
                        //cb.accept(createIssue1(messageRegistry.CAN_NOT_PARSE_XML,
                        // {msg: e.message}, node, !strictValidation));
                        return vl;
                    }
                }
            }
        }
        if(pObj != null && typeof pObj != "object"){
            return vl;
        }
        return pObj;
    }

    private isStrict(node:hl.IAttribute) {
        if(universeHelpers.isDefaultValue(node.property())){
            return true;
        }
        if(universeHelpers.isExampleProperty(node.property())
            &&node.parent().definition().universe().version()=="RAML08"){
            //for RAML 0.8 we do not validate examples strictly
            return false;
        }
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
    var templateName = changeCase.sentence(template).toLowerCase();
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
                        var issue = createIssue1(messageRegistry.OPTIONAL_SCLARAR_PROPERTIES_10,{
                            templateName:template.nameId(),
                            propName: attr.name()
                        }, attr, false);
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
                aNode.optionalProperties().forEach(x=>{
                    aNode.children().forEach(y=>{
                        var parameters = {
                            propName: prop.nameId(),
                            oPropName: y.lowLevel().key()
                        };
                        var issue = createIssue1(messageRegistry.OPTIONAL_PROPERTIES_10,
                            parameters, node, false);
                        v.accept(issue);
                    });
                });
            }

            var def = node.asElement().definition();
            if(node.optional()&&def.universe().version()=="RAML10"){
                var prop = node.property();
                var isParam = universeHelpers.isQueryParametersProperty(prop)
                    ||universeHelpers.isUriParametersProperty(prop)
                    ||universeHelpers.isHeadersProperty(prop);

                if(!universeHelpers.isMethodType(def)&&!(universeHelpers.isTypeDeclarationType(def)&&isParam)){
                    var issue = createIssue1(messageRegistry.ONLY_METHODS_CAN_BE_OPTIONAL, {}, node, false);
                    v.accept(issue);
                }
            }
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
            if (!uriValue||typeof(uriValue)!="string") {
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
                        var propNameReadable = changeCase.upperCaseFirst(
                            pluralize.singular(changeCase.sentence(paramsPropName)));
                        var issue = createIssue1(messageRegistry.PROPERTY_UNUSED, {propName: propNameReadable}, x, true);
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
                var typeName = toReadableName(template.definition().nameId());
                var cycleStr = cycle.join(" -> ");
                var parameters = {
                    typeName: typeName,
                    cycle: cycleStr
                };
                var issue = createIssue1(messageRegistry.CYCLE_IN_DEFINITION, parameters, template, false);
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
            if (val) {
                var refName = typeof(val) == 'string' || typeof(val) == 'number' ||  typeof(val) == 'boolean' ? (val + '') : val.valueName();
                var template = templatesMap[refName];
                if (template != null) {
                    var newCycles = this.findCyclesInDefinition(
                        template, propName, templatesMap, nextOccuredTemplates);

                    newCycles.forEach(x=>occuredCycles.push(x));
                }
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
                if (node.parent().property().nameId()==universes.Universe10.MethodBase.properties.queryParameters.name
                    ||node.parent().property().nameId()==universes.Universe10.MethodBase.properties.headers.name){
                    return null;
                }
                return node.parent().name();
            }
        }
    }
    return null;
}

var offsetRegexp = /^[ ]*/;

function subRangError(
    hlNode:hl.IParseResult,
    llNode:ll.ILowLevelASTNode,
    code,
    isWarning,
    message,
    setPath:boolean,
    prop:hl.IProperty,
    internalRange:def.rt.tsInterfaces.RangeObject,
    forceScalar = false,
    positionsFromValue = false):hl.ValidationIssue {

    if (!internalRange) {
        return null;
    }

    let st = llNode.start();
    let et = llNode.end();

    let aNode = llNode.actual();
    let aValNode = aNode && aNode.value;
    let rawVal = aValNode && aValNode.rawValue;
    ;
    let valueKind = llNode.valueKind();
    if (valueKind == yaml.Kind.ANCHOR_REF) {
        valueKind = llNode.anchorValueKind();
    }
    let vk1 = valueKind;
    if (valueKind == yaml.Kind.INCLUDE_REF) {
        valueKind = llNode.resolvedValueKind();
    }

    if (valueKind != yaml.Kind.SCALAR && !forceScalar) {
        return null;
    }
    if (vk1 == yaml.Kind.INCLUDE_REF) {
        let includedUnit = llNode.unit().resolve(llNode.includePath());
        if (includedUnit) {
            let lineMapper = includedUnit.lineMapper();
            let sp = lineMapper.toPosition(internalRange.start.line, internalRange.start.column);
            let ep = lineMapper.toPosition(internalRange.end.line, internalRange.end.column);
            let result = {
                code: code,
                isWarning: isWarning,
                message: message,
                node: null,
                start: sp.position,
                end: ep.position,
                path: includedUnit.path(),
                extras: [],
                unit: includedUnit
            };
            let trace:hl.ValidationIssue;
            if(hlNode){
                trace = localError(hlNode, code, isWarning, message, setPath, prop, llNode);
            }
            else{
                trace = localLowLevelError(llNode,null,code,isWarning,message,setPath,null,positionsFromValue);
            }
            result.extras.push(trace);
            return result;
        }
    }
    let lineMapper = llNode.unit().lineMapper();
    let vs = llNode.valueStart();
    if (vs < 0) {
        vs = llNode.start();
    }

    let vsPos = lineMapper.position(vs);
    let aSCol: number;
    let aECol: number;
    let aSLine = vsPos.line + internalRange.start.line;
    let aELine = vsPos.line + internalRange.end.line;
    if (rawVal && typeof rawVal == "string" && rawVal.charAt(0) == "|") {
        //let keyCol = lineMapper.position(llNode.keyStart()).column;
        let i0 = rawVal.indexOf("\n") + 1;
        let i1 = rawVal.indexOf("\n", i0);
        if (i1 < 0) {
            i1 = rawVal.length;
        }
        let off = offsetRegexp.exec(rawVal.substring(i0, i1))[0].length;
        aSCol = off + internalRange.start.column;
        aECol = off + internalRange.end.column;
        aSLine++;
        aELine++;
    }
    else {
        aSCol = vsPos.column + internalRange.start.column;
        aECol = vsPos.column + internalRange.end.column;
        if (aValNode && (aValNode.singleQuoted || aValNode.doubleQuoted)) {
            aSCol++;
            aECol++;
        }
    }
    let sPoint = lineMapper.toPosition(aSLine, aSCol);
    let ePoint = lineMapper.toPosition(aELine, aECol);
    if (sPoint && ePoint) {
        st = sPoint.position;
        et = ePoint.position;
    }

    return {
        code: code,
        isWarning: isWarning,
        message: message,
        node: hlNode,
        start: st,
        end: et,
        path: setPath ? (llNode.unit() ? llNode.unit().path() : "") : null,
        extras: [],
        unit: llNode ? llNode.unit() : null
    }

}

var localError = function (
    node:hl.IParseResult,
    code,
    isWarning,
    message,
    setPath:boolean,
    prop:hl.IProperty,
    positionsSource?:ll.ILowLevelASTNode,
    internalRange?:def.rt.tsInterfaces.RangeObject,
    forceScalar = false):hl.ValidationIssue {
    let llNode = positionsSource ? positionsSource : node.lowLevel();

    if(internalRange){
        let err = subRangError(node,llNode,code,isWarning,message,setPath,prop,internalRange,forceScalar);
        if(err){
            return err;
        }
    }
    let contents = llNode.unit() && llNode.unit().contents();
    let contentLength = contents && contents.length;

    let st = llNode.start();
    let et = llNode.end();

    if (contentLength && contentLength < et) {
        et = contentLength - 1;
    }

    if (llNode.key() && llNode.keyStart()) {
        let ks = llNode.keyStart();
        if (ks > 0) {
            st = ks;
        }
        let ke = llNode.keyEnd();
        if (ke > 0) {
            et = ke;
        }
    }
    if (et < st) {
        et = st + 1;
        //this happens for empty APIs, when we basically have nothing to parse
        if (node.isElement()) {
            var definition = (<hl.IHighLevelNode> node).definition();
            if (universeHelpers.isApiType(definition)) {
                st = contentLength == 0 ? 0 : contentLength - 1;
                et = st;
            }
        }
    }
    if (prop && !prop.getAdapter(services.RAMLPropertyService).isMerged() && node.parent() == null) {
        var nm = _.find(llNode.children(), x => x.key() == prop.nameId());
        if (nm) {
            let ks = nm.keyStart();
            let ke = nm.keyEnd();
            if (ks > 0 && ke > ks) {
                st = ks;
                et = ke;
            }
        }

    }
    return {
        code: code,
        isWarning: isWarning,
        message: message,
        node: node,
        start: st,
        end: et,
        path: setPath ? (llNode.unit() ? llNode.unit().path() : "") : null,
        extras: [],
        unit: node ? llNode.unit() : null
    }
};

var localLowLevelError = function (
    node:ll.ILowLevelASTNode,
    highLevelAnchor : hl.IParseResult,
    code,
    isWarning,
    message,
    setPath:boolean,
    internalRange?:def.rt.tsInterfaces.RangeObject,
    positionsFromValue=false,
    forceScalar=false) : hl.ValidationIssue {

    if(internalRange){
        let err = subRangError(
            null,node,code,isWarning,message,setPath,null,internalRange,forceScalar,positionsFromValue);
        if(err){
            return err;
        }
    }

    var contents = node.unit() && node.unit().contents();
    var contentLength = contents && contents.length;

    var st = node.start();
    var et = node.end();
    if (contentLength && et >= contentLength) {
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
    let val = node.value(true);
    if(positionsFromValue && val && val.length>0){
        st = node.valueStart();
        et = node.valueEnd();
    }


    return {
        code: code,
        isWarning: isWarning,
        message: message,
        node: highLevelAnchor,
        start: st,
        end: et,
        path: setPath?(node.unit() ? node.unit().path() : ""):null,
        extras:[],
        unit:node?node.unit():null
    }
};


export function toIssue(error: any, node: hl.IHighLevelNode): hl.ValidationIssue {
    return createIssue(error.getCode(), error.getMessage(), mapPath(node, error).node, error.isWarning());
}

function createIssue2(ve:ValidationError,node:hl.IParseResult,_isWarning?:boolean){

    let isWarning = _isWarning != null ? _isWarning : ve.isWarning;

    let internalPath = ve.internalPath;
    let actualNode = node;
    let internalPathUsed = false;
    let valueKind = node.lowLevel().valueKind();
    if(valueKind==yaml.Kind.INCLUDE_REF){
        valueKind = node.lowLevel().resolvedValueKind();
    }
    if(internalPath && valueKind != yaml.Kind.SCALAR){
        let ivp = def.rt.toValidationPath(internalPath);
        if(ivp){
            let n = findElementAtPath(node,ivp);
            if(n && (n != node)){
                actualNode = n;
                internalPathUsed = true;
            }
        }
    }
    let internalRange = internalPathUsed ? null : ve.internalRange;
    let result = createIssue1(ve.messageEntry,ve.parameters,actualNode,isWarning,internalRange);
    if(ve.filePath){
        let actualUnit = node.lowLevel().unit().project().unit(ve.filePath,true);
        result.unit = actualUnit;
        result.path = ve.filePath;
    }
    return result;
}

export function createIssue1(
    messageEntry:any,
    parameters: any,
    node:hl.IParseResult,
    isWarning:boolean=false,
    internalRange?:def.rt.tsInterfaces.RangeObject):hl.ValidationIssue {

    let msg = applyTemplate(<Message>messageEntry,parameters);
    let inKey = KeyErrorsRegistry.getInstance().isKeyError(messageEntry.code);
    return createIssue(messageEntry.code, msg, node, isWarning, internalRange,false,inKey);
}

export function createIssue(
    issueCode:string,
    message:string,
    node:hl.IParseResult,
    isWarning:boolean=false,
    internalRange?:def.rt.tsInterfaces.RangeObject,
    forceScalar = false,
    inKey=false):hl.ValidationIssue{
    //console.log(node.name()+node.lowLevel().start()+":"+node.id());
    var original=null;
    var pr:hl.IProperty=null;
    if (proxy.LowLevelProxyNode.isInstance(node.lowLevel())){
        var proxyNode:proxy.LowLevelProxyNode=<proxy.LowLevelProxyNode>node.lowLevel();
        while (!proxyNode.primaryNode()){
            if (!original){
                let paramsChain = proxyNode.transformer() && proxyNode.transformer().paramNodesChain(proxyNode,inKey);
                if(paramsChain && paramsChain.length>0){
                    if(node.lowLevel().valueKind()!=node.lowLevel().resolvedValueKind()) {
                        original = localError(node, issueCode, isWarning, message, false, pr, null, internalRange,forceScalar);
                        internalRange = null;
                        forceScalar = false;
                    }
                    else{
                        original = localError(node, issueCode, isWarning, message, false, pr, null);
                    }
                    let o = original;
                    while(o.extras.length>0){
                        o = o.extras[0];
                    }
                    for(let i = 0 ; i < paramsChain.length ; i++){
                        let pNode = paramsChain[i];
                        let ir = (i==paramsChain.length-1) ? internalRange : null;
                        let fs = (i==paramsChain.length-1) ? forceScalar : false;
                        let e = localLowLevelError(pNode,null,issueCode,isWarning,message,false,ir,true,fs);
                        o.extras.push(e);
                        o = e;
                    }
                    return original;
                }
                else{
                    original=localError(node,issueCode,isWarning,message,true,pr,null,internalRange,forceScalar);
                }
                internalRange = null;
            }
            node=node.parent();
            proxyNode=<proxy.LowLevelProxyNode>node.lowLevel();
        }
    }
    var oNode = node;
    if (node) {
        pr=node.property();

        if (node.lowLevel().unit() != node.root().lowLevel().unit()) {
            original=localError(node,issueCode,isWarning,message,true,pr,null,internalRange,forceScalar);
            internalRange = null;
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
        var resolver = (<jsyaml.Project>node.lowLevel().unit().project()).namespaceResolver();
        if(resolver){
            var uInfo = resolver.resolveNamespace(node.root().lowLevel().unit(),oNode.lowLevel().unit());
            if(uInfo){
                var issues = uInfo.usesNodes.map(x=>createLLIssue1(messageRegistry.ISSUES_IN_THE_LIBRARY,
                    {value: x.value()}, x, x.unit().highLevel(),true));
                issues.push(original);
                issues = issues.reverse();
                for(var i = 0 ; i < issues.length-1 ; i++){
                    issues[i].extras.push(issues[i+1]);
                }
                return original;
            }
        }
        if (node.property()&&node.property().nameId()==universes.Universe10.FragmentDeclaration.properties.uses.name&&node.parent()!=null){
            pr=node.property();//FIXME there should be other cases
            node=node.parent();
        }
    }
    var error=localError(node, issueCode, isWarning, message,false,pr,null,internalRange,forceScalar);
    if (original) {
        let o = original;
        while(o.extras && o.extras.length>0){
            o = o.extras[0];
        }
        o.extras.push(error);
        if(node.lowLevel().valueKind()==yaml.Kind.INCLUDE_REF) {
            var messageEntry = messageRegistry.ERROR_IN_INCLUDED_FILE;
            error.code = messageEntry.code;
            error.message = applyTemplate(messageEntry,{msg: error.message});
        }
        error = original;
    }
    //console.log(error.start+":"+error.end)
    return error;
}

function createLLIssue1(
    messageEntry:any,
    parameters:any,
    node:ll.ILowLevelASTNode,
    rootCalculationAnchor: hl.IParseResult,
    isWarning:boolean=false,
    p=false,
    internalRange?:def.rt.tsInterfaces.RangeObject){

    var msg = applyTemplate(<Message>messageEntry,parameters);
    return createLLIssue(messageEntry.code, msg, node, rootCalculationAnchor,isWarning,p,internalRange);
}

export function createLLIssue(
    issueCode:string,
    message:string,
    node:ll.ILowLevelASTNode,
    rootCalculationAnchor: hl.IParseResult,
    isWarning:boolean=false,
    p=false,
    internalRange?:def.rt.tsInterfaces.RangeObject):hl.ValidationIssue{
    var original=null;

    if (node) {

        var rootUnit = rootCalculationAnchor.root().lowLevel().unit();
        if (rootCalculationAnchor.lowLevel().unit() != rootUnit) {
            original=localLowLevelError(node,rootCalculationAnchor,issueCode,isWarning,message,true,internalRange);
            var v=rootCalculationAnchor.lowLevel().unit();
            if (v) {
                message = message + " " + v.path();
            }
            while(rootCalculationAnchor.lowLevel().unit()!=rootUnit){
                rootCalculationAnchor=rootCalculationAnchor.parent();
            }
        }
    }
    if (original){
        internalRange = null;
        if (rootCalculationAnchor.property()&&rootCalculationAnchor.property().nameId()
            ==universes.Universe10.FragmentDeclaration.properties.uses.name&&rootCalculationAnchor.parent()!=null){
            rootCalculationAnchor=rootCalculationAnchor.parent();
        }
        node = rootCalculationAnchor.lowLevel();
    }
    var error=localLowLevelError(node, rootCalculationAnchor, issueCode, isWarning, message,p,internalRange);
    if (original) {
        original.extras.push(error);
        if(node.valueKind()==yaml.Kind.INCLUDE_REF) {
            error.message = applyTemplate(messageRegistry.ERROR_IN_INCLUDED_FILE, {msg: error.message});
        }
        error = original;
    }
    //console.log(error.start+":"+error.end)
    return error;
}
export function validateResponseString(v:string):any{
    if (v.length!=3){
        return new ValidationError(messageRegistry.STATUS_MUST_BE_3NUMBER);
    }
    for (var i=0;i<v.length;i++){
        var c=v[i];
        if (!_.find(['0','1','2','3','4','5','6','7','8','9'],x=>x==c)){
            return new ValidationError(messageRegistry.STATUS_MUST_BE_3NUMBER);
        }
    }
    return null;
}


export interface Message{
    code: number
    message: string
    func?: (x:any)=>string
}

export function applyTemplate(messageEntry:Message, params:any):string {
    let result = "";
    let msg = messageEntry.message;
    let prev = 0;
    for (let ind = msg.indexOf("{{"); ind >= 0; ind = msg.indexOf("{{", prev)) {
        result += msg.substring(prev, ind);
        prev = msg.indexOf("}}", ind);
        if (prev < 0) {
            prev = ind;
            break;
        }
        ind += "{{".length;
        let paramString = msg.substring(ind, prev);
        let paramSegments = paramString.split('|');
        let paramName = paramSegments[0].trim();
        let functions = expander.getTransformersForOccurence(paramString);
        prev += "}}".length;
        let paramValue = params[paramName];
        if (paramValue === undefined) {
            throw new Error(applyTemplate(messageRegistry.MESSAGE_PARAMETER_NO_VALUE, {paramName: paramName}));
        }
        for(let f of functions) {
            paramValue = f(paramValue);
        }
        result += paramValue;
    }
    result += msg.substring(prev, msg.length);
    return result;
};

function isURLorPath(str:string):boolean{

    if(!str){
        return false;
    }
    str = str.trim().toLowerCase();
    if(str.indexOf('\n')>=0||str.indexOf('\r')>=0){
        return false;
    }

    if(util.startsWith(str,"http://")){
        str = str.substring("http://".length);
    }
    else if(util.startsWith(str,"https://")){
        str = str.substring("https://".length);
    }
    else if(util.startsWith(str,"./")){
        str = str.substring("./".length);
    }
    else if(util.startsWith(str,"/")){
        str = str.substring("/".length);
    }
    str = str.replace(/\.\.\//g,'');
    let arr = str.split("/");
    if(arr.length==0){
        return false;
    }
    for(var s of arr){
        if(!/^[-a-z\\d%_.~+]+$/.test(s)){
            return false;
        }
    }
    return true;
}

function checkIfIncludeTagIsMissing(
    mappedNode: hl.IParseResult, v: hl.ValidationAcceptor,code:string,isWarning:boolean=false):boolean {

    if(code != messageRegistry.SCALAR_PROHIBITED.code
        && code != messageRegistry.SCALAR_PROHIBITED_2.code
        && code != "CAN_NOT_PARSE_JSON"
        && code != "TYPE_EXPECTED"
        && code != "CONTENT_DOES_NOT_MATCH_THE_SCHEMA"
        && code != "INHERITING_UNKNOWN_TYPE"
        && code != "SCHEMA_ERROR"
        && code != "UNRECOGNIZED_ELEMENT"){
        return false;
    }
    if (mappedNode) {
        let llNode = mappedNode.lowLevel();
        let valueKind = llNode.valueKind();
        if(valueKind==yaml.Kind.ANCHOR_REF){
            valueKind = llNode.anchorValueKind();
        }
        if(valueKind==yaml.Kind.INCLUDE_REF){
            return false;
        }
        let prop = mappedNode.property();
        if (!prop) {
            prop = (<hlimpl.BasicASTNode>mappedNode).knownProperty;
        }
        let isExample = universeHelpers.isExampleProperty(prop)
            || universeHelpers.isExamplesProperty(prop);
        let isType = universeHelpers.isTypeOrSchemaProperty(prop);
        if(!isType){
            if(prop && universeHelpers.isGlobalSchemaType(prop.domain())
                && universeHelpers.isValueProperty(prop)){
                isType = true;
            }
        }
        if (prop && (isType||isExample||!prop.range().isValueType())) {

            let parent = mappedNode.parent();
            if(!parent){
                return false;
            }
            let pDef = parent.definition();
            let val = mappedNode.lowLevel().value();
            if (typeof val == "string" && isURLorPath(val)) {
                if(val.indexOf(".")<0){
                    return false;
                }
                if(isExample) {
                    if (!(universeHelpers.isBodyLikeType(pDef)
                        || universeHelpers.isObjectTypeDeclarationSibling(pDef)
                        || universeHelpers.isArrayTypeDeclarationSibling(pDef))) {
                        return false;
                    }
                    if(!(util.endsWith(val,".raml")||util.endsWith(val,".yml")||util.endsWith(val,".yaml")
                        ||util.endsWith(val,".xml")||util.endsWith(val,".json"))){
                        return false;
                    }
                }
                else if(isType){
                    if(!(util.endsWith(val,".raml")||util.endsWith(val,".yml")||util.endsWith(val,".yaml")
                        ||util.endsWith(val,".xml")||util.endsWith(val,".json")||util.endsWith(val,".xsd"))){
                        return false;
                    }
                }
                else{
                    if(!(util.endsWith(val,".raml")||util.endsWith(val,".yml")||util.endsWith(val,".yaml"))){
                        return false;
                    }
                }
                let issue = createIssue1(messageRegistry.INCLUDE_TAG_MISSING, null, mappedNode, isWarning);
                v.accept(issue);
                return true;
            }
        }
        return false;
    }
};

class PropertyNamesRegistry{

    private static instance:PropertyNamesRegistry;

    public static getInstance():PropertyNamesRegistry{
        if(!PropertyNamesRegistry.instance){
            PropertyNamesRegistry.instance = new PropertyNamesRegistry();
        }
        return PropertyNamesRegistry.instance;
    }

    constructor(){
        this.init();
    }

    private propertiesMap:{[key:string]:boolean} = {};

    private init(){
        let universeNames = def.getUniverse.availableUniverses();
        for(let un of universeNames){
            let u = def.getUniverse(un);
            for(let t of u.types()){
                for(let p of t.properties()){
                    this.propertiesMap[p.nameId()] = true;
                }
            }
        }
    }

    public hasProperty(pName:string):boolean{
        return this.propertiesMap[pName]||false;
    }

}

class KeyErrorsRegistry{

    private static instance:KeyErrorsRegistry;

    public static getInstance():KeyErrorsRegistry{
        if(!KeyErrorsRegistry.instance){
            KeyErrorsRegistry.instance = new KeyErrorsRegistry();
        }
        return KeyErrorsRegistry.instance;
    }

    constructor(){
        this.init();
    }

    private codesMap:{[key:string]:boolean} = {};

    private init() {
        let keyErrorsArray: any = [
            messageRegistry.NODE_KEY_IS_A_MAP,
            messageRegistry.NODE_KEY_IS_A_SEQUENCE,
            messageRegistry.UNKNOWN_NODE,
            messageRegistry.INVALID_PROPERTY_USAGE,
            messageRegistry.INVALID_SUBRESOURCE_USAGE,
            messageRegistry.INVALID_METHOD_USAGE,
            messageRegistry.SPACES_IN_KEY,
            messageRegistry.UNKNOWN_ANNOTATION,
            messageRegistry.INVALID_ANNOTATION_LOCATION,
            messageRegistry.KEYS_SHOULD_BE_UNIQUE,
            messageRegistry.ALREADY_EXISTS,
            messageRegistry.ALREADY_EXISTS_IN_CONTEXT,
            messageRegistry.PROPERTY_USED,
            messageRegistry.PARENT_PROPERTY_USED,
            messageRegistry.UNKNOWN_ANNOTATION_TYPE,
            messageRegistry.LIBRARY_CHAINIG_IN_ANNOTATION_TYPE,
            messageRegistry.LIBRARY_CHAINIG_IN_ANNOTATION_TYPE_SUPERTYPE
        ];
        for (let me of keyErrorsArray) {
            this.codesMap[me.code] = true;
        }

    }

    public isKeyError(code:string):boolean{
        return this.codesMap[code]||false;
    }

}
