import ex=require ("./raml1/ast.core/expander");


export function expandTraitsAndResourceTypes<T>(api:T):T {
    return ex.expandTraitsAndResourceTypes(api);
}
