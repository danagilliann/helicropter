var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

var webpackInst = webpack(webpackConfig);
gulp.task("webpack", function(cb) {
  webpackInst.run(function(err) {
    if (err) { throw new gutil.PluginError("webpack", err); }
    gutil.log("[webpack]", "Built modules successfully");
    cb();
  });
});

gulp.task('sass', function() {
  gulp.src('src/sass/**/*.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', ['webpack', 'sass'], function() {
  livereload.listen();

  watch(['src/js/**/*', 'src/templates/**/*'], function() { gulp.start('webpack'); });
  watch(['src/css/**/*.scss'], function() { gulp.start('sass'); });

  gulp.watch(['dist/**/*']).on('change', livereload.changed);
});
