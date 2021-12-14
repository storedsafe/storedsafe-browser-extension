import StoredSafe, { StoredSafeObject } from 'storedsafe';
import webext from 'web-ext'
import { readFile, writeFile } from 'fs';
import { homedir } from 'os';
import { config, exit } from 'process';
import * as path from 'path';
import * as readline from 'readline';

const PUBLISH_CONFIG_PATH = path.join(__dirname, 'publish.json');

interface PublishConfig {
  rc: string;
  firefox?: string;
  chrome?: string;
  edge?: string;
}

interface FirefoxConfig {
  issuer: string;
  secret: string;
}

const args = process.argv.slice(2).map(x => x.toLowerCase());
publish(args);

async function publish(args: string[] = []) {
  const dryRun: boolean = args.indexOf('--dry-run') !== -1;
  if (dryRun) {
    console.log("Dry run, no changes performed.")
    args.splice(args.indexOf('--dry-run'), 1);
  }
  const publishConfig = await get_config(args);
  let api: StoredSafe;
  try {
    api = await get_api(publishConfig.rc);
  } catch (err) {
    console.log(err)
    exit(1);
  }
  if (args.length === 0 || args.indexOf('firefox') !== -1) {
    const firefox_conf = await get_conf_object(api, publishConfig.firefox).then(parse_firefox_conf)
    console.log("Signing firefox addon...")
    if (!dryRun) sign_firefox(firefox_conf);
  }
  if (args.length === 0 || args.indexOf('chrome') !== -1) {
    console.log("Chrome publish not yet implemented.")
    // const chrome_conf = get_conf_object(api, publishConfig.chrome).then(parse_chrome_conf)
    // if (!dryRun) publish_chrome(chrome_conf);
  }
  if (args.length === 0 || args.indexOf('edge') !== -1) {
    console.log("Edge publish not yet implemented.")
    // const edge_conf = get_conf_object(api, publishConfig.edge).then(parse_edge_conf)
    // if (!dryRun) publish_edge(chrome_conf);
  }
  console.log("Done.")
}

async function get_api(rcPath: string): Promise<StoredSafe> {
  const conf = await read_file_promise(rcPath).then(parse_rc);
  return new StoredSafe({
    host: conf['mysite'],
    apikey: conf['apikey'],
    token: conf['token']
  });
}

/**
 * @param api API instance.
 * @param id StoredSafe Object ID to fetch.
 * @returns StoredSafe Object data.
 */
async function get_conf_object(api: StoredSafe, id: string): Promise<StoredSafeObject> {
  try {
    const res = await api.decryptObject(id)
    if (res.status === 200) {
      return res.data['OBJECT'][0]
    } else if (res.status === 403) {
      throw new Error("Must be logged into StoredSafe")
    }
    throw new Error(res.status.toString());
  } catch (err) {
    throw new Error(`Error fetching data for id: ${id} (${err?.status ?? err})`);
  }
}

/**
 * @param rcData Raw contents of StoredSafe rc file
 * @returns Javascript Object representation of StoredSafe rc file
 */
function parse_rc(rcData: string): object {
  return rcData
    .trim()
    .split('\n')
    .map<string[]>((x: string) => x.split(':'))
    .reduce((acc: object, x: string[]) => ({ ...acc, [x[0]]: x[1] }), {})
}

/**
 * Promisify fs.readFile.
 * @param path Path to file.
 * @returns Contents of file.
 */
async function read_file_promise(path): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(data?.toString());
    });
  });
}

async function read_stdin_promise(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
    })
  })
}

/**
 * @param data StoredSafe object data
 * @returns Firefox API credentials
 */
function parse_firefox_conf(data: StoredSafeObject): FirefoxConfig {
  return JSON.parse(data.crypted['note'])
}

/**
 * Sign extension for firefox using the webext API.
 * @param conf Credentials required for signing with the Firefox API.
 */
function sign_firefox(conf: FirefoxConfig) {
  webext.cmd.sign({
    sourceDir: path.join(__dirname, '/../dist/build/firefox/'),
    artifactsDir: path.join(__dirname + '/../dist/pkg/'),
    apiKey: conf.issuer,
    apiSecret: conf.secret,
    channel: 'unlisted',
  }).catch(console.error)
}

/**
 * Get the config for publishing the extension to the different browsers
 * or create it if it doesn't exist.
 * @param args Empty for all browsers or limited to browsers specified.
 * @returns {PublishConfig} Config object.
 */
async function get_config(args: string[] = []): Promise<PublishConfig> {
  // Set default rc file location
  let conf: PublishConfig = { rc: homedir() + '/.storedsafe-client.rc' };

  try {
    // Try to read the config from file
    conf = {
      ...conf,
      ...JSON.parse(await read_file_promise(PUBLISH_CONFIG_PATH))
    };
  } catch {
    // Set rc file path (empty for default)
    const question = `Location to rc file (${conf.rc}): `;
    conf.rc = await read_stdin_promise(question) || conf.rc;
  }
  // Set StoredSafe Object IDs where the configs for each browser can be obtained
  if ((args.length === 0 || args.indexOf('firefox') !== -1) && !conf.firefox) {
    const question = `StoredSafe Object ID for Firefox credentials: `;
    conf.firefox = await read_stdin_promise(question);
  }
  if ((args.length === 0 || args.indexOf('chrome') !== -1) && !conf.chrome) {
    const question = `StoredSafe Object ID for Chrome credentials: `;
    conf.chrome = await read_stdin_promise(question);
  }
  if ((args.length === 0 || args.indexOf('edge') !== -1) && !conf.edge) {
    const question = `StoredSafe Object ID for Edge credentials: `;
    conf.edge = await read_stdin_promise(question);
  }

  // Write the new config file
  writeFile(PUBLISH_CONFIG_PATH, JSON.stringify(conf, null, 2), (err) => {
    if (err) {
      console.log(err);
      exit(1);
    }
  })
  return conf;
}