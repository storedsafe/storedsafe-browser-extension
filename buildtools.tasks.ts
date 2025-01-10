import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import pkg from "./package.json" assert { type: "json" };

import * as vite from "./buildtools/lib/vite";
import { series, parallel } from "./buildtools/lib/buildtools";
import { mergeAndCopyJsonFiles } from "./buildtools/lib/merge";
import fileutils, { copy } from "./buildtools/lib/fileutils";
import { rm } from "./buildtools/lib/clean";

import type { InlineConfig, PluginOption } from "vite";

const OUT_DIR = path.join("dist", "build");
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

function makeViteConfig(platform: string): InlineConfig {
  return {
    logLevel: "info",
    plugins: [svelte()],
    build: {
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, "src/popup/main.ts"),
          background: path.resolve(__dirname, "src/background/main.ts"),
          content: path.resolve(__dirname, "src/content/main.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].[hash].js",
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
    // "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
    // "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map",
  ];
  copyDependencies("chrome", inFiles);
}
export function copyDepsFirefox() {
  const inFiles: string[] = [];
  copyDependencies("chrome", inFiles);
}
export const copyDeps = parallel(copyDepsChrome, copyDepsFirefox);

/* Public files */
export function copyPublicChrome() {
  const inFiles: string[] = ["public"];
  copyPublicFiles("chrome", ["public"]);
}
export function copyPublicFirefox() {
  const inFiles: string[] = ["public"];
  copyPublicFiles("firefox", ["public"]);
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

/* Final builds */
export const buildChrome = series(
  cleanChrome,
  buildSvelteChrome,
  parallel(manifestChrome, copyDepsChrome)
);
export const buildFirefox = series(
  cleanFirefox,
  buildSvelteFirefox,
  parallel(manifestFirefox, copyDepsFirefox)
);
export const build = parallel(buildChrome, buildFirefox);
