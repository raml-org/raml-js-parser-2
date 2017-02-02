/// <reference path="../../typings/main.d.ts" />
import coreApi = require("../raml1/wrapped-ast/parserCoreApi");
import core = require("../raml1/wrapped-ast/parserCore");
import proxy = require("../raml1/ast.core/LowLevelASTProxy");
import def = require("raml-definition-system")
import hl = require("../raml1/highLevelAST");
import ll = require("../raml1/lowLevelAST");
import hlImpl = require("../raml1/highLevelImpl");
import builder = require("../raml1/ast.core/builder");

import typeSystem = def.rt;
import nominals = typeSystem.nominalTypes;
import universeHelpers = require("../raml1/tools/universeHelpers")
import universes = require("../raml1/tools/universe")
import util = require("../util/index")

import RamlWrapper10 = require("../raml1/artifacts/raml10parserapi");
import tckDumper = require("./TCKDumper");
import defaultCalculator = require("../raml1/wrapped-ast/defaultCalculator");
import helpersHL = require("../raml1/wrapped-ast/helpersHL");

var pathUtils = require("path");

export function dump(node: hl.IHighLevelNode|hl.IAttribute, options:SerializeOptions):any{
    return new TCKDumper(options).dump(node);
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
export class TCKDumper {

    constructor(private options?:SerializeOptions) {
        this.options = this.options || {};
        if (this.options.serializeMetadata == null) {
            this.options.serializeMetadata = true;
        }
        if (this.options.attributeDefaults == null) {
            this.options.attributeDefaults = true;
        }
        this.oDumper = new tckDumper.TCKDumper(this.options);
        this.defaultsCalculator = new defaultCalculator.AttributeDefaultsCalculator(true,true);
    }

    private oDumper:tckDumper.TCKDumper;


    private defaultsCalculator:defaultCalculator.AttributeDefaultsCalculator;

    dump(node:hl.IParseResult):any {
        var highLevelParent = node.parent();
        var rootNodeDetails = !highLevelParent && this.options.rootNodeDetails;
        var rootPath = getRootPath(node);
        var result = this.dumpInternal(node, null, rootPath,true);
        if (rootNodeDetails) {
            var obj:any = result;
            result= {};            
            result.specification = obj;
            if(node.isElement()) {
                var eNode = node.asElement();
                var definition = eNode.definition();
                if (definition) {
                    var ramlVersion = definition.universe().version();
                    result.ramlVersion = ramlVersion;
                    result.type = definition.nameId();
                }
                result.errors = this.dumpErrors(eNode.wrapperNode().errors());
            }
        }

        return result;
    }

    dumpInternal(_node:hl.IParseResult, nodeProperty:hl.IProperty, rp:string,isRoot = false):any {

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
                    var eObj:any = helpersHL.dumpExpandableExample(
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
                    if (universeHelpers.isTypeProperty(p)) {
                        if (map["schema"]) {
                            continue;
                        }
                    }

                    var pName = p.nameId();
                    //TODO implement as transformer or ignore case
                    if (!isRoot && pName == "uses") {
                        if (universeHelpers.isApiSibling(eNode.root().definition())) {
                            continue;
                        }
                    }
                    var pVal = map[pName];
                    pVal = applyHelpers(pVal, eNode, p, this.options.serializeMetadata);
                    var udVal = obj[pName];
                    let aVal:any;
                    if (pVal !== undefined) {
                        if (pVal.isMultiValue) {
                            aVal = pVal.arr.map(x=>this.dumpInternal(x, pVal.prop,rp));
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
                        var defVal = this.getDefaultsCalculator().attributeDefaultIfEnabled(eNode, p);
                        if (Array.isArray(defVal)) {
                            defVal = defVal.map(x=> {
                                if (hlImpl.isASTPropImpl(x)) {
                                    return this.dumpInternal(<hl.IParseResult>x, p,rp);
                                }
                                return x;
                            });
                        }
                        else if (hlImpl.isASTPropImpl(defVal)) {
                            defVal = this.dumpInternal(<hl.IParseResult>defVal, p,rp);
                        }
                        aVal = defVal;
                        if (aVal != null && p.isMultiValue() && !Array.isArray(aVal)) {
                            aVal = [aVal];
                        }
                    }
                    aVal = tckDumper.applyTransformersMap(eNode, p, aVal, this.oDumper.nodePropertyTransformersMap);
                    if (aVal != null) {
                        //TODO implement as transformer
                        if ((pName === "type" || pName == "schema") && aVal && aVal.forEach && typeof aVal[0] === "string") {
                            var schemaString = aVal[0].trim();

                            var canBeJson = (schemaString[0] === "{" && schemaString[schemaString.length - 1] === "}");
                            var canBeXml = (schemaString[0] === "<" && schemaString[schemaString.length - 1] === ">");

                            if (canBeJson || canBeXml) {
                                var include = eNode.lowLevel().includePath && eNode.lowLevel().includePath();

                                if (include) {
                                    var aPath = eNode.lowLevel().unit().resolve(include).absolutePath();

                                    var relativePath;

                                    if (util.stringStartsWith(aPath,"http://") || util.stringStartsWith(aPath,"https://")) {
                                        relativePath = aPath;
                                    } else {
                                        relativePath = pathUtils.relative(eNode.lowLevel().unit().project().getRootPath(), aPath);
                                    }

                                    relativePath = relativePath.replace(/\\/g, '/');

                                    result["schemaPath"] = relativePath;
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
                    this.serializeMeta(result, eNode);
                }
                if (Object.keys(scalarsAnnotations).length > 0) {
                    result["scalarsAnnotations"] = scalarsAnnotations;
                }
                var pProps = helpersHL.getTemplateParametrizedProperties(eNode);
                if (pProps) {
                    result["parametrizedProperties"] = pProps;
                }
                if (universeHelpers.isTypeDeclarationDescendant(definition)) {
                    var fixedFacets = helpersHL.typeFixedFacets(eNode);
                    if (fixedFacets) {
                        result["fixedFacets"] = fixedFacets;
                    }
                }
                result = tckDumper.applyTransformersMap(eNode, nodeProperty || eNode.property(), result, this.oDumper.nodeTransformersMap);
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
            }
            if (val!=null&&(typeof val == 'number' || typeof val == 'string' || typeof val == 'boolean')) {
                result = val;
            }
            else {
                if (hlImpl.isStructuredValue(val)) {
                    var sVal = (<hlImpl.StructuredValue>val);
                    var llNode = sVal.lowLevel();
                    val = llNode ? llNode.dumpToObject() : null;
                    var propName = prop.nameId();
                    if (rangeType.isAssignableFrom("Reference")) {
                        //TODO implement as transformer
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
                        var llNode = aNode.lowLevel();
                        var tdl = null;
                        var td = def.getUniverse("RAML10").type(universes.Universe10.TypeDeclaration.name);
                        var hasType = def.getUniverse("RAML10").type(universes.Universe10.LibraryBase.name);
                        var tNode = new hlImpl.ASTNodeImpl(llNode, aNode.parent(), td, hasType.property(universes.Universe10.LibraryBase.properties.types.name))
                        tNode.patchType(builder.doDescrimination(tNode));
                        val = this.dumpInternal(tNode, nodeProperty || aNode.property(),rp, true);
                    }
                    else if (propName == "items" && typeof val === "object") {
                        var isArr = Array.isArray(val);
                        var isObj = !isArr;
                        if (isArr) {
                            isObj = _.find(val, x=>typeof(x) == "object") != null;
                        }
                        if (isObj) {
                            val = null;
                            var a = _node.parent().lowLevel();
                            var tdl = null;
                            a.children().forEach(x=> {
                                if (x.key() == "items") {
                                    var td = def.getUniverse("RAML10").type(universes.Universe10.TypeDeclaration.name);
                                    var hasType = def.getUniverse("RAML10").type(universes.Universe10.LibraryBase.name);
                                    var tNode = new hlImpl.ASTNodeImpl(x, aNode.parent(), td, hasType.property(universes.Universe10.LibraryBase.properties.types.name));
                                    tNode.patchType(builder.doDescrimination(tNode));
                                    val = this.dumpInternal(tNode, nodeProperty || aNode.property(),rp, true);
                                    propName = x.key();
                                }
                            })
                        }
                    }
                }
                val = tckDumper.applyTransformersMap(aNode, nodeProperty || aNode.property(), val, this.oDumper.nodeTransformersMap);
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

    serializeMeta(obj:any, node:hl.IHighLevelNode) {
        if (!this.options.serializeMetadata) {
            return;
        }
        var wn = node.wrapperNode();
        if(wn) {
            var meta = wn.meta();
            if (!meta.isDefault()) {
                obj["__METADATA__"] = meta.toJSON();
            }
        }
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
}

class PropertyValue{
    
    constructor(public prop:hl.IProperty){
        this.isMultiValue = prop.isMultiValue();
    }
    
    arr:hl.IParseResult[] = [];
    val:hl.IParseResult;
    isMultiValue:boolean;
    
    registerValue(val:hl.IParseResult){
        if(this.isMultiValue){
            this.arr.push(val);
        }
        else{
            this.val = val;
        }
    }
}


function applyHelpers(pVal:PropertyValue,node:hl.IHighLevelNode,p:hl.IProperty,serializeMetadata:boolean){
    
    var newVal:PropertyValue;
    if(universeHelpers.isBaseUriParametersProperty(p)){
        var baseUriParameters = helpersHL.baseUriParameters(node,serializeMetadata);
        if(baseUriParameters.length>0) {
            newVal = new PropertyValue(p);
            baseUriParameters.forEach(x=>newVal.registerValue(x));
        }
    }
    if(universeHelpers.isUriParametersProperty(p)){
        var uriParameters = helpersHL.uriParameters(node,serializeMetadata);
        if(uriParameters.length>0) {
            newVal = new PropertyValue(p);
            uriParameters.forEach(x=>newVal.registerValue(x));
        }
    }
    else if(universeHelpers.isTraitsProperty(p)){
        var arr = helpersHL.allTraits(node,serializeMetadata);
        if(arr.length>0){
            newVal = new PropertyValue(p);
            arr.forEach(x=>newVal.registerValue(x));
        }
    }
    else if(universeHelpers.isResourceTypesProperty(p)){
        var arr = helpersHL.allResourceTypes(node,serializeMetadata);
        if(arr.length>0){
            newVal = new PropertyValue(p);
            arr.forEach(x=>newVal.registerValue(x));
        }
    }
    else if(p.nameId()=="schemaContent"){
        var attr = helpersHL.schemaContent08(node);
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
