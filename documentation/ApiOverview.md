## RAML Parser API Summary

This section provides an overview of the top-level methods of RAML Parser API.

### Parsing Functions

- `load(path, [loadOptions])` - _new_ - returns JSON
- `loadSync(path, [loadOptions])` - _new_ - returns JSON
- `parse(path, [parseOptions])` - _new_ - returns high-level AST
- `parseSync(path, [parseOptions])` - _new_ - returns high-level AST


- `loadRAML(path, [extensionsAndOverlays], [topLevelOptions])` - returns top-level AST
- `loadRAMLSync(path, [extensionsAndOverlays], [topLevelOptions])` - returns top-level AST
- `loadApi(path, [extensionsAndOverlays], [topLevelOptions])` - returns top-level AST
- `loadApiSync(path, [extensionsAndOverlays], [topLevelOptions])` - returns top-level AST
- `parseRAML(content, [topLevelOptions])` - returns top-level AST
- `parseRAMLSync(content, [topLevelOptions])` - returns top-level AST

API methods that return top-level nodes are deprecated and may be removed in future.

#### `load(path, [options])` and `loadSync(path, [options])`

Loads the given RAML document and returns it as a single JavaScript object or its promise. This method does expand the original RAML document by applying traits, resource types, and also including libraries to generate a single JavaScript object.
Following [TypeScript typings](https://github.com/raml-org/raml-js-parser-2/tree/type-expansion/src/typings) and [JSON Schema](https://github.com/raml-org/raml-js-parser-2/blob/type-expansion/tckJSONSchema-newFormat/tckJsonSchema.json) describe the output.

Method gets file `path` string and optional [options](#load-options) map as parameters.

#### `parse(path, [options])` and `parseSync(path, [options])`

Parses the given RAML document and returns it as a high-level node or its promise. This method does expand the original RAML document by applying traits and resource types.
Following [Overview](https://github.com/raml-org/raml-js-parser-2/blob/type-expansion/documentation/GettingStartedHighLevel.md#high-level-ast-overview) provides examples of how to use the high-level AST.

Method gets file `path` string and optional [options](#parse-options) map as parameters.

#### `loadRAML(path, [extensionsAndOverlays], [options])` and `loadRAMLSync(path, [extensionsAndOverlays], [options])`

Loads the given RAML document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`.

Method gets file `path` string, optional `extensionsAndOverlays` string array and [top-level options](#top-level-options) map as parameters. `extensionsAndOverlays` is an array of additional extensions and overlays to be applied to the file specified in `path` parameter.

Following [documentation](https://raml-org.github.io/raml-js-parser-2/modules/_src_index_.html) describes the top-level AST.

This method is deprecated and will be removed in the distant future.

#### `loadApi(path, [extensionsAndOverlays], [options])` and `loadApiSync(path, [extensionsAndOverlays], [options])`

Loads the given RAML API document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`. Fails for fragment types different from API.

Method gets file `path` string, optional `extensionsAndOverlays` string array and [top-level options](#top-level-options) map as parameters. `extensionsAndOverlays` is an array of additional extensions and overlays to be applied to the file specified in `path` parameter.

Following [documentation](https://raml-org.github.io/raml-js-parser-2/modules/_src_index_.html) describes the top-level AST.

This method is deprecated and will be removed in the distant future.

#### `parseRAML(content, [options])` and `parseRAMLSync(content, [options])`

Loads the given RAML API document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`. Fails for fragment types different from API.

Method gets file `content` string and optional [top-level options](#top-level-options) map as parameters. Parser will still reach out from the original file contents if there are any outgoing links like libraries and includes.

Following [documentation](https://raml-org.github.io/raml-js-parser-2/modules/_src_index_.html) describes the top-level AST.

This method is deprecated and will be removed in the distant future.

#### Load Options

These options are being used by `load` and `loadSync` methods.

`fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

`httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter.

`expandExpressions` - Boolean. Enables expansion of the type expression strings into the type tree. Default is true. expandTypes enables this automatically. 

`serializeMetadata` - Boolean. Enables metadata nodes containing additional information regarding node origination, in particular, whether the node actually exists in original RAML or was inserted by the parser for convenience. Default is false.

`expandTypes` - Boolean. Makes parser to perform type expansion, including the replacement of type names with respective type contents, joining type hierarchies, resolving unions variants. Default is false.  

`typeExpansionRecursionDepth` - Integer. Number of times, type cycles are inserted. Default is 1. 

`sourceMap` - Enables metadata nodes containing additional information regarding node source, in particular, file path, start and end positions. Default is true. 

`expandLibraries` - Whether to expand libraries. Default is true.

#### Parse Options

These options are being used by `parse` and `parseSync` methods.

`fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

`httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter. 

#### Top Level Options

These options are being used by `loadRAML`, `loadRAMLSync`, `loadApi`, `loadApiSync`, `parseRAML` and `parseRAMLSync` methods.

`attributeDefaults` - Boolean. If true, attribute defaults will be returned if no actual vale is specified in RAML code. Affects only attributes. Default is true.

`filePath` - String. Absolute path of the RAML file. May be used when content is provided directly on RAML parser method call instead of specifying file path and making the parser to load the file.

`fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

`httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter.

`rejectOnErrors` - Boolean. Whether to return Api which contains errors. If false, asynchronous methods promise result will fail. Default is false.
