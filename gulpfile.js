'use strict';

// Save the root globally so we can use it later
global.__gulpRoot = __dirname;

// Add log at the top for more timing information
var log = require('onedrive-buildtools/log');
var gulp = require('gulp');
var path = require('path');
var setupOneJsBuild = require('onedrive-buildtools/odbuild/setup-onejs-build');

// Setup one js build
var gulpTasksPaths = setupOneJsBuild.getGulpTasksPaths();

var buildOptions = {
    paths: {
        deps: {
            'bower_components/knockout-projections/dist/*': [path.join(gulpTasksPaths.app.root, 'knockout-projections')]
        }
    },

    // Mix in gulp task pre-reqs for tasks in gulp-onejs-build
    gulpTaskOptions: {
        // Build bundles/manifests before running tests to fix issue where tests
        // would fail due to timeouts when running in VSO
        'test': ['build-manifests']
    },
    // Tell gulp-onejs-build that our dist branch is separate from master
    separateDistRepo: true,
};

setupOneJsBuild.createGulpTasks(__dirname, gulp, buildOptions);

log.markTaskCreationTime();
