import { LogLevel } from "homebridge"

export default class MockLogging {
  prefix: string

  constructor(prefix = "") {
    this.prefix = prefix
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-empty-function */
  info(message: string, ...parameters: any[]): void {}
  warn(message: string, ...parameters: any[]): void {}
  error(message: string, ...parameters: any[]): void {}
  debug(message: string, ...parameters: any[]): void {}
  log(level: LogLevel, message: string, ...parameters: any[]): void {}
}
