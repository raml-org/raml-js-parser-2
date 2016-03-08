/**
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
import hl = require("../highLevelAST");
import hlImpl = require("../highLevelImpl");
import typeSystem = require("../definition-system/typeSystem");
import core = require("../wrapped-ast/parserCore");
export interface RAMLLanguageElement extends core.BasicNode {
    /**
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     **/
    displayName(): string;
    /**
     * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown [MARKDOWN]
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
}
export declare class RAMLLanguageElementImpl extends core.BasicNodeImpl implements RAMLLanguageElement {
    /**
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): RAMLLanguageElementImpl;
    /**
     * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown [MARKDOWN]
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ValueType extends core.AttributeNode {
    /**
     * @return JS representation of the node value
     **/
    value(): any;
}
export declare class ValueTypeImpl extends core.AttributeNodeImpl implements ValueType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * @return JS representation of the node value
     **/
    value(): any;
}
export interface AnyType extends ValueType {
}
export declare class AnyTypeImpl extends ValueTypeImpl implements AnyType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface NumberType extends ValueType {
    /**
     * @return Number representation of the node value
     **/
    value(): number;
}
export declare class NumberTypeImpl extends ValueTypeImpl implements NumberType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * @return Number representation of the node value
     **/
    value(): number;
}
export interface BooleanType extends ValueType {
    /**
     * @return Boolean representation of the node value
     **/
    value(): boolean;
}
export declare class BooleanTypeImpl extends ValueTypeImpl implements BooleanType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * @return Boolean representation of the node value
     **/
    value(): boolean;
}
export interface Reference extends core.AttributeNode {
    /**
     * Returns a structured object if the reference point to one.
     **/
    structuredValue(): TypeInstance;
    /**
     * Returns name of referenced object
     **/
    name(): string;
    /**
     * @return StructuredValue object representing the node value
     **/
    value(): hlImpl.StructuredValue;
}
export declare class ReferenceImpl extends core.AttributeNodeImpl implements Reference {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * @return StructuredValue object representing the node value
     **/
    value(): hlImpl.StructuredValue;
    structuredValue(): TypeInstance;
    name(): string;
}
export interface TypeInstance {
    /**
     * Array of instance properties
     **/
    properties(): TypeInstanceProperty[];
    /**
     * Whether the type is scalar
     **/
    isScalar(): boolean;
    /**
     * For instances of scalar types returns scalar value
     **/
    value(): any;
}
export interface TypeInstanceProperty {
    /**
     * Property name
     **/
    name(): string;
    /**
     * Property value
     **/
    value(): TypeInstance;
    /**
     * Array of values if property value is array
     **/
    values(): TypeInstance[];
    /**
     * Whether property has array as value
     **/
    isArray(): boolean;
}
/**
 * Annotations allow you to attach information to your API
 **/
export interface AnnotationRef extends Reference {
    /**
     * Returns referenced annotation
     **/
    annotation(): AnnotationTypeDeclaration;
}
/**
 * Annotations allow you to attach information to your API
 **/
export declare class AnnotationRefImpl extends ReferenceImpl implements AnnotationRef {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    annotation(): AnnotationTypeDeclaration;
}
export interface TypeDeclaration extends RAMLLanguageElement {
    /**
     * name of the parameter
     **/
    name(): string;
    /**
     * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
     **/
    facets(): TypeDeclaration[];
    /**
     * Alias for the equivalent "type" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "type" property, as the "schema" alias for that property name may be removed in a future RAML version. The "type" property allows for XML and JSON schemas.
     **/
    schema(): string;
    /**
     * A base type which the current type extends, or more generally a type expression.
     **/
    "type"(): string[];
    /**
     * Location of the parameter (can not be edited by user)
     **/
    location(): ModelLocation;
    /**
     * Kind of location
     **/
    locationKind(): LocationKind;
    /**
     * Provides default value for a property
     **/
    "default"(): any;
    /**
     * An object containing named examples of instances of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     **/
    examples(): ExampleSpec[];
    /**
     * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
     **/
    repeat(): boolean;
    /**
     * Sets if property is optional or not
     **/
    required(): boolean;
    /**
     * An alternate, human-friendly name for the type
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the type
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * Returns facets fixed by the type. Value is an object with properties named after facets fixed. Value of each property is a value of the corresponding facet.
     **/
    fixedFacets(): TypeInstance;
    /**
     * Returns schema content for the cases when schema is inlined, when schema is included, and when schema is a reference.
     **/
    schemaContent(): string;
    /**
     * Returns object representation of example, if possible
     **/
    structuredExample(): TypeInstance;
    /**
     * Runtime representation of type represented by this AST node
     **/
    runtimeType(): typeSystem.ITypeDefinition;
    /**
     * validate an instance against type
     **/
    validateInstance(value: any): string[];
    /**
     * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     **/
    example(): string;
}
export declare class TypeDeclarationImpl extends RAMLLanguageElementImpl implements TypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * name of the parameter
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): TypeDeclarationImpl;
    /**
     * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
     **/
    facets(): TypeDeclaration[];
    /**
     * Alias for the equivalent "type" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "type" property, as the "schema" alias for that property name may be removed in a future RAML version. The "type" property allows for XML and JSON schemas.
     **/
    schema(): string;
    /**
     * @hidden
     * Set schema value
     **/
    setSchema(param: string): TypeDeclarationImpl;
    /**
     * A base type which the current type extends, or more generally a type expression.
     **/
    "type"(): string[];
    /**
     * @hidden
     * Set type value
     **/
    setType(param: string): TypeDeclarationImpl;
    /**
     * Location of the parameter (can not be edited by user)
     **/
    location(): ModelLocation;
    /**
     * Kind of location
     **/
    locationKind(): LocationKind;
    /**
     * Provides default value for a property
     **/
    "default"(): any;
    /**
     * @hidden
     * Set default value
     **/
    setDefault(param: any): TypeDeclarationImpl;
    /**
     * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     * @hidden
     **/
    example_original(): string;
    /**
     * @hidden
     * Set example value
     **/
    setExample(param: string): TypeDeclarationImpl;
    /**
     * An object containing named examples of instances of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     **/
    examples(): ExampleSpec[];
    /**
     * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
     **/
    repeat(): boolean;
    /**
     * @hidden
     * Set repeat value
     **/
    setRepeat(param: boolean): TypeDeclarationImpl;
    /**
     * Sets if property is optional or not
     **/
    required(): boolean;
    /**
     * @hidden
     * Set required value
     **/
    setRequired(param: boolean): TypeDeclarationImpl;
    /**
     * An alternate, human-friendly name for the type
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): TypeDeclarationImpl;
    /**
     * A longer, human-friendly description of the type
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * Runtime representation of type represented by this AST node
     **/
    runtimeType(): typeSystem.ITypeDefinition;
    /**
     * validate an instance against type
     **/
    validateInstance(value: any): string[];
    /**
     * An example of this type instance represented as string. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     * @hidden
     **/
    example(): string;
    structuredExample(): TypeInstance;
    fixedFacets(): TypeInstance;
    schemaContent(): string;
}
export interface ModelLocation extends core.AbstractWrapperNode {
}
export declare class ModelLocationImpl implements ModelLocation {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface LocationKind extends core.AbstractWrapperNode {
}
export declare class LocationKindImpl implements LocationKind {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ExampleSpec extends RAMLLanguageElement {
    /**
     * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
     **/
    strict(): boolean;
    /**
     * Example identifier, if specified
     **/
    name(): string;
    /**
     * An alternate, human-friendly name for the example
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the example
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * Returns object representation of example, if possible
     **/
    structuredContent(): TypeInstance;
    /**
     * String representation of example
     **/
    content(): string;
}
export declare class ExampleSpecImpl extends RAMLLanguageElementImpl implements ExampleSpec {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * String representation of example
     * @hidden
     **/
    content_original(): string;
    /**
     * @hidden
     * Set content value
     **/
    setContent(param: string): ExampleSpecImpl;
    /**
     * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
     **/
    strict(): boolean;
    /**
     * @hidden
     * Set strict value
     **/
    setStrict(param: boolean): ExampleSpecImpl;
    /**
     * Example identifier, if specified
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): ExampleSpecImpl;
    /**
     * An alternate, human-friendly name for the example
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): ExampleSpecImpl;
    /**
     * A longer, human-friendly description of the example
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * String representation of example
     * @hidden
     **/
    content(): string;
    structuredContent(): TypeInstance;
}
export interface ArrayTypeDeclaration extends TypeDeclaration {
    /**
     * Should items in array be unique
     **/
    uniqueItems(): boolean;
    /**
     * Array component type.
     **/
    items(): TypeDeclaration;
    /**
     * Minimum amount of items in array
     **/
    minItems(): number;
    /**
     * Maximum amount of items in array
     **/
    maxItems(): number;
}
export declare class ArrayTypeDeclarationImpl extends TypeDeclarationImpl implements ArrayTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Should items in array be unique
     **/
    uniqueItems(): boolean;
    /**
     * @hidden
     * Set uniqueItems value
     **/
    setUniqueItems(param: boolean): ArrayTypeDeclarationImpl;
    /**
     * Array component type.
     **/
    items(): TypeDeclaration;
    /**
     * Minimum amount of items in array
     **/
    minItems(): number;
    /**
     * @hidden
     * Set minItems value
     **/
    setMinItems(param: number): ArrayTypeDeclarationImpl;
    /**
     * Maximum amount of items in array
     **/
    maxItems(): number;
    /**
     * @hidden
     * Set maxItems value
     **/
    setMaxItems(param: number): ArrayTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface AnnotationTypeDeclaration extends TypeDeclaration {
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
}
export interface ArrayAnnotationTypeDeclaration extends ArrayTypeDeclaration, AnnotationTypeDeclaration {
}
export declare class ArrayAnnotationTypeDeclarationImpl extends ArrayTypeDeclarationImpl implements ArrayAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): ArrayAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): ArrayAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Elements to which this Annotation can be applied (enum)
 **/
export interface AnnotationTarget extends ValueType {
}
/**
 * Elements to which this Annotation can be applied (enum)
 **/
export declare class AnnotationTargetImpl extends ValueTypeImpl implements AnnotationTarget {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface UnionTypeDeclaration extends TypeDeclaration {
    /**
     * Type property name to be used as a discriminator or boolean
     **/
    discriminator(): string;
}
export declare class UnionTypeDeclarationImpl extends TypeDeclarationImpl implements UnionTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Type property name to be used as a discriminator or boolean
     **/
    discriminator(): string;
    /**
     * @hidden
     * Set discriminator value
     **/
    setDiscriminator(param: string): UnionTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface UnionAnnotationTypeDeclaration extends UnionTypeDeclaration, AnnotationTypeDeclaration {
}
export declare class UnionAnnotationTypeDeclarationImpl extends UnionTypeDeclarationImpl implements UnionAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): UnionAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): UnionAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ObjectTypeDeclaration extends TypeDeclaration {
    /**
     * The properties that instances of this type may or must have.
     **/
    properties(): TypeDeclaration[];
    /**
     * The minimum number of properties allowed for instances of this type.
     **/
    minProperties(): number;
    /**
     * The maximum number of properties allowed for instances of this type.
     **/
    maxProperties(): number;
    /**
     * JSON schema style syntax for declaring maps
     **/
    additionalProperties(): TypeDeclaration;
    /**
     * JSON schema style syntax for declaring key restricted maps
     **/
    patternProperties(): TypeDeclaration[];
    /**
     * Type property name to be used as discriminator, or boolean
     **/
    discriminator(): string;
    /**
     * The value of discriminator for the type.
     **/
    discriminatorValue(): string;
}
export declare class ObjectTypeDeclarationImpl extends TypeDeclarationImpl implements ObjectTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * The properties that instances of this type may or must have.
     **/
    properties(): TypeDeclaration[];
    /**
     * The minimum number of properties allowed for instances of this type.
     **/
    minProperties(): number;
    /**
     * @hidden
     * Set minProperties value
     **/
    setMinProperties(param: number): ObjectTypeDeclarationImpl;
    /**
     * The maximum number of properties allowed for instances of this type.
     **/
    maxProperties(): number;
    /**
     * @hidden
     * Set maxProperties value
     **/
    setMaxProperties(param: number): ObjectTypeDeclarationImpl;
    /**
     * JSON schema style syntax for declaring maps
     **/
    additionalProperties(): TypeDeclaration;
    /**
     * JSON schema style syntax for declaring key restricted maps
     **/
    patternProperties(): TypeDeclaration[];
    /**
     * Type property name to be used as discriminator, or boolean
     **/
    discriminator(): string;
    /**
     * @hidden
     * Set discriminator value
     **/
    setDiscriminator(param: string): ObjectTypeDeclarationImpl;
    /**
     * The value of discriminator for the type.
     **/
    discriminatorValue(): string;
    /**
     * @hidden
     * Set discriminatorValue value
     **/
    setDiscriminatorValue(param: string): ObjectTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ObjectAnnotationTypeDeclaration extends ObjectTypeDeclaration, AnnotationTypeDeclaration {
}
export declare class ObjectAnnotationTypeDeclarationImpl extends ObjectTypeDeclarationImpl implements ObjectAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): ObjectAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): ObjectAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value must be a string
 **/
export interface StringTypeDeclaration extends TypeDeclaration {
    /**
     * Regular expression that this string should path
     **/
    pattern(): string;
    /**
     * Minimum length of the string
     **/
    minLength(): number;
    /**
     * Maximum length of the string
     **/
    maxLength(): number;
    /**
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     **/
    enum(): string[];
}
/**
 * Value must be a string
 **/
export declare class StringTypeDeclarationImpl extends TypeDeclarationImpl implements StringTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Regular expression that this string should path
     **/
    pattern(): string;
    /**
     * @hidden
     * Set pattern value
     **/
    setPattern(param: string): StringTypeDeclarationImpl;
    /**
     * Minimum length of the string
     **/
    minLength(): number;
    /**
     * @hidden
     * Set minLength value
     **/
    setMinLength(param: number): StringTypeDeclarationImpl;
    /**
     * Maximum length of the string
     **/
    maxLength(): number;
    /**
     * @hidden
     * Set maxLength value
     **/
    setMaxLength(param: number): StringTypeDeclarationImpl;
    /**
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     **/
    enum(): string[];
    /**
     * @hidden
     * Set enum value
     **/
    setEnum(param: string): StringTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value must be a boolean
 **/
