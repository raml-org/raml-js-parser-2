
import defs=require("raml-definition-system")
import hl=require("./highLevelAST")
import ll=require("./lowLevelAST")

import jsyaml=require("./jsyaml/jsyaml2lowLevel")

import hlimpl=require("./highLevelImpl")

import yaml=require("yaml-ast-parser")
//*** THis is not needed any more *///
export function createStub0(parent: hl.IHighLevelNode, property: string, key?: string) : hl.IHighLevelNode {
    var p = parent.definition().property(property);
    if (!p) return null;
    var nc: defs.NodeClass = <defs.NodeClass> p.range();
    var node=<hlimpl.ASTNodeImpl>createStubNode(nc,p, key);
    return node;
}
export function genStructuredValue(type: string, name: string, mappings: { key: string; value: string; }[], parent: hl.IHighLevelNode) {
    var map = yaml.newMap(mappings.map(mapping => yaml.newMapping(yaml.newScalar(mapping.key), yaml.newScalar(mapping.value))));

    var node = new jsyaml.ASTNode(map, <jsyaml.CompilationUnit> (parent? parent.lowLevel().unit():null), parent? <jsyaml.ASTNode> parent.lowLevel() : null, null, null);

    return new hlimpl.StructuredValue(node, parent, parent? <defs.Property>parent.definition().property(type):null, name);
}

export function createStub(parent: hl.IHighLevelNode, property: string, key?: string) :  hl.IHighLevelNode {
    var p = parent.definition().property(property);
    if (!p) return null;
    var nc: defs.NodeClass = <defs.NodeClass> p.range();

    var su=(<jsyaml.CompilationUnit>parent.lowLevel().unit()).stub();

    var node=<hlimpl.ASTNodeImpl>createStubNode(nc,p, key, su);

    node.isInEdit=true;

    (<any>node.lowLevel())._unit=(<jsyaml.CompilationUnit>su);
    (<any>node)._parent=parent.copy();
    (<any>node)._parent.lowLevel()._unit=su;
    return node;
}
export function createResourceStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, "resources", key);
}

export function createMethodStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, 'methods', key);
}

export function createResponseStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, 'responses', key);
}
export function createBodyStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, 'body', key);
}
export function createUriParameterStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, 'uriParameters', key);
}
export function createQueryParameterStub(parent: hl.IHighLevelNode, key?: string) : hl.IHighLevelNode {
    return createStub(parent, 'queryParameters', key);
}

export function createAttr(_property:hl.IProperty,val:any):hl.IAttribute{
    var lowLevel:ll.ILowLevelASTNode=jsyaml.createMapping(_property.nameId(),val);
    var nm=new hlimpl.ASTPropImpl(lowLevel,null,_property.range(),_property);
    return nm;
}
export function createStubNode(t:hl.ITypeDefinition,p: hl.IProperty, key: string=null, unit?: ll.ICompilationUnit): hl.IHighLevelNode {
    var lowLevel:ll.ILowLevelASTNode = jsyaml.createNode(key?key:"key",null,unit);

    var nm = new hlimpl.ASTNodeImpl(lowLevel,null,t,p);

    if(!lowLevel.unit()) {
        (<any>lowLevel)._unit = unit;
    }
    nm.children();
    return nm;
}