// Compiled using typings@0.5.2
// Source: custom_typings/server-address.d.ts
declare module 'server-address' {
  import http = require('http')
  import https = require('https')

  function serverAddress (app: Function | http.Server | https.Server): serverAddress.ServerAddress

  module serverAddress {
    interface ServerAddress {
      listen(): void
      url(path?: string): string
      close(): void
    }
  }

  export = serverAddress
}