var webpack = require('webpack');

var rimraf = require("rimraf");

var childProcess = require('child_process');

var path = require("path");

var fs = require("fs");

rimraf.sync('browser_version');

var isNpm = process.argv[process.argv.indexOf("--type") + 1] === 'npm';

if(isNpm) {
    childProcess.execSync('mkdir browser_version');
} else {
    childProcess.execSync('mkdir browser_version && cd browser_version && git clone https://github.com/raml-org/raml-js-parser-2.git --branch browser_version --single-branch .');
}

console.log("is npm:" + isNpm);

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
            path: path.resolve(__dirname, "./browser_version"),

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
            childProcess.execSync('cd browser_version && npm publish');
        } else {
            //childProcess.execSync('VERSION=`node -p "require(\'./package.json\').version"` && cd browser_version && git add -A && git commit -m "Prepare v$VERSION" && git tag -a "v$VERSION" -m "v$VERSION" && git push && git push --tags');
        }
    });
}

function updateVersion() {
    var targetJsonPath = path.resolve(__dirname, "./browser_version/" + (isNpm ? "package.json" : "bower.json"));
    var packageJsonPath = path.resolve(__dirname, "./package.json");

    var targetJson = {};
    
    //var targetJson = JSON.parse(fs.readFileSync(targetJsonPath).toString());
    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    targetJson.version = packageJson.version;
    targetJson.name = packageJson.name + (isNpm ? "-browser" : "");
    targetJson.main = "index.js"

    fs.writeFileSync(targetJsonPath, JSON.stringify(targetJson, null, '\t'));
}

webPackForBrowserLib();


