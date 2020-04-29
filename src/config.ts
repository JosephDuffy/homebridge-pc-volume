import { AccessoryConfig } from "homebridge"

export interface Config extends AccessoryConfig {
  services?: Service[]
  initialVolume?: number
  initiallyMuted?: boolean
  logarithmic?: boolean
  switchVolumeDelta?: number
  switchDelay?: number
}

export enum Service {
  Lightbulb = "lightbulb",
  Speaker = "speaker",
  Fan = "fan",
  IncreaseVolumeButton = "increase-button",
  DecreaseVolumeButton = "decrease-button",
}

export enum VolumeAlgorithm {
  Linear = "linear",
  Logarithmic = "logarithmic",
}

export default Config
