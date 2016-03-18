'use strict';

let build = require('web-library-build');
let gulp = require('gulp');
let merge = require('lodash.merge');

/** @todo: disable lint config. */
build.tasks.tslint.setConfig({ lintConfig: require('./tslint.json') });

// process *.Example.tsx as text.
build.tasks.text.setConfig({ textMatch: [ 'src/**/*.txt', 'src/**/*.Example.tsx' ] });

// change the port of serve.
build.tasks.serve.setConfig({
  port: 4322
});

// configure amd libraries to be built when the production flag is present.
if (process.argv.indexOf('--production') >= 0) {
  build.setConfig({
    libAMDFolder: 'lib-amd'
  });
}

// initialize tasks.
build.initialize(gulp);