export interface ValueTypeDeclaration extends TypeDeclaration {
}
/**
 * Value must be a boolean
 **/
export declare class ValueTypeDeclarationImpl extends TypeDeclarationImpl implements ValueTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ValueAnnotationTypeDeclaration extends ValueTypeDeclaration, AnnotationTypeDeclaration {
}
export declare class ValueAnnotationTypeDeclarationImpl extends ValueTypeDeclarationImpl implements ValueAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): ValueAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): ValueAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value must be a boolean
 **/
export interface BooleanTypeDeclaration extends TypeDeclaration {
}
/**
 * Value must be a boolean
 **/
export declare class BooleanTypeDeclarationImpl extends TypeDeclarationImpl implements BooleanTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface BooleanAnnotationTypeDeclaration extends BooleanTypeDeclaration, ValueAnnotationTypeDeclaration {
}
export declare class BooleanAnnotationTypeDeclarationImpl extends BooleanTypeDeclarationImpl implements BooleanAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): BooleanAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): BooleanAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export interface NumberTypeDeclaration extends TypeDeclaration {
    /**
     * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
     **/
    minimum(): number;
    /**
     * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
     **/
    maximum(): number;
    /**
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     **/
    enum(): string[];
    /**
     * Value format
     **/
    format(): string;
    /**
     * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
     **/
    multipleOf(): number;
}
/**
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 **/
export declare class NumberTypeDeclarationImpl extends TypeDeclarationImpl implements NumberTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
     **/
    minimum(): number;
    /**
     * @hidden
     * Set minimum value
     **/
    setMinimum(param: number): NumberTypeDeclarationImpl;
    /**
     * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
     **/
    maximum(): number;
    /**
     * @hidden
     * Set maximum value
     **/
    setMaximum(param: number): NumberTypeDeclarationImpl;
    /**
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     **/
    enum(): string[];
    /**
     * @hidden
     * Set enum value
     **/
    setEnum(param: string): NumberTypeDeclarationImpl;
    /**
     * Value format
     **/
    format(): string;
    /**
     * @hidden
     * Set format value
     **/
    setFormat(param: string): NumberTypeDeclarationImpl;
    /**
     * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
     **/
    multipleOf(): number;
    /**
     * @hidden
     * Set multipleOf value
     **/
    setMultipleOf(param: number): NumberTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value MUST be a integer.
 **/
export interface IntegerTypeDeclaration extends NumberTypeDeclaration {
    /**
     * Value format
     **/
    format(): string;
}
/**
 * Value MUST be a integer.
 **/
export declare class IntegerTypeDeclarationImpl extends NumberTypeDeclarationImpl implements IntegerTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Value format
     **/
    format(): string;
    /**
     * @hidden
     * Set format value
     **/
    setFormat(param: string): IntegerTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface NumberAnnotationTypeDeclaration extends NumberTypeDeclaration, ValueAnnotationTypeDeclaration {
}
export declare class NumberAnnotationTypeDeclarationImpl extends NumberTypeDeclarationImpl implements NumberAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): NumberAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): NumberAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface StringAnnotationTypeDeclaration extends StringTypeDeclaration, ValueAnnotationTypeDeclaration {
}
export declare class StringAnnotationTypeDeclarationImpl extends StringTypeDeclarationImpl implements StringAnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): StringAnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): StringAnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface RAMLExpression extends TypeDeclaration {
}
export declare class RAMLExpressionImpl extends TypeDeclarationImpl implements RAMLExpression {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface RAMLExpressionAnnotation extends RAMLExpression, AnnotationTypeDeclaration {
}
export declare class RAMLExpressionAnnotationImpl extends RAMLExpressionImpl implements RAMLExpressionAnnotation {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): RAMLExpressionAnnotationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): RAMLExpressionAnnotationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface SchemaElement extends TypeDeclaration {
}
export declare class SchemaElementImpl extends TypeDeclarationImpl implements SchemaElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3 [RFC2616]. or according to specified date format
 **/
export interface DateTypeDeclaration extends TypeDeclaration {
    dateFormat(): DateFormatSpec;
}
/**
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3 [RFC2616]. or according to specified date format
 **/
export declare class DateTypeDeclarationImpl extends TypeDeclarationImpl implements DateTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    dateFormat(): DateFormatSpec;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface StringType extends ValueType {
    /**
     * @return String representation of the node value
     **/
    value(): string;
}
export interface DateFormatSpec extends StringType {
}
export declare class StringTypeImpl extends ValueTypeImpl implements StringType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * @return String representation of the node value
     **/
    value(): string;
}
export declare class DateFormatSpecImpl extends StringTypeImpl implements DateFormatSpec {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface DateTypeAnnotationDeclaration extends DateTypeDeclaration, AnnotationTypeDeclaration {
}
export declare class DateTypeAnnotationDeclarationImpl extends DateTypeDeclarationImpl implements DateTypeAnnotationDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): DateTypeAnnotationDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): DateTypeAnnotationDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export interface FileTypeDeclaration extends TypeDeclaration {
    /**
     * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
     **/
    fileTypes(): ContentType[];
    /**
     * The minLength attribute specifies the parameter value's minimum number of bytes.
     **/
    minLength(): number;
    /**
     * The maxLength attribute specifies the parameter value's maximum number of bytes.
     **/
    maxLength(): number;
}
/**
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 **/
export declare class FileTypeDeclarationImpl extends TypeDeclarationImpl implements FileTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
     **/
    fileTypes(): ContentType[];
    /**
     * The minLength attribute specifies the parameter value's minimum number of bytes.
     **/
    minLength(): number;
    /**
     * @hidden
     * Set minLength value
     **/
    setMinLength(param: number): FileTypeDeclarationImpl;
    /**
     * The maxLength attribute specifies the parameter value's maximum number of bytes.
     **/
    maxLength(): number;
    /**
     * @hidden
     * Set maxLength value
     **/
    setMaxLength(param: number): FileTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ContentType extends StringType {
}
export declare class ContentTypeImpl extends StringTypeImpl implements ContentType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export declare class AnnotationTypeDeclarationImpl extends TypeDeclarationImpl implements AnnotationTypeDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     **/
    allowMultiple(): boolean;
    /**
     * @hidden
     * Set allowMultiple value
     **/
    setAllowMultiple(param: boolean): AnnotationTypeDeclarationImpl;
    /**
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     * Instructions on how and when to use this annotation in a RAML spec.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): AnnotationTypeDeclarationImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ResourceTypeRef extends Reference {
    /**
     * Returns referenced resource type
     **/
    resourceType(): ResourceType;
}
export declare class ResourceTypeRefImpl extends ReferenceImpl implements ResourceTypeRef {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    resourceType(): ResourceType;
}
export interface ResourceBase extends RAMLLanguageElement {
    /**
     * Methods that are part of this resource type definition
     **/
    methods(): Method[];
    /**
     * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section. Individual methods may override this declaration
     **/
    is(): TraitRef[];
    /**
     * The resource type which this resource inherits. . See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     **/
    "type"(): ResourceTypeRef;
    /**
     * Detailed information about any URI parameters of this resource
     **/
    uriParameters(): TypeDeclaration[];
    /**
     * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
     * Consider a fragment of RAML specification:
     * ```yaml
     * /resource/{objectId}/{propertyId}:
     * uriParameters:
     * objectId:
     * ```
     * Here `propertyId` uri parameter is not described in the `uriParameters` node,
     * but it is among Resource.allUriParameters().
     * @deprecated
     **/
    allUriParameters(): TypeDeclaration[];
    /**
     * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
     * returns schemes defined with `securedBy` at API level.
     * @deprecated
     **/
    allSecuredBy(): SecuritySchemeRef[];
}
export declare class ResourceBaseImpl extends RAMLLanguageElementImpl implements ResourceBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Methods that are part of this resource type definition
     **/
    methods(): Method[];
    /**
     * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section. Individual methods may override this declaration
     **/
    is(): TraitRef[];
    /**
     * The resource type which this resource inherits. . See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     **/
    "type"(): ResourceTypeRef;
    /**
     * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
     * @hidden
     **/
    securedBy_original(): SecuritySchemeRef[];
    /**
     * Detailed information about any URI parameters of this resource
     * @hidden
     **/
    uriParameters_original(): TypeDeclaration[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * Detailed information about any URI parameters of this resource
     * @hidden
     **/
    uriParameters(): TypeDeclaration[];
    /**
     * Retrieve an ordered list of all uri parameters including those which are not described in the `uriParameters` node.
     * Consider a fragment of RAML specification:
     * ```yaml
     * /resource/{objectId}/{propertyId}:
     * uriParameters:
     * objectId:
     * ```
     * Here `propertyId` uri parameter is not described in the `uriParameters` node,
     * but it is among Resource.allUriParameters().
     * @deprecated
     **/
    allUriParameters(): TypeDeclaration[];
    /**
     * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
     * @hidden
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
     * returns schemes defined with `securedBy` at API level.
     * @deprecated
     **/
    allSecuredBy(): SecuritySchemeRef[];
}
export interface HasNormalParameters extends RAMLLanguageElement {
    /**
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Headers that allowed at this position
     **/
    headers(): TypeDeclaration[];
    /**
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
}
export declare class HasNormalParametersImpl extends RAMLLanguageElementImpl implements HasNormalParameters {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Headers that allowed at this position
     **/
    headers(): TypeDeclaration[];
    /**
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface MethodBase extends HasNormalParameters {
    /**
     * Information about the expected responses to a request
     **/
    responses(): Response[];
    /**
     * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create.
     * Resources CAN have alternate representations. For example, an API might support both JSON and XML representations.
     * A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
     **/
    body(): TypeDeclaration[];
    /**
     * A method can override the protocols specified in the resource or at the API root, by employing this property.
     **/
    protocols(): string[];
    /**
     * Instantiation of applyed traits
     **/
    is(): TraitRef[];
    /**
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     **/
    securedBy(): SecuritySchemeRef[];
}
export declare class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Information about the expected responses to a request
     **/
    responses(): Response[];
    /**
     * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create.
     * Resources CAN have alternate representations. For example, an API might support both JSON and XML representations.
     * A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
     **/
    body(): TypeDeclaration[];
    /**
     * A method can override the protocols specified in the resource or at the API root, by employing this property.
     **/
    protocols(): string[];
    /**
     * @hidden
     * Set protocols value
     **/
    setProtocols(param: string): MethodBaseImpl;
    /**
     * Instantiation of applyed traits
     **/
    is(): TraitRef[];
    /**
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface Response extends RAMLLanguageElement {
    /**
     * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
     **/
    code(): StatusCodeString;
    /**
     * Detailed information about any response headers returned by this method
     **/
    headers(): TypeDeclaration[];
    /**
     * The body of the response: a body declaration
     **/
    body(): TypeDeclaration[];
    /**
     * An alternate, human-friendly name for the response
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the response
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * true for codes < 400 and false otherwise
     **/
    isOkRange(): boolean;
}
export declare class ResponseImpl extends RAMLLanguageElementImpl implements Response {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
     **/
    code(): StatusCodeString;
    /**
     * Detailed information about any response headers returned by this method
     **/
    headers(): TypeDeclaration[];
    /**
     * The body of the response: a body declaration
     **/
    body(): TypeDeclaration[];
    /**
     * An alternate, human-friendly name for the response
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): ResponseImpl;
    /**
     * A longer, human-friendly description of the response
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * true for codes < 400 and false otherwise
     **/
    isOkRange(): boolean;
}
export interface StatusCodeString extends StringType {
}
export declare class StatusCodeStringImpl extends StringTypeImpl implements StatusCodeString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface TraitRef extends Reference {
    /**
     * Returns referenced trait
     **/
    trait(): Trait;
}
export declare class TraitRefImpl extends ReferenceImpl implements TraitRef {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    trait(): Trait;
}
export interface Trait extends MethodBase {
    /**
     * Name of the trait
     **/
    name(): string;
    /**
     * Instructions on how and when the trait should be used.
     **/
    usage(): string;
    /**
     * You may import library locally here it contents is accessible only inside of this trait
     **/
    uses(): Library[];
}
export declare class TraitImpl extends MethodBaseImpl implements Trait {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name of the trait
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): TraitImpl;
    /**
     * Instructions on how and when the trait should be used.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): TraitImpl;
    /**
     * You may import library locally here it contents is accessible only inside of this trait
     **/
    uses(): Library[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface LibraryBase extends RAMLLanguageElement {
    /**
     * Alias for the equivalent "types" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "types" property, as the "schemas" alias for that property name may be removed in a future RAML version. The "types" property allows for XML and JSON schemas.
     **/
    schemas(): GlobalSchema[];
    /**
     * Declarations of (data) types for use within this API
     **/
    types(): TypeDeclaration[];
    /**
     * Declarations of annotation types for use by annotations
     **/
    annotationTypes(): AnnotationTypeDeclaration[];
    /**
     * Declarations of security schemes for use within this API.
     **/
    securitySchemes(): AbstractSecurityScheme[];
    /**
     * Importing libraries
     **/
    uses(): Library[];
    /**
     * Declarations of traits for use within this API
     **/
    traits(): Trait[];
    /**
     * Retrieve all traits including those defined in libraries
     * @deprecated
     **/
    allTraits(): Trait[];
    /**
     * Declarations of resource types for use within this API
     **/
    resourceTypes(): ResourceType[];
    /**
     * Retrieve all resource types including those defined in libraries
     * @deprecated
     **/
    allResourceTypes(): ResourceType[];
}
export interface Library extends LibraryBase {
    /**
     * contains description of why library exist
     **/
    usage(): string;
    /**
     * Namespace which the library is imported under
     **/
    name(): string;
}
export declare class LibraryBaseImpl extends RAMLLanguageElementImpl implements LibraryBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Alias for the equivalent "types" property, for compatibility with RAML 0.8. Deprecated - API definitions should use the "types" property, as the "schemas" alias for that property name may be removed in a future RAML version. The "types" property allows for XML and JSON schemas.
     **/
    schemas(): GlobalSchema[];
    /**
     * Declarations of (data) types for use within this API
     **/
    types(): TypeDeclaration[];
    /**
     * Declarations of traits for use within this API
     * @hidden
     **/
    traits_original(): Trait[];
    /**
     * Declarations of resource types for use within this API
     * @hidden
     **/
    resourceTypes_original(): ResourceType[];
    /**
     * Declarations of annotation types for use by annotations
     **/
    annotationTypes(): AnnotationTypeDeclaration[];
    /**
     * Declarations of security schemes for use within this API.
     **/
    securitySchemes(): AbstractSecurityScheme[];
    /**
     * Importing libraries
     **/
    uses(): Library[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * Declarations of traits for use within this API
     * @hidden
     **/
    traits(): Trait[];
    /**
     * Retrieve all traits including those defined in libraries
     * @deprecated
     **/
    allTraits(): Trait[];
    /**
     * Declarations of resource types for use within this API
     * @hidden
     **/
    resourceTypes(): ResourceType[];
    /**
     * Retrieve all resource types including those defined in libraries
     * @deprecated
     **/
    allResourceTypes(): ResourceType[];
}
export declare class LibraryImpl extends LibraryBaseImpl implements Library {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * contains description of why library exist
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): LibraryImpl;
    /**
     * Namespace which the library is imported under
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): LibraryImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface SecuritySchemeRef extends Reference {
    /**
     * Returns the name of security scheme, this reference refers to.
     **/
    securitySchemeName(): string;
    /**
     * Returns AST node of security scheme, this reference refers to, or null.
     **/
    securityScheme(): AbstractSecurityScheme;
}
export declare class SecuritySchemeRefImpl extends ReferenceImpl implements SecuritySchemeRef {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    securitySchemeName(): string;
    securityScheme(): AbstractSecurityScheme;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface AbstractSecurityScheme extends RAMLLanguageElement {
    /**
     * Name of the security scheme
     **/
    name(): string;
    /**
     * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
     **/
    "type"(): string;
    /**
     * The description MAY be used to describe a securityScheme.
     **/
    description(): MarkdownString;
    /**
     * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes.
     * Including the security scheme description completes an API documentation.
     **/
    describedBy(): SecuritySchemePart;
    /**
     * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
     **/
    settings(): SecuritySchemeSettings;
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class AbstractSecuritySchemeImpl extends RAMLLanguageElementImpl implements AbstractSecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name of the security scheme
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): AbstractSecuritySchemeImpl;
    /**
     * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
     **/
    "type"(): string;
    /**
     * @hidden
     * Set type value
     **/
    setType(param: string): AbstractSecuritySchemeImpl;
    /**
     * The description MAY be used to describe a securityScheme.
     **/
    description(): MarkdownString;
    /**
     * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes.
     * Including the security scheme description completes an API documentation.
     **/
    describedBy(): SecuritySchemePart;
    /**
     * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
     **/
    settings(): SecuritySchemeSettings;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface SecuritySchemePart extends MethodBase {
    /**
     * Headers that allowed at this position
     **/
    headers(): TypeDeclaration[];
    /**
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Specifies the query string, used by the scheme in order to authorize the request. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
    /**
     * Optional array of responses, describing the possible responses that could be sent. See [[raml-10-spec-responses|Responses]] section.
     **/
    responses(): Response[];
    /**
     * Instantiation of applyed traits
     **/
    is(): TraitRef[];
    /**
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * An alternate, human-friendly name for the security scheme part
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the security scheme part
     **/
    description(): MarkdownString;
    /**
     * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name. See [[raml-10-spec-annotations|the section on annotations]].
     **/
    annotations(): AnnotationRef[];
}
export declare class SecuritySchemePartImpl extends MethodBaseImpl implements SecuritySchemePart {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Headers that allowed at this position
     **/
    headers(): TypeDeclaration[];
    /**
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Specifies the query string, used by the scheme in order to authorize the request. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
    /**
     * Optional array of responses, describing the possible responses that could be sent. See [[raml-10-spec-responses|Responses]] section.
     **/
    responses(): Response[];
    /**
     * Instantiation of applyed traits
     **/
    is(): TraitRef[];
    /**
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * An alternate, human-friendly name for the security scheme part
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): SecuritySchemePartImpl;
    /**
     * A longer, human-friendly description of the security scheme part
     **/
    description(): MarkdownString;
    /**
     * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name. See [[raml-10-spec-annotations|the section on annotations]].
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface SecuritySchemeSettings extends core.BasicNode {
}
export declare class SecuritySchemeSettingsImpl extends core.BasicNodeImpl implements SecuritySchemeSettings {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface OAuth1SecuritySchemeSettings extends SecuritySchemeSettings {
    /**
     * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
     **/
    requestTokenUri(): FixedUriString;
    /**
     * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
     **/
    authorizationUri(): FixedUriString;
    /**
     * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
     **/
    tokenCredentialsUri(): FixedUriString;
    /**
     * List of the signature methods used by the server. Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT
     **/
    signatures(): string[];
}
export declare class OAuth1SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth1SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
     **/
    requestTokenUri(): FixedUriString;
    /**
     * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
     **/
    authorizationUri(): FixedUriString;
    /**
     * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
     **/
    tokenCredentialsUri(): FixedUriString;
    /**
     * List of the signature methods used by the server. Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT
     **/
    signatures(): string[];
    /**
     * @hidden
     * Set signatures value
     **/
    setSignatures(param: string): OAuth1SecuritySchemeSettingsImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * This  type describes fixed uris
 **/
export interface FixedUriString extends StringType {
}
/**
 * This  type describes fixed uris
 **/
export declare class FixedUriStringImpl extends StringTypeImpl implements FixedUriString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface OAuth2SecuritySchemeSettings extends SecuritySchemeSettings {
    /**
     * The URI of the Token Endpoint as defined in RFC6749 [RFC6748] Section 3.2. Not required forby implicit grant type.
     **/
    accessTokenUri(): FixedUriString;
    /**
     * The URI of the Authorization Endpoint as defined in RFC6749 [RFC6748] Section 3.1. Required forby authorization_code and implicit grant types.
     **/
    authorizationUri(): FixedUriString;
    /**
     * A list of the Authorization grants supported by the API as defined in RFC6749 [RFC6749] Sections 4.1, 4.2, 4.3 and 4.4, can be any of:
     * - authorization_code
     * - password
     * - client_credentials
     * - implicit
     * - refresh_token.
     **/
    authorizationGrants(): string[];
    /**
     * A list of scopes supported by the security scheme as defined in RFC6749 [RFC6749] Section 3.3
     **/
    scopes(): string[];
}
export declare class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements OAuth2SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * The URI of the Token Endpoint as defined in RFC6749 [RFC6748] Section 3.2. Not required forby implicit grant type.
     **/
    accessTokenUri(): FixedUriString;
    /**
     * The URI of the Authorization Endpoint as defined in RFC6749 [RFC6748] Section 3.1. Required forby authorization_code and implicit grant types.
     **/
    authorizationUri(): FixedUriString;
    /**
     * A list of the Authorization grants supported by the API as defined in RFC6749 [RFC6749] Sections 4.1, 4.2, 4.3 and 4.4, can be any of:
     * - authorization_code
     * - password
     * - client_credentials
     * - implicit
     * - refresh_token.
     **/
    authorizationGrants(): string[];
    /**
     * @hidden
     * Set authorizationGrants value
     **/
    setAuthorizationGrants(param: string): OAuth2SecuritySchemeSettingsImpl;
    /**
     * A list of scopes supported by the security scheme as defined in RFC6749 [RFC6749] Section 3.3
     **/
    scopes(): string[];
    /**
     * @hidden
     * Set scopes value
     **/
    setScopes(param: string): OAuth2SecuritySchemeSettingsImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface PassThroughSecuritySchemeSettings extends SecuritySchemeSettings {
    /**
     * Name of query parameter used to pass key
     **/
    queryParameterName(): string;
    /**
     * Name of header used to pass key
     **/
    headerName(): string;
}
export declare class PassThroughSecuritySchemeSettingsImpl extends SecuritySchemeSettingsImpl implements PassThroughSecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name of query parameter used to pass key
     **/
    queryParameterName(): string;
    /**
     * @hidden
     * Set queryParameterName value
     **/
    setQueryParameterName(param: string): PassThroughSecuritySchemeSettingsImpl;
    /**
     * Name of header used to pass key
     **/
    headerName(): string;
    /**
     * @hidden
     * Set headerName value
     **/
    setHeaderName(param: string): PassThroughSecuritySchemeSettingsImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface OAuth2SecurityScheme extends AbstractSecurityScheme {
    settings(): OAuth2SecuritySchemeSettings;
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class OAuth2SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth2SecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    settings(): OAuth2SecuritySchemeSettings;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface OAuth1SecurityScheme extends AbstractSecurityScheme {
    settings(): OAuth1SecuritySchemeSettings;
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class OAuth1SecuritySchemeImpl extends AbstractSecuritySchemeImpl implements OAuth1SecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    settings(): OAuth1SecuritySchemeSettings;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface PassThroughSecurityScheme extends AbstractSecurityScheme {
    settings(): PassThroughSecuritySchemeSettings;
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class PassThroughSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements PassThroughSecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    settings(): PassThroughSecuritySchemeSettings;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface BasicSecurityScheme extends AbstractSecurityScheme {
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class BasicSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements BasicSecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface DigestSecurityScheme extends AbstractSecurityScheme {
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class DigestSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements DigestSecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Declares globally referable security scheme definition
 **/
export interface CustomSecurityScheme extends AbstractSecurityScheme {
}
/**
 * Declares globally referable security scheme definition
 **/
export declare class CustomSecuritySchemeImpl extends AbstractSecuritySchemeImpl implements CustomSecurityScheme {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface Method extends MethodBase {
    /**
     * Method that can be called
     **/
    method(): string;
    /**
     * An alternate, human-friendly name for the method (in the resource's context).
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the method (in the resource's context)
     **/
    description(): MarkdownString;
    /**
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
    /**
     * Detailed information about any query parameters needed by this method. Mutually exclusive with queryString.
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Detailed information about any request headers needed by this method.
     **/
    headers(): TypeDeclaration[];
    /**
     * Some methods admit request bodies, which are described by this property.
     **/
    body(): TypeDeclaration[];
    /**
     * A list of the traits to apply to this method. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     **/
    is(): TraitRef[];
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
     **/
    parentResource(): Resource;
    /**
     * Api owning the resource as a sibling
     **/
    ownerApi(): Api;
    /**
     * For methods of Resources: `{parent Resource relative path} {methodName}`.
     * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
     * For other methods throws Exception.
     **/
    methodId(): string;
    /**
     * The security schemes that apply to this method
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
     * returns schemes defined with `securedBy` at API level.
     * @deprecated
     **/
    allSecuredBy(): SecuritySchemeRef[];
}
export declare class MethodImpl extends MethodBaseImpl implements Method {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Method that can be called
     **/
    method(): string;
    /**
     * @hidden
     * Set method value
     **/
    setMethod(param: string): MethodImpl;
    /**
     * An alternate, human-friendly name for the method (in the resource's context).
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): MethodImpl;
    /**
     * A longer, human-friendly description of the method (in the resource's context)
     **/
    description(): MarkdownString;
    /**
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     **/
    queryString(): TypeDeclaration;
    /**
     * Detailed information about any query parameters needed by this method. Mutually exclusive with queryString.
     **/
    queryParameters(): TypeDeclaration[];
    /**
     * Detailed information about any request headers needed by this method.
     **/
    headers(): TypeDeclaration[];
    /**
     * Some methods admit request bodies, which are described by this property.
     **/
    body(): TypeDeclaration[];
    /**
     * A list of the traits to apply to this method. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     **/
    is(): TraitRef[];
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * The security schemes that apply to this method
     * @hidden
     **/
    securedBy_original(): SecuritySchemeRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * For methods of Resources returns parent resource. For methods of ResourceTypes returns null.
     **/
    parentResource(): Resource;
    /**
     * Api owning the resource as a sibling
     **/
    ownerApi(): Api;
    /**
     * For methods of Resources: `{parent Resource relative path} {methodName}`.
     * For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
     * For other methods throws Exception.
     **/
    methodId(): string;
    /**
     * The security schemes that apply to this method
     * @hidden
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * Returns security schemes, resource or method is secured with. If no security schemes are set at resource or method level,
     * returns schemes defined with `securedBy` at API level.
     * @deprecated
     **/
    allSecuredBy(): SecuritySchemeRef[];
}
export interface Resource extends ResourceBase {
    /**
     * Relative URL of this resource from the parent resource
     **/
    relativeUri(): RelativeUriString;
    /**
     * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
     **/
    resources(): Resource[];
    /**
     * An alternate, human-friendly name for the resource.
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the resource.
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * Path relative to API root
     **/
    completeRelativeUri(): string;
    /**
     * baseUri of owning Api concatenated with completeRelativeUri
     **/
    absoluteUri(): string;
    /**
     * Parent resource for non top level resources
     **/
    parentResource(): Resource;
    /**
     * Get child resource by its relative path
     **/
    childResource(relPath: string): Resource;
    /**
     * Get child method by its name
     **/
    childMethod(method: string): Method[];
    /**
     * Api owning the resource as a sibling
     **/
    ownerApi(): Api;
    /**
     * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
     * for `Api` owning the `Resource` and `Resource.uriParameters()`.
     **/
    absoluteUriParameters(): TypeDeclaration[];
}
export declare class ResourceImpl extends ResourceBaseImpl implements Resource {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Relative URL of this resource from the parent resource
     **/
    relativeUri(): RelativeUriString;
    /**
     * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
     **/
    resources(): Resource[];
    /**
     * An alternate, human-friendly name for the resource.
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): ResourceImpl;
    /**
     * A longer, human-friendly description of the resource.
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * Path relative to API root
     **/
    completeRelativeUri(): string;
    /**
     * baseUri of owning Api concatenated with completeRelativeUri
     **/
    absoluteUri(): string;
    /**
     * Parent resource for non top level resources
     **/
    parentResource(): Resource;
    /**
     * Get child resource by its relative path
     **/
    childResource(relPath: string): Resource;
    /**
     * Get child method by its name
     **/
    childMethod(method: string): Method[];
    /**
     * Api owning the resource as a sibling
     **/
    ownerApi(): Api;
    /**
     * Retrieve an ordered list of all absolute uri parameters. Returns a union of `Api.baseUriParameters()`
     * for `Api` owning the `Resource` and `Resource.uriParameters()`.
     **/
    absoluteUriParameters(): TypeDeclaration[];
}
/**
 * This type currently serves both for absolute and relative urls
 **/
export interface UriTemplate extends StringType {
}
/**
 * This type currently serves both for absolute and relative urls
 **/
export declare class UriTemplateImpl extends StringTypeImpl implements UriTemplate {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * This  type describes absolute uri templates
 **/
export interface FullUriTemplateString extends UriTemplate {
}
/**
 * This  type describes absolute uri templates
 **/
export declare class FullUriTemplateStringImpl extends UriTemplateImpl implements FullUriTemplateString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * This  type describes relative uri templates
 **/
export interface RelativeUriString extends UriTemplate {
}
/**
 * This  type describes relative uri templates
 **/
export declare class RelativeUriStringImpl extends UriTemplateImpl implements RelativeUriString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ResourceType extends ResourceBase {
    /**
     * Name of the resource type
     **/
    name(): string;
    /**
     * Instructions on how and when the resource type should be used.
     **/
    usage(): string;
    /**
     * You may import library locally here it contents is accessible only inside of this resource type
     **/
    uses(): Library[];
}
export declare class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name of the resource type
     **/
    name(): string;
    /**
     * @hidden
     * Set name value
     **/
    setName(param: string): ResourceTypeImpl;
    /**
     * Instructions on how and when the resource type should be used.
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): ResourceTypeImpl;
    /**
     * You may import library locally here it contents is accessible only inside of this resource type
     **/
    uses(): Library[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ValidityExpression extends StringType {
}
export declare class ValidityExpressionImpl extends StringTypeImpl implements ValidityExpression {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface FunctionalInterface extends StringType {
}
export declare class FunctionalInterfaceImpl extends StringTypeImpl implements FunctionalInterface {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 **/
export interface SchemaString extends StringType {
}
/**
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 **/
export declare class SchemaStringImpl extends StringTypeImpl implements SchemaString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * JSON schema
 **/
export interface JSonSchemaString extends SchemaString {
}
/**
 * JSON schema
 **/
export declare class JSonSchemaStringImpl extends SchemaStringImpl implements JSonSchemaString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * XSD schema
 **/
export interface XMLSchemaString extends SchemaString {
}
/**
 * XSD schema
 **/
export declare class XMLSchemaStringImpl extends SchemaStringImpl implements XMLSchemaString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Examples at this moment only two subtypes are supported (json  and xml)
 **/
export interface ExampleString extends StringType {
}
/**
 * Examples at this moment only two subtypes are supported (json  and xml)
 **/
export declare class ExampleStringImpl extends StringTypeImpl implements ExampleString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface RAMLSelector extends StringType {
}
export declare class RAMLSelectorImpl extends StringTypeImpl implements RAMLSelector {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * This sub type of the string represents mime types
 **/
export interface MimeType extends StringType {
}
/**
 * This sub type of the string represents mime types
 **/
export declare class MimeTypeImpl extends StringTypeImpl implements MimeType {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
 **/
export interface MarkdownString extends StringType {
}
/**
 * [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)
 **/
export declare class MarkdownStringImpl extends StringTypeImpl implements MarkdownString {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface DocumentationItem extends RAMLLanguageElement {
    /**
     * Title of documentation section
     **/
    title(): string;
    /**
     * Content of documentation section
     **/
    content(): MarkdownString;
}
export declare class DocumentationItemImpl extends RAMLLanguageElementImpl implements DocumentationItem {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Title of documentation section
     **/
    title(): string;
    /**
     * @hidden
     * Set title value
     **/
    setTitle(param: string): DocumentationItemImpl;
    /**
     * Content of documentation section
     **/
    content(): MarkdownString;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface RAMLSimpleElement extends core.BasicNode {
}
export declare class RAMLSimpleElementImpl extends core.BasicNodeImpl implements RAMLSimpleElement {
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface ImportDeclaration extends RAMLSimpleElement {
    /**
     * Name prefix (without dot) used to refer imported declarations
     **/
    key(): string;
    /**
     * Content of the declared namespace
     **/
    value(): Library;
}
export declare class ImportDeclarationImpl extends RAMLSimpleElementImpl implements ImportDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name prefix (without dot) used to refer imported declarations
     **/
    key(): string;
    /**
     * @hidden
     * Set key value
     **/
    setKey(param: string): ImportDeclarationImpl;
    /**
     * Content of the declared namespace
     **/
    value(): Library;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Content of the schema
 **/
export interface GlobalSchema extends RAMLSimpleElement {
    /**
     * Name of the global schema, used to refer on schema content
     **/
    key(): string;
    /**
     * Content of the schema
     **/
    value(): SchemaString;
}
/**
 * Content of the schema
 **/
export declare class GlobalSchemaImpl extends RAMLSimpleElementImpl implements GlobalSchema {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Name of the global schema, used to refer on schema content
     **/
    key(): string;
    /**
     * @hidden
     * Set key value
     **/
    setKey(param: string): GlobalSchemaImpl;
    /**
     * Content of the schema
     **/
    value(): SchemaString;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface Api extends LibraryBase {
    /**
     * Short plain-text label for the API
     **/
    title(): string;
    /**
     * The version of the API, e.g. "v1"
     **/
    version(): string;
    /**
     * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
     **/
    baseUri(): FullUriTemplateString;
    /**
     * The default media type to use for request and response bodies (payloads), e.g. "application/json"
     **/
    mediaType(): MimeType;
    /**
     * The security schemes that apply to every resource and method in the API
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
     **/
    resources(): Resource[];
    /**
     * Additional overall documentation for the API
     **/
    documentation(): DocumentationItem[];
    /**
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     **/
    displayName(): string;
    /**
     * A longer, human-friendly description of the API
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * Returns RAML version. "RAML10" string is returned for RAML 1.0. "RAML08" string is returned for RAML 0.8.
     **/
    RAMLVersion(): string;
    /**
     * Equivalent API with traits and resource types expanded
     **/
    expand(): Api;
    /**
     * Get child resource by its relative path
     **/
    childResource(relPath: string): Resource;
    /**
     * Retrieve all resources of the Api
     **/
    allResources(): Resource[];
    /**
     * Named parameters used in the baseUri (template)
     **/
    baseUriParameters(): TypeDeclaration[];
    /**
     * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
     * Consider a fragment of RAML specification:
     * ```yaml
     * version: v1
     * baseUri: https://{organization}.example.com/{version}/{service}
     * baseUriParameters:
     * service:
     * ```
     * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
     * but they are among `Api.allBaseUriParameters()`.
     * @deprecated
     **/
    allBaseUriParameters(): TypeDeclaration[];
    /**
     * The protocols supported by the API
     **/
    protocols(): string[];
    /**
     * Protocols used by the API. Returns the `protocols` property value if it is specified.
     * Otherwise, returns protocol, specified in the base URI.
     * @deprecated
     **/
    allProtocols(): string[];
    meta(): core.NodeMetadata;
}
export declare class ApiImpl extends LibraryBaseImpl implements Api {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * Short plain-text label for the API
     **/
    title(): string;
    /**
     * @hidden
     * Set title value
     **/
    setTitle(param: string): ApiImpl;
    /**
     * The version of the API, e.g. "v1"
     **/
    version(): string;
    /**
     * @hidden
     * Set version value
     **/
    setVersion(param: string): ApiImpl;
    /**
     * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
     **/
    baseUri(): FullUriTemplateString;
    /**
     * Named parameters used in the baseUri (template)
     * @hidden
     **/
    baseUriParameters_original(): TypeDeclaration[];
    /**
     * The protocols supported by the API
     * @hidden
     **/
    protocols_original(): string[];
    /**
     * @hidden
     * Set protocols value
     **/
    setProtocols(param: string): ApiImpl;
    /**
     * The default media type to use for request and response bodies (payloads), e.g. "application/json"
     **/
    mediaType(): MimeType;
    /**
     * The security schemes that apply to every resource and method in the API
     **/
    securedBy(): SecuritySchemeRef[];
    /**
     * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
     **/
    resources(): Resource[];
    /**
     * Additional overall documentation for the API
     **/
    documentation(): DocumentationItem[];
    /**
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     **/
    displayName(): string;
    /**
     * @hidden
     * Set displayName value
     **/
    setDisplayName(param: string): ApiImpl;
    /**
     * A longer, human-friendly description of the API
     **/
    description(): MarkdownString;
    /**
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     **/
    annotations(): AnnotationRef[];
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
    /**
     * Equivalent API with traits and resource types expanded
     **/
    expand(): Api;
    /**
     * Get child resource by its relative path
     **/
    childResource(relPath: string): Resource;
    /**
     * Retrieve all resources of the Api
     **/
    allResources(): Resource[];
    /**
     * Named parameters used in the baseUri (template)
     * @hidden
     **/
    baseUriParameters(): TypeDeclaration[];
    /**
     * Retrieve an ordered list of all base uri parameters regardless of whether they are described in `baseUriParameters` or not
     * Consider a fragment of RAML specification:
     * ```yaml
     * version: v1
     * baseUri: https://{organization}.example.com/{version}/{service}
     * baseUriParameters:
     * service:
     * ```
     * Here `version` and `organization` are base uri parameters which are not described in the `baseUriParameters` node,
     * but they are among `Api.allBaseUriParameters()`.
     * @deprecated
     **/
    allBaseUriParameters(): TypeDeclaration[];
    /**
     * The protocols supported by the API
     * @hidden
     **/
    protocols(): string[];
    /**
     * Protocols used by the API. Returns the `protocols` property value if it is specified.
     * Otherwise, returns protocol, specified in the base URI.
     * @deprecated
     **/
    allProtocols(): string[];
    RAMLVersion(): string;
    meta(): core.NodeMetadata;
}
export interface Overlay extends Api {
    /**
     * contains description of why overlay exist
     **/
    usage(): string;
    /**
     * Location of a valid RAML API definition (or overlay or extension), the overlay is applied to,
     **/
    masterRef(): string;
    /**
     * Short plain-text label for the API
     **/
    title(): string;
}
export declare class OverlayImpl extends ApiImpl implements Overlay {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * contains description of why overlay exist
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): OverlayImpl;
    /**
     * Location of a valid RAML API definition (or overlay or extension), the overlay is applied to,
     **/
    masterRef(): string;
    /**
     * @hidden
     * Set masterRef value
     **/
    setMasterRef(param: string): OverlayImpl;
    /**
     * Short plain-text label for the API
     **/
    title(): string;
    /**
     * @hidden
     * Set title value
     **/
    setTitle(param: string): OverlayImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
export interface Extension extends Api {
    /**
     * contains description of why extension exist
     **/
    usage(): string;
    /**
     * Location of a valid RAML API definition (or overlay or extension), the extension is applied to,
     **/
    masterRef(): string;
    /**
     * Short plain-text label for the API
     **/
    title(): string;
}
export declare class ExtensionImpl extends ApiImpl implements Extension {
    protected nodeOrKey: hl.IHighLevelNode | string;
    protected setAsTopLevel: boolean;
    constructor(nodeOrKey: hl.IHighLevelNode | string, setAsTopLevel?: boolean);
    /**
     * contains description of why extension exist
     **/
    usage(): string;
    /**
     * @hidden
     * Set usage value
     **/
    setUsage(param: string): ExtensionImpl;
    /**
     * Location of a valid RAML API definition (or overlay or extension), the extension is applied to,
     **/
    masterRef(): string;
    /**
     * @hidden
     * Set masterRef value
     **/
    setMasterRef(param: string): ExtensionImpl;
    /**
     * Short plain-text label for the API
     **/
    title(): string;
    /**
     * @hidden
     * Set title value
     **/
    setTitle(param: string): ExtensionImpl;
    /**
     * @hidden
     * @return Actual name of instance class
     **/
    wrapperClassName(): string;
    /**
     * @return Actual name of instance interface
     **/
    kind(): string;
}
/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Api instance.
 **/
export declare function loadApiSync(apiPath: string, options?: core.Options): Api;
/**
 * Load API synchronously. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for Api which contains errors.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Api instance.
 **/
export declare function loadApiSync(apiPath: string, extensionsAndOverlays: string[], options?: core.Options): Api;
/**
 * Load RAML synchronously. May load both Api and Typed fragments. If the 'rejectOnErrors' option is set to true, [[ApiLoadingError]] is thrown for RAML which contains errors.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return RAMLLanguageElement instance.
 **/
export declare function loadRAMLSync(ramlPath: string, extensionsAndOverlays: string[], options?: core.Options): RAMLLanguageElement;
/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @return Promise&lt;Api&gt;.
 **/
export declare function loadApi(apiPath: string, options?: core.Options): Promise<Api>;
/**
 * Load API asynchronously. The Promise is rejected with [[ApiLoadingError]] if the resulting Api contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param apiPath Path to API: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;Api&gt;.
 **/
export declare function loadApi(apiPath: string, extensionsAndOverlays: string[], options?: core.Options): Promise<Api>;
/**
 * Load RAML asynchronously. May load both Api and Typed fragments. The Promise is rejected with [[ApiLoadingError]] if the resulting RAMLLanguageElement contains errors and the 'rejectOnErrors' option is set to 'true'.
 * @param ramlPath Path to RAML: local file system path or Web URL
 * @param options Load options
 * @param extensionsAndOverlays Paths to extensions and overlays to be applied listed in the order of application. Relevant for RAML 1.0 only.
 * @return Promise&lt;RAMLLanguageElement&gt;.
 **/
export declare function loadRAML(ramlPath: string, extensionsAndOverlays: string[], options?: core.Options): Promise<RAMLLanguageElement>;
/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export declare function getLanguageElementByRuntimeType(runtimeType: typeSystem.ITypeDefinition): core.BasicNode;
