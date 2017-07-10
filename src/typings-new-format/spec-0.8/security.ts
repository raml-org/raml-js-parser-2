import bodies = require("./bodies");
import common = require("./common");
import methods = require("./methods");
import parameters = require("./parameters");

export interface AbstractSecurityScheme08 extends common.HasMeta{

    /**
     * Name of the security scheme
     */
    name: string

    /**
     * The securitySchemes property MUST be used to specify an API's security
     * mechanisms, including the required settings and the authentication
     * methods that the API supports. one authentication method is allowed
     * if the API supports them.
     */
    type: string

    /**
     * The description attribute MAY be used to describe a security schemes property.
     */
    description?: string

    describedBy?: SecuritySchemePart08

    /**
     * The settings attribute MAY be used to provide security scheme-specific
     * information. The required attributes vary depending on the type of
     * security scheme is being declared. It describes the minimum set of
     * properties which any processing application MUST provide and validate
     * if it chooses to implement the security scheme. Processing applications
     * MAY choose to recognize other properties for things such as token
     * lifetime, preferred cryptographic algorithms, and more.
     */
    settings?: Object
 }

/**
 * A description of the request components related to Security that are determined
 * by the scheme: the headers, query parameters or responses. As a best practice,
 * even for standard security schemes, API designers SHOULD describe these
 * properties of security schemes. Including the security scheme description
 * completes an API documentation.
 */
export interface SecuritySchemePart08 extends methods.MethodBase08{

    /**
     * Instantiation of applyed traits
     */
    is?: methods.TemplateReference[]
}

export interface OAuth2SecurityScheme08 extends AbstractSecurityScheme08{

     settings: {

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
          * password, client_credentials, implicit, or refresh_token.
          */
         authorizationGrants?: string[]

         /**
          * A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3
          */
         scopes?: string[]
     }
}

export interface OAuth1SecurityScheme08 extends AbstractSecurityScheme08{

    settings: {

        /**
         * The URI of the Temporary Credential Request endpoint as defined
         * in RFC5849 Section 2.1
         */
        requestTokenUri?: string

        /**
         * The URI of the Resource Owner Authorization endpoint as defined
         * in RFC5849 Section 2.2
         */
        authorizationUri?: string

        /**
         * The URI of the Token Request endpoint as defined in RFC5849 Section 2.3
         */
        tokenCredentialsUri?: string

    }
}

export interface BasicSecurityScheme08 extends AbstractSecurityScheme08{
}

export interface DigestSecurityScheme08 extends AbstractSecurityScheme08{
}

export interface CustomSecurityScheme08  extends AbstractSecurityScheme08{

}