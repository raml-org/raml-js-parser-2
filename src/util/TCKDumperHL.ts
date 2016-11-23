/// <reference path="../../typings/main.d.ts" />
import {IParseResult, IHighLevelNode} from "../raml1/highLevelAST";
var universe = require("../raml1/tools/universe");
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

export function dump(node: hl.IHighLevelNode|hl.IAttribute, serializeMeta:boolean = true):any{
    return new TCKDumper({
        rootNodeDetails : true,
        serializeMetadata : serializeMeta
    }).dump(node);
}

export class TCKDumper {

    constructor(private options?:SerializeOptions) {
        this.options = this.options || {};
        if (this.options.serializeMetadata == null) {
            this.options.serializeMetadata = true;
        }
        this.oDumper = new tckDumper.TCKDumper(this.options);
    }

    private oDumper:tckDumper.TCKDumper;

    dump(node:hl.IParseResult):any {
        var highLevelParent = node.parent();
        var rootNodeDetails = !highLevelParent && this.options.rootNodeDetails;
        var result = this.dumpInternal(node, null, true, rootNodeDetails);
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

    dumpInternal(_node:hl.IParseResult, nodeProperty:hl.IProperty, isRoot = false, rootNodeDetails = false):any {

        if (_node == null) {
            return null;
        }


        if (_node.isElement()) {

            var map:{[key:string]:PropertyValue} = {};
            var eNode = _node.asElement();
            var definition = eNode.definition();

            if(universeHelpers.isExampleSpecType(definition)){
                if(eNode.parent()!=null){
                    return "";//to be fulfilled by the transformer
                }
                var at = hlImpl.auxiliaryTypeForExample(eNode);
                var eObj:any = helpersHL.dumpExpandableExample(
                    at.examples()[0],this.options.dumpXMLRepresentationOfExamples);
                var uses = eNode.elementsOfKind("uses").map(x=>this.dumpInternal(x,x.property()));
                if(uses.length>0){
                    eObj["uses"] = uses;
                }
                return eObj;
            }

            var obj:any = {};
            var children = (<hl.IParseResult[]>eNode.attrs())
                .concat(eNode.children().filter(x=>!x.isAttr()));
            for( var ch of children){
                var prop = ch.property();                
                if(prop!=null) {
                    var pName = prop.nameId();
                    var pVal = map[pName];
                    if(pVal==null){
                        pVal = new PropertyValue(prop);
                        map[pName] = pVal;
                    }
                    pVal.registerValue(ch);
                }
                else{
                    var llNode = ch.lowLevel();
                    var key = llNode.key();
                    if(key){
                        //obj[key] = llNode.dumpToObject(); 
                    }
                }
            }
            var result:any = {};
            var scalarsAnnotations = {};
            for(var p of definition.allProperties()
                .concat((<def.NodeClass>definition).allCustomProperties())){
                
                if(p instanceof def.UserDefinedProp){
                    continue;
                }
                if(universeHelpers.isTypeProperty(p)){
                    if(map["schema"]){
                        continue;
                    }
                }

                var pName = p.nameId();
                //TODO implement as transformer or ignore case
                if(!isRoot&&pName=="uses"){
                    if(universeHelpers.isApiSibling(eNode.root().definition())) {
                        continue;
                    }
                }
                var pVal = map[pName];
                pVal = applyHelpers(pVal,eNode,p);
                var udVal = obj[pName];
                var aVal:any;
                if(pVal!==undefined){
                    if(pVal.isMultiValue) {
                        aVal = pVal.arr.map(x=>this.dumpInternal(x,pVal.prop));
                        if(p.isValueProperty()) {
                            var sAnnotations = [];
                            var gotScalarAnnotations = false;
                            pVal.arr.filter(x=>x.isAttr()).map(x=>x.asAttr())
                                .filter(x=>x.isAnnotatedScalar()).forEach(x=> {
                                var sAnnotations1 = x.annotations().map(x=>this.dumpInternal(x,null));
                                gotScalarAnnotations = gotScalarAnnotations || sAnnotations1.length>0;
                                sAnnotations.push(sAnnotations1);
                            });
                            if(gotScalarAnnotations){
                                scalarsAnnotations[pName] = sAnnotations;
                            }
                        }
                        if(universeHelpers.isTypeDeclarationDescendant(definition)
                            &&universeHelpers.isTypeProperty(p)){
                            //TODO compatibility crutch
                            if(pVal.arr.map(x=>(<hl.IAttribute>x).value())
                                    .filter(x=>x instanceof hlImpl.StructuredValue).length>0){
                                aVal = aVal[0];
                            }
                        }
                    }
                    else{
                        aVal = this.dumpInternal(pVal.val,pVal.prop);
                        if(p.isValueProperty()) {
                            var attr = pVal.val.asAttr();
                            if(attr.isAnnotatedScalar()) {
                                var sAnnotations = attr.annotations().map(x=>this.dumpInternal(x,null));
                                if (sAnnotations.length > 0) {
                                    scalarsAnnotations[pName] = sAnnotations;
                                }
                            }
                        }
                    }
                    
                }
                else if(udVal !== undefined){
                    aVal = udVal;
                }
                else{
                    var defVal = this.getDefaultsCalculator().attributeDefaultIfEnabled(eNode, p);
                    if(Array.isArray(defVal)){
                        defVal = defVal.map(x=>{
                            if(x instanceof hlImpl.ASTPropImpl){
                                return this.dumpInternal(<hl.IParseResult>x,p);
                            }
                            return x;
                        });
                    }
                    else if(defVal instanceof hlImpl.ASTPropImpl){
                        defVal = this.dumpInternal(<hl.IParseResult>defVal,p);
                    }
                    aVal = defVal;
                    if(aVal != null && p.isMultiValue()&&!Array.isArray(aVal)){
                        aVal = [aVal];
                    }
                }
                aVal = tckDumper.applyTransformersMap(eNode,p,aVal,this.oDumper.nodePropertyTransformersMap);
                if(aVal != null) {
                    //TODO implement as transformer
                    if((pName === "type" || pName == "schema") && aVal && aVal.forEach && typeof aVal[0] === "string") {
                        var schemaString = aVal[0].trim();

                        var canBeJson = (schemaString[0] === "{" && schemaString[schemaString.length - 1] === "}");
                        var canBeXml= (schemaString[0] === "<" && schemaString[schemaString.length - 1] === ">");

                        if(canBeJson || canBeXml) {
                            var include = eNode.lowLevel().includePath && eNode.lowLevel().includePath();

                            if(include) {
                                var aPath = eNode.lowLevel().unit().resolve(include).absolutePath();

                                var relativePath;

                                if(aPath.indexOf("http://") === 0 || aPath.indexOf("https://") === 0) {
                                    relativePath = aPath;
                                } else {
                                    relativePath = pathUtils.relative(eNode.lowLevel().unit().project().getRootPath(), aPath);
                                }

                                relativePath = relativePath.replace(/\\/g,'/');

                                result["schemaPath"] = relativePath;
                            }
                        }
                    }
                    result[pName] = aVal;
                }
            }
            this.serializeMeta(result,eNode);
            if(Object.keys(scalarsAnnotations).length>0){
                result["scalarsAnnotations"] = scalarsAnnotations;
            }
            var pProps = helpersHL.getTemplateParametrizedProperties(eNode);
            if(pProps){
                result["parametrizedProperties"] = pProps;
            }
            if(universeHelpers.isTypeDeclarationDescendant(definition)){
                var fixedFacets = helpersHL.typeFixedFacets(eNode);
                if(fixedFacets){
                    result["fixedFacets"] = fixedFacets;
                }
            }
            result = tckDumper.applyTransformersMap(eNode,nodeProperty||eNode.property(),result,this.oDumper.nodeTransformersMap);
            return result;
        }
        else if (_node.isAttr()) {

            var aNode = _node.asAttr();
            var val = aNode.value();
            var prop = aNode.property();
            var rangeType = prop.range();
            var isValueType = rangeType.isValueType();
            if (isValueType && aNode['value']) {
                var val = aNode['value']();
                if (typeof val == 'number' || typeof val == 'string' || typeof val == 'boolean') {
                    return val;
                }
            }            
            if(val instanceof hlImpl.StructuredValue){
                var sVal = (<hlImpl.StructuredValue>val);
                var llNode = sVal.lowLevel();
                val = llNode ? llNode.dumpToObject() : null;
                
                if(rangeType.isAssignableFrom("Reference")){
                    //TODO implement as transformer
                    var key = Object.keys(val)[0];
                    var name = sVal.valueName();
                    val = {
                        name: name,
                        structuredValue: val[key]
                    }
                }
                else if(prop.nameId() == "type") {
                    var llNode = aNode.lowLevel();
                    var tdl = null;
                    var td = def.getUniverse("RAML10").type(universe.Universe10.TypeDeclaration.name);
                    var hasType = def.getUniverse("RAML10").type(universe.Universe10.LibraryBase.name);
                    var tNode = new hlImpl.ASTNodeImpl(llNode, aNode.parent(), td, hasType.property(universe.Universe10.LibraryBase.properties.types.name))
                    tNode.patchType(builder.doDescrimination(tNode));
                    val = this.dumpInternal(tNode,nodeProperty||aNode.property(),true);
                }
            }
            val = tckDumper.applyTransformersMap(aNode,nodeProperty||aNode.property(),val,this.oDumper.nodeTransformersMap);
            return val;
        }
        var llNode = _node.lowLevel();
        return llNode ? llNode.dumpToObject() : null;

    }
    
    private defaultsCalculator
        = new defaultCalculator.AttributeDefaultsCalculator(true,true);

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
                eObj['trace'] = this.dumpErrors(x.trace);//x.trace.map(y=>this.dumpErrorBasic(y));
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



class PropertiesData{

    typeName:string;

    map:{[key:string]:TypePropertiesData} = {}

    addProperty(prop:nominals.IProperty,wrapperKind:string){
        var data = this.map[wrapperKind];
        if(!data){
            data = new TypePropertiesData(wrapperKind);
            this.map[wrapperKind] = data;
        }
        data.addProperty(prop);
    }

    print():string{
        return Object.keys(this.map).map(x=>this.map[x].print()).join('\n') + "\n";
    }
}

class TypePropertiesData{
    constructor(protected typeName:string){}

    map:{[key:string]:TypePropertiesData2} = {};

    addProperty(prop:nominals.IProperty){
        var name = prop.domain().nameId();
        var data = this.map[name];
        if(!data){
            data = new TypePropertiesData2(name);
            this.map[name] = data;
        }
        data.addProperty(prop);
    }

    print():string{
        return this.typeName + ':\n' +Object.keys(this.map).map(x=>'    '+this.map[x].print()).join('\n');
    }
}

class TypePropertiesData2{
    constructor(protected typeName:string){}

    map:{[key:string]:nominals.IProperty} = {};

    addProperty(prop:nominals.IProperty){
        var name = prop.nameId();
        this.map[name] = prop;
    }

    print():string{
        return this.typeName + ': ' +Object.keys(this.map).sort().join(', ');
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


function applyHelpers(pVal:PropertyValue,node:hl.IHighLevelNode,p:hl.IProperty){
    
    var newVal:PropertyValue;
    if(universeHelpers.isBaseUriParametersProperty(p)){
        var baseUriParameters = helpersHL.baseUriParameters(node);
        if(baseUriParameters.length>0) {
            newVal = new PropertyValue(p);
            baseUriParameters.forEach(x=>newVal.registerValue(x));
        }
    }
    if(universeHelpers.isUriParametersProperty(p)){
        var uriParameters = helpersHL.uriParameters(node);
        if(uriParameters.length>0) {
            newVal = new PropertyValue(p);
            uriParameters.forEach(x=>newVal.registerValue(x));
        }
    }
    else if(universeHelpers.isTraitsProperty(p)){
        var arr = helpersHL.allTraits(node);
        if(arr.length>0){
            newVal = new PropertyValue(p);
            arr.forEach(x=>newVal.registerValue(x));
        }
    }
    else if(universeHelpers.isResourceTypesProperty(p)){
        var arr = helpersHL.allResourceTypes(node);
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
