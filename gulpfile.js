'use strict';

// Save the root globally so we can use it later
global.__gulpRoot = __dirname;

// Add log at the top for more timing information
var log = require('@ms/onedrive-buildtools/log');
var gulp = require('gulp');
var path = require('path');
var setupOneJsBuild = require('@ms/onedrive-buildtools/odbuild/setup-onejs-build');

// Setup one js build
var gulpTasksPaths = setupOneJsBuild.getGulpTasksPaths();

var buildOptions = {
    paths: {
        deps: {
            'node_modules/@ms/knockout/dist/*': [path.join(gulpTasksPaths.app.root, 'knockout')],
            'node_modules/@ms/knockout-projections/dist/*': [path.join(gulpTasksPaths.app.root, 'knockout-projections')],
            'node_modules/@ms/odsp-utilities/dist/amd/odsp-utilities/**/*': [path.join(gulpTasksPaths.app.root, '@ms', 'odsp-utilities', 'lib')]
        },

        // TODO: Remove symlinks once we switch to NodeJS-style module resolution
        links: {
            'node_modules/@ms/aria-private/dist/amd': 'aria',
            'node_modules/@ms/odsp-utilities/dist/amd/odsp-utilities': 'odsp-utilities',
            'node_modules/@ms/odsp-utilities/dist/test/odsp-utilities': 'odsp-utilities-test'
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

    nodeResolution: true
};

setupOneJsBuild.createGulpTasks(__dirname, gulp, buildOptions);

log.markTaskCreationTime();
