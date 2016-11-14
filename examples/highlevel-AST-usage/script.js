var parser = require("../../dist/index");
var path = require("path");

var spec = parser.loadApiSync(path.resolve(__dirname,"./example-spec/api.raml"));

//Each RAML element is represented by `IHighLevelNode` instance
//High level AST nodes are obtained from top level AST nodes by the
//`BasicNode.highLevel()` method
var apiNode = spec.highLevel();


// Scalar values are represented by `IAttribute` instances.
// For retrieving an attribute by its name use the `IHighLevelNode.attr()` method
var titleAttr = apiNode.attr("title");

//For obtaining actual attribute value use the `IAttribute.value()` method
console.log("API title: " + titleAttr.value());

//Each value component of a multivalue property is represented by a separate `IAttribute` instance.
//For retrieving an array of such attributes use the `IHighLevelNode.attributes()` method
 var securedByAttrs = apiNode.attributes("securedBy");
console.log("Used security schemes:");
securedByAttrs.forEach(function(x){

    //Here we again use the `IAttribute.value()` method for obtaining scalar value
    var schemaName = x.value();

    //The 'securedBy' property value is in fact a security scheme references array.
    //Here we use the `IAttribute.findReferencedValue()` method in order to obtain
    //AST node containing definition of the referenced security scheme
    var securitySchemaNode = x.findReferencedValue();

    var ssType = securitySchemaNode.attr("type").value();
    console.log(schemaName + ": " + ssType);
});

//Values of non scalar properties are represented by `IHighLevelNode` instances.
//In order to obtain all nodes which together form value of particular non scalar property
//use the `IHighLevelNode.elementsOfKind()` method
apiNode.elementsOfKind("resources").forEach(function(resourceNode){

    resourceNode.elementsOfKind("methods").forEach(function(methodNode){
        methodNode.attributes("annotations").forEach(function(aNode){

            //Here we again use the `IAttribute.findReferencedValue()` method
            //in order to obtain AST node which difines the referenced RAML element
            var aDefinitionNode = aNode.findReferencedValue();

            //For working with types we suggest using the nominal typesystem
            //See the 'Nominal Type System' section of the getting started guilde
            //for details
            var aDef = aDefinitionNode.localType();
            var fixedFacets = aDef.allFixedFacets();
            console.log(JSON.stringify(fixedFacets,null,2));
        });

        methodNode.elementsOfKind("responses").forEach(function(responseNode){
            responseNode.elementsOfKind("body").forEach(function(bodyNode){

                //Here we again switch to the nominal typesystem in order to work with the
                //body type
                var bodyDef = bodyNode.localType();
                console.log("Body media type: " + bodyDef.nameId());
                if(bodyDef.isObject()){
                    console.log("Body properties:");
                    bodyDef.allProperties().forEach(function(prop){
                       console.log(prop.nameId() + ": " + prop.range().nameId());
                    });
                }
            });
        });
    });
});