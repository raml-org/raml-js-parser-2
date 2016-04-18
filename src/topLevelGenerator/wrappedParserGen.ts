/// <reference path="../../typings/main.d.ts" />
import def=require("raml-definition-system")
import td=require("ts-model")
import util=require("../util/index")
import tsModel = require("ts-structure-parser")
import helperMethodExtractor = tsModel.helperMethodExtractor
import nominals = def.rt.nominalTypes;


import path = require("path")

var parserCoreModuleVar = 'core';

var helperSources = {

    "RAML10":{
        "helper": {
            "source": path.resolve(__dirname, "../../src/raml1/wrapped-ast/wrapperHelper.ts"),
            "import": "../../raml1/wrapped-ast/wrapperHelper"
        }
    },
    "RAML08":{
        "helper": {
            "source": path.resolve(__dirname, "../../src/raml1/wrapped-ast/wrapperHelper08.ts"),
            "import": "../../raml1/wrapped-ast/wrapperHelper08"
        }
    }
};

export class ParserGenerator{

    interfaceModule=new td.TSAPIModule();
    implementationModule=new td.TSAPIModule();

    processed:{[name:string]:def.IType}={};

    processType(u:def.IType, generateConstructor?:boolean) {

        var isCustom = (<def.NodeClass>u).isCustom();
        var typeName = u.nameId();
        if (this.processed[typeName]){
            return;
        }
        this.processed[typeName]=u;
        u.superTypes().forEach(x=>this.processType(<def.IType>x,generateConstructor));
        var idcl = new td.TSInterface(this.interfaceModule, typeName);
        idcl._comment = u.description();
        var dcl = new td.TSClassDecl(this.implementationModule, typeName + "Impl");
        dcl._comment = u.description();
        if(u.superTypes().length==0){
            if( (generateConstructor || u.hasValueTypeInHierarchy())
                && typeName!='ValueType'
                && typeName!='Reference') {

                var _constructor = new td.TSConstructor(dcl);
                _constructor.parameters = [
                    new td.Param(
                        _constructor,
                        'attr',
                        td.ParamLocation.OTHER,
                        new td.TSSimpleTypeReference(td.Universe, 'hl.IAttribute'))
                ];
                _constructor._body = '';
            }
        }
        else if (u instanceof def.NodeClass) {
            var _constructor = new td.TSConstructor(dcl);
            _constructor.parameters = [
                new td.Param(
                    _constructor,
                    'nodeOrKey',
                    td.ParamLocation.OTHER,
                    new td.TSSimpleTypeReference(td.Universe, 'hl.IHighLevelNode|string')),

                new td.Param(
                    _constructor,
                    'setAsTopLevel',
                    td.ParamLocation.OTHER,
                    new td.TSSimpleTypeReference(td.Universe, 'boolean'),
                    true)
            ];
            _constructor.parameters[1].optional = true;
            _constructor._body = `super((typeof  nodeOrKey=="string")?create${u.nameId()}(<string>nodeOrKey):<hl.IHighLevelNode>nodeOrKey,setAsTopLevel)`
        }

        dcl.implements.push(new td.TSSimpleTypeReference(td.Universe,idcl.name));

        var implementaionQueue:def.IType[] = [u].concat(this.extractSecondarySupertypes(u));
        if(typeName=='Reference'||typeName=='ValueType') {
            idcl.extends.push(new td.TSSimpleTypeReference(td.Universe, 'core.AttributeNode'));
            dcl.extends.push(new td.TSSimpleTypeReference(td.Universe, 'core.AttributeNodeImpl'));
        }
        else{
            u.superTypes().forEach(x=> {
                idcl.extends.push(new td.TSSimpleTypeReference(td.Universe, x.nameId()));
            });
            if(u.superTypes().length>0){
                dcl.extends.push(new td.TSSimpleTypeReference(td.Universe, u.superTypes()[0].nameId() + "Impl"));
            }
        }
        u.properties().forEach(x=>this.createMethodDecl(idcl, x));

        implementaionQueue.forEach(y=>y.properties().forEach(x=> {
            var z=this.createMethodDecl(dcl, x);
            if(z) {
                z._body = this.generateBody(x);
                if (this.typeMap[x.range().nameId()]||x.range().nameId()=='AnyType') {
                    this.createSetterMethodDecl(dcl, x);
                }
            }
        }));

        (<def.AbstractType>u).customProperties().forEach(x=> {
            this.createMethodDecl(idcl, x);
        });
        if (dcl.extends.length==0 ){
            if(!(<def.NodeClass>u).isCustom()) {
                if(u.hasValueTypeInHierarchy()){
                    idcl.extends.push(new td.TSSimpleTypeReference(td.Universe, "core.AbstractWrapperNode"));
                }
                else {
                    idcl.extends.push(new td.TSSimpleTypeReference(td.Universe, "core.BasicNode"));
                    dcl.extends.push(new td.TSSimpleTypeReference(td.Universe, "core.BasicNodeImpl"));
                }
            }
        }

        this.addImplementationMethod(dcl,'wrapperClassName', 'string',`return "${typeName}Impl";`,'@hidden\n@return Actual name of instance class');
        this.addImplementationMethod(dcl,'kind', 'string',`return "${typeName}";`,'@return Actual name of instance interface');

        if(typeName=='ValueType'){
            var valueComment = '@return JS representation of the node value';
            this.addInterfaceMethod(idcl, 'value', 'any', valueComment);
            this.addImplementationMethod(dcl,'value', 'any','return this.attr.value();', valueComment);
        }
        else if(typeName=='StringType'){
            var valueComment = '@return String representation of the node value';
            this.addInterfaceMethod(idcl, 'value', 'string', valueComment);
            this.addImplementationMethod(dcl,'value', 'string','return this.attr.value();', valueComment);
        }
        else if(typeName=='NumberType'){
            var valueComment = '@return Number representation of the node value';
            this.addInterfaceMethod(idcl, 'value', 'number', valueComment);
            this.addImplementationMethod(dcl,'value', 'number','return this.attr.value();', valueComment);
        }
        else if(typeName=='BooleanType'){
            var valueComment = '@return Boolean representation of the node value';
            this.addInterfaceMethod(idcl, 'value', 'boolean', valueComment);
            this.addImplementationMethod(dcl,'value', 'boolean','return this.attr.value();', valueComment);
        }
        else if(typeName=='Reference'){
            var valueComment = '@return StructuredValue object representing the node value';
            this.addImplementationMethod(dcl,'value', 'hl.IStructuredValue','return core.toStructuredValue(this.attr);',valueComment);
            this.addInterfaceMethod(idcl,'value', 'hl.IStructuredValue',valueComment);
        }

        this.addHelperMethods(u,idcl);
        this.addHelperMethods(u,dcl,true);
        u.subTypes().forEach(x=>this.processType(<def.IType>x));

        if(isCustom){
            this.implementationModule.removeChild(dcl);
        }
    }

    private addInterfaceMethod(
        idcl:td.TSInterface,
        methodName:string,
        returnTypeName:string,
        comment?:string):td.TSAPIElementDeclaration {

        var existing = this.getExistingMethods(idcl, methodName);
        existing.forEach(x=>idcl.removeChild(x));
        var method = new td.TSAPIElementDeclaration(idcl, methodName);
        method.isFunc = true;
        method.rangeType = new td.TSSimpleTypeReference(method, returnTypeName);
        if(comment && comment.trim().length>0) {
            method._comment = comment;
        }
        else if(existing.length>0){
            method._comment = existing[0]._comment;
        }
        return method;
    }

    private getExistingMethods(idcl, methodName):td.TSAPIElementDeclaration[] {
        var arr:td.TSAPIElementDeclaration[] = [];
        idcl.children().filter(x=> {
            if (!(x instanceof td.TSAPIElementDeclaration)) {
                return false;
            }
            var m:td.TSAPIElementDeclaration = <td.TSAPIElementDeclaration>x;
            return m.name == methodName;
        }).forEach(x=>arr.push(x));
        return arr;
    }

    private addImplementationMethod(
        dcl:td.TSInterface,
        methodName:string,
        returnTypeName:string,
        body:string,
        comment?:string):td.TSAPIElementDeclaration {

        var existing = this.getExistingMethods(dcl, methodName);
        existing.forEach(x=>dcl.removeChild(x));
        var method = this.addInterfaceMethod(dcl, methodName, returnTypeName);
        method._body = body;
        if(comment && comment.trim().length>0) {
            method._comment = comment;
        }
        else if(existing.length>0){
            method._comment = existing[0]._comment;
        }
        return method;
    }

    private generateBody(x:nominals.IProperty) {

        var rangeType = x.range().nameId();
        if (x.isValueProperty()) {
            var args = [ `'${x.nameId()}'` ];
            if( this.typeMap[rangeType]){
                rangeType = this.typeMap[rangeType];
                args.push(`this.to${util.firstToUpper(rangeType)}`);
            }
            else if(rangeType!='AnyType'){
                args.push(`(attr:hl.IAttribute)=>new ${rangeType}Impl(attr)`)
            }
            if(x.isMultiValue()){
                return `
             return <${rangeType}[]>super.attributes(${args.join(', ')});
         `;
            }
            else{
                return `
             return <${rangeType}>super.attribute(${args.join(', ')});
         `;
            }
        }
        else {

            if(x.isMultiValue()){
                return `
             return <${rangeType}[]>super.elements('${x.nameId()}');
         `;
            }
            else{
                return `
             return <${rangeType}>super.element('${x.nameId()}');
         `;
            }
        }
    }

    private addHelperMethods(u:def.IType,decl:td.TSInterface,isImpl:boolean=false){

        this.initHelpers(u);
        var methods = this.helperMethods[u.nameId()];
        if(!methods){
            return;
        }
        methods.forEach(m=>{

            if(m.meta.primary && !isImpl){
                return;
            }

            var methodName = m.wrapperMethodName;
            var existing = this.getExistingMethods(decl, methodName);
            var existingComment:string = "";
            if(isImpl){
                existing.forEach(x=>{
                    x.name += '_original';
                    var comment = x._comment || "";
                    if(comment.trim().length>0){
                        existingComment = comment;
                        comment += "\n";
                    }
                    x._comment = comment + "@hidden";
                });
            }
            else{
                existing.forEach(x=>decl.removeChild(x));
            }
            var method = new td.TSAPIElementDeclaration(decl, methodName);
            var comment = m.meta.comment || "";
            if(m.meta.deprecated){
                if(comment.trim().length>0){
                    comment += '\n';
                }
                comment += '@deprecated';
            }
            if(existingComment.length>0){
                method._comment = existingComment;
            }
            else if(comment.trim().length>0) {
                method._comment = comment;
            }
            var returnType = this.createTypeForModel(m.returnType, method);
            method.isFunc = true;
            method.rangeType = returnType;
            m.callArgs().filter(x=>x.name!="this").forEach(x=>{

                if(!method.parameters){
                    method.parameters = [];
                }
                var paramType = this.createTypeForModel(x.type, method);
                method.parameters.push(new td.Param(method,x.name,td.ParamLocation.OTHER,paramType));
            });

            if(isImpl){
                method._body = `
            return helper.${m.originalName}(${m.callArgs().map(x=>x.name).join(', ')});
        `;
            }
        });
    }

    private createTypeForModel(typeModel, method):td.TSTypeReference<any> {

        var rt:td.TSTypeReference<any>;
        if (typeModel) {
            var returnTypeComponents = helperMethodExtractor.flatten(typeModel);
            if (returnTypeComponents.length == 1) {
                var rtn = returnTypeComponents[0];
                if (rtn) {
                    rt = new td.TSSimpleTypeReference(method, rtn);
                }
            }
            else {
                var _rt:td.TSTypeReference<any> = new td.AnyType();
                returnTypeComponents.forEach(x=>_rt = _rt.union(new td.TSSimpleTypeReference(method, x)));
                rt = _rt;
            }
        }
        if (!rt) {
            rt = new td.TSSimpleTypeReference(method, "void");
        }
        return rt;
    }

    extractSecondarySupertypes(type:def.IType):def.IType[]{

        var superTypes = type.superTypes();
        if(superTypes.length<2){
            return [];
        }
        var map:{[key:string]:boolean}={};
        var arr:def.IType[] = [ superTypes[0] ];
        for(var i = 0 ; i < arr.length ; i++){
            map[arr[i].nameId()] = true;
            arr[i].superTypes().filter(x=>!map[x.nameId()]).forEach(x=>arr.push(x));
        }
        var result = superTypes.filter(x=>!map[x.nameId()]);
        for(var i = 0 ; i < result.length ; i++){
            result[i].superTypes().filter(x=>!map[x.nameId()]).forEach(x=>result.push(x));
        }
        return result;
    }

    private typeMap:{[key:string]:string} = {
        'StringType' : 'string',
        'NumberType' : 'number',
        'BooleanType' : 'boolean',
        'AnyType' : 'any'
    };

    private createSetterMethodDecl(dcl:td.TSInterface, x:nominals.IProperty):td.TSAPIElementDeclaration {
        var method = new td.TSAPIElementDeclaration(dcl, "set"+x.nameId()[0].toUpperCase()+x.nameId().substr(1))
        method.isFunc = true;
        var tname:string = "string";
        if(this.typeMap[x.range().nameId()]||x.range().nameId()=='AnyType'){
            tname = this.typeMap[x.range().nameId()];
        }
        else {
            tname = x.range().nameId();
            this.processType(x.range(), x.isValueProperty());
        }
        var ref:td.TSTypeReference<any> = new td.TSSimpleTypeReference(td.Universe, tname);

        method.parameters = [
            new td.Param(
                method,
                'param',
                td.ParamLocation.OTHER,
                ref)
        ];
        method._body=`
            this.highLevel().attrOrCreate("${x.nameId()}").setValue(""+param);
            return this;
        `;
        method._comment = `@hidden
Set ${x.nameId()} value`;
        return method;
    }
    private createMethodDecl(dcl:td.TSInterface, x:nominals.IProperty):td.TSAPIElementDeclaration {
        if(x.range().isUnion()){
            return null;
        }
        var method = new td.TSAPIElementDeclaration(dcl, x.nameId())
        method.isFunc = true
        var tname:string = "string"
        if(this.typeMap[x.range().nameId()]||x.range().nameId()=='AnyType'){
            tname = this.typeMap[x.range().nameId()];
        }
        else {
            tname = x.range().nameId();
            this.processType(x.range(), x.isValueProperty());
        }

        var ref = new td.TSSimpleTypeReference(td.Universe, tname);
        if(x.isMultiValue()){
            var aRef = new td.TSArrayReference();
            aRef.componentType = ref;
            method.rangeType = aRef;
        }
        else {
            method.rangeType = ref;
        }
        method._comment = x.description() ? x.description().trim() : null;
        return method
    }

    private helperMethods:{[key:string]:helperMethodExtractor.HelperMethod[]};

    private helperSources:any;

    private ramlVersion:string;

    initHelpers(u:def.IType){

        if(this.helperMethods){
            return;
        }
        var ver = u.universe().version();
        this.ramlVersion = ver;
        this.helperSources = helperSources[ver];

        if(!this.helperSources){
            return;
        }

        this.helperMethods = {};
        Object.keys(this.helperSources).forEach(src=> {

            var sourcePath = this.helperSources[src]['source'];
            if(!sourcePath){
                return;
            }

            var methods:helperMethodExtractor.HelperMethod[] =
                helperMethodExtractor.getHelperMethods(sourcePath);

            methods.forEach(x=> {
                x.targetWrappers().forEach(n=> {
                    var arr = this.helperMethods[n];
                    if (!arr) {
                        arr = [];
                        this.helperMethods[n] = arr;
                    }
                    arr.push(x);
                });
            });
        });
    }

    getApiImportFile() : string {
        var isRaml1 = this.ramlVersion == 'RAML10'
        if (isRaml1) {
            return "./raml10parserapi";
        } else {
            return "./raml08parserapi";
        }
    }

    serializeInterfaceToString() {

        var isRaml1 = this.ramlVersion == 'RAML10';

        return this.serializeInterfaceImportsToString()
            + this.interfaceModule.serializeToString();
    }

    serializeImplementationToString() {

        var isRaml1 = this.ramlVersion == 'RAML10';

        return this.serializeImplementationImportsToString()
            + this.implementationModule.serializeToString()
            + this.createFunctions()
            + this.serializeLoadingMethods();
    }

    serializeInterfaceImportsToString() {
        return `${this.ramlVersion == 'RAML10' ? raml10parserJsDoc : ''}
import hl=require("../../raml1/highLevelAST");
import core=require("../../raml1/wrapped-ast/parserCoreApi");

`;
    }

    serializeImplementationImportsToString() {

        var apiInterfaceImports = "";
        Object.keys(this.processed).forEach(processedName=>{
           apiInterfaceImports += ("import " + processedName + " = pApi." + processedName + ";\n");
        });

        return `${this.ramlVersion == 'RAML10' ? raml10parserJsDoc : ''}
import hl=require("../../raml1/highLevelAST");
import stubs=require("../../raml1/stubs");
import hlImpl=require("../../raml1/highLevelImpl");
import jsyaml=require("../../raml1/jsyaml/jsyaml2lowLevel");
import json2lowlevel = require('../../raml1/jsyaml/json2lowLevel');
import def=require("raml-definition-system");
import services=require("../../raml1/definition-system/ramlServices");
import core=require("../../raml1/wrapped-ast/parserCore");
import apiLoader=require("../../raml1/apiLoader");
import coreApi=require("../../raml1/wrapped-ast/parserCoreApi");
import pApi = require("${this.getApiImportFile()}");
${Object.keys(this.helperSources).filter(x=>this.helperSources[x]['import'] != null)
            .map(x=>`import ${x}=require("${this.helperSources[x]['import']}")`).join('\n')}

` + apiInterfaceImports;
    }

    serializeLoadingMethods(){
    return `
/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, options?:coreApi.Options):Api
${this.ramlVersion=='RAML10'?
`/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Api instance.
 **/
export function loadApiSync(apiPath:string, extensionsAndOverlays:string[],options?:coreApi.Options):Api
`:''}
export function loadApiSync(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Api{

        return <Api>apiLoader.loadApi(apiPath,arg1,arg2).getOrElse(null);
}

${this.ramlVersion=='RAML10'?
`/**
 * Load RAML synchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return hl.BasicNode instance.
 **/
export function loadRAMLSync(ramlPath:string, extensionsAndOverlays:string[],options?:coreApi.Options):hl.BasicNode
`:''}
export function loadRAMLSync(ramlPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):hl.BasicNode{

        return <any>apiLoader.loadApi(ramlPath,arg1,arg2).getOrElse(null);
}

/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string, options?:coreApi.Options):Promise<Api>;
${this.ramlVersion=='RAML10'?
`/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;Api&gt;.
 **/
export function loadApi(apiPath:string,extensionsAndOverlays:string[], options?:coreApi.Options):Promise<Api>;
`:''}
export function loadApi(apiPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Promise<Api>{

        return apiLoader.loadApiAsync(apiPath,arg1,arg2);
}

${this.ramlVersion=='RAML10'?
`/**
 * Load RAML asynchronously. May load both Api and Typed fragments. The Promise is rejected with [[ApiLoadingError]] if the resulting hl.BasicNode contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;hl.BasicNode&gt;.
 **/
export function loadRAML(ramlPath:string,extensionsAndOverlays:string[], options?:coreApi.Options):Promise<hl.BasicNode>;
`:''}
export function loadRAML(ramlPath:string, arg1?:string[]|coreApi.Options, arg2?:coreApi.Options):Promise<hl.BasicNode>{

        return apiLoader.loadRAMLAsync(ramlPath,arg1,arg2);
}

/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export function getLanguageElementByRuntimeType(runtimeType : hl.ITypeDefinition) : core.BasicNode {
    return apiLoader.getLanguageElementByRuntimeType(runtimeType);
}
`;

    }
    
    createFunctions():string{
        var res="";
        for (var p in this.processed){
            var q=<def.IType>this.processed[p];
            if (q instanceof def.NodeClass){
                res+=
`
/**
 * @hidden
 **/
function create${p}(key:string){
    var universe=def.getUniverse("${this.ramlVersion}");
    var nc=<def.NodeClass>universe.type("${p}");
    var node=stubs.createStubNode(nc,null,key);
    return node;
}
`;
            };
        }
        return res;
    }

    nodeFactory(highLevelASTLocation:string,parserLocation:string):string{

        var mapEntries:any = {};
        Object.keys(this.processed).forEach(x=>{
            var type = <def.AbstractType>this.processed[x];
            if(type.isCustom()){
                return;
            }
            var name = type.nameId();
            if(type.isValueType()){
                mapEntries[name] = `    "${name}": (x)=>{return new RamlWrapper.${name}Impl(x)}`;
            }
            else {
                mapEntries[name] = `    "${name}": (x,y)=>{return new RamlWrapper.${name}Impl(x,y)}`;
            }
        });
        var mapContent = Object.keys(mapEntries).sort().map(x=>mapEntries[x]).join(',\n\n');
        return`import RamlWrapper = require("${parserLocation}");
import hl = require("${highLevelASTLocation}")

/**
 * @hidden
 * Build Wrapper node corresponding to the High Level node
 **/
export function buildWrapperNode(node:hl.IHighLevelNode,setAsTopLevel:boolean=true){

    var definition = node.definition();
    var nodeClassName = definition.nameId();

    var wrapperConstructor = classMap[nodeClassName];

    if(!wrapperConstructor){
        var priorities = determineSuperclassesPriorities(definition);
        var superTypes = definition.allSuperTypes().sort((x,y)=>priorities[x.nameId()]-priorities[y.nameId()]);
        var wr=null;
        for (var i=0;i<superTypes.length;i++){
            var superTypeName=superTypes[i].nameId();
            wrapperConstructor = classMap[superTypeName];
            if (superTypeName=="DataElement"){
                wr=superTypeName;
                //This is only case of nested hierarchy
                continue;
            }
            if (superTypeName=="hl.BasicNode"){
                //depth first
                continue;
            }
            if (wrapperConstructor){
                break;
            }
        }
        if (!wrapperConstructor){
            wr=superTypeName;
        }
    }
    if (!wrapperConstructor){
        wrapperConstructor = classMap["hl.BasicNode"]

    }
    return wrapperConstructor(node,setAsTopLevel);
}

function determineSuperclassesPriorities(
    td:hl.ITypeDefinition,
    priorities:{[key:string]:number}={},
    path:{[key:string]:boolean}={}):any{

    var typeName = td.nameId();
    if(path[typeName]){
        return;
    }
    path[typeName] = true;
    var rank = (priorities[typeName]!=null && priorities[typeName] + 1 )|| 0;
    var superTypes = td.superTypes();
    superTypes.forEach(x=>{
        var name = x.nameId();
        var r = priorities[name];
        if(r==null||rank>r){
            priorities[name] = rank;
            determineSuperclassesPriorities(x,priorities,path);
        }
    });
    delete path[typeName];
    return priorities;
}

var classMap = {

${mapContent}

};
`
    }
}




export function def2Parser(u:def.IType):ParserGenerator{
    var mod=new ParserGenerator();
    mod.processType(u);
    return mod;
}

class ImplementationGenerator {

    generatedCode:string[];


    generateASTAccessor(p:def.Property){
        this.generatedCode.push(`var val=this.ast.getValue(${p.nameId()}}`)
        this.generatedCode.push(`return new ${p.range().nameId()}Impl(val)`)
    }
}

export function checkIfReference(u:nominals.ITypeDefinition):boolean{

    if(u instanceof def.ReferenceType){
        return true;
    }
    //var superTypes = u.superTypes();
    //for(var i = 0 ; i < superTypes.length ; i++){
    //    var st = superTypes[i];
    //    if(checkIfReference(st)){
    //        return true;
    //    }
    //}
    return false;
}

var raml10parserJsDoc = `/**
 * <p>See <a href="http://raml.org">http://raml.org</a> for more information about RAML.</p>
 *
 * <p>This parser is at a beta state of development, as part of the API Workbench development cycle (<a href="http://apiworkbench.com">http://apiworkbench.com</a>).</p>
 *
 * <p><a href="https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md">Getting Started Guide</a> describes the first steps with the parser.</p>
 *
 * <h2>Installation</h2>
 *
 * <pre><code>git clone https://github.com/raml-org/raml-js-parser-2
 *
 * cd raml-js-parser-2
 *
 * npm install
 *
 * node test/test.js  //here you should observe JSON representation of XKCD API in your console
 *
 * node test/testAsync.js  //same as above but in asynchronous mode
 * </code></pre>
 *
 * <h2>Usage</h2>
 *
 * <ul>
 * <li>For parser usage example refer to <code>test/test.js</code></li>
 * <li>For asynchrounous usage example refer to <code>test/testAsync.js</code></li>
 * </ul>
 **/

 `;


/**
 * Created by kor on 11/05/15.
 */

