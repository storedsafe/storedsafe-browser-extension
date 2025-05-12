import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '../dist/pkg');

function getVersion(file: string) {
  const match = file.match(/(\d+)\.(\d+)\.(\d+)/);
  const major = match?.[1]
  const minor = match?.[2]
  const patch = match?.[3]
  if (major && minor && patch) {
    return [match[1], match[2], match[3]].map(Number);
  }
  throw new Error(`File is missing a valid version number: ${file}`)
}

function compareVersion(file1, file2) {
  const ver1 = getVersion(file1);
  const ver2 = getVersion(file2);
  for (let i = 0; i < 3; i++) {
    if (ver1[i] != ver2[i]) return ver1[i] - ver2[i];
  }
  return 0;
}

interface Update {
  version: string
  update_link: string
}
const updates: Update[] = []

fs.readdir(pkgPath, (err, files) => {
  if (err) {
    return process.stderr.write("Error reading directory: " + err + "\n");
  }
  files.sort(compareVersion).forEach((file) => {
    updates.push({
      version: getVersion(file).join('.'),
      update_link: `https://storedsafe.com/addons/firefox/pkg/${file}`
    });
  });
  writeUpdates(updates);
})

function writeUpdates(data) {
  const outData = JSON.stringify({
    addons: {
      "{5a110dee-fb42-44a1-b64d-d0444a199f96}": {
        updates
      }
    }
  }, null, 2)

  fs.writeFile(path.join(process.argv[2] ?? __dirname, 'updates.json'), outData, (err) => {
    if (err) {
      return process.stderr.write("Error writing file: " + err + "\n");
    }
    process.stderr.write("Wrote to updates.json successfully:\n");
    console.log(outData);
  });
}
