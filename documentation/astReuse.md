## AST Reusing Mechanism

### Overview

The mechanism allows reusing high level AST nodes defined outside the main specification file when
building AST for the modified specification.
The mechanism is activated when the following conditions are satisfied:

* the modification takes place in the main RAML file of the specification

* the modification does not take place inside definition of
  * type
  * resource type
  * trait
  * resource type reference (`Resource.type` value)
  * trait reference (`Method.is` or `Resource.is` value)

### AST reuse API

In order to try activating the mechanism you should pass as `reusedNode` option root node of the
specification which is supposed to be reused:


``` javascript
import parser = require("raml-1-parser");

var absolutePath:string; //path to the main specification RAML file

var rNode:parser.hl.IHighLevelAstNode; //the root node of the specification to be reused

var newApi = parser.loadRAMLSync(absolutePath, {reusedNode : rNode});
```

You may also implement a method for reloading specification and reusing the previous result if possible:

``` javascript
import parser = require("raml-1-parser");

function reloadAPIAndReuseNode(rNode:parser.hl.IHighLevelASTNode):parser.hl.BasicNode{

    var absolutePath = rNode.lowLevel().unit().absolutePath();

    return parser.loadRAMLSync(absolutePath, {reusedNode : rNode});
}
```

The parser itself is capable of checking whether AST reuse can be applied.
