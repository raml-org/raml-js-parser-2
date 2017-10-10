import core = require("../parser/wrapped-ast/parserCore");
import proxy = require("../parser/ast.core/LowLevelASTProxy");
import def = require("raml-definition-system")
import hl = require("../parser/highLevelAST");
import ll = require("../parser/lowLevelAST");
import hlImpl = require("../parser/highLevelImpl");
import jsyaml = require("../parser/jsyaml/jsyaml2lowLevel");
import llJson = require("../parser/jsyaml/json2lowLevel");
import referencePatcher=require("../parser/ast.core/referencePatcher");
import linter = require("../parser/ast.core/linter");

import typeSystem = def.rt;
import nominals = typeSystem.nominalTypes;
import typeExpressions = typeSystem.typeExpressions;

import universeHelpers = require("../parser/tools/universeHelpers")
import universes = require("../parser/tools/universe")
import util = require("../util/index")

import defaultCalculator = require("../parser/wrapped-ast/defaultCalculator");
import helpersLL = require("../parser/wrapped-ast/helpersLL");
import stubs = require('../parser/stubs');

import _ = require("underscore");

var pathUtils = require("path");
const RAML_MEDIATYPE = "application/raml+yaml";

export function dump(node: hl.IHighLevelNode|hl.IAttribute, options:SerializeOptions):any{
    return new JsonSerializer(options).dump(node);
}

var getRootPath = function (node:hl.IParseResult) {
    var rootPath:string;
    var rootNode = node.root();
    if (rootNode) {
        var llRoot = rootNode.lowLevel();
        if (llRoot) {
            var rootUnit = llRoot.unit()
            if (rootUnit) {
                rootPath = rootUnit.absolutePath();
            }
        }
    }
    return rootPath;
};
export class JsonSerializer {

    constructor(private options?:SerializeOptions) {
        this.options = this.options || {};
        if (this.options.serializeMetadata == null) {
            this.options.serializeMetadata = true;
        }
        if (this.options.attributeDefaults == null) {
            this.options.attributeDefaults = true;
        }
        this.defaultsCalculator = new defaultCalculator.AttributeDefaultsCalculator(true,true);
        this.nodeTransformers = [
            new ResourcesTransformer(),
            //new TypeExampleTransformer(this.options.dumpXMLRepresentationOfExamples),
            new TypeTransformer(this.options,this),
            //new ParametersTransformer(),
            //new ArrayExpressionTransformer(),
            //new UsesTransformer(),
            //new PropertiesTransformer(),
            //new ResponsesTransformer(),
            //new BodiesTransformer(),
            //new AnnotationsTransformer(),
            new SimpleNamesTransformer(),
            new TemplateParametrizedPropertiesTransformer(),

            //new FacetsTransformer(),
            new SchemasTransformer(),
            new ProtocolsToUpperCaseTransformer(),
            new ReferencesTransformer(),
            new Api10SchemasTransformer(),
            new AllUriParametersTransformer(this.options.allUriParameters)
            //new OneElementArrayTransformer()
        ];
        fillTransformersMap(this.nodeTransformers,this.nodeTransformersMap);
        fillTransformersMap(this.nodePropertyTransformers,this.nodePropertyTransformersMap);
    }

    nodeTransformers:Transformation[];

    nodePropertyTransformers:Transformation[] = [
        new MethodsToMapTransformer(),
        new TypesTransformer(),
        new TraitsTransformer(),
        new SecuritySchemesTransformer(),
        new ResourceTypesTransformer(),
        //new ResourcesTransformer(),
        //new TypeExampleTransformer(),
        new ParametersTransformer(),
        //new TypesTransformer(),
        //new UsesTransformer(),
        new PropertiesTransformer(),
//        new TypeValueTransformer(),
        // //new ExamplesTransformer(),
        new ResponsesTransformer(),
        new BodiesTransformer(),
        new AnnotationsTransformer(),
        //new SecuritySchemesTransformer(),
        //new AnnotationTypesTransformer(),
        //new TemplateParametrizedPropertiesTransformer(),
        //new TraitsTransformer(),
        //new ResourceTypesTransformer(),
        new FacetsTransformer(),
        //new SchemasTransformer(),
        //new ProtocolsToUpperCaseTransformer(),
        //new ResourceTypeMethodsToMapTransformer(),
        //new ReferencesTransformer(),
        //new OneElementArrayTransformer()
    ];

    nodeTransformersMap:TransformersMap = {};
    nodePropertyTransformersMap:TransformersMap = {};


    private defaultsCalculator:defaultCalculator.AttributeDefaultsCalculator;

    private helpersMap:{[key:string]:HelperMethod};

    private _astRoot:hl.IParseResult;

    private init(node:hl.IParseResult){

        this._astRoot = node;

        this.helpersMap = {
            "baseUriParameters" :  baseUriParametersHandler,
            "uriParameters" : uriParametersHandler
        };
        var isElement = node.isElement();
        if(isElement){
            (<hlImpl.ASTNodeImpl>node).types();
            var eNode = node.asElement();
            var definition = eNode.definition();
            if(definition.universe().version()=="RAML08"){
                if(universeHelpers.isApiType(definition)){
                    var schemasCache08 = {};
                    eNode.elementsOfKind(universes.Universe08.Api.properties.schemas.name)
                        .forEach(x=>schemasCache08[x.name()] = x);

                    this.helpersMap["schemaContent"] = new SchemaContentHandler(schemasCache08);
                }
            }
            if(universeHelpers.isApiSibling(definition)) {
                this.helpersMap["traits"] = new TemplatesHandler(helpersLL.allTraits(eNode, false));
                this.helpersMap["resourceTypes"] = new TemplatesHandler(helpersLL.allResourceTypes(eNode, false));
            }
        }
    }

    astRoot():hl.IParseResult{
        return this._astRoot;
    }

    private dispose(){
        delete this.helpersMap;
    }

    dump(node:hl.IParseResult):any {
        this.init(node);
        var isElement = node.isElement();
        var highLevelParent = node.parent();
        var rootNodeDetails = !highLevelParent && this.options.rootNodeDetails;
        var rootPath = getRootPath(node);
        var result = this.dumpInternal(node, null, rootPath,null,true);
        if (rootNodeDetails) {
            var obj:any = result;
            result= {};
            result.specification = obj;
            if(isElement) {
                var eNode = node.asElement();
                var definition = eNode.definition();
                if (definition) {
                    let universe = definition.universe();
                    var ramlVersion = universe.version();
                    result.ramlVersion = ramlVersion;
                    let typeName = definition.nameId();
                    if(!typeName){
                        if(definition.isAssignableFrom(def.universesInfo.Universe10.TypeDeclaration.name)){
                            let typeDecl = universe.type(def.universesInfo.Universe10.TypeDeclaration.name);
                            let map:any = {};
                            typeDecl.allSubTypes().forEach(x=>map[x.nameId()]=true);
                            for(let st of definition.allSuperTypes()){
                                if(map[st.nameId()]){
                                    typeName = st.nameId();
                                    break;
                                }
                            }
                        }
                    }
                    result.type = typeName;
                }
                result.errors = this.dumpErrors(core.errors(eNode));
            }
        }
        this.dispose();
        return result;
    }

