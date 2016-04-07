import limpl=require("./raml1/jsyaml/jsyaml2lowLevel")
import ll=require("./raml1/lowLevelAST")
import rs=require("./raml1/jsyaml/resolversApi")
export function createProject(path:string,r?:rs.FSResolver,h?:rs.HTTPResolver):ll.IProject{
    return new limpl.Project(path,r,h);
}