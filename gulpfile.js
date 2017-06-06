// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

// Style Dependencies
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

// Build Dependencies
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

// Development Dependencies
var jshint = require('gulp-jshint');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


gulp.task('sass', function () {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed', sourceComments: 'map'}, {errLogToConsole: true}))
        .pipe(prefix("last 2 versions", "> 1%", "ie 8", "Android 2", "Firefox ESR"))
        .pipe(gulp.dest('./public/css'))
        .pipe(reload({stream:true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: true
    });
});

gulp.task('lint-client', function() {
    return gulp.src('./js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', ['browserify-client'], function() {
    return gulp.src('build/script.js')
        .pipe(uglify())
        .pipe(rename('script.min.js'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('browserify-client', ['lint-client'], function() {
    return gulp.src('js/script.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('build', ['uglify']);

gulp.task('default', ['sass', 'browser-sync', 'browserify-client'], function () {
    gulp.watch("./scss/*.scss", ['sass']);
    gulp.watch('./js/**/*.js', ['browserify-client']);
    gulp.watch(["./*.html"], reload);
});