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
  private log: Logger

  constructor(log: Logger, config: Config) {
    this.log = log
    const name = config.name
    const services = config.services || [ConfigService.Lightbulb]
    const logarithmic = config.logarithmic || false

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
  }

  public getServices() {
    return [this.speakerService, this.lightService, this.fanService].filter(
      service => service !== undefined
    )
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
      ? Math.round(Math.log10(1 + homekitVolume) * 50)
      : homekitVolume

    this.log.debug(`Being requested to set volume to ${homekitVolume}%`)

    if (logarithmic) {
      this.log.debug(`Converted requested volume to ${volume}%`)
    }

    loudness
      .setVolume(volume)
      .then(() => {
        this.log.debug(`Set volume to ${volume}%`)
        callback()
      })
      .catch(error => {
        this.log.error(`Failed to set volume to ${volume}%: ${error}`)
      })
  }

  private getVolume(
    logarithmic: boolean,
    callback: (error: Error | null, muted: number | null) => void
  ) {
    this.log.debug(`Getting volume`)

    loudness
      .getVolume()
      .then(homekitVolume => {
        const volume = logarithmic
          ? Math.round(Math.pow(10, homekitVolume / 50) - 1)
          : homekitVolume
        this.log.debug(`Got volume: ${homekitVolume}%`)
        if (logarithmic) {
          this.log.debug(`Converted volume to: ${volume}%`)
        }
        callback(null, volume)
      })
      .catch(error => {
        this.log.debug(`Failed to get volume: ${error}`)
        callback(error, null)
      })
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
