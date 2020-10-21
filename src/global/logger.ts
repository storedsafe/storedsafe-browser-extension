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

const isProduction = false

export class Logger {
  public static level: LogLevel = isProduction ? LogLevel.ERROR : LogLevel.ALL
  private readonly prefix: string

  public constructor (name: string) {
    this.group = this.group.bind(this)
    this.error = this.error.bind(this)
    this.warn = this.warn.bind(this)
    this.info = this.info.bind(this)
    this.log = this.log.bind(this)
    this.debug = this.debug.bind(this)

    this.prefix = `[${getMessage(LocalizedMessage.EXTENSION_NAME)}][${name}]: `
  }

  public group (name: string, level: LogLevel) {
    if (Logger.level >= level) {
      console.group(this.prefix + name)
    }
  }

  public groupEnd (level: LogLevel) {
    if (Logger.level >= level) {
      console.groupEnd()
    }
  }

  public error (msg: any, ...params: any[]) {
    if (Logger.level >= LogLevel.ERROR) {
      console.error(this.prefix + msg, ...params)
    }
  }

  public warn (msg: any, ...params: any[]) {
    if (Logger.level >= LogLevel.WARN) {
      console.warn(this.prefix + msg, ...params)
    }
  }

  public info (msg: any, ...params: any[]) {
    if (Logger.level >= LogLevel.INFO) {
      console.info(this.prefix + msg, ...params)
    }
  }

  public log (msg: any, ...params: any[]) {
    if (Logger.level >= LogLevel.LOG) {
      console.log(this.prefix + msg, ...params)
    }
  }

  public debug (msg: any, ...params: any[]) {
    if (Logger.level >= LogLevel.DEBUG) {
      console.debug(this.prefix + msg, ...params)
    }
  }
}
