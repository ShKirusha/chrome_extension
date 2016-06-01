'use strict';
 
// var os = require('os');

var gulp = require('gulp'),
    open = require('gulp-open');


//--------------------------------------------------------------------------------------

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


//--------------------------------------------------------------------------------------

gulp.task('refresh', function () {
    return gulp.src('/**/*.*') //Найдем наш main файл
        
});

gulp.task('uri', function(){
  gulp.src(__filename)
  .pipe(open({uri: 'http://www.google.com'}));
});


/*gulp.task('build', gulp.series(
    'refresh',
));*/


gulp.task('watch', function(){
    gulp.watch(path.watch.js, gulp.series('refresh'));
});



gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// gulp.task('default', gulp.series('build', 'webserver', 'watch'));