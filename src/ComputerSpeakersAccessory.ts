// hap-nodejs is used for the types, but the instances
// provided by homebridge are used to ensure compatibility
import {
  Characteristic as HAPCharacteristic,
  Service as HAPService,
} from "hap-nodejs"
import loudness = require("loudness")
import Config, { Service as ConfigService, VolumeAlgorithm } from "./config"
import { Accessory, Logger } from "./homebridge"
import ServiceWrapper from "./ServiceWrapper"

export default class ComputerSpeakersAccessory implements Accessory {
  private speakerService?: ServiceWrapper
  private fanService?: ServiceWrapper
  private lightService?: ServiceWrapper

  constructor(
    Service: typeof HAPService,
    Characteristic: typeof HAPCharacteristic,
    log: Logger,
    config: Config
  ) {
    const name = config.name
    const services = config.services || [ConfigService.Lightbulb]
    const logarithmic = config.logarithmic || false
    const volumeAlgorithm = logarithmic
      ? VolumeAlgorithm.Logarithmic
      : VolumeAlgorithm.Linear

    if (services.indexOf(ConfigService.Speaker) > -1) {
      log.debug("Creating speaker service")

      this.speakerService = new ServiceWrapper(
        new Service.Speaker(name, ConfigService.Speaker),
        loudness,
        log
      )

      this.speakerService.bindCharacteristicToMuted(Characteristic.Mute)
      this.speakerService.bindCharacteristicToVolume(
        Characteristic.Volume,
        volumeAlgorithm
      )
    }

    if (services.indexOf(ConfigService.Fan) > -1) {
      log.debug("Creating fan service")

      this.fanService = new ServiceWrapper(
        new Service.Fan(name, ConfigService.Fan),
        loudness,
        log
      )

      this.fanService.bindCharacteristicToMuted(Characteristic.On, true)
      this.fanService.bindCharacteristicToVolume(
        Characteristic.RotationSpeed,
        volumeAlgorithm
      )
    }

    if (services.indexOf(ConfigService.Lightbulb) > -1) {
      log.debug("Creating lightbulb service")

      this.lightService = new ServiceWrapper(
        new Service.Lightbulb(name, ConfigService.Lightbulb),
        loudness,
        log
      )

      this.lightService.bindCharacteristicToMuted(Characteristic.On, true)
      this.lightService.bindCharacteristicToVolume(
        Characteristic.Brightness,
        volumeAlgorithm
      )
    }
  }

  public getServices() {
    return [this.speakerService, this.lightService, this.fanService]
      .filter((wrapper) => wrapper !== undefined)
      .map((wrapper) => wrapper.service)
  }
}
