import { auth } from '../global/api'
import { sessions } from '../global/storage'
import Extension from './Extension.svelte'

let extension: Extension

sessions
  .get()
  .then(currentSessions => {
    // Check validity of sessions before opening
    for (const [host, { token }] of currentSessions) {
      auth.check(host, token)
    }
  })
  .catch(console.error)
  .then(() => {
    extension = new Extension({
      target: document.body
    })
  })

export default extension
