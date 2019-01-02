import "hap-nodejs"
import _loudness = require("loudness")
import { VolumeAlgorithm } from "./config"
import { Logger } from "./homebridge"

export default class ServiceWrapper {
  public readonly service: HAPNodeJS.Service
  private readonly loudness: typeof _loudness
  private readonly log: Logger

  constructor(
    service: HAPNodeJS.Service,
    loudness: typeof _loudness,
    log: Logger
  ) {
    this.service = service
    this.loudness = loudness
    this.log = log
  }

  /**
   * Binds the provided characteristic to the muted status of the system audio.
   *
   * If the `flipValue` property is `true` then all value updates and requests will be flipped. This
   * is used for some characteristics that have opposite logic to being muted, e.g. a muted speaker
   * would be equivelent to a fan that isn't powered on.
   *
   * @param characteristic The characteristic to bind the muted status to
   * @param flipValue If `true` the input and output values of the characteristic will be flipped. Defaults to `false`
   */
  public bindCharacteristicToMuted(
    characteristic: HAPNodeJS.Characteristic,
    flipValue: boolean = false
  ) {
    this.service
      .getCharacteristic(characteristic)
      .on("set", (newValue: boolean, callback: () => void) => {
        if (flipValue) {
          this.log.debug(
            `Flipping characteristic value before setting muted status to ${!newValue}`
          )
          this.setMuted(!newValue, callback)
        } else {
          this.setMuted(newValue, callback)
        }
      })
      .on(
        "get",
        (callback: (error: Error | null, muted: boolean | null) => void) => {
          this.getMuted((error, muted) => {
            if (error) {
              callback(error, null)
            } else if (flipValue) {
              this.log.debug(`Returning flipped muted status: ${!muted}`)
              callback(null, !muted)
            } else {
              callback(null, muted)
            }
          })
        }
      )
  }

  public bindCharacteristicToVolume(
    characteristic: HAPNodeJS.Characteristic,
    algorithm: VolumeAlgorithm
  ) {
    this.service
      .addCharacteristic(characteristic)
      .on("set", (newValue: number, callback: () => void) => {
        switch (algorithm) {
          case VolumeAlgorithm.Linear:
            this.setVolume(newValue, callback)
            break
          case VolumeAlgorithm.Logarithmic:
            const systemVolume = Math.round(Math.log10(1 + newValue) * 50)
            this.log.debug(`Converted HomeKit volume to ${systemVolume}%`)
            this.setVolume(systemVolume, callback)
            break
        }
      })
      .on(
        "get",
        (callback: (error: Error | null, volume: number | null) => void) => {
          this.getVolume((error, volume) => {
            if (error) {
              callback(error, null)
            } else {
              switch (algorithm) {
                case VolumeAlgorithm.Linear:
                  callback(null, volume)
                  break
                case VolumeAlgorithm.Logarithmic:
                  const homekitVolume = Math.round(
                    Math.pow(10, volume / 50) - 1
                  )
                  this.log.debug(`Converted system volume to ${homekitVolume}%`)
                  callback(null, homekitVolume)
                  break
              }
            }
          })
        }
      )
  }

  private setMuted(newValue: boolean, callback: () => void) {
    this.log.debug(`Setting muted status to ${newValue}`)

    this.loudness
      .setMuted(newValue)
      .then(() => {
        this.log.debug(`Set muted status to ${newValue}`)
        callback()
      })
      .catch(error => {
        this.log.error(`Failed to set muted status to ${newValue}: ${error}`)
      })
  }

  private getMuted(
    callback: (error: Error | null, muted: boolean | null) => void
  ) {
    this.log.debug(`Getting muted status`)

    this.loudness
      .getMuted()
      .then(muted => {
        this.log.debug(`Got muted status: ${muted}`)
        callback(null, muted)
      })
      .catch(error => {
        this.log.debug(`Failed to get muted status: ${error}`)
        callback(error, null)
      })
  }

  private setVolume(volume: number, callback: () => void) {
    this.log.debug(`Setting volume to ${volume}%`)

    this.loudness
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
    callback: (error: Error | null, muted: number | null) => void
  ) {
    this.log.debug(`Getting volume`)

    this.loudness
      .getVolume()
      .then(volume => {
        this.log.debug(`Got volume: ${volume}%`)
        callback(null, volume)
      })
      .catch(error => {
        this.log.debug(`Failed to get volume: ${error}`)
        callback(error, null)
      })
  }
}
