'use strict';

// Karma configuration
// Generated on Thu Oct 08 2015 18:13:05 GMT-0700 (PDT)

let path = require('path');
let configResources = require('@microsoft/web-library-build').karma.resources;
let bindPolyfillPath = configResources.bindPolyfillPath;
let debugRun = (process.argv.indexOf('--debug') > -1);

module.exports = function(config) {
  let karmaConfig = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [bindPolyfillPath, 'lib/**/*.test.js'],


    // list of files to exclude
    exclude: [],


    // webpack config for bundling tests.
    webpack: {
      module: {
        loaders: [
          {
            test: /sinon\.js$/,
            loader: 'imports?define=>false'
          }
        ],
        postLoaders: debugRun ? null : [{
          test: /\.js/,
          exclude: /(test|node_modules|bower_components)/,
          loader: configResources.istanbulInstrumenterLoaderPath
        }]
      },
      externals: [
        'sinon', 'chai'
      ],
      resolve: {
        modulesDirectories: [
          '',
          'lib',
          'node_modules'
        ]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'lib/**/*.js': ['webpack']
    },

    plugins: configResources.plugins.concat( [
      'karma-chai-plugins'
    ]),

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha-clean', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  };

  config.set(karmaConfig);
};
