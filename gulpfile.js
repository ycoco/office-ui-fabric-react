'use strict';

let build = require('web-library-build');
let gulp = require('gulp');

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// process *.Example.tsx as text.
build.text.setConfig({ textMatch: ['src/**/*.txt', 'src/**/*.Example.tsx', 'src/**/*.Props.tsx'] });

// change the port of serve.
build.serve.setConfig({
  port: 4322
});

// configure amd libraries to be built when the production flag is present.
if (process.argv.indexOf('--production') >= 0) {
  build.setConfig({
    libAMDFolder: 'lib-amd'
  });
}

/** @todo: Enable css modules when ready. */
// build.sass.setConfig({ useCSSModules: true });

// initialize tasks.
build.initialize(gulp);
