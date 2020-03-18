/* eslint no-console: 'off' */
const { series, parallel, src, dest } = require('gulp');
const path = require('path');
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
    ];
  } else {
    files = [
      'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    ];
  }
  return src(files)
    .pipe(rename((file) => ({
      dirname: file.dirname,
      basename: file.basename.split('.')[0],
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

function buildCommon() {
  return new Promise((resolve, reject) => {
    const config = {
      ...webpackConfig,
      entry: {
        extension: path.join(__dirname,
          'src/extension/index.jsx'),
        background: path.join(__dirname,
          'src/extension/scripts/background.js'),
        content_script: path.join(__dirname,
          'src/extension/scripts/content_script.js'),
      },
      output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'build/'),
      },
      mode: devBuild ? 'development' : 'production',
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

const taskBuild = series(
  lint,
  clean,
  parallel(
    buildCommon,
    copyAssets,
    copyThirdPartyLibs,
    copyChromeFiles,
    copyFirefoxFiles,
    manifestChrome,
    manifestFirefox,
  ),
  parallel(
    copyBuildToChrome, copyBuildToFirefox,
  ),
);

exports.clean = clean;
exports.default = taskBuild;
