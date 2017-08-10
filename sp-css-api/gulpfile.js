'use strict';

let build = require('@ms/odsp-build');
let gulp = require('gulp');

/** @todo: disable lint config. */
build.tslint.setConfig({ lintConfig: require('./tslint.json') });

// initialize tasks.
build.initialize(gulp);

// disable karma
build.karma.setConfig({ configPath: null });

// Configure TypeScript.
build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

/** @todo: Enable css modules when ready. */
// build.sass.setConfig({ useCSSModules: true });

build.sass.isEnabled = () => false;
build.webpack.isEnabled = () => false;
