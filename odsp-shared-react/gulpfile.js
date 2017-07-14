'use strict';

let build = require('@ms/odsp-build');
let gulp = require('gulp');

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// Configure TypeScript.
build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

build.postCopy.setConfig({
  copyTo: {
    'dist': ['src/**/*.png']
  }
});

// process *.Example.tsx as text.
build.text.setConfig({ textMatch: ['src/**/*.txt', 'src/**/*.Example.tsx', 'src/**/*.Props.ts'] });

build.devBuildTasks.resxToJsonAndTs.setConfig({
  stringsExternalBundleName: 'resx-strings-shared-react'
});

// initialize tasks.
build.initialize(gulp);
