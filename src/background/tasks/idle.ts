import { settings } from '../../global/storage'

/**
 * Track idle state.
 * @param cb Callback for when idle state is reached.
 * @returns Cleanup function to stop subscriptions.
 */
export function idle (cb: (state: browser.idle.IdleState) => void): () => void {
  /**
   * Wrap the callback function for logging.
   */
  function onIdle(state: browser.idle.IdleState) {
    cb(state)
    console.debug(`Idle state changed to ${state}`)
  }

  /**
   * Set the detection interval and assign the idle listener.
   * Will unset the listener if `intervalSeconds` is 0 or less.
   * @param intervalSeconds Number of seconds of inactivity to trigger idle state.
   */
  function setDetectionInterval (intervalSeconds: number) {
    if (intervalSeconds > 0) {
      console.debug(`Idle interval set to ${intervalSeconds}s (${Math.floor(intervalSeconds / 60)}m)`)
      browser.idle.setDetectionInterval(intervalSeconds)
      if (!browser.idle.onStateChanged.hasListener(onIdle)) {
        browser.idle.onStateChanged.addListener(onIdle)
      }
    } else {
      console.debug('Removing idle state listener')
      browser.idle.onStateChanged.removeListener(onIdle)
    }
  }

  /**
   * Update the detection interval if the settings change.
   * @param settings New settings object.
   */
  function onSettingsChanged (settings: Map<string, Setting>): void {
    if (settings.has('idleMax')) {
      const idleMax = (settings.get('idleMax').value as number) ?? -1
      setDetectionInterval(idleMax * 60)
    }
  }

  // Set up listener for changes to settings
  settings
    .subscribe(onSettingsChanged)
    .then(settings => {
      // Set initial detection interval
      onSettingsChanged(settings)
    })
    .catch(console.error)

  // Cleanup
  return function stop () {
    settings.unsubscribe(onSettingsChanged)
    browser.idle.onStateChanged.removeListener(onIdle)
  }
}
