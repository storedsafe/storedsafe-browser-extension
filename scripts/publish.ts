import StoredSafe, { StoredSafeObject } from 'storedsafe';
import publishConfig from './publish.json';
import { homedir } from 'os';
import { readFile } from 'fs';
import webext from 'web-ext'
import { exit } from 'process';

interface FirefoxConfig {
  issuer: string;
  secret: string;
}

const args = process.argv.slice(2).map(x => x.toLowerCase());
publish(args);

async function publish(args: string[] = []) {
  let api: StoredSafe;
  try {
    api = await get_api();
  } catch (err) {
    console.log(err)
    exit(1);
  }
  if (args.length === 0 || args.indexOf('firefox') !== -1) {
    const firefox_conf = await get_conf_object(api, publishConfig.firefox).then(parse_firefox_conf)
    console.log("Signing firefox addon...")
    sign_firefox(firefox_conf);
  }
  if (args.length === 0 || args.indexOf('chrome') !== -1) {
    console.log("Chrome publish not yet implemented.")
    // const chrome_conf = get_conf_object(api, publishConfig.chrome).then(parse_chrome_conf)
    // publish_chrome(chrome_conf);
  }
  if (args.length === 0 || args.indexOf('edge') !== -1) {
    console.log("Edge publish not yet implemented.")
    // const edge_conf = get_conf_object(api, publishConfig.edge).then(parse_edge_conf)
    // publish_edge(chrome_conf);
  }
  console.log("Done.")
}

async function get_api(): Promise<StoredSafe> {
  const home = homedir();
  const rcPath = publishConfig.rc ?? home + '/.storedsafe-client.rc';
  const conf = await read_file_promise(rcPath).then(parse_rc);
  return new StoredSafe({
    host: conf['mysite'],
    apikey: conf['apikey'],
    token: conf['token']
  });
}

async function get_conf_object(api: StoredSafe, id: string): Promise<StoredSafeObject> {
  try {
    const res = await api.decryptObject(publishConfig.firefox)
    if (res.status === 200) {
      return res.data['OBJECT'][0]
    }
    throw new Error(res.status.toString());
  } catch (err) {
    throw new Error(`Error fetching data for id: ${id} (${err?.status ?? err})`);
  }
}

function parse_rc(rc: string): object {
  return rc
    .trim()
    .split('\n')
    .map<string[]>((x: string) => x.split(':'))
    .reduce((acc: object, x: string[]) => ({ ...acc, [x[0]]: x[1] }), {})
}

async function read_file_promise(path): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(data.toString());
    });
  });
}

function parse_firefox_conf(data: StoredSafeObject): FirefoxConfig {
  return JSON.parse(data.crypted['note'])
}

function sign_firefox(conf: FirefoxConfig) {
  webext.cmd.sign({
    sourceDir: __dirname + '/../dist/build/firefox/',
    artifactsDir: __dirname + '/../dist/pkg/',
    apiKey: conf.issuer,
    apiSecret: conf.secret,
    channel: 'unlisted',
  }).catch(console.error)
}
