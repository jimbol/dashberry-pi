'use strict';

var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');
var vueify = require('vueify');

gulp.task('default', function() {
  require('./server');
});

gulp.task('scripts', function() {
  browserify('client/js/index.js')
    .transform(vueify)
    .bundle()
    .pipe(fs.createWriteStream("client/index.bundle.js"))
});
