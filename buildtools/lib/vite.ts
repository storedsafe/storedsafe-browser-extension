import * as vite from "vite";
import type { InlineConfig } from "vite";
import type { RollupOutput } from "rollup";
import { Logger } from "./logger";

const logger = new Logger("vite");
const opts = global.buildtools?.opts ?? {};

export async function build(config: InlineConfig) {
  try {
    if (!config.build) config.build = {};
    if (opts.watch) config.build.watch = {};
    const result = await vite.build(config);
    return result;
  } catch (e) {
    logger.err("vite build failed: %s", e);
  }
}
