const { series, parallel, src, dest } = require('gulp');
const path = require('path');
const del = require('del');
const webpack = require('webpack');
const merge = require('gulp-merge-json');
const rename = require('gulp-rename');

const devBuild = process.env.NODE_ENV !== 'production';

function clean() {
  return del(['build/*', 'dist/*']);
}

function copy_assets() {
  return src([
    'src/assets/*',
    '!src/assets/manifest.common.json',
  ])
    .pipe(dest('build/'));
}

function manifest_chrome() {
  return src([
    'src/assets/manifest.common.json',
    'src/chrome/manifest.chrome.json',
  ]).pipe(merge({fileName: 'manifest.json'}))
    .pipe(dest('dist/chrome/'));
}

function manifest_firefox() {
  return src([
    'src/assets/manifest.common.json',
    'src/firefox/manifest.firefox.json',
  ]).pipe(merge({fileName: 'manifest.json'}))
    .pipe(dest('dist/firefox/'));
}

function copy_chrome_files() {
  return src([
    'src/chrome/*',
    '!src/chrome/manifest.chrome.json',
  ]).pipe(dest('dist/chrome/'));
}

function copy_firefox_files() {
  return src([
    'src/firefox/*',
    '!src/firefox/manifest.firefox.json',
  ]).pipe(dest('dist/firefox/'));
}

function copy_third_party_libs() {
  let files;
  if (devBuild) {
    files = [
      'node_modules/react/umd/react.development.js',
      'node_modules/react-dom/umd/react-dom.development.js',
      'node_modules/webextension-polyfill/dist/browser-polyfill.js',
    ];
  } else {
    files = [
      'node_modules/react/umd/react.production.min.js',
      'node_modules/react-dom/umd/react-dom.production.min.js',
      'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    ];
  }
  return src(files)
    .pipe(rename(path => {
      return {
        dirname: path.dirname,
        basename: path.basename.split('.')[0],
        extname: path.extname,
      };
    })).pipe(dest('build/lib/'));
}

function copy_build_to_chrome() {
  return src('build/**/*')
    .pipe(dest('dist/chrome/'));
}

function copy_build_to_firefox() {
  return src('build/**/*')
    .pipe(dest('dist/firefox/'));
}

function build_common() {
  return new Promise((resolve, reject) => {
    const config = {
      ...require('./webpack.config.js'),
      entry: {
        popup: path.join(__dirname, 'src/extension/popup/index.js'),
        app: path.join(__dirname, 'src/extension/app/index.js'),
        background: path.join(__dirname, 'src/extension/background/background.js'),
        content_script: path.join(__dirname, 'src/extension/content_script/content_script.js'),
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
        console.log(stats.toJson().assets.map(asset => {
          return `webpack ${asset.name} ${asset.size}`;
        }).join('\n'));
        resolve(stats);
      }
    });
  });
}

const task_build = series(
  clean,
  parallel(
    build_common,
    copy_assets,
    copy_third_party_libs,
    copy_chrome_files,
    copy_firefox_files,
    manifest_chrome,
    manifest_firefox,
  ),
  parallel(
    copy_build_to_chrome, copy_build_to_firefox
  )
);

exports.clean = clean;
exports.default = task_build;
