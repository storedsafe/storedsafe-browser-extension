import { auth } from '../global/api'
import { Logger } from '../global/logger'
import { sessions } from '../global/storage'
import Extension from './Extension.svelte'

const logger = new Logger('main')

let extension: Extension

sessions
  .get()
  .then(currentSessions => {
    // Check validity of sessions before opening
    for (const [host, { token }] of currentSessions) {
      auth.check(host, token)
    }
  })
  .catch(logger.error)
  .then(() => {
    extension = new Extension({
      target: document.body
    })
  })

export default extension
