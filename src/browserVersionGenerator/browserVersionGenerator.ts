/// <reference path="../../typings/main.d.ts" />
import Opt = require('../Opt');
import util = require('../util/index');
import fs = require("fs");
import path = require("path");
import mkdirp = require("mkdirp");
var webpack = require("webpack");
import depMan=require("../raml1/tools/dependencyManager");
import fsutil=require("../util/fsutil");
import cp = require('child_process')
import _=require("underscore")

function createBrowserPackage(minify = true) {
    console.log("Minify: " + minify);
    var rootPath = path.join(__dirname, "../../");

    var rootFile = path.join(rootPath, "/dist/index.js");

    var targetFolder = path.join(rootPath, "browserVersion");

    var targetFile = path.join(targetFolder, "raml-1-parser.js");

    mkdirp.sync(targetFolder);

    copyStaticBrowserPackageContents(targetFolder, path.join(rootPath, "package.json"));

    webPackForBrowser(rootPath, rootFile, targetFile, minify);
}

/**
 *
 * @param parserRootFolder - full path to cloned parser repository root folder
 * @param rootFile - full path to parser index JS file
 * @param targetFileName
 * @param callback
 */
function webPackForBrowser(parserRootFolder: string, rootFile : string, targetFile : string, minify: boolean) {
    console.log("Preparing to Webpack browser bundle:");

    var plugins = [];
    if (minify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: { warnings: false }
        }));
    }

    var relativeFilePath = path.relative(parserRootFolder, rootFile);
    relativeFilePath = "./"+relativeFilePath;

    var targetFolder = path.dirname(targetFile);
    var targetFileName = path.basename(targetFile);

    var config = {
        context: parserRootFolder,

        entry: relativeFilePath,

        output: {
            path: targetFolder,

            library: ['RAML', 'Parser'],

            filename: targetFileName,

            libraryTarget: "umd"
        },

        plugins: plugins,

        module: {
            loaders: [
                { test: /\.json$/, loader: "json" }
            ]
        },
        externals: [
            {
                // "buffer" : true,
                // "concat-stream" : true,
                // "esprima" : true,
                "fs" : true,
                "libxml-xsd" : true,
                // "http-response-object" : true,
                // "json-schema-compatibility" : true,
                // "json-stable-stringify" : true,
                // "know-your-http-well" : true,
                // "loophole" : true,
                // "lrucache" : true,
                // "media-typer" : true,
                // "path" : true,
                // "pluralize" : true,
                // "then-request" : true,
                // "typescript" : true,
                // "underscore" : true,
                // "url": true,
                // "xmldom" : true,
                // "xmlhttprequest": true,
                // "xhr2": true,
                // "z-schema" : true,
            }
        ],
        node: {
            console: false,
            global: true,
            process: true,
            Buffer: true,
            __filename: true,
            __dirname: true,
            setImmediate: true
        }
    };

    webpack(config, function(err, stats) {
        if(err) {
            console.log(err.message);

            return;
        }

        console.log("Webpack Building Browser Bundle:");

        console.log(stats.toString({reasons : true, errorDetails: true}));
    });
}

function copyStaticBrowserPackageContents(browserDestinationPath : string, packageJsonPath: string) {
    var browserStaticPackagePath = path.resolve(__dirname, "../../src/browserVersionGenerator/static");

    if(!fs.existsSync(browserStaticPackagePath)) {
        console.log("Can not find static browser package: " + browserStaticPackagePath);
        return;
    }

    var packageJsonContents = fs.readFileSync(packageJsonPath).toString();
    var config = JSON.parse(packageJsonContents);
    var moduleVersion = config.version;

    var bowerJsonContents = fs.readFileSync(path.resolve(browserStaticPackagePath, "bower.json")).toString();
    var updatedBowerJsonContents = bowerJsonContents.replace("$version", moduleVersion);
    fs.writeFileSync(path.resolve(browserDestinationPath, "bower.json"), updatedBowerJsonContents)

    fsutil.copyDirSyncRecursive(path.resolve(browserDestinationPath, "examples"),
        path.resolve(browserStaticPackagePath, "examples"));

}

var args:string[] = process.argv;

if (_.find(args,arg=>arg=="-dev")) {
    createBrowserPackage(false);
} else {
    createBrowserPackage();
}