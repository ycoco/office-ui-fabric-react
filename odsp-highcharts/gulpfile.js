'use strict';

const gulp = require('gulp');
const highchartsBuild = require('./highcharts/assembler/build.js').build;
const rimraf = require('rimraf');
const wrapAMD = require('gulp-wrap-amd');

const HIGHCHARTS_VERSION = '5.0.12'

gulp.task('default', () => {
  highchartsBuild({
    base: './',
    jsBase: './highcharts/js/',
    files: ['highcharts.js'],
    version: HIGHCHARTS_VERSION,
    umd: true,
    output: './dist/',
  });

  return gulp.src('./dist/highcharts.js')
    .pipe(wrapAMD({
      deps: [],
      exports: 'Highcharts',
      params: []
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', (cb) => {
  rimraf('./dist', cb);
});