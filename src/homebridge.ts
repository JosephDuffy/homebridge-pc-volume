import "hap-nodejs"

export interface Homebridge {
  hap: HAPNodeJS.HAPNodeJS
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
  getServices(): HAPNodeJS.Service[]
}

export interface AccessoryConstructor {
  new (log: Logger, config: any): Accessory
}

export default Homebridge
