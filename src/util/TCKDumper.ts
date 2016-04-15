/// <reference path="../../typings/main.d.ts" />
var universe = require("../raml1/tools/universe");
import coreApi = require("../raml1/wrapped-ast/parserCoreApi");
import core = require("../raml1/wrapped-ast/parserCore");
import def = require("raml-definition-system")
import typeSystem = def.rt;
import nominals = typeSystem.nominalTypes;
import universeHelpers = require("../raml1/tools/universeHelpers")
import universes = require("../raml1/tools/universe")
import util = require("../util/index")

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

    private transformers:Transformation[] = [
        new ResourcesTransformer(),
        //new TypeExampleTransformer(),
        new ParametersTransformer(),
        new TypesTransformer(),
        new UsesTransformer(),
        new PropertiesTransformer(),
        //new ExamplesTransformer(),
        new ResponsesTransformer(),
        new BodiesTransformer(),
        new AnnotationsTransformer(),
        new SecuritySchemesTransformer(),
        new AnnotationTypesTransformer(),
        new TemplateParametrizedPropertiesTransformer(),
        new TraitsTransformer(),
        new ResourceTypesTransformer(),
        new FacetsTransformer(),
        new SchemasTransformer(),
        //new OneElementArrayTransformer(),
        new ProtocolsToUpperCaseTransformer(),
        new ResourceTypeMethodsToMapTransformer(),
        new ReferencesTransformer()
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
        return this.dumpInternal(node, rootNodeDetails);
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
            this.serializeMeta(obj,basicNode);
            if(rootNodeDetails){
                var result:any = {};
                if(definition){
                    var ramlVersion = definition.universe().version();
                    result.ramlVersion = ramlVersion;
                    result.type = definition.nameId();
                }
                result.specification = obj;
                result.errors = this.dumpErrors(basicNode.errors());
                return result;
            }
            else {
                return obj;
            }
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

    private dumpErrors(errors:core.RamlParserError[]) {
        return errors.map(x=> {
            return {
                "code": x.code, //TCK error code
                "message": x.message,
                "path": x.path,
                "line": x.line,
                "column": x.column,
                "position": x.start,
                "range": x.range
            }
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

    private dumpProperties(props, node:coreApi.BasicNode|coreApi.AttributeNode):any {
        var obj = {};
        Object.keys(props).forEach(propName=> {

            if (!node[propName]) {
                this.missingProperties.addProperty(props[propName],node.kind());
                return;
            }
            var property = props[propName];
            var value = node[propName]();
            if (Array.isArray(value)) {
                var propertyValue:any = [];
                value.forEach(x=>propertyValue.push(this.dumpInternal(x)));
                if(propertyValue.length==0 && node instanceof core.BasicNodeImpl && !this.isDefined(node,propName)){
                    return;
                }
                this.transformers.forEach(x=>{

                    if(x.match(node, property)){
                        propertyValue = x.transform(propertyValue);
                    }
                });
                obj[propName] = propertyValue;
            }
            else {
                var val = this.dumpInternal(value);
                if(val==null && node instanceof core.BasicNodeImpl && !this.isDefined(node,propName)){
                    return;
                }
                if(node instanceof core.BasicNodeImpl) {
                    this.transformers.forEach(x=> {
                        if (x.match(node, property)) {
                            val = x.transform(val);
                        }
                    });
                }
                obj[propName] = val;
            }
        });
        return obj;
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
        return this.typeMatcher(td)&&this.propMatcher(prop);
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
        return this.matcher.match(node.definition(),prop);
    }

    transform(value:any){
        if(Array.isArray(value)&&value.length>0 && value[0][this.propName]){
            var array = [];
            value.forEach(x=> {
                var obj = {};
                obj[x[this.propName]] = x;
                array.push(obj);
            });
            return array;
        }
        return value;
    }

}

class ParametersTransformer extends ArrayToMapTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isBaseUriParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isUriParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isHasNormalParametersSibling,universeHelpers.isQueryParametersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isHasNormalParametersSibling,universeHelpers.isHeadersProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isBodyLikeType,universeHelpers.isFormParametersProperty)
        ]),"name");
    }

}

class TypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isTypesProperty)
        ]),"name");
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
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isTraitsProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isTraitsProperty)
        ]),"name");
    }
}

class ResourceTypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isResourceTypesProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isResourceTypesProperty)
        ]),"name");
    }

    transform(value:any){
        value.forEach(x=>{
            var methodsPropertyName = universes.Universe10.ResourceBase.properties.methods.name;
            var methods = x[methodsPropertyName];
            if(methods){
                methods.forEach(m=>{
                    var keys = Object.keys(m);
                    if(keys.length>0) {
                        var methodName = keys[0];
                        x[methodName] = m[methodName];
                    }
                })
            }
            delete x[methodsPropertyName];
        });
        return super.transform(value);
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
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isSecuritySchemesProperty),
            new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isSecuritySchemesProperty)
        ]),"name");
    }
}

class AnnotationTypesTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isAnnotationTypesProperty)
        ]),"displayName");
    }

}

class ResourceTypeMethodsToMapTransformer extends ArrayToMappingsArrayTransformer{

    constructor(){
        super(new CompositeObjectPropertyMatcher([
            new BasicObjectPropertyMatcher(universeHelpers.isResourceTypeType,universeHelpers.isMethodsProperty)
        ]),"method");
    }
}

var exampleNameProp = universe.Universe10.ExampleSpec.properties.name.name;
var exampleContentProp = universe.Universe10.ExampleSpec.properties.value.name;
var exampleStructuredContentProp = "structuredContent";

class ExamplesTransformer implements Transformation{

    protected matcher = new BasicObjectPropertyMatcher(universeHelpers.isTypeDeclarationSibling,universeHelpers.isExamplesProperty);

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return this.matcher.match(node.definition(),prop);
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
        return universeHelpers.isTypeDeclarationSibling(prop.range());
    }

    transform(value:any){
        var isArray = Array.isArray(value);
        var arr = isArray ? value : [ value ];
        arr.forEach(x=>{
            var structuredExample = x['structuredExample'];
            if(structuredExample){
                x['example'] = structuredExample;
                delete x['structuredExample'];
            }
        });
        return isArray ? arr : arr[0];
    }
}

class SchemasTransformer implements Transformation{

    protected matcher = new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isSchemasProperty);

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return this.matcher.match(node.definition(),prop);
    }

    transform(value:any){
        if(Array.isArray(value)&&value.length>0){

            var array = value.map(x=>{
                var obj = {};
                obj[x.key] = x.value;
                return obj;
            });
            return array;
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

class ProtocolsToUpperCaseTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return universeHelpers.isProtocolsProperty(prop);
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

    exceptions:ObjectPropertyMatcher = new CompositeObjectPropertyMatcher([
        new BasicObjectPropertyMatcher(universeHelpers.isTypeDeclarationSibling,universeHelpers.isPropertiesProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isResourcesProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResourceTypeType,universeHelpers.isResourcesProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isResourcesProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isMethodBaseSibling,universeHelpers.isResponsesProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isMethodsProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResponseType,universeHelpers.isBodyProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isApiSibling,universeHelpers.isProtocolsProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isMethodBaseSibling,universeHelpers.isProtocolsProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isResourceBaseSibling,universeHelpers.isProtocolsProperty),
        new BasicObjectPropertyMatcher(universeHelpers.isLibraryBaseSibling,universeHelpers.isUsesProperty),
        new BasicObjectPropertyMatcher(x=>true,x=>x.nameId()=='enum'),
        new BasicObjectPropertyMatcher(x=>true,universeHelpers.isSecuredByProperty)
    ]);

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return !this.exceptions.match(node.definition(),prop);
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
        return universeHelpers.isResourcesProperty(prop);
    }

    transform(value:any){
        if(!Array.isArray(value)){
            return value;
        }
        value.forEach(x=>{
            var relUri = x[universes.Universe10.Resource.properties.relativeUri.name];
            if(relUri){
                var segments = relUri.trim().split("/");
                while(segments.length > 0 && segments[0].length == 0){
                    segments.shift();
                }
                x["relativeUriPathSegments"] = segments;
            }
        });
        return value;
    }

}

class TemplateParametrizedPropertiesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return universeHelpers.isResourceTypesProperty(prop)||universeHelpers.isTraitsProperty(prop);
    }

    transform(value:any){
        if(Array.isArray(value)){
            value.forEach(x=>{
                var propName = universe.Universe10.Trait.properties.parametrizedProperties.name;
                var parametrizedProps = x[propName];
                if(parametrizedProps){
                    Object.keys(parametrizedProps).forEach(y=>{
                        x[y] = parametrizedProps[y];
                    });
                    delete x[propName];
                }
            });
        }
        return value;
    }

}


class ReferencesTransformer implements Transformation{

    match(node:coreApi.BasicNode,prop:nominals.IProperty):boolean{
        return universeHelpers.isSecuredByProperty(prop)
            ||universeHelpers.isIsProperty(prop)
            ||((universeHelpers.isResourceType(node.highLevel().definition())
                ||universeHelpers.isResourceTypeType(node.highLevel().definition()))
            &&universeHelpers.isTypeProperty(prop));
    }

    transform(value:any){
        if(!value){
            return null;
        }
        if(Array.isArray(value))
        {
            var array = value.map(x=>this.toSimpleValue(x));
            return array;
        }
        else{
            return this.toSimpleValue(value);
        }
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
}