import wh=require("./raml1/wrapped-ast/wrapperHelper")
import api=require("./raml1/artifacts/raml10parserapi")
export function completeRelativeUri(res:api.Resource):string {
    return wh.completeRelativeUri(res);
}
export interface Opt<T>{
    getOrElse(v:T):T
}
export interface SchemaDef{

    name()
    content()
}
//  function schema(body:api.TypeDeclaration, api:api.Api):Opt<SchemaDef> {
//     return wh.schema(body,api);
// }