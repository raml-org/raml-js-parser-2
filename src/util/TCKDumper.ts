/// <reference path="../../typings/main.d.ts" />
import {instanceOfPatchedReference} from "../raml1/ast.core/referencePatcher";
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
import _ = require("underscore");

import RamlWrapper10 = require("../raml1/artifacts/raml10parserapi");
import helpersHL = require("../raml1/wrapped-ast/helpersHL");
import expressionParser = def.rt.typeExpressions;
import referencePatcher = require("../raml1/ast.core/referencePatcher");

var pathUtils = require("path");
const RAML_MEDIATYPE = "application/raml+yaml";

export function dump(node: coreApi.BasicNode|coreApi.AttributeNode, serializeMeta:boolean = true):any{
    return new TCKDumper({
        rootNodeDetails : true,
        serializeMetadata : serializeMeta
    }).dump(node);
}

export type TransformersMap = {[key:string]:{[key:string]:{[key:string]:Transformation[]}}}; 

export class TCKDumper {

    constructor(private options?:SerializeOptions) {
        this.options = this.options || {};
        if (this.options.serializeMetadata == null) {
            this.options.serializeMetadata = true;
        }
        this.nodeTransformers = [
            new ResourcesTransformer(),
            //new TypeExampleTransformer(this.options.dumpXMLRepresentationOfExamples),
            new TypeTransformer(this.options.dumpXMLRepresentationOfExamples),
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
        new TypeValueTransformer(),
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

    private ignore:ObjectPropertyMatcher = new CompositeObjectPropertyMatcher([
        new BasicObjectPropertyMatcher(universes.Universe10.Response.name, universes.Universe10.TypeDeclaration.properties.displayName.name),
        new BasicObjectPropertyMatcher(universes.Universe10.Api.name, universes.Universe10.TypeDeclaration.properties.displayName.name,true),
        new BasicObjectPropertyMatcher(universes.Universe10.AnnotationRef.name, universes.Universe10.AnnotationRef.properties.annotation.name),
        new BasicObjectPropertyMatcher(universes.Universe10.SecuritySchemeRef.name, universes.Universe10.SecuritySchemeRef.properties.securityScheme.name),
        new BasicObjectPropertyMatcher(universes.Universe10.TraitRef.name, universes.Universe10.TraitRef.properties.trait.name),
        new BasicObjectPropertyMatcher(universes.Universe10.ResourceTypeRef.name, universes.Universe10.ResourceTypeRef.properties.resourceType.name),
        new BasicObjectPropertyMatcher(universes.Universe10.Api.name, universes.Universe10.Api.properties.RAMLVersion.name,true)
    ]);

    private missingProperties:PropertiesData = new PropertiesData();

    printMissingProperties():string {
        return this.missingProperties.print();
    }

    dump(node:any):any {
        var highLevelNode = node.highLevel();
        var highLevelParent = highLevelNode && highLevelNode.parent();
        var rootNodeDetails = !highLevelParent && this.options.rootNodeDetails;
        var result = this.dumpInternal(node, rootNodeDetails);
        return result;
    }

    dumpInternal(node:any, rootNodeDetails:boolean = false, nodeProperty?:hl.IProperty):any {

        if (node == null) {
            return null;
        }


        if (core.BasicNodeImpl.isInstance(node)) {

            var props:{[key:string]:nominals.IProperty} = {};
            var basicNode:coreApi.BasicNode = <coreApi.BasicNode>node;
            var definition = basicNode.highLevel().definition();
            definition.allProperties().filter(x=>!this.ignore.match(basicNode.definition(), x)).forEach(x=> {
                props[x.nameId()] = x;
            });
            (<def.NodeClass>definition).allCustomProperties().filter(x=>!this.ignore.match(basicNode.definition(), x)).forEach(x=> {
                props[x.nameId()] = x;
            });
            var obj = this.dumpProperties(props, node);
            if (props["schema"]) {
                if (this.options.dumpSchemaContents) {
                    if (props["schema"].range().key() == universes.Universe08.SchemaString) {
                        var schemas = basicNode.highLevel().root().elementsOfKind("schemas");
                        schemas.forEach(x=> {
                            if (x.name() == obj["schema"]) {
                                var vl = x.attr("value");
                                if (vl) {
                                    obj["schema"] = vl.value();
                                    obj["schemaContent"] = vl.value();
                                }
                            }
                        })
                    }
                }
            }
            this.serializeScalarsAnnotations(obj, basicNode, props);
            this.serializeMeta(obj, basicNode);
            if (this.canBeFragment(node)) {
                if (RamlWrapper10.isFragment(<any>node)) {
                    var fragment = RamlWrapper10.asFragment(<any>node);
                    var uses = fragment.uses();
                    if (uses.length > 0) {
                        obj["uses"] = uses.map(x=>x.toJSON());
                    }
                }
            }
            this.nodeTransformers.forEach(x=> {
                if (x.match(node, nodeProperty||node.highLevel().property())) {
                    obj = x.transform(obj, node);
                }
            });
            var result:any = {};
            if (rootNodeDetails) {
                if (definition) {
                    var ramlVersion = definition.universe().version();
                    result.ramlVersion = ramlVersion;
                    result.type = definition.nameId();
                }
                result.specification = obj;
                result.errors = this.dumpErrors(basicNode.errors());
            }
            else {
                result = obj;
            }

            return result;
        }
        else if (core.AttributeNodeImpl.isInstance(node)) {

            var props:{[key:string]:nominals.IProperty} = {};
            var attrNode:coreApi.AttributeNode = <coreApi.AttributeNode>node;
            var definition = attrNode.highLevel().definition();
            (<def.ValueType>definition).allCustomProperties().filter(x=>!this.ignore.match(attrNode.highLevel().property().range(), x)).forEach(x=> {
                props[x.nameId()] = x;
            });

            var isValueType = attrNode.highLevel().property().range().isValueType();
            if (isValueType && attrNode['value']) {
                var val = attrNode['value']();
                if (typeof val == 'number' || typeof val == 'string' || typeof val == 'boolean') {
                    return val;
                }
            }
            var obj = this.dumpProperties(props, node);

            this.nodeTransformers.forEach(x=> {
                if (x.match(node.highLevel(), node.highLevel().property())) {
                    obj = x.transform(obj,node.highLevel());
                }
            });

            this.serializeScalarsAnnotations(obj, node, props);
            this.serializeMeta(obj, attrNode);
            return obj;
        }
        else if (core.TypeInstanceImpl.isInstance(node)) {
            return this.serializeTypeInstance(<core.TypeInstanceImpl>node);
        }
        else if (core.TypeInstancePropertyImpl.isInstance(node)) {
            return this.serializeTypeInstanceProperty(<core.TypeInstancePropertyImpl>node);
        }
        return node;

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

    private dumpProperties(props, node:coreApi.BasicNode|coreApi.AttributeNode):any {
        var obj = {};
        var definition:hl.ITypeDefinition;
        if(node.highLevel().isElement()){
            definition = node.highLevel().definition();
        }
        Object.keys(props).forEach(propName=> {

            var nodeProperty:hl.IProperty;
            if(definition) {
                nodeProperty = definition.property(propName);
                if(!nodeProperty){
                    nodeProperty = _.find((<def.NodeClass>definition).allCustomProperties(),x=>x.nameId()==propName);
                }
            }

            if (!node[propName]) {
                this.missingProperties.addProperty(props[propName], node.kind());
                return;
            }
            var property = props[propName];
            var value = node[propName]();
            if (value && propName == "structuredType" && typeof value === "object") {
                value = null;
                var highLevelNode = (<hl.IHighLevelNode>node.highLevel());
                var a = (<hl.IHighLevelNode>highLevelNode).lowLevel();
                var tdl = null;
                a.children().forEach(x=> {
                    if (x.key() == "type" || x.key() == "schema") {
                        var td = highLevelNode.definition().universe().type(universe.Universe10.TypeDeclaration.name);
                        var hasType = highLevelNode.definition().universe().type(universe.Universe10.LibraryBase.name);
                        var tNode = new hlImpl.ASTNodeImpl(x, highLevelNode, td, hasType.property(universe.Universe10.LibraryBase.properties.types.name))
                        tNode.patchType(builder.doDescrimination(tNode));
                        value = this.dumpInternal(tNode.wrapperNode(),false,nodeProperty);
                        propName = x.key();
                    }
                })
            }

            if((propName === "type" || propName == "schema") && value && value.forEach && typeof value[0] === "string") {
                var schemaString = value[0].trim();

                var canBeJson = (schemaString[0] === "{" && schemaString[schemaString.length - 1] === "}");
                var canBeXml= (schemaString[0] === "<" && schemaString[schemaString.length - 1] === ">");

                if(canBeJson || canBeXml) {
                    var include = node.highLevel().lowLevel().includePath && node.highLevel().lowLevel().includePath();

                    if(include) {
                        var aPath = node.highLevel().lowLevel().unit().resolve(include).absolutePath();

                        var relativePath;

                        if(aPath.indexOf("http://") === 0 || aPath.indexOf("https://") === 0) {
                            relativePath = aPath;
                        } else {
                            relativePath = pathUtils.relative((<any>node).highLevel().lowLevel().unit().project().getRootPath(), aPath);
                        }

                        relativePath = relativePath.replace(/\\/g,'/');

                        obj["schemaPath"] = relativePath;
                    }
                }
            }

            if (!value && propName == "type") {
                return
                //we should not use
            }
            if (!value && propName == "schema") {
                return;
                //we should not use
            }
            if ((<coreApi.BasicNode>node).definition
                && universeHelpers.isTypeDeclarationSibling((<coreApi.BasicNode>node).definition())
                && universeHelpers.isTypeProperty(property)) {

                //custom handling of not adding "type" property to the types having "schema" inside, even though the property actually exist,
                // thus making "type" and "schema" arrays mutually exclusive in JSON.


                var schemaValue = node[universe.Universe10.TypeDeclaration.properties.schema.name]();
                if (schemaValue != null && (!Array.isArray(schemaValue) || schemaValue.length != 0)) {
                    return;
                }
                var highLevelNode = (<hl.IHighLevelNode>node.highLevel());
                var a = (<hl.IHighLevelNode>highLevelNode).lowLevel();
                var tdl = null;
                var hasSchema = false;
                a.children().forEach(x=> {
                    if (x.key() == "schema") {
                        hasSchema = true;
                        return;
                    }
                })
                if (hasSchema) {
                    return;
                }

            }

            if (Array.isArray(value)) {
                var propertyValue:any[] = [];
                for (var val of value) {
                    var dumped = this.dumpInternal(val);

                    if (propName === 'examples' && this.options && this.options.dumpXMLRepresentationOfExamples && val.expandable && val.expandable._owner) {
                        (<any>dumped).asXMLString = val.expandable.asXMLString();
                    }

                    propertyValue.push(dumped);
                }
                if (propertyValue.length == 0 && core.BasicNodeImpl.isInstance(node) && !this.isDefined(node, propName)) {
                    return;
                }
                for (var x of this.nodePropertyTransformers) {
                    if (x.match(node.highLevel(), property)) {
                        propertyValue = x.transform(propertyValue, node.highLevel());
                    }
                }
                obj[propName] = propertyValue;
            }
            else {
                var val = this.dumpInternal(value);
                if (val == null && core.BasicNodeImpl.isInstance(node) && !this.isDefined(node, propName)) {
                    return;
                }
                if (core.BasicNodeImpl.isInstance(node)) {
                    this.nodePropertyTransformers.forEach(x=> {
                        if (x.match(node.highLevel(), property)) {
                            val = x.transform(val, node.highLevel());
                        }
                    });
                }
                obj[propName] = val;

                if (propName === 'example' && this.options && this.options.dumpXMLRepresentationOfExamples && value.expandable && value.expandable._owner) {
                    (<any>val).asXMLString = value.expandable.asXMLString();
                }
            }
        });
        return obj;
    }

    serializeScalarsAnnotations(obj:any, node:coreApi.BasicNode|coreApi.AttributeNode, props:{[key:string]:nominals.IProperty}) {
        if (node["scalarsAnnotations"]) {
            var val = {};
            var accessor = node["scalarsAnnotations"]();
            for (var propName of Object.keys(props)) {
                if (accessor[propName]) {
                    var arr:any[] = accessor[propName]();
                    if (arr.length > 0) {
                        if (Array.isArray(arr[0])) {

                            var arr1 = [];
                            arr.forEach((x, i)=> {
                                arr1.push(x.map(y=>this.dumpInternal(y)))
                            });
                            if (arr1.filter(x=>x.length > 0).length > 0) {
                                val[propName] = arr1;
                            }
                        }
                        else {
                            val[propName] = arr.map(x=>this.dumpInternal(x));
                        }
                    }
                }
            }
            if (Object.keys(val).length > 0) {
                obj["scalarsAnnotations"] = val;
            }
        }
    }

    serializeMeta(obj:any, node:coreApi.BasicNode|coreApi.AttributeNode) {
        if (!this.options.serializeMetadata) {
            return;
        }
        var meta = node.meta();
        if (!meta.isDefault()) {
            obj["__METADATA__"] = meta.toJSON();
        }
    }

    serializeTypeInstance(inst:core.TypeInstanceImpl):any {
        if (inst.isScalar()) {
            return inst.value();
        }
        else if (inst.isArray()) {
            return inst.items().map(x=>this.serializeTypeInstance(x));
        }
        else {
            var props = inst.properties();
            if (props.length == 0) {
                return null;
            }
            var obj:any = {};
            props.forEach(x=>obj[x.name()] = this.serializeTypeInstanceProperty(x));
            return obj;
        }
    }

    serializeTypeInstanceProperty(prop:core.TypeInstancePropertyImpl):any {
        if (prop.isArray()) {
            var values = prop.values();
            //if(values.length==0){
            //    return null;
            //}
            var arr:any[] = [];
            values.forEach(x=>arr.push(this.serializeTypeInstance(x)));
            return arr;
        }
        else {
            return this.serializeTypeInstance(prop.value());
        }
    }

    isDefined(node, name) {
        var hl = node.highLevel();
        if (hl.elementsOfKind(name).length > 0) {
            return true;
        }
        if (hl.attributes(name).length > 0) {
            return true;
        }
        return false;
    }

}

export interface Transformation{

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean

    transform(value:any,node?:hl.IParseResult);

    registrationInfo():Object;
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

class ArrayToMappingsArrayTransformer implements Transformation{

    constructor(protected matcher:ObjectPropertyMatcher, protected propName:string){}

    match(node:hl.IParseResult,prop:nominals.IProperty):boolean{
        return this.matcher.match(node.isElement() ? node.asElement().definition():null,prop);
    }

    transform(value:any,node:hl.IParseResult){
        if(Array.isArray(value)){
            return value;
        }
        else {
            var obj = {};
            obj[value[this.propName]] = value;
            return obj;
        }
    }

    registrationInfo():Object{
        return this.matcher.registrationInfo();
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

class TypesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.types.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.schemas.name,true),
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.annotationTypes.name,true)
        ]),"name");
    }
}

class UsesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.LibraryBase.name,universes.Universe10.LibraryBase.properties.uses.name,true)
        ]),"name");
    }

}

class PropertiesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ObjectTypeDeclaration.name,universes.Universe10.ObjectTypeDeclaration.properties.properties.name,true)
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

class FacetsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,universes.Universe10.TypeDeclaration.properties.facets.name,true)
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

class MethodsToMapTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceBase.name,universes.Universe10.ResourceBase.properties.methods.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.Resource.name,universes.Universe08.Resource.properties.methods.name,true),
            new BasicObjectPropertyMatcher(universes.Universe08.ResourceType.name,universes.Universe08.ResourceType.properties.methods.name,true)
        ]),"method");
    }
}

var exampleNameProp = universe.Universe10.ExampleSpec.properties.name.name;
var exampleContentProp = universe.Universe10.ExampleSpec.properties.value.name;
var exampleStructuredContentProp = "structuredContent";

class TypeTransformer extends BasicTransformation{

    constructor(private dumpXMLRepresentationOfExamples=false){
        super(universes.Universe10.TypeDeclaration.name,null,true);
    }

    transform(_value:any,node?:hl.IParseResult){

        var isArray = Array.isArray(_value);
        if(isArray && _value.length==0){
            return _value;
        }
        var value = isArray ? _value[0] : _value;
        var exampleObj = helpersHL.typeExample(
            node.asElement(),this.dumpXMLRepresentationOfExamples);
        if(exampleObj){
            value["examples"] = [ exampleObj ];
        }
        else {
            var examples = helpersHL.typeExamples(
                node.asElement(), this.dumpXMLRepresentationOfExamples);
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
        this.refineTypeValue(value,node.asElement());
        return _value;
    }
    
    private refineTypeValue(value:any,node?:hl.IHighLevelNode){
        if(!Array.isArray(value.type)){
            value.type = [value.type];
        }
        if(value.items){
            if(typeof(value.items)=="string"){
                value.items = this.parseExpression(value.items);                
            }
            else{
                this.refineTypeValue(value.items);
            }
            value.type = [ "array" ];
            value.mediaType = RAML_MEDIATYPE;
        }
        else {
            var externalType = null;
            if(node) {
                externalType = node.localType().isExternal() ? node.localType(): null;
                if (!externalType) {
                    for (var st of node.localType().allSuperTypes()) {
                        if (st.isExternal()) {
                            externalType = st;
                        }
                    }
                }
            }
            if(!externalType) {

                value.mediaType = RAML_MEDIATYPE;
                var gotExp = false;
                var parsedType = value.type.map(x=> {
                    if(!x){
                        return x;
                    }
                    if (typeof(x) == "object") {
                        this.refineTypeValue(x);
                        return x;
                    }
                    gotExp = true;
                    return this.parseExpression(x);
                });
                if (gotExp && parsedType.length == 1
                    && parsedType[0] && typeof(parsedType[0]) == "object") {

                    var singleType = parsedType[0];
                    delete value.type;
                    Object.keys(singleType).filter(x=>x!="mediaType")
                        .forEach(k=>value[k] = singleType[k]);
                }
                else {
                    value.type = parsedType;
                }
            }
            else{
                var sch = externalType.external().schema().trim();
                if(util.stringStartsWith(sch,"<")){
                    value.mediaType = "application/xml";
                }
                else{
                    value.mediaType = "application/json";
                }
            }
        }
        if(value.properties){
            Object.keys(value.properties).forEach(pName=>{
                this.refineTypeValue(value.properties[pName]);
            });
        }
    }

    private parseExpression(exp:string):any{
        var gotExpression = false;

        var eData:referencePatcher.EscapeData
            = { status: referencePatcher.ParametersEscapingStatus.NOT_REQUIRED };

        var str = exp;
        if(exp.indexOf("<<")>=0){
            eData = referencePatcher.escapeTemplateParameters(exp);
            str = eData.resultingString;
        }
        for(var i = 0 ; i < str.length ; i++){
            var ch = str.charAt(i);
            if(ch=="("||ch=="|"||ch=="["){
                gotExpression = true;
            }
        }
        if(!gotExpression){
            return exp;
        }
        var model = expressionParser.parse(str);
        var result = this.serialize(model);
        if(eData.status==referencePatcher.ParametersEscapingStatus.OK){
            this.unescape(result,eData.substitutions);
        }
        return result;
    }

    private unescape(model,substitutions) {
        
        this.unescapeArray(model.type, substitutions);
        this.unescapeArray(model.oneOf, substitutions);
        var itemsValue = model.items;
        if(itemsValue){
            if(typeof(itemsValue)=="string"){
                var ueData = referencePatcher.unescapeTemplateParameters(
                    itemsValue, substitutions);
                if(ueData.status == referencePatcher.ParametersEscapingStatus.OK) {
                    model.items = ueData.resultingString;
                }
            }
            else{
                this.unescape(itemsValue,substitutions);
            }
        }
    }

    private unescapeArray(arr:any, substitutions) {
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                var tVal = arr[i];
                if (typeof(tVal) == "string") {
                    var ueData = referencePatcher.unescapeTemplateParameters(
                        tVal, substitutions);
                    if(ueData.status == referencePatcher.ParametersEscapingStatus.OK) {
                        arr[i] = ueData.resultingString;
                    }
                }
                else {
                    this.unescape(tVal, substitutions);
                }
            }
        }
    }

    private serialize(node:expressionParser.BaseNode):any{
        if (node.type=="union"){
            var ut=<expressionParser.Union>node;
            var serialized1 = this.serialize(ut.first);
            var serialized2 = this.serialize(ut.rest);
            var components = [];
            if(ut.first && ut.first.type=="union"){
                serialized1.oneOf.forEach(c=>components.push(c));
            }
            else{
                components.push(serialized1);
            }
            if(ut.rest && ut.rest.type=="union"){
                serialized2.oneOf.forEach(c=>components.push(c));
            }
            else{
                components.push(serialized2);
            }
            return {
                type: [ "union" ],
                oneOf: components,
                mediaType : "text/plain"
            }
        }
        else if (node.type=="parens"){
            var ps=<expressionParser.Parens>node;
            var rs=this.serialize(ps.expr);
            return this.wrapArray(ps.arr,rs);
        }
        else{
            var lit=(<expressionParser.Literal>node);
            var result:any;
            if (lit.value.charAt(lit.value.length-1)=='?'){
                var name = lit.value.substring(0,lit.value.length-1);
                result = {
                    type : [ "union" ],
                    oneOf : [ name, "nil" ],
                    mediaType : "text/plain"
                };
            }
            else {
                result = lit.value;
            }
            return this.wrapArray(lit.arr, result);
        }
    }

    private wrapArray(a:number, result:any):any {
        while (a-- > 0) {
            result = {                
                type: [ "array" ],
                items: result,
                mediaType : "text/plain"
            };
        }
        return result;
    }

}

