import { deletePath, NoSuchFileError } from "./fileutils";
import { Logger } from "./logger";

const logger = new Logger("clean");
const opts = global.buildtools?.opts ?? {};

export function rm(path: string) {
  try {
    deletePath(path);
    logger.log(`Deleted path: ${path}`);
  } catch (e) {
    if (e instanceof NoSuchFileError) {
      logger.err(`Path doesn't exist: ${path}`);
    } else {
      logger.err(`Failed to delete path: ${path}`);
    }
  }
}
