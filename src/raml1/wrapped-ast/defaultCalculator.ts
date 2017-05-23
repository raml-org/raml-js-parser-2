import hl=require("../highLevelAST");
import ll=require("../lowLevelAST");
import hlImpl=require("../highLevelImpl");
import jsyaml=require("../jsyaml/jsyaml2lowLevel");
import def=require("raml-definition-system");
import ramlService=def
import json2lowlevel = require('../jsyaml/json2lowLevel');
import universes = require("../tools/universe")
import universeHelpers = require("../tools/universeHelpers")
import services=def
import parserCore = require("./parserCore")
import search = require("../../search/search-interface")
import RamlWrapper10 = require("../artifacts/raml10parser")
import RamlWrapper08 = require("../artifacts/raml08parser")

export class AttributeDefaultsCalculator {

    /**
    /**
     *
     * @param enabled - if false, defaults calculator will not return defaults from
     * attrValueOrDefault method, only original values.
     * @constructor
     */
    constructor(private enabled : boolean, private toHighLevel=false) {
        this.valueCalculators = [
            new RequiredPropertyCalculator(),
            new TypePropertyCalculator(),
            new DisplayNamePropertyCalculator(),
            new MediaTypeCalculator(),
            new SecuredByPropertyCalculator(this.toHighLevel),
            new ProtocolsPropertyCalculator(),
            new VersionParamEnumCalculator()
        ];
    }

    valueCalculators:ValueCalculator[]

    /**
     * These calculators are only applied when default calculator is generally disabled (this.enabled==false)
     * and should cover the cases when we -need- to insert some calculated value in any case
     * and helpers should be avoided for some reason.
     * @type {UnconditionalRequiredPropertyCalculator[]}
     */
    unconditionalValueCalculators:ValueCalculator[] = [
        new UnconditionalRequiredPropertyCalculator(),
    ];
    /**
     * Return attribute default value if defaults calculator is enabled.
     * If attribute value is null or undefined, returns attribute default.
     */
    attributeDefaultIfEnabled(node : hl.IHighLevelNode, attributeProperty : hl.IProperty) : any {
        if (!this.enabled)
            return this.getUnconditionalAttributeDefault(attributeProperty, node);

        return this.getAttributeDefault(node, attributeProperty);
    }

    getUnconditionalAttributeDefault(attributeProperty: hl.IProperty, node : hl.IHighLevelNode) : any {

        if (!node || !attributeProperty) return null;

        for(var i = 0 ; i < this.unconditionalValueCalculators.length; i++){

            var calculator = this.unconditionalValueCalculators[i];
            if(calculator.matches(attributeProperty,node)){
                var value = calculator.calculate(attributeProperty,node);
                if(value != null){
                    return value;
                }
            }
        }

        return null;
    }

    /**
     * Returns attribute default.
     */
    getAttributeDefault(node : hl.IHighLevelNode, attributeProperty : hl.IProperty) : any {
        if (!node || !attributeProperty) return null;

        try {
            return this.getAttributeDefault2(attributeProperty,node);
        } catch (Error) {
            console.log(Error)
            return null;
        }
    }

    getWrapperAttributeDefault(wrapperNode : parserCore.BasicNode, attributeName: string) {
        var highLevelNode = wrapperNode.highLevel();
        if (highLevelNode == null) return null;

        var property = highLevelNode.definition().property(attributeName);
        if (property == null) return null;

        return this.getAttributeDefault(highLevelNode, property);
    }

    /**
     * Returns attribute default.
     * There are so many arguments instead of just providing a single AST node and getting
     * anything we want from it as sometimes we create fake nodes in helpers and thus
     * do not have actual high-level nodes at hands.
     */
    getAttributeDefault2(attributeProperty: hl.IProperty, node : hl.IHighLevelNode) : any {

        for(var i = 0 ; i < this.valueCalculators.length; i++){

            var calculator = this.valueCalculators[i];
            if(calculator.matches(attributeProperty,node)){
                var value = calculator.calculate(attributeProperty,node);
                if(value != null){
                    return value;
                }
            }
        }

        //static values defined in definition system via defaultValue, defaultIntegerValue
        // and defaultBooleanValue annotations.
        if (attributeProperty.defaultValue() != null) {
            return attributeProperty.defaultValue();
        }
        return null;
    }

    isEnabled() : boolean {
        return this.enabled;
    }

    insertionKind(node : hl.IHighLevelNode, attributeProperty : hl.IProperty):InsertionKind{

        for(var i = 0 ; i < this.valueCalculators.length; i++){
            var calculator = this.valueCalculators[i];
            if(calculator.matches(attributeProperty,node)){
                return calculator.kind();
            }
        }

        if(attributeProperty.defaultValue() != null){
            return InsertionKind.BY_DEFAULT;
        }
        return null;
    }
}

export enum InsertionKind{

    CALCULATED, BY_DEFAULT

}

export interface ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node:hl.IHighLevelNode):any;

    matches(attributeProperty: hl.IProperty, node:hl.IHighLevelNode):boolean;

    kind():InsertionKind;

}

