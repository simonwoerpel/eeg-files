var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var exec = require('child_process').exec;
var combiner = require('stream-combiner2');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

// var CSS_SOURCE = 'theme/less';
// var CSS_DEST = 'theme/static/css';
var JS_SOURCE = 'app/js';
var JS_DEST = 'app/static/js';
var MAIN_LESS_FILE = '/main.less';
var MAIN_JS_FILE = '/main.js';

// https://gist.github.com/danharper/3ca2273125f500429945
function compileJS(watch) {
  var bundler = watchify(browserify(JS_SOURCE + MAIN_JS_FILE, { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(JS_DEST));
  }
  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

// /* Compile, minify, and compress LESS files */
// gulp.task('less', function() {
//   var combined = combiner.obj([
//     gulp.src(CSS_SOURCE + MAIN_LESS_FILE),
//     less(),
//     autoprefixer({
//       browsers: ['last 2 versions'],
//       cascade: false
//     }),
//     gulp.dest(CSS_DEST)
//   ]);

//   // any errors in the above streams will get caught
//   // by this listener, instead of being thrown:
//   combined.on('error', console.error.bind(console));

//   return combined;
// });

/* Watch Files For Changes */
gulp.task('watch', function() {
  livereload.listen();
  // gulp.watch(CSS_SOURCE + '/**/*.less', ['less']);

  /* Trigger a live reload on any Django template changes */
  gulp.watch('**/templates/**').on('change', livereload.changed);

  /* Trigger a live reload on any Django python changes */
  gulp.watch('**.py').on('change', livereload.changed);

  /* Trigger a live reload upon CSS complilation */
  // gulp.watch(CSS_DEST + '/**').on('change', livereload.changed);

  /* Trigger a live reload upon JS complilation */
  gulp.watch(JS_DEST + '/**').on('change', livereload.changed);
});

gulp.task('serve:backend', function() {
  proc = exec('PYTHONUNBUFFERED=1 ./manage.py runserver 8000');
  writeOutput = function (data) {
    process.stdout.write(data);
  };
  proc.stderr.on('data', writeOutput);
  proc.stdout.on('data', writeOutput);
});

gulp.task('javascript:build', function() { return compileJS(); });

gulp.task('javascript:watch', function() { return compileJS(true); });

/* Run a server for development */
// gulp.task('serve', ['serve:backend', 'less', 'javascript:watch', 'watch']);
gulp.task('serve', ['serve:backend', 'javascript:watch', 'watch']);

/* Create a build of frontend code */
gulp.task('default', ['less', 'javascript:build']);
