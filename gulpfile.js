var gulp = require('gulp'),
    
    // Styles
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // Error handling
    plumber = require('gulp-plumber');

gulp.task('sass', function() {
    return gulp.src('sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
        .pipe(gulp.dest('css'));
});

gulp.task('serve', ['sass'], function() {
    gulp.watch('sass/**/*.scss', ['sass']);
});

gulp.task('build', ['sass']);

gulp.task('default', ['build']);