class MediaTypeCalculator implements ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):any {
        var root = search.declRoot(node);
        if(root && universeHelpers.isApiSibling(root.definition())){
            var defaultMediaTypeAttr = root.attr(universes.Universe10.Api.properties.mediaType.name);
            if(defaultMediaTypeAttr){
                return defaultMediaTypeAttr.value();
            }
        }
        return null;
    }

    matches(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):boolean{

        if(!universeHelpers.isNameProperty(attributeProperty)){
            return false;
        }

        var nodeDefinition = node.definition();
        if(!nodeDefinition){
            return false;
        }
        if(!(universeHelpers.isBodyLikeType(nodeDefinition)
            || universeHelpers.isTypeDeclarationSibling(nodeDefinition))){
            return false;
        }

        var parentNode = node.parent();
        if(parentNode==null){
            return false;
        }

        var parentDefinition = parentNode.definition();
        if(parentDefinition==null){
            return false;
        }
        if(!(universeHelpers.isResponseType(parentDefinition)
            || universeHelpers.isMethodBaseSibling(parentDefinition))){
            return false;
        }

        var ancestor = parentNode;
        while(ancestor){
            var aDef = ancestor.definition();
            if(universeHelpers.isTraitType(aDef)){
                return false;
            }
            if(universeHelpers.isResourceTypeType(aDef)){
                return false;
            }
            ancestor = ancestor.parent();
        }
        return true;
    }

    kind():InsertionKind{
        return InsertionKind.CALCULATED;
    }
}

class DisplayNamePropertyCalculator implements ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):any {
        var nodeDefinition = node.definition();
        if(nodeDefinition==null){
            return null;
        }
        var adapter = nodeDefinition.getAdapter(services.RAMLService);
        var keyProperty = adapter.getKeyProp();

        if (keyProperty != null) {
            var attributeValue = node.attrValue(keyProperty.nameId());
            if (attributeValue != null) {
               return attributeValue;
            }
            else{
                return new AttributeDefaultsCalculator(true).getAttributeDefault(node,keyProperty);
            }
        }
        return null;
    }

    matches(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):boolean{
        var nodeDefinition = node.definition();
        if(nodeDefinition==null){
            return false;
        }
        return (universeHelpers.isTypeDeclarationSibling(nodeDefinition)
                ||nodeDefinition.isAssignableFrom(universes.Universe08.Parameter.name)
                ||universeHelpers.isResourceType(nodeDefinition))
            &&universeHelpers.isDisplayNameProperty(attributeProperty);
    }

    kind():InsertionKind{
        return InsertionKind.CALCULATED;
    }
}

class TypePropertyCalculator implements ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):any {
        return "object";
    }

    matches(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):boolean{
        return universeHelpers.isTypeProperty(attributeProperty)
            && node.definition() != null
            && universeHelpers.isObjectTypeDeclarationSibling(node.definition());
    }

    kind():InsertionKind{
        return InsertionKind.BY_DEFAULT;
    }
}

class RequiredPropertyCalculator implements ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):any {

        var nodeDefinition:hl.ITypeDefinition = node.definition();
        var nodeProperty:hl.IProperty = node.property();

        if (nodeDefinition == null) {
            return null;
        }

        //if node key is ending with question mark, it optional, thus its "required" == false
        var adapter = nodeDefinition.getAdapter(services.RAMLService);
        var keyProperty = adapter.getKeyProp();

        if (keyProperty != null) {
            var attribute = node.attr(keyProperty.nameId());
            if (attribute != null && attribute.optional()) {
                return false;
            }
        }

        if (nodeProperty != null) {
            //the spec is unclear with regard to this parameter, but for now it looks like:
            //for query string parameters, form parameters, and request and response headers the default is false
            //for URI parameters the default is true
            //for base URI parameters - unclear, but according to old JS parser behavior it looks like the default is true
            //for all other entities we back drop to what definition system states
            if (universeHelpers.isHeadersProperty(nodeProperty) ||
                universeHelpers.isFormParametersProperty(nodeProperty) ||
                universeHelpers.isQueryParametersProperty(nodeProperty)
            ) {
                if (attributeProperty.domain().universe().version()=="RAML08"){
                    return false
                }
                return true;
            } else if (universeHelpers.isUriParametersProperty(nodeProperty) ||
                universeHelpers.isBaseUriParametersProperty(nodeProperty)) {
                return true;
            }
        }


        if (attributeProperty.defaultValue() != null) {
            return attributeProperty.defaultValue();
        }

        return null;
    }

    matches(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):boolean{
        return universeHelpers.isRequiredProperty(attributeProperty);
    }

    kind():InsertionKind{
        return InsertionKind.BY_DEFAULT;
    }

}

class SecuredByPropertyCalculator implements ValueCalculator{

    constructor(private toHighLevel = false){}

