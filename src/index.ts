import ComputerSpeakersAccessory from "./ComputerSpeakersAccessory"
import { API, PluginInitializer } from "homebridge"

const initialise: PluginInitializer = function initialise(api: API) {
  api.registerAccessory(
    "homebridge-pc-volume",
    "ComputerSpeakers",
    ComputerSpeakersAccessory
  )
}

export default initialise
