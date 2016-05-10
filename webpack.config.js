'use strict';

/** Note: this require may need to be fixed to point to the build that exports the gulp-core-build-webpack instance. */
let webpackTaskResources = require('web-library-build').webpack.resources;
let webpack = webpackTaskResources.webpack;

let path = require('path');

// Create an array of configs, prepopulated with a debug (non-minified) build.
let configs = [
  createConfig(false)
];

// Create a production config if applicable.
if (process.argv.indexOf('--production') > -1) {
  configs.push(createConfig(true));
}

// Helper to create the config.
function createConfig(isProduction) {
  let webpackConfig = {
    context: path.join(__dirname, '/lib'),

    entry: {
      'odsp-datasources': './index.js',
    },

    output: {
      libraryTarget: 'umd',
      path: path.join(__dirname, '/dist'),
      filename: `[name]${isProduction ? '.min' : ''}.js`
    },

    devtool: 'source-map',

    devServer: {
      stats: 'none'
    },

    externals: [
    ],

    module: {
      loaders: [
      ]
    },

    plugins: [
    ]
  };

  if (isProduction) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    }));
  }

  return webpackConfig;
}

module.exports = configs;

