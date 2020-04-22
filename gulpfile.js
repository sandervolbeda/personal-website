const gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    useref = require('gulp-useref'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify-es').default,
    gulpIf = require('gulp-if'),
    cssnano = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('gulp4-run-sequence'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    ghPages = require('gulp-gh-pages');

const serviceWorkerConfig = {
    environment: 'development',
    development () {
        return this.environment === 'development';
    },
    production () {
        return this.environment === 'production';
    }
};

// Basic Gulp task syntax
gulp.task('hello', function () {
    console.log('Hello world!');
});

gulp.task('set-production', function(done) {
    serviceWorkerConfig.environment = 'production';

    done();
});

gulp.task('generate-service-worker', function (callback) {
    var swPrecache = require('sw-precache');
    var rootDir = serviceWorkerConfig.production() ? 'dist' : 'app';

    swPrecache.write(`${rootDir}/service-worker.js`, {
        staticFileGlobs: [rootDir + '/**/*.{js,html,css,eot,ttf,woff}'],
        stripPrefix    : rootDir,
        runtimeCaching : [
            {
                urlPattern: /.(jpg|png|gif|svg)/,
                handler   : 'cacheFirst'
            },
            {
                urlPattern: /googleapis.com/,
                handler   : 'networkFirst'
            },
            {
                urlPattern: /gstatic.com/,
                handler   : 'networkFirst'
            }
        ]
    }, callback);
});

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        }
    })
});

gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
        .pipe(gulp.dest('app/css')) // Outputs it in the css folder
        .pipe(browserSync.reload({ // Reloading with Browser Sync
            stream: true
        }));
});

gulp.task('sass:prod', function () {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css/')); // Outputs it in the css folder
});

gulp.task('copy-files', function(done) {
    gulp.src('app/css/aos.css')
        .pipe(gulp.dest('./dist/css/'));

    gulp.src('app/js/lib/aos.js')
        .pipe(gulp.dest('./dist/js/'));

    gulp.src([
        'app/**/*',
        '!app/scss/**/*'
    ])
        .pipe(gulp.dest('./dist/'));

    done();
});

// Watchers
gulp.task('watch', function () {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', ['site-js']);
});

// JSHint, concat, and minify JavaScript
gulp.task('site-js', function () {
    return gulp.src([

        // Grab your custom scripts
        './app/js/lib/**/*.js'

    ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write('.')) // Creates sourcemap for minified JS
        .pipe(gulp.dest(serviceWorkerConfig.production() ? './dist/js' : './app/js'))
});

// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task('useref', function () {

    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// Optimizing Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});

// Copying fonts
gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});

// Cleaning
gulp.task('clean:dist', function (done) {
    del.sync(['dist/**/*', '!dist/images/**/*']);
    done();
});

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
    runSequence([
        'sass', 'generate-service-worker', 'browserSync',
        ], 'watch',
        callback
    )
});

gulp.task('build', function (callback) {
    runSequence(
        'set-production',
        'clean:dist',
        'sass:prod',
        'copy-files',
        ['useref', 'images', 'fonts', 'site-js'],
        'generate-service-worker',
        callback
    )
});
