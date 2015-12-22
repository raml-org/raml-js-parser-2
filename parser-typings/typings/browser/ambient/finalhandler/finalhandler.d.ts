// Compiled using typings@0.3.3
// Source: custom_typings/finalhandler.d.ts
declare module 'finalhandler' {
  import http = require('http')

  interface Options {
    env: string
    onerror: (err: Error, req: any, res: any) => any
  }

  function finalhandler (req: http.ServerRequest, res: http.ServerRequest, options?: Options): (err: Error) => void

  export = finalhandler
}