'use strict';

let build = require('@microsoft/web-library-build');
let gulp = require('gulp');

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// Configure TypeScript.
build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

/* Disable karma */
build.karma.isEnabled = () => false;

build.postCopy.setConfig({
  copyTo: {
    'dist': [ 'src/**/*.png' ]
  }
});

// process *.Example.tsx as text.
build.text.setConfig({ textMatch: ['src/**/*.txt', 'src/**/*.Example.tsx', 'src/**/*.Props.ts'] });

// change the port of serve.
build.serve.setConfig({
  port: 4322
});

let isProduction = process.argv.indexOf('--production') >= 0;
let isNuke = process.argv.indexOf('clean') >= 0;

if (isProduction || isNuke) {
  build.setConfig({
    libAMDFolder: 'lib-amd'
  });
}

/** @todo: Enable css modules when ready. */
// build.sass.setConfig({ useCSSModules: true });

// initialize tasks.
build.initialize(gulp);
