import * as vite from "vite";
import type { InlineConfig } from "vite";
import { Logger } from "./logger";

const logger = new Logger("vite");
const opts = global.buildtools?.opts ?? {};

export async function build(config: InlineConfig | InlineConfig[]) {
  try {
    if (!(config instanceof Array)) {
      config = [config];
    }
    for (let entry of config) {
      if (!entry.build) entry.build = {};
      if (opts.watch) entry.build.watch = {};
      await vite.build(entry);
    }
  } catch (e) {
    logger.err("vite build failed: %s", e);
  }
}
