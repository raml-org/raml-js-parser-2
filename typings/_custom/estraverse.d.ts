/// <reference path="../esprima/esprima.d.ts" />

declare module "estraverse" {

    interface Traverser{
        traverse(obj:esprima.Syntax.Node,visitor:any);
        replace(obj:esprima.Syntax.Node,visitor:any);

        VisitorOption:{
            Break:{}
            Remove:{}
            Skip:{}
        }
    }

    interface VisitingFunction{
        (obj:esprima.Syntax.Node,parent:esprima.Syntax.Node):any
    }

    interface Visitor{
        enter?:VisitingFunction
        leave?:VisitingFunction
    }

    var x:Traverser;

    export=x;
}