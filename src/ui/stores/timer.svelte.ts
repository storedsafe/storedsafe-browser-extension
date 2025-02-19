/**
 * Track the current time at a given interval.
 * Alignment can be used to synchronize the updates to accurately update clocks.
 * @param interval Interval at which to update time.
 * @param alignTimeout Time until first interval is started.
 */
export class Timer {
  private intervalId: number | null = null;
  private timeoutId: number | null = null;

  private interval: number;
  private alignTimeout: number;

  now = $state(Date.now());

  constructor(interval: number, alignTimeout: number = 0) {
    this.interval = interval;
    this.alignTimeout = alignTimeout;
  }

  start() {
    this.stop();
    this.timeoutId = window.setTimeout(() => {
      // Start interval when aligned
      this.intervalId = window.setInterval(() => {
        this.now = Date.now();
      }, this.interval);
    }, this.alignTimeout);
  }

  stop() {
    if (this.intervalId) window.clearInterval(this.intervalId);
    if (this.timeoutId) window.clearTimeout(this.timeoutId);
    this.intervalId = null;
    this.timeoutId = null;
  }
}
