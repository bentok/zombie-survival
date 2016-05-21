'use strict';

var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    server = require('gulp-server-livereload'),
    eslint = require('gulp-eslint'),
    babel = require("gulp-babel"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('default', ['build', 'watch', 'server']);
gulp.task('build', ['less', 'browserify']);

gulp.task('watch', () => {
  // gulp.watch('src/**/*.js', ['lint']);
  gulp.watch('src/**/*.less', ['less']);
  gulp.watch('src/**/*.js', ['browserify']);
});

// Task for transpiling es2015 to es6 with Babel
gulp.task('transpile', () => {
  return gulp.src(['src/**/*.js', '!src/vendor/**/*'])
  .pipe(babel())
  .pipe(gulp.dest('dist/js'));
});

// Compile less
gulp.task('less', () => {
  return gulp.src('src/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist'));
});


// Serve and live reload at localhost:8000
gulp.task('server', () => {
  gulp.src('.')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

gulp.task('browserify', ['transpile'], function() {
    return browserify({ entries: [
      'dist/js/animate/animate.js',
      'dist/js/movement/movement.js',
      'dist/js/player/healthTimer.js',
      'dist/js/player/player.js',
      'dist/js/sprites/sprites.js',
      'dist/js/world/world.js',
      'dist/js/zombie/zombie.js',
      'dist/js/game.js',
      'dist/js/test.js'
    ]})
    .bundle()
    .pipe(source('main.bundle.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js','!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});
