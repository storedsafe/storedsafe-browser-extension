import webext from 'web-ext'
import { issuer, secret } from './keys/firefox-keys.json'

webext.cmd.sign({
  sourceDir: './dist/build/firefox/',
  artifactsDir: './dist/pkg/',
  apiKey: issuer,
  apiSecret: secret,
  channel: 'unlisted',
}).catch(console.error)