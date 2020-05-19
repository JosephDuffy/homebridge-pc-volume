import { LogLevel } from "homebridge"

export default class MockLogging {
  prefix: string

  constructor(prefix: string = "") {
    this.prefix = prefix
  }

  info(message: string, ...parameters: any[]) {}
  warn(message: string, ...parameters: any[]) {}
  error(message: string, ...parameters: any[]) {}
  debug(message: string, ...parameters: any[]) {}
  log(level: LogLevel, message: string, ...parameters: any[]) {}
}
