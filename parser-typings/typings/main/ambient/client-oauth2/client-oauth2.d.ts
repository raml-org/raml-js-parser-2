// Compiled using typings@0.3.5
// Source: custom_typings/client-oauth2.d.ts
declare module "client-oauth2" {

    var c: c.ClientOAuth2Constructor;

    module c {
        interface ClientOAuth2Token {
            data: Object
            tokenType: string
            accessToken: string
            refreshToken: string
            expires: Date
            client: ClientOAuth2

            sign(options: RequestOptions): RequestOptions
            request(options: RequestOptions): Promise<Response>
            refresh(): Promise<ClientOAuth2Token>
            expired(): boolean
        }

        interface HeaderMap {
            [headerName: string]: string
        }

        interface RequestOptions {
            url: string
            body: string
            headers: HeaderMap
        }

        interface Response {
            body: string
            status: number
            headers: HeaderMap
        }

        interface CodeFlow {
            getUri(options?: ClientOAuth2Options): string
            getToken(uri: string, state?: string): Promise<ClientOAuth2Token>
        }

        interface TokenFlow {
            getUri(options?: ClientOAuth2Options): string
            getToken(uri: string, state?: string): Promise<ClientOAuth2Token>
        }

        interface OwnerFlow {
            getToken(username: string, password: string): Promise<ClientOAuth2Token>
        }

        interface CredentialsFlow {
            getToken(options?: ClientOAuth2Options): Promise<ClientOAuth2Token>
        }

        interface JwtBearerFlow {
            getToken(token: string, options?: ClientOAuth2Options): Promise<ClientOAuth2Token>
        }

        interface ClientOAuth2 {
            createToken(accessToken: string, refreshToken?: string, tokenType?: string, data?: any): ClientOAuth2Token

            request(options: RequestOptions): Promise<Response>

            options: ClientOAuth2Options
            code: CodeFlow
            token: TokenFlow
            owner: OwnerFlow
            credentials: CredentialsFlow
            jwt: JwtBearerFlow
        }

        interface ClientOAuth2Options {
            clientId: string
            clientSecret: string
            authorizationUri: string
            redirectUri: string
            accessTokenUri?: string
            scopes?: string[]
            state?: string
        }

        interface ClientOAuth2Constructor {
            new (options: ClientOAuth2Options): ClientOAuth2
        }
    }

    export = c
}