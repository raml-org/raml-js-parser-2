import assert = require("assert")

import hl=require("../highLevelAST")
import util = require("./test-utils")

describe('Parser overlay AST comparison tests',function(){
    this.timeout(15000);
    it ("Simple overlay as master",function(){

        util.testAST("parser/overlays/o1/NewOverlay.raml", "parser/overlays/o1/ast.txt",[],[],
            false);
    });

    it ("Simple overlay as a part of overlays and extensions",function(){

        util.testAST("parser/overlays/o2/api.raml", "parser/overlays/o2/ast.txt",
            ["parser/overlays/o2/NewOverlay.raml"]);
    });

    it ("Two overlays as a part of overlays and extensions, direct order",function(){

        util.testAST("parser/overlays/o3/api.raml", "parser/overlays/o3/ast.txt",
            ["parser/overlays/o3/NewOverlay.raml", "parser/overlays/o3/NewOverlay2.raml"]);
    });

    it ("Two overlays as a part of overlays and extensions, order changed",function(){

        util.testAST("parser/overlays/o4/api.raml", "parser/overlays/o4/ast.txt",
            ["parser/overlays/o4/NewOverlay2.raml", "parser/overlays/o4/NewOverlay.raml"]);
    });

    it ("Two overlays applying annotations",function(){

        util.testAST("parser/overlays/o5/api.raml", "parser/overlays/o5/ast.txt",
            ["parser/overlays/o5/NewOverlay.raml", "parser/overlays/o5/NewOverlay2.raml"]);
    });

    it ("Two overlays applying annotations, reverse order",function(){

        util.testAST("parser/overlays/o5/api.raml", "parser/overlays/o5/ast2.txt",
            ["parser/overlays/o5/NewOverlay2.raml", "parser/overlays/o5/NewOverlay.raml"]);
    });

    //it ("Two extensions overriding facets",function(){
    //
    //    util.testAST("parser/overlays/o6/api.raml", "parser/overlays/o6/ast.txt",
    //        ["parser/overlays/o6/NewOverlay2.raml", "parser/overlays/o6/NewOverlay.raml"]);
    //});
    //
    //it ("Two extensions overriding facets, reverse order",function(){
    //
    //    util.testAST("parser/overlays/o6/api.raml", "parser/overlays/o6/ast2.txt",
    //        ["parser/overlays/o6/NewOverlay.raml", "parser/overlays/o6/NewOverlay2.raml"]);
    //});

    it ("Two overlays, one modifies the tree structure",function(){

        util.testAST("parser/overlays/o7/api.raml", "parser/overlays/o7/ast.txt",
            ["parser/overlays/o7/NewOverlay.raml", "parser/overlays/o7/NewOverlay2.raml"],
            ["The './anotherResource' node does not match any node of the master api."]);
    });

    it ("Two overlays, testing documentation",function(){

        util.testAST("parser/overlays/o8/api.raml", "parser/overlays/o8/ast.txt",
            ["parser/overlays/o8/NewOverlay.raml", "parser/overlays/o8/NewOverlay2.raml"]);
    });

    it ("Two overlays, testing documentation, reverse order",function(){

        util.testAST("parser/overlays/o8/api.raml", "parser/overlays/o8/ast2.txt",
            ["parser/overlays/o8/NewOverlay2.raml", "parser/overlays/o8/NewOverlay.raml"]);
    });
    //no examples node any more
    // it ("Two overlays, testing named examples",function(){
    //
    //     util.testAST("parser/overlays/o9/api.raml", "parser/overlays/o9/ast.txt",
    //         ["parser/overlays/o9/NewOverlay.raml", "parser/overlays/o9/NewOverlay2.raml"]);
    // });
    //
    // it ("Two overlays, testing named examples, reverse order",function(){
    //
    //     util.testAST("parser/overlays/o9/api.raml", "parser/overlays/o9/ast2.txt",
    //         ["parser/overlays/o9/NewOverlay2.raml", "parser/overlays/o9/NewOverlay.raml"]);
    // });

    it ("Extension and overlay",function(){

        util.testAST("parser/overlays/o10/api.raml", "parser/overlays/o10/ast.txt",
            ["parser/overlays/o10/NewOverlay.raml", "parser/overlays/o10/NewOverlay2.raml"]);
    });

    it ("Extension and overlay, reverse order",function(){

        util.testAST("parser/overlays/o10/api.raml", "parser/overlays/o10/ast2.txt",
            ["parser/overlays/o10/NewOverlay2.raml", "parser/overlays/o10/NewOverlay.raml"]);
    });

    it ("Extension and overlay chaining via masterRef",function(){

        util.testAST("parser/overlays/o11/NewOverlay2.raml", "parser/overlays/o11/ast.txt",
            [],[],true);
    });

    it ("Two extensions and overlay chaining via masterRef",function(){

        util.testAST("parser/overlays/o11/NewOverlay3.raml", "parser/overlays/o11/ast2.txt",
            [],[],true);
    });

});



