import _loudness from "loudness"
import { VolumeAlgorithm } from "./config"
import { Logger } from "./homebridge"

type Loudness = typeof _loudness

export default class ComputerSpeakers {
  private log: Logger
  private loudness: Loudness

  constructor(log: Logger, loudness: Loudness) {
    this.log = log
    this.loudness = loudness
  }

  public async getMuted(): Promise<boolean> {
    this.log.debug(`Getting muted status`)
    try {
      const isMuted = this.loudness.getMuted()
      this.log.debug(`Got muted status: ${isMuted}`)
      return isMuted
    } catch (error) {
      this.log.debug(`Failed to get muted status: ${error}`)
      throw error
    }
  }

  public setMuted(newValue: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.log.debug(`Setting muted status to ${newValue}`)
      this.loudness
        .setMuted(newValue)
        .then(() => {
          this.log.debug(`Set muted status to ${newValue}`)
          resolve()
        })
        .catch((error) => {
          this.log.error(`Failed to set muted status to ${newValue}: ${error}`)
          reject(error)
        })
    })
  }

  public setVolume(volume: number, algorithm: VolumeAlgorithm): Promise<void> {
    return new Promise((resolve, reject) => {
      const systemVolume = (() => {
        switch (algorithm) {
          case VolumeAlgorithm.Linear:
            this.log.debug(`Setting volume to ${volume}%`)
            return volume
          case VolumeAlgorithm.Logarithmic:
            const logarithmicVolume =
              Math.pow(10, volume / (100 / Math.log10(101))) - 1
            this.log.debug(
              `Converted HomeKit volume ${volume}% to ${logarithmicVolume} due to logarithmic volume algorithm`
            )
            return logarithmicVolume
        }
      })()

      this.loudness
        .setVolume(systemVolume)
        .then(() => {
          this.log.debug(`Set volume to ${systemVolume}%`)
          resolve()
        })
        .catch((error) => {
          this.log.error(`Failed to set volume to ${systemVolume}%: ${error}`)
          reject(error)
        })
    })
  }

  public getVolume(algorithm: VolumeAlgorithm): Promise<number> {
    return new Promise((resolve, reject) => {
      this.log.debug(`Getting volume`)

      this.loudness
        .getVolume()
        .then((volume) => {
          switch (algorithm) {
            case VolumeAlgorithm.Linear:
              this.log.debug(`Got system volume: ${volume}%`)
              resolve(volume)
              break
            case VolumeAlgorithm.Logarithmic:
              const homekitVolume = Math.round(
                Math.pow(10, volume / (100 / Math.log10(101))) - 1
              )

              this.log.debug(
                `Converted system volume ${volume}% to ${homekitVolume} due to logarithmic volume algorithm`
              )

              resolve(volume)
              break
          }
        })
        .catch((error) => {
          this.log.debug(`Failed to get volume: ${error}`)
          reject(error)
        })
    })
  }

  public modifyVolume(
    delta: number,
    algorithm: VolumeAlgorithm
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.log.debug(`Modifying volume by ${delta}%`)

      this.getVolume(algorithm)
        .then((homekitVolume) => {
          this.setVolume(homekitVolume, algorithm)
            .then(() => {
              resolve()
            })
            .catch((error) => {
              reject(error)
            })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}
