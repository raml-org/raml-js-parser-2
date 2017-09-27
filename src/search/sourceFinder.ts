import def=require("raml-definition-system")
import ramlTypes=def.rt;
import hl=require("../parser/highLevelAST")
import lowLevel = require("../parser/lowLevelAST")
import universes=require("../parser/tools/universe")
import _=require("underscore")

export interface IHighLevelSourceProvider {
    getSource() : hl.IParseResult
}

export function getExtraProviderSource(extraProvider: def.IHasExtra) : IHighLevelSourceProvider {
    var sourceExtra : any = extraProvider.getExtra(ramlTypes.SOURCE_EXTRA);

    if (sourceExtra == null) return null;

    if (def.isSourceProvider(sourceExtra)) {
        return sourceExtra;
    }

    if (lowLevel.isLowLevelNode(sourceExtra)) {
        return {
            getSource() {
                return sourceExtra.highLevelNode();
            }
        }
    }

    if (hl.isParseResult(sourceExtra)) {
        return {
            getSource() {
                return sourceExtra;
            }
        }
    }

    return null;
}

export function getRTypeSource(
    rType : ramlTypes.IParsedType) : IHighLevelSourceProvider {

    return getExtraProviderSource(rType);
}

export function findRTypeByNominal(nominalType : ramlTypes.nominalInterfaces.ITypeDefinition) : ramlTypes.IParsedType {
    var adapters = nominalType.getAdapters();
    if (!adapters) return null;

    return _.find(adapters, adapter=>{
        return def.rt.isParsedType(adapter);
    })
}

export function getNominalTypeSource(
    nominalType : def.ITypeDefinition) : IHighLevelSourceProvider {

    if (!nominalType) return null;

    var sourceExtra : any = nominalType.getExtra(ramlTypes.SOURCE_EXTRA);
    if (sourceExtra) {
        return getExtraProviderSource(nominalType);
    }

    var rType = findRTypeByNominal(nominalType);
    if (rType) {
        return getRTypeSource(rType);
    }

    return null;
}

export function getNominalPropertySource(type : def.ITypeDefinition, name : string) : IHighLevelSourceProvider {
    var typeSource = getNominalTypeSource(type);
    if (!typeSource) return null;

    return {
        getSource() {
            var typeNode = typeSource.getSource();

            var typeNodeElement = typeNode.asElement();
            if (typeNodeElement == null) return null;

            var propertyElements : hl.IHighLevelNode[] =
                typeNodeElement.elementsOfKind(
                    universes.Universe10.ObjectTypeDeclaration.properties.properties.name);

            if (propertyElements == null || propertyElements.length == 0) return null;

            return _.find(propertyElements, propertyElement => {
                return name == propertyElement.attrValue(universes.Universe10.TypeDeclaration.properties.name.name);
            })
        }
    }

}

export function getNominalPropertySource2(property : def.IProperty) : IHighLevelSourceProvider {

    return getNominalPropertySource(property.domain(), property.nameId());
}

