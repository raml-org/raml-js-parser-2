# Getting Started

## Intro

This document is intended to provide an initial knowledge of how to use RAML 1.0 JavaScript parser.

## Installation

###	Pre-required software

1.	[NodeJS](https://nodejs.org/en/download/)
2.	Install [git](https://git-scm.com/downloads)

###	RAML 1.0 JavaScript parser installation

NPM installation is recommended, but taking a quick look at the parser can be done via repository cloning.

#### Cloning Repository

Run the following command-line instructions:

```
git clone https://github.com/raml-org/raml-js-parser-2

cd raml-js-parser-2

npm install typescript // This line is temporary and required only to workaround a bug. To remove.

npm install
```

Quick tests:

```
node test/test.js  //here you should observe JSON representation of XKCD API in your console

node test/testAsync.js  //same as above but in asynchronous mode
```

If there are no any exceptions, RAML JS Parser is installed successfully

#### NPM installation

Run command line tool and create a folder where all you test files will be stored.


Run `npm init`

Run `npm install raml-1-parser --save` and wait while all the dependencies are downloaded
and properly initialized.

Run ```node node_modules/raml-1-parser/test/test01.js```. If there are no any exceptions, RAML JS Parser is installed successfully

## Creating test files

These instructions assume that JS Parser was installed via NPM.

Use your favorite text editor to create `getting_started.js` JS file in root of the module and add require instruction like that:

```js
// step1
var raml = require("raml-1-parser");
```

Create `test.raml` file in the same folder with the following contents:
```RAML
#%RAML 1.0
title: Pet shop
version: 1
baseUri: /shop

types:
  Pet:
    properties:
      name: string
      kind: string
      price: number
    example:
      name: "Snoopy"
      kind: "Mammal"
      price: 100

/pets:
  get:
    responses:
      200:
        body:
          application/json:
            type: Pet[]
  post:
    body:
      application/json:
        type: Pet
  /{id}:
    put:
      body:
        application/json:
          type: Pet
    delete:
      responses:
        204:

```

To do this, create your RAML 1.0 file using Atom editor with installed [apiworkbench plugin](http://apiworkbench.com/).

Edit your `getting_started.js` file to include RAML file loading:
```js
// step2
var fs = require("fs");
var path = require("path");

// Here we create a file name to be loaded
var fName = path.resolve(__dirname, "test.raml");

// Parse our RAML file with all the dependencies
var ast = raml.loadSync(fName);
console.log(JSON.stringify(ast, null, 2));

```

Run ```node getting_started.js``` again. If you see the JSON reflecting RAML file AST in the output, then RAML was parsed correctly.

## Basics of parsing

`ast` variable stores the root of AST. Its children and properties can be traversed and analyzed to find out the structure of RAML file.

Complete JSON Schema, which includes RAML 0.8, RAML 1.0 and errors description is published here: [Complete JSON Schema](https://github.com/raml-org/raml-js-parser-2/blob/master/tckJSONSchema-newFormat/tckJsonSchema.json).
For now, we need to know that `specification` property of `ast` stores the root RAML element defined by `Api10` in this part of JSON schema: [JSON Schema of RAML 1.0 Api](https://github.com/raml-org/raml-js-parser-2/blob/master/tckJSONSchema-newFormat/spec-1.0/api.json).

Inside `properties` of `Api10` we can see `title`, `documentation`, `version` and a lot of other properties:

```json
            "documentation": {"$ref": "#/definitions/Documentation"},
            "title": {
              "type": ["string", "null"],
              "description": "Short plain-text label for the API"
            },
            "description": {
              "type": "string",
              "description": "A substantial, human-friendly description of the API. Its value is a string and MAY be formatted using markdown."
            },
            "version": {
              "type": "string",
              "description": "The version of the API, e.g. 'v1'"
            },
```

Lets check `resources` property first:
```json
            "resources": {
              "type": "array",
              "description": "The resources of the API, identified as relative URIs that begin with a slash (/). Every property whose key begins with a slash (/), and is either at the root of the API definition or is the child property of a resource property, is a resource property, e.g.: /users, /{groupId}, etc",
              "items": {"$ref": "resources.json#/definitions/Resource10"}
            }
```


We see that it returns an array of resources `resources.json#/definitions/Resource10`.
Opening [resources.json](https://github.com/raml-org/raml-js-parser-2/blob/master/tckJSONSchema-newFormat/spec-1.0/resources.json) and finding `Resource10` element definition in the schema reveals it contains some more properties in turn:

```
          "displayName": {
              "type": "string",
              "description": "Resource name"
          }
          "resources": {
              "type": "array",
              "description": "A nested resource is identified as any property whose name begins with a slash (\"/\") and is therefore treated as a relative URI.",
              "items": {"$ref": "#/definitions/Resource10"}
          },
          "relativeUri": {
              "type": "string",
              "description": "Relative URL of this resource from the parent resource"
          },
          "relativeUriPathSegments": {
              "type": "array",
              "description": "URI Segments",
              "items": {
                  "type": "string"
              }
          },
          "absoluteUri": {"type": "string"},
          "completeRelativeUri": {"type": "string"},
          "parentUri": {"type": "string"}
```

Lets try checking resources and printing them in a simple way. Remove `console.log(JSON.stringify(api, null, 2));` line from `getting_started.js` code and add the following:

```js
var api = ast.specification;

var apiResources = api.resources;
apiResources.forEach(function (resource) {
    console.log(resource.absoluteUri);
});
```

The output is:
```
/shop/pets
```

Here, the `absoluteUri` property and its description can be found in `Resource10` element of the schema.

But why only `/shop/pets` is listed, and `/shop/pets/{id}` is not? Because AST is hierarchical, so `API` only has `/shop/pets` as a direct child, and `/shop/pets/{id}` is a child of `/shop/pets`.

Lets see if we can modify our code to print the whole resource tree:

```js
// step1
var raml = require("raml-1-parser");

// step2
var fs = require("fs");
var path = require("path");

// Here we create a file name to be loaded
var fName = path.resolve(__dirname, "test.raml");

// Parse our RAML file with all the dependencies
var ast = raml.loadSync(fName);

var api = ast.specification;

var apiResources = api.resources;

/**
 * Process resource (here we just trace different paramters of URL)
 **/
function processResource(res) {
    // User-friendly name (if provided)
    if (res.displayName) {
        console.log(res.displayName);
    }

    // Trace resource's relative URI
    var relativeUri = res.relativeUri;
    // Next method returns full relative URI (which is equal with previous one
    // for top-level resources, but for subresources it returns full path from the
    // resources base URL)
    var completeRelativeUri = res.completeRelativeUri;
    // trace both of them
    console.log(completeRelativeUri, "(", relativeUri, ")");

    // Let's enumerate all URI parameters
    if (res.uriParameters) {

        Object.keys(res.uriParameters).forEach(function(key){

            var uriParam = res.uriParameters[key];
            // Here we trace URI parameter's name and types
            console.log("\tURI Parameter:", uriParam.name, uriParam.type.join(","));
        })
    }

    // Recursive call this function for all subresources
    if (res.resources) {

        Object.keys(res.resources).forEach(function(key){

            var subRes = res.resources[key];
            processResource(subRes);
        })
    }
}

// Enumerate all the resources
Object.keys(apiResources).forEach(function(key){
    processResource(apiResources[key])
})
```

The output is following:
```
/pets ( /pets )
/pets/{id} ( /{id} )
	URI Parameter: id string
```

Here, we use recursion to traverse resources, and for each resource print its `completeRelativeUri`, `relativeUri`, and `allUriParameters`. The description of each property can be found in `Resource10` element of the schema.

Lets print all the methods in the same way, but first lets check `methods` property and find its description. This property is not in `Resource10` definition itself, but rather in its ancestor `ResourceBase10`, which can be noticed in:

```json
"Resource10": {
  "allOf":[
      {"$ref": "#/definitions/ResourceBase10"}
  ]
}
```

The property defines an array of `methods.json#/definitions/Method10`.
Opening [methods.json](https://github.com/raml-org/raml-js-parser-2/blob/master/tckJSONSchema-newFormat/spec-1.0/methods.json) and finding `Method10` element definition in the schema reveals its properties.

Lets replace `processResource` method contents with the following:
```js
console.log(res.absoluteUri)

Object.keys(res.methods).forEach(function(key){
    var method = res.methods[key];
    console.log("\t"+method.method)
})
```

The output:
```
/shop/pets
	get
	post
```

`method` method of `Method` class prints HTTP type of the method.

Lets print the responses too:
```js
console.log(res.absoluteUri)

Object.keys(res.methods).forEach(function(key){
    var method = res.methods[key];

    console.log("\t"+method.method)

    if (method.responses) {
        Object.keys(method.responses).forEach(function (key) {
            console.log("\t\t" + method.responses[key].code)
        })
    }
})
```

The output is:
```
/shop/pets
	get
		200
	post
```

All in all, the AST tree reflects RAML structure, so starting from `loadSync` global method, then checking documentation for its return value, proceeding to its properties and doing that recursively allows reaching everything.

## Resource Types and Traits

This section describes how to analyze resource types. Traits are analyzed in the same way.

### Automatic expansion

Lets change our RAML file to look like this:

```RAML
#%RAML 1.0
title: Pet shop
version: 1
baseUri: /shop

types:
  Pet:
    properties:
      name: string
      kind: string
      price: number
    example:
      name: "Snoopy"
      kind: "Mammal"
      price: 100

resourceTypes:

  Collection:
    get:
      responses:
        200:
          body:
            application/json:
              type: Pet[]
    post:
      body:
        application/json:
          type: Pet

  Member:
    put:
      body:
        application/json:
          type: Pet
    delete:
      responses:
        204:

/pets:
  type: Collection

  /{id}:
    type: Member

```

It differs from the previous sample by method declarations being moved to resource types, the real resources and methods structure remains the same.

Launching example from the previous section produces the following output:

Results are:

```
/shop/pets
	get
		200
	post
/shop/pets/{id}
	put
	delete
		204
```

So `loadSync` and `load` methods automatically expand traits and types, which are applied automatically, and the final structure is returned.

### Getting the name of resource type from its application

We can see the resource type applications itself:

```js
console.log(apiResources[0].type)
```

Here we take the `/pets` resource, getting its type and printing the value of the type.

The output is:
```
Collection
```

### Getting resource type declarations

Modify `getting_started.js` file contents in the following way:

```js
var raml = require("raml-1-parser");

var fs = require("fs");
var path = require("path");

// Here we create a file name to be loaded
var fName = path.resolve(__dirname, "test.raml");

// Parse our RAML file with all the dependencies
var ast = raml.loadSync(fName);

var api = ast.specification;

var apiResourceTypes = api.resourceTypes;

Object.keys(apiResourceTypes).forEach(function(key){

    var resourceType = apiResourceTypes[key];
    console.log(resourceType.name)

    Object.keys(resourceType.methods).forEach(function(key){
        var method = resourceType.methods[key];

        console.log("\t"+method.method)

        if (method.responses) {
            Object.keys(method.responses).forEach(function (key) {
                console.log("\t\t" + method.responses[key].code)
            })
        }
    })
})
```

Here we ask API for resource type declarations and print type names.

The output:
```
Collection
Member
```

And now we will print methods and responses for each resource type the same way we did previously for API:
```js
Object.keys(apiResourceTypes).forEach(function(key){

    var resourceType = apiResourceTypes[key];
    console.log(resourceType.name)

    Object.keys(resourceType.methods).forEach(function(key){
        var method = resourceType.methods[key];

        console.log("\t"+method.method)

        if (method.responses) {
            Object.keys(method.responses).forEach(function (key) {
                console.log("\t\t" + method.responses[key].code)
            })
        }
    })
})
```

The output:

```
Collection
	get
		200
	post
Member
	put
	delete
		204
```
