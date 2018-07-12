import ex=require ("./parser/ast.core/expanderLL");


export function expandTraitsAndResourceTypes<T>(api:T):T {
    return ex.expandTraitsAndResourceTypes(api);
}
