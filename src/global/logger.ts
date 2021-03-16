import { getMessage, LocalizedMessage } from "./i18n"

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  LOG = 4,
  DEBUG = 5,
  ALL = 6
}

export class Logger {
  public static level: LogLevel = LogLevel.ERROR
  private readonly prefix: string

  public static async Init(): Promise<void> {
    const level = await browser.storage.local.get('loglevel').then(({ loglevel }) => loglevel)
    if (level !== undefined) Logger.SetLogLevel(level)

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && !!changes['loglevel']) {
        const { newValue: logLevel } = changes['loglevel']
        if (logLevel !== undefined) Logger.SetLogLevel(logLevel)
      }
    })
  }

  private static SetLogLevel(level: LogLevel) {
    if (level in LogLevel) {
      Logger.level = level
    } else {
      Logger.level = LogLevel.ERROR
    }
  }

  public constructor (name: string, readonly enabled = true) {
    this.shouldPrint = this.shouldPrint.bind(this)
    this.group = this.group.bind(this)
    this.error = this.error.bind(this)
    this.warn = this.warn.bind(this)
    this.info = this.info.bind(this)
    this.log = this.log.bind(this)
    this.debug = this.debug.bind(this)

    this.prefix = `[${getMessage(LocalizedMessage.EXTENSION_NAME)}][${name}]: `
  }

  private shouldPrint(level: LogLevel): boolean {
    return this.enabled && Logger.level >= level
  }

  public group (name: string, level: LogLevel, collapsed = true) {
    const text = this.prefix + name + ' (...)'
    if (this.shouldPrint(level)) {
      if (collapsed)  console.groupCollapsed(text)
      else console.group(text)
    }
  }

  public groupEnd (level: LogLevel) {
    if (this.shouldPrint(level)) {
      console.groupEnd()
    }
  }

  public error (msg: any, ...params: any[]) {
    if (this.shouldPrint(LogLevel.ERROR)) {
      console.error(this.prefix + msg, ...params)
    }
  }

  public warn (msg: any, ...params: any[]) {
    if (this.shouldPrint(LogLevel.WARN)) {
      console.warn(this.prefix + msg, ...params)
    }
  }

  public info (msg: any, ...params: any[]) {
    if (this.shouldPrint(LogLevel.INFO)) {
      console.info(this.prefix + msg, ...params)
    }
  }

  public log (msg: any, ...params: any[]) {
    if (this.shouldPrint(LogLevel.LOG)) {
      console.log(this.prefix + msg, ...params)
    }
  }

  public debug (msg: any, ...params: any[]) {
    if (this.shouldPrint(LogLevel.DEBUG)) {
      console.debug(this.prefix + msg, ...params)
    }
  }
}
