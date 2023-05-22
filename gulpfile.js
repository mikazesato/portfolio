const gulp = require('gulp');

// scss
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber'); // エラー時の強制終了を防止
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');
const sassGlob = require('gulp-sass-glob'); // @importを纏めて指定
const mqpacker = require('css-mqpacker'); // メディアクエリをまとめる

// js
const uglify = require("gulp-uglify");
const browserSync = require('browser-sync');

// image
// const imagemin = require("gulp-imagemin");
// const imageminMozjpeg = require("imagemin-mozjpeg");
// const imageminPngquant = require("imagemin-pngquant");
// const imageminSvgo = require("imagemin-svgo");



/*
  sassコンパイル
*/

function compileSass() {
  const postcssPlugins = [
    autoprefixer({
      cascade: false,
    }),
    cssdeclsort({ order: 'alphabetical' })
  ]

  return gulp
  .src(["./src/scss/**/*.scss", "!./src/scss/_**/*.scss"], { sourcemaps: true })
  .pipe(plumber())
  .pipe(sassGlob())
  .pipe(sass({outputStyle: 'expanded'}))
  .pipe(postcss(postcssPlugins))
  .pipe(postcss([mqpacker()]))
  .pipe(gulp.dest("./dist/css"));
}


/*
  jsコンパイル
*/

function compileJs() {
  return gulp
  .src(["./src/js/**/*.js", "!./src/js/_**/*.js"], { sourcemaps: true })
  .pipe(plumber())
  .pipe(uglify())
  .pipe(gulp.dest("./dist/js"))
}

/*
  画像圧縮
*/

// function imageMin() {
//   return gulp
//   .src("./src/images/**/*")
//   .pipe(
//     imagemin(
//       [
//         imageminMozjpeg({
//           quality: 80
//         }),
//         imageminPngquant(),
//         imageminSvgo({
//           plugins: [{
//             removeViewbox: false
//           }]
//         })
//       ], {
//         verbose: true
//       }
//     )
//   )
//   .pipe(gulp.dest("./dist/images"))
// }

/*
  ローカルサーバ起動
*/

function buildServer(done) {
  browserSync.init({
    port: 8080,
    notify: false,
    server: {
      baseDir: './dist',
    },
    reloadOnRestart: true,
  })
  done()
}


/*
  ファイル監視
*/

function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload();
    done();
  };
  gulp.watch("./dist/*.html").on('change', browserReload)
  gulp.watch("./src/scss/**/*.scss").on('change', gulp.series(compileSass, browserReload))
  gulp.watch("./src/js/**/*.js").on('change', gulp.series(compileJs, browserReload))
  gulp.watch("./dist/images/**/*").on('change', browserReload)
}


exports.default = gulp.series(
  gulp.parallel(compileSass, compileJs),
  gulp.parallel(buildServer, watchFiles)
);
