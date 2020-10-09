import { Readable, readable } from 'svelte/store'

/**
 * Track the current time at a given interval.
 * Alignment can be used to synchronize the updates to accurately update clocks.
 * @param interval Interval at which to update time.
 * @param alignTimeout Time until first interval is started.
 */
export function time (interval: number, alignTimeout: number = 0): Readable<number> {
  return readable(Date.now(), function start (set) {
    let intervalId: number = null
    let timeoutId = setTimeout(function initialize () {
      // Set state at alignment point
      set(Date.now())
      timeoutId = null

      // Start interval when aligned
      intervalId = setInterval(function setTime () {
        set(Date.now())
      }, interval)
    }, alignTimeout)

    return function stop () {
      if (!!timeoutId) clearTimeout(timeoutId)
      if (!!intervalId) clearInterval(intervalId)
    }
  })
}
