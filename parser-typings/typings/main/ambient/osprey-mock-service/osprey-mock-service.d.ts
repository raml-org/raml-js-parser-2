// Compiled using typings@0.6.8
// Source: custom_typings/osprey-mock-service.d.ts
declare module 'osprey-mock-service' {
  import http = require('http')

  function mockService (raml: any): mockService.Middleware;

  module mockService {
    interface Middleware {
      (req: http.ServerRequest, res: http.ServerResponse, next: (err: Error) => any): void;
    }

    interface Options {
      documentationPath: string;
    }

    function createServer (raml: any, options?: Options): Middleware;
    function createServerFromBaseUri (raml: any, options?: Options): Middleware;
    function loadFile (filename: string, options?: Options): Promise<Middleware>;
  }

  export = mockService;
}