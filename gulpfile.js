//browserSync
const gulp = require("gulp");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const debug = require("gulp-debug").default;
const dartSass = require("gulp-dart-sass");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

// テーマディレクトリへの相対パス
const themeDir = "./wp-content/themes/muashi";

let path = {
  src: {
    scss: `${themeDir}/src/scss/style.scss`,
    editorScss: `${themeDir}/src/scss/editor-download-button.scss`,
    js: `${themeDir}/src/js/main.js`,
  },
  dist: {
    css: `${themeDir}/assets/css`,
    js: `${themeDir}/assets/js`,
  },
  watch: {
    scss: `${themeDir}/src/scss/**/*.scss`,
    js: `${themeDir}/src/js/**/*.js`,
    php: `${themeDir}/**/*.php`,
  }
};

const webpackConfig = {
  mode: "production",
  output: {
    filename: "common.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};

// splide CSSコピータスク
const copySplide = () => {
  return gulp
    .src("./node_modules/@splidejs/splide/dist/css/splide.min.css")
    .pipe(gulp.dest(path.dist.css));
};

// sassのコンパイル
const compileSass = () => {
  return gulp
    .src(path.src.scss)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      dartSass({
        outputStyle: "expanded",
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(path.dist.css))
    .pipe(
      debug({
        title: "scss dest:",
      })
    );
};

// エディタ用SCSSのコンパイル
const compileEditorSass = () => {
  return gulp
    .src(path.src.editorScss)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      dartSass({
        outputStyle: "expanded",
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(path.dist.css));
};

// SCSSタスク統合
const scss = gulp.parallel(copySplide, compileSass, compileEditorSass);

// JSのコンパイル
const js = () => {
  return gulp
    .src(path.src.js)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(path.dist.js))
    .pipe(
      debug({
        title: "js dest:",
      })
    );
}

//ブラウザの設定
const browser_init = (done) => {
  browserSync.init({
    proxy: process.env.BROWSERSYNC_PROXY || "http://musashi-toryo.local/",
    open: true,
    watchOptions: {
      debounceDelay: 1000, //1秒間、タスクの再実行を抑制
    },
  });
  done();
};

//リロード実行タスク
const browser_reload = (done) => {
  browserSync.reload();
  done();
};

//watch処理
const watch_files = (done) => {
  gulp.watch(path.watch.scss, gulp.series(scss, browser_reload));
  gulp.watch(path.watch.js, gulp.series(js, browser_reload));
  gulp.watch(path.watch.php, browser_reload);
  done();
};

//タスク実行
exports.default = gulp.series(browser_init, watch_files, gulp.parallel(scss, js));
exports.build = gulp.parallel(scss, js);
exports.js = js;
exports.scss = scss;
