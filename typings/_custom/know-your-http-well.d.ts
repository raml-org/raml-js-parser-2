declare module 'know-your-http-well' {
  export interface StatusCode {
    code: string
    phrase: string
    description: string
    spec_title: string
    spec_href: string
  }

  export interface Header {
    header: string
    description: string
    spec_title: string
    spec_href: string
  }

  export interface Method {
    method: string
    description: string
    safe: boolean
    idempotent: boolean
    cacheable: boolean
    spec_title: string
    spec_href: string
  }

  export var statusCodes: StatusCode[]
  export var headers: Header[]
  export var methods: Method[]
}
