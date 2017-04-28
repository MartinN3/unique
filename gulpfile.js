var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('sass', function () {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed', sourceComments: 'map'}, {errLogToConsole: true}))
        .pipe(prefix("last 2 versions", "> 1%", "ie 8", "Android 2", "Firefox ESR"))
        .pipe(gulp.dest('./css'))
        .pipe(reload({stream:true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: true
    });
});

gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("./scss/*.scss", ['sass']);
    gulp.watch(["./js/**/*.js", "./*.html"], reload);
});