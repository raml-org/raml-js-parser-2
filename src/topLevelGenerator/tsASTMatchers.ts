/// <reference path="../../typings/main.d.ts" />
import ts = require('typescript');
/***
 * This module is designed to match simple patterns on Typescript AST Tree
 * it functionality mirrors jsASTMatchers which allows you to match on jsAST
 */
    //TODO RENAME TO MATCHERS
export module Matching {
    export type Expression=ts.Expression;
    export type Identifier=ts.Identifier;
    export type SyntaxKind=ts.SyntaxKind;
    export type CallExpression=ts.CallExpression;

    export interface NodeMatcher {
        doMatch(node:ts.Node):any
    }
    export interface TypedMatcher<T extends ts.Node> extends NodeMatcher {

        /**
         * returns null or the value not null means that matched
         * @param node
         */
        doMatch(node:ts.Node):any
        nodeType():ts.SyntaxKind;
    }

    export interface Transformer<T,R> {
        (a:T):R
    }


    export interface NodeCallback<T>{
        (node: ts.Node) :T
    }
    export interface NodesCallback<T>{
        (nodes: ts.Node[]): T
    }

    /**
     * do match checks the node type and if node type is ok
     * calls match function otherwise it returns null
     */
    export class BasicMatcher {

        protected match(node:ts.Node):any {
            throw new Error()
        }

        nodeType():ts.SyntaxKind {
            throw new Error()
        }

        doMatch(n:ts.Node):any {
            if(!n){
                return null;
            }
            if (this.nodeType() == n.kind) {
                return this.match(n);
            }
        }
    }

    export class ClassDeclarationMatcher extends BasicMatcher implements TypedMatcher<ts.ClassDeclaration> {
        protected match(node:ts.Node):ts.ClassDeclaration {
            return <ts.ClassDeclaration>node;
        }

        constructor() {
            super()
        }

        nodeType():ts.SyntaxKind {
            return ts.SyntaxKind.ClassDeclaration;
        }
    }
    export class FieldMatcher extends BasicMatcher implements TypedMatcher<ts.ClassDeclaration>{

        match(node:ts.PropertyDeclaration):ts.PropertyDeclaration {
            return node;
        }

        nodeType():ts.SyntaxKind{
            return ts.SyntaxKind.PropertyDeclaration
        }
    }

    class AssignmentExpressionMatcher extends BasicMatcher implements TypedMatcher<ts.BinaryExpression> {
        match(node:ts.BinaryExpression):any {
            if (node.operatorToken.kind==ts.SyntaxKind.EqualsToken) {
               if (this.left.doMatch(node.left) && this.right.doMatch(node.right)) {
                    return this.tr(node);
                }
            }
            return null;
        }

        constructor(private left:TypedMatcher<Expression>, private right:TypedMatcher<Expression>, private tr:Transformer<ts.BinaryExpression,any>) {
            super()
        }

        nodeType():ts.SyntaxKind {
            return ts.SyntaxKind.BinaryExpression;
        }
    }
    class VariableDeclarationMatcher extends BasicMatcher implements TypedMatcher<ts.VariableDeclaration> {
        match(node:ts.VariableDeclaration):any {
            if (this.left.doMatch(node.name) && this.right.doMatch(node.initializer)) {
                    return this.tr(node);
            }

        }

        constructor(private left:TypedMatcher<Expression>, private right:TypedMatcher<Expression>, private tr:Transformer<ts.VariableDeclaration,any>) {
            super()
        }

        nodeType():ts.SyntaxKind {
            return ts.SyntaxKind.VariableDeclaration;
        }
    }


    class ExpressionStatementMatcher extends BasicMatcher implements TypedMatcher<ts.ExpressionStatement> {
        match(node:ts.ExpressionStatement):any {
            var exp = this.expression.doMatch(node.expression);
            if (exp) {

                var v = this.tr(node.expression);

                if (v == true) {
                    return exp;
                }
                return v;
            }
            return null;
        }

        constructor(private expression:TypedMatcher<Expression>, private tr:Transformer<Expression,any>) {
            super()
        }

        nodeType():ts.SyntaxKind {
            return ts.SyntaxKind.ExpressionStatement;
        }
    }

    class SimpleIdentMatcher extends BasicMatcher implements TypedMatcher<Identifier> {

        match(node:Identifier):any {
            if (node.text == this.val) {
                return true;
            }
            return null;
        }

        constructor(private val:string) {
            super()
        }

        nodeType():SyntaxKind {
            return ts.SyntaxKind.Identifier;
        }
    }



    class TrueMatcher<T extends ts.Node> implements TypedMatcher<T> {

        doMatch(node:ts.Node):any {
            return true;
        }

        nodeType():ts.SyntaxKind {
            return null;
        }
    }
    class CallExpressionMatcher extends BasicMatcher implements TypedMatcher<CallExpression> {
        match(node:CallExpression):any {
            if (this.calleeMatcher.doMatch(node.expression)) {
                return this.tr(node);
            }
            return null;
        }

        constructor(private calleeMatcher:TypedMatcher<Expression>, private tr:Transformer<CallExpression,any>) {
            super()
        }

        nodeType():SyntaxKind {
            return ts.SyntaxKind.CallExpression;
        }
    }
    export var SKIP={}

    export function visit<T>(n:ts.Node,cb:NodeCallback<T>):T{
        var r0=cb(n);
        if (r0){
            if(r0==SKIP){
                return null;
            }
            return r0;
        }

        var r:T= ts.forEachChild<T>(n,x=>{
            var r= visit(x,cb);
            if (r){
                return r;
            }
        });
        return r;
    }
    export class PathNode {
        name:string
        arguments:Expression[] = null;
        _callExpression:ts.CallExpression

