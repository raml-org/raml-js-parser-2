import common = require("./common");
import methods = require("./methods");

export interface OAuth10SecuritySettings10 extends common.Annotable {

    /**
     * List of the signature methods used by the server.
     * Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT
     */
    signatures?: string[]

    /**
     * The URI of the Temporary Credential Request endpoint
     * as defined in RFC5849 Section 2.1
     */
    requestTokenUri?: string

    /**
     * The URI of the Resource Owner Authorization endpoint
     * as defined in RFC5849 Section 2.2
     */
    authorizationUri?: string

    /**
     * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
     */
    tokenCredentialsUri?: string
}

export interface OAuth20SecuritySettings10 extends common.Annotable {

    /**
     * The URI of the Token Endpoint as defined in RFC6749 Section 3.2.
     * Not required forby implicit grant type.
     */
    accessTokenUri?: string

    /**
     * The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1.
     * Required forby authorization_code and implicit grant types.
     */
    authorizationUri?: string

    /**
     * A list of the Authorization grants supported by the API as defined in
     * RFC6749 Sections 4.1, 4.2, 4.3 and 4.4, can be any of: authorization_code,
     * password, client_credentials, implicit, or any absolute url.
     */
    authorizationGrants?: string[]

    /**
     * A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3
     */
    scopes?: string[]
}


export interface PassThroughSecuritySettings10 extends common.Annotable{}


export interface BasicSecuritySettings10 extends common.Annotable{}

export interface DigestSecuritySettings10 extends common.Annotable{}

export interface CustomSecuritySettings10 extends common.Annotable{}

export interface SecuritySchemeBase10 {

    /**
     * Name of the security scheme
     */
    name: string

    /**
     * The description attribute MAY be used to describe a security schemes property
     */
    description?:string

    describedBy?: SecuritySchemePart10
    /**
     * The securitySchemes property MUST be used to specify an API's security mechanisms,
     * including the required settings and the authentication methods that the API supports.
     * one authentication method is allowed if the API supports them
     */
    type: string
}

export interface OAuth10SecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: OAuth10SecuritySettings10
}

export interface OAuth20SecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: OAuth20SecuritySettings10
}

export interface PassThroughSecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: PassThroughSecuritySettings10
}

export interface BasicSecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: BasicSecuritySettings10
}

export interface DigestSecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: DigestSecuritySettings10
}

export interface CustomSecurityScheme10 extends SecuritySchemeBase10 {

    /**
     * The settings attribute MAY be used to provide security scheme-specific information.
     * The required attributes vary depending on the type of security scheme is being declared.
     * It describes the minimum set of properties which any processing application MUST
     * provide and validate if it chooses to implement the security scheme.
     * Processing applications MAY choose to recognize other properties for things such as
     * token lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: CustomSecuritySettings10
}

export interface SecuritySchemePart10 extends methods.Operation10 {

}

export type SecuritySchemeFragment = OAuth10SecuritySchemeFragment
            |OAuth20SecuritySchemeFragment|PassThroughSchemeFragment|BasicSecuritySchemeFragment
            |DigestSecuritySchemeFragment|CustomSecuritySchemeFragment;

export interface OAuth10SecuritySchemeFragment extends common.FragmentDeclaration, OAuth10SecurityScheme10{}
export interface OAuth20SecuritySchemeFragment extends common.FragmentDeclaration, OAuth20SecurityScheme10{}
export interface PassThroughSchemeFragment extends common.FragmentDeclaration, PassThroughSecurityScheme10{}
export interface BasicSecuritySchemeFragment extends common.FragmentDeclaration, BasicSecurityScheme10{}
export interface DigestSecuritySchemeFragment extends common.FragmentDeclaration, DigestSecurityScheme10{}
export interface CustomSecuritySchemeFragment extends common.FragmentDeclaration, CustomSecurityScheme10{}
