var gulp = require('gulp');
var childProcess = require('child_process');
//var rimraf = require('rimraf');
var mocha = require('gulp-mocha');
var RawMocha = require('mocha');
var join = require('path').join;
var webpack = require('webpack');
//var ts = require('gulp-typescript');
//var sourcemaps = require('gulp-sourcemaps');
//var rename = require('gulp-rename')
var fs = require('fs');
var path = require('path');
//var StringReplacePlugin = require('string-replace-webpack-plugin');
var PORT = process.env.PORT || 3000;

var NODE_BIN_PATH = join(__dirname, 'node_modules/.bin');

var WEBPACK_OUTPUT_OPTIONS = {
  colors: true,
  exclude: ['node_modules', 'public/bower_components']
};

//var tsProject = ts.createProject('tsconfig.json', {
//  typescript: require('typescript')
//});

// This is a hack to enable errors in single compilation mode. Please let me
// remove this one day when the Gulp task doesn't suck so much.
var tsWatch = false;

var testFiles = [
    'src/**/*.test.js',
    'test/**/*.js',
     'dist/raml1/test/model-editing-tests-attrs.js',
      'dist/raml1/test/model-editing-tests-add.js',
     'dist/raml1/test/model-editing-tests-refactoring.js',
     'dist/raml1/test/model-editing-tests-remove.js',
     'dist/raml1/test/model-editing-tests-sig.js',
     'dist/raml1/test/schema-model-tests.js',
  // ////
    'dist/raml1/test/parserTests.js',
   'dist/raml1/test/parserTests2.js',
   'dist/raml1/test/parserASTTests.js',
   'dist/raml1/test/traits-and-resource-types-expanding-tests.js',
   'dist/raml1/test/helpersTest.js',
   'dist/raml1/test/gotoDeclarationTests.js',
   'dist/raml1/test/findUsagesTests.js',
   'dist/raml1/test/exampleGenTests.js',
   'dist/raml1/test/typeSystemTests.js',
   'dist/raml1/test/runtimeExampleTests.js',
   'dist/raml1/test/examplesApiTests.js',
   'dist/raml1/test/TCK.js',
  // // //
   'src/raml1/test/data/parser/test/specs/optionals.js',
   'src/raml1/test/data/parser/test/specs/parser.js',
   'src/raml1/test/data/parser/test/specs/protocols.js',
   'src/raml1/test/data/parser/test/specs/regressions.js',
   'src/raml1/test/data/parser/test/specs/resourceTypes.js',
   'src/raml1/test/data/parser/test/specs/resourceTypesValidations.js',
   'src/raml1/test/data/parser/test/specs/traits.js',
   'src/raml1/test/data/parser/test/specs/transformations.js',
   'src/raml1/test/data/parser/test/specs/validator.js',
   'src/raml1/test/data/parser/test/specs/duplicateKeysValidations.js'
]

gulp.task('testExpand:ts', function () {
  global.isExpanded = true;

  return gulp.src(testFiles, { read: false })
      .pipe(mocha({
        bail: false,
        reporter: 'spec'
      }));
});

gulp.task('test:ts', [], function () {
  global.isExpanded = null;

  return gulp.src(testFiles, { read: false })
      .pipe(mocha({
        bail: true,
        reporter: 'spec'
      }));
});

gulp.task('testCompat', function () {
  //return gulp.src(['src/**/*.test.js', 'test/**/*.js', 'src/raml1/test/model-editing-tests-attrs.js', 'src/raml1/test/model-editing-tests-add.js', 'src/raml1/test/*.js'], { read: false })
  return gulp.src([

    'src/raml1/test/data/parser/test/specs/optionals.js',
    'src/raml1/test/data/parser/test/specs/parser.js',
    'src/raml1/test/data/parser/test/specs/protocols.js',
    'src/raml1/test/data/parser/test/specs/regressions.js',
    'src/raml1/test/data/parser/test/specs/resourceTypes.js',
    'src/raml1/test/data/parser/test/specs/resourceTypesValidations.js',
    'src/raml1/test/data/parser/test/specs/traits.js',
    'src/raml1/test/data/parser/test/specs/transformations.js',
    'src/raml1/test/data/parser/test/specs/validator.js',
    'src/raml1/test/data/parser/test/specs/duplicateKeysValidations.js'
  ], { read: false })
      .pipe(mocha({
        bail: true,
        reporter: 'spec'
      }));
});


gulp.task('test',['test:ts','testExpand:ts']);

gulp.task('watch:test', function () {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});


gulp.task('typescript:prepare-compile', [], function () {
  var hasError = false;
  var tsResult = gulp.src(['src/raml1/tools/prepare.ts'])
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject))
      .on('error', function () {
        hasError = true;
      })
      .on('end', function () {
        if (hasError && !tsWatch) {
          throw new Error('TypeScript contains errors');
        }
      });

  return tsResult.js
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('src/raml1/tools/'));
});

