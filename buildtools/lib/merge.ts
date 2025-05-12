import merge from "lodash.merge";
import * as fileutils from "./fileutils";
import { Logger } from "./logger";

const logger = new Logger("merge");
const opts = global.buildtools?.opts ?? {};

/**
 * Merges one or more JSON files and returns a formatted string.
 * @param files List of JSON files.
 * @returns Formatted JSON string.
 */
export function mergeJsonFiles(...files: string[]): string {
  const mergedJson = files.reduce((acc: Record<string, object>, fileName) => {
    if (fileutils.isFile(fileName)) {
      try {
        const data: object = JSON.parse(fileutils.readFile(fileName));
        return merge(acc, data);
      } catch (e) {
        logger.err("Error parsing JSON: %s", e)
      }
      return acc
    } else {
      logger.warn("%s is not a valid file.", fileName);
      return acc;
    }
  }, {});
  return JSON.stringify(mergedJson, undefined, 2);
}

export function mergeAndCopyJsonFiles(inFiles: string[], outFiles: string) {
  function action() {
    fileutils.writeFile(outFiles, mergeJsonFiles(...inFiles));
  }
  action();
  if (opts?.watch) {
    const watcher = fileutils.watch(...inFiles);
    watcher.on("add", action);
    watcher.on("change", action);
    watcher.on("unlink", action);
  }
}