class TypeValueTransformer extends BasicTransformation{

    constructor(){
        super(universes.Universe10.TypeDeclaration.name,
            universes.Universe10.TypeDeclaration.properties.type.name,true)
    }

    transform(_value:any,node?:hl.IParseResult){

        var isArray = Array.isArray(_value);
        var arr = isArray ? _value : [ _value ];
        var arr1 = arr.map(x=>{
            if(x==null){
                return "string";
            }
            if(typeof(x)=="string") {
                if (x === "NULL" || x === "Null") {
                    return "string";
                }
            }
            return x;
        });        
        return isArray ? arr1 : arr1[0];
    }
}

class TypeExampleTransformer extends BasicTransformation{

    constructor(private dumpXMLRepresentationOfExamples=false){
        super(universes.Universe10.TypeDeclaration.name,null,true);
    }

    transform(_value:any,node?:hl.IParseResult){
        var isArray = Array.isArray(_value);
        if(isArray && _value.length==0){
            return _value;
        }
        var value = isArray ? _value[0] : _value;
        var exampleObj = helpersHL.typeExample(
            node.asElement(),this.dumpXMLRepresentationOfExamples);
        if(exampleObj){
            value["structuredExample"] = exampleObj;
            value["example"] = exampleObj["structuredValue"];
        }
        return _value;
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


class OneElementArrayTransformer extends BasicTransformation{

    constructor(){
        super(universes.Universe10.Api.name,universes.Universe10.Api.properties.mediaType.name,true);
    }

    transform(value:any){
        if(Array.isArray(value) && value.length==1){
            return value[0];
        }
        return value;
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
            value.absoluteUri = helpersHL.absoluteUri(node.asElement());
            value.completeRelativeUri = helpersHL.completeRelativeUri(node.asElement());
            if(universeHelpers.isResourceType(node.parent().definition())){
                value.parentUri = helpersHL.completeRelativeUri(node.parent());
            }
            else{
                value.parentUri = "";
            }
        }
        return value;
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

class TemplateParametrizedPropertiesTransformer extends MatcherBasedTransformation{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universes.Universe10.ResourceType.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Trait.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.Method.name,null,true),
            new BasicObjectPropertyMatcher(universes.Universe10.TypeDeclaration.name,null,true)
        ]));
    }

    transform(value:any){
        if(Array.isArray(value)){
            return value;
        }
        var propName = universe.Universe10.Trait.properties.parametrizedProperties.name;
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

class ArrayExpressionTransformer extends BasicTransformation{


    constructor(){
        super(universes.Universe10.TypeDeclaration.name,null,true);
    }

    transform(value:any,node:hl.IParseResult){

        var lType = node.asElement().localType();
        if(!lType || !lType.isArray()){
            return value;
        } 
        
        var typePropName = universes.Universe10.TypeDeclaration.properties.type.name;
        var itemsPropName = universes.Universe10.ArrayTypeDeclaration.properties.items.name;
        var tValue = value[typePropName];
        if(tValue.length==1&&util.stringEndsWith(tValue[0],"[]")) {
            if(value[itemsPropName]==null) {
                value[itemsPropName] = tValue[0].substring(0, tValue[0].length - 2);
            }
            tValue[0] = "array";
        }
        return value;
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

    allUriParameters?:boolean
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