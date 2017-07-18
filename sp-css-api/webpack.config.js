'use strict';

/** Note: this require may need to be fixed to point to the build that exports the gulp-core-build-webpack instance. */
let webpackTaskResources = require('@microsoft/web-library-build').webpack.resources;
let webpack = webpackTaskResources.webpack;

let path = require('path');

// Create an array of configs, prepopulated with a debug (non-minified) build.
let configs = [
];

module.exports = configs;
