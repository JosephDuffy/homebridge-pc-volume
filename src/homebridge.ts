import { Service } from "hap-nodejs"

export interface Homebridge {
  hap: typeof import("hap-nodejs")
  log: Logger
  registerAccessory(
    pluginName: string,
    accessoryName: string,
    constructor: AccessoryConstructor
  ): void
}

export interface Logger {
  debug: (...message: string[]) => void
  info: (...message: string[]) => void
  warn: (...message: string[]) => void
  error: (...message: string[]) => void
}

export interface Accessory {
  getServices(): Service[]
}

export type AccessoryConstructor = new (log: Logger, config: any) => Accessory

export default Homebridge
