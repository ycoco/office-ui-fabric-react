'use strict';

let build = require('@ms/odsp-build');
let gulp = require('gulp');

// initialize tasks.
build.initialize(gulp);

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// disable karma
build.karma.setConfig({ configPath: null });

// Configure TypeScript.
build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

/** @todo: Enable css modules when ready. */
// build.sass.setConfig({ useCSSModules: true });

