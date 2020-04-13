"use strict"

// hap-nodejs is used for the types, but the instances
// provided by homebridge are used to ensure compatibility
import {
  Characteristic as HAPCharacteristic,
  CharacteristicEventTypes,
  Service as HAPService,
  uuid as HAPuuid,
} from "hap-nodejs"
import loudness = require("loudness")
import Config, { Service as ConfigService } from "./config"
import Homebridge, { Accessory, Logger } from "./homebridge"
let Service: typeof HAPService
let Characteristic: typeof HAPCharacteristic
let UUIDGen: typeof HAPuuid

export default function(homebridge: Homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerAccessory(
    "homebridge-pc-volume",
    "ComputerSpeakers",
    ComputerSpeakers
  )
}

class ComputerSpeakers implements Accessory {
  private speakerService: HAPService | undefined
  private fanService: HAPService | undefined
  private lightService: HAPService | undefined
  private increaseVolumeSwitch: HAPService | undefined
  private decreaseVolumeSwitch: HAPService | undefined
  private log: Logger
  private cached: boolean
  private currentVolume: number

  constructor(log: Logger, config: Config) {
    this.log = log
    const name = config.name
    const services = config.services || [ConfigService.Lightbulb]
    const initialVolume = config.initialVolume || null
    const initiallyMuted = config.initiallyMuted || null
    const logarithmic = config.logarithmic || false
    const delta = config.delta || undefined
    const delay = config.delay || 200
    this.cached = logarithmic && (config.cached || false)
    this.currentVolume = 0

    if (services.indexOf(ConfigService.Speaker) > -1) {
      log.debug("Creating speaker service")

      this.speakerService = new Service.Speaker(name, ConfigService.Speaker)

      this.speakerService
        .getCharacteristic(Characteristic.Mute)
        .on(CharacteristicEventTypes.SET, this.setMuted.bind(this))
        .on(CharacteristicEventTypes.GET, this.getMuted.bind(this))

      this.speakerService
        .addCharacteristic(Characteristic.Volume)
        .on(
          CharacteristicEventTypes.SET,
          this.setVolume.bind(this, logarithmic)
        )
        .on(
          CharacteristicEventTypes.GET,
          this.getVolume.bind(this, logarithmic)
        )
    }

    if (services.indexOf(ConfigService.Fan) > -1) {
      log.debug("Creating fan service")

      this.fanService = new Service.Fan(name, ConfigService.Fan)

      this.fanService
        .getCharacteristic(Characteristic.On)
        .on(CharacteristicEventTypes.SET, this.setPowerState.bind(this))
        .on(CharacteristicEventTypes.GET, this.getPowerState.bind(this))

      this.fanService
        .addCharacteristic(Characteristic.RotationSpeed)
        .on(
          CharacteristicEventTypes.SET,
          this.setVolume.bind(this, logarithmic)
        )
        .on(
          CharacteristicEventTypes.GET,
          this.getVolume.bind(this, logarithmic)
        )
    }

    if (services.indexOf(ConfigService.Lightbulb) > -1) {
      log.debug("Creating lightbulb service")

      this.lightService = new Service.Lightbulb(name, ConfigService.Lightbulb)

      this.lightService
        .getCharacteristic(Characteristic.On)
        .on(CharacteristicEventTypes.SET, this.setPowerState.bind(this))
        .on(CharacteristicEventTypes.GET, this.getPowerState.bind(this))

      this.lightService
        .addCharacteristic(Characteristic.Brightness)
        .on(
          CharacteristicEventTypes.SET,
          this.setVolume.bind(this, logarithmic)
        )
        .on(
          CharacteristicEventTypes.GET,
          this.getVolume.bind(this, logarithmic)
        )
    }

    if (!!delta) {
      log.debug("Creating stateless switches for increasing and decreasing volume")

      this.increaseVolumeSwitch = new Service.Switch(name + " +" + delta + "%", ConfigService.IncreaseVolumeButton)
      
      this.increaseVolumeSwitch
        .getCharacteristic(Characteristic.On)
        .on(
          CharacteristicEventTypes.SET,
          this.adjustVolume.bind(this, logarithmic, delta, delay)
        )
        .on(
          CharacteristicEventTypes.GET,
          this.showAlwaysOff.bind(this)
        )
      
      this.decreaseVolumeSwitch = new Service.Switch(name + " -" + delta + "%", ConfigService.DecreaseVolumeButton)
      
      this.decreaseVolumeSwitch
        .getCharacteristic(Characteristic.On)
        .on(
          CharacteristicEventTypes.SET,
          this.adjustVolume.bind(this, logarithmic, -delta, delay)
        )
        .on(
          CharacteristicEventTypes.GET,
          this.showAlwaysOff.bind(this)
        )
    }

    if (initialVolume != null) {
      log.debug("Setting initial volume")
      this.setVolume(logarithmic, initialVolume, () => { /* do nothing */ })
    } else if (this.cached) {
      log.debug("Using cached volume without initial value and thus reading current system volume")
      loudness.getVolume().then((homekitVolume) => {
        this.currentVolume = homekitVolume
      })
    }
    if (initiallyMuted != null) {
      log.debug("Setting initial mute status")
      this.setMuted(initiallyMuted, () => { /* do nothing */ })
    }

    setTimeout(function() {
      this.getVolume(logarithmic, (error: Error | null, homekitVolume: number | null) => {
        if (!!error) {
          this.log.error(`Failed to set volume: ${error}`)
        } else {
          log.debug("Updating volume in all services")
          if (!!this.fanService) {
            this.fanService.getCharacteristic(Characteristic.RotationSpeed).updateValue(homekitVolume)
          }
          if (!!this.lightService) {
            this.lightService.getCharacteristic(Characteristic.Brightness).updateValue(homekitVolume)
          }
        }
      })
      this.getMuted((error: Error | null, muted: boolean | null) => {
        if (!!error) {
          this.log.error(`Failed to set muted status: ${error}`)
        } else {
          log.debug("Updating mute status in all services")
          if (!!this.fanService) {
            this.fanService.getCharacteristic(Characteristic.On).updateValue(muted)
          }
          if (!!this.lightService) {
            this.lightService.getCharacteristic(Characteristic.On).updateValue(muted)
          }
        }
      })
    }.bind(this), 1000)
  }

