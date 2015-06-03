var gulp = require("gulp"),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    _browserify  = require('browserify'),
    transform    = require('vinyl-transform'),
    git = require('gulp-git'),
    qunit = require('gulp-qunit'),
    bump = require('gulp-bump');

///////////////////////////////////////////////////////////////////////////////

gulp.task('scripts', scripts);
gulp.task('test', ["scripts"], test);
gulp.task('watch', ["scripts"], watch);

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
    gulp.src('temp/objct.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(browserify())
        .pipe(uglify({
            "preserveComments" : "some"
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src(['temp/objct.e.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(browserify())
        .pipe(uglify({
            "preserveComments" : "some"
        }))
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Scripts task complete' }))
        ;
}

///////////////////////////////////////////////////////////////////////////////

function test() {
    gulp.src('test/objct.html').
        pipe(qunit());
    gulp.src('test/objct.e.html').
        pipe(qunit());
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