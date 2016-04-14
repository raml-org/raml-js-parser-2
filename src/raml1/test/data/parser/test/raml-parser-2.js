'use strict';
var path = require('path');

console.log(path.resolve(__dirname,'../../../../../../dist/raml1/artifacts/raml08parser'))
var converter = require('../../../../../../dist/util/ramlToJson08');
var raml1Parser = require('../../../../../../dist/raml1/artifacts/raml08parser');
var fs = require('fs');


function load(definition, location, theOptions) {
  //console.log("\n"+definition+"\n");//TODO delete console output
  var options = theOptions || {};
  options.rejectOnErrors = true;
  if (theOptions&&theOptions.validate===false){
    options.rejectOnErrors=false;
  }

  options.attributeDefaults = options.transform != null ? options.transform : true;

  options.fsResolver = {
    contentAsync: function (filePath) {
      if (!filePath || path.extname(filePath) !== '.raml') {
        return Promise.reject('file name/URL cannot be null');
      }
      return Promise.resolve(definition);
    },
    content: function (path){
      try {
        return fs.readFileSync(path).toString();
      } catch (Error) {
        return null;
      }
    },
    list: function () {
      return [];
    }
  };

  options.httpResolver = {
    getResource: function (path){
      var sm="http://localhost:9001/test/";
      path=path.replace(sm,__dirname+"/")

      try {
        var content = fs.readFileSync(path).toString();
        return { content: content};
      } catch (Error) {
        return { errorMessage: Error.message};
      }
    },
    getResourceAsync: function (path) {
      var sm="http://localhost:9001/test/";
      path=path.replace(sm,__dirname+"/")

      try {
        var content = fs.readFileSync(path).toString();
        return Promise.resolve({ content: content});
      } catch (Error) {
        return Promise.reject({ errorMessage: Error.message})
      }

    }
  };

  //var ramlFileContent = fs.readFileSync("api.raml", 'utf-8');
//TODO  console.log("RAMLFILE_CONTENT: " + ramlFileContent);
 // fs.writeFileSync("/Users/vasil/Documents/tests/api.raml", ramlFileContent);

  return raml1Parser.loadApi('api.raml', options)
    .then(function (result) {
      //console.log('Api parsed.');
      result = result.expand();
      //console.log('Api expanded.');
        var ramlJSON = transformRAML(result, theOptions?theOptions['transform']:true, result.toJSON());
      return ramlJSON;
    })
    .catch(function (error) {
        return handleError(error)
    });
}

function handleError(error) {
  //console.log(error.stack)
  //console.log('Error:' + error);
  if (error && error.parserErrors) {
    var errors = error.parserErrors;
    if (errors.length == 1) {
      var err = errors[0];
      err.problem_mark = {
        column: err.column,
        line: err.line
      };
      return Promise.reject(err);
    } else if (errors.length > 1) {
      var resultError = new Error();
      resultError.message = "";
      errors.forEach(function(currentError){
        resultError.message += currentError.message;
      })
      resultError.problem_mark = {
        column: errors[0].column,
        line: errors[0].line
      };
      return Promise.reject(resultError);
    }
  } else if (error) {
    //console.log(error.stack)
    //console.log('Error:' + error);
    return Promise.reject(error);
  }
  throw new Error('Invalid Error returned by parser');
}

///Users/vasil/Documents/tests/raml-parsers-functional-tests/parsers/raml-parser-2.js
function loadFile(filePath, theOptions) {
  var options = theOptions || {};
  options.rejectOnErrors = true;

  return raml1Parser.loadApi(filePath, options)
    .then(function (api) {
      //api = api.expand();
      //return api.toJSON();
        console.log('Api parsed.');
        api = api.expand();
        console.log('Api expanded.');
        var ramlJSON = transformRAML(api, options?options['transform']:true, api.toJSON());
        return ramlJSON;
    })
    .catch(function (error) {
      return handleError(error)
    });
}

function transformRAML(node, hasTransforms) {
  //console.log("Transforming RAML")

  //console.log("Before first transformation")
  var nodeJSON = node.toJSON();

  if (node.resources().length > 0) {
    nodeJSON.resources = transformResources(node, nodeJSON);
  }

  //console.log("After first transformation")

  //return nodeJSON;

  try {
    var result = converter.convertToJson(node, hasTransforms)
  } catch (Error) {
    console.log(Error)
  }
  //console.log("After second transformation")

  //console.log("New JSON")
  //console.log(JSON.stringify(result, null, 4))

 // console.log("Old JSON:")
 // console.log(JSON.stringify(nodeJSON, null, 4))

  return result
}

function transformResources(node, nodeJSON) {
  var resourcesArray = [];

  node.resources().forEach(function (resource) {
    var resTransformation = resource.toJSON();
    if (typeof (resTransformation) == "string") {
      resTransformation = {};
    }
    try {
      resTransformation.relativeUri = resource.relativeUri().value();
    } catch (e){
      //console.log(resTransformation)
    }
    delete nodeJSON[resTransformation.relativeUri];

    if (resource.methods().length > 0) {
      resTransformation.methods = [];
      resource.methods().forEach(function (method) {
        var methodTransformation = method.toJSON();
        if (typeof(methodTransformation) == "string") {
          methodTransformation = {};
        }
        try {
          methodTransformation.method = method.method();
        } catch (e){

        }
        delete resTransformation[method.method()];
        resTransformation.methods.push(methodTransformation);
      });
    }

    if (resource.resources().length > 0) {
      resTransformation.resources = transformResources(resource, resTransformation);
    }
    resourcesArray.push(resTransformation);
  });
  return resourcesArray;
}

module.exports = {
  load: load,
  loadFile: loadFile,
  FileReader: function (cb) {
    this.callback = cb;
  }
};
