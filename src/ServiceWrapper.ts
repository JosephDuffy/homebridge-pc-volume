import {
  Characteristic,
  CharacteristicEventTypes,
  Service,
  WithUUID,
} from "hap-nodejs"

export default class ServiceWrapper {
  public readonly service: Service

  constructor(service: Service) {
    this.service = service
  }

  public bindBooleanCharacteristic(
    characteristic: WithUUID<new () => Characteristic>,
    getValue: () => Promise<boolean>,
    setValue: (isMuted: boolean, callback: () => void) => void
  ) {
    this.service
      .getCharacteristic(characteristic)
      .on(
        CharacteristicEventTypes.GET,
        (callback: (error: Error | null, muted: boolean | null) => void) => {
          getValue()
            .then((isMuted) => {
              callback(null, isMuted)
            })
            .catch((error) => {
              callback(error, null)
            })
        }
      )
      .on(CharacteristicEventTypes.SET, setValue)
  }

  public bindNumberCharacteristic(
    characteristic: WithUUID<typeof Characteristic>,
    getValue: () => Promise<number>,
    setValue: (systemVolume: number, callback: () => void) => void
  ) {
    this.service
      .addCharacteristic(characteristic)
      .on(
        CharacteristicEventTypes.GET,
        (
          callback: (error: Error | null, homekitVolume: number | null) => void
        ) => {
          getValue()
            .then((homekitVolume) => {
              callback(null, homekitVolume)
            })
            .catch((error) => {
              callback(error, null)
            })
        }
      )
      .on(CharacteristicEventTypes.SET, setValue)
  }
}
