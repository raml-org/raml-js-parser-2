/// <reference path="../../../typings/main.d.ts" />
import Opt = require('../../Opt');
import util = require('../../util/index');
import fs = require("fs");
import path = require("path");
import mkdirp = require("mkdirp");
var webpack = require("webpack");
import depMan=require("./dependencyManager");
import fsutil=require("../../util/fsutil");
var tsc = require('typescript-compiler');
import cp = require('child_process')
import devUtil = require('../../devUtil/devUtils')

var initializerFileName = 'raml1Parser';
var initializerTypescriptFileName = initializerFileName + '.ts';
var bundledJSFileName = initializerFileName + '.js';
var browserBundleJSFileName = 'raml-1-parser.js';
//import aUtils = require("./automation/impl/automationUtils");

export function deployBundle(dstPath:string,tmpFolder:string, uglify:boolean=false):Promise<void>{

    var outputFolder = path.resolve(dstPath,'src');
    mkdirp.sync(outputFolder);
    mkdirp.sync(tmpFolder);

    var setterPath = path.resolve(tmpFolder, initializerTypescriptFileName);
    var targetDir = path.dirname(setterPath);
    mkdirp.sync(targetDir);
    fs.writeFileSync(setterPath,getRamlModuleCode());

    tsc.compile([ setterPath ], '-m commonjs');

    var plugins = uglify ? [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {}
        })
    ] : [];

    var config = {
        context: tmpFolder,

        entry: path.resolve(tmpFolder, bundledJSFileName),

        output: {
            path: outputFolder,

            filename: "raml1Parser.js",

            libraryTarget: "commonjs2"
        },

        externals: [
            {
                "buffer" : true,
                "concat-stream" : true,
                "esprima" : true,
                "fs" : true,
                "http-response-object" : true,
                "json-schema-compatibility" : true,
                "json-stable-stringify" : true,
                "know-your-http-well" : true,
                "loophole" : true,
                "lrucache" : true,
                "media-typer" : true,
                "path" : true,
                "pluralize" : true,
                "then-request" : true,
                "typescript" : true,
                "underscore" : true,
                "url": true,
                "xmldom" : true,
                "xmlhttprequest": true,
                "xhr2": true,
                "z-schema" : true,
            }
        ],

        plugins: plugins,

        module: {
            loaders: [
                { test: /\.json$/, loader: "json" }
            ]
        },

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

    return new Promise<void>(function(resolve, reject) {
        webpack(config, function (err, stats) {
            if (err) {
                Promise.reject(err);
            }

            var bundlePath = path.resolve(outputFolder, 'raml1Parser.js');
            var content = fs.readFileSync(bundlePath).toString();

            var contentPatched = content.replace('module.exports = require("typescript");', "module.exports = {};");
            fs.writeFileSync(bundlePath, contentPatched);

            console.log("Webpack Building Bundle:");

            console.log(stats.toString({reasons: true, errorDetails: true}));
            Promise.resolve();
        });
    });
}

function installNodeModules(path : string) {
    console.log("Installing node modules for :" + path);
    devUtil.execProcess("npm install", path, false, true, "Installing node modules", "Finished installing node modules");
    console.log("Finished installing node modules for :" + path);
}

function webPackForBrowser(commonJSBundlePath : string, targetFileName : string, callback?:()=>void) {
    console.log("Preparing to Webpack browser bundle:");
    var plugins = [];

    var folder = path.dirname(commonJSBundlePath);
    var file = path.basename(commonJSBundlePath);

    var config = {
        context: folder,

        entry: commonJSBundlePath,

        output: {
            path: folder,

            library: ['RAML', 'Parser'],

            filename: targetFileName,

            libraryTarget: "umd"
        },

        plugins: plugins,

        module: {
            loaders: [
                { test: /\.json$/, loader: "json" }
            ]
        }
    };

    webpack(config, function(err, stats) {
        if(err) {
            console.log(err.message);

            return;
        }

        console.log("Webpack Building Browser Bundle:");

        console.log(stats.toString({reasons : true, errorDetails: true}));

        if(callback) {
            callback();
        }
    });
}

function copyStaticBrowserPackageContents(browserDestinationPath : string, packageJsonPath: string) {
    var browserStaticPackagePath = path.resolve(__dirname, "../../../js_parser/static/browser_package");

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

function createBrowserPackage(bundlePath:string, browserDestinationPath: string, tmpFolder:string,
    callback?:()=>void) {
    mkdirp.sync(bundlePath);
    mkdirp.sync(browserDestinationPath);

    var browserBundlingTmpFolder = path.resolve(tmpFolder, "browser_bundling");
    mkdirp.sync(browserBundlingTmpFolder);

    var bundledCommonJSFilePath = path.resolve(bundlePath, "src/"+bundledJSFileName);
    var tempCommonJSFilePath = path.resolve(browserBundlingTmpFolder, bundledJSFileName);

    fsutil.copyFileSync(bundledCommonJSFilePath, tempCommonJSFilePath)

    var bundledPackageJson = path.resolve(bundlePath, "package.json");
    var tmpPackageJson = path.resolve(browserBundlingTmpFolder, "package.json");

    fsutil.copyFileSync(bundledPackageJson, tmpPackageJson);

    fsutil.copyDirSyncRecursive(path.resolve(browserBundlingTmpFolder,"web-tools"), path.resolve(bundlePath,"web-tools"));

    copyStaticBrowserPackageContents(browserDestinationPath, bundledPackageJson);

    installNodeModules(browserBundlingTmpFolder);

    webPackForBrowser(tempCommonJSFilePath, browserBundleJSFileName, function(){
        console.log("Copying webpacked browser bundle to destination")
        var source = path.resolve(browserBundlingTmpFolder, browserBundleJSFileName);
        var target = path.resolve(browserDestinationPath, browserBundleJSFileName);
        fsutil.copyFileSync(source, target);

        if(callback) callback();
    });
}


function generateTypings(dstPath:string,tmpFolder:string){

    mkdirp.sync(tmpFolder);
    var ramlModulePath = path.resolve(tmpFolder, initializerTypescriptFileName);

    fs.writeFileSync(ramlModulePath,getRamlModuleCode());

    var dm = new depMan.DependencyManager();
    dm.transportDependencies(ramlModulePath, path.resolve(tmpFolder,'../../'), tmpFolder, './');
    //Object.keys(dm.modules).forEach(x=>console.log(x));
    var compileLog = tsc.compile([ ramlModulePath ], '-m commonjs -d');
    //console.log(compileLog);

    fsutil.copyDirSyncRecursive(
        path.resolve(dstPath,'parser-typings'),
        tmpFolder,
        { forceDelete:true },
        x => fs.lstatSync(x).isDirectory() || util.stringEndsWith(x,'.d.ts')
    );
}

function generateDocumentation(dstPath:string,tmpFolder){
    
    var projectFolder = __dirname;
    while(!fs.existsSync(path.resolve(projectFolder,"gulpfile.js"))){
        projectFolder = path.resolve(projectFolder,"../");
    }

    var themeFolder = path.resolve(projectFolder,'src/devUtil/documentation');
    console.log('Generating documentation...');
    var docGenTmpFolder = path.resolve(tmpFolder, 'documentation');
    mkdirp.sync(docGenTmpFolder)
    var callPath = "typedoc"
        + " --out " + docGenTmpFolder
        + " "
        + path.resolve(projectFolder,'./src/index.ts')
        + " --theme " + themeFolder
        + " --includeDeclarations"
        + " --name \"RAML JS Parser 2\""
        + " --module commonjs";
    devUtil.execProcess(
        callPath,
      process.cwd()
    );
    var docGenDstFolder = path.resolve(dstPath, 'documentation');
    fs.readdirSync(docGenTmpFolder).map(x=>path.resolve(docGenDstFolder,x)).forEach(x=>fsutil.removeDirSyncRecursive(x));
    fsutil.copyDirSyncRecursive(docGenDstFolder,docGenTmpFolder);
    console.log('Documentation has been copied to ' + docGenDstFolder);
}

function getRamlModuleCode():string{

    return `/// <reference path="../../typings/main.d.ts" />
import apiLoader = require('../../src/ramlscript/apiLoader');
import json2lowlevel = require('../../src/parser/jsyaml/json2lowLevel')
import RamlWrapper = require('../../src/parser/artifacts/raml10parser')
import parserCore = require('../../src/parser/wrapped-ast/parserCore')
import Opt = require('../../src/Opt');
import typeSystem=require("../../src/parser/definition-system/typeSystem");


export function loadApiSync(
    apiPath:string,
    extensionsAndOverlays?:string[],
    options?:parserCore.Options):RamlWrapper.Api{

    return RamlWrapper.loadApiSync(apiPath,extensionsAndOverlays,options);
}

export function loadApi(
    apiPath:string,
    extensionsAndOverlays?:string[],
    options?:parserCore.Options):Promise<RamlWrapper.Api>{

    return RamlWrapper.loadApi(apiPath,extensionsAndOverlays,options);
}

export function loadRAMLSync(
    apiPath:string,
    extensionsAndOverlays?:string[],
    options?:parserCore.Options):RamlWrapper.RAMLLanguageElement{

    return RamlWrapper.loadRAMLSync(apiPath,extensionsAndOverlays,options);
}

export function loadRAML(
    apiPath:string,
    extensionsAndOverlays?:string[],
    options?:parserCore.Options):Promise<RamlWrapper.RAMLLanguageElement>{

    return RamlWrapper.loadRAML(apiPath,extensionsAndOverlays,options);
}

/**
 * Gets AST node by runtime type, if runtime type matches any.
 * @param runtimeType - runtime type to find the match for
 */
export function getLanguageElementByRuntimeType(runtimeType : typeSystem.ITypeDefinition) : parserCore.BasicNode {
    return RamlWrapper.getLanguageElementByRuntimeType(runtimeType);
}
`;
}


var dstPath;
var browserDstPath;
var skipSources = false;

var args:string[] = process.argv;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=='-dstPath' && i < args.length-1){
        dstPath = args[i+1]
    }

    if(args[i]=='-browserDstPath' && i < args.length-1){
        browserDstPath = args[i+1]
    }

    if(args[i]=='-skipSources'){
        skipSources = true;
    }
}
if(dstPath==null) {
    dstPath = path.resolve(process.cwd(),"packagedParser");
}
var tmpFolder = path.resolve(process.cwd(), '____parser_package_tmp');
var typingsFolder = path.resolve(tmpFolder, 'typings');
var bundleFolder = path.resolve(tmpFolder, 'bundle');

var cleanup = function ():void {
    console.log('Removing ' + tmpFolder + ' ...');
    fsutil.removeDirSyncRecursive(tmpFolder);
    console.log('Folder has been removed: ' + tmpFolder);
}

if (skipSources) {
    dstPath = path.resolve(dstPath,"../");
    generateDocumentation(dstPath, tmpFolder);
    cleanup();
}
else {
    generateTypings(dstPath, typingsFolder);
    deployBundle(dstPath, bundleFolder).then(()=> {
        generateDocumentation(dstPath, tmpFolder);

        if (browserDstPath) {
            createBrowserPackage(dstPath, browserDstPath, tmpFolder, ()=> {
                cleanup()
            });
        } else {
            cleanup();
        }

    });
}

