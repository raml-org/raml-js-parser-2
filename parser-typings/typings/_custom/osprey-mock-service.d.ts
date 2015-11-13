/// <reference path="../node/node.d.ts" />
/// <reference path="../es6-promise/es6-promise.d.ts" />

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