        constructor(name:string,private _base:ts.Node) {
            this.name = name;
        }
    }

    export class CallPath {
        base:string;


        start(){
            return this._baseNode.pos;
        }

        startLocation(){
            return this._baseNode.getSourceFile().getLineAndCharacterOfPosition(this.start())
        }
        endLocation(){
            return this._baseNode.getSourceFile().getLineAndCharacterOfPosition(this.end())
        }
        end(){
            var ce=this.path[this.path.length-1]._callExpression;
            if (ce){
            return ce.end
            }
            return this.start();
        }

        constructor(base:string,private _baseNode:ts.Node) {
            this.base = base;
        }


        path:PathNode[] = [];

        toString():string{
            return this.path.map(x=>x.name).join(".");
        }
    }
    class MemberExpressionMatcher extends BasicMatcher implements TypedMatcher<ts.PropertyAccessExpression> {
        match(node:ts.PropertyAccessExpression):any {
            if (this.objectMatcher.doMatch(node.expression) && this.propertyMatcher.doMatch(node.name)) {
                return this.tr(node);
            }
            return null;
        }

        nodeType():SyntaxKind {
            return ts.SyntaxKind.PropertyAccessExpression;
        }

        constructor(private objectMatcher:TypedMatcher<Expression>,
                    private propertyMatcher:TypedMatcher<Expression|Identifier>,
                    private tr:Transformer<ts.PropertyAccessExpression,any>) {
            super()
        }
    }
    export function memberFromExp(objMatcher:string, tr:Transformer<Expression,any> = x=>true):TypedMatcher<any> {
        var array:string[] = objMatcher.split(".");
        var result:TypedMatcher<any> = null;
        for (var a = 0; a < array.length; a++) {

            var arg = array[a];
            var ci = arg.indexOf("(*)");
            var isCall = false;
            if (ci != -1) {
                arg = arg.substr(0, ci);
                isCall = true;
            }
            if (result == null) {
                result = arg == '*' ? anyNode() : ident(arg);
            }
            else {
                result = new MemberExpressionMatcher(result, arg == '*' ? anyNode() : ident(arg), tr);
            }
            if (isCall) {
                result = new CallExpressionMatcher(result, tr);
            }

        }
        //console.log(result)
        return result;
    }
    export class CallBaseMatcher implements TypedMatcher<Expression> {
        doMatch(node:Expression):CallPath {
            var original = node;
            if (node.kind == ts.SyntaxKind.CallExpression) {
                var call = (<CallExpression>node);
                var res:CallPath = this.doMatch(call.expression);
                if (res) {
                    if (res.path.length > 0 && res.path[res.path.length - 1].arguments == null) {
                        res.path[res.path.length - 1].arguments = call.arguments;
                        res.path[res.path.length - 1]._callExpression=call;
                        return res;
                    }
                    //This case should not exist in type script clients now
                    //but leaving it here for possible future use at the moment;

                    //if (res.path.length==0&&call.arguments.length==1){
                    //    //this is not resource based call!!!
                    //    if (call.arguments[0].kind==ts.SyntaxKind.StringLiteral){
                    //        var l:ts.LiteralExpression=<ts.LiteralExpression>call.arguments[0];
                    //        var url=l.text;
                    //        var uriPath=url.toString().split("/");
                    //        uriPath.forEach(x=>res.path.push(
                    //            new PathNode(x)
                    //        ))
                    //        return res;
                    //    }
                    //}
                    return null;
                }
            }
            else if (node.kind ==ts.SyntaxKind.PropertyAccessExpression) {
                var me = (<ts.PropertyAccessExpression>node);
                var v:CallPath = this.doMatch(me.expression);
                if (v) {
                    if (me.name.kind == ts.SyntaxKind.Identifier) {
                        v.path.push(new PathNode((<Identifier>me.name).text,me.name));
                        return v;
                    }
                    return null;
                }
            }
            else if (node.kind == ts.SyntaxKind.Identifier) {
                var id:Identifier = <Identifier>node
                if (this.rootMatcher.doMatch(id)) {
                    return new CallPath(id.text,id);
                }
            }
            return null;
        }

        nodeType():ts.SyntaxKind {
            return null;
        }

        constructor(private rootMatcher:TypedMatcher<Identifier>) {
        }
    }
    export function ident(name:string):TypedMatcher<Identifier> {
        return new SimpleIdentMatcher(name);
    }
    export function anyNode():TypedMatcher<ts.Node> {
        return new TrueMatcher();
    }
    export function call(calleeMatcher:TypedMatcher<Expression>, tr:Transformer<CallExpression,any> = x=>true):TypedMatcher<CallExpression> {
        return new CallExpressionMatcher(calleeMatcher, tr);
    }

    export function exprStmt(eM:TypedMatcher<Expression>, tr:Transformer<ts.MemberExpression,any> = x=>true):TypedMatcher<ts.ExpressionStatement> {
        return new ExpressionStatementMatcher(eM, tr);
    }

    export function assign(left:TypedMatcher<Expression>, right:TypedMatcher<Expression>, tr:Transformer<ts.BinaryExpression,any> = x=>true):TypedMatcher<ts.BinaryExpression> {
        return new AssignmentExpressionMatcher(left, right, tr);
    }
    export function varDecl(left:TypedMatcher<Expression>, right:TypedMatcher<Expression>, tr:Transformer<ts.VariableDeclaration,any> = x=>true):TypedMatcher<ts.BinaryExpression> {
        return new VariableDeclarationMatcher(left, right, tr);
    }

    export function field(){
        return new FieldMatcher()
    }

    export function classDeclaration(){
        return new ClassDeclarationMatcher();
    }
}