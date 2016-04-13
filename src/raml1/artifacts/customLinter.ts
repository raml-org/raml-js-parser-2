import raml=require ("./raml10parserapi")
import hl=require("../highLevelAST")
import linter=require("../ast.core/linter")
function lint(h:raml.Api,acceptor:hl.ValidationAcceptor){
    h.resources().forEach(x=>{
        console.log("Linting!!!!!"+x.relativeUri());

    });
}