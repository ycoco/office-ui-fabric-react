'use strict';

let build = require('@microsoft/web-library-build');
let gulp = require('gulp');

// initialize tasks.
build.initialize(gulp);

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// Configure TypeScript.
build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

// change the port of serve.
build.serve.setConfig({
  port: 4322
});

// configure amd libraries to be built when the production flag is present.
let isProduction = process.argv.indexOf('--production') >= 0;
let isNuke = process.argv.indexOf('clean') >= 0;

if (isProduction || isNuke) {
  build.setConfig({
    libAMDFolder: 'lib-amd'
  });
}

/** @todo: Enable css modules when ready. */
// build.sass.setConfig({ useCSSModules: true });

