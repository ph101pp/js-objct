var gulp = require("gulp"),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    git = require('gulp-git'),
    qunit = require('node-qunit-phantomjs'),
    bump = require('gulp-bump');


gulp.task('scripts', function() {
  return gulp.src('lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    // .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({
    	"preserveComments" : "some"
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('test', function() {
    qunit('./test/index.html');
});


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