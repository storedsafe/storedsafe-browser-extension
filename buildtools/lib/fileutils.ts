import * as fs from "fs";
import * as path from "path";
import * as chokidar from "chokidar";
import archiver from "archiver";
import { Logger } from "./logger";

const logger = new Logger("fileutils");
const opts = global.buildtools?.opts ?? {};

export class ReadFileError extends Error {}
export class NoSuchFileError extends Error {}

export function copyFile(from: string, to: string) {
  if (!fs.existsSync(from)) {
    throw new ReadFileError(`Source file doesn't exist: ${from}`);
  }
  createPath(to);
  try {
    fs.copyFileSync(from, to);
    logger.log("Copied %s -> %s", from, to);
  } catch (err) {
    throw new ReadFileError(`Unable to copy file. ${err}`);
  }
}

export function writeFile(filePath: string, data: string) {
  createPath(filePath);
  try {
    fs.writeFileSync(filePath, data);
    logger.log("Wrote data to: %s", filePath);
  } catch (err) {
    throw new ReadFileError(`Unable to write file. err`);
  }
}

export function readFile(filePath: string) {
  if (!pathExists(filePath)) {
    throw new NoSuchFileError(`Path doesn't exist: ${filePath}`);
  }
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    throw new ReadFileError(`Unable to read file ${err}`);
  }
}

export function deletePath(filePath: string) {
  if (!pathExists(filePath)) {
    throw new NoSuchFileError(`Path doesn't exist ${filePath}`);
  }
  try {
    fs.rmSync(filePath, { recursive: true, force: true });
    logger.log("Deleted path: %s", filePath);
  } catch (err) {
    throw new ReadFileError(`Unable to delete path ${err}`);
  }
}

export function listFiles(filePath: string) {
  if (!pathExists(filePath)) {
    throw new NoSuchFileError(`Path doesn't exist: ${filePath}`);
  }
  try {
    return fs.readdirSync(filePath);
  } catch (err) {
    throw new ReadFileError(`Unable to read file ${err}`);
  }
}

export function createPath(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    try {
      fs.mkdirSync(dirname, { recursive: true });
      logger.log("Created directory: %s", dirname);
    } catch (err) {
      throw new ReadFileError(`Unable to create directory ${err}`);
    }
  }
}

export function pathExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  return true;
}

export function stat(entryPath: string) {
  if (pathExists(entryPath)) return fs.statSync(entryPath);
}

export function isDir(dirPath: string) {
  return stat(dirPath)?.isDirectory() || false;
}

export function isFile(filePath: string) {
  return stat(filePath)?.isFile() || false;
}

export function watch(...files: string[]) {
  return chokidar.watch(files, {
    ignoreInitial: true,
  });
}

export function copy(sources: string[], outPath: string) {
  /**
   * Get a list of all files under the `basePath` directory.
   * The `basePath` will be excluded from the returned result so the returned
   * paths can be inserted with their relevant subdirectories relative to another
   * output path when they're copied.
   * @param {string} basePath Root path for search, will be excluded from returned list.
   * @param {string} relPath Relative path for recursion, will be included in returned list.
   * @returns List of files relative to basePath.
   */
  function getFiles(basePath: string, relPath: string = ""): string[] {
    let entries = listFiles(path.join(basePath, relPath));
    let files = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = path.join(relPath, entries[i]);
      const entryPath = path.join(basePath, entry);
      if (isDir(entryPath)) {
        files.push(...getFiles(basePath, entry));
      } else {
        files.push(entry);
      }
    }
    return files;
  }

  // Copy files
  sources.forEach((source) => {
    const sourceDir = isDir(source) ? source : path.dirname(source);
    const files = isDir(source) ? getFiles(source) : [path.basename(source)];
    files.forEach((file) => {
      const from = path.join(sourceDir, file);
      const to = path.join(outPath, file);
      copyFile(from, to);
      if (opts?.watch) {
        const watcher = watch(from);
        watcher.on("add", () => {
          try {
            copyFile(from, to);
          } catch (e) {
            logger.err(`Failed to copy file: ${e}`);
          }
        });
        watcher.on("change", () => {
          try {
            copyFile(from, to);
          } catch (e) {
            logger.err(`Failed to copy file: ${e}`);
          }
        });
        watcher.on("unlink", () => {
          try {
            deletePath(to);
          } catch (e) {
            logger.err(`Failed to delete file: ${e}`);
          }
        });
      }
    });
  });
}

export function zipDir(source: string, dest: string) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(dest);

  return new Promise<void>((resolve, reject) => {
    archive.directory(source, false);
    archive.on("error", reject);
    archive.pipe(stream);

    stream.on("close", resolve);
    archive.finalize();
  });
}

export default {
  copyFile,
  writeFile,
  readFile,
  deletePath,
  listFiles,
  createPath,
  pathExists,
  stat,
  isDir,
  isFile,
  watch,
  copy,
  zipDir,
};
