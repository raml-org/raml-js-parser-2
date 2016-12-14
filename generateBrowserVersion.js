var webpack = require('webpack');

var rimraf = require("rimraf");

var childProcess = require('child_process');

var path = require("path");

var fs = require("fs");

var isNpm = process.argv[process.argv.indexOf("--type") + 1] === 'npm';

rimraf.sync(isNpm ? "browser_version_npm" : "browser_version");

var bowerJsonDist = path.resolve(__dirname, "./bower.json");
var packageJsonDist = path.resolve(__dirname, "./browser_version_npm/package.json");

childProcess.execSync(isNpm ? "mkdir browser_version_npm" : "mkdir browser_version");

function webPackForBrowserLib() {
    var plugins = [];

    plugins.push(new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compress: { warnings: false }
    }));

    var config = {
        entry: path.resolve(__dirname, "./dist/index.js"),

        plugins: plugins,

        output: {
            path: path.resolve(__dirname, isNpm ? "./browser_version_npm" : "./browser_version"),

            library: ['RAML', 'Parser'],

            filename: 'index.js',
            libraryTarget: "umd"
        },

        module: {
            loaders: [
                { test: /\.json$/, loader: "json" }
            ]
        },
        resolve: {
            alias: {
                fs: path.resolve(__dirname, "./web-tools/modules/emptyFS.js")
            }
        },
        externals: [
            {
                "libxml-xsd": true,
                "ws": true,
                "typescript": true,
                "raml-xml-validation": "RAML.XmlValidation",
                "raml-json-validation": "RAML.JsonValidation"
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

        updateVersion();
        
        if(isNpm) {
            childProcess.execSync('cd browser_version_npm && npm publish');
        }
    });
}

function updateVersion() {
    var targetJsonPath = isNpm ? packageJsonDist : bowerJsonDist;

    var packageJsonPath = path.resolve(__dirname, "./package.json");

    var targetJson = {};

    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    targetJson.version = packageJson.version;
    targetJson.name = packageJson.name + '-browser';
    targetJson.main = isNpm ? "index.js" : "browser_version/index.js";

    if(!isNpm) {
        targetJson.ignore = [
            "*",
            "!browser_version/",
            "!browser_version/*"
        ]
    }

    fs.writeFileSync(targetJsonPath, JSON.stringify(targetJson, null, '\t'));
}

webPackForBrowserLib();


