// Compiled using typings@0.3.5
// Source: custom_typings/escodegen.d.ts
declare module "escodegen" {

    interface Generator{
        generate(obj:esprima.Syntax.Node):string;
        getDefaultOptions():any
    }

    var x:Generator;

    export=x;
}