var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp')

function packageScript(srcPath,dstPath,uglify) {
	
	var cwd = process.cwd();
	
	if(!srcPath){
		throw new Error('Source path is null.');
	}
	else{
		if(!path.isAbsolute(srcPath)){
			srcPath = path.resolve(cwd,srcPath);
		}
		if(!fs.existsSync(srcPath)){
			throw new Error('File does not exist: ' + srcPath);
		}
	}

	if(!dstPath){		
		throw new Error('Destination path is null.');
	}
	else{
		if(!path.isAbsolute(dstPath)){
			dstPath = path.resolve(cwd,dstPath);
		}
	}
	
	var outputFolder = path.dirname(dstPath);
    var fileName = path.basename(dstPath);
    mkdirp.sync(outputFolder);
    
    var contextDir = path.dirname(srcPath);
    
    var plugins = uglify ? [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {}
        })
    ] : [];
    var config = {
        context: contextDir,
        entry: srcPath,
        output: {
            path: outputFolder,
            filename: fileName
        },
        resolve: {
            alias: {
                fs: path.resolve(__dirname, './modules/emptyFS.js')
            }
        },
        externals: [
            {
                "xmlhttprequest": '{}'
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
    webpack(config, function (err, stats) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log("Webpack Building Bundle:");
        console.log(stats.toString({ reasons: true, errorDetails: true }));
    });
}

var dstPath;
var srcPath;
var uglify = false;
var args = process.argv;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=='-dstPath' && i < args.length-1){
        dstPath = args[i+1]
    }
    else if(args[i]=='-srcPath' && i < args.length-1){
        srcPath = args[i+1]
    }
    if(args[i]=='-uglify'){
        uglify = false;
    }
}

packageScript(srcPath,dstPath,uglify);