    dumpInternal(_node:hl.IParseResult, nodeProperty:hl.IProperty, rp:string,meta?:core.NodeMetadata,isRoot = false):any {

        if (_node == null) {
            return null;
        }

        if((<hlImpl.BasicASTNode>_node).isReused()) {
            var reusedJSON = (<hlImpl.BasicASTNode>_node).getJSON();
            if(reusedJSON!=null){
                //console.log(_node.id());
                return reusedJSON;
            }
        }

        var result:any = {};
        if (_node.isElement()) {

            var map:{[key:string]:PropertyValue} = {};
            var eNode = _node.asElement();
            var definition = eNode.definition();

            if(universeHelpers.isExampleSpecType(definition)){
                if(eNode.parent()!=null){
                    result = "";//to be fulfilled by the transformer
                }
                else {
                    var at = hlImpl.auxiliaryTypeForExample(eNode);
                    var eObj:any = helpersLL.dumpExpandableExample(
                        at.examples()[0], this.options.dumpXMLRepresentationOfExamples);
                    var uses = eNode.elementsOfKind("uses").map(x=>this.dumpInternal(x, x.property(),rp));
                    if (uses.length > 0) {
                        eObj["uses"] = uses;
                    }
                    result = eObj;
                }
            }
            else {
                var obj:any = {};
                var children = (<hl.IParseResult[]>eNode.attrs())
                    .concat(eNode.children().filter(x=>!x.isAttr()));
                for (var ch of children) {
                    var prop = ch.property();
                    if (prop != null) {
                        var pName = prop.nameId();
                        var pVal = map[pName];
                        if (pVal == null) {
                            pVal = new PropertyValue(prop);
                            map[pName] = pVal;
                        }
                        pVal.registerValue(ch);
                    }
                    else {
                        var llNode = ch.lowLevel();
                        var key = llNode.key();
                        if (key) {
                            //obj[key] = llNode.dumpToObject();
                        }
                    }
                }
                var scalarsAnnotations = {};
                for (var p of definition.allProperties()
                    .concat((<def.NodeClass>definition).allCustomProperties())) {

                    if (def.UserDefinedProp.isInstance(p)) {
                        continue;
                    }

                    var pName = p.nameId();
                    //TODO implement as transformer or ignore case
                    if (!isRoot && pName == "uses") {
                        if (universeHelpers.isApiSibling(eNode.root().definition())) {
                            continue;
                        }
                    }
                    var pVal = map[pName];
                    if(universeHelpers.isTypeProperty(p)){
                        if (map["schema"]) {
                            var isNull = (pVal == null);
                            if(!isNull && pVal.arr.length==1 && pVal.arr[0].isAttr()){
                                isNull = (pVal.arr[0].asAttr().value()==null);
                            }
                            if(isNull) {
                                meta = meta || new core.NodeMetadataImpl();
                                (<core.NodeMetadataImpl>meta).registerInsertedAsDefaultValue("type");
                            }
                            continue;
                        }
                        if(universeHelpers.isStringTypeDeclarationDescendant(definition)){
                            if(pVal==null){
                                result["type"] = "string";
                                meta = meta || new core.NodeMetadataImpl();
                                (<core.NodeMetadataImpl>meta).registerInsertedAsDefaultValue("type");
                                continue;
                            }
                            else if (pVal.arr.length == 1 && pVal.arr[0].isAttr()) {
                                var tVal = pVal.arr[0].asAttr().value()
                                if (tVal == null){
                                    result["type"] = "string";
                                    meta = meta || new core.NodeMetadataImpl();
                                    (<core.NodeMetadataImpl>meta).registerInsertedAsDefaultValue("type");
                                    continue;
                                }
                                else if(tVal === "NULL" || tVal === "Null"){
                                    result["type"] = "string";
                                    continue;
                                }
                            }
                        }
                    }
                    pVal = this.applyHelpers(pVal, eNode, p, this.options.serializeMetadata);
                    var udVal = obj[pName];
                    let aVal:any;
                    if (pVal !== undefined) {
                        if (pVal.isMultiValue) {
                            aVal = pVal.arr.map((x,i)=>{
                                var pMeta:core.NodeMetadata = pVal.hasMeta ? pVal.mArr[i] : null;
                                return this.dumpInternal(x, pVal.prop,rp,pMeta);
                            });
                            if (p.isValueProperty()) {
                                var sAnnotations = [];
                                var gotScalarAnnotations = false;
                                pVal.arr.filter(x=>x.isAttr()).map(x=>x.asAttr())
                                    .filter(x=>x.isAnnotatedScalar()).forEach(x=> {
                                    var sAnnotations1 = x.annotations().map(x=>this.dumpInternal(x, null,rp));
                                    gotScalarAnnotations = gotScalarAnnotations || sAnnotations1.length > 0;
                                    sAnnotations.push(sAnnotations1);
                                });
                                if (gotScalarAnnotations) {
                                    scalarsAnnotations[pName] = sAnnotations;
                                }
                            }
                            if (universeHelpers.isTypeDeclarationDescendant(definition)
                                && universeHelpers.isTypeProperty(p)) {
                                //TODO compatibility crutch
                                if (pVal.arr.map(x=>(<hl.IAttribute>x).value())
                                        .filter(x=>hlImpl.isStructuredValue(x)).length > 0) {
                                    aVal = aVal[0];
                                }
                            }
                        }
                        else {
                            aVal = this.dumpInternal(pVal.val, pVal.prop,rp);
                            if (p.isValueProperty()) {
                                var attr = pVal.val.asAttr();
                                if (attr.isAnnotatedScalar()) {
                                    var sAnnotations = attr.annotations().map(x=>this.dumpInternal(x, null,rp));
                                    if (sAnnotations.length > 0) {
                                        scalarsAnnotations[pName] = sAnnotations;
                                    }
                                }
                            }
                        }

                    }
                    else if (udVal !== undefined) {
                        aVal = udVal;
                    }
                    else if (this.options.attributeDefaults) {
                        var defVal = this.defaultsCalculator.attributeDefaultIfEnabled(eNode, p);
                        if(defVal != null) {
                            meta = meta || new core.NodeMetadataImpl();
                            if (Array.isArray(defVal)) {
                                defVal = defVal.map(x=> {
                                    if (hlImpl.isASTPropImpl(x)) {
                                        return this.dumpInternal(<hl.IParseResult>x, p, rp);
                                    }
                                    return x;
                                });
                            }
                            else if (hlImpl.isASTPropImpl(defVal)) {
                                defVal = this.dumpInternal(<hl.IParseResult>defVal, p, rp);
                            }
                            aVal = defVal;
                            if (aVal != null && p.isMultiValue() && !Array.isArray(aVal)) {
                                aVal = [aVal];
                            }
                            var insertionKind = this.defaultsCalculator.insertionKind(eNode,p);
                            if(insertionKind == defaultCalculator.InsertionKind.CALCULATED) {
                                (<core.NodeMetadataImpl>meta).registerCalculatedValue(pName);
                            }
                            else if(insertionKind == defaultCalculator.InsertionKind.BY_DEFAULT){
                                (<core.NodeMetadataImpl>meta).registerInsertedAsDefaultValue(pName);
                            }
                        }
                    }
                    aVal = applyTransformersMap(eNode, p, aVal, this.nodePropertyTransformersMap);
                    if (aVal != null) {
                        //TODO implement as transformer
                        if ((pName === "type" || pName == "schema") && aVal && aVal.forEach && typeof aVal[0] === "string") {
                            var schemaString = aVal[0].trim();

                            var canBeJson = (schemaString[0] === "{" && schemaString[schemaString.length - 1] === "}");
                            var canBeXml = (schemaString[0] === "<" && schemaString[schemaString.length - 1] === ">");

                            if (canBeJson || canBeXml) {
                                var include = eNode.lowLevel().includePath && eNode.lowLevel().includePath();
                                if(!include){
                                    var typeAttr = eNode.attr("type");
                                    if(!typeAttr){
                                        typeAttr = eNode.attr("schema");
                                    }
                                    if(typeAttr){
                                        include = typeAttr.lowLevel().includePath && typeAttr.lowLevel().includePath();
                                    }
                                }

                                if(include) {

                                    var ind = include.indexOf("#");
                                    var postfix = "";
                                    if(ind>=0){
                                        postfix = include.substring(ind);
                                        include = include.substring(0,ind);
                                    }

                                    var aPath = eNode.lowLevel().unit().resolve(include).absolutePath();

                                    var relativePath;

                                    if (util.stringStartsWith(aPath,"http://") || util.stringStartsWith(aPath,"https://")) {
                                        relativePath = aPath;
                                    } else {
                                        relativePath = pathUtils.relative(eNode.lowLevel().unit().project().getRootPath(), aPath);
                                    }

                                    relativePath = relativePath.replace(/\\/g, '/');

                                    result["schemaPath"] = relativePath + postfix;
                                }
                            }
                        }
                        result[pName] = aVal;
                    }
                }
                if (this.options.dumpSchemaContents && map["schema"]) {
                    if (map["schema"].prop.range().key() == universes.Universe08.SchemaString) {
                        var schemas = eNode.root().elementsOfKind("schemas");
                        schemas.forEach(x=> {
                            if (x.name() == result["schema"]) {
                                var vl = x.attr("value");
                                if (vl) {
                                    result["schema"] = vl.value();
                                    result["schemaContent"] = vl.value();
                                }
                            }
                        })
                    }
                }
                if (this.options.serializeMetadata) {
                    this.serializeMeta(result, eNode, meta);
                }
                if (Object.keys(scalarsAnnotations).length > 0) {
                    result["scalarsAnnotations"] = scalarsAnnotations;
                }
                var pProps = helpersLL.getTemplateParametrizedProperties(eNode);
                if (pProps) {
                    result["parametrizedProperties"] = pProps;
                }
                if (universeHelpers.isTypeDeclarationDescendant(definition)) {
                    var fixedFacets = helpersLL.typeFixedFacets(eNode);
                    if (fixedFacets) {
                        result["fixedFacets"] = fixedFacets;
                    }
                }
                result = applyTransformersMap(eNode, nodeProperty || eNode.property(), result, this.nodeTransformersMap);
            }
        }
        else if (_node.isAttr()) {

            var aNode = _node.asAttr();
            var val = aNode.value();
            var prop = aNode.property();
            var rangeType = prop.range();
            var isValueType = rangeType.isValueType();
            var val:any;
            if (isValueType && aNode['value']) {
                val = aNode['value']();
                if(val==null && universeHelpers.isAnyTypeType(rangeType)){
                    let llAttrNode = aNode.lowLevel();
                    if(aNode.isAnnotatedScalar()){
                        llAttrNode = _.find(llAttrNode.children(),x=>x.key()=="value");
                    }
                    if(llAttrNode) {
                        val = aNode.lowLevel().dumpToObject();
                    }
                }
            }
            if (val!=null&&(typeof val == 'number' || typeof val == 'string' || typeof val == 'boolean')) {
                result = val;
            }
            else {
                if (hlImpl.isStructuredValue(val)) {
                    val = aNode.plainValue();
                    if(hlImpl.BasicASTNode.isInstance(val)){
                        val = this.dumpInternal(val, nodeProperty || aNode.property(),rp, null,true);
                    }
                }
                val = applyTransformersMap(aNode, nodeProperty || aNode.property(), val, this.nodeTransformersMap);
                result = val;
            }
        }
        else {
            var llNode = _node.lowLevel();
            result = llNode ? llNode.dumpToObject() : null;
        }
        _node.setJSON(result);
        return result;
    }

