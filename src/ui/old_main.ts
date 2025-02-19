import { auth } from '../global/api'
import { Logger } from '../global/logger'
import { sessions } from '../global/storage'
import Extension from './Extension.svelte'

let extension: Extension

Logger.Init().then(() => {
  const logger = new Logger('main')

  sessions
    .get()
    .then(currentSessions => {
      // Check validity of sessions before opening
      for (const [host, { token }] of currentSessions) {
        auth.check(host, token)
        logger.debug(`Checking token validity for ${host}`)
      }
    })
    .catch(logger.error)
    .then(() => {
      logger.debug("Opening extension window...")
      extension = new Extension({
        target: document.body
      })
    })
})

export default extension