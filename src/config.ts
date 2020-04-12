export interface Config {
  name: string
  services?: Service[]
  initialVolume?: number
  initiallyMuted?: boolean
  logarithmic?: boolean
  delta?: number
  delay?: number
  cached?: boolean
}

export enum Service {
  Lightbulb = "lightbulb",
  Speaker = "speaker",
  Fan = "fan",
  IncreaseVolumeButton = "increase",
  DecreaseVolumeButton = "decrease",
}

export default Config
