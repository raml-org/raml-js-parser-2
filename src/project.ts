import limpl=require("./parser/jsyaml/jsyaml2lowLevel")
import ll=require("./parser/lowLevelAST")
import rs=require("./parser/jsyaml/resolversApi")
export function createProject(path:string,r?:rs.FSResolver,h?:rs.HTTPResolver):ll.IProject{
    return new limpl.Project(path,r,h);
}