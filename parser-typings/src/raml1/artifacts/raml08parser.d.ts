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
    description(): MarkdownString;
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
    description(): MarkdownString;
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
export interface FixedUri extends StringType {
}
export declare class FixedUriImpl extends StringTypeImpl implements FixedUri {
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
export interface JSONExample extends ExampleString {
}
export declare class JSONExampleImpl extends ExampleStringImpl implements JSONExample {
    /**
     *
     **/
    wrapperClassName(): string;
}
export interface XMLExample extends ExampleString {
}
export declare class XMLExampleImpl extends ExampleStringImpl implements XMLExample {
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
export interface DocumentationItem extends RAMLSimpleElement {
    /**
     *
     **/
    title(): string;
    /**
     *
     **/
    content(): MarkdownString;
}
export declare class DocumentationItemImpl extends RAMLSimpleElementImpl implements DocumentationItem {
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
export interface SecuritySchemaSettings extends RAMLSimpleElement {
}
export declare class SecuritySchemaSettingsImpl extends RAMLSimpleElementImpl implements SecuritySchemaSettings {
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
export interface SecuritySchemaPart extends RAMLSimpleElement {
}
export declare class SecuritySchemaPartImpl extends RAMLSimpleElementImpl implements SecuritySchemaPart {
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
export interface ResourceType extends RAMLLanguageElement {
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
    uriParameters(): Parameter[];
}
export declare class ResourceTypeImpl extends RAMLLanguageElementImpl implements ResourceType {
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
    uriParameters(): Parameter[];
}
export interface HasNormalParameters extends RAMLLanguageElement {
    /**
     *
     **/
    queryParameters(): Parameter[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    headers(): Parameter[];
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
    queryParameters(): Parameter[];
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): HasNormalParametersImpl;
    /**
     *
     **/
    headers(): Parameter[];
}
export interface Parameter extends RAMLLanguageElement {
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
    "type"(): string;
    /**
     *
     **/
    location(): ParameterLocation;
    /**
     *
     **/
    required(): boolean;
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
    repeat(): boolean;
}
export declare class ParameterImpl extends RAMLLanguageElementImpl implements Parameter {
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
    setName(param: string): ParameterImpl;
    /**
     *
     **/
    displayName(): string;
    /**
     *
     **/
    setDisplayName(param: string): ParameterImpl;
    /**
     *
     **/
    "type"(): string;
    /**
     *
     **/
    setType(param: string): ParameterImpl;
    /**
     *
     **/
    location(): ParameterLocation;
    /**
     *
     **/
    required(): boolean;
    /**
     *
     **/
    setRequired(param: boolean): ParameterImpl;
    /**
     *
     **/
    "default"(): string;
    /**
     *
     **/
    setDefault(param: string): ParameterImpl;
    /**
     *
     **/
    example(): string;
    /**
     *
     **/
    setExample(param: string): ParameterImpl;
    /**
     *
     **/
    repeat(): boolean;
    /**
     *
     **/
    setRepeat(param: boolean): ParameterImpl;
}
export interface ParameterLocation extends core.AbstractWrapperNode {
}
export declare class ParameterLocationImpl implements ParameterLocation {
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
export interface StrElement extends Parameter {
    /**
     *
     **/
    pattern(): string;
    /**
     *
     **/
    enum(): string[];
    /**
     *
     **/
    minLength(): number;
    /**
     *
     **/
    maxLength(): number;
}
export declare class StrElementImpl extends ParameterImpl implements StrElement {
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
    enum(): string[];
    /**
     *
     **/
    setEnum(param: string): StrElementImpl;
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
}
export interface BooleanElement extends Parameter {
}
export declare class BooleanElementImpl extends ParameterImpl implements BooleanElement {
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
export interface NumberElement extends Parameter {
    /**
     *
     **/
    minimum(): number;
    /**
     *
     **/
    maximum(): number;
}
export declare class NumberElementImpl extends ParameterImpl implements NumberElement {
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
}
export interface IntegerElement extends NumberElement {
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
}
export interface DateElement extends Parameter {
}
export declare class DateElementImpl extends ParameterImpl implements DateElement {
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
export interface FileElement extends Parameter {
}
export declare class FileElementImpl extends ParameterImpl implements FileElement {
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
export interface MethodBase extends HasNormalParameters {
    /**
     *
     **/
    responses(): Response[];
    /**
     *
     **/
    body(): BodyLike[];
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
    body(): BodyLike[];
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
    headers(): Parameter[];
    /**
     *
     **/
    body(): BodyLike[];
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
    headers(): Parameter[];
    /**
     *
     **/
    body(): BodyLike[];
    /**
     *
     **/
    isOkRange(): boolean;
}
export interface BodyLike extends RAMLLanguageElement {
    /**
     *
     **/
    name(): string;
    /**
     *
     **/
    schema(): SchemaString;
    /**
     *
     **/
    example(): ExampleString;
    /**
     *
     **/
    formParameters(): Parameter[];
}
export declare class BodyLikeImpl extends RAMLLanguageElementImpl implements BodyLike {
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
    setName(param: string): BodyLikeImpl;
    /**
     *
     **/
    schema(): SchemaString;
    /**
     *
     **/
    example(): ExampleString;
    /**
     *
     **/
    formParameters(): Parameter[];
}
export interface XMLBody extends BodyLike {
    /**
     *
     **/
    schema(): XMLSchemaString;
}
export declare class XMLBodyImpl extends BodyLikeImpl implements XMLBody {
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
    schema(): XMLSchemaString;
}
export interface JSONBody extends BodyLike {
    /**
     *
     **/
    schema(): JSonSchemaString;
}
export declare class JSONBodyImpl extends BodyLikeImpl implements JSONBody {
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
    schema(): JSonSchemaString;
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
}
export interface Method extends MethodBase {
    /**
     *
     **/
    method(): string;
    /**
     *
     **/
    protocols(): string[];
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
    method(): string;
    /**
     *
     **/
    setMethod(param: string): MethodImpl;
    /**
     *
     **/
    protocols(): string[];
    /**
     *
     **/
    setProtocols(param: string): MethodImpl;
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
export interface Resource extends RAMLLanguageElement {
    /**
     *
     **/
    relativeUri(): RelativeUri;
    /**
     *
     **/
    "type"(): ResourceTypeRef;
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
    uriParameters(): Parameter[];
    /**
     *
     **/
    methods(): Method[];
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
    baseUriParameters(): Parameter[];
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
    allUriParameters(): Parameter[];
    /**
     *
     **/
    absoluteUriParameters(): Parameter[];
}
export declare class ResourceImpl extends RAMLLanguageElementImpl implements Resource {
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
    relativeUri(): RelativeUri;
    /**
     *
     **/
    "type"(): ResourceTypeRef;
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
    uriParameters(): Parameter[];
    /**
     *
     **/
    methods(): Method[];
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
    baseUriParameters(): Parameter[];
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
    allUriParameters(): Parameter[];
    /**
     *
     **/
    absoluteUriParameters(): Parameter[];
}
export interface Api extends RAMLLanguageElement {
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
    baseUriParameters(): Parameter[];
    /**
     *
     **/
    uriParameters(): Parameter[];
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
    schemas(): GlobalSchema[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
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
    allBaseUriParameters(): Parameter[];
}
export declare class ApiImpl extends RAMLLanguageElementImpl implements Api {
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
    baseUriParameters(): Parameter[];
    /**
     *
     **/
    uriParameters(): Parameter[];
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
    schemas(): GlobalSchema[];
    /**
     *
     **/
    traits(): Trait[];
    /**
     *
     **/
    securedBy(): SecuritySchemaRef[];
    /**
     *
     **/
    securitySchemes(): SecuritySchema[];
    /**
     *
     **/
    resourceTypes(): ResourceType[];
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
    allBaseUriParameters(): Parameter[];
}
