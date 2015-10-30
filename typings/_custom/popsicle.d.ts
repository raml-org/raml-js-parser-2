/// <reference path="../node/node.d.ts" />
/// <reference path="../es6-promise/es6-promise.d.ts" />

declare module 'popsicle' {
  import http = require('http')

  function popsicle (options: popsicle.Options): popsicle.Request

  module popsicle {
    interface Options {
      // Standard options.
      url: string
      method?: string
      body?: any
      query?: string | QueryMap
      timeout?: number
      headers?: HeaderMap

      // Node options.
      jar?: CookieJar
      maxRedirects?: number
      rejectUnauthorized?: boolean
      agent?: http.Agent
      stream?: boolean
      raw?: boolean
      encoding?: string

      // Browser options.
      withCredentials?: boolean

      // Misc. options.
      parse?: boolean
    }

    interface QueryMap {
      [key: string]: string
    }

    interface HeaderMap {
      [key: string]: string
    }

    // TODO: Document `tough-cookie`.
    class CookieJar {

    }

    class Headers {
      headers: HeaderMap
      headerNames: HeaderMap

      set (name: string, value: string): Headers
      set (headers: HeaderMap): Headers
      append (name: string, value: string): Headers
      name (name: string): string
      get (): HeaderMap
      get (name: string): string
      remove (name: string): Headers
      type (): string
      type (type: string): Request
    }

    class Request extends Headers implements Promise<Response>, Options {
      // Standard options.
      url: string
      method: string
      body: any
      query: string | QueryMap
      timeout: number

      // Node options.
      jar: CookieJar
      maxRedirects: number
      rejectUnauthorized: boolean
      agent: http.Agent
      stream: boolean
      raw: boolean
      encoding: string

      // Browser options.
      withCredentials: boolean

      // Misc. options.
      parse: boolean

      // State.
      opened: boolean
      aborted: boolean

      // Progress.
      uploaded: number
      downloaded: number
      completed: number
      uploadedSize: number
      uploadedTotal: number
      downloadedSize: number
      downloadedTotal: number

      // Link to the response instance (when completed).
      response: Response

      constructor (options: Options)

      // Utilities.
      fullUrl (): string
      error (message: string): Error
      progress (fn: (request: Request) => any): Request
      abort (): Request

      // Plugins.
      use (fn: (request: Request) => any): Request
      before (fn: (request: Request) => Promise<any>): Request
      after (fn: (request: Request) => Promise<any>): Request
      always (fn: (request: Request) => Promise<any>): Request

      // Control flow.
      then (fn: (response: Response) => any): Promise<any>
      catch (fn: (error: Error) => any): Promise<any>
      exec (fn: (err: Error, response: Response) => any): void
    }

    class Response extends Headers {
      // Link to the original request instance.
      request: Request

      // Response properties.
      body: any
      status: number

      // Utilities.
      statusType (): number
      error (message: string): Error
    }

    function jar (): CookieJar

    function form (): FormData
  }

  export = popsicle
}