    calculate(attributeProperty: def.IProperty, node : hl.IHighLevelNode):any {

        if(universeHelpers.isApiSibling(node.definition())){
            return null;
        }
        var values:any[];

        //instanceof, but have to avoid direct usage of instanceof in JS.
        var definition = node.definition();
        if (universeHelpers.isMethodType(definition)) {
            var resource = node.parent();
            if (resource) {
                let resourceSlave = resource.getLastSlaveCounterPart();
                if (resourceSlave) resource = resourceSlave;

                values = this.toHighLevel
                    ? resource.attributes("securedBy")
                    : (<any>resource.wrapperNode()).securedBy();
            }
        }
        if(!values || values.length == 0) {
            while (node != null && !universeHelpers.isApiSibling(node.definition())) {
                node = node.parent();
            }
            if(node){
                let nodeSlave = node.getLastSlaveCounterPart();
                if (nodeSlave) node = nodeSlave;

                values = this.toHighLevel
                    ? node.attributes("securedBy")
                    : (<any>node.wrapperNode()).securedBy();
            }
        }
        if(values && values.length>0){
            return values;
        }
        return null;
    }

    matches(attributeProperty: def.IProperty, node : hl.IHighLevelNode):boolean{
        var nodeDefinition = node.definition();
        if(nodeDefinition==null){
            return false;
        }
        return universeHelpers.isSecuredByProperty(attributeProperty);
    }

    kind():InsertionKind{
        return InsertionKind.CALCULATED;
    }
}

class ProtocolsPropertyCalculator implements ValueCalculator{

    calculate(attributeProperty: def.IProperty, node : hl.IHighLevelNode):any {

        while (node != null && !universeHelpers.isApiSibling(node.definition())) {
            node = node.parent();
        }
        var result:string[];
        var baseUriAttr = node.attr(universes.Universe10.Api.properties.baseUri.name);
        if(baseUriAttr) {
            var baseUri = baseUriAttr.value();
            if (baseUri) {
                var ind = baseUri.indexOf('://');
                if (ind >= 0) {
                    result = [baseUri.substring(0, ind).toUpperCase()];
                }
                if(!result){
                    result = [ 'HTTP' ];
                }
            }
        }
        return result;
    }

    matches(attributeProperty: def.IProperty, node : hl.IHighLevelNode):boolean{

        if(!universeHelpers.isProtocolsProperty(attributeProperty)){
            return false;
        }

        var nodeDefinition = node.definition();
        var hasAppropriateLocation = false;
        if(universeHelpers.isApiSibling(nodeDefinition)){
            hasAppropriateLocation = true;
        }
        else if(universeHelpers.isResourceType(nodeDefinition)){
            hasAppropriateLocation = true;
        }
        else if(universeHelpers.isMethodType(nodeDefinition)){
            var parentNode = node.parent();
            hasAppropriateLocation = parentNode && universeHelpers.isResourceType(parentNode.definition());
        }
        return hasAppropriateLocation;
    }

    kind():InsertionKind{
        return InsertionKind.CALCULATED;
    }
}

class VersionParamEnumCalculator implements ValueCalculator{

    calculate(attributeProperty: def.IProperty, node : hl.IHighLevelNode):any {

        while (node != null && !universeHelpers.isApiSibling(node.definition())) {
            node = node.parent();
        }
        var versionAttr = node.attr(universes.Universe10.Api.properties.version.name);
        if(versionAttr) {
            var versionValue = versionAttr.value();
            if(versionValue && versionValue.trim()) {
                return [versionValue];
            }
        }
        return null;
    }

    matches(attributeProperty: def.IProperty, node : hl.IHighLevelNode):boolean{

        if(!universeHelpers.isEnumProperty(attributeProperty)){
            return false;
        }
        var nodeProperty = node.property();
        if(!nodeProperty){
            return false;
        }
        if(!universeHelpers.isBaseUriParametersProperty(nodeProperty)){
            return false;
        }

        var nameAttr = node.attr(universes.Universe10.TypeDeclaration.properties.name.name);
        var paramName = nameAttr && nameAttr.value();
        if(paramName != 'version'){
            return false;
        }

        return true;
    }

    kind():InsertionKind{
        return InsertionKind.CALCULATED;
    }
}

/**
 * This calculator inserts "required=false" if the key property ends with question mark.
 * All other cases are handled in the regular RequiredPropertyCalculator
 */
class UnconditionalRequiredPropertyCalculator implements ValueCalculator{

    calculate(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):any {

        var nodeDefinition:hl.ITypeDefinition = node.definition();

        if (nodeDefinition == null) return null;

        //if node key is ending with question mark, it optional, thus its "required" == false
        var adapter = nodeDefinition.getAdapter(services.RAMLService);
        if (adapter == null) return null;

        var keyProperty = adapter.getKeyProp();
        if (keyProperty == null) return null;

        var attribute = node.attr(keyProperty.nameId());
        if (attribute == null) return null;

        if (attribute.optional()) return false;

        return null;
    }

    matches(attributeProperty: hl.IProperty, node : hl.IHighLevelNode):boolean{
        return universeHelpers.isRequiredProperty(attributeProperty);
    }

    kind():InsertionKind{
        return InsertionKind.BY_DEFAULT;
    }

}