var gulp = require("gulp"),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    _browserify  = require('browserify'),
    transform    = require('vinyl-transform'),
    git = require('gulp-git'),
    qunit = require('node-qunit-phantomjs'),
    bump = require('gulp-bump');

///////////////////////////////////////////////////////////////////////////////

gulp.task('scripts', scripts);
gulp.task('test', ["scripts"], test);
gulp.task('watch', watch);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function browserify(){
  return transform(function(filename){
    var b =  _browserify(filename);
    return b.bundle();
  });
}

///////////////////////////////////////////////////////////////////////////////

function scripts() {
    gulp.src('lib/objct.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify({
            "preserveComments" : "some"
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src('lib/objct.e.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify({
            "preserveComments" : "some"
        }))
        .pipe(gulp.dest('e/'))
        .pipe(gulp.dest('dist/'))
        ;

    gulp.src(['lib/e/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(browserify())
        .pipe(uglify({
            "preserveComments" : "some"
        }))
        .pipe(gulp.dest('e'))
        .pipe(notify({ message: 'Scripts task complete' }))
}

///////////////////////////////////////////////////////////////////////////////

function test() {
    qunit('./test/index.html');
}

///////////////////////////////////////////////////////////////////////////////

function watch(){
    gulp.watch(["./package.json", "./lib/**/*.js"], ['scripts']);
}

///////////////////////////////////////////////////////////////////////////////

/* Deploy - Test when next deploy ready*/

// gulp.task('bump', function () {
//   return gulp.src(['./package.json', './bower.json'])
//     .pipe(bump())
//     .pipe(gulp.dest('./'));
// });

// gulp.task('tag',["bump"], function () {
//   var pkg = require('./package.json');
//   var v = 'v' + pkg.version;
//   var message = 'Release ' + v;

//   return gulp.src('./')
//     .pipe(git.commit(message))
//     .pipe(git.tag(v, message))
//     .pipe(git.push('origin', 'Master', '--tags'))
//     .pipe(gulp.dest('./'));
// });

// gulp.task('deploy' ,["tag"], function (done) {
//   require('child_process').spawn('npm', ['publish'], { stdio: 'inherit' })
//     .on('close', done);
// });