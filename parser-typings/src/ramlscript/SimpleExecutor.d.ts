/// <reference path="../../typings/tsd.d.ts" />
export interface HARExecutor {
    execute(req: har.Request): har.Response;
    executeAsync(req: har.Request): Promise<har.Response>;
    log(varName: string, value: any): any;
}
export declare class SimpleExecutor implements HARExecutor {
    constructor();
    execute(req: har.Request, doAppendParams?: boolean): har.Response;
    private appendParams(req, url);
    log(varName: string, value: any): void;
    executeAsync(req: har.Request, doAppendParams?: boolean): Promise<har.Response>;
    private doRequest(req, xhr);
}
