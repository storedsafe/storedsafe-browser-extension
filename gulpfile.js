/* eslint no-console: 'off' */
const { watch, series, parallel, src, dest } = require('gulp');
const del = require('del');
const merge = require('gulp-merge-json');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const devBuild = process.env.NODE_ENV !== 'production';

function lint() {
  return src(['./src/*.js', './src/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function clean() {
  return del(['build/*', 'dist/*']);
}

function copyAssets() {
  return src('src/assets/*')
    .pipe(dest('build/'));
}

function manifestChrome() {
  return src([
    'src/manifests/manifest.common.json',
    'src/manifests/manifest.chrome.json',
  ]).pipe(merge({ fileName: 'manifest.json' }))
    .pipe(dest('dist/chrome/'));
}

function manifestFirefox() {
  return src([
    'src/manifests/manifest.common.json',
    'src/manifests/manifest.firefox.json',
  ]).pipe(merge({ fileName: 'manifest.json' }))
    .pipe(dest('dist/firefox/'));
}

function copyChromeFiles() {
  return src([
    'src/chrome/*',
  ]).pipe(dest('dist/chrome/'));
}

function copyFirefoxFiles() {
  return src([
    'src/firefox/*',
  ]).pipe(dest('dist/firefox/'));
}

function copyThirdPartyLibs() {
  let files;
  if (devBuild) {
    files = [
      'node_modules/webextension-polyfill/dist/browser-polyfill.js',
      'node_modules/webextension-polyfill/dist/browser-polyfill.js.map',
    ];
  } else {
    files = [
      'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
      'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map',
    ];
  }
  const removeRegex = /\.min|\.production|\.development|\.profiling/;
  return src(files)
    .pipe(rename((file) => ({
      dirname: file.dirname,
      basename: file.basename.replace(removeRegex, ''),
      extname: file.extname,
    }))).pipe(dest('build/lib/'));
}

function copyBuildToChrome() {
  return src('build/**/*')
    .pipe(dest('dist/chrome/'));
}

function copyBuildToFirefox() {
  return src('build/**/*')
    .pipe(dest('dist/firefox/'));
}

function buildWebpack() {
  return new Promise((resolve, reject) => {
    const config = {
      ...webpackConfig,
    };

    webpack(config).run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(stats);
      } else {
        console.log(stats.toJson().assets.map((asset) => (
          `webpack ${asset.name} ${asset.size}`
        )).join('\n'));
        resolve(stats);
      }
    });
  });
}

const copyStatic = parallel(
  copyAssets,
  copyThirdPartyLibs,
  copyChromeFiles,
  copyFirefoxFiles,
  manifestChrome,
  manifestFirefox,
);

const copyToDist = parallel(
  copyBuildToChrome, copyBuildToFirefox,
);

const build = series(
  lint,
  clean,
  parallel(
    buildWebpack,
    copyStatic,
  ),
  copyToDist,
);

const taskWatch = () => {
  watch([
    './src/**/*',
    '!./src/__mocks__/*',
    '!./src/__tests__/*',
  ], { ignoreInitial: false }, build);
};

exports.clean = clean;
exports.default = build;
exports.watch = taskWatch;
