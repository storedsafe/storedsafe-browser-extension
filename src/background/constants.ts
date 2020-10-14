const ALARM_SEP = '::'
export const ALARM_KEEP_ALIVE = 'keepalive'
export const ALARM_HARD_TIMEOUT = 'hard-timeout'

export function genAlarmName (...parts: string[]): string {
  return parts.join(ALARM_SEP)
}

export function splitAlarmName (name: string): string[] {
  return name.split(ALARM_SEP)
}
