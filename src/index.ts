import ComputerSpeakersAccessory from "./ComputerSpeakersAccessory"
import Homebridge from "./homebridge"

export default function initialise(homebridge: Homebridge): void {
  homebridge.registerAccessory(
    "homebridge-pc-volume",
    "ComputerSpeakers",
    ComputerSpeakersAccessory.bind(
      ComputerSpeakersAccessory,
      homebridge.hap.Service,
      homebridge.hap.Characteristic
    )
  )
}
