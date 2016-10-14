import rs=require("./raml1/jsyaml/resourceRegistry")
import hlimpl=require("./raml1/highLevelImpl")
import defs=require("raml-definition-system")
import jsyaml=require("./raml1/jsyaml/jsyaml2lowLevel")
import expander=require("./raml1/ast.core/expander")
import hl=require("./raml1/highLevelAST")
import ll=require("./raml1/lowLevelAST")
import linter=require("./raml1/ast.core/linter")
import builder=require("./raml1/ast.core/builder")
import universes = require("./raml1/tools/universe")

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

export class UnitLink {
    /**
     * Node leading to the outer unit.
     */
    public node : hl.IParseResult;

    /**
     * Unit this link points to.
     */
    public targetUnitRoot : hl.IParseResult;

    constructor(node : hl.IParseResult, targetUnitRoot : hl.IParseResult) {
        this.node = node;
        this.targetUnitRoot = targetUnitRoot;
    }
}

export class PointOfViewValidationAcceptorImpl implements hl.ValidationAcceptor {
    constructor (protected errors:hl.ValidationIssue[],
                 protected primaryUnitRoot : hl.IParseResult) {
    }

    accept(originalIssue:hl.ValidationIssue){
        this.transformIssue(originalIssue);

        this.errors.push(originalIssue);
    }

    public transformIssue(originalIssue:hl.ValidationIssue) : void {
        var tailIssueUnit = null;

        var tailIssue : hl.ValidationIssue = this.findIssueTail(originalIssue);
        if (tailIssue.node) {
            tailIssueUnit = tailIssue.node.lowLevel().unit();
        }

        var primaryUnit = this.primaryUnitRoot.lowLevel().unit();

        if (tailIssueUnit && primaryUnit && tailIssueUnit != primaryUnit) {
            var path : hl.IParseResult[] =
                this.findPathToNodeUnit(this.primaryUnitRoot, tailIssue.node);
            if (path && path.length > 0) {
                var errorStack : hl.ValidationIssue[] = path.map(connectingNode=>{
                    return this.convertConnectingNodeToError(connectingNode, originalIssue);
                })

                if (errorStack && errorStack.length > 0) {

                    var parentIssue : hl.ValidationIssue = tailIssue;
                    for (var i = errorStack.length - 1; i >=0 ; i--) {
                        var currentError = errorStack[i];
                        parentIssue.extras  = <hl.ValidationIssue[]>[];
                        parentIssue.extras.push(currentError);

                        parentIssue = currentError;
                    }
                }
            }
        }
    }

    begin(){
    }

    end(){
    }

    acceptUnique(issue: hl.ValidationIssue){
        for(var e of this.errors){
            if(e.start==issue.start && e.message==issue.message){
                return;
            }
        }
        this.accept(issue);
    }

    private findPathToNodeUnit(primaryUnitRoot : hl.IParseResult,
                               nodeToFindPathTo : hl.IParseResult) : hl.IParseResult[] {

        if (!nodeToFindPathTo.lowLevel() || !nodeToFindPathTo.lowLevel().unit()) {
            return [];
        }

        return this.findPathToNodeUnitRecursively(
            primaryUnitRoot, nodeToFindPathTo.lowLevel().unit());
    }

    private findPathToNodeUnitRecursively(unitRoot : hl.IParseResult,
                                          unitToFindPathTo : ll.ICompilationUnit) : hl.IParseResult[] {

        var links = this.findUnitLinks(unitRoot);
        for (var i = 0; i < links.length; i++) {
            var currentLink = links[i];

            if (currentLink.targetUnitRoot
                && currentLink.targetUnitRoot.lowLevel()
                && currentLink.targetUnitRoot.lowLevel().unit() == unitToFindPathTo) {

                return [currentLink.node];
            }

            var subLinkResult =
                this.findPathToNodeUnitRecursively(currentLink.targetUnitRoot,unitToFindPathTo);

            if (subLinkResult) {
                subLinkResult.unshift(currentLink.node);
                return subLinkResult;
            }
        }

        return null;
    }

    private findUnitLinks(unitRoot : hl.IParseResult) : UnitLink[] {
        var result : UnitLink[] = [];

        result = result.concat(this.findMasterLinks(unitRoot));
        //TODO add more kinds of unit links if we decide to expand this mechanism
        //to automatically build traces for other kinds of dependencies instead of
        //the current mechanisms. In example, for fragments and uses.

        return result;
    }

    private findMasterLinks(unitRoot : hl.IParseResult) : UnitLink[] {
        if (!(<hlimpl.ASTNodeImpl>unitRoot).getMaster) return [];
        var master = (<hlimpl.ASTNodeImpl>unitRoot).getMaster();
        if (!master) return [];

        var extendsAttr =
            unitRoot.asElement().attr(universes.Universe10.Extension.properties.extends.name);
        if (!extendsAttr) return [];
        if (!extendsAttr.value()) return [];

        return [new UnitLink(extendsAttr,master)];
    }

    private convertConnectingNodeToError(connectingNode : hl.IParseResult,
                                         originalIssue:hl.ValidationIssue) : hl.ValidationIssue {
        if (!connectingNode) return null;

        var llNode = connectingNode.lowLevel();
        var st = llNode.start();
        var et = llNode.end();

        var message = this.generateLinkMessageByNode(connectingNode, originalIssue)
        return {
            code: originalIssue.code,
            isWarning: originalIssue.isWarning,
            message: message,
            node: connectingNode,
            start: st,
            end: et,
            path: llNode.unit() ? llNode.unit().path() : "",
            extras:[],
            unit:llNode.unit()
        }
    }

    private generateLinkMessageByNode(connectingNode : hl.IParseResult,
                                      originalIssue:hl.ValidationIssue) {
        if (connectingNode.property().nameId()
            == universes.Universe10.Extension.properties.extends.name) {
            return "Error in the master file: " + originalIssue.message;
        }

        return originalIssue.message;
    }

    private findIssueTail(issue:hl.ValidationIssue) : hl.ValidationIssue {
        if (!issue.extras || issue.extras.length == 0) {
            return issue;
        }

        return this.findIssueTail(issue.extras[0]);
    }
}