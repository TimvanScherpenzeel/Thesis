var gulp = require('gulp'),
    
    // Styles
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // Scripts
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),

    // Error handling
    plumber = require('gulp-plumber'),

    // Shell
    shell = require('gulp-shell');

gulp.task('styles', function() {
    return gulp.src('styles/**/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
        .pipe(gulp.dest('build'));
});

gulp.task('scripts', function() {
    return gulp.src([
            'scripts/vendor/three.js',
            'scripts/vendor/dat.gui.js',
            'scripts/vendor/stats.min.js',
            'scripts/vendor/orbitcontrols.js',
            'scripts/gui.js',
            'scripts/gpgpu.js',
            'scripts/simulation.js',
            'scripts/main.js'
        ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('clear', shell.task(['rm -rf build/*']));

gulp.task('serve', ['styles', 'scripts'], function() {
    gulp.watch('styles/**/*.scss', ['styles']);
    gulp.watch('scripts/**/*.js', ['scripts']);
});

gulp.task('build', ['clear', 'styles', 'scripts']);

gulp.task('default', ['build']);