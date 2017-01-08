# RAML SDK: JS Parser Modules

This diagram displays all SDK modules, the lower part of the image contains JS Parser modules.

![Modules diagram](./ModulesDiagram.png)


RAML Parser modules are basically the parts of the parser, most tools will use the parser directly and never depend on other modules of the group, though some of the specialized tools may use some of the modules directly. Following modules belong to the group:
* raml-1-parser
* raml-definition-system
* raml-typesystem
* raml-xml-validation
* raml-json-validation
* ts-structure-parser
* yaml-ast-parser
* ts-model

## raml-1-parser
This module is the main entry point for RAML parsing and combines the whole parsing functionality into a single interface.

### Usage

Repository and installation: https://github.com/raml-org/raml-js-parser-2
Documentation: https://raml-org.github.io/raml-js-parser-2/modules/_src_index_.html
Getting started: https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md

### Architecture overview

AST consists of 5 layers: JSON output, top-level, high-level, low-level and yaml-level.

* Yaml-level is a result of YAML parsing by modified JS-YAML library for JS parser.
* Low-level is small and simple abstraction level on top of YAML, which hides certain details of YAML syntax we do not need to analyze the code. The conversion of yaml-level to low-level is manually written and small.
* High-level is the backbone of the parser. It does not have user-friendly methods, but it contains all the information about RAML structure. For example, this layer is used in API Workbench. The conversion of low-level to high-level is being performed by a manually written kernel, which is ruled by the generated runtime representation of the Definition System. That representation is formulated in terms of types, the same types we have as a feature of RAML 1.0 itself. That allows us to change RAML model on the fly taking into account user-defined types.
* Top-level were created in order to provide statically typed interface for users, which only need to analyze the model but not to change it, and want to do it in a simple way.  Top-level layer is generated from Definition System, being a set of annotated TypeScript objects. Definition System serves as a source for generated model (AST types) of RAML. The conversion of high-level to top-level is being generated from the Definition System. There are also a small number of manually-written helper methods.
* JSON output is designed for even simpler JS-based tools, it’s an almost direct conversion of top-level layer objects to JSON, with several helper methods being integrated into the output by default and also the control over the form we output collections.

Typesystem does also have its own internal model, being converted to the parser nominal types during the high-level parsing.

### Parsing process

Here we provide a simplified description of the steps and order of the parsing process. In practise, most of the layers are being built lazily, which allows skipping some of the steps without losing performance if needed.  

#### Step 1: YAML parsing

RAML code is converted into the first level of AST: YAML nodes. YAML nodes and the whole parsing process is based on JS-YAML library, but there are more data stored in the nodes compared to the original: positions are stored, nodes are assigned with kinds and Typescript interfaces to process data in object-oriented style.

#### Step 2: Low-level parsing

YAML nodes are converted to a more abstract low-level nodes, hiding some of the node details of YAML syntax we do not need to analyze the code. It is always possible to get YAML node from a low-level node if the detailed knowledge is needed.

#### Step 3: Low-level includes patching

At this stage all !include tag targets are resolved, the contents of the referenced units is also parsed up to the low-level.

Low-level trees of the included are integrated in place of include instructions, to hide unneeded include details from the upper levels. It is always possible to find out the original details if needed.

#### Step 4: High-level parsing

The definition of RAML built-in types are loaded from the raml-definition-system in terms of raml-typesystem nominal types.

Custom types from user code are being analyzed by raml-typsystem in terms of native typesystem types, then also converted to nominal types.

Afterwards the low-level nodes are converted to high-level nodes, where each high-level node is assigned a definition type (whether it is resource, method, particular user type, etc) and, potentially, a number of attributes and children, each of those having its own type recursively. Basically, node type defined what exactly can RAML document have in this particular node. User types are interpreted, so if any facets/restrictions are defined in the ancestors, this RAML node would have potential restrictions or new properties applied as if that was built into the language.

#### Step 5: Traits and Resource Types expansion

At this optional step Traits and Resource Types are applied, taking into account parameter values recursively, by adding more virtual low-level nodes, which in turn changes the high-level representation.

The more detailed algoritm is described here: https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#algorithm-of-merging-traits-and-methods

#### Step 6: Reference patching

If a trait or resource type is defined in a library, and that trait or resource type does in order depend on something (like a type) defined in yet another library, the original library may have to include an entity from that 2-nd library, current file does not import.

In example, for the following set of files:

api.raml:
```YAML
#%RAML 1.0
title: test API
version: v1
baseUri: https://example.com/raml
uses:
  lib1: lib1.raml

/resource:
  type: lib1.rt
  post:
```

lib1.raml:
```YAML
#%RAML 1.0
title: test API
version: v1
baseUri: https://example.com/raml
uses:
  lib1: lib1.raml

/resource:
  type: lib1.rt
  post:
```

lib2.raml:
```YAML
#%RAML 1.0  Library

annotationTypes:
  MyAnnotation: string

traits:
  myTrait:
    body:
      application/json:
        (MyAnnotation): stringValue
```

