'use strict';

// Save the root globally so we can use it later
global.__gulpRoot = __dirname;

// Add log at the top for more timing information
var log = require('@ms/onedrive-buildtools/log');
var gulp = require('gulp');
var setupOneJsBuild = require('@ms/onedrive-buildtools/odbuild/setup-onejs-build');
var tsconfig = require('./tsconfig.json');

// Setup one js build
setupOneJsBuild.getGulpTasksPaths();

var buildOptions = {
    paths: {
        pathRemappings: tsconfig.compilerOptions.paths
    },

    // Mix in gulp task pre-reqs for tasks in gulp-onejs-build
    gulpTaskOptions: {
        // Build bundles/manifests before running tests to fix issue where tests
        // would fail due to timeouts when running in VSO
        'test': ['build-manifests']
    },

    nodeResolution: true,

    // Tell gulp-onejs-build that our dist branch is separate from master
    separateDistRepo: true
};

setupOneJsBuild.createGulpTasks(__dirname, gulp, buildOptions);

log.markTaskCreationTime();