const gulp = require('gulp');
const less = require('gulp-less');
const server = require('gulp-server-livereload');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const gulpDoxx = require('gulp-doxx');

gulp.task('default', ['build', 'copyImages', 'watch', 'server']);
gulp.task('build', ['less', 'copyImages', 'lint', 'browserify']);

gulp.task('watch', () => {
  // gulp.watch('src/**/*.js', ['lint']);
  gulp.watch('src/**/*.less', ['less']);
  gulp.watch('src/**/*.js', ['lint', 'browserify']);
});

// Task for transpiling es2015 to es6 with Babel
gulp.task('transpile', () => gulp.src(['src/**/*.js', '!src/vendor/**/*'])
  .pipe(babel())
  .pipe(gulp.dest('dist/js')));

// Compile less
gulp.task('less', () => gulp.src('src/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist')));


// Serve and live reload at localhost:8000
gulp.task('server', () => {
  gulp.src('.')
    .pipe(server({
      livereload: {
        enable: true,
        filter: (filePath, cb) => cb(/src/.test(filePath))
      },
      directoryListing: true,
      open: false
    }));
});

// Copy images to dist
gulp.task('copyImages', () => gulp.src('src/images/*.*')
   .pipe(gulp.dest('dist/images')));

gulp.task('browserify', ['transpile'], () => {
  return browserify({ entries: [
    'dist/js/game.js'
  ]})
  .bundle()
  .pipe(source('main.bundle.js'))
  .pipe(gulp.dest('dist/js'));
});

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', '!node_modules/**', '!src/vendor/**'])
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

gulp.task('docs', function () {
  gulp.src(['src/**/*.js', '!src/vendor/*.js', 'README.md'], { base: '.' })
    .pipe(gulpDoxx({
      title: 'zombie',
      urlPrefix: '/docs'
    }))
    .pipe(gulp.dest('docs'));
});
