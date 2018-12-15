export interface Config {
  name: string
  services?: Service[]
  logarithmic?: boolean
}

export enum Service {
  Lightbulb = "lightbulb",
  Speaker = "speaker",
  Fan = "fan",
}

export default Config
