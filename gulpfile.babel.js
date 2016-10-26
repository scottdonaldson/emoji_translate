var _ = require('lodash'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    awspublish = require('gulp-awspublish'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync').create(),
    babelify = require('babelify'),
    watchify = require('watchify'),
    server = require('./server.js');

// ----- Config

var aws = require('./aws.json');

var paths = {
    jsIn: ['js/src/main.js', 'js/src/dictionary.js'],
    jsOut: 'js/dist',
    cssIn: 'scss/**/*.scss',
    cssOut: 'css',
    html: ['./index.html']
};

var site = {
    'index.html': '',
    'css/**/*': 'css',
    'js/dist/main.js': 'js/dist',
    'img/**/*': 'img'
};

function css() {

    var processors = [
        autoprefixer('last 2 versions')
    ];

    gulp.src( paths.cssIn )
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest( paths.cssOut ));

}

gulp.task('css', css);

function dict() {

    var bundler = watchify(browserify('js/src/dictionary.js',
        _.assign(watchify.args, {
            debug: true
        })
    ));

    bundler.on('update', bundle);

    bundler.on('error', function(error) {
        console.log('Browserify error', error);
    });

    function bundle() {

        console.log('Bundle...');

        var hrTime = process.hrtime();
        var t1 = hrTime[0] * 1000 + hrTime[1] / 1000000;

        bundler
            .transform('babelify', {
                presets: ['es2015', 'react']
            })
            .bundle()
            .pipe( source( 'dictionary.js' ) )
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('js/dist'));

        hrTime = process.hrtime();
        var t2 = hrTime[0] * 1000 + hrTime[1] / 1000000;

        console.log('Bundle took ' + Math.round(t2 - t1) + ' ms');

    }

    return bundle();
}

gulp.task('dict', dict);

function build() {

    paths.jsIn.forEach(function(path) {

        var bundler = watchify(browserify(path,
            _.assign(watchify.args, {
                debug: true
            })
        ));

        bundler.on('update', bundle);

        bundler.on('error', function(error) {
            console.log('Browserify error', error);
        });

        function bundle() {

            console.log('Bundle...');

            var hrTime = process.hrtime();
            var t1 = hrTime[0] * 1000 + hrTime[1] / 1000000;

            bundler
                .transform('babelify', {
                    presets: ['es2015', 'react']
                })
                .bundle()
                .pipe( source( path.split('/').pop() ) )
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(uglify())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('js/dist'));

            hrTime = process.hrtime();
            var t2 = hrTime[0] * 1000 + hrTime[1] / 1000000;

            console.log('Bundle took ' + Math.round(t2 - t1) + ' ms');

        }

        return bundle();

    });
}

gulp.task('build', build);

gulp.task('publish', function() {

    var publisher = awspublish.create({
        params: {
            Bucket: aws.bucket
        },
        accessKeyId: aws.key,
        secretAccessKey: aws.secret
    });

    for ( var key in site ) {
        gulp.src(key)
            .pipe(gulp.dest('site/' + site[key]))
    }

    gulp.src('site/**/*')
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(awspublish.reporter());

});

gulp.task('watch', ['css', 'build'], function() {
    gulp.watch('./scss/*.scss', ['css']);
});

gulp.task('serve', ['watch'], function() {
    server.start();
});

gulp.task('default', ['css', 'build', 'serve']);

gulp.task('edit', ['css', 'dict', 'serve']);