  public getServices() {
    return [this.speakerService, this.lightService, this.fanService, this.increaseVolumeSwitch, this.decreaseVolumeSwitch].filter(
      service => service !== undefined
    )
  }

  private getSystemVolume() {
    if (this.cached) {
      return Promise.resolve(this.currentVolume)
    } else {
      return loudness.getVolume()
    }
  }

  private setSystemVolume(volume: number) {
    if (this.cached) {
      this.currentVolume = volume
    }
    return loudness.setVolume(Math.round(volume))
  }

  // Speaker

  private setMuted(muted: boolean, callback: () => void) {
    this.log.debug(`Setting muted status to ${muted}%`)

    loudness
      .setMuted(muted)
      .then(() => {
        this.log.debug(`Set muted status to ${muted}%`)
        callback()
      })
      .catch(error => {
        this.log.error(`Failed to set muted status to ${muted}%: ${error}`)
      })
  }

  private getMuted(
    callback: (error: Error | null, muted: boolean | null) => void
  ) {
    this.log.debug(`Getting muted status`)

    loudness
      .getMuted()
      .then(muted => {
        this.log.debug(`Got muted status: ${muted}%`)
        callback(null, muted)
      })
      .catch(error => {
        this.log.debug(`Failed to get muted status: ${error}`)
        callback(error, null)
      })
  }

  private setVolume(
    logarithmic: boolean,
    homekitVolume: number,
    callback: () => void
  ) {
    const volume = logarithmic
      ? Math.log10(1 + homekitVolume) * (100 / Math.log10(101))
      : homekitVolume

    this.log.debug(`Being requested to set volume to ${homekitVolume}%`)
    
    if (logarithmic) {
      this.log.debug(`Converted requested volume to ${volume}%`)
    }
    
    this.setSystemVolume(volume)
      .then(() => {
        this.log.debug(`Set volume to ${volume}%`)
        callback()
      })
      .catch((error) => {
        this.log.error(`Failed to set volume to ${volume}%: ${error}`)
      })
  }

  private getVolume(
    logarithmic: boolean,
    callback: (error: Error | null, homekitVolume: number | null) => void
  ) {
    this.log.debug(`Getting volume`)

    this.getSystemVolume()
      .then((homekitVolume) => {
        const volume = logarithmic
          ? Math.round(Math.pow(10, homekitVolume / (100 / Math.log10(101))) - 1)
          : homekitVolume
        this.log.debug(`Got volume: ${homekitVolume}%`)
        if (logarithmic) {
          this.log.debug(`Converted volume to: ${volume}%`)
        }
        callback(null, volume)
      })
      .catch((error) => {
        this.log.debug(`Failed to get volume: ${error}`)
        callback(error, null)
      })
  }

  private adjustVolume(
    logarithmic: boolean,
    delta: number,
    delay: number,
    on: boolean,
    callback: () => void
  ) {
    if (on) {
      this.log.debug(`Adjusting volume`)

      this.getSystemVolume()
        .then((homekitVolume) => {
          let volume = logarithmic
            ? Math.pow(10, homekitVolume / (100 / Math.log10(101))) - 1
            : homekitVolume
          this.log.debug(`Got current volume: ${homekitVolume}%`)
          if (logarithmic) {
            this.log.debug(`Converted current volume to: ${volume}%`)
          }
          volume = volume + delta
          volume = Math.max(0, Math.min(100, volume))
          this.log.debug(`Calculated adjusted volume: ${volume}%`)
          if (!!this.fanService) {
            this.fanService.getCharacteristic(Characteristic.RotationSpeed).updateValue(Math.round(volume))
          }
          if (!!this.lightService) {
            this.lightService.getCharacteristic(Characteristic.Brightness).updateValue(Math.round(volume))
          }
          volume = logarithmic
            ? Math.log10(1 + volume) * (100 / Math.log10(101))
            : volume
          if (!this.cached && volume === homekitVolume) {
            if (volume < 100 && delta > 0) { volume++ }
            else if (volume > 0 && delta < 0) { volume-- }
          }
          volume = Math.max(0, Math.min(100, volume))
          if (logarithmic) {
            this.log.debug(`Converted adjusted volume to: ${volume}%`)
          }
          this.log.debug(`Being requested to set volume to ${volume}%`)
          return this.setSystemVolume(volume)
        })
        .then(() => {
          this.log.debug(`Successfully adjusted volume`)
          callback()
          setTimeout(function() {
            this.increaseVolumeSwitch.getCharacteristic(Characteristic.On).updateValue(false)
            this.decreaseVolumeSwitch.getCharacteristic(Characteristic.On).updateValue(false)
            this.log.debug(`Set state of each switch to off`)
          }.bind(this), delay)
        })
        .catch((error) => {
          this.log.debug(`Failed to adjust volume: ${error}`)
          callback()
        })
    } else {
      callback()
    }
  }

  private showAlwaysOff(callback: (error: Error | null, state: boolean | null) => void) {
    callback(null, false)
  }

  private setPowerState(powerState: boolean, callback: () => void) {
    const muted = !powerState
    this.setMuted(muted, callback)
  }

  private getPowerState(
    callback: (error: Error | null, muted: boolean | null) => void
  ) {
    this.getMuted((error, muted) => {
      if (error !== null) {
        callback(error, null)
      } else {
        callback(null, !muted)
      }
    })
  }
}
