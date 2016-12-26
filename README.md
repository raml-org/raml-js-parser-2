# RAML 1.0 JS Parser

[![Build Status](https://travis-ci.org/raml-org/raml-js-parser-2.svg?branch=master)](https://travis-ci.org/raml-org/raml-js-parser-2)

See http://raml.org for more information about RAML.

This parser supports both RAML 0.8 and 1.0.

## Installation
```
npm install raml-1-parser

node node_modules/raml-1-parser/test/test01.js  //synchronously loads XKCD API from local file system and prints its JSON representation
node node_modules/raml-1-parser/test/testAsync01.js  //asynchronously loads XKCD API from local file system and prints its JSON representation
node node_modules/raml-1-parser/test/test02.js  //synchronously loads XKCD API from github and prints its JSON representation
node node_modules/raml-1-parser/test/testAsync02.js  //asynchronously loads XKCD API from github and prints its JSON representation


```

## Usage
* For parser usage example refer to `node_modules/raml-1-parser/test/test.js`
* For asynchrounous usage example refer to `node_modules/raml-1-parser/test/testAsync.js`

Parser documentation: https://raml-org.github.io/raml-js-parser-2/

Parser JSON output schema: https://github.com/raml-org/raml-js-parser-2/blob/master/tckJsonSchema/tckJsonSchema.json

Getting started guide: https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md

High-level usage example: https://github.com/raml-org/raml-js-parser-2/blob/master/examples/highlevel-AST-usage/tutorial.md

Validation plugins usage example: https://github.com/raml-org/raml-js-parser-2/blob/master/examples/validationPlugins

## Creating standalone browser package

Clone repository: `git clone https://github.com/raml-org/raml-js-parser-2.git`

Install modules: `npm install`

Install typings CLI if needed: `npm install typings --global`

Install parser typings: `typings install`

Build : `npm run build`

Generate browser package: `npm run generateBrowserVersion`, this will generate the package in `browserVersion` folder.

To generate debug-friendly browser package: `npm run generateBrowserVersionDev`

## Setting up parser development environment

Install typings CLI if needed: `npm install typings --global`

Clone repositories:
* `git clone https://github.com/mulesoft-labs/yaml-ast-parser.git`
* `git clone https://github.com/mulesoft-labs/ts-model.git`
* `git clone https://github.com/mulesoft-labs/ts-structure-parser.git`
* `git clone https://github.com/raml-org/typesystem-ts.git`
* `git clone https://github.com/raml-org/raml-definition-system.git`
* `git clone https://github.com/raml-org/raml-js-parser-2.git`

For each repository, preserving the order:
* Install modules: `npm install`
* Install typings: `typings install`
* Set up npm link: `npm link`

For each repository, preserving the order:
* Open dependencies: `cd node_modules`
* For each module `<module_name>` in `node_modules` belonging to the list above: `rm -rf <module_name>`
* For each module `<module_name>` in `node_modules` belonging to the list above: `npm link <module_name>`

For each repository, preserving the order:
* Build : `npm run build`

How to test: `gulp test`

## Launching TCK tests

Execute `npm run tck` in the commend line.
The script clones the `master` branch of the TCK repository to the `TCK` subfolder of the project and executes all the tests. The report file is `TCK/report.json`.

## Contributing
If you are interested in contributing some code to this project, thanks! Please first [read and accept the Contributors Agreement](https://api-notebook.anypoint.mulesoft.com/notebooks#bc1cf75a0284268407e4).

To discuss this project, please use its [github issues](https://github.com/raml-org/raml-js-parser-2/issues) or the [RAML forum](http://forums.raml.org/).
