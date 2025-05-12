import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import pkg from "./package.json" assert { type: "json" };

import * as vite from "./buildtools/lib/vite";
import { series, parallel } from "./buildtools/lib/buildtools";
import { mergeAndCopyJsonFiles } from "./buildtools/lib/merge";
import fileutils, { copy, zipDir } from "./buildtools/lib/fileutils";
import { rm } from "./buildtools/lib/clean";

import type { InlineConfig, PluginOption } from "vite";
import browserIncludeExternalPlugin from "./plugins/vite-plugin-browser-polyfill";
import viteCustomLogging from "./plugins/vite-plugin-custom-logging";
import merge from "lodash.merge";

const OUT_DIR = path.join("dist", "build");
const ZIP_DIR = path.join("dist", "zip");
const BROWSER_POLYFILL_LIB = "/externals/browser-polyfill.min.js";
const opts = global.buildtools?.opts;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//
// SECTION: Helper functions
//
function buildManifest(platform: string) {
  const inFiles = [
    "src/manifest/manifest.common.json",
    `src/manifest/manifest.${platform}.json`,
  ];
  const outFile = `${OUT_DIR}/${platform}/manifest.json`;
  mergeAndCopyJsonFiles(inFiles, outFile);
}

function copyDependencies(platform: string, inFiles: string[]) {
  const outPath = `${OUT_DIR}/${platform}/externals`;
  copy(inFiles, outPath);
}

function copyPublicFiles(platform: string, inFiles: string[]) {
  const outPath = `${OUT_DIR}/${platform}`;
  copy(inFiles, outPath);
}

function makeViteConfig(platform: string): InlineConfig | InlineConfig[] {
  const commonConfig: InlineConfig = {
    logLevel: "silent",
    plugins: [
      svelte(),
      browserIncludeExternalPlugin(platform, BROWSER_POLYFILL_LIB),
      viteCustomLogging(),
    ],
    build: {
      rollupOptions: {
        external: [/externals/, "psl"],
        output: {
          paths: {
            psl: "/externals/psl.mjs",
          },
        },
      },
      outDir: `${OUT_DIR}/${platform}`,
      sourcemap: opts.dev,
      emptyOutDir: false, // Deletes other task files during watch if true
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };

  return [
    merge(
      {
        build: {
          rollupOptions: {
            input: path.resolve(__dirname, "popup.html"),
            output: {
              entryFileNames: "popup.storedsafe.js",
            },
          },
        },
      },
      commonConfig
    ),
    merge(
      {
        build: {
          rollupOptions: {
            input: path.resolve(__dirname, "src/background/main.ts"),
            output: {
              entryFileNames: "background.storedsafe.js",
              format: "es",
            },
          },
        },
      },
      commonConfig
    ),
    merge(
      {
        build: {
          rollupOptions: {
            input: path.resolve(__dirname, "src/content_script/main.ts"),
            output: {
              entryFileNames: "content_script.storedsafe.js",
              format: "iife",
            },
          },
        },
      },
      commonConfig
    ),
    merge(
      {
        build: {
          rollupOptions: {
            input: path.resolve(__dirname, "content_script.html"),
            output: {
              entryFileNames: "content_script.ui.storedsafe.js",
              format: "iife",
            },
          },
        },
      },
      commonConfig
    ),
  ];
}

//
// SECTION: Exported tasks
//

/* Cleanup */
export function cleanChrome() {
  rm(path.join(`${OUT_DIR}`, "chrome"));
}
export function cleanFirefox() {
  rm(path.join(`${OUT_DIR}`, "firefox"));
}
export const clean = parallel(cleanChrome, cleanFirefox);

/* Manifest */
export function manifestChrome() {
  buildManifest("chrome");
}
export function manifestFirefox() {
  buildManifest("firefox");
}
export const manifest = parallel(manifestChrome, manifestFirefox);

/* External dependencies */
export function copyDepsChrome() {
  const inFiles: string[] = [
    "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
    "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map",
    "node_modules/psl/dist/psl.mjs",
  ];
  copyDependencies("chrome", inFiles);
}
export function copyDepsFirefox() {
  const inFiles: string[] = ["node_modules/psl/dist/psl.mjs"];
  copyDependencies("firefox", inFiles);
}
export const copyDeps = parallel(copyDepsChrome, copyDepsFirefox);

/* Public files */
export function copyPublicChrome() {
  const inFiles: string[] = ["public"];
  copyPublicFiles("chrome", inFiles);
}
export function copyPublicFirefox() {
  const inFiles: string[] = ["public"];
  copyPublicFiles("firefox", inFiles);
}
export const copyPublic = parallel(copyPublicChrome, copyPublicFirefox);

/* Build svelte */
export async function buildSvelteChrome() {
  const config = makeViteConfig("chrome");
  return vite.build(config);
}
export async function buildSvelteFirefox() {
  const config = makeViteConfig("firefox");
  return vite.build(config);
}

/* Zip build output */
export async function zipChrome() {
  return zipDir(path.join(OUT_DIR, "chrome"), path.join(ZIP_DIR, "chrome.zip"));
}
export async function zipFirefox() {
  return zipDir(
    path.join(OUT_DIR, "firefox"),
    path.join(ZIP_DIR, "firefox.zip")
  );
}

/* Final builds */
export const buildChrome = series(
  cleanChrome,
  buildSvelteChrome,
  parallel(manifestChrome, copyDepsChrome),
  zipChrome
);
export const buildFirefox = series(
  cleanFirefox,
  buildSvelteFirefox,
  parallel(manifestFirefox, copyDepsFirefox),
  zipFirefox
);
export const build = parallel(buildChrome, buildFirefox);
