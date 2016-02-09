// Compiled using typings@0.5.2
// Source: custom_typings/escope.d.ts
declare module "escope" {

    interface Scope{
        references:Reference[]
    }

    interface Identifier{
        type:string
        name:string
    }
    interface Reference{
        /**
         * Identifier syntax node.
         * @member {esprima#Identifier} Reference#identifier
         */
            identifier :Identifier;
        /**
         * Reference to the enclosing Scope.
         * @member {Scope} Reference#from
         */
            from : Scope;
        /**
         * Whether the reference comes from a dynamic scope (such as 'eval',
         * 'with', etc.), and may be trapped by dynamic scopes.
         * @member {boolean} Reference#tainted
         */
            tainted :boolean;
        /**
         * The variable this reference is resolved with.
         * @member {Variable} Reference#resolved
         */
            resolved :boolean;
        /**
         * The read-write mode of the reference. (Value is one of {@link
            * Reference.READ}, {@link Reference.RW}, {@link Reference.WRITE}).
         * @member {number} Reference#flag
         * @private
         */
            flag :number;

        /**
         * If reference is writeable, this is the tree being written to it.
         * @member {esprima#Node} Reference#writeExpr
         */
            writeExpr? :esprima.Syntax.Node;

    /**
     * Whether the Reference might refer to a global variable.
     * @member {boolean} Reference#__maybeImplicitGlobal
     * @private
     */
    __maybeImplicitGlobal :boolean;

}

    interface ScopeManager{
        acquire(obj:esprima.Syntax.Node):Scope
    }
    interface Analizer{
        analyze(obj:esprima.Syntax.Node):ScopeManager;

    }


    var x:Analizer;

    export=x;
}