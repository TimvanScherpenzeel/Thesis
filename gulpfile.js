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
    shell = require('gulp-shell'),

    // Banner
    banner = require('gulp-banner'),
    pkg = require('./package.json'),
    comment = 
    '/*\n' +
    '\n' +
    '  <%= pkg.description %>\n' +
    '\n' +
    '    dMMMMMMP dMP dMP .dMMMb\n' +      
    '      dMP   dMP dMP dMP" VP        Bachelor thesis - Simulating cloth in WebGL\n' +
    '     dMP   dMP dMP  VMMMb          Copyright (c) 2016 Tim van Scherpenzeel\n' +
    '    dMP    YMvAP" dP .dMP          https://www.timvanscherpenzeel.com\n' +
    '   dMP      VP"   VMMMP"\n' +
    '\n' +
    '  Released under the <%= pkg.license %> license.\n' +
    '  Version number: <%= pkg.version %>\n' +
    '\n' +
    '*/\n\n';

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
            'scripts/GUI.js',
            'scripts/GPGPU.js',
            'scripts/simulation.js',
            'scripts/shaderloader.js',
            'scripts/main.js'
        ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(banner(comment, { pkg: pkg }))
        .pipe(gulp.dest('build'));
});

gulp.task('clean', shell.task(['rm -rf build/*']));

gulp.task('serve', ['styles', 'scripts'], function() {
    gulp.watch('styles/**/*.scss', ['styles']);
    gulp.watch('scripts/**/*.js', ['scripts']);
});

gulp.task('build', ['clean', 'styles', 'scripts']);

gulp.task('default', ['build']);