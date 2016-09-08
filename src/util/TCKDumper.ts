/// <reference path="../../typings/main.d.ts" />
var universe = require("../raml1/tools/universe");
import coreApi = require("../raml1/wrapped-ast/parserCoreApi");
import core = require("../raml1/wrapped-ast/parserCore");
import def = require("raml-definition-system")
import hl = require("../raml1/highLevelAST");
import hlImpl = require("../raml1/highLevelImpl");
import builder = require("../raml1/ast.core/builder");

import typeSystem = def.rt;
import nominals = typeSystem.nominalTypes;
import universeHelpers = require("../raml1/tools/universeHelpers")
import universes = require("../raml1/tools/universe")
import util = require("../util/index")

import RamlWrapper10 = require("../raml1/artifacts/raml10parserapi");

export function dump(node: coreApi.BasicNode|coreApi.AttributeNode, serializeMeta:boolean = true):any{
    return new TCKDumper({
        rootNodeDetails : true,
        serializeMetadata : serializeMeta
    }).dump(node);
}

export class TCKDumper{

    constructor(private options?:SerializeOptions){
        this.options = this.options || {};
        if(this.options.serializeMetadata == null){
            this.options.serializeMetadata = true;
        }
    }

    private nodeTransformers:Transformation[] = [
        new ResourcesTransformer(),
        new TypeExampleTransformer(),
        //new ParametersTransformer(),
        new ArrayExpressionTransformer(),
        new TypesTransformer(),
        //new UsesTransformer(),
        //new PropertiesTransformer(),
        //new ExamplesTransformer(),
        //new ResponsesTransformer(),
        //new BodiesTransformer(),
        //new AnnotationsTransformer(),
        new SecuritySchemesTransformer(),
        new AnnotationTypesTransformer(),
        new TemplateParametrizedPropertiesTransformer(),
        new TraitsTransformer(),
        new ResourceTypesTransformer(),
        //new FacetsTransformer(),
        new SchemasTransformer(),
        new ProtocolsToUpperCaseTransformer(),
        new ResourceTypeMethodsToMapTransformer(),
        new ReferencesTransformer(),
        //new OneElementArrayTransformer()
    ];

    private nodePropertyTransformers:Transformation[] = [
        //new ResourcesTransformer(),
        //new TypeExampleTransformer(),
        new ParametersTransformer(),
        //new TypesTransformer(),
        //new UsesTransformer(),
        new PropertiesTransformer(),
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
        new OneElementArrayTransformer()
    ];

    private ignore:ObjectPropertyMatcher = new CompositeObjectPropertyMatcher([
        new BasicObjectPropertyMatcher(universeHelpers.isResponseType,universeHelpers.isDisplayNameProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isDisplayNameProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isAnnotationRefTypeOrDescendant,universeHelpers.isAnnotationProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isSecuritySchemeRefType,universeHelpers.isSecuritySchemeProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isTraitRefType,universeHelpers.isTraitProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResourceTypeRefType,universeHelpers.isResourceTypeProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isRAMLVersionProperty)
    ]);

    private missingProperties:PropertiesData = new PropertiesData();

    printMissingProperties():string{
        return this.missingProperties.print();
    }

    dump(node:any):any{
        var highLevelNode = node.highLevel();
        var highLevelParent = highLevelNode && highLevelNode.parent();
        var rootNodeDetails = !highLevelParent && this.options.rootNodeDetails;
        var result = this.dumpInternal(node, rootNodeDetails);
        this.patchNames(rootNodeDetails ? result.specification : result);
        return result;
    }

    dumpInternal(node:any,rootNodeDetails:boolean=false):any{

        if(node==null){
            return null;
        }


        if(node instanceof core.BasicNodeImpl){

            var props:{[key:string]:nominals.IProperty} = {};
            var basicNode:coreApi.BasicNode = <coreApi.BasicNode>node;
            var definition = basicNode.highLevel().definition();
            definition.allProperties().filter(x=>!this.ignore.match(basicNode.definition(),x)).forEach(x=>{
                props[x.nameId()] = x;
            });
            (<def.NodeClass>definition).allCustomProperties().filter(x=>!this.ignore.match(basicNode.definition(),x)).forEach(x=>{
                props[x.nameId()] = x;
            });
            var obj = this.dumpProperties(props, node);
            if (props["schema"]){
                if (this.options.dumpSchemaContents) {
                    if (props["schema"].range().key() == universes.Universe08.SchemaString) {
                        var schemas = basicNode.highLevel().root().elementsOfKind("schemas");
                        schemas.forEach(x=> {
                            if (x.name() == obj["schema"]) {
                                var vl = x.attr("value");
                                if (vl) {
                                    obj["schema"] = vl.value();
                                    obj["schemaContent"]=vl.value();
                                }
                            }
                        })
                    }
                }
            }
            this.serializeScalarsAnnotations(obj,basicNode,props);
            this.serializeMeta(obj,basicNode);
            if(this.canBeFragment(node)){
                if(RamlWrapper10.isFragment(<any>node)){
                    var fragment = RamlWrapper10.asFragment(<any>node);
                    var uses = fragment.uses();
                    if(uses.length>0){
                        obj["uses"] = uses.map(x=>x.toJSON());
                    }
                }
            }
            this.nodeTransformers.forEach(x=> {
                if (x.match(node, node.highLevel().property())) {
                    obj = x.transform(obj);
                }
            });
            var result:any = {};
            if(rootNodeDetails){
                if(definition){
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
        else if(node instanceof core.AttributeNodeImpl){

            var props:{[key:string]:nominals.IProperty} = {};
            var attrNode:coreApi.AttributeNode = <coreApi.AttributeNode>node;
            var definition = attrNode.highLevel().definition();
            (<def.ValueType>definition).allCustomProperties().filter(x=>!this.ignore.match(attrNode.highLevel().property().range(),x)).forEach(x=>{
                props[x.nameId()] = x;
            });

            var isValueType = attrNode.highLevel().property().range().isValueType();
            if(isValueType&&attrNode['value']) {
                var val = attrNode['value']();
                if (typeof val == 'number' || typeof val == 'string' || typeof val == 'boolean') {
                    return val;
                }
            }
            var obj = this.dumpProperties(props,node);

                this.nodeTransformers.forEach(x=> {
                    if (x.match(node, node.highLevel().property())) {
                        obj = x.transform(obj);
                    }
                });

            this.serializeScalarsAnnotations(obj,node,props);
            this.serializeMeta(obj,attrNode);
            return obj;
        }
        else if(node instanceof core.TypeInstanceImpl){
            return this.serializeTypeInstance(<core.TypeInstanceImpl>node);
        }
        else if(node instanceof core.TypeInstancePropertyImpl){
            return this.serializeTypeInstanceProperty(<core.TypeInstancePropertyImpl>node);
        }
        return node;

    }

    private canBeFragment(node:core.BasicNodeImpl){

        var definition = node.definition();
        var arr = [definition].concat(definition.allSubTypes());
        var arr1 = arr.filter(x=>x.getAdapter(def.RAMLService).possibleInterfaces()
            .filter(y=>y.nameId()==def.universesInfo.Universe10.FragmentDeclaration.name).length>0);

        return arr1.length>0;
    }

    private dumpErrors(errors:core.RamlParserError[]) {
        return errors.map(x=> {
            var eObj = this.dumpErrorBasic(x);
            if(x.trace && x.trace.length>0) {
                eObj['trace'] = x.trace.map(y=>this.dumpErrorBasic(y));
            }
            return eObj;
        }).sort((x, y)=> {
            if (x.path != y.path) {
                return x.path.localeCompare(y.path);
            }
            if (x.position != y.position) {
                return x.position - y.position;
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
        if(x.isWarning===true){
            eObj.isWarning = true;
        }
        return eObj;
    }

    private dumpProperties(props, node:coreApi.BasicNode|coreApi.AttributeNode):any {
        var obj = {};
        Object.keys(props).forEach(propName=> {

            if (!node[propName]) {
                this.missingProperties.addProperty(props[propName],node.kind());
                return;
            }
            var property = props[propName];
            var value = node[propName]();
            if (value && propName=="structuredType"&&typeof value==="object"){
                value=null;
                var highLevelNode=(<hl.IHighLevelNode>node.highLevel());
                var a=(<hl.IHighLevelNode>highLevelNode).lowLevel();
                var tdl=null;
                a.children().forEach(x=>{
                    if (x.key()=="type"||x.key()=="schema"){
                        var td=highLevelNode.definition().universe().type(universe.Universe10.TypeDeclaration.name);
                        var hasType=highLevelNode.definition().universe().type(universe.Universe10.LibraryBase.name);
                        var tNode=new hlImpl.ASTNodeImpl(x,highLevelNode,td,hasType.property(universe.Universe10.LibraryBase.properties.types.name))
                        tNode.patchType(builder.doDescrimination(tNode));
                        value=dump(tNode.wrapperNode());
                        propName=x.key();
                    }
                })
            }
            if (!value && propName=="type"){
                return
                //we should not use
            }
            if (!value && propName=="schema"){
                return;
                //we should not use
            }
            if ((<coreApi.BasicNode>node).definition
                && universeHelpers.isTypeDeclarationSibling((<coreApi.BasicNode>node).definition())
                && universeHelpers.isTypeProperty(property)) {

                //custom handling of not adding "type" property to the types having "schema" inside, even though the property actually exist,
                // thus making "type" and "schema" arrays mutually exclusive in JSON.


                    var schemaValue =node[universe.Universe10.TypeDeclaration.properties.schema.name]();
                    if(schemaValue != null && (!Array.isArray(schemaValue) || schemaValue.length != 0)) {
                        return;
                    }
                    var highLevelNode=(<hl.IHighLevelNode>node.highLevel());
                    var a=(<hl.IHighLevelNode>highLevelNode).lowLevel();
                    var tdl=null;
                    var hasSchema=false;
                    a.children().forEach(x=>{
                        if (x.key()=="schema"){
                            hasSchema=true;
                            return;
                        }
                    })
                    if (hasSchema){
                        return;
                    }

            }

            if (Array.isArray(value)) {
                var propertyValue:any[] = [];
                for(var val of value){
                    var dumped = this.dumpInternal(val);

                    if(propName === 'examples' && this.options && this.options.dumpXMLRepresentationOfExamples && val.expandable && val.expandable._owner) {
                        (<any>dumped).asXMLString = val.expandable.asXMLString();
                    }

                    propertyValue.push(dumped);
                }
                if(propertyValue.length==0 && node instanceof core.BasicNodeImpl && !this.isDefined(node,propName)){
                    return;
                }
                for(var x of this.nodePropertyTransformers){
                    if(x.match(node, property)){
                        propertyValue = x.transform(propertyValue);
                    }
                }
                obj[propName] = propertyValue;
            }
            else {
                var val = this.dumpInternal(value);
                if(val==null && node instanceof core.BasicNodeImpl && !this.isDefined(node,propName)){
                    return;
                }
                if(node instanceof core.BasicNodeImpl) {
                    this.nodePropertyTransformers.forEach(x=> {
                        if (x.match(node, property)) {
                            val = x.transform(val);
                        }
                    });
                }
                obj[propName] = val;

                if(propName === 'example' && this.options && this.options.dumpXMLRepresentationOfExamples && value.expandable && value.expandable._owner) {
                    (<any>val).asXMLString = value.expandable.asXMLString();
                }
            }
        });
        return obj;
    }

    serializeScalarsAnnotations(obj:any,node:coreApi.BasicNode|coreApi.AttributeNode,props:{[key:string]:nominals.IProperty}){
        if(node["scalarsAnnotations"]){
            var val={};
            var accessor = node["scalarsAnnotations"]();
            for(var propName of Object.keys(props)){
                if(accessor[propName]){
                    var arr:any[] = accessor[propName]();
                    if(arr.length>0){
                        if(Array.isArray(arr[0])){

                            var arr1 = [];
                            arr.forEach((x,i)=>{arr1.push(x.map(y=>this.dumpInternal(y)))});
                            if(arr1.filter(x=>x.length>0).length>0){
                                val[propName] = arr1;
                            }
                        }
                        else {
                            val[propName] = arr.map(x=>this.dumpInternal(x));
                        }
                    }
                }
            }
            if(Object.keys(val).length>0){
                obj["scalarsAnnotations"] = val;
            }
        }
    }

    serializeMeta(obj:any,node:coreApi.BasicNode|coreApi.AttributeNode){
        if(!this.options.serializeMetadata){
            return;
        }
        var meta = node.meta();
        if(!meta.isDefault()){
            obj["__METADATA__"] = meta.toJSON();
        }
    }

    serializeTypeInstance(inst:core.TypeInstanceImpl):any {
        if (inst.isScalar()) {
            return inst.value();
        }
        else if(inst.isArray()){
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
    
    patchNames(obj:any){
        var collectionNames = [
            universe.Universe10.Library.properties.types.name,
            universe.Universe10.Library.properties.annotationTypes.name,
            universe.Universe10.Library.properties.traits.name,
            universe.Universe10.Library.properties.resourceTypes.name,
            universe.Universe10.Library.properties.securitySchemes.name
        ];
        for(var cName of collectionNames){
            var collection = obj[cName];
            if(collection){
                for(var item of collection){
                    var key = Object.keys(item)[0];
                    if(util.stringStartsWith(key,"http://")
                        ||util.stringStartsWith(key,"https://")
                        ||util.stringStartsWith(key,"file://")){
                        
                        var ind = key.lastIndexOf("/");
                        var name = key.substring(ind+1);
                        var iObj = item[key];
                        iObj.name = name;
                        if(iObj.displayName==key){
                            iObj.displayName = name;
                        }
                    }
                }
            }
        }
    }
}

interface Transformation{

    match(node:coreApi.BasicNode|coreApi.AttributeNode,prop:nominals.IProperty):boolean

    transform(value:any)
}

interface ObjectPropertyMatcher{

    match(td:nominals.ITypeDefinition,prop:nominals.IProperty):boolean
}

class BasicObjectPropertyMatcher implements ObjectPropertyMatcher{

    constructor(
        protected typeMatcher: (x:nominals.ITypeDefinition)=>boolean,
        protected propMatcher: (x:nominals.IProperty)=>boolean
    ){}

    match(td:nominals.ITypeDefinition,prop:nominals.IProperty):boolean{
        return (td==null||this.typeMatcher(td))&&((prop==null) || this.propMatcher(prop));
    }
}

class CompositeObjectPropertyMatcher implements ObjectPropertyMatcher{

    constructor(protected matchers:ObjectPropertyMatcher[]){}

    match(td:nominals.ITypeDefinition,prop:nominals.IProperty):boolean{
        var l = this.matchers.length;
        for(var i = 0 ; i < l ; i++){
            if(this.matchers[i].match(td,prop)){
                return true;
            }
        }
        return false;
    }
}

class ArrayToMapTransformer implements Transformation{

    constructor(protected matcher:ObjectPropertyMatcher, protected propName:string){}

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return this.matcher.match(node.definition(),prop);
    }

    transform(value:any){
        if(Array.isArray(value)&&value.length>0 && value[0][this.propName]){
            var obj = {};
            value.forEach(x=>{
                var key = x[this.propName];
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

}

class ArrayToMappingsArrayTransformer implements Transformation{

    constructor(protected matcher:ObjectPropertyMatcher, protected propName:string){}

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return this.matcher.match(node.definition ? node.definition():null,prop);
    }

    transform(value:any){
        if(Array.isArray(value)){
            return value;
        }
        else {
            var obj = {};
            obj[value[this.propName]] = value;
            return obj;
        }
    }

}

class ParametersTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isBaseUriParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isUriParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isTraitType,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isMethodType,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isSecuritySchemePartType,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isTraitType,universeHelpers.isHeadersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isMethodType,universeHelpers.isHeadersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isSecuritySchemePartType,universeHelpers.isHeadersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isBodyLikeType,universeHelpers.isFormParametersProperty)
        ]),"name");
    }

}

class TypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isTypesProperty),
            new BasicObjectPropertyMatcher(
                x=>universeHelpers.isLibraryBaseSibling(x)&&universeHelpers.isRAML10Type(x)
                ,universeHelpers.isSchemasProperty)
        ]),"name");
    }

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return node.parent()!=null && this.matcher.match(node.parent().definition(),prop);
    }

}

class UsesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isUsesProperty)
        ]),"name");
    }

}

class PropertiesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isObjectTypeDeclarationSibling,universeHelpers.isPropertiesProperty)
        ]),"name");
    }

}

class ResponsesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isMethodBaseSibling,universeHelpers.isResponsesProperty)
        ]),"code");
    }
}

class AnnotationsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(x=>true,universeHelpers.isAnnotationsProperty)
        ]),"name");
    }
}

class BodiesTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isResponseType,universeHelpers.isBodyProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isMethodBaseSibling,universeHelpers.isBodyProperty)
        ]),"name");
    }

}

class TraitsTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isTraitType,universeHelpers.isTraitsProperty)
        ]),"name");
    }
}

class ResourceTypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isResourceTypeType,universeHelpers.isResourceTypesProperty)
        ]),"name");
    }

    transform(value:any){
        var methodsPropertyName = universes.Universe10.ResourceBase.properties.methods.name;
        if(Array.isArray(value)) {
            return value;
        }
        else{
            var methods = value[methodsPropertyName];
            if (methods) {
                methods.forEach(m=> {
                    var keys = Object.keys(m);
                    if (keys.length > 0) {
                        var methodName = keys[0];
                        value[methodName] = m[methodName];
                    }
                })
            }
            delete value[methodsPropertyName];
            return super.transform(value);
        }
    }
}

class FacetsTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isTypeDeclarationSibling,universeHelpers.isFacetsProperty)
        ]),"name");
    }
}

class SecuritySchemesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(null,"name");
    }

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return prop != null && universeHelpers.isSecuritySchemesProperty(prop);
    }
}

class AnnotationTypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isAnnotationTypesProperty)
        ]),"name");
    }

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return node.parent()!=null && this.matcher.match(node.parent().definition(),prop);
    }

}

class ResourceTypeMethodsToMapTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(null,"method");
    }

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return node.parent()!=null
            && universeHelpers.isResourceTypeType(node.parent().definition())
            && universeHelpers.isMethodsProperty(prop);
    }
}

var exampleNameProp = universe.Universe10.ExampleSpec.properties.name.name;
var exampleContentProp = universe.Universe10.ExampleSpec.properties.value.name;
var exampleStructuredContentProp = "structuredContent";

class ExamplesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return universeHelpers.isExampleSpecType(node.definition());
    }

    transform(value:any){
        if(Array.isArray(value)&&value.length>0){

            if(value[0][exampleNameProp]){
                var obj = {};
                value.forEach(x=>obj[x[exampleNameProp]]=this.getActualExample(x));
                return obj;
            }
            else{
                var arr = value.map(x=>this.getActualExample(x));
                return arr;
            }
        }
        else {
            return value;
        }
    }

    private getActualExample(exampleSpecObj):any{
        if(exampleSpecObj[exampleStructuredContentProp]){
            return exampleSpecObj[exampleStructuredContentProp];
        }
        return exampleSpecObj[exampleContentProp];
    }

}

class TypeExampleTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return node.definition && universeHelpers.isTypeDeclarationSibling(node.definition());
    }

    transform(value:any){
        var isArray = Array.isArray(value);
        var arr = isArray ? value : [ value ];
        arr.forEach(x=>{
            var structuredExample = x['example'];
            if(structuredExample){
                x['example'] = structuredExample.structuredValue;
                x['structuredExample'] = structuredExample;
            }
        });
        return isArray ? arr : arr[0];
    }
}

class SchemasTransformer implements Transformation{

    protected matcher = new BasicObjectPropertyMatcher(
        x=>universeHelpers.isApiType(x)&&universeHelpers.isRAML08Type(x),universeHelpers.isSchemasProperty);

    match(node:coreApi.BasicNode|coreApi.AttributeNode,prop:nominals.IProperty):boolean{
        return node.parent()!=null&&this.matcher.match(node.parent().definition(),prop);
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

    private getActualExample(exampleSpecObj):any{
        if(exampleSpecObj[exampleStructuredContentProp]){
            return exampleSpecObj[exampleStructuredContentProp];
        }
        return exampleSpecObj[exampleContentProp];
    }

}

class ProtocolsToUpperCaseTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return prop!=null && universeHelpers.isProtocolsProperty(prop);
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


class OneElementArrayTransformer implements Transformation{