The expanded api.raml should contain a reference to MyAnnotation annotation (instance of this annotation type) while not including lib2.raml at all.

During this process, the dependencies are analyzed and required uses instructions are added, references are assigned with the proper namespaces. The result affects low-level nodes, which in turn modifies high-level representation.

#### Step 7: Libraries expansion

This process removes the links for external entities defined in the libraries by copying the definitions inside the current file and patching the references, recursively.

As a result, a the api:

```YAML
#%RAML 1.0
title: test

uses:
  Library: Library.raml

/resource:
  post:
    body:
      application/json:
        type: Library.TheType
```

referencing a library:

```YAML
#%RAML 1.0 Library
types:
  TheType:
    properties:
      test: string
```

Is transformed to:

```YAML
#%RAML 1.0
title: test

types:
  Library.TheType:
    properties:
      test: string

/resource:
  post:
    body:
      application/json:
        type: Library.TheType
```


The details are described here: https://github.com/raml-org/raml-js-parser-2/issues/371

The process operates by adding patched low-level nodes to the current tree, which in turn modifies high-level representation.

#### Step 8: Overlays and Extensions application

This process finds out the list of overlays and extensions to be applied to the current API either by checking parser arguments, or by checking extends instructions located in the RAML code. It supports extensions, which extend other overlays/extensions recursively.

After this list of extensions and overlays is found, the previous steps are repeated for each overlay/extension, afterwards the trees are merged.

Mering details are described here: https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#merging-rules

The process operates on high-level.

#### Step 9: Top-level parsing

At parser build time typescript files defining interfaces and implementation classes for the top-level nodes are generated.

The classes are generated based on the RAML description in the raml-definition-system.
Basically, the interface and class is generated for each RAML node, with getters defining its attributes and children. In example, we generate Api interface and ApiImpl class for Api node with resource(), title() etc getters, where title() returns a simple string and resources() getter returns the array of Resource objects.

At this stage, high-level tree is converted to the tree of such objects by matching node nominal definition type to a particular implementation class, creating its instance and initializing fields.

Note that besides properties defined in raml-definition-system there is also a number of custom helper methods, which add new properties to the objects or override the behavior of default getters in order to make these object more user-friendly and useful.
Step 10: Defaults application

At this point attribute value defaults and collectables are applied.

Defaults are either declaratively defined in the definition system (if possible), or have an appropriate ValueCalculator implementor entry defined in the AttributesDefaultCalculator aggregator, located in the parser module.

This operation is performed at top-level, but the calculators work on high-level.
Step 11: Conversion to JSON

Finally, top-level nodes are converted to JSON on request by walking around the top-level tree and calling property getters, then converting the results to JSON objects, sometimes using custom converters. The general look and feel of the JSON tree is similar to the one of top-level with the differences pointed to make it even more user-friendly and compatible with the old 0.8 RAML output format, and introduced as a result of user requests.

### Validation

Validation can be divided into structural and semantic.

**Structural validation of RAML:** checking the syntax and structure of the language, in other words it is things like “‘title’ property exists and is required”, or “value of ‘minimum’ property should be a number”, or “resources are coming under api”. Structural validation is performed by a manually written validation core, which is ruled by the generated runtime representation of the Definition System. This includes the structural validation caused by users creating facets, applying user-defined annotations etc as we dynamically update the runtime representation of definition system. This also includes validation of RAML’s base - YAML according to YAML language rules, which is performed by a JS-YAML library, we base  yaml-ast-parser on.

Following are the supported types of structure validation:
* YAML validation - located in yaml-ast-parser module.
* Structural validation of RAML - located in raml-1-parser module based on information obtained from raml-definition-system
* XSD validation (plugin) - located in raml-xml-validation module.
* JSON schema validation (plugin) - located in raml-json-validation module.

**Semantic validation of RAML** is performed by a manually written code. It is checking the things that require some algorithm to be written, for example validating that extensions can override nodes overlays can not. Another example is checking that example is valid according to schema.
This validation is located in raml-1-parser’s linter.ts and its dependencies, and in raml-typesystem.

The list is pretty incomplete as there are lots and lots of use cases, but the following are some examples:
* RAML types validation
* Validation examples against the types
* Value type validation (scalar, list, map, etc)
* Resource URLs validation for being original
* Annotation appliance validation
* Annotation context validation
* Include paths/urls validation
* Reference target availability validation
* Recursive references validation
* Value constraints validation
* Library paths validation
* Trait/Resource type parameters validation
* XML validation against XSD (plugin)
* JSON validation against JSON schema (plugin)

## raml-definition-system
This module contains the static declarative definition of what can be in RAML.

### Usage

Repository and installation: https://github.com/raml-org/raml-definition-system

raml-definition folder contains spec-1.0 and spec-0.8 subfolders, which define RAML types using annotated typescript classes. These classes, with the root in api.ts file serve as a description, each of their respective node.