gulp.task('typescript:compile', [

], function () {
  var hasError = false;
  var tsResult = gulp.src(['**/*.ts', '!java/**', '!node_modules/**', '!examples/**', '!microsite/dist/examples/**', '!atom-package/**', '!custom_typings/**', '!typings/**'])
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .on('error', function () {
      hasError = true;
    })
    .on('end', function () {
      if (hasError && !tsWatch) {
        throw new Error('TypeScript contains errors');
      }
    });

  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('typescript:prepare', ['typescript:prepare-compile'], function (done) {
  return spawn('node', [join(__dirname, 'src/raml1/tools/prepare.js')], done);
});

gulp.task('typescript:generate-parser', [
  'typescript:gen-artifacts',
  'typescript:compile'
], function (done) {
  return spawn('node', [join(__dirname, 'src/raml1/tools/buildParsers.js')], done);
});


gulp.task('typescript:compile-with-generated-parser', [
  'typescript:generate-parser'
], function () {
  var hasError = false;

  var tsResult = gulp.src(['**/**.ts', '!java/**', '!node_modules/**', '!examples/**', '!microsite/dist/examples/**', '!atom-package/**', '!custom_typings/**', '!typings/**'])
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject))
      .on('error', function () {
        hasError = true;
      })
      .on('end', function () {
        if (hasError && !tsWatch) {
          throw new Error('TypeScript contains errors');
        }
      });

  return tsResult.js
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('.'));
});

gulp.task('typescript', ['typescript:compile', 'typescript:generate-parser', 'typescript:compile-with-generated-parser']);

gulp.task('coffee', function (done) {
  var isWin = /^win/.test(process.platform);
  var coffecmd = isWin? 'coffee.cmd' : 'coffee';
  var path = join(NODE_BIN_PATH, coffecmd);
  return spawn(path, ['-c', 'src'], done);
});

gulp.task('build', [
  'typescript',
  'microsite',

]);

gulp.task('watch:coffee', function (done) {
  var isWin = /^win/.test(process.platform);
  var coffecmd = isWin? 'coffee.cmd' : 'coffee';
  var path = join(NODE_BIN_PATH, coffecmd);
  spawn(path, ['-cw', 'src'], done);
});

gulp.task('watch:typescript', function () {
  tsWatch = true;

  gulp.watch('**/*.ts', ['typescript:compile']);
});



var API_WORKBENCH_PACKAGE_ORG = 'mulesoft'
var API_WORKBENCH_PACKAGE_REPO = 'api-workbench'


gulp.task('package-json', function (done) {
  var packageJson = require('./package.json');

  var newPackageJson = {
    name: 'api-workbench',
    version: packageJson.version,
    private: true,
    main: 'main.js',
    repository: 'https://github.com/' + API_WORKBENCH_PACKAGE_ORG + '/' + API_WORKBENCH_PACKAGE_REPO,
    activationCommands: packageJson.activationCommands,
    engines: packageJson.engines,
    'package-deps': packageJson['package-deps'],
    providedServices: packageJson.providedServices,
    consumedServices: packageJson.consumedServices,
    dependencies: packageJson.dependencies
  }

  // Make sure this exists.
  // TODO(blakeembrey): Use gulp to handle this.
  fs.mkdirSync(join(__dirname, 'atom-package'));

  return fs.writeFile(
    join(__dirname, 'atom-package/package.json'),
    JSON.stringify(newPackageJson, null, 2),
    done
  );
});

gulp.task('package-readme', function () {
  return gulp.src('PACKAGE_README.md')
    .pipe(rename('README.md'))
    .pipe(gulp.dest('atom-package'))
})

gulp.task('package-build', ['coffee', 'typescript'], function (done) {
  var config =  {
    entry: join(__dirname, 'src/atom/main'),
    output: {
      path: join(__dirname, 'atom-package'),
      filename: 'main.js',
      libraryTarget: 'commonjs2'
    },
    target: 'node',
    debug: false,
    devtool: 'source-map',
    externals: [
      function (context, request, cb) {
        if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
          cb(null, 'commonjs ' + request);
          return;
        }

        cb();
      }
    ],
    resolve: {
      extensions: ['', '.js', '.json']
    },
    module: {
      preLoaders: [
        {
          test: /\.js$/,
          loader: 'source-map'
        }
      ],
      loaders: [
        {
          test: /\.js$/,
          loader: StringReplacePlugin.replace({
            replacements: [
              {
                pattern: /require\(\"webpack\"\)/ig,
                replacement: function () {
                  return '{}';
                }
              }
            ]
          })
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    },
    plugins: [
      new StringReplacePlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        compress: {
          warnings: false
        }
      })
    ],
    node: {
      __filename: false,
      __dirname: false
    }
  };

  webpack(config).run(function (err, stats) {
    webpackOutput(err, stats);
    done();
  });
});

gulp.task('package-clean', function () {
  rimraf.sync('atom-package');
});

gulp.task('package-deps', ['package-clean', 'package-readme', 'package-build', 'package-copy', 'package-assets', 'package-json']);

gulp.task('package-publish', ['package-deps'], function (done) {
  childProcess.exec('VERSION=`node -p "require(\'./package.json\').version"` && cd atom-package && git init . && git add . && git reset --  main.js.map && git commit -m "Prepare v$VERSION" && git tag -a "v$VERSION" -m "v$VERSION" && git remote add origin https://github.com/'+API_WORKBENCH_PACKAGE_ORG+'/'+API_WORKBENCH_PACKAGE_REPO+'.git && git push origin master --force && git push --force origin refs/tags/v$VERSION:refs/tags/v$VERSION && apm publish --tag "v$VERSION"', done);
});
/**
 * Spawn a child process for gulp.
 */
function spawn (path, args, done) {
  var cp = childProcess.spawn(path, args);

  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);

  cp.once('error', done);

  cp.once('exit', function (code) {
    return code > 0 ? done(new Error('Exited with code: ' + code)) : done();
  });
}

/**
 * Log the webpack output.
 *
 * @param  {(Error|null)} err
 * @param  {Object}       stats
 */
function webpackOutput (err, stats) {
  if (err) {
    throw err;
  }

  console.log(stats.toString(WEBPACK_OUTPUT_OPTIONS));
}
