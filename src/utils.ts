import rs=require("./raml1/jsyaml/resourceRegistry")
import hlimpl=require("./raml1/highLevelImpl")
import defs=require("raml-definition-system")
import jsyaml=require("./raml1/jsyaml/jsyaml2lowLevel")
import expander=require("./raml1/ast.core/expander")
import hl=require("./raml1/highLevelAST")
import linter=require("./raml1/ast.core/linter")
import builder=require("./raml1/ast.core/builder")
export function hasAsyncRequests(){
    return rs.hasAsyncRequests();
}

export function addLoadCallback(x:(url:string)=>void){
    rs.addLoadCallback(x);
}
export function getTransformerNames():string[]{
    return expander.getTransformNames();
}
export var updateType = function (node:hl.IHighLevelNode) {
    var type = builder.doDescrimination(node);
    if (type == null&&node.property()) {
        type = node.property().range();
    }
    if (type) {
        (<hlimpl.ASTNodeImpl>node).patchType(<hl.INodeDefinition>type);
    }
};

export function getFragmentDefenitionName(node:hl.IHighLevelNode):string{
    return hlimpl.getFragmentDefenitionName(node);
}
export function genStructuredValue(name: string, parent: hl.IHighLevelNode, pr: hl.IProperty) : string | hl.IStructuredValue {
    if (pr.range() instanceof defs.ReferenceType){
        var t=<defs.ReferenceType>pr.range();

        var mockNode=jsyaml.createNode(name);

        return new hlimpl.StructuredValue(mockNode, parent, pr);
    } else return name;
}

export function parseUrl(u:string):string[]{
    return new linter.UrlParameterNameValidator().parseUrl(u);
}