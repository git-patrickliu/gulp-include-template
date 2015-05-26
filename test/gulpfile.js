/**
 * Created by patrickliu on 15/5/26.
 */

var includeTemplate = require('../index'),
    gulp = require('gulp');


gulp.task('test', function() {
    gulp.src('./index.html')
        .pipe(includeTemplate)
        .pipe(gulp.dest('compiled'));
});
