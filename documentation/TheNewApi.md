# The New API (Beta)

This document describes the beta version of the new parser API and its differences compared to the old API, which will become deprecated after the new API is released and which will be removed at some distant point in future after that.

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
var api = raml.loadSync(fName);
console.log(JSON.stringify(api, null, 2));

```

Run ```node getting_started.js``` again. If you see the JSON reflecting RAML file AST in the output, then RAML was parsed correctly.

## Parsing Basics

There are two modes for RAML parsing: synchronous and asynchronous.

`loadSync` method takes RAML file path as an argument and can take an optional argument containing a map of options. The returning value is JSON object.

Typical call looks like:
```js
var apiJSONObject = raml.loadSync(fName);
//here come manipulations with JSON, in example it can be printed
console.log(JSON.stringify(api, null, 2));
```

`load` method takes RAML file path as an argument and can take an optional argument containing a map of options. The returning value is a promise with JSON object as a result.

Typical call looks like:
```js
raml.load(fName).then(function(api){
  //here come manipulations with JSON, in example it can be printed
  console.log(JSON.stringify(api, null, 2));
})
```

The optional second argument of both `load` and `loadSync` methods is a map with some options. For now it only has the following parameters:

* `expandLibraries` - Whether to expand libraries

* `fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

* `httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter.


Sample call:
```js
var apiJSONObject = raml.loadSync(fName, {expandLibraries:false});
```

## The differences in API

A typical call with the old API with JSON as a final result looks like this:
```js
raml.loadApi(fName).then(function(apiTopLevel){

  apiTopLevel = apiTopLevel.expand(true)

  var apiJSON = apiTopLevel.toJSON({rootNodeDetails: true, serializeMetadata: true})

  console.log(JSON.stringify(apiJSON, null, 2));
})
```

Now the call looks like:

```js
raml.load(fName).then(function(apiJSON){

  console.log(JSON.stringify(apiJSON, null, 2));
})
```

In other words, user does not need to know about expansion and call it manually, user does not need to know about AST and perform its conversion to JSON manually.

The number of options and both `load***` method arguments were severily reduced too. Basically, there is a single option at the moment, probably we'll have to add another one for an ability to set up a custom file resolver.

## The differences in JSON

JSON result of the new `load` and `loadSync` methods is similar to what user was getting previously by calling `toJSON` for top-level API node.

Current output is described by the [JSON Schema](../tckJsonSchema/tckJsonSchema.json).

Following are the differences:

**Improvements**

| Schema Field | Current Type | Change |RAML version|
|:---------------|:---------------|:---------------|:----|  
| `mediaType` | Its either a `string` or an `array` | Only `array` |1.0|
| `types` | An `array` of single key objects | `map` |1.0|
| `traits` | An `array` of single key objects | `map` |1.0, 0.8|
| `resourceTypes` | An `array` of single key objects | `map` |1.0, 0.8|
| `annotationTypes` | An `array` of single key objects | `map` |1.0|
| `securitySchemes` | An `array` of single key objects | `map` |1.0, 0.8|
| `schemas` | Is serialized under the `schemas` key | serialize under the `types` key|1.0|
|`schema`| Is serialized under the `schema` key | serialize under the `type` key|1.0|
|`example` | Is serialized under the `example` key | serialize as one element array under the `examples` key|1.0|
|`value` (ExampleSpec) | string representation of example | actual example value: `string`, `object`, `array`, 'number', `boolean` or `null`|1.0|

**New**

| Field | Type | Description | RAML version |
|:---------------|:---------------|:--------------|:---------------|
| `completeRelativeUri`| `string` | Resource URI relative to Api root.  Adding it to any resource as a `string` value.| 1.0, 0.8 |
| `parentUrl` | `string` | For a nested resource it's the complete relative URI of its parent. For a top level resource it's an empty string. Adding it to any resource as a `string` value. | 1.0, 0.8 |
| `allUriParameters` | `array` | A union of URI parameters sets of the resource itself with URI parameters sets of all the resources which contain the resource. Adding it to any resource as an optional `array`.| 1.0, 0.8 |
| `allUriParameters`| `array` | `allUriParameters` value of the owning resource. Adding it to any method as an optional `array`.| 1.0, 0.8 |
| `mediaType` (for Type)| `string` | States the way of type definition: `application/json` or `application/xml` for external types and `application/raml+yaml` for the rest| 1.0 |

**Remove**
* `structuredExample`
* `structuredValue` (ExampleSpec)
