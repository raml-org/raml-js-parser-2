import ex=require ("./parser/ast.core/expander");


export function expandTraitsAndResourceTypes<T>(api:T):T {
    return ex.expandTraitsAndResourceTypes(api);
}
