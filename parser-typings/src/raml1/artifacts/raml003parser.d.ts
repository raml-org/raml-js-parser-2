import hl = require("../highLevelAST");
import core = require("../parserCore");
import Opt = require("../../Opt");
export interface BasicNode extends core.BasicSuperNode {
    parent(): BasicNode;
    highLevel(): hl.IHighLevelNode;
}
export declare class BasicNodeImpl extends core.BasicSuperNodeImpl implements BasicNode {
    constructor(node: hl.IHighLevelNode);
    wrapperClassName(): string;
    parent(): BasicNode;
}
export interface RAMLLanguageElement extends BasicNode {
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export declare class RAMLLanguageElementImpl extends BasicNodeImpl implements RAMLLanguageElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): RAMLLanguageElementImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export interface ValueType extends core.AbstractWrapperNode {
    /**
     *
     **/
    value(): string;
    /**
     *
     **/
    highLevel(): hl.IAttribute;
}
export declare class ValueTypeImpl implements ValueType {
    protected attr: hl.IAttribute;
    /**
     *
     **/
    constructor(attr: hl.IAttribute);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    value(): string;
    /**
     *
     **/
    highLevel(): hl.IAttribute;
}
export interface NumberType extends ValueType {
}
export declare class NumberTypeImpl extends ValueTypeImpl implements NumberType {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface BooleanType extends ValueType {
}
export declare class BooleanTypeImpl extends ValueTypeImpl implements BooleanType {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface Reference extends ValueType {
}
export declare class ReferenceImpl extends ValueTypeImpl implements Reference {
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    value(): string;
}
export interface ResourceTypeRef extends Reference {
}
export declare class ResourceTypeRefImpl extends ReferenceImpl implements ResourceTypeRef {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface TraitRef extends Reference {
}
export declare class TraitRefImpl extends ReferenceImpl implements TraitRef {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface SecuritySchemaRef extends Reference {
}
export declare class SecuritySchemaRefImpl extends ReferenceImpl implements SecuritySchemaRef {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface AnnotationRef extends Reference {
}
export declare class AnnotationRefImpl extends ReferenceImpl implements AnnotationRef {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface DataElementRef extends Reference {
}
export declare class DataElementRefImpl extends ReferenceImpl implements DataElementRef {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ramlexpression extends ValueType {
}
export declare class ramlexpressionImpl extends ValueTypeImpl implements ramlexpression {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface AnnotationTarget extends ValueType {
}
export declare class AnnotationTargetImpl extends ValueTypeImpl implements AnnotationTarget {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface pointer extends ValueType {
}
export declare class pointerImpl extends ValueTypeImpl implements pointer {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface StringType extends ValueType {
}
export declare class StringTypeImpl extends ValueTypeImpl implements StringType {
    protected attr: hl.IAttribute;
    /**
     *
     **/
    constructor(attr: hl.IAttribute);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface UriTemplate extends StringType {
}
export declare class UriTemplateImpl extends StringTypeImpl implements UriTemplate {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface RelativeUri extends UriTemplate {
}
export declare class RelativeUriImpl extends UriTemplateImpl implements RelativeUri {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface FullUriTemplate extends UriTemplate {
}
export declare class FullUriTemplateImpl extends UriTemplateImpl implements FullUriTemplate {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface StatusCode extends StringType {
}
export declare class StatusCodeImpl extends StringTypeImpl implements StatusCode {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface FixedUri extends StringType {
}
export declare class FixedUriImpl extends StringTypeImpl implements FixedUri {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ContentType extends StringType {
}
export declare class ContentTypeImpl extends StringTypeImpl implements ContentType {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ValidityExpression extends StringType {
}
export declare class ValidityExpressionImpl extends StringTypeImpl implements ValidityExpression {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface DateFormatSpec extends StringType {
}
export declare class DateFormatSpecImpl extends StringTypeImpl implements DateFormatSpec {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface FunctionalInterface extends StringType {
}
export declare class FunctionalInterfaceImpl extends StringTypeImpl implements FunctionalInterface {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface SchemaString extends StringType {
}
export declare class SchemaStringImpl extends StringTypeImpl implements SchemaString {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface JSonSchemaString extends SchemaString {
}
export declare class JSonSchemaStringImpl extends SchemaStringImpl implements JSonSchemaString {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface XMLSchemaString extends SchemaString {
}
export declare class XMLSchemaStringImpl extends SchemaStringImpl implements XMLSchemaString {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ExampleString extends StringType {
}
export declare class ExampleStringImpl extends StringTypeImpl implements ExampleString {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ScriptingHook extends StringType {
}
export declare class ScriptingHookImpl extends StringTypeImpl implements ScriptingHook {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface SecuritySchemaHookScript extends ScriptingHook {
}
export declare class SecuritySchemaHookScriptImpl extends ScriptingHookImpl implements SecuritySchemaHookScript {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface RAMLPointer extends StringType {
}
export declare class RAMLPointerImpl extends StringTypeImpl implements RAMLPointer {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface RAMLSelector extends StringType {
}
export declare class RAMLSelectorImpl extends StringTypeImpl implements RAMLSelector {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface MimeType extends StringType {
}
export declare class MimeTypeImpl extends StringTypeImpl implements MimeType {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface MarkdownString extends StringType {
}
export declare class MarkdownStringImpl extends StringTypeImpl implements MarkdownString {
    protected attr: hl.IAttribute;
    /**
     *
     **/
    constructor(attr: hl.IAttribute);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface DocumentationItem extends RAMLLanguageElement {
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    content(): MarkdownString;
}
export declare class DocumentationItemImpl extends RAMLLanguageElementImpl implements DocumentationItem {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    setTitle(param: string): DocumentationItemImpl;
    /**
     *
     **/
    content(): MarkdownString;
}
export interface ScriptSpec extends RAMLLanguageElement {
    /**
     *
     **/
    language(): string;
    /**
     *
     **/
    content(): string;
}
export declare class ScriptSpecImpl extends RAMLLanguageElementImpl implements ScriptSpec {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    language(): string;
    /**
     *
     **/
    setLanguage(param: string): ScriptSpecImpl;
    /**
     *
     **/
    content(): string;
    /**
     *
     **/
    setContent(param: string): ScriptSpecImpl;
}
export interface ApiDescription extends RAMLLanguageElement {
    /**
     *
     **/
    apiFiles(): Api[];
    /**
     *
     **/
    script(): ScriptSpec[];
    /**
     *
     **/
    "type"(): string;
}
export declare class ApiDescriptionImpl extends RAMLLanguageElementImpl implements ApiDescription {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    apiFiles(): Api[];
    /**
     *
     **/
    script(): ScriptSpec[];
    /**
     *
     **/
    "type"(): string;
    /**
     *
     **/
    setType(param: string): ApiDescriptionImpl;
}
export interface CallbackAPIDescription extends ApiDescription {
    /**
     *
     **/
    callbackFor(): Api;
}
export declare class CallbackAPIDescriptionImpl extends ApiDescriptionImpl implements CallbackAPIDescription {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    callbackFor(): Api;
}
export interface RAMLProject extends RAMLLanguageElement {
    /**
     *
     **/
    relatedProjects(): RAMLProject[];
    /**
     *
     **/
    declaredApis(): ApiDescription[];
    /**
     *
     **/
    license(): string;
    /**
     *
     **/
    overview(): string;
    /**
     *
     **/
    url(): string;
}
export declare class RAMLProjectImpl extends RAMLLanguageElementImpl implements RAMLProject {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    relatedProjects(): RAMLProject[];
    /**
     *
     **/
    declaredApis(): ApiDescription[];
    /**
     *
     **/
    license(): string;
    /**
     *
     **/
    setLicense(param: string): RAMLProjectImpl;
    /**
     *
     **/
    overview(): string;
    /**
     *
     **/
    setOverview(param: string): RAMLProjectImpl;
    /**
     *
     **/
    url(): string;
    /**
     *
     **/
    setUrl(param: string): RAMLProjectImpl;
}
export interface SecuritySchemaType extends RAMLLanguageElement {
    /**
     *
     **/
    requiredSettings(): DataElement[];
    /**
     *
     **/
    describedBy(): SecuritySchemaPart;
}
export declare class SecuritySchemaTypeImpl extends RAMLLanguageElementImpl implements SecuritySchemaType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    requiredSettings(): DataElement[];
    /**
     *
     **/
    describedBy(): SecuritySchemaPart;
}
export interface DataElement extends RAMLLanguageElement {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    xml(): XMLInfo;
    /**
     *
     **/
    facets(): DataElement[];
    /**
     *
     **/
    schema(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    "type"(): string[];
    /**
     *
     **/
    location(): ModelLocation;
    /**
     *
     **/
    locationKind(): LocationKind;
    /**
     *
     **/
    "default"(): string;
    /**
     *
     **/
    example(): string;
    /**
     *
     **/
    examples(): ExampleSpec[];
    /**
     *
     **/
    repeat(): boolean;
    /**
     *
     **/
    required(): boolean;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export declare class DataElementImpl extends RAMLLanguageElementImpl implements DataElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): DataElementImpl;
    /**
     *
     **/
    xml(): XMLInfo;
    /**
     *
     **/
    facets(): DataElement[];
    /**
     *
     **/
    schema(): string;
    /**
     *
     **/
    setSchema(param: string): DataElementImpl;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): DataElementImpl;
    /**
     *
     **/
    "type"(): string[];
    /**
     *
     **/
    setType(param: string): DataElementImpl;
    /**
     *
     **/
    location(): ModelLocation;
    /**
     *
     **/
    locationKind(): LocationKind;
    /**
     *
     **/
    "default"(): string;
    /**
     *
     **/
    setDefault(param: string): DataElementImpl;
    /**
     *
     **/
    example(): string;
    /**
     *
     **/
    setExample(param: string): DataElementImpl;
    /**
     *
     **/
    examples(): ExampleSpec[];
    /**
     *
     **/
    repeat(): boolean;
    /**
     *
     **/
    setRepeat(param: boolean): DataElementImpl;
    /**
     *
     **/
    required(): boolean;
    /**
     *
     **/
    setRequired(param: boolean): DataElementImpl;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): DataElementImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export interface XMLInfo extends BasicNode {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    namespace(): string;
    /**
     *
     **/
    prefix(): string;
    /**
     *
     **/
    attribute(): boolean;
    /**
     *
     **/
    wrapped(): boolean;
}
export declare class XMLInfoImpl extends BasicNodeImpl implements XMLInfo {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): XMLInfoImpl;
    /**
     *
     **/
    namespace(): string;
    /**
     *
     **/
    setNamespace(param: string): XMLInfoImpl;
    /**
     *
     **/
    prefix(): string;
    /**
     *
     **/
    setPrefix(param: string): XMLInfoImpl;
    /**
     *
     **/
    attribute(): boolean;
    /**
     *
     **/
    setAttribute(param: boolean): XMLInfoImpl;
    /**
     *
     **/
    wrapped(): boolean;
    /**
     *
     **/
    setWrapped(param: boolean): XMLInfoImpl;
}
export interface ModelLocation extends core.AbstractWrapperNode {
}
export declare class ModelLocationImpl implements ModelLocation {
    protected attr: hl.IAttribute;
    /**
     *
     **/
    constructor(attr: hl.IAttribute);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface LocationKind extends core.AbstractWrapperNode {
}
export declare class LocationKindImpl implements LocationKind {
    protected attr: hl.IAttribute;
    /**
     *
     **/
    constructor(attr: hl.IAttribute);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ExampleSpec extends RAMLLanguageElement {
    /**
     *
     **/
    content(): string;
    /**
     *
     **/
    strict(): boolean;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export declare class ExampleSpecImpl extends RAMLLanguageElementImpl implements ExampleSpec {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    content(): string;
    /**
     *
     **/
    setContent(param: string): ExampleSpecImpl;
    /**
     *
     **/
    strict(): boolean;
    /**
     *
     **/
    setStrict(param: boolean): ExampleSpecImpl;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): ExampleSpecImpl;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): ExampleSpecImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export interface FileParameter extends DataElement {
    /**
     *
     **/
    fileTypes(): ContentType[];
    /**
     *
     **/
    minLength(): number;
    /**
     *
     **/
    maxLength(): number;
}
export declare class FileParameterImpl extends DataElementImpl implements FileParameter {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    fileTypes(): ContentType[];
    /**
     *
     **/
    minLength(): number;
    /**
     *
     **/
    setMinLength(param: number): FileParameterImpl;
    /**
     *
     **/
    maxLength(): number;
    /**
     *
     **/
    setMaxLength(param: number): FileParameterImpl;
}
export interface ArrayField extends DataElement {
    /**
     *
     **/
    uniqueItems(): boolean;
    /**
     *
     **/
    items(): DataElement;
    /**
     *
     **/
    minItems(): number;
    /**
     *
     **/
    maxItems(): number;
}
export declare class ArrayFieldImpl extends DataElementImpl implements ArrayField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    uniqueItems(): boolean;
    /**
     *
     **/
    setUniqueItems(param: boolean): ArrayFieldImpl;
    /**
     *
     **/
    items(): DataElement;
    /**
     *
     **/
    minItems(): number;
    /**
     *
     **/
    setMinItems(param: number): ArrayFieldImpl;
    /**
     *
     **/
    maxItems(): number;
    /**
     *
     **/
    setMaxItems(param: number): ArrayFieldImpl;
}
export interface UnionField extends DataElement {
    /**
     *
     **/
    discriminator(): string;
}
export declare class UnionFieldImpl extends DataElementImpl implements UnionField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    discriminator(): string;
    /**
     *
     **/
    setDiscriminator(param: string): UnionFieldImpl;
}
export interface ObjectField extends DataElement {
    /**
     *
     **/
    properties(): DataElement[];
    /**
     *
     **/
    minProperties(): number;
    /**
     *
     **/
    maxProperties(): number;
    /**
     *
     **/
    additionalProperties(): DataElement;
    /**
     *
     **/
    patternProperties(): DataElement[];
    /**
     *
     **/
    discriminator(): pointer;
    /**
     *
     **/
    discriminatorValue(): string;
}
export declare class ObjectFieldImpl extends DataElementImpl implements ObjectField {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    properties(): DataElement[];
    /**
     *
     **/
    minProperties(): number;
    /**
     *
     **/
    setMinProperties(param: number): ObjectFieldImpl;
    /**
     *
     **/
    maxProperties(): number;
    /**
     *
     **/
    setMaxProperties(param: number): ObjectFieldImpl;
    /**
     *
     **/
    additionalProperties(): DataElement;
    /**
     *
     **/
    patternProperties(): DataElement[];
    /**
     *
     **/
    discriminator(): pointer;
    /**
     *
     **/
    discriminatorValue(): string;
    /**
     *
     **/
    setDiscriminatorValue(param: string): ObjectFieldImpl;
}
export interface StrElement extends DataElement {
    /**
     *
     **/
    pattern(): string;
    /**
     *
     **/
    minLength(): number;
    /**
     *
     **/
    maxLength(): number;
    /**
     *
     **/
    enum(): string[];
}
export declare class StrElementImpl extends DataElementImpl implements StrElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    pattern(): string;
    /**
     *
     **/
    setPattern(param: string): StrElementImpl;
    /**
     *
     **/
    minLength(): number;
    /**
     *
     **/
    setMinLength(param: number): StrElementImpl;
    /**
     *
     **/
    maxLength(): number;
    /**
     *
     **/
    setMaxLength(param: number): StrElementImpl;
    /**
     *
     **/
    enum(): string[];
    /**
     *
     **/
    setEnum(param: string): StrElementImpl;
}
export interface BooleanElement extends DataElement {
}
export declare class BooleanElementImpl extends DataElementImpl implements BooleanElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ValueElement extends DataElement {
}
export declare class ValueElementImpl extends DataElementImpl implements ValueElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface NumberElement extends DataElement {
    /**
     *
     **/
    minimum(): number;
    /**
     *
     **/
    maximum(): number;
    /**
     *
     **/
    enum(): string[];
    /**
     *
     **/
    format(): string;
    /**
     *
     **/
    multipleOf(): number;
}
export declare class NumberElementImpl extends DataElementImpl implements NumberElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    minimum(): number;
    /**
     *
     **/
    setMinimum(param: number): NumberElementImpl;
    /**
     *
     **/
    maximum(): number;
    /**
     *
     **/
    setMaximum(param: number): NumberElementImpl;
    /**
     *
     **/
    enum(): string[];
    /**
     *
     **/
    setEnum(param: string): NumberElementImpl;
    /**
     *
     **/
    format(): string;
    /**
     *
     **/
    setFormat(param: string): NumberElementImpl;
    /**
     *
     **/
    multipleOf(): number;
    /**
     *
     **/
    setMultipleOf(param: number): NumberElementImpl;
}
export interface IntegerElement extends NumberElement {
    /**
     *
     **/
    format(): string;
}
export declare class IntegerElementImpl extends NumberElementImpl implements IntegerElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    format(): string;
    /**
     *
     **/
    setFormat(param: string): IntegerElementImpl;
}
export interface RAMLPointerElement extends DataElement {
    /**
     *
     **/
    target(): RAMLSelector;
}
export declare class RAMLPointerElementImpl extends DataElementImpl implements RAMLPointerElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    target(): RAMLSelector;
}
export interface RAMLExpression extends DataElement {
}
export declare class RAMLExpressionImpl extends DataElementImpl implements RAMLExpression {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ScriptHookElement extends DataElement {
    /**
     *
     **/
    declaredIn(): string;
    /**
     *
     **/
    interfaceName(): string;
}
export declare class ScriptHookElementImpl extends DataElementImpl implements ScriptHookElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    declaredIn(): string;
    /**
     *
     **/
    setDeclaredIn(param: string): ScriptHookElementImpl;
    /**
     *
     **/
    interfaceName(): string;
    /**
     *
     **/
    setInterfaceName(param: string): ScriptHookElementImpl;
}
export interface SchemaElement extends DataElement {
}
export declare class SchemaElementImpl extends DataElementImpl implements SchemaElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface DateElement extends DataElement {
    /**
     *
     **/
    dateFormat(): DateFormatSpec;
}
export declare class DateElementImpl extends DataElementImpl implements DateElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    dateFormat(): DateFormatSpec;
}
export interface HasNormalParameters extends RAMLLanguageElement {
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    queryString(): DataElement;
}
export declare class HasNormalParametersImpl extends RAMLLanguageElementImpl implements HasNormalParameters {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    queryString(): DataElement;
}
export interface MethodBase extends HasNormalParameters {
    /**
     *
     **/
    responses(): Response[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    protocols(): string[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
}
export declare class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    responses(): Response[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    protocols(): string[];
    /**
     *
     **/
    setProtocols(param: string): MethodBaseImpl;
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
}
export interface Response extends RAMLLanguageElement {
    /**
     *
     **/
    code(): StatusCode;
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    isOkRange(): boolean;
}
export declare class ResponseImpl extends RAMLLanguageElementImpl implements Response {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    code(): StatusCode;
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): ResponseImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    isOkRange(): boolean;
}
export interface Trait extends MethodBase {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    uses(): Library[];
}
export declare class TraitImpl extends MethodBaseImpl implements Trait {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): TraitImpl;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): TraitImpl;
    /**
     *
     **/
    uses(): Library[];
}
export interface Library extends BasicNode {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    schemas(): GlobalSchema[];
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    types(): DataElement[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
    /**
     *
     **/
    annotationTypes(): AnnotationType[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    uses(): Library[];
}
export declare class LibraryImpl extends BasicNodeImpl implements Library {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): LibraryImpl;
    /**
     *
     **/
    schemas(): GlobalSchema[];
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): LibraryImpl;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    types(): DataElement[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
    /**
     *
     **/
    annotationTypes(): AnnotationType[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    uses(): Library[];
}
export interface RAMLSimpleElement extends BasicNode {
}
export declare class RAMLSimpleElementImpl extends BasicNodeImpl implements RAMLSimpleElement {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface ImportDeclaration extends RAMLSimpleElement {
    /**
     *
     **/
    key(): string;
    /**
     *
     **/
    value(): Library;
}
export declare class ImportDeclarationImpl extends RAMLSimpleElementImpl implements ImportDeclaration {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    key(): string;
    /**
     *
     **/
    setKey(param: string): ImportDeclarationImpl;
    /**
     *
     **/
    value(): Library;
}
export interface GlobalSchema extends RAMLSimpleElement {
    /**
     *
     **/
    key(): string;
    /**
     *
     **/
    value(): SchemaString;
}
export declare class GlobalSchemaImpl extends RAMLSimpleElementImpl implements GlobalSchema {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    key(): string;
    /**
     *
     **/
    setKey(param: string): GlobalSchemaImpl;
    /**
     *
     **/
    value(): SchemaString;
}
export interface ResourceBase extends RAMLLanguageElement {
    /**
     *
     **/
    methods(): Method[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    "type"(): ResourceTypeRef;
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    uriParameters(): DataElement[];
}
export declare class ResourceBaseImpl extends RAMLLanguageElementImpl implements ResourceBase {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    methods(): Method[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    "type"(): ResourceTypeRef;
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    uriParameters(): DataElement[];
}
export interface Method extends MethodBase {
    /**
     *
     **/
    signature(): SchemaString;
    /**
     *
     **/
    method(): string;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    queryString(): DataElement;
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    parentResource(): Opt<Resource>;
    /**
     *
     **/
    ownerApi(): Api;
    /**
     *
     **/
    methodId(): string;
}
export declare class MethodImpl extends MethodBaseImpl implements Method {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    signature(): SchemaString;
    /**
     *
     **/
    method(): string;
    /**
     *
     **/
    setMethod(param: string): MethodImpl;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): MethodImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    queryString(): DataElement;
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    body(): DataElement[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    parentResource(): Opt<Resource>;
    /**
     *
     **/
    ownerApi(): Api;
    /**
     *
     **/
    methodId(): string;
}
export interface Resource extends ResourceBase {
    /**
     *
     **/
    signature(): SchemaString;
    /**
     *
     **/
    relativeUri(): RelativeUri;
    /**
     *
     **/
    resources(): Resource[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    completeRelativeUri(): string;
    /**
     *
     **/
    absoluteUri(): string;
    /**
     *
     **/
    parentResource(): Opt<Resource>;
    /**
     *
     **/
    getChildResource(relPath: string): Opt<Resource>;
    /**
     *
     **/
    getChildMethod(method: string): Method[];
    /**
     *
     **/
    ownerApi(): Api;
    /**
     *
     **/
    allUriParameters(): DataElement[];
    /**
     *
     **/
    absoluteUriParameters(): DataElement[];
}
export declare class ResourceImpl extends ResourceBaseImpl implements Resource {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    signature(): SchemaString;
    /**
     *
     **/
    relativeUri(): RelativeUri;
    /**
     *
     **/
    resources(): Resource[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): ResourceImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    completeRelativeUri(): string;
    /**
     *
     **/
    absoluteUri(): string;
    /**
     *
     **/
    parentResource(): Opt<Resource>;
    /**
     *
     **/
    getChildResource(relPath: string): Opt<Resource>;
    /**
     *
     **/
    getChildMethod(method: string): Method[];
    /**
     *
     **/
    ownerApi(): Api;
    /**
     *
     **/
    allUriParameters(): DataElement[];
    /**
     *
     **/
    absoluteUriParameters(): DataElement[];
}
export interface ResourceType extends ResourceBase {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    uses(): Library[];
}
export declare class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): ResourceTypeImpl;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): ResourceTypeImpl;
    /**
     *
     **/
    uses(): Library[];
}
export interface AnnotationType extends RAMLLanguageElement {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    parameters(): DataElement[];
    /**
     *
     **/
    allowMultiple(): boolean;
    /**
     *
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
}
export declare class AnnotationTypeImpl extends RAMLLanguageElementImpl implements AnnotationType {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): AnnotationTypeImpl;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): AnnotationTypeImpl;
    /**
     *
     **/
    parameters(): DataElement[];
    /**
     *
     **/
    allowMultiple(): boolean;
    /**
     *
     **/
    setAllowMultiple(param: boolean): AnnotationTypeImpl;
    /**
     *
     **/
    allowedTargets(): AnnotationTarget[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): AnnotationTypeImpl;
    /**
     *
     **/
    description(): MarkdownString;
}
export interface SecuritySchema extends RAMLLanguageElement {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    "type"(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    describedBy(): SecuritySchemaPart;
    /**
     *
     **/
    settings(): SecuritySchemaSettings;
}
export declare class SecuritySchemaImpl extends RAMLLanguageElementImpl implements SecuritySchema {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): SecuritySchemaImpl;
    /**
     *
     **/
    "type"(): string;
    /**
     *
     **/
    setType(param: string): SecuritySchemaImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    describedBy(): SecuritySchemaPart;
    /**
     *
     **/
    settings(): SecuritySchemaSettings;
}
export interface SecuritySchemaSettings extends BasicNode {
}
export declare class SecuritySchemaSettingsImpl extends BasicNodeImpl implements SecuritySchemaSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface OAuth1SecuritySchemeSettings extends SecuritySchemaSettings {
    /**
     *
     **/
    requestTokenUri(): FixedUri;
    /**
     *
     **/
    authorizationUri(): FixedUri;
    /**
     *
     **/
    tokenCredentialsUri(): FixedUri;
    /**
     *
     **/
    signatures(): string[];
}
export declare class OAuth1SecuritySchemeSettingsImpl extends SecuritySchemaSettingsImpl implements OAuth1SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    requestTokenUri(): FixedUri;
    /**
     *
     **/
    authorizationUri(): FixedUri;
    /**
     *
     **/
    tokenCredentialsUri(): FixedUri;
    /**
     *
     **/
    signatures(): string[];
    /**
     *
     **/
    setSignatures(param: string): OAuth1SecuritySchemeSettingsImpl;
}
export interface OAuth2SecuritySchemeSettings extends SecuritySchemaSettings {
    /**
     *
     **/
    accessTokenUri(): FixedUri;
    /**
     *
     **/
    authorizationUri(): FixedUri;
    /**
     *
     **/
    authorizationGrants(): string[];
    /**
     *
     **/
    scopes(): string[];
}
export declare class OAuth2SecuritySchemeSettingsImpl extends SecuritySchemaSettingsImpl implements OAuth2SecuritySchemeSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    accessTokenUri(): FixedUri;
    /**
     *
     **/
    authorizationUri(): FixedUri;
    /**
     *
     **/
    authorizationGrants(): string[];
    /**
     *
     **/
    setAuthorizationGrants(param: string): OAuth2SecuritySchemeSettingsImpl;
    /**
     *
     **/
    scopes(): string[];
    /**
     *
     **/
    setScopes(param: string): OAuth2SecuritySchemeSettingsImpl;
}
export interface PassThroughSettings extends SecuritySchemaSettings {
    /**
     *
     **/
    queryParameterName(): string;
    /**
     *
     **/
    headerName(): string;
}
export declare class PassThroughSettingsImpl extends SecuritySchemaSettingsImpl implements PassThroughSettings {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    queryParameterName(): string;
    /**
     *
     **/
    setQueryParameterName(param: string): PassThroughSettingsImpl;
    /**
     *
     **/
    headerName(): string;
    /**
     *
     **/
    setHeaderName(param: string): PassThroughSettingsImpl;
}
export interface Oath2 extends SecuritySchema {
    /**
     *
     **/
    settings(): OAuth2SecuritySchemeSettings;
}
export declare class Oath2Impl extends SecuritySchemaImpl implements Oath2 {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    settings(): OAuth2SecuritySchemeSettings;
}
export interface Oath1 extends SecuritySchema {
    /**
     *
     **/
    settings(): OAuth1SecuritySchemeSettings;
}
export declare class Oath1Impl extends SecuritySchemaImpl implements Oath1 {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    settings(): OAuth1SecuritySchemeSettings;
}
export interface PassThrough extends SecuritySchema {
    /**
     *
     **/
    settings(): PassThroughSettings;
}
export declare class PassThroughImpl extends SecuritySchemaImpl implements PassThrough {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    settings(): PassThroughSettings;
}
export interface Basic extends SecuritySchema {
}
export declare class BasicImpl extends SecuritySchemaImpl implements Basic {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface Digest extends SecuritySchema {
}
export declare class DigestImpl extends SecuritySchemaImpl implements Digest {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface Custom extends SecuritySchema {
}
export declare class CustomImpl extends SecuritySchemaImpl implements Custom {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface SecuritySchemaPart extends MethodBase {
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    queryString(): DataElement;
    /**
     *
     **/
    responses(): Response[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export declare class SecuritySchemaPartImpl extends MethodBaseImpl implements SecuritySchemaPart {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    headers(): DataElement[];
    /**
     *
     **/
    queryParameters(): DataElement[];
    /**
     *
     **/
    queryString(): DataElement;
    /**
     *
     **/
    responses(): Response[];
    /**
     *
     **/
    is(): TraitRef[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): SecuritySchemaPartImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
}
export interface OLibrary extends RAMLLanguageElement {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    schemas(): GlobalSchema[];
    /**
     *
     **/
    types(): DataElement[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
    /**
     *
     **/
    annotationTypes(): AnnotationType[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    uses(): Library[];
}
export declare class OLibraryImpl extends RAMLLanguageElementImpl implements OLibrary {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): OLibraryImpl;
    /**
     *
     **/
    schemas(): GlobalSchema[];
    /**
     *
     **/
    types(): DataElement[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
    /**
     *
     **/
    annotationTypes(): AnnotationType[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    uses(): Library[];
}
export interface Api extends OLibrary {
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    version(): string;
    /**
     *
     **/
    baseUri(): FullUriTemplate;
    /**
     *
     **/
    baseUriParameters(): DataElement[];
    /**
     *
     **/
    protocols(): string[];
    /**
     *
     **/
    mediaType(): MimeType;
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    resources(): Resource[];
    /**
     *
     **/
    documentation(): DocumentationItem[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    allTraits(): Trait[];
    /**
     *
     **/
    allResourceTypes(): ResourceType[];
    /**
     *
     **/
    getChildResource(relPath: string): Opt<Resource>;
    /**
     *
     **/
    allResources(): Resource[];
    /**
     *
     **/
    allBaseUriParameters(): DataElement[];
}
export declare class ApiImpl extends OLibraryImpl implements Api {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    setTitle(param: string): ApiImpl;
    /**
     *
     **/
    version(): string;
    /**
     *
     **/
    setVersion(param: string): ApiImpl;
    /**
     *
     **/
    baseUri(): FullUriTemplate;
    /**
     *
     **/
    baseUriParameters(): DataElement[];
    /**
     *
     **/
    protocols(): string[];
    /**
     *
     **/
    setProtocols(param: string): ApiImpl;
    /**
     *
     **/
    mediaType(): MimeType;
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    resources(): Resource[];
    /**
     *
     **/
    documentation(): DocumentationItem[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): ApiImpl;
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    setName(param: string): ApiImpl;
    /**
     *
     **/
    description(): MarkdownString;
    /**
     *
     **/
    annotations(): AnnotationRef[];
    /**
     *
     **/
    securitySchemaTypes(): SecuritySchemaType[];
    /**
     *
     **/
    allTraits(): Trait[];
    /**
     *
     **/
    allResourceTypes(): ResourceType[];
    /**
     *
     **/
    getChildResource(relPath: string): Opt<Resource>;
    /**
     *
     **/
    allResources(): Resource[];
    /**
     *
     **/
    allBaseUriParameters(): DataElement[];
}
export interface Overlay extends Api {
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    masterRef(): string;
    /**
     *
     **/
    title(): string;
}
export declare class OverlayImpl extends ApiImpl implements Overlay {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): OverlayImpl;
    /**
     *
     **/
    masterRef(): string;
    /**
     *
     **/
    setMasterRef(param: string): OverlayImpl;
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    setTitle(param: string): OverlayImpl;
}
export interface Extension extends Api {
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    masterRef(): string;
    /**
     *
     **/
    title(): string;
}
export declare class ExtensionImpl extends ApiImpl implements Extension {
    protected nodeOrKey: hl.IHighLevelNode | string;
    /**
     *
     **/
    constructor(nodeOrKey: hl.IHighLevelNode | string);
    /**
     *
     **/
    wrapperClassName(): string;
    /**
     *
     **/
    usage(): string;
    /**
     *
     **/
    setUsage(param: string): ExtensionImpl;
    /**
     *
     **/
    masterRef(): string;
    /**
     *
     **/
    setMasterRef(param: string): ExtensionImpl;
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    setTitle(param: string): ExtensionImpl;
}
