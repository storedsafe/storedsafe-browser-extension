import { watch, series, parallel, dest, src } from 'gulp'

// Rollup plugins
import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

// Gulp plugins
import rollupStreamedChunk from './plugins/gulp-rollup-streamed-chunk'
import archive from 'gulp-zip'
import merge from 'gulp-merge-json'

import del from 'del'

const PUBLIC_DIR = './public'
const EXTERNALS_DIR = PUBLIC_DIR + '/externals'
const OUT_DIR = PUBLIC_DIR + '/build'
const DIST_DIR = './dist/build'
const DIST_DIR_CHROME = DIST_DIR + '/chrome'
const DIST_DIR_FIREFOX = DIST_DIR + '/firefox'
const ZIP_DIR = './dist/zip'
const ZIP_FILE_CHROME = 'chrome.zip'
const ZIP_FILE_FIREFOX = 'firefox.zip'
const EXTERNALS = [
  'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
  'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'
]

let production = process.env.NODE_ENV !== 'development'
const rollup_plugins = () => [commonjs(), typescript(), production && terser()]

/**
 * Clean build directories.
 */
export function clean () {
  return del([OUT_DIR, DIST_DIR])
}

/**
 * Transpile UI script.
 */
export function ui () {
  return rollupStreamedChunk({
    input: './src/ui/main.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'ui.bundle.js',
      name: 'app'
    },
    plugins: [
      svelte({
        css: css => css.write('bundle.css', true),
        preprocess: sveltePreprocess()
      }),
      resolve({ browser: true, dedupe: ['svelte', 'storedsafe'] }),
      ...rollup_plugins()
    ]
  }).pipe(dest(OUT_DIR))
}

/**
 * Transpile content script.
 */
export function content () {
  return rollupStreamedChunk({
    input: './src/content_script/content_script.ts',
    output: {
      sourcemap: true,
      format: 'umd',
      file: 'content_script.bundle.js',
      name: 'content_script'
    },
    plugins: [
      resolve({ browser: true, dedupe: ['foo', 'storedsafe'] }),
      ...rollup_plugins()
    ]
  }).pipe(dest(OUT_DIR))
}

/**
 * Transpile background script
 */
export function background () {
  return rollupStreamedChunk({
    input: './src/background/background.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'background.bundle.js',
      name: 'background'
    },
    plugins: [
      resolve({ browser: true, dedupe: ['storedsafe'] }),
      ...rollup_plugins()
    ]
  }).pipe(dest(OUT_DIR))
}

/**
 * Copy external dependencies to build folder.
 */
export function copyExternals () {
  return src(EXTERNALS).pipe(dest(EXTERNALS_DIR))
}

/**
 * Create unpackaged distribution for chrome from last build.
 */
export function distChrome () {
  return src(PUBLIC_DIR + '/**/*').pipe(dest(DIST_DIR_CHROME))
}

/**
 * Create unpackaged distribution for firefox from last build.
 */
export function distFirefox () {
  return src(PUBLIC_DIR + '/**/*').pipe(dest(DIST_DIR_FIREFOX))
}

/**
 * Merge common extension manifest with chrome extension manifest
 * and place in the last unpackaged distribution for chrome.
 */
export function manifestChrome () {
  return src([
    'src/manifests/manifest.common.json',
    'src/manifests/manifest.chrome.json'
  ])
    .pipe(merge({ fileName: 'manifest.json' }))
    .pipe(dest(DIST_DIR_CHROME))
}

/**
 * Merge common extension manifest with firefox extension manifest
 * and place in the last unpackaged distribution for firefox.
 */
export function manifestFirefox () {
  return src([
    'src/manifests/manifest.common.json',
    'src/manifests/manifest.firefox.json'
  ])
    .pipe(merge({ fileName: 'manifest.json' }))
    .pipe(dest(DIST_DIR_FIREFOX))
}

/**
 * Create zipped distribution from last unpackaged chrome distribution.
 */
export function zipChrome () {
  return src(DIST_DIR_CHROME + '/**/*')
    .pipe(archive(ZIP_FILE_CHROME))
    .pipe(dest(ZIP_DIR))
}

/**
 * Create zipped distribution from last unpackaged firefox distribution.
 */
export function zipFirefox () {
  return src(DIST_DIR_FIREFOX + '/**/*')
    .pipe(archive(ZIP_FILE_FIREFOX))
    .pipe(dest(ZIP_DIR))
}

export const rollup = parallel(ui, content, background)
export const dist = parallel(distChrome, distFirefox)
export const manifests = parallel(manifestChrome, manifestFirefox)
export const zip = parallel(zipChrome, zipFirefox)
export const build = series(
  clean,
  parallel(rollup, copyExternals),
  parallel(dist, manifests),
  zip
)

/**
 * Force production mode to false.
 */
const buildDev = series(clean, parallel(rollup, copyExternals), parallel(dist, manifests))
export const dev = function () {
  process.env.NODE_ENV = 'development'
  production = false

  return buildDev
}()

function listen() {
  // Listen for updates to scripts
  watch('src/ui/**/*', series(ui, dist))
  watch('src/content_script/**/*', series(content, dist))
  watch('src/background/**/*', series(background, dist))
  // Rebuild all if global files change
  watch('src/global/**/*', series(rollup, dist))
  // Listen for updates to manifests
  watch('src/manifests/**/*', manifests)
  // Listen for changes to external dependencies (for exapmle on npm i)
  watch(EXTERNALS, copyExternals)
  // Watch public directories
  watch([`${PUBLIC_DIR}/**/*`, `!${OUT_DIR}/*`], dist)
}

const watchDev = series(dev, listen)
export { watchDev as watch }

export default production ? dev : build
