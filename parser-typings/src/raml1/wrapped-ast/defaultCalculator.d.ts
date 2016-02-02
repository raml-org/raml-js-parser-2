import hl = require("../highLevelAST");
import typesystem = require("../../raml1/definition-system/typeSystem");
export declare class AttributeDefaultsCalculator {
    private enabled;
    /**
     *
     * @param enabled - if false, defaults calculator will not return defaults from
     * attrValueOrDefault method, only original values.
     * @constructor
     */
    constructor(enabled: boolean);
    /**
     * Return attribute default value if defaults calculator is enabled.
     * If attribute value is null or undefined, returns attribute default.
     */
    attributeDefaultIfEnabled(node: hl.IHighLevelNode, attributeProperty: hl.IProperty): any;
    /**
     * Returns attribute default.
     */
    getAttributeDefault(node: hl.IHighLevelNode, attributeProperty: hl.IProperty): any;
    /**
     * Returns attribute default.
     * There are so many arguments instead of just providing a single AST node and getting
     * anything we want from it as sometimes we create fake nodes in helpers and thus
     * do not have actual high-level nodes at hands.
     */
    getAttributeDefault2(attributeProperty: typesystem.IProperty, node: hl.IHighLevelNode, nodeDefinition: typesystem.ITypeDefinition, nodeProperty: typesystem.IProperty, parent: hl.IHighLevelNode, parentDefinition: typesystem.ITypeDefinition): any;
}
