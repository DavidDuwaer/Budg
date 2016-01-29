var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('scripts', function() {
    return gulp.src([
        './javascript/api.js',
        './javascript/util.js',
        './javascript/main.js',
        './javascript/tabs.js',
        './javascript/streamgraph.js',
        './javascript/legend.js',
        './javascript/treemap.js'
    ]).pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('vendor', function() {
    return gulp.src([
        './node_modules/jquery/dist/jquery.js',
        './vendor/zurb/foundation/dist/foundation.js',
        './node_modules/d3/d3.js',
    ]).pipe(concat('vendor.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('sass', function () {
    gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./javascript/**/*.js', ['scripts']);
});

gulp.task('clean', function() {
    return del(['dist']);
})

gulp.task('build', function() {
    return runSequence(
        ['clean'],
        ['vendor', 'sass', 'scripts']
    )
});