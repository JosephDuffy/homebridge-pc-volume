import { Characteristic, CharacteristicEventTypes, Service } from "hap-nodejs"
import * as hap from "hap-nodejs"
import loudness = require("loudness")
import * as sinon from "sinon"
import ComputerSpeakersAccessory from "../ComputerSpeakersAccessory"
import ServiceWrapper from "../ServiceWrapper"
import { Config, Service as ConfigService, VolumeAlgorithm } from "./../config"
import { AccessoryConstructor, Homebridge } from "./../homebridge"
import LogStub from "./helpers/LogStub"

describe("public interface", () => {
  let homebridge: Homebridge

  beforeEach(() => {
    homebridge = {
      hap,
      log: new LogStub(),
      /* tslint:disable:no-empty */
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

    const defaultExport = (await import("../index")).default
    defaultExport(homebridge)

    mock.verify()
  })

  describe("registered accessory constructor", () => {
    let accessory: ComputerSpeakersAccessory
    let config: Config

    beforeEach(async () => {
      const defaultExport = (await import("../index")).default
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
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
        }
      })

      beforeEach(() => {
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

    describe("with a config defining a lightbulb service and using the logarithmic option", () => {
      let services: Service[]
      let spy: sinon.SinonSpy

      beforeAll(() => {
        config = {
          logarithmic: true,
          name: "Test Computer Speakers",
          services: [ConfigService.Lightbulb],
        }
        spy = sinon.spy(ServiceWrapper.prototype, "bindCharacteristicToVolume")
      })

      beforeEach(() => {
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

      it("should call bindCharacteristicToVolume with the logarithmic algorithm", () => {
        expect(spy.lastCall.lastArg).toStrictEqual(VolumeAlgorithm.Logarithmic)
      })

      it("should use the name provided in the config", () => {
        expect(services[0].displayName).toStrictEqual(config.name)
      })
    })

    describe("with a config defining a lightbulb service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Lightbulb],
        }
      })

      beforeEach(() => {
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

    describe("with a config defining a fan service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Fan],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register a single service", () => {
        expect(services.length).toBe(1)
      })

      it("should register a fan service", () => {
        expect(services[0].UUID).toStrictEqual(
          new Service.Fan("test", "test").UUID
        )
      })

      it("should use the name provided in the config", () => {
        expect(services[0].displayName).toStrictEqual(config.name)
      })
    })

    describe("with a config defining a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Speaker],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register a single service", () => {
        expect(services.length).toBe(1)
      })

      it("should register a speaker service", () => {
        expect(services[0].UUID).toStrictEqual(
          new Service.Speaker("test", "test").UUID
        )
      })

      it("should use the name provided in the config", () => {
        expect(services[0].displayName).toStrictEqual(config.name)
      })
    })

    describe("with a config defining a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Speaker],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register a single service", () => {
        expect(services.length).toBe(1)
      })

      it("should register a speaker service", () => {
        expect(services[0].UUID).toStrictEqual(
          new Service.Speaker("test", "test").UUID
        )
      })

      it("should use the name provided in the config", () => {
        expect(services[0].displayName).toStrictEqual(config.name)
      })

      describe("when the system is muted", () => {
        let stub: sinon.SinonStub<[], Promise<boolean>>

        beforeEach(() => {
          stub = sinon.stub(loudness, "getMuted").resolves(true)
        })

        afterEach(() => {
          stub.restore()
        })

        it("should request the muted status for node-loudness", (done) => {
          services[0]
            .getCharacteristic(Characteristic.Mute)
            .emit(CharacteristicEventTypes.GET, () => {
              expect(stub.calledOnce).toStrictEqual(true)
              done()
            })
        })

        it("should return `true` when the mute characteristic is requested", (done) => {
          services[0]
            .getCharacteristic(Characteristic.Mute)
            .emit(
              CharacteristicEventTypes.GET,
              (error?: Error, muted?: boolean) => {
                expect(muted).toStrictEqual(true)
                expect(error).toBeNull()
                done()
              }
            )
        })
      })
    })

    describe("with a config defining a lightbulb and a fan service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Lightbulb, ConfigService.Fan],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register 2 services", () => {
        expect(services.length).toBe(2)
      })

      it("should register a lightbulb service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Lightbulb("test", "test").UUID,
          })
        )
      })

      it("should register a fan service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Fan("test", "test").UUID,
          })
        )
      })

      it("should register all services with the name provided in the config", () => {
        services.forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
      })
    })

    describe("with a config defining a lightbulb and a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Lightbulb, ConfigService.Speaker],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register 2 services", () => {
        expect(services.length).toBe(2)
      })

      it("should register a lightbulb service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Lightbulb("test", "test").UUID,
          })
        )
      })

      it("should register a speaker service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Speaker("test", "test").UUID,
          })
        )
      })

      it("should register all services with the name provided in the config", () => {
        services.forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
      })
    })

    describe("with a config defining a fan and a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [ConfigService.Fan, ConfigService.Speaker],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register 2 services", () => {
        expect(services.length).toBe(2)
      })

      it("should register a fan service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Fan("test", "test").UUID,
          })
        )
      })

      it("should register a speaker service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Speaker("test", "test").UUID,
          })
        )
      })

      it("should register all services with the name provided in the config", () => {
        services.forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
      })
    })

    describe("with a config defining a lightbulb, a fan, and a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [
            ConfigService.Lightbulb,
            ConfigService.Fan,
            ConfigService.Speaker,
          ],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register 3 services", () => {
        expect(services.length).toBe(3)
      })

      it("should register a lightbulb service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Lightbulb("test", "test").UUID,
          })
        )
      })

      it("should register a fan service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Fan("test", "test").UUID,
          })
        )
      })

      it("should register a speaker service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Speaker("test", "test").UUID,
          })
        )
      })

      it("should register all services with the name provided in the config", () => {
        services.forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
      })
    })

    describe("with a config defining a lightbulb, a fan, and a speaker service", () => {
      let services: Service[]

      beforeAll(() => {
        config = {
          name: "Test Computer Speakers",
          services: [
            ConfigService.Lightbulb,
            ConfigService.Fan,
            ConfigService.Speaker,
          ],
        }
      })

      beforeEach(() => {
        services = accessory.getServices()
      })

      it("should register 3 services", () => {
        expect(services.length).toBe(3)
      })

      it("should register a lightbulb service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Lightbulb("test", "test").UUID,
          })
        )
      })

      it("should register a fan service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Fan("test", "test").UUID,
          })
        )
      })

      it("should register a speaker service", () => {
        expect(services).toContainEqual(
          expect.objectContaining({
            UUID: new Service.Speaker("test", "test").UUID,
          })
        )
      })

      it("should register all services with the name provided in the config", () => {
        services.forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
      })
    })
  })
})
