const gulp = require('gulp');

const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');

const livereload = require('gulp-livereload');
const connect = require('gulp-connect');

const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const merge = require('utils-merge');

const gutil = require('gulp-util');
const chalk = require('chalk');

const concat = require('gulp-concat');
const hbsfy = require('hbsfy');

const paths = {
  entry: 'src/app.js',
  dist: 'dist',
  statics: 'src/statics'
};

function mapError (err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name) +
      ': ' +
      chalk.yellow(err.fileName.replace(__dirname + '/src/js/', '')) +
      ': ' +
      'Line ' +
      chalk.magenta(err.lineNumber) +
      ' & ' +
      'Column ' +
      chalk.magenta(err.columnNumber || err.column) +
      ': ' +
      chalk.blue(err.description))
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name) +
      ': ' +
      chalk.yellow(err.message))
  }
}


function bundleJs (bundler) {
  return bundler.bundle()
    .on('error', mapError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest(paths.dist))
    .pipe(rename('app.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    // capture sourcemaps from transforms
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist))
}

gulp.task('watchify', function () {
  var args = merge(watchify.args, { debug: true });
  var bundler = watchify(browserify(paths.entry, args)).transform(babelify, { /* opts */ });
  bundleJs(bundler);

  connect.server({
    port: 8000,
    root: 'dist'
  });

  livereload.listen(35729);

  bundler.on('update', function () {
    console.log('update event');

    bundleJs(bundler);
  })
});

gulp.task('browserify', function () {
  var bundler = browserify(paths.entry, { debug: true }).transform(babelify, {/* options */ })

  return bundleJs(bundler)
});

gulp.task('browserify-production', function () {
  var bundler = browserify(paths.entry).transform(babelify, {/* options */ })

  return bundler.bundle()
    .on('error', mapError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dest))
});