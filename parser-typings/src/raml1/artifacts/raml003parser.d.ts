import hl = require("../highLevelAST");
import core = require("../parserCore");
import Opt = require("../../Opt");
export interface BasicNode extends core.BasicSuperNode {
}
export declare class BasicNodeImpl extends core.BasicSuperNodeImpl implements BasicNode {
    constructor(node: hl.IHighLevelNode);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface RAMLLanguageElement extends BasicNode {
    /***
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     ***/
    displayName(): string;
    /***
     * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown [MARKDOWN]
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
export declare class RAMLLanguageElementImpl extends BasicNodeImpl implements RAMLLanguageElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): RAMLLanguageElementImpl;
    /***
     * The description attribute describes the intended use or meaning of the $self. This value MAY be formatted using Markdown [MARKDOWN]
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
export interface ValueType extends core.AbstractWrapperNode {
    /***
     * @return String representation of the node value
     ***/
    value(): string;
    /***
     * @return Underlying High Level attribute node
     ***/
    highLevel(): hl.IAttribute;
}
export declare class ValueTypeImpl implements ValueType {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * @return String representation of the node value
     ***/
    value(): string;
    /***
     * @return Underlying High Level attribute node
     ***/
    highLevel(): hl.IAttribute;
}
export interface NumberType extends ValueType {
}
export declare class NumberTypeImpl extends ValueTypeImpl implements NumberType {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface BooleanType extends ValueType {
}
export declare class BooleanTypeImpl extends ValueTypeImpl implements BooleanType {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface Reference extends ValueType {
}
export declare class ReferenceImpl extends ValueTypeImpl implements Reference {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * @return StructuredValue object representing the node value
     ***/
    value(): string;
}
export interface ResourceTypeRef extends Reference {
}
export declare class ResourceTypeRefImpl extends ReferenceImpl implements ResourceTypeRef {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface TraitRef extends Reference {
}
export declare class TraitRefImpl extends ReferenceImpl implements TraitRef {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface SecuritySchemaRef extends Reference {
}
export declare class SecuritySchemaRefImpl extends ReferenceImpl implements SecuritySchemaRef {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Instantiation of annotations. It allows you to attach some meta information to your API
 ***/
export interface AnnotationRef extends Reference {
}
/***
 * Instantiation of annotations. It allows you to attach some meta information to your API
 ***/
export declare class AnnotationRefImpl extends ReferenceImpl implements AnnotationRef {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface DataElementRef extends Reference {
}
export declare class DataElementRefImpl extends ReferenceImpl implements DataElementRef {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ramlexpression extends ValueType {
}
export declare class ramlexpressionImpl extends ValueTypeImpl implements ramlexpression {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface AnnotationTarget extends ValueType {
}
export declare class AnnotationTargetImpl extends ValueTypeImpl implements AnnotationTarget {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface pointer extends ValueType {
}
export declare class pointerImpl extends ValueTypeImpl implements pointer {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface StringType extends ValueType {
}
export declare class StringTypeImpl extends ValueTypeImpl implements StringType {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * This type currently serves both for absolute and relative urls
 ***/
export interface UriTemplate extends StringType {
}
/***
 * This type currently serves both for absolute and relative urls
 ***/
export declare class UriTemplateImpl extends StringTypeImpl implements UriTemplate {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * This  type describes relative uri templates
 ***/
export interface RelativeUri extends UriTemplate {
}
/***
 * This  type describes relative uri templates
 ***/
export declare class RelativeUriImpl extends UriTemplateImpl implements RelativeUri {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * This  type describes absolute uri templates
 ***/
export interface FullUriTemplate extends UriTemplate {
}
/***
 * This  type describes absolute uri templates
 ***/
export declare class FullUriTemplateImpl extends UriTemplateImpl implements FullUriTemplate {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface StatusCode extends StringType {
}
export declare class StatusCodeImpl extends StringTypeImpl implements StatusCode {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * This  type describes fixed uris
 ***/
export interface FixedUri extends StringType {
}
/***
 * This  type describes fixed uris
 ***/
export declare class FixedUriImpl extends StringTypeImpl implements FixedUri {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ContentType extends StringType {
}
export declare class ContentTypeImpl extends StringTypeImpl implements ContentType {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ValidityExpression extends StringType {
}
export declare class ValidityExpressionImpl extends StringTypeImpl implements ValidityExpression {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface DateFormatSpec extends StringType {
}
export declare class DateFormatSpecImpl extends StringTypeImpl implements DateFormatSpec {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface FunctionalInterface extends StringType {
}
export declare class FunctionalInterfaceImpl extends StringTypeImpl implements FunctionalInterface {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 ***/
export interface SchemaString extends StringType {
}
/***
 * Schema at this moment only two subtypes are supported (json schema and xsd)
 ***/
export declare class SchemaStringImpl extends StringTypeImpl implements SchemaString {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * JSON schema
 ***/
export interface JSonSchemaString extends SchemaString {
}
/***
 * JSON schema
 ***/
export declare class JSonSchemaStringImpl extends SchemaStringImpl implements JSonSchemaString {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * XSD schema
 ***/
export interface XMLSchemaString extends SchemaString {
}
/***
 * XSD schema
 ***/
export declare class XMLSchemaStringImpl extends SchemaStringImpl implements XMLSchemaString {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Examples at this moment only two subtypes are supported (json  and xml)
 ***/
export interface ExampleString extends StringType {
}
/***
 * Examples at this moment only two subtypes are supported (json  and xml)
 ***/
export declare class ExampleStringImpl extends StringTypeImpl implements ExampleString {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * script to inject to tooling environment
 ***/
export interface ScriptingHook extends StringType {
}
/***
 * script to inject to tooling environment
 ***/
export declare class ScriptingHookImpl extends StringTypeImpl implements ScriptingHook {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface SecuritySchemaHookScript extends ScriptingHook {
}
export declare class SecuritySchemaHookScriptImpl extends ScriptingHookImpl implements SecuritySchemaHookScript {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface RAMLPointer extends StringType {
}
export declare class RAMLPointerImpl extends StringTypeImpl implements RAMLPointer {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface RAMLSelector extends StringType {
}
export declare class RAMLSelectorImpl extends StringTypeImpl implements RAMLSelector {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * This sub type of the string represents mime types
 ***/
export interface MimeType extends StringType {
}
/***
 * This sub type of the string represents mime types
 ***/
export declare class MimeTypeImpl extends StringTypeImpl implements MimeType {
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Mardown string is a string which can contain markdown as an extension this markdown should support links with RAML Pointers since 1.0
 ***/
export interface MarkdownString extends StringType {
}
/***
 * Mardown string is a string which can contain markdown as an extension this markdown should support links with RAML Pointers since 1.0
 ***/
export declare class MarkdownStringImpl extends StringTypeImpl implements MarkdownString {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface DocumentationItem extends RAMLLanguageElement {
    /***
     * Title of documentation section
     ***/
    title(): string;
    /***
     * Content of documentation section
     ***/
    content(): MarkdownString;
}
export declare class DocumentationItemImpl extends RAMLLanguageElementImpl implements DocumentationItem {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Title of documentation section
     ***/
    title(): string;
    /***
     * Set title value
     ***/
    setTitle(param: string): DocumentationItemImpl;
    /***
     * Content of documentation section
     ***/
    content(): MarkdownString;
}
export interface ScriptSpec extends RAMLLanguageElement {
    language(): string;
    content(): string;
}
export declare class ScriptSpecImpl extends RAMLLanguageElementImpl implements ScriptSpec {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    language(): string;
    /***
     * Set language value
     ***/
    setLanguage(param: string): ScriptSpecImpl;
    content(): string;
    /***
     * Set content value
     ***/
    setContent(param: string): ScriptSpecImpl;
}
export interface ApiDescription extends RAMLLanguageElement {
    apiFiles(): Api[];
    script(): ScriptSpec[];
    "type"(): string;
}
export declare class ApiDescriptionImpl extends RAMLLanguageElementImpl implements ApiDescription {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    apiFiles(): Api[];
    script(): ScriptSpec[];
    "type"(): string;
    /***
     * Set type value
     ***/
    setType(param: string): ApiDescriptionImpl;
}
export interface CallbackAPIDescription extends ApiDescription {
    callbackFor(): Api;
}
export declare class CallbackAPIDescriptionImpl extends ApiDescriptionImpl implements CallbackAPIDescription {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    callbackFor(): Api;
}
export interface RAMLProject extends RAMLLanguageElement {
    relatedProjects(): RAMLProject[];
    declaredApis(): ApiDescription[];
    license(): string;
    overview(): string;
    url(): string;
}
export declare class RAMLProjectImpl extends RAMLLanguageElementImpl implements RAMLProject {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    relatedProjects(): RAMLProject[];
    declaredApis(): ApiDescription[];
    license(): string;
    /***
     * Set license value
     ***/
    setLicense(param: string): RAMLProjectImpl;
    overview(): string;
    /***
     * Set overview value
     ***/
    setOverview(param: string): RAMLProjectImpl;
    url(): string;
    /***
     * Set url value
     ***/
    setUrl(param: string): RAMLProjectImpl;
}
/***
 * Security schema type allows you to contribute your own security schema type with settings and optinal configurator for plugging into client sdks auth mechanism
 ***/
export interface SecuritySchemaType extends RAMLLanguageElement {
    /***
     * You may declare settings needed to use this type of security security schemas
     ***/
    requiredSettings(): DataElement[];
    /***
     * The describedBy attribute MAY be used to apply a trait-like structure to a security scheme mechanism so as to extend the mechanism, such as specifying response codes, HTTP headers or custom documentation.
     * This extension allows API designers to describe security schemes. As a best practice, even for standard security schemes, API designers SHOULD describe the security schemes' required artifacts, such as headers, URI parameters, and so on. Including the security schemes' description completes an API's documentation.
     ***/
    describedBy(): SecuritySchemaPart;
}
/***
 * Security schema type allows you to contribute your own security schema type with settings and optinal configurator for plugging into client sdks auth mechanism
 ***/
export declare class SecuritySchemaTypeImpl extends RAMLLanguageElementImpl implements SecuritySchemaType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * You may declare settings needed to use this type of security security schemas
     ***/
    requiredSettings(): DataElement[];
    /***
     * The describedBy attribute MAY be used to apply a trait-like structure to a security scheme mechanism so as to extend the mechanism, such as specifying response codes, HTTP headers or custom documentation.
     * This extension allows API designers to describe security schemes. As a best practice, even for standard security schemes, API designers SHOULD describe the security schemes' required artifacts, such as headers, URI parameters, and so on. Including the security schemes' description completes an API's documentation.
     ***/
    describedBy(): SecuritySchemaPart;
}
export interface DataElement extends RAMLLanguageElement {
    /***
     * name of the parameter
     ***/
    name(): string;
    xml(): XMLInfo;
    /***
     * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
     ***/
    facets(): DataElement[];
    /***
     * Alias for the type property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schema(): string;
    usage(): string;
    /***
     * A base type which the current type extends, or more generally a type expression.
     ***/
    "type"(): string[];
    /***
     * Location of the parameter (can not be edited by user)
     ***/
    location(): ModelLocation;
    /***
     * Kind of location
     ***/
    locationKind(): LocationKind;
    /***
     * Provides default value for a property
     ***/
    "default"(): string;
    /***
     * An example of an instance of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     ***/
    example(): string;
    /***
     * An object containing named examples of instances of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     ***/
    examples(): ExampleSpec[];
    /***
     * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
     ***/
    repeat(): boolean;
    /***
     * Sets if property is optional or not
     ***/
    required(): boolean;
    /***
     * An alternate, human-friendly name for the type
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the type
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
export declare class DataElementImpl extends RAMLLanguageElementImpl implements DataElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * name of the parameter
     ***/
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): DataElementImpl;
    xml(): XMLInfo;
    /***
     * When extending from a type you can define new facets (which can then be set to concrete values by subtypes).
     ***/
    facets(): DataElement[];
    /***
     * Alias for the type property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schema(): string;
    /***
     * Set schema value
     ***/
    setSchema(param: string): DataElementImpl;
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): DataElementImpl;
    /***
     * A base type which the current type extends, or more generally a type expression.
     ***/
    "type"(): string[];
    /***
     * Set type value
     ***/
    setType(param: string): DataElementImpl;
    /***
     * Location of the parameter (can not be edited by user)
     ***/
    location(): ModelLocation;
    /***
     * Kind of location
     ***/
    locationKind(): LocationKind;
    /***
     * Provides default value for a property
     ***/
    "default"(): string;
    /***
     * Set default value
     ***/
    setDefault(param: string): DataElementImpl;
    /***
     * An example of an instance of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     ***/
    example(): string;
    /***
     * Set example value
     ***/
    setExample(param: string): DataElementImpl;
    /***
     * An object containing named examples of instances of this type. This can be used, e.g., by documentation generators to generate sample values for an object of this type. Cannot be present if the examples property is present.
     ***/
    examples(): ExampleSpec[];
    /***
     * The repeat attribute specifies that the parameter can be repeated. If the parameter can be used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and the parameter may not be repeated.
     ***/
    repeat(): boolean;
    /***
     * Set repeat value
     ***/
    setRepeat(param: boolean): DataElementImpl;
    /***
     * Sets if property is optional or not
     ***/
    required(): boolean;
    /***
     * Set required value
     ***/
    setRequired(param: boolean): DataElementImpl;
    /***
     * An alternate, human-friendly name for the type
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): DataElementImpl;
    /***
     * A longer, human-friendly description of the type
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
export interface XMLInfo extends BasicNode {
    name(): string;
    namespace(): string;
    prefix(): string;
    attribute(): boolean;
    wrapped(): boolean;
}
export declare class XMLInfoImpl extends BasicNodeImpl implements XMLInfo {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): XMLInfoImpl;
    namespace(): string;
    /***
     * Set namespace value
     ***/
    setNamespace(param: string): XMLInfoImpl;
    prefix(): string;
    /***
     * Set prefix value
     ***/
    setPrefix(param: string): XMLInfoImpl;
    attribute(): boolean;
    /***
     * Set attribute value
     ***/
    setAttribute(param: boolean): XMLInfoImpl;
    wrapped(): boolean;
    /***
     * Set wrapped value
     ***/
    setWrapped(param: boolean): XMLInfoImpl;
}
export interface ModelLocation extends core.AbstractWrapperNode {
}
export declare class ModelLocationImpl implements ModelLocation {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface LocationKind extends core.AbstractWrapperNode {
}
export declare class LocationKindImpl implements LocationKind {
    protected attr: hl.IAttribute;
    constructor(attr: hl.IAttribute);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ExampleSpec extends RAMLLanguageElement {
    /***
     * The example itself
     ***/
    content(): string;
    /***
     * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
     ***/
    strict(): boolean;
    name(): string;
    /***
     * An alternate, human-friendly name for the example
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the example
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
export declare class ExampleSpecImpl extends RAMLLanguageElementImpl implements ExampleSpec {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * The example itself
     ***/
    content(): string;
    /***
     * Set content value
     ***/
    setContent(param: string): ExampleSpecImpl;
    /***
     * By default, examples are validated against any type declaration. Set this to false to allow examples that need not validate.
     ***/
    strict(): boolean;
    /***
     * Set strict value
     ***/
    setStrict(param: boolean): ExampleSpecImpl;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): ExampleSpecImpl;
    /***
     * An alternate, human-friendly name for the example
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): ExampleSpecImpl;
    /***
     * A longer, human-friendly description of the example
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
}
/***
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 ***/
export interface FileParameter extends DataElement {
    /***
     * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
     ***/
    fileTypes(): ContentType[];
    /***
     * The minLength attribute specifies the parameter value's minimum number of bytes.
     ***/
    minLength(): number;
    /***
     * The maxLength attribute specifies the parameter value's maximum number of bytes.
     ***/
    maxLength(): number;
}
/***
 * (Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to handle file uploads correctly.
 ***/
export declare class FileParameterImpl extends DataElementImpl implements FileParameter {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * It should also include a new property: fileTypes, which should be a list of valid content-type strings for the file. The file type * /* should be a valid value.
     ***/
    fileTypes(): ContentType[];
    /***
     * The minLength attribute specifies the parameter value's minimum number of bytes.
     ***/
    minLength(): number;
    /***
     * Set minLength value
     ***/
    setMinLength(param: number): FileParameterImpl;
    /***
     * The maxLength attribute specifies the parameter value's maximum number of bytes.
     ***/
    maxLength(): number;
    /***
     * Set maxLength value
     ***/
    setMaxLength(param: number): FileParameterImpl;
}
export interface ArrayField extends DataElement {
    /***
     * Should items in array be unique
     ***/
    uniqueItems(): boolean;
    /***
     * Array component type.
     ***/
    items(): DataElement;
    /***
     * Minimum amount of items in array
     ***/
    minItems(): number;
    /***
     * Maximum amount of items in array
     ***/
    maxItems(): number;
}
export declare class ArrayFieldImpl extends DataElementImpl implements ArrayField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Should items in array be unique
     ***/
    uniqueItems(): boolean;
    /***
     * Set uniqueItems value
     ***/
    setUniqueItems(param: boolean): ArrayFieldImpl;
    /***
     * Array component type.
     ***/
    items(): DataElement;
    /***
     * Minimum amount of items in array
     ***/
    minItems(): number;
    /***
     * Set minItems value
     ***/
    setMinItems(param: number): ArrayFieldImpl;
    /***
     * Maximum amount of items in array
     ***/
    maxItems(): number;
    /***
     * Set maxItems value
     ***/
    setMaxItems(param: number): ArrayFieldImpl;
}
export interface UnionField extends DataElement {
    /***
     * Type property name to be used as a discriminator or boolean
     ***/
    discriminator(): string;
}
export declare class UnionFieldImpl extends DataElementImpl implements UnionField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Type property name to be used as a discriminator or boolean
     ***/
    discriminator(): string;
    /***
     * Set discriminator value
     ***/
    setDiscriminator(param: string): UnionFieldImpl;
}
export interface ObjectField extends DataElement {
    /***
     * The properties that instances of this type may or must have.
     ***/
    properties(): DataElement[];
    /***
     * The minimum number of properties allowed for instances of this type.
     ***/
    minProperties(): number;
    /***
     * The maximum number of properties allowed for instances of this type.
     ***/
    maxProperties(): number;
    /***
     * JSON schema style syntax for declaring maps
     ***/
    additionalProperties(): DataElement;
    /***
     * JSON schema style syntax for declaring key restricted maps
     ***/
    patternProperties(): DataElement[];
    /***
     * Type property name to be used as discriminator, or boolean
     ***/
    discriminator(): pointer;
    /***
     * The value of discriminator for the type.
     ***/
    discriminatorValue(): string;
}
export declare class ObjectFieldImpl extends DataElementImpl implements ObjectField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * The properties that instances of this type may or must have.
     ***/
    properties(): DataElement[];
    /***
     * The minimum number of properties allowed for instances of this type.
     ***/
    minProperties(): number;
    /***
     * Set minProperties value
     ***/
    setMinProperties(param: number): ObjectFieldImpl;
    /***
     * The maximum number of properties allowed for instances of this type.
     ***/
    maxProperties(): number;
    /***
     * Set maxProperties value
     ***/
    setMaxProperties(param: number): ObjectFieldImpl;
    /***
     * JSON schema style syntax for declaring maps
     ***/
    additionalProperties(): DataElement;
    /***
     * JSON schema style syntax for declaring key restricted maps
     ***/
    patternProperties(): DataElement[];
    /***
     * Type property name to be used as discriminator, or boolean
     ***/
    discriminator(): pointer;
    /***
     * The value of discriminator for the type.
     ***/
    discriminatorValue(): string;
    /***
     * Set discriminatorValue value
     ***/
    setDiscriminatorValue(param: string): ObjectFieldImpl;
}
/***
 * Value must be a string
 ***/
export interface StrElement extends DataElement {
    /***
     * Regular expression that this string should path
     ***/
    pattern(): string;
    /***
     * Minimum length of the string
     ***/
    minLength(): number;
    /***
     * Maximum length of the string
     ***/
    maxLength(): number;
    /***
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     ***/
    enum(): string[];
}
/***
 * Value must be a string
 ***/
export declare class StrElementImpl extends DataElementImpl implements StrElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Regular expression that this string should path
     ***/
    pattern(): string;
    /***
     * Set pattern value
     ***/
    setPattern(param: string): StrElementImpl;
    /***
     * Minimum length of the string
     ***/
    minLength(): number;
    /***
     * Set minLength value
     ***/
    setMinLength(param: number): StrElementImpl;
    /***
     * Maximum length of the string
     ***/
    maxLength(): number;
    /***
     * Set maxLength value
     ***/
    setMaxLength(param: number): StrElementImpl;
    /***
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     ***/
    enum(): string[];
    /***
     * Set enum value
     ***/
    setEnum(param: string): StrElementImpl;
}
/***
 * Value must be a boolean
 ***/
export interface BooleanElement extends DataElement {
}
/***
 * Value must be a boolean
 ***/
export declare class BooleanElementImpl extends DataElementImpl implements BooleanElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Value must be a boolean
 ***/
export interface ValueElement extends DataElement {
}
/***
 * Value must be a boolean
 ***/
export declare class ValueElementImpl extends DataElementImpl implements ValueElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 ***/
export interface NumberElement extends DataElement {
    /***
     * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
     ***/
    minimum(): number;
    /***
     * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
     ***/
    maximum(): number;
    /***
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     ***/
    enum(): string[];
    /***
     * Value format
     ***/
    format(): string;
    /***
     * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
     ***/
    multipleOf(): number;
}
/***
 * Value MUST be a number. Indicate floating point numbers as defined by YAML.
 ***/
export declare class NumberElementImpl extends DataElementImpl implements NumberElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * (Optional, applicable only for parameters of type number or integer) The minimum attribute specifies the parameter's minimum value.
     ***/
    minimum(): number;
    /***
     * Set minimum value
     ***/
    setMinimum(param: number): NumberElementImpl;
    /***
     * (Optional, applicable only for parameters of type number or integer) The maximum attribute specifies the parameter's maximum value.
     ***/
    maximum(): number;
    /***
     * Set maximum value
     ***/
    setMaximum(param: number): NumberElementImpl;
    /***
     * (Optional, applicable only for parameters of type string) The enum attribute provides an enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, the clients and servers MUST treat this as an error.
     ***/
    enum(): string[];
    /***
     * Set enum value
     ***/
    setEnum(param: string): NumberElementImpl;
    /***
     * Value format
     ***/
    format(): string;
    /***
     * Set format value
     ***/
    setFormat(param: string): NumberElementImpl;
    /***
     * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
     ***/
    multipleOf(): number;
    /***
     * Set multipleOf value
     ***/
    setMultipleOf(param: number): NumberElementImpl;
}
/***
 * Value MUST be a integer.
 ***/
export interface IntegerElement extends NumberElement {
    format(): string;
}
/***
 * Value MUST be a integer.
 ***/
export declare class IntegerElementImpl extends NumberElementImpl implements IntegerElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    format(): string;
    /***
     * Set format value
     ***/
    setFormat(param: string): IntegerElementImpl;
}
export interface RAMLPointerElement extends DataElement {
    target(): RAMLSelector;
}
export declare class RAMLPointerElementImpl extends DataElementImpl implements RAMLPointerElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    target(): RAMLSelector;
}
export interface RAMLExpression extends DataElement {
}
export declare class RAMLExpressionImpl extends DataElementImpl implements RAMLExpression {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ScriptHookElement extends DataElement {
    /***
     * Typescript file defining interface which this scrip should comply to
     ***/
    declaredIn(): string;
    /***
     * Name of the interface which scripts should comply to
     ***/
    interfaceName(): string;
}
export declare class ScriptHookElementImpl extends DataElementImpl implements ScriptHookElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Typescript file defining interface which this scrip should comply to
     ***/
    declaredIn(): string;
    /***
     * Set declaredIn value
     ***/
    setDeclaredIn(param: string): ScriptHookElementImpl;
    /***
     * Name of the interface which scripts should comply to
     ***/
    interfaceName(): string;
    /***
     * Set interfaceName value
     ***/
    setInterfaceName(param: string): ScriptHookElementImpl;
}
export interface SchemaElement extends DataElement {
}
export declare class SchemaElementImpl extends DataElementImpl implements SchemaElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3 [RFC2616]. or according to specified date format
 ***/
export interface DateElement extends DataElement {
    dateFormat(): DateFormatSpec;
}
/***
 * Value MUST be a string representation of a date as defined in RFC2616 Section 3.3 [RFC2616]. or according to specified date format
 ***/
export declare class DateElementImpl extends DataElementImpl implements DateElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    dateFormat(): DateFormatSpec;
}
export interface HasNormalParameters extends RAMLLanguageElement {
    /***
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     ***/
    queryParameters(): DataElement[];
    /***
     * Headers that allowed at this position
     ***/
    headers(): DataElement[];
    queryString(): DataElement;
}
export declare class HasNormalParametersImpl extends RAMLLanguageElementImpl implements HasNormalParameters {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     ***/
    queryParameters(): DataElement[];
    /***
     * Headers that allowed at this position
     ***/
    headers(): DataElement[];
    queryString(): DataElement;
}
export interface MethodBase extends HasNormalParameters {
    /***
     * Information about the expected responses to a request
     ***/
    responses(): Response[];
    /***
     * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create.
     * Resources CAN have alternate representations. For example, an API might support both JSON and XML representations.
     * A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
     ***/
    body(): DataElement[];
    /***
     * A method can override the protocols specified in the resource or at the API root, by employing this property.
     ***/
    protocols(): string[];
    /***
     * Instantiation of applyed traits
     ***/
    is(): TraitRef[];
    /***
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     ***/
    securedBy(): SecuritySchemaRef[];
}
export declare class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Information about the expected responses to a request
     ***/
    responses(): Response[];
    /***
     * Some method verbs expect the resource to be sent as a request body. For example, to create a resource, the request must include the details of the resource to create.
     * Resources CAN have alternate representations. For example, an API might support both JSON and XML representations.
     * A method's body is defined in the body property as a hashmap, in which the key MUST be a valid media type.
     ***/
    body(): DataElement[];
    /***
     * A method can override the protocols specified in the resource or at the API root, by employing this property.
     ***/
    protocols(): string[];
    /***
     * Set protocols value
     ***/
    setProtocols(param: string): MethodBaseImpl;
    /***
     * Instantiation of applyed traits
     ***/
    is(): TraitRef[];
    /***
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     ***/
    securedBy(): SecuritySchemaRef[];
}
export interface Response extends RAMLLanguageElement {
    /***
     * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
     ***/
    code(): StatusCode;
    /***
     * Detailed information about any response headers returned by this method
     ***/
    headers(): DataElement[];
    /***
     * The body of the response: a body declaration
     ***/
    body(): DataElement[];
    /***
     * An alternate, human-friendly name for the response
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the response
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * true for codes < 400 and false otherwise
     ***/
    isOkRange(): boolean;
}
export declare class ResponseImpl extends RAMLLanguageElementImpl implements Response {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that describes that status code.
     ***/
    code(): StatusCode;
    /***
     * Detailed information about any response headers returned by this method
     ***/
    headers(): DataElement[];
    /***
     * The body of the response: a body declaration
     ***/
    body(): DataElement[];
    /***
     * An alternate, human-friendly name for the response
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): ResponseImpl;
    /***
     * A longer, human-friendly description of the response
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * true for codes < 400 and false otherwise
     ***/
    isOkRange(): boolean;
}
export interface Trait extends MethodBase {
    /***
     * Name of the trait
     ***/
    name(): string;
    usage(): string;
    /***
     * You may import library locally here it contents is accessible only inside of this trait
     ***/
    uses(): Library[];
}
export declare class TraitImpl extends MethodBaseImpl implements Trait {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Name of the trait
     ***/
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): TraitImpl;
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): TraitImpl;
    /***
     * You may import library locally here it contents is accessible only inside of this trait
     ***/
    uses(): Library[];
}
export interface Library extends BasicNode {
    name(): string;
    /***
     * Alias for the types property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schemas(): GlobalSchema[];
    /***
     * contains description of why library exist
     ***/
    usage(): string;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Declarations of (data) types for use within this API
     ***/
    types(): DataElement[];
    /***
     * Declarations of traits for use within this API
     ***/
    traits(): Trait[];
    /***
     * Declarations of resource types for use within this API
     ***/
    resourceTypes(): ResourceType[];
    /***
     * Declarations of annotation types for use by annotations
     ***/
    annotationTypes(): AnnotationType[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Declarations of security schemes for use within this API.
     ***/
    securitySchemes(): SecuritySchema[];
    /***
     * Importing libraries
     ***/
    uses(): Library[];
}
export declare class LibraryImpl extends BasicNodeImpl implements Library {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): LibraryImpl;
    /***
     * Alias for the types property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schemas(): GlobalSchema[];
    /***
     * contains description of why library exist
     ***/
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): LibraryImpl;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Declarations of (data) types for use within this API
     ***/
    types(): DataElement[];
    /***
     * Declarations of traits for use within this API
     ***/
    traits(): Trait[];
    /***
     * Declarations of resource types for use within this API
     ***/
    resourceTypes(): ResourceType[];
    /***
     * Declarations of annotation types for use by annotations
     ***/
    annotationTypes(): AnnotationType[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Declarations of security schemes for use within this API.
     ***/
    securitySchemes(): SecuritySchema[];
    /***
     * Importing libraries
     ***/
    uses(): Library[];
}
export interface RAMLSimpleElement extends BasicNode {
}
export declare class RAMLSimpleElementImpl extends BasicNodeImpl implements RAMLSimpleElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface ImportDeclaration extends RAMLSimpleElement {
    /***
     * Name prefix (without dot) used to refer imported declarations
     ***/
    key(): string;
    /***
     * Content of the declared namespace
     ***/
    value(): Library;
}
export declare class ImportDeclarationImpl extends RAMLSimpleElementImpl implements ImportDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Name prefix (without dot) used to refer imported declarations
     ***/
    key(): string;
    /***
     * Set key value
     ***/
    setKey(param: string): ImportDeclarationImpl;
    /***
     * Content of the declared namespace
     ***/
    value(): Library;
}
/***
 * Content of the schema
 ***/
export interface GlobalSchema extends RAMLSimpleElement {
    /***
     * Name of the global schema, used to refer on schema content
     ***/
    key(): string;
    /***
     * Content of the schema
     ***/
    value(): SchemaString;
}
/***
 * Content of the schema
 ***/
export declare class GlobalSchemaImpl extends RAMLSimpleElementImpl implements GlobalSchema {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Name of the global schema, used to refer on schema content
     ***/
    key(): string;
    /***
     * Set key value
     ***/
    setKey(param: string): GlobalSchemaImpl;
    /***
     * Content of the schema
     ***/
    value(): SchemaString;
}
export interface ResourceBase extends RAMLLanguageElement {
    /***
     * Methods that are part of this resource type definition
     ***/
    methods(): Method[];
    /***
     * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section. Individual methods may override this declaration
     ***/
    is(): TraitRef[];
    /***
     * The resource type which this resource inherits. . See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     ***/
    "type"(): ResourceTypeRef;
    /***
     * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * Detailed information about any URI parameters of this resource
     ***/
    uriParameters(): DataElement[];
}
export declare class ResourceBaseImpl extends RAMLLanguageElementImpl implements ResourceBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Methods that are part of this resource type definition
     ***/
    methods(): Method[];
    /***
     * A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section. Individual methods may override this declaration
     ***/
    is(): TraitRef[];
    /***
     * The resource type which this resource inherits. . See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     ***/
    "type"(): ResourceTypeRef;
    /***
     * The security schemes that apply to all methods declared (implicitly or explicitly) for this resource.
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * Detailed information about any URI parameters of this resource
     ***/
    uriParameters(): DataElement[];
}
export interface Method extends MethodBase {
    signature(): SchemaString;
    /***
     * Method that can be called
     ***/
    method(): string;
    /***
     * An alternate, human-friendly name for the method (in the resource's context).
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the method (in the resource's context)
     ***/
    description(): MarkdownString;
    /***
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     ***/
    queryString(): DataElement;
    /***
     * Detailed information about any query parameters needed by this method. Mutually exclusive with queryString.
     ***/
    queryParameters(): DataElement[];
    /***
     * Detailed information about any request headers needed by this method.
     ***/
    headers(): DataElement[];
    /***
     * Some methods admit request bodies, which are described by this property.
     ***/
    body(): DataElement[];
    /***
     * A list of the traits to apply to this method. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     ***/
    is(): TraitRef[];
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * The security schemes that apply to this method
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * For methods of Resources returns parent resource. For methods of ResourceTypes returns undefined Opt.
     ***/
    parentResource(): Opt<Resource>;
    /***
     * Api owning the resource as a sibling
     ***/
    ownerApi(): Api;
    /***
     * // For methods of Resources: `{parent Resource relative path} {methodName}`.
     * // For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
     * // For other methods throws Exception.
     ***/
    methodId(): string;
}
export declare class MethodImpl extends MethodBaseImpl implements Method {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    signature(): SchemaString;
    /***
     * Method that can be called
     ***/
    method(): string;
    /***
     * Set method value
     ***/
    setMethod(param: string): MethodImpl;
    /***
     * An alternate, human-friendly name for the method (in the resource's context).
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): MethodImpl;
    /***
     * A longer, human-friendly description of the method (in the resource's context)
     ***/
    description(): MarkdownString;
    /***
     * Specifies the query string needed by this method. Mutually exclusive with queryParameters.
     ***/
    queryString(): DataElement;
    /***
     * Detailed information about any query parameters needed by this method. Mutually exclusive with queryString.
     ***/
    queryParameters(): DataElement[];
    /***
     * Detailed information about any request headers needed by this method.
     ***/
    headers(): DataElement[];
    /***
     * Some methods admit request bodies, which are described by this property.
     ***/
    body(): DataElement[];
    /***
     * A list of the traits to apply to this method. See [[raml-10-spec-applying-resource-types-and-traits|Applying Resource Types and Traits]] section.
     ***/
    is(): TraitRef[];
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * The security schemes that apply to this method
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * For methods of Resources returns parent resource. For methods of ResourceTypes returns undefined Opt.
     ***/
    parentResource(): Opt<Resource>;
    /***
     * Api owning the resource as a sibling
     ***/
    ownerApi(): Api;
    /***
     * // For methods of Resources: `{parent Resource relative path} {methodName}`.
     * // For methods of ResourceTypes: `{parent ResourceType name} {methodName}`.
     * // For other methods throws Exception.
     ***/
    methodId(): string;
}
export interface Resource extends ResourceBase {
    signature(): SchemaString;
    /***
     * Relative URL of this resource from the parent resource
     ***/
    relativeUri(): RelativeUri;
    /***
     * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
     ***/
    resources(): Resource[];
    /***
     * An alternate, human-friendly name for the resource.
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the resource.
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Path relative to API root
     ***/
    completeRelativeUri(): string;
    /***
     * baseUri of owning Api concatenated with completeRelativeUri
     ***/
    absoluteUri(): string;
    /***
     * Parent resource for non top level resources
     ***/
    parentResource(): Opt<Resource>;
    /***
     * Get child resource by its relative path
     ***/
    getChildResource(relPath: string): Opt<Resource>;
    /***
     * Get child method by its name
     ***/
    getChildMethod(method: string): Method[];
    /***
     * Api owning the resource as a sibling
     ***/
    ownerApi(): Api;
    /***
     * Retrieve all uri parameters regardless of whether they are described in `uriParameters` or not
     * //
     ***/
    allUriParameters(): DataElement[];
    /***
     * Retrieve all absolute uri parameters regardless of whether they are described in
     * //`baseUriParameters` and `uriParameters` or not
     ***/
    absoluteUriParameters(): DataElement[];
}
export declare class ResourceImpl extends ResourceBaseImpl implements Resource {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    signature(): SchemaString;
    /***
     * Relative URL of this resource from the parent resource
     ***/
    relativeUri(): RelativeUri;
    /***
     * A nested resource is identified as any property whose name begins with a slash ("/") and is therefore treated as a relative URI.
     ***/
    resources(): Resource[];
    /***
     * An alternate, human-friendly name for the resource.
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): ResourceImpl;
    /***
     * A longer, human-friendly description of the resource.
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Path relative to API root
     ***/
    completeRelativeUri(): string;
    /***
     * baseUri of owning Api concatenated with completeRelativeUri
     ***/
    absoluteUri(): string;
    /***
     * Parent resource for non top level resources
     ***/
    parentResource(): Opt<Resource>;
    /***
     * Get child resource by its relative path
     ***/
    getChildResource(relPath: string): Opt<Resource>;
    /***
     * Get child method by its name
     ***/
    getChildMethod(method: string): Method[];
    /***
     * Api owning the resource as a sibling
     ***/
    ownerApi(): Api;
    /***
     * Retrieve all uri parameters regardless of whether they are described in `uriParameters` or not
     * //
     ***/
    allUriParameters(): DataElement[];
    /***
     * Retrieve all absolute uri parameters regardless of whether they are described in
     * //`baseUriParameters` and `uriParameters` or not
     ***/
    absoluteUriParameters(): DataElement[];
}
export interface ResourceType extends ResourceBase {
    /***
     * Name of the resource type
     ***/
    name(): string;
    usage(): string;
    /***
     * You may import library locally here it contents is accessible only inside of this resource type
     ***/
    uses(): Library[];
}
export declare class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Name of the resource type
     ***/
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): ResourceTypeImpl;
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): ResourceTypeImpl;
    /***
     * You may import library locally here it contents is accessible only inside of this resource type
     ***/
    uses(): Library[];
}
export interface AnnotationType extends RAMLLanguageElement {
    /***
     * Name of this annotation type
     ***/
    name(): string;
    /***
     * Instructions on how and when to use this annotation in a RAML spec.
     ***/
    usage(): string;
    /***
     * Declarations of parameters allowed in this annotation type
     ***/
    parameters(): DataElement[];
    /***
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     ***/
    allowMultiple(): boolean;
    /***
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     ***/
    allowedTargets(): AnnotationTarget[];
    /***
     * An alternate, human-friendly name for the annotation
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the annotation
     ***/
    description(): MarkdownString;
}
export declare class AnnotationTypeImpl extends RAMLLanguageElementImpl implements AnnotationType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Name of this annotation type
     ***/
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): AnnotationTypeImpl;
    /***
     * Instructions on how and when to use this annotation in a RAML spec.
     ***/
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): AnnotationTypeImpl;
    /***
     * Declarations of parameters allowed in this annotation type
     ***/
    parameters(): DataElement[];
    /***
     * Whether multiple instances of annotations of this type may be applied simultaneously at the same location
     ***/
    allowMultiple(): boolean;
    /***
     * Set allowMultiple value
     ***/
    setAllowMultiple(param: boolean): AnnotationTypeImpl;
    /***
     * Restrictions on where annotations of this type can be applied. If this property is specified, annotations of this type may only be applied on a property corresponding to one of the target names specified as the value of this property.
     ***/
    allowedTargets(): AnnotationTarget[];
    /***
     * An alternate, human-friendly name for the annotation
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): AnnotationTypeImpl;
    /***
     * A longer, human-friendly description of the annotation
     ***/
    description(): MarkdownString;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface SecuritySchema extends RAMLLanguageElement {
    name(): string;
    /***
     * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
     ***/
    "type"(): string;
    /***
     * The description MAY be used to describe a securityScheme.
     ***/
    description(): MarkdownString;
    /***
     * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes.
     * Including the security scheme description completes an API documentation.
     ***/
    describedBy(): SecuritySchemaPart;
    /***
     * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
     ***/
    settings(): SecuritySchemaSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class SecuritySchemaImpl extends RAMLLanguageElementImpl implements SecuritySchema {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): SecuritySchemaImpl;
    /***
     * The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them.
     ***/
    "type"(): string;
    /***
     * Set type value
     ***/
    setType(param: string): SecuritySchemaImpl;
    /***
     * The description MAY be used to describe a securityScheme.
     ***/
    description(): MarkdownString;
    /***
     * A description of the request components related to Security that are determined by the scheme: the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD describe these properties of security schemes.
     * Including the security scheme description completes an API documentation.
     ***/
    describedBy(): SecuritySchemaPart;
    /***
     * The settings attribute MAY be used to provide security scheme-specific information. The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, and more.
     ***/
    settings(): SecuritySchemaSettings;
}
export interface SecuritySchemaSettings extends BasicNode {
}
export declare class SecuritySchemaSettingsImpl extends BasicNodeImpl implements SecuritySchemaSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface OAuth1SecuritySchemeSettings extends SecuritySchemaSettings {
    /***
     * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
     ***/
    requestTokenUri(): FixedUri;
    /***
     * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
     ***/
    authorizationUri(): FixedUri;
    /***
     * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
     ***/
    tokenCredentialsUri(): FixedUri;
    signatures(): string[];
}
export declare class OAuth1SecuritySchemeSettingsImpl extends SecuritySchemaSettingsImpl implements OAuth1SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1
     ***/
    requestTokenUri(): FixedUri;
    /***
     * The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2
     ***/
    authorizationUri(): FixedUri;
    /***
     * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
     ***/
    tokenCredentialsUri(): FixedUri;
    signatures(): string[];
    /***
     * Set signatures value
     ***/
    setSignatures(param: string): OAuth1SecuritySchemeSettingsImpl;
}
export interface OAuth2SecuritySchemeSettings extends SecuritySchemaSettings {
    /***
     * The URI of the Token Endpoint as defined in RFC6749 [RFC6748] Section 3.2. Not required forby implicit grant type.
     ***/
    accessTokenUri(): FixedUri;
    /***
     * The URI of the Authorization Endpoint as defined in RFC6749 [RFC6748] Section 3.1. Required forby authorization_code and implicit grant types.
     ***/
    authorizationUri(): FixedUri;
    authorizationGrants(): string[];
    /***
     * A list of scopes supported by the security scheme as defined in RFC6749 [RFC6749] Section 3.3
     ***/
    scopes(): string[];
}
export declare class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemaSettingsImpl implements OAuth2SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * The URI of the Token Endpoint as defined in RFC6749 [RFC6748] Section 3.2. Not required forby implicit grant type.
     ***/
    accessTokenUri(): FixedUri;
    /***
     * The URI of the Authorization Endpoint as defined in RFC6749 [RFC6748] Section 3.1. Required forby authorization_code and implicit grant types.
     ***/
    authorizationUri(): FixedUri;
    authorizationGrants(): string[];
    /***
     * Set authorizationGrants value
     ***/
    setAuthorizationGrants(param: string): OAuth2SecuritySchemeSettingsImpl;
    /***
     * A list of scopes supported by the security scheme as defined in RFC6749 [RFC6749] Section 3.3
     ***/
    scopes(): string[];
    /***
     * Set scopes value
     ***/
    setScopes(param: string): OAuth2SecuritySchemeSettingsImpl;
}
export interface PassThroughSettings extends SecuritySchemaSettings {
    queryParameterName(): string;
    headerName(): string;
}
export declare class PassThroughSettingsImpl extends SecuritySchemaSettingsImpl implements PassThroughSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    queryParameterName(): string;
    /***
     * Set queryParameterName value
     ***/
    setQueryParameterName(param: string): PassThroughSettingsImpl;
    headerName(): string;
    /***
     * Set headerName value
     ***/
    setHeaderName(param: string): PassThroughSettingsImpl;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface Oath2 extends SecuritySchema {
    settings(): OAuth2SecuritySchemeSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class Oath2Impl extends SecuritySchemaImpl implements Oath2 {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    settings(): OAuth2SecuritySchemeSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface Oath1 extends SecuritySchema {
    settings(): OAuth1SecuritySchemeSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class Oath1Impl extends SecuritySchemaImpl implements Oath1 {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    settings(): OAuth1SecuritySchemeSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface PassThrough extends SecuritySchema {
    settings(): PassThroughSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class PassThroughImpl extends SecuritySchemaImpl implements PassThrough {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    settings(): PassThroughSettings;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface Basic extends SecuritySchema {
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class BasicImpl extends SecuritySchemaImpl implements Basic {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface Digest extends SecuritySchema {
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class DigestImpl extends SecuritySchemaImpl implements Digest {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
/***
 * Declares globally referable security schema definition
 ***/
export interface Custom extends SecuritySchema {
}
/***
 * Declares globally referable security schema definition
 ***/
export declare class CustomImpl extends SecuritySchemaImpl implements Custom {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
}
export interface SecuritySchemaPart extends MethodBase {
    /***
     * Headers that allowed at this position
     ***/
    headers(): DataElement[];
    /***
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     ***/
    queryParameters(): DataElement[];
    /***
     * Specifies the query string, used by the schema in order to authorize the request. Mutually exclusive with queryParameters.
     ***/
    queryString(): DataElement;
    /***
     * Optional array of responses, describing the possible responses that could be sent. See [[raml-10-spec-responses|Responses]] section.
     ***/
    responses(): Response[];
    /***
     * Instantiation of applyed traits
     ***/
    is(): TraitRef[];
    /***
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * An alternate, human-friendly name for the security scheme part
     ***/
    displayName(): string;
    /***
     * A longer, human-friendly description of the security scheme part
     ***/
    description(): MarkdownString;
    /***
     * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name. See [[raml-10-spec-annotations|the section on annotations]].
     ***/
    annotations(): AnnotationRef[];
}
export declare class SecuritySchemaPartImpl extends MethodBaseImpl implements SecuritySchemaPart {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Headers that allowed at this position
     ***/
    headers(): DataElement[];
    /***
     * An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query string, the query string MUST be defined by the queryParameters property
     ***/
    queryParameters(): DataElement[];
    /***
     * Specifies the query string, used by the schema in order to authorize the request. Mutually exclusive with queryParameters.
     ***/
    queryString(): DataElement;
    /***
     * Optional array of responses, describing the possible responses that could be sent. See [[raml-10-spec-responses|Responses]] section.
     ***/
    responses(): Response[];
    /***
     * Instantiation of applyed traits
     ***/
    is(): TraitRef[];
    /***
     * securityScheme may also be applied to a resource by using the securedBy key, which is equivalent to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes or traits property for that resource.
     * To indicate that the method may be called without applying any securityScheme, the method may be annotated with the null securityScheme.
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * An alternate, human-friendly name for the security scheme part
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): SecuritySchemaPartImpl;
    /***
     * A longer, human-friendly description of the security scheme part
     ***/
    description(): MarkdownString;
    /***
     * Annotations to be applied to this security scheme part. Annotations are any property whose key begins with "(" and ends with ")" and whose name (the part between the beginning and ending parentheses) is a declared annotation name. See [[raml-10-spec-annotations|the section on annotations]].
     ***/
    annotations(): AnnotationRef[];
}
export interface OLibrary extends RAMLLanguageElement {
    name(): string;
    /***
     * Alias for the types property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schemas(): GlobalSchema[];
    /***
     * Declarations of (data) types for use within this API
     ***/
    types(): DataElement[];
    /***
     * Declarations of traits for use within this API
     ***/
    traits(): Trait[];
    /***
     * Declarations of resource types for use within this API
     ***/
    resourceTypes(): ResourceType[];
    /***
     * Declarations of annotation types for use by annotations
     ***/
    annotationTypes(): AnnotationType[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Declarations of security schemes for use within this API.
     ***/
    securitySchemes(): SecuritySchema[];
    /***
     * Importing libraries
     ***/
    uses(): Library[];
}
export declare class OLibraryImpl extends RAMLLanguageElementImpl implements OLibrary {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): OLibraryImpl;
    /***
     * Alias for the types property, for compatibility with RAML 0.8. Deprecated - may be removed in a future RAML version.
     ***/
    schemas(): GlobalSchema[];
    /***
     * Declarations of (data) types for use within this API
     ***/
    types(): DataElement[];
    /***
     * Declarations of traits for use within this API
     ***/
    traits(): Trait[];
    /***
     * Declarations of resource types for use within this API
     ***/
    resourceTypes(): ResourceType[];
    /***
     * Declarations of annotation types for use by annotations
     ***/
    annotationTypes(): AnnotationType[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Declarations of security schemes for use within this API.
     ***/
    securitySchemes(): SecuritySchema[];
    /***
     * Importing libraries
     ***/
    uses(): Library[];
}
export interface Api extends OLibrary {
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
    /***
     * The version of the API, e.g. "v1"
     ***/
    version(): string;
    /***
     * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
     ***/
    baseUri(): FullUriTemplate;
    /***
     * Named parameters used in the baseUri (template)
     ***/
    baseUriParameters(): DataElement[];
    /***
     * The protocols supported by the API
     ***/
    protocols(): string[];
    /***
     * The default media type to use for request and response bodies (payloads), e.g. "application/json"
     ***/
    mediaType(): MimeType;
    /***
     * The security schemes that apply to every resource and method in the API
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
     ***/
    resources(): Resource[];
    /***
     * Additional overall documentation for the API
     ***/
    documentation(): DocumentationItem[];
    /***
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     ***/
    displayName(): string;
    name(): string;
    /***
     * A longer, human-friendly description of the API
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Retrieve all traits including those defined in libraries
     ***/
    allTraits(): Trait[];
    /***
     * Retrieve all resource types including those defined in libraries
     ***/
    allResourceTypes(): ResourceType[];
    /***
     * Get child resource by its relative path
     ***/
    getChildResource(relPath: string): Opt<Resource>;
    /***
     * Retrieve all resources ofthe Api
     ***/
    allResources(): Resource[];
    /***
     * Retrieve all base uri parameters regardless of whether they are described in `baseUriParameters` or not
     * //
     ***/
    allBaseUriParameters(): DataElement[];
}
export declare class ApiImpl extends OLibraryImpl implements Api {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
    /***
     * Set title value
     ***/
    setTitle(param: string): ApiImpl;
    /***
     * The version of the API, e.g. "v1"
     ***/
    version(): string;
    /***
     * Set version value
     ***/
    setVersion(param: string): ApiImpl;
    /***
     * A URI that's to be used as the base of all the resources' URIs. Often used as the base of the URL of each resource, containing the location of the API. Can be a template URI.
     ***/
    baseUri(): FullUriTemplate;
    /***
     * Named parameters used in the baseUri (template)
     ***/
    baseUriParameters(): DataElement[];
    /***
     * The protocols supported by the API
     ***/
    protocols(): string[];
    /***
     * Set protocols value
     ***/
    setProtocols(param: string): ApiImpl;
    /***
     * The default media type to use for request and response bodies (payloads), e.g. "application/json"
     ***/
    mediaType(): MimeType;
    /***
     * The security schemes that apply to every resource and method in the API
     ***/
    securedBy(): SecuritySchemaRef[];
    /***
     * The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc
     ***/
    resources(): Resource[];
    /***
     * Additional overall documentation for the API
     ***/
    documentation(): DocumentationItem[];
    /***
     * The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. If displayName is not specified, it defaults to the element's key (the name of the property itself).
     ***/
    displayName(): string;
    /***
     * Set displayName value
     ***/
    setDisplayName(param: string): ApiImpl;
    name(): string;
    /***
     * Set name value
     ***/
    setName(param: string): ApiImpl;
    /***
     * A longer, human-friendly description of the API
     ***/
    description(): MarkdownString;
    /***
     * Most of RAML model elements may have attached annotations decribing additional meta data about this element
     ***/
    annotations(): AnnotationRef[];
    /***
     * Security schemas types declarations
     ***/
    securitySchemaTypes(): SecuritySchemaType[];
    /***
     * Retrieve all traits including those defined in libraries
     ***/
    allTraits(): Trait[];
    /***
     * Retrieve all resource types including those defined in libraries
     ***/
    allResourceTypes(): ResourceType[];
    /***
     * Get child resource by its relative path
     ***/
    getChildResource(relPath: string): Opt<Resource>;
    /***
     * Retrieve all resources ofthe Api
     ***/
    allResources(): Resource[];
    /***
     * Retrieve all base uri parameters regardless of whether they are described in `baseUriParameters` or not
     * //
     ***/
    allBaseUriParameters(): DataElement[];
}
export interface Overlay extends Api {
    /***
     * contains description of why overlay exist
     ***/
    usage(): string;
    masterRef(): string;
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
}
export declare class OverlayImpl extends ApiImpl implements Overlay {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * contains description of why overlay exist
     ***/
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): OverlayImpl;
    masterRef(): string;
    /***
     * Set masterRef value
     ***/
    setMasterRef(param: string): OverlayImpl;
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
    /***
     * Set title value
     ***/
    setTitle(param: string): OverlayImpl;
}
export interface Extension extends Api {
    /***
     * contains description of why extension exist
     ***/
    usage(): string;
    masterRef(): string;
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
}
export declare class ExtensionImpl extends ApiImpl implements Extension {
    protected nodeOrKey: hl.IHighLevelNode | string;
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /***
     * @return Actual name of instance class
     ***/
    wrapperClassName(): string;
    /***
     * contains description of why extension exist
     ***/
    usage(): string;
    /***
     * Set usage value
     ***/
    setUsage(param: string): ExtensionImpl;
    masterRef(): string;
    /***
     * Set masterRef value
     ***/
    setMasterRef(param: string): ExtensionImpl;
    /***
     * Short plain-text label for the API
     ***/
    title(): string;
    /***
     * Set title value
     ***/
    setTitle(param: string): ExtensionImpl;
}
