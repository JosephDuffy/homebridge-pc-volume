// hap-nodejs is used for the types, but the instances
// provided by homebridge are used to ensure compatibility
import {
  Characteristic as HAPCharacteristic,
  Service as HAPService,
} from "hap-nodejs"
import loudness from "loudness"
import Config, { Service as ConfigService, VolumeAlgorithm } from "./config"
import { Accessory, Logger } from "./homebridge"
import ServiceWrapper from "./ServiceWrapper"
import ComputerSpeakers from "./ComputerSpeakers"

export default class ComputerSpeakersAccessory implements Accessory {
  private computerSpeakers: ComputerSpeakers
  private speakerService?: ServiceWrapper
  private fanService?: ServiceWrapper
  private lightService?: ServiceWrapper
  private volumeUpButtonService?: ServiceWrapper
  private volumeDownService?: ServiceWrapper

  constructor(
    Service: typeof HAPService,
    Characteristic: typeof HAPCharacteristic,
    log: Logger,
    config: Config
  ) {
    this.computerSpeakers = new ComputerSpeakers(log, loudness)
    const name = config.name
    const services = config.services || [ConfigService.Lightbulb]
    const logarithmic = config.logarithmic || false
    const switchVolumeDelta = config.switchVolumeDelta || 5
    const volumeAlgorithm = logarithmic
      ? VolumeAlgorithm.Logarithmic
      : VolumeAlgorithm.Linear

    if (services.indexOf(ConfigService.Speaker) > -1) {
      log.debug("Creating speaker service")

      this.speakerService = new ServiceWrapper(
        new Service.Speaker(name, ConfigService.Speaker)
      )

      this.speakerService.bindBooleanCharacteristic(
        Characteristic.Mute,
        async () => {
          const isMuted = await this.computerSpeakers.getMuted()
          log.debug(
            `Flipping characteristic value before setting muted status to ${!isMuted}`
          )
          return !isMuted
        },
        (newValue: boolean, callback: () => void) => {
          this.computerSpeakers.setMuted(newValue).finally(callback)
        }
      )
      this.speakerService.bindNumberCharacteristic(
        Characteristic.Volume,
        this.computerSpeakers.getVolume.bind(
          this.computerSpeakers,
          volumeAlgorithm
        ),
        (newValue: number, callback: () => void) => {
          this.computerSpeakers
            .setVolume(newValue, volumeAlgorithm)
            .finally(callback)
        }
      )
    }

    if (services.indexOf(ConfigService.Fan) > -1) {
      log.debug("Creating fan service")

      this.fanService = new ServiceWrapper(
        new Service.Fan(name, ConfigService.Fan)
      )

      this.fanService.bindBooleanCharacteristic(
        Characteristic.On,
        async () => {
          const isOn = await this.computerSpeakers.getMuted()
          log.debug(
            `Flipping fan on value from ${isOn} to ${!isOn} before setting muted status`
          )
          return !isOn
        },
        (isMuted: boolean, callback: () => void) => {
          log.debug(
            `Flipping system muted value from ${isMuted} to ${!isMuted} before returning fan on value`
          )
          this.computerSpeakers.setMuted(!isMuted).finally(callback)
        }
      )
      this.fanService.bindNumberCharacteristic(
        Characteristic.RotationSpeed,
        this.computerSpeakers.getVolume.bind(
          this.computerSpeakers,
          volumeAlgorithm
        ),
        (newValue: number, callback: () => void) => {
          this.computerSpeakers
            .setVolume(newValue, volumeAlgorithm)
            .finally(callback)
        }
      )
    }

    if (services.indexOf(ConfigService.Lightbulb) > -1) {
      log.debug("Creating lightbulb service")

      this.lightService = new ServiceWrapper(
        new Service.Lightbulb(name, ConfigService.Lightbulb)
      )

      this.lightService.bindBooleanCharacteristic(
        Characteristic.On,
        async () => {
          const isOn = await this.computerSpeakers.getMuted()
          log.debug(
            `Flipping fan on value from ${isOn} to ${!isOn} before setting muted status`
          )
          return !isOn
        },
        (isMuted: boolean, callback: () => void) => {
          log.debug(
            `Flipping system muted value from ${isMuted} to ${!isMuted} before returning fan on value`
          )
          this.computerSpeakers.setMuted(!isMuted).finally(callback)
        }
      )
      this.lightService.bindNumberCharacteristic(
        Characteristic.Brightness,
        this.computerSpeakers.getVolume.bind(
          this.computerSpeakers,
          volumeAlgorithm
        ),
        (newValue: number, callback: () => void) => {
          this.computerSpeakers
            .setVolume(newValue, volumeAlgorithm)
            .finally(callback)
        }
      )
    }

    if (services.indexOf(ConfigService.IncreaseVolumeButton) > -1) {
      log.debug("Creating increase volume service")

      this.volumeUpButtonService = new ServiceWrapper(
        new Service.Switch(
          name + " +" + switchVolumeDelta + "%",
          ConfigService.IncreaseVolumeButton
        )
      )

      this.volumeUpButtonService.bindBooleanCharacteristic(
        Characteristic.On,
        async () => {
          return false
        },
        (isOn: boolean, callback: () => void) => {
          if (isOn) {
            this.computerSpeakers
              .modifyVolume(config.switchVolumeDelta, volumeAlgorithm)
              .then(() => {
                callback()
              })
              .catch(() => {
                callback()
              })
          } else {
            callback()
          }
        }
      )
    }

    if (services.indexOf(ConfigService.DecreaseVolumeButton) > -1) {
      log.debug("Creating decrease volume service")

      this.volumeDownService = new ServiceWrapper(
        new Service.Switch(
          name + " -" + switchVolumeDelta + "%",
          ConfigService.DecreaseVolumeButton
        )
      )

      this.volumeDownService.bindBooleanCharacteristic(
        Characteristic.On,
        async () => {
          return false
        },
        (isOn: boolean, callback: () => void) => {
          if (isOn) {
            this.computerSpeakers
              .modifyVolume(-config.switchVolumeDelta, volumeAlgorithm)
              .then(() => {
                callback()
              })
              .catch(() => {
                callback()
              })
          } else {
            callback()
          }
        }
      )
    }

    if (config.initialVolume !== undefined) {
      this.computerSpeakers
        .setVolume(config.initialVolume, volumeAlgorithm)
        .catch((error) => {
          log.debug(
            `Failed setting initial volume to ${config.initialVolume}: ${error}`
          )
        })
    }

    if (config.initiallyMuted !== undefined) {
      this.computerSpeakers.setMuted(config.initiallyMuted).catch((error) => {
        log.debug(
          `Failed setting initial muted status to ${config.initiallyMuted}: ${error}`
        )
      })
    }
  }

  public getServices() {
    return [
      this.speakerService,
      this.lightService,
      this.fanService,
      this.volumeUpButtonService,
      this.volumeDownService,
    ]
      .filter((wrapper) => wrapper !== undefined)
      .map((wrapper) => wrapper.service)
  }
}
