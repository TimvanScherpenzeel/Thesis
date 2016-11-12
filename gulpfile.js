var gulp = require('gulp'),
    
    // Styles
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // Error handling
    plumber = require('gulp-plumber');

gulp.task('styles', function() {
    return gulp.src('styles/**/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
        .pipe(gulp.dest('build'));
});

gulp.task('serve', ['styles'], function() {
    gulp.watch('styles/**/*.scss', ['styles']);
});

gulp.task('build', ['styles']);

gulp.task('default', ['build']);