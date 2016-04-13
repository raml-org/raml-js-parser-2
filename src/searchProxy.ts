import search=require("./raml1/ast.core/search")
import hl=require("./raml1/highLevelAST")
import ll=require("./raml1/lowLevelAST")
import hlimpl=require("./raml1/highLevelImpl")

export enum LocationKind{
    VALUE_COMPLETION,
    KEY_COMPLETION,
    PATH_COMPLETION,
    DIRECTIVE_COMPLETION,
    VERSION_COMPLETION,
    ANNOTATION_COMPLETION,
    SEQUENCE_KEY_COPLETION,
    INCOMMENT
}

export function determineCompletionKind(text:string,offset:number):LocationKind{
    return <any>search.determineCompletionKind(text,offset);
}

export function enumValues(c:hl.IProperty,n:hl.IHighLevelNode):string[]{
    return search.enumValues(<any>c,n);
}

export function globalDeclarations(n:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return search.globalDeclarations(n);
}

export function qName(n:hl.IHighLevelNode,p:hl.IHighLevelNode):string{
    return hlimpl.qName(n,p);
}

export function subTypesWithLocals(t:hl.ITypeDefinition,n:hl.IHighLevelNode):hl.ITypeDefinition[]{
    return search.subTypesWithLocals(t,n);
}
export function nodesDeclaringType(t:hl.ITypeDefinition,n:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return search.nodesDeclaringType(t,n);
}

export function isExampleNodeContent(n:hl.IAttribute):boolean{
    return search.isExampleNodeContent(n);
}
export function findExampleContentType(n:hl.IAttribute):hl.ITypeDefinition{
    return search.findExampleContentType(n);
}
export function parseDocumentationContent(n:hl.IAttribute,t:hl.ITypeDefinition):hl.IHighLevelNode{
    return search.parseDocumentationContent(n,t);
}

export function referenceTargets(p0:hl.IProperty,c:hl.IHighLevelNode):hl.IHighLevelNode[]{
    return search.referenceTargets(p0,c);
}
export interface FindUsagesResult{
    node:hl.IHighLevelNode
    results:hl.IParseResult[]
}
export function findUsages(unit:ll.ICompilationUnit, offset:number):FindUsagesResult{
    return search.findUsages(unit,offset);
}

export function findDeclaration(unit:ll.ICompilationUnit, offset:number,
                                nodePart? : LocationKind):ll.ICompilationUnit|hl.IParseResult {
    return search.findDeclaration(unit,offset,<any>nodePart);
}
