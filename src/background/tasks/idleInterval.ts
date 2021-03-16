import { Logger } from '../../global/logger'
import { settings } from '../../global/storage'

const logger = new Logger('idleinterval')

/**
 * Set time to idle to match user settings.
 * @returns Cleanup function to stop subscriptions.
 */
export function idleInterval (): () => void {
  /**
   * Update the detection interval if the settings change.
   * @param settings New settings object.
   */
  function onSettingsChanged (settings: Map<string, Setting>): void {
    if (settings.has('idleMax')) {
      const idleMax = (settings.get('idleMax').value as number) ?? -1
      logger.info(`Updated idle interval to ${idleMax} minutes`)
      browser.idle.setDetectionInterval(idleMax * 60)
    }
  }

  // Set up listener for changes to settings
  settings
    .subscribe(onSettingsChanged)
    .then(settings => {
      // Set initial detection interval
      onSettingsChanged(settings)
    })
    .catch(logger.error)

  // Cleanup
  return function stop () {
    settings.unsubscribe(onSettingsChanged)
  }
}
