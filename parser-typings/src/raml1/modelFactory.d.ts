import hl = require("./highLevelAST");
import core = require("./wrapped-ast/parserCore");
export declare function buildWrapperNode(node: hl.IHighLevelNode): core.BasicNode;
