/**
 * Created by patrickliu on 15/5/26.
 */

var includeTemplate = require('../index'),
    path = require('path'),
    gulp = require('gulp');


includeTemplate.config('base', path.dirname(__filename));

gulp.task('test', function() {
    gulp.src('./index.html')
        .pipe(includeTemplate())
        .pipe(gulp.dest('compiled'));
});

