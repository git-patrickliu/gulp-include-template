/**
 * Created by patrickliu on 15/5/26.
 */

var includeTemplate = require('./index'),
    path = require('path'),
    gulp = require('gulp'),
    mocha = require('gulp-mocha');


includeTemplate.config('base', path.dirname(__filename) + '/test');

gulp.task('gen', function() {
    return gulp.src('test/index.html')
        .pipe(includeTemplate())
        .pipe(gulp.dest('test/compiled'));
});

gulp.task('mocha', ['gen'], function() {
    return gulp.src('test/main.js')
               .pipe(mocha());
});

gulp.task('default', ['mocha']);
