## High Level AST Tutorial

### Obtaining The Root Node
Each RAML element is represented by `IHighLevelNode` instance.
High level AST nodes are obtained from top level AST nodes by the
`BasicNode.highLevel()` method:

```
var spec = parser.loadApiSync(apiPath);
var apiNode = spec.highLevel();
```

### Obtaining Scalar Property Values

Scalar values are represented by `IAttribute` instances.
For retrieving an attribute by its name use the `IHighLevelNode.attr()` method.
Lets, for example, take the `title` attribute:
```
var titleAttr = apiNode.attr("title");
```

For obtaining actual attribute value use the `IAttribute.value()` method:
```
console.log("API title: " + titleAttr.value());
```

Each value component of a multivalue property is represented by a separate `IAttribute` instance.
For retrieving an array of such attributes use the `IHighLevelNode.attributes()` method.
Lets, for example, retrieve `Api.securedBy` property value:
```
var securedByAttrs = apiNode.attributes("securedBy");
```

### Obtaining Referenced Elements

Each attribute representing a reference provides access
to definition of the referenced element by means of the `IAttribute.findReferencedValue()` method.

For example, the `securedBy` property value is in fact a security scheme references array.
Lets call the method for one of these attributes and retrieve type of the scheme:
```
var securitySchemeRef = securedByAttrs[0];
var securitySchemaNode = securitySchemeRef.findReferencedValue();
var ssType = securitySchemaNode.attr("type").value();
```

### Obtaining Non Scalar Property Values

Values of non scalar properties are represented by `IHighLevelNode` instances.
In order to obtain all nodes which together form value of particular non scalar property
the `IHighLevelNode.elementsOfKind()` method should be used.

Lets, for example, retrieve all top level resources of the API:
```
var resources = apiNode.elementsOfKind("resources");
```

Lets now take all body nodes of one of the methods:

```
var methods = resources[0].elementsOfKind("methods");
var responses = methods[0].elementsOfKind("responses");
var bodies = responses[0].elementsOfKind("body");
```

### Exploring Types

For working with types we suggest switching to the nominal type system.
One may obtain nominal type form `IHighLevelNode` instance representing the type by means of
the `IHighLevelNode.localType()` method.

Lets examine type of one of the bodies:

```
var bodyNode = bodies[0];
var bodyDef = bodyNode.localType();

console.log("Body media type: " + bodyDef.nameId());
if(bodyDef.isObject()){
    console.log("Body properties:");
    bodyDef.allProperties().forEach(function(prop){
        console.log(prop.nameId() + ": " + prop.range().nameId());
    });
}

See the [Nominal Type System](https://github.com/raml-org/raml-js-parser-2/blob/highlevel-documentation/documentation/GettingStarted.md#nominal-type-system)
section of the getting started guide for more examples.