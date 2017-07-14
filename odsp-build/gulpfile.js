'use strict';

const path = require('path');
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

try {
  const mainPath = path.join(__dirname, 'lib', 'initialize.js');
  require(mainPath)(build);
} catch (e) {
  // Failed to load the default module. We should just clean or build instead
  build.initialize(require('gulp'));
}
