## RAML Parser API Summary

This section provides an overview of the top-level methods of both current API and beta version of the new API combined.
Current API methods stay as-is and are not changed in any way compared to the current state, the only difference is in the JSON output.

### Parsing Functions

_There are dedicated functions for executing below functions synchronously (function name + `Sync`) or asynchronously. For example, `load` is an asynchronous function and returns a promise where as `loadSync` is synchronous. The below list only covers the asynchronous functions since the main purpose is exactly the same._

- `load(path, [options])` - new
- `loadRAML(path, [extensionsAndOverlays], [options])` - current
- `loadApi(path, [extensionsAndOverlays], [options])` - current
- `parseRAML(content, [options])` - current

Current API methods may be deprecated in future when an alternative based on high-level AST is ready. It is recommended to use the new API when possible.

#### `load(path, [options])`

Loads the given RAML document and returns it as a single JavaScript object. This method does expand the original RAML document by applying traits, resource types, and also including libraries to generate a single JavaScript object.

Method gets file `path` string and optional `options` map as parameters.

#### `loadRAML(path, [extensionsAndOverlays], [options])`

Loads the given RAML document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`.

Method gets file `path` string, optional `extensionsAndOverlays` string array and `options` map as parameters. `extensionsAndOverlays` is an array of additional extensions and overlays to be applied to the file specified in `path` parameter.

This method will be removed in the distant future.

#### `loadApi(path, [extensionsAndOverlays], [options])`

Loads the given RAML API document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`. Fails for fragment types different from API.

Method gets file `path` string, optional `extensionsAndOverlays` string array and `options` map as parameters. `extensionsAndOverlays` is an array of additional extensions and overlays to be applied to the file specified in `path` parameter.

This method will be removed in the distant future.

#### `parseRAML(content, [options])`

Loads the given RAML API document and returns it as top-level API node promise. This node can be further expanded by calling `expand(true)` and converted to JSON by calling `toJSON()`. Fails for fragment types different from API.

Method gets file `content` string and optional `options` map as parameters. Parser will still reach out from the original file contents if there are any outgoing links like libraries and includes.

This method will be removed in the distant future.

#### Current API Options

* `attributeDefaults` - If true, attribute defaults will be returned if no actual vale is specified in RAML code. Affects only attributes.

* `filePath` - Absolute path of the RAML file. May be used when content is provided directly on RAML parser method call instead of specifying file path and making the parser to load the file.

* `fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

* `httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter.

* `rejectOnErrors` - Whether to return Api which contains errors. If false, asynchronous methods promise result will fail.


#### New API Options

* `expandLibraries` - Whether to expand libraries

* `fsResolver` - Module used for operations with file system. Should implement `content` method returning file contents taking file path as a parameter and `contentAsync` method returning file contents promise and taking file path as a parameter.

* `httpResolver` - Module used for operations with web. Should implement `getResource` method returning file contents taking file url as a parameter and `getResourceAsync` method returning file contents promise and taking file url as a parameter.
