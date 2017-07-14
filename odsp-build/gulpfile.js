'use strict';

const build = require('@microsoft/sp-build-node');

const tslintCommon = require('@microsoft/sp-tslint-rules');
tslintCommon.initializeTslintTask(build.tslint);

build.TypeScriptConfiguration.setTypescriptCompiler(require('typescript'));

build.tslint.mergeConfig({
  lintConfig: {
    rules: {
      "no-any": false
    }
  }
});

build.initialize(require('gulp'));
