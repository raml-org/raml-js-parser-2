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

protocols:
  - application/json
  - application/xml

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
var apiNode = raml.parseSync(fName);
console.log(JSON.stringify(apiNode.toJSON(), null, 2));

```

Run ```node getting_started.js``` again. If you see the JSON reflecting RAML file AST in the output, then RAML was parsed correctly.

## High Level AST Overview

The [`IHighLevelNode`](./interfaces/_src_raml1_highlevelast_.ihighlevelnode.html) and [`IAttribute`](./interfaces/_src_raml1_highlevelast_.iattribute.html) instances are the bricks which high level AST is constructed of.
`IHighLevelNode` instances represent elements i.e. complex RAML structures such as `Api`, `Resource`, `TypeDeclaration` etc, and 
`IAttribute` instances represent attributes, i.e. those properties which may have scalars (or scalar arrays) as values, for example, `title`, `relativeUri`, `type` or `is`. If property value is an array, each array element is represented by a separate `IAttribute` instance.

Actual attribute value should be retrieved by means of the `IAtrtibute.plainValue` method.
Note that the same property may have scalar and complex value. For instance, `TypeDeclaration.type` may contain a string or an inline type declaration. `IAttribute` instance behavior would be slightly different in the former case. All cases of `IAttribute` representing non scalar value are considered individually in [Non Scalar Attributes](#non-scalar-attributes).

The `IHighLevelNode.definition` method provides RAML type associated with the node. The type is represented by an `ITypeDefinition` instance. The `ITypeDefinition.nameId` method returns name of the type and, thus, it can be used to identify a type. For more information about how to work with types see [Types](#types).

`ITypeDefinition` has several methods for retrieveing its children:

* `children` returns all children
* `elements` returns all child elements
* `attrs` returns all child attributes
* `attr(name:string)` returns an attribute with particular name. Should be used for single value properties.
* `attributes(name:string)` returns all attributes with particular name. May be used for both single value and multivalue properties.
* `element(name:string)` returns an element with particular name. Should be used for single value properties.
* `elementsOfKind(name:string)` returns all elements with particular name. May be used for both single value and multivalue properties.

The last four methods require property name as input. All RAML types properties are lested in the followiing tables: [RAML 1.0](./RAML10Classes.html) and [RAML 0.8](./RAML08Classes.html).



## Basics of parsing

The `apiNode` variable is an `IHighLevelNode` instance which represents root of high level level AST. Let's check that it is in fact an `Api`. Calling

```js
console.log("Node type: " + apiNode.definition().nameId());
```
produces the following output:
```
Node type: Api
```

All available `Api` properties are listed [here](./RAML10Classes.html#Api). Lets first retrieve api title.

```js
var titleAttr = apiNode.attr("title");
var titleValue = titleValue.plainValue();
console.log("Title: " + titleValue);
```

output:

```
Title: Pet shop
```

Lets now list all default protocols:

```js
var protocolsAttrs = apiNode.attrs("protocols");
console.log("Default protocols:")
protocols.forEach(function(x,i){
  console.log("" + (i+1) + ". " + x.plainValue());
});
```

Output:
```
Default protocols:
1. application/json
2. application/xml
```

Lets now obtain all root resources of the api and print their URIs.

```js
var apiResources = apiNode.elementsOfKind("resources");
apiResources.forEach(function (resource,i) {
    console.log("" + (i+1) + ". " + resource.attrr("relativeUri").value());
});
```

The output is:
```
1. /shop/pets
```

Lets see if we can modify our code to print the whole resource tree:

```js
var raml = require("raml-1-parser");
var fs = require("fs");
var path = require("path");

// Here we create a file name to be loaded
var fName = path.resolve(__dirname, "test.raml");

// Parse our RAML file with all the dependencies
var apiNode = raml.loadApiSync(fName);

/**
 * Process resource (here we just trace different paramters of URL)
 **/
function processResource(res,parentUri) {
    parentUri = parentUri || "";	
    // User-friendly name (if provided)
    var displayNameAttr = res.attr("displayName");
    if (displayNameAttr) {
        console.log(displayNameAttr.plainValue());
    }

    // Trace resource's relative URI
    var relativeUri = res.attr("relativeUri").plainValue();
    // Next we form full relative URI (which is the one relative to the API root)
    var completeRelativeUri = parentUri + relativeUri;
    // trace both of them
    console.log(completeRelativeUri, "(", relativeUri, ")");

    // Recursive call this function for all subresources
    var subsesources = res.elementsOfKind("resources");
    for (var subResNum = 0; subResNum < res.resources().length; ++subResNum) {
        var subRes = res.resources()[subResNum];
        processResource(subRes);
    }
}

// Process all the root resources
var apiResources = apiNode.elementsOfKind("resources");
for (var resNum = 0; resNum < apiResources.length; ++resNum) {
    processResource(apiResources[resNum]);
}
```

The output is following:
```
/pets ( /pets )
/pets/{id} ( /{id} )
```

Here, we use recursion to traverse resources, and for each resource print its complete relative URI and relative URI.

## Non Scalar Attributes


### Template References


### Annotations


### Inline Types