    getDefaultsCalculator() : defaultCalculator.AttributeDefaultsCalculator {
        return this.defaultsCalculator;
    }

    private canBeFragment(node:core.BasicNodeImpl) {

        var definition = node.definition();
        var arr = [definition].concat(definition.allSubTypes());
        var arr1 = arr.filter(x=>x.getAdapter(def.RAMLService).possibleInterfaces()
            .filter(y=>y.nameId() == def.universesInfo.Universe10.FragmentDeclaration.name).length > 0);

        return arr1.length > 0;
    }

    private dumpErrors(errors:core.RamlParserError[]) {
        return errors.map(x=> {
            var eObj = this.dumpErrorBasic(x);
            if (x.trace && x.trace.length > 0) {
                eObj['trace'] = this.dumpErrors(x.trace);
            }
            return eObj;
        }).sort((x, y)=> {
            if (x.path != y.path) {
                return x.path.localeCompare(y.path);
            }
            if (x.range.start.position != y.range.start.position) {
                return x.range.start.position - y.range.start.position;
            }
            return x.code - y.code;
        });
    }

    private dumpErrorBasic(x) {
        var eObj:any = {
            "code": x.code, //TCK error code
            "message": x.message,
            "path": x.path,
            "line": x.line,
            "column": x.column,
            "position": x.start,
            "range": x.range
        };
        if (x.isWarning === true) {
            eObj.isWarning = true;
        }
        return eObj;
    }

    serializeMeta(obj:any, node:hl.IHighLevelNode,_meta:core.NodeMetadata) {
        if (!this.options.serializeMetadata) {
            return;
        }
        var definition = node.definition();
        var isOptional = universeHelpers.isMethodType(definition)&&node.optional();
        if(!_meta && !isOptional){
            return;
        }
        var meta = <core.NodeMetadataImpl>_meta || new core.NodeMetadataImpl(false,false);
        if(isOptional){
            meta.setOptional();
        }
        //if (!meta.isDefault()) {
        obj["__METADATA__"] = meta.toJSON();
        //}
    }

    private applyHelpers(pVal:PropertyValue,
                         node:hl.IHighLevelNode,
                         p:hl.IProperty,
                         serializeMetadata:boolean) {

        var pName = p.nameId();
        var hMethod = this.helpersMap[pName];
        if (!hMethod) {
            return pVal;
        }
        var newVal = hMethod.apply(node, pVal, p, serializeMetadata);
        if (!newVal) {
            return pVal;
        }
        return newVal;
    }

}

export interface SerializeOptions{

    /**
     * For root nodes additional details can be included into output. If the option is set to `true`,
     * node content is returned as value of the **specification** root property. Other root properties are:
     *
     * * **ramlVersion** version of RAML used by the specification represented by the node
     * * **type** type of the node: Api, Overlay, Extension, Library, or any other RAML type in fragments case
     * * **errors** errors of the specification represented by the node
     * @default false
     */
    rootNodeDetails?:boolean

    /**
     * Whether to serialize metadata
     * @default true
     */
    serializeMetadata?:boolean

    dumpXMLRepresentationOfExamples?:boolean

    dumpSchemaContents?:boolean

    attributeDefaults?:boolean

    allUriParameters?:boolean

    unfoldTypes?:boolean

    typeReferences?:boolean
}

class PropertyValue{

    constructor(public prop:hl.IProperty){
        this.isMultiValue = prop.isMultiValue();
    }

    arr:hl.IParseResult[] = [];
    mArr:core.NodeMetadata[] = [];
    val:hl.IParseResult;
    isMultiValue:boolean;

    hasMeta:boolean;

    registerValue(val:hl.IParseResult){
        if(this.isMultiValue){
            this.arr.push(val);
        }
        else{
            this.val = val;
        }
    }

    registerMeta(m:core.NodeMetadata){
        if(this.isMultiValue){
            this.mArr.push(m);
        }
    }
}


function applyHelpers(
    pVal:PropertyValue,
    node:hl.IHighLevelNode,
    p:hl.IProperty,
    serializeMetadata:boolean,
    schemasCache08:{[key:string]:hl.IHighLevelNode}){

    var newVal:PropertyValue;
    if(universeHelpers.isBaseUriParametersProperty(p)){
        newVal = baseUriParameters(node,pVal,p,serializeMetadata);
    }
    if(universeHelpers.isUriParametersProperty(p)){
        newVal = uriParameters(node,pVal,p,serializeMetadata);
    }
    else if(universeHelpers.isTraitsProperty(p)){
        var arr = helpersLL.allTraits(node,false);
        newVal = contributeExternalNodes(node,arr,p,serializeMetadata);
    }
    else if(universeHelpers.isResourceTypesProperty(p)){
        var arr = helpersLL.allResourceTypes(node,false);
        newVal = contributeExternalNodes(node,arr,p,serializeMetadata);
    }
    else if(p.nameId()=="schemaContent"){
        var attr = helpersLL.schemaContent08Internal(node,schemasCache08);
        if(attr){
            newVal = new PropertyValue(p);
            newVal.registerValue(attr);
        }
    }
    if(newVal){
        return newVal;
    }
    return pVal;
}


function uriParameters(resource:hl.IHighLevelNode,pVal:PropertyValue,p:hl.IProperty,serializeMetadata=false):PropertyValue{
    var attr = resource.attr(universes.Universe10.Resource.properties.relativeUri.name);
    if(!attr){
        return pVal;
    }
    var uri = attr.value();
    return extractParams(pVal, uri, resource,p,serializeMetadata);
}

function baseUriParameters(api:hl.IHighLevelNode,pVal:PropertyValue,p:hl.IProperty,serializeMetadata=true):PropertyValue{

    var buriAttr = api.attr(universes.Universe10.Api.properties.baseUri.name);
    var uri = buriAttr ? buriAttr.value() : '';
    return extractParams(pVal, uri, api,p,serializeMetadata);
}

function extractParams(
    pVal:PropertyValue,
    uri:string,
    ownerHl:hl.IHighLevelNode,
    prop:hl.IProperty,
    serializeMetadata:boolean):PropertyValue {

    if(!uri){
        return pVal;
    }

    var describedParams = {};
    if(pVal) {
        pVal.arr.forEach(x=> {
            var arr = describedParams[x.name()];
            if (!arr) {
                arr = [];
                describedParams[x.name()] = arr;
            }
            arr.push(x);
        });
    }

    var newVal = new PropertyValue(prop);
    var prev = 0;
    var mentionedParams = {};
    var gotUndescribedParam = false;
    for (var i = uri.indexOf('{'); i >= 0; i = uri.indexOf('{', prev)) {
        prev = uri.indexOf('}', ++i);
        if(prev<0){
            break;
        }
        var paramName = uri.substring(i, prev);
        mentionedParams[paramName] = true;
        if (describedParams[paramName]) {
            describedParams[paramName].forEach(x=>{
                newVal.registerValue(x);
                newVal.registerMeta(null);
            });
        }
        else {
            gotUndescribedParam = true;
            var universe = ownerHl.definition().universe();
            var nc=<def.NodeClass>universe.type(universes.Universe10.StringTypeDeclaration.name);
            var hlNode=stubs.createStubNode(nc,null,paramName,ownerHl.lowLevel().unit());
            hlNode.setParent(ownerHl);
            hlNode.attrOrCreate("name").setValue(paramName);
            (<hlImpl.ASTNodeImpl>hlNode).patchProp(prop);

            newVal.registerValue(hlNode);
            if(serializeMetadata) {
                newVal.hasMeta = true;
                var meta = new core.NodeMetadataImpl();
                meta.setCalculated();
                newVal.registerMeta(meta);
            }
        }
    }
    if(!gotUndescribedParam){
        return pVal;
    }
    Object.keys(describedParams).filter(x=>!mentionedParams[x])
        .forEach(x=>describedParams[x].forEach(y=>{
            newVal.registerValue(y);
            if(newVal.hasMeta){
                newVal.registerMeta(null);
            }
        }));
    return newVal;
};

function contributeExternalNodes(
    ownerNode:hl.IHighLevelNode,
    arr:hl.IHighLevelNode[],
    p:hl.IProperty,
    serializeMetadata:boolean):PropertyValue{

    if(arr.length==0){
        return null;
    }
    var rootPath = ownerNode.lowLevel().unit().absolutePath();
    var newVal = new PropertyValue(p);
    arr.forEach(x=>{
        newVal.registerValue(x);
        if(serializeMetadata){
            if(x.lowLevel().unit().absolutePath()!=rootPath){
                newVal.hasMeta = true;
                var meta = new core.NodeMetadataImpl();
                meta.setCalculated();
                newVal.mArr.push(meta);
            }
            else{
                newVal.mArr.push(null);
            }
        }
    });
    return newVal;
}

interface HelperMethod{
    apply(node:hl.IHighLevelNode,
          pVal:PropertyValue,
          p:hl.IProperty,
          serializeMetadata:boolean):PropertyValue
}

var baseUriParametersHandler:HelperMethod = {
    apply: (node:hl.IHighLevelNode,
            pVal:PropertyValue,
            p:hl.IProperty,
            serializeMetadata:boolean) => {
        var buriAttr = node.attr(universes.Universe10.Api.properties.baseUri.name);
        var uri = buriAttr ? buriAttr.value() : '';
        return extractParams(pVal, uri, node, p, serializeMetadata);
    }
}

var uriParametersHandler:HelperMethod = {
    apply: (node:hl.IHighLevelNode,
            pVal:PropertyValue,
            p:hl.IProperty,
            serializeMetadata:boolean) => {
        var attr = node.attr(universes.Universe10.Resource.properties.relativeUri.name);
        if (!attr) {
            return pVal;
        }
        var uri = attr.value();
        return extractParams(pVal, uri, node, p, serializeMetadata);
    }
}

class TemplatesHandler implements HelperMethod {

    constructor(public arr:hl.IHighLevelNode[]){}