Using these sources and ts-structure-parser module to parse them, the module produces detailed RAML10.json and RAML08.json RAML descriptions exposed via universeDumps module variable and serving as an input for raml-1-parser.

This module also builds a simplified universe.ts file, serving as a convenient way of referencing type and property names for high-level definitions inside raml-1-parser and any other modules using high-level layer.

## raml-typesystem
This module provides functionality of RAML types analysis and validation, including both validation of the type definition and validation of type instance against its definition.

### Usage
Repository and installation: https://github.com/raml-org/typesystem-ts

The are two type models provided by this module: native typesystem types and nominal types.

#### Native model

Native model can be obtained by calling loadType method and its analogues and it gets JSON type descriptions as an input. This one is designed for the users of the users of the module, which depend on it directly, skipping raml-1-parser.

As a result of loadType method user gets an instance of IParsedType interface defined in typesystem-interfaces.ts. Hierarchy can be analyzed using methods of IParsedType and its descendants.

Of the important methods to note are validate(), which validates type instance and  validateType(), which validates the type itself. Both methods return an instance of IStatus having error message and validation path pointing to a type or instance member causing the error.

Here is the code snapshot for type validation:

```js
var personType = ts.loadType( {
    type:"object",
    properties:{
        test : {
            type: "string[]",
            minItems:"blah"
        }
    }
})
var validationResult = personType.validateType();
if (!validationResult.isOk()) {
    validationResult.getErrors().forEach(function(error){
        console.log("Error [" + error.getMessage()
            + "] occurred at path ["
            + error.getValidationPathAsString() +"]")
    })
}
```

#### Nominal model

Nominal types are designed to be used in raml-1-parser itself, and to be exposed from raml-1-parser AST as runtime types, being an interpretation of user-defined types.

They can be obtained via the conversion from the native types, or directly from raml-1-parser AST:

```js
var types = api.types();
var astTypeNode = types.find(function(current){return current.name() == "TypeName"});
var runtimeType = astTypeNode.runtimeType();
```

Then the hierarchy at hands can be analyzed using a set of methods, defined in raml-typesystem /src/nominal-interfaces.ts. The runtime type got is an instance of ITypeDefinition interface. It can be found what it is by calling different check methods (`hasUnionInHierarchy` ,  `isValueType`, etc), and the appropriate representation can be got by calling converters (like `array`, `arrayInHierarchy`, `union`, `unionInHierarchy` etc). The difference between a simple coverter and 'inHierarchy' converter is that the latter will check this type's ancestors and return one if needed.

`properties` method will return the properties this type define, `allProperties` will also collect properties from supertypes. Of course there is no point to call `properties` for an array or union, instead the type should be converted to it's view as an instance of IArrayType or IUnionType and then get further calling `componentType` for array and `leftType`/`rightType` for a union. If the type is found to be of value type by calling `isValueType`, its name can be checked to find out strings/numbers/etc.

So the general approach is to recursively:
1. Analyze type's type.
2. Get the appropriate type's view
3. Depending on a found type's type proceed further by checking its properties/component type/left|right OR finish up with a leaf in case of a simple value type.

## raml-xml-validation
This module handles XSD validation and XML vs XSD validation for raml-1-parser.

### Usage

Repository and installation: https://github.com/mulesoft-labs/raml-xml-validation

To use this module in NPM mode, just the dependency from raml-1-parser is required, as raml-1-parser has an optional dependency from raml-xml-validation.

To use this module in its browser version, the HTML file, which includes raml-1-parser like this:

```html
       <script type="text/javascript" src="../../raml-1-parser.js"></script>
```

should also have the browser version of validation module included:

```html
       <script type="text/javascript" src="../../raml-xml-validation.js"></script>
```
Once the module is included, raml-1-parser picks its up automatically and starts providing the appropriate validation.

## ts-structure-parser
This module parses typescrypt type and interfaces to a simplified model. Is used primarily by the raml-typesystem to parse RAML model from typescript annotated classes. Is also used by raml-1-parser to parse custom helpers for the top-level AST layer.

### Usage

Repository and installation: https://github.com/mulesoft-labs/ts-structure-parser

```parseStruct``` method provided by the file path returns an instance of Module interface defined in index.ts file, which in turn contains classes, imports, enums etc.

## yaml-ast-parser
This module parses arbitrary YAML and is used by raml-1-parser to create an initial YAML AST layer being later converted to low-level and further on.

This module also provides YAML validation.

### Usage

Repository and installation: https://github.com/mulesoft-labs/yaml-ast-parser

load method provided with the YAML contents string returns an instance of YAMLNode defined in index.ts file, which kind property determines node subclass of YAMLMapping, YAMLScalar etc. Casting to a specific class allows obtaining more properties.

## ts-model

This module provides raml-1-parser with the simplified typescript model useful to generate top-level interfaces and implementation classes.

### Usage

Repository and installation: https://github.com/mulesoft-labs/ts-model

TSDeclModel.ts file provides a lot of classes to create an instance of typescript model, which have serializeToString() method to be called to get the actual typescript code generated.
