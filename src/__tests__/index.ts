/* tslint:disable:no-empty */

import "hap-nodejs"
import * as hap from "hap-nodejs"
import * as sinon from "sinon"
import { Config } from "./../config"
import { Accessory, AccessoryConstructor, Homebridge } from "./../homebridge"

describe("public interface", () => {
  let homebridge: Homebridge

  beforeEach(() => {
    homebridge = {
      hap,
      log: {
        debug(...message: string[]): void {},
        info(...message: string[]): void {},
        warn(...message: string[]): void {},
        error(...message: string[]): void {},
      },
      registerAccessory(
        pluginName: string,
        accessoryName: string,
        constructor: AccessoryConstructor
      ) {},
    }
  })

  it("should call registerAccessory once", async () => {
    const mock = sinon.mock(homebridge)
    mock.expects("registerAccessory").once()

    const defaultExport = (await import("../index")) as (
      homebridge: Homebridge
    ) => void
    defaultExport(homebridge)

    mock.verify()
  })

  describe("registered accessory constructor", () => {
    let accessory: Accessory
    let config: Config

    beforeEach(async () => {
      const defaultExport = (await import("../index")) as (
        homebridge: Homebridge
      ) => void
      homebridge.registerAccessory = (
        pluginName: string,
        accessoryName: string,
        constructor: AccessoryConstructor
      ) => {
        accessory = new constructor(homebridge.log, config)
      }
      defaultExport(homebridge)
    })

    describe("with a default config", () => {
      let Service: HAPNodeJS.Service
      let services: HAPNodeJS.Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
        }
      })

      beforeEach(() => {
        Service = hap.Service
        services = accessory.getServices()
      })

      it("should register a single service", () => {
        expect(services.length).toBe(1)
      })

      it("should register a lighbulb service", () => {
        expect(services[0].UUID).toStrictEqual(
          new Service.Lightbulb("test", "test").UUID
        )
      })

      it("should use the name provided in the config", () => {
        expect(services[0].displayName).toStrictEqual(config.name)
      })
    })
  })
})
