# RAML 1.0 JS Parser <sup>(beta)</sup>

See http://raml.org for more information about RAML.

This parser is at a beta state of development, as part of the API Workbench development cycle (http://apiworkbench.com).

## Installation
```
git clone https://github.com/raml-org/raml-js-parser-2

cd raml-js-parser-2

npm install

node test/test.js  //here you should observe JSON representation of XKCD API in your console

node test/testAsync.js  //same as above but in asynchronous mode
```

## Usage
* For parser usage example refer to `test/test.js`
* For asynchrounous usage example refer to `test/testAsync.js`

##Web
In order to use your parser dependent code on web you may call the `web-tools/webPackage` script for your code in order to construct a Webpack bundle. The script accepts following command line parameters:

* *-srcPath*(required) Absolute or relative path to JS file using the parser and which, in turn, is used by the HTML page
* *-dstPath*(required) Path to the resulting bundle
* *-uglify* If present, the resulting bundle is subjected to optimization

The script requires following modules: `webpack` and `mkdir`. These may be installed locally:
```
npm install webpack
npm install mkdirp
```
or globally (in this case the should be linked to the project) 
```
npm install webpack -g
npm install mkdirp -g
npm link webpack
npm link mkdirp
```
Example can be found at `examples/web-example`. In order to regenerate example bundle, run
```
node ./web-tools/webPackage.js -srcPath ./examples/web-example/page.js -dstPath ./examples/web-example/bundle/bundle.js
```
from the project root.
