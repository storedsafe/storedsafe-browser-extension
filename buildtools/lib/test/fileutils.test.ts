import { fileURLToPath } from "node:url";
import * as path from "node:path";
import * as assert from "node:assert";
import * as fileutils from "../fileutils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fileDir = path.join(__dirname, "foo");
const filePath = path.join(fileDir, "/bar.txt");
const altFilePath = path.join(fileDir, "/zot.txt");
const fileText = "hello world";

if (fileutils.pathExists(fileDir)) {
  fileutils.deletePath(fileDir);
}

fileutils.createPath(filePath);
assert.deepEqual(fileutils.listFiles(fileDir), []);
fileutils.deletePath(fileDir);

fileutils.writeFile(filePath, fileText);
assert.equal(fileutils.readFile(filePath), fileText);
fileutils.copyFile(filePath, altFilePath);
assert.equal(fileutils.readFile(altFilePath), fileText);

assert.deepEqual(fileutils.listFiles(fileDir), ["bar.txt", "zot.txt"]);
fileutils.deletePath(filePath);
assert.deepEqual(fileutils.listFiles(fileDir), ["zot.txt"]);
fileutils.deletePath(fileDir);