    usecases:ObjectPropertyMatcher = new CompositeObjectPropertyMatcher([
        new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isMediaTypeProperty)
    ]);


    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return this.usecases.match(node.definition(),prop);
    }

    transform(value:any){
        if(Array.isArray(value) && value.length==1){
            return value[0];
        }
        return value;
    }

}

class ResourcesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return prop!=null && universeHelpers.isResourcesProperty(prop);
    }

    transform(value:any){
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
        }
        return value;
    }

}

class TemplateParametrizedPropertiesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        var hlNode = node.highLevel();
        if(!hlNode){
            return false;
        }
        var d = hlNode.definition();
        if(!d){
            return false;
        }
        return universeHelpers.isResourceTypeType(d)
            || universeHelpers.isTraitType(d)
            || universeHelpers.isMethodType(d)
            || universeHelpers.isTypeDeclarationSibling(d);
        
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


class ReferencesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return prop!=null && (
            universeHelpers.isSecuredByProperty(prop)
                ||universeHelpers.isIsProperty(prop)
                ||(node.parent()!=null&&(universeHelpers.isResourceType(node.parent().highLevel().definition())
                    ||universeHelpers.isResourceTypeType(node.parent().highLevel().definition()))
                &&universeHelpers.isTypeProperty(prop))
        );
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

class ArrayExpressionTransformer implements Transformation{

    match(node:coreApi.BasicNode|coreApi.AttributeNode,prop:nominals.IProperty):boolean{
        if(!(node instanceof core.BasicNodeImpl)){
            return false;
        }
        var hlNode = (<coreApi.BasicNode>node).highLevel();
        var definition = hlNode.definition();
        if(!universeHelpers.isTypeDeclarationDescendant(definition)){
            return false;
        }
        var lType = hlNode.localType();
        if(!lType || !lType.isArray()){
            return false;
        }
        return true;
    }

    transform(value:any){
        var typePropName = universes.Universe10.TypeDeclaration.properties.type.name;
        var itemsPropName = universes.Universe10.ArrayTypeDeclaration.properties.items.name;
        var tValue = value[typePropName];
        if(tValue.length==1&&util.stringEndsWith(tValue[0],"[]")) {
            value[itemsPropName] = tValue[0].substring(0, tValue[0].length - 2);
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
}