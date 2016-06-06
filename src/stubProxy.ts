import hl=require("./raml1/highLevelAST")
import hlimpl=require("./raml1/highLevelImpl")
import jsyaml=require("./raml1/jsyaml/jsyaml2lowLevel")

import ll=require("./raml1/lowLevelAST")
import stubs=require("./raml1/stubs")
export function createStubNode(t:hl.ITypeDefinition,p: hl.IProperty, key: string=null, unit?: ll.ICompilationUnit): hl.IHighLevelNode {
    return stubs.createStubNode(t,p,key,unit);
}

export function createStub(parent: hl.IHighLevelNode, property: string, key?: string) :  hl.IHighLevelNode {

    return stubs.createStub(parent,property,key);
}

export function createStubNoParentPatch(parent: hl.IHighLevelNode, property: string, key?: string) :  hl.IHighLevelNode {

    return stubs.createStub0(parent,property,key);
}

export function createResourceStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createResourceStub(parent,key);
}

export function createMethodStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createMethodStub(parent,key)
}

export function createResponseStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createResponseStub(parent,key)
}
export function createBodyStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createBodyStub(parent,key)
}
export function createUriParameterStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createUriParameterStub(parent,key)
}
export function createQueryParameterStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return stubs.createQueryParameterStub(parent,key)
}
export function createASTPropImpl(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, _def:hl.INodeDefinition, _prop:hl.IProperty,fk:boolean=false):hl.IAttribute{
    return new hlimpl.ASTPropImpl(node,parent,_def,_prop,fk);
}

export function createASTNodeImpl(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, _def:hl.INodeDefinition, _prop:hl.IProperty):hl.IHighLevelNode{
    return new hlimpl.ASTNodeImpl(node,parent,_def,_prop);
}

export function createVirtualASTPropImpl(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, _def:hl.INodeDefinition, _prop:hl.IProperty):hl.IAttribute{
    return new VirtualAttr(node,parent,_def,_prop);
}

export function createVirtualNodeImpl(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, _def:hl.INodeDefinition, _prop:hl.IProperty):hl.IHighLevelNode{
    return new VirtualNode(node,parent,_def,_prop);
}
class VirtualAttr extends hlimpl.ASTPropImpl{
    value(){
        return "";
    }
}
class VirtualNode extends hlimpl.ASTNodeImpl{
    value(){
        return "";
    }
}
export function createMapping(name:string,value:string):ll.ILowLevelASTNode{
    return jsyaml.createMapping(name,value);
}

export function createMap():ll.ILowLevelASTNode{
    return jsyaml.createMap([]);
}
export function createAttr(_property:hl.IProperty,val:any):hl.IAttribute {
    return stubs.createAttr(_property,val);
}