    apply(node:hl.IHighLevelNode,
          pVal:PropertyValue,
          p:hl.IProperty,
          serializeMetadata:boolean){
        //var arr = helpersHL.allTraits(node,false);
        return contributeExternalNodes(node, this.arr, p, serializeMetadata);
    }
}

class SchemaContentHandler implements HelperMethod{

    constructor(public schemasCache08:any){}

    apply(node:hl.IHighLevelNode,
          pVal:PropertyValue,
          p:hl.IProperty,
          serializeMetadata:boolean){
        var newVal:PropertyValue = null;
        var attr = helpersLL.schemaContent08Internal(node, this.schemasCache08);
        if (attr) {
            newVal = new PropertyValue(p);
            newVal.registerValue(attr);
        }
        return newVal;
    }
}

export interface Transformation{

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean

    transform(value:any,node?:hl.IParseResult);

    registrationInfo():Object;
}

export type TransformersMap = {[key:string]:{[key:string]:{[key:string]:Transformation[]}}};

export function applyTransformersMap(node:hl.IParseResult,prop:hl.IProperty,value:any,map:TransformersMap):any{

    var definition:hl.ITypeDefinition;
    if(node.isElement()){
        definition = node.asElement().definition();
    }
    else if(node.isAttr()){
        var p = node.asAttr().property();
        if(p){
            definition = p.range();
        }
    }
    if(definition instanceof def.UserDefinedClass || definition.isUserDefined()){
        definition = _.find(definition.allSuperTypes(),x=>!x.isUserDefined());
    }
    if(definition==null){
        return value;
    }
    var rv = definition.universe().version();
    var uMap = map[rv];
    if(!uMap){
        return value;
    }
    var tMap = uMap[definition.nameId()];
    if(!tMap){
        return value;
    }
    var pName = prop ? prop.nameId() : "__$$anyprop__";
    var arr = tMap[pName];
    if(!arr){
        arr = tMap["__$$anyprop__"];
    }
    if(!arr){
        return value;
    }
    for(var t of arr){
        value = t.transform(value,node);
    }
    return value;
}

function fillTransformersMap(tArr:Transformation[], map:TransformersMap){

    for(var t of tArr){

        var info = t.registrationInfo();
        if(!info){
            continue;
        }
        for(var uName of Object.keys(info)){

            var uObject = info[uName];
            var uMap = map[uName];
            if(uMap==null){
                uMap = {};
                map[uName] = uMap;
            }
            for(var tName of Object.keys(uObject)){
                var tObject = uObject[tName];
                var tMap = uMap[tName];
                if(tMap==null){
                    tMap = {};
                    uMap[tName] = tMap;
                }
                for(var pName of Object.keys(tObject)) {
                    var arr:Transformation[] = tMap[pName];
                    if(arr==null){
                        arr = [];
                        if(pName!="__$$anyprop__"){
                            var aArr = tMap["__$$anyprop__"];
                            if(aArr){
                                arr = arr.concat(aArr);
                            }
                        }
                        tMap[pName] = arr;
                    }
                    if(pName=="__$$anyprop__"){
                        for(var pn of Object.keys(tMap)){
                            tMap[pn].push(t);
                        }
                    }
                    else{
                        arr.push(t);
                    }
                }
            }
        }

    }
}

interface ObjectPropertyMatcher{

    match(td:nominals.ITypeDefinition,prop:nominals.IProperty):boolean

    registrationInfo():Object;
}

abstract class AbstractObjectPropertyMatcher implements ObjectPropertyMatcher{

    match(td:nominals.ITypeDefinition,prop:nominals.IProperty):boolean{
        if(td==null){
            return false;
        }
        var info = this.registrationInfo();
        var ver = td.universe().version();
        if(td instanceof def.UserDefinedClass || td.isUserDefined()){
            td = _.find(td.allSuperTypes(),x=>!x.isUserDefined());
            if(td==null){
                return prop==null;
            }
        }
        var uObject = info[ver];
        if(!uObject){
            return false;
        }
        var tObject = uObject[td.nameId()];
        if(!tObject){
            return false;
        }
        var p = (prop == null) || tObject[prop.nameId()]===true || tObject["__$$anyprop__"] === true;
        return p;
    }

    abstract registrationInfo():Object
}

class BasicObjectPropertyMatcher extends AbstractObjectPropertyMatcher{

    constructor(
        protected typeName:string,
        protected propName:string,
        protected applyToDescendatns:boolean = false,
        protected restrictToUniverses: string[]
            = ["RAML10","RAML08"]
    ){
        super();
    }

    private regInfo:any;

    registrationInfo():Object{
        if(this.regInfo){
            return this.regInfo;
        }
        var result = {};
        var uObjects:any[] = [];
        for(var uName of this.restrictToUniverses){
            var uObj = {};
            result[uName] = uObj;
            uObjects.push(uObj);
        }
        var tObjects:any[] = [];
        for(var uName of Object.keys(result)){
            var t = def.getUniverse(uName).type(this.typeName);
            if(t) {
                var uObject = result[uName];
                var typeNames = [this.typeName];
                if (this.applyToDescendatns) {
                    t.allSubTypes().forEach(x=>typeNames.push(x.nameId()));
                }
                for (var tName of typeNames) {
                    var tObject = {};
                    if(this.propName!=null) {
                        tObject[this.propName] = true;
                    }
                    else{
                        tObject["__$$anyprop__"] = true;
                    }
                    uObject[tName] = tObject;
                }
            }
        }

        this.regInfo = {};
        Object.keys(result).forEach(x=>{
            var uObject = result[x];
            if(Object.keys(uObject).length>0){
                this.regInfo[x] = uObject;
            }
        });
        return this.regInfo;
    }
}

abstract class MatcherBasedTransformation implements Transformation{

    constructor(protected matcher:ObjectPropertyMatcher){}

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean{
        var definition:hl.ITypeDefinition;
        if(node.isElement()) {
            definition = node.asElement().definition();
        }
        else if(node.isAttr()){
            var prop1 = node.asAttr().property();
            if(prop1){
                definition = prop1.range();
            }
        }
        return definition ? this.matcher.match(definition,prop) : false;
    }

    abstract transform(_value:any,node?:hl.IParseResult);

    registrationInfo():Object{
        return this.matcher.registrationInfo();
    }

}

abstract class BasicTransformation extends MatcherBasedTransformation{

    constructor(
        protected typeName:string,
        protected propName:string,
        protected applyToDescendatns:boolean = false,
        protected restrictToUniverses: string[]
            = ["RAML10","RAML08"]
    ){
        super(new BasicObjectPropertyMatcher(typeName,propName,applyToDescendatns,restrictToUniverses));
    }

}

class CompositeObjectPropertyMatcher extends AbstractObjectPropertyMatcher{

    constructor(protected matchers:ObjectPropertyMatcher[]){
        super();
    }

    private regInfo:any;

    registrationInfo():Object{
        if(this.regInfo){
            return this.regInfo;
        }
        this.regInfo = mergeRegInfos(this.matchers.map(x=>x.registrationInfo()));
        return this.regInfo;
    }
}

class ArrayToMapTransformer implements Transformation{

    constructor(protected matcher:ObjectPropertyMatcher, protected propName:string){}

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean{
        return node.isElement()&&this.matcher.match(node.asElement().definition(),prop);
    }

    transform(value:any,node:hl.IParseResult){
        if(Array.isArray(value)&&value.length>0 && value[0][this.propName]){
            var obj = {};
            value.forEach(x=>{
                var key = x["$$"+this.propName];
                if(key!=null){
                    delete x["$$"+this.propName];
                }
                else{
                    key = x[this.propName];
                }
                var previous = obj[key];
                if(previous){
                    if(Array.isArray(previous)){
                        previous.push(x);
                    }
                    else{
                        obj[key] = [ previous, x ];
                    }
                }
                else {
                    obj[key] = x;
                }
            });
            return obj;
        }
        return value;
    }

    registrationInfo():Object{
        return this.matcher.registrationInfo();
    }
}

class ResourcesTransformer extends BasicTransformation{

    constructor(){
        super(universes.Universe10.Resource.name,null,true);
    }

    transform(value:any,node:hl.IParseResult){
        if(Array.isArray(value)){
            return value;
        }
        var relUri = value[universes.Universe10.Resource.properties.relativeUri.name];
        if(relUri){
            var segments = relUri.trim().split("/");
            while(segments.length > 0 && segments[0].length == 0){
                segments.shift();
            }
            value["relativeUriPathSegments"] = segments;
            value.absoluteUri = helpersLL.absoluteUri(node.asElement());
            value.completeRelativeUri = helpersLL.completeRelativeUri(node.asElement());
            if(universeHelpers.isResourceType(node.parent().definition())){
                value.parentUri = helpersLL.completeRelativeUri(node.parent());
            }
            else{
                value.parentUri = "";
            }
        }
        return value;
    }
}

class TypeTransformer extends BasicTransformation{

    constructor(private options:SerializeOptions = {},private owner:JsonSerializer){
        super(universes.Universe10.TypeDeclaration.name,null,true);
    }

    transform(_value:any,node:hl.IParseResult){

        var isArray = Array.isArray(_value);
        if(isArray && _value.length==0){
            return _value;
        }
        var value = isArray ? _value[0] : _value;
        var exampleObj = helpersLL.typeExample(
            node.asElement(),this.options.dumpXMLRepresentationOfExamples);
        if(exampleObj){
            value["examples"] = [ exampleObj ];
        }
        else {
            var examples = helpersLL.typeExamples(
                node.asElement(), this.options.dumpXMLRepresentationOfExamples);
            if (examples.length > 0) {
                value["examples"] = examples;
            }
        }
        delete value["example"];
        if(value.hasOwnProperty("schema")){
            if(!value.hasOwnProperty("type")){
                value["type"] = value["schema"];
            }
            else{
                var typeValue = value["type"];
                if(!Array.isArray(typeValue)){
                    typeValue = [ typeValue ];
                    value["type"] = typeValue;
                }
                var schemaValue = value["schema"];
                if(Array.isArray(schemaValue)){
                    schemaValue.forEach(x=>typeValue.push(x));
                }
                else{
                    typeValue.push(schemaValue);
                }
            }
            delete value["schema"];
        }
        //this.refineTypeValue(value,node.asElement());
        if(!Array.isArray(value.type)){
            value.type = [value.type];
        }
        value.mediaType = RAML_MEDIATYPE;
        if(node && node.isElement()) {
            var e = node.asElement();
            var externalType = e.localType().isExternal() ? e.localType(): null;
            if (!externalType) {
                for (var st of e.localType().allSuperTypes()) {
                    if (st.isExternal()) {
                        externalType = st;
                    }
                }
            }
            if (externalType) {
                var sch = externalType.external().schema().trim();
                if (util.stringStartsWith(sch, "<")) {
                    value.mediaType = "application/xml";
                }
                else {
                    value.mediaType = "application/json";
                }
            }
        }
        var prop = node.property();
        if (prop && !(universeHelpers.isHeadersProperty(prop)
            || universeHelpers.isQueryParametersProperty(prop)
            || universeHelpers.isUriParametersProperty(prop)
            || universeHelpers.isPropertiesProperty(prop)
            || universeHelpers.isBaseUriParametersProperty(prop))) {

            delete value["required"];
            var metaObj = value["__METADATA__"]
            if (metaObj) {
                var pMetaObj = metaObj["primitiveValuesMeta"];
                if (pMetaObj) {
                    delete pMetaObj["required"];
                }
            }
        }
        var typeValue = value["type"];
        if (typeValue.forEach && typeof typeValue[0] === "string") {

            var runtimeType = node.asElement().localType();

            if (runtimeType && runtimeType.hasExternalInHierarchy()) {

                var schemaString = typeValue[0].trim();
                var canBeJson = (schemaString[0] === "{" && schemaString[schemaString.length - 1] === "}");
                var canBeXml= (schemaString[0] === "<" && schemaString[schemaString.length - 1] === ">");

                if (canBeJson) {
                    value["typePropertyKind"] = "JSON";
                } else if (canBeXml) {
                    value["typePropertyKind"] = "XML";
                }
            } else {
                value["typePropertyKind"] = "TYPE_EXPRESSION";
            }
        } else if (typeof typeValue === "object"){
            value["typePropertyKind"] = "INPLACE";
        }
        if(this.options.unfoldTypes) {
            value.unfolded = this.processExpressions(value,node);
        }
        if(value.type.length==1){
            var typeVal = value.type[0];
            if(typeof(typeVal) == "string"){
                typeVal = typeVal.trim();
                var isArr = util.stringEndsWith(typeVal,"[]");
                if(isArr){
                    var itemsStr = typeVal.substring(0,typeVal.length-"[]".length).trim();
                    while(itemsStr.length>0
                    &&itemsStr.charAt(0)=="("
                    &&itemsStr.charAt(itemsStr.length-1)==")"){
                        itemsStr = itemsStr.substring(1,itemsStr.length-1);
                    }
                    value.type[0] = "array";
                    value.items = itemsStr;
                }
            }
        }
        return _value;
    }

    private processExpressions(value:any,node:hl.IParseResult):any{
        let copy = util.deepCopy(value);
        this.parseExpressions(copy,node);
        return copy;
    }

    private parseExpressions(obj,node:hl.IParseResult){
        this.parseExpressionsForProperty(obj,"type",node);
        this.parseExpressionsForProperty(obj,"items",node);
        if(obj.properties){
            for(var pName of Object.keys(obj.properties)){
                let p = obj.properties[pName];
                if(p.unfolded){
                    obj.properties[pName] = p.unfolded;
                }
            }
        }
    }

    private parseExpressionsForProperty(obj:any, prop:string,node:hl.IParseResult){

        let value = obj[prop];
        if(!value){
            return;
        }
        let isSingleString = false;
        if(!Array.isArray(value)){
            if(value && typeof value == "object"){
                if(value.unfolded){
                    obj.prop = value.unfolded;
                }
                else {
                    this.parseExpressions(value,node);
                }
                return;
            }
            else if(typeof value == "string"){
                isSingleString = true;
                value = [ value ];
            }
        }
        let resultingArray:any[] = [];
        for(var i = 0 ; i < value.length ; i++) {
            let expr = value[i];
            if(expr && typeof expr=="object"){
                if(expr.unfolded){
                    expr = expr.unfolded;
                }
                else {
                    this.parseExpressions(expr,node);
                }
            }
            if(typeof expr != "string"){
                resultingArray.push(expr);
                continue;
            }
            let str = expr;
            var gotExpression = referencePatcher.checkExpression(str);
            if (!gotExpression) {
                let ref = this.typeReference(node, expr);
                resultingArray.push(ref);
                continue;
            }
            let escapeData:referencePatcher.EscapeData = {
                status: referencePatcher.ParametersEscapingStatus.NOT_REQUIRED
            };
            if(expr.indexOf("<<")>=0){
                escapeData = referencePatcher.escapeTemplateParameters(expr);
                if (escapeData.status == referencePatcher.ParametersEscapingStatus.OK) {
                    str = escapeData.resultingString;
                    gotExpression = referencePatcher.checkExpression(str);
                    if(!gotExpression){
                        continue;
                    }
                }
                else if (escapeData.status == referencePatcher.ParametersEscapingStatus.ERROR){
                    continue;
                }
            }
            let parsedExpression: any;
            try {
                parsedExpression = typeExpressions.parse(str);
            } catch (exception) {
                continue;
            }

            if (!parsedExpression) {
                continue;
            }
            let exprObj = this.expressionToObject(parsedExpression,escapeData,node);
            if(exprObj!=null){
                resultingArray.push(exprObj);
            }
        }
        obj[prop] = isSingleString ? resultingArray[0] : resultingArray;
    }

    private expressionToObject(
        expr:typeExpressions.BaseNode,
        escapeData:referencePatcher.EscapeData,
        node:hl.IParseResult):any{

        let result:any;
        let arr = 0;
        if(expr.type=="name"){
            let literal = <typeExpressions.Literal>expr;
            arr = literal.arr;
            result = literal.value;
            if(escapeData.status==referencePatcher.ParametersEscapingStatus.OK){
                let unescapeData = referencePatcher.unescapeTemplateParameters(result,escapeData.substitutions);
                if(unescapeData.status==referencePatcher.ParametersEscapingStatus.OK){
                    result = unescapeData.resultingString;
                }
            }
            if(this.options.typeReferences){
                result = this.typeReference(node, result);
            }
        }
        else if(expr.type=="union"){
            let union = <typeExpressions.Union>expr;
            result = {
                type: ["union"],
                options: []
            };
            let components = this.toOptionsArray(union);
            for(var c of components){
                if(c==null){
                    result = null;
                    break;
                }
                let c1 = this.expressionToObject(c,escapeData,node);
                result.options.push(c1);
            }
            result.options = _.unique(result.options);
        }
        else if(expr.type=="parens"){
            let parens = <typeExpressions.Parens>expr;
            arr = parens.arr;
            result = this.expressionToObject(parens.expr,escapeData,node);
        }
        if(result!=null) {
            while (arr-- > 0) {
                result = {
                    type: ["array"],
                    items: result
                };
            }
        }
        return result;
    }

    private toOptionsArray(union:typeExpressions.Union):typeExpressions.BaseNode[]{
        let result:typeExpressions.BaseNode[];
        let e1 = union.first;
        let e2 = union.rest;
        while(e1.type=="parens" && (<typeExpressions.Parens>e1).arr == 0){
            e1 = (<typeExpressions.Parens>e1).expr;
        }
        while(e2.type=="parens" && (<typeExpressions.Parens>e2).arr == 0){
            e2 = (<typeExpressions.Parens>e2).expr;
        }
        if(e1.type=="union"){
            result = this.toOptionsArray(<typeExpressions.Union>e1);
        }
        else{
            result = [ e1 ];
        }
        if(e2.type=="union"){
            result = result.concat(this.toOptionsArray(<typeExpressions.Union>e2));
        }
        else{
            result.push(e2);
        }
        return result;
    }


    private typeReference(node: hl.IParseResult, result: string) {
        if(!result){
            return "$error";
        }
        let rootNode = this.owner.astRoot();
        let types = rootNode.isElement() && rootNode.asElement().types();
        let t = types && types.getTypeRegistry().getByChain(result);
        if (!t) {
            // let i0 = result.indexOf("<<");
            // if(i0>=0 && result.indexOf(">>",i0)>=0 && linter.typeOfContainingTemplate(node)){
            //
            // }
            // else {
            //
            // }
        }
        else if (t.isBuiltin()) {

        }
        else {
            let src = t.getExtra(typeSystem.SOURCE_EXTRA);
            let llNode: ll.ILowLevelASTNode;
            if (hlImpl.BasicASTNode.isInstance(src)) {
                llNode = src.lowLevel();
            }
            else if (jsyaml.ASTNode.isInstance(src)
                || llJson.AstNode.isInstance(src)
                || proxy.LowLevelProxyNode.isInstance(src)) {
                llNode = src;
            }
            else if (hlImpl.LowLevelWrapperForTypeSystem.isInstance(src)) {
                llNode = src.node();
            }
            let llRoot = rootNode.lowLevel();
            if(llRoot.actual().libExpanded){
                result = "#/specification/types/" + t.name();
            }
            else {
                let location = "";
                let rootUnit = llRoot.unit();
                let unit = llNode.unit();
                if (unit.absolutePath() != rootUnit.absolutePath()) {
                    let resolver = (<jsyaml.Project>unit.project()).namespaceResolver();
                    let d = resolver.expandedPathMap(rootUnit)[unit.absolutePath()];
                    location = location + d.includePath;
                }
                result = location + "#/specification/types/" + t.name();
            }
        }
        return result;
    }
}

class SimpleNamesTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,universes.Universe10.LibraryBase.properties.annotationTypes.name,true,["RAML10"]),
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,universes.Universe10.LibraryBase.properties.types.name,true,["RAML10"]),
            new BasicObjectPropertyMatcher(universes.Universe10.Trait.name,universes.Universe10.LibraryBase.properties.traits.name,true,["RAML10"]),
            new BasicObjectPropertyMatcher(universes.Universe10.AbstractSecurityScheme.name,universes.Universe10.LibraryBase.properties.securitySchemes.name,true,["RAML10"]),
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceType.name,universes.Universe10.LibraryBase.properties.resourceTypes.name,true,["RAML10"])
        ]));
    }

    transform(value:any,node?:hl.IParseResult){

        if(!node.parent() || !node.parent().lowLevel()["libProcessed"]){
            return value;
        }

        var llNode = node.lowLevel();
        var key = llNode.key();
        value["$$name"] = key;
        var original:ll.ILowLevelASTNode = llNode;
        while(proxy.LowLevelProxyNode.isInstance(original)){
            original = (<proxy.LowLevelProxyNode>original).originalNode();
        }
        var oKey = original.key();
        var aVal =  value;
        aVal.name = oKey;
        if(aVal.displayName==key){
            aVal.displayName = oKey;
        }
        return value;
    }
}

class TemplateParametrizedPropertiesTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceType.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Trait.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Method.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Response.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Parameter.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe08.BodyLike.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,null,true)
        ]));
    }

    transform(value:any){
        if(Array.isArray(value)){
            return value;
        }
        var propName = def.universesInfo.Universe10.Trait.properties.parametrizedProperties.name;
        var parametrizedProps = value[propName];
        if(parametrizedProps){
            Object.keys(parametrizedProps).forEach(y=>{
                value[y] = parametrizedProps[y];
            });
            delete value[propName];
        }
        return value;
    }

}

class PropertiesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ObjectTypeDeclaration.name,universes.Universe10.ObjectTypeDeclaration.properties.properties.name,true)
        ]),"name");
    }

}


class SchemasTransformer extends BasicTransformation{

    constructor(){
        super(universes.Universe08.GlobalSchema.name,universes.Universe08.Api.properties.schemas.name,true, ["RAML08"]);
    }

    transform(value:any){
        if(Array.isArray(value)){
            return value;
        }
        else {
            var obj = {};
            obj[value.key] = value.value;
            return obj;
        }
    }
}

class ProtocolsToUpperCaseTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.Api.name,universes.Universe10.Api.properties.protocols.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.MethodBase.name,universes.Universe10.MethodBase.properties.protocols.name,true),
        ]));
    }

    transform(value:any){
        if(typeof(value)=='string'){
            return value.toUpperCase();
        }
        else if(Array.isArray(value)){
            return value.map(x=>x.toUpperCase());
        }
        return value;
    }
}

class ReferencesTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.SecuritySchemeRef.name,universes.Universe10.Api.properties.securedBy.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.TraitRef.name,universes.Universe10.MethodBase.properties.is.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceTypeRef.name,universes.Universe10.ResourceBase.properties.type.name,true)
        ]));
    }

    transform(value:any){
        if(!value){
            return null;
        }
        if(Array.isArray(value)){
            return value;
        }
        return this.toSimpleValue(value);
    }

    private toSimpleValue(x):any {
        if(typeof(x)=="string"){
            return x;
        }
        var name = x['name'];
        var params = x['structuredValue'];
        if (params) {
            var obj = {};
            obj[name] = params;
            return obj;
        }
        else {
            return name;
        }
    }

}

class AllUriParametersTransformer extends MatcherBasedTransformation{

    constructor(private enabled:boolean=false){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.Api.name,null,true)
        ]));
    }

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean{
        return this.enabled ? super.match(node,prop) : false;
    }

    registrationInfo():Object{
        return this.enabled ? super.registrationInfo() : null;
    }

    private static uriParamsPropName
        = universes.Universe10.ResourceBase.properties.uriParameters.name;

    private static methodsPropName
        = universes.Universe10.ResourceBase.properties.methods.name;

    private static resourcesPropName
        = universes.Universe10.Api.properties.resources.name;

    transform(value:any,node?:hl.IParseResult,uriParams?:any){

        var params:any[] = uriParams;
        var ownParams = value[AllUriParametersTransformer.uriParamsPropName];
        if(ownParams){
            params = [].concat(uriParams||[]);
            Object.keys(ownParams).forEach(x=>{
                var obj = ownParams[x];
                if(Array.isArray(obj)){
                    obj.forEach(y=>params.push(y));
                }
                else{
                    params.push(obj);
                }
            });
        }
        if(params){
            value["allUriParameters"] = params;
            var methods = value[AllUriParametersTransformer.methodsPropName];
            if(methods){
                Object.keys(methods).forEach(x=>
                    methods[x]["allUriParameters"] = params
                );
            }
        }
        var resources = value[AllUriParametersTransformer.resourcesPropName];
        if(resources){
            resources.forEach(x=>this.transform(x,null,params));
        }
        return value;
    }
}

class MethodsToMapTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceBase.name,universes.Universe10.ResourceBase.properties.methods.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Resource.name,universes.Universe08.Resource.properties.methods.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.ResourceType.name,universes.Universe08.ResourceType.properties.methods.name,true)
        ]),"method");
    }
}

class TypesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.types.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.schemas.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.annotationTypes.name,true)
        ]),"name");
    }
}

class TraitsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,
                universes.Universe10.LibraryBase.properties.traits.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Api.name,
                universes.Universe08.Api.properties.traits.name,true)
        ]),"name");
    }
}

class ResourceTypesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.resourceTypes.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Api.name,universes.Universe10.Api.properties.resourceTypes.name,true,["RAML08"])
        ]),"name");
    }
}

class SecuritySchemesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.securitySchemes.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Api.name,universes.Universe08.Api.properties.securitySchemes.name,true,["RAML08"])
        ]),"name");
    }
}

class ParametersTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.Api.name,universes.Universe10.Api.properties.baseUriParameters.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceBase.name,universes.Universe10.ResourceBase.properties.uriParameters.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Resource.name,universes.Universe08.Resource.properties.uriParameters.name,true,["RAML08"]),
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceBase.name,universes.Universe10.MethodBase.properties.queryParameters.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.MethodBase.name,universes.Universe10.MethodBase.properties.queryParameters.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Operation.name,universes.Universe10.MethodBase.properties.queryParameters.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Operation.name,universes.Universe10.MethodBase.properties.headers.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.MethodBase.name,universes.Universe10.MethodBase.properties.headers.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.BodyLike.name,universes.Universe08.BodyLike.properties.formParameters.name)
        ]),"name");
    }

}

class ResponsesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            //new BasicObjectPropertyMatcher(universes.Universe10.Operation.name,universes.Universe10.Operation.properties.responses.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.MethodBase.name,universes.Universe10.MethodBase.properties.responses.name,true)
        ]),"code");
    }
}

class AnnotationsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.Annotable.name,universes.Universe10.Annotable.properties.annotations.name,true)
        ]),"name");
    }
}

class BodiesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.Response.name,universes.Universe10.Response.properties.body.name),
            new BasicObjectPropertyMatcher(universes.Universe10.MethodBase.name,universes.Universe10.MethodBase.properties.body.name,true)
        ]),"name");
    }

}

class FacetsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,universes.Universe10.TypeDeclaration.properties.facets.name,true)
        ]),"name");
    }
}

class Api10SchemasTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,null,true,["RAML10"])
        ]));
    }

    transform(value:any,node?:hl.IParseResult){

        if(!value){
            return value;
        }
        if(!value.hasOwnProperty("schemas")){
            return value;
        }
        var schemasValue = value["schemas"];
        if(!value.hasOwnProperty("types")){
            value["types"] = schemasValue;
        }
        else{
            var typesValue = value["types"];
            Object.keys(schemasValue).forEach(x=>{
                if(!typesValue.hasOwnProperty(x)){
                    typesValue[x] = schemasValue[x];
                }
            });
        }
        delete value["schemas"];
        return value;
    }
}


export function mergeRegInfos(arr:Object[]):Object{
    if(arr.length==0){
        return {};
    }
    var result = arr[0];
    for(var i = 1; i < arr.length ; i++){
        var obj = arr[i];
        result = mergeObjects(result,obj);
    }
    return result;
}

function mergeObjects(o1:Object,o2:Object):Object{
    for(var k of Object.keys(o2)){
        var f1 = o1[k];
        var f2 = o2[k];
        if(f1==null){
            o1[k] = f2;
        }
        else{
            if(typeof(f1)=="object"&&typeof(f2)=="object"){
                o1[k] = mergeObjects(f1,f2);
            }
        }
    }
    return o1;
}