import { Characteristic, CharacteristicEventTypes, Service } from "hap-nodejs"
import loudness from "loudness"
import * as sinon from "sinon"
import ComputerSpeakersAccessory from "../ComputerSpeakersAccessory"
import ServiceWrapper from "../ServiceWrapper"
import { Config, Service as ConfigService, } from "../config"
import { Logger, Logging } from "homebridge"

describe("ComputerSpeakersAccessory", () => {
  let accessory: ComputerSpeakersAccessory

  function createAccessory(config: Config) {
    accessory = new ComputerSpeakersAccessory(
      new Logger() as Logging,
      config
    )
  }

  describe("with a default config", () => {
    let config: Config

    beforeEach(async () => {
      config = {
        name: "Test Accessory",
        accessory: "Test Accessory",
      }
      createAccessory(config)
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a lighbulb service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Lightbulb("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
    })
  })

  describe("with a config defining a lightbulb service and using the logarithmic option", () => {
    let config: Config
    let spy: sinon.SinonSpy

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        logarithmic: true,
        services: [ConfigService.Lightbulb],
      }
      spy = sinon.spy(ServiceWrapper.prototype, "bindNumberCharacteristic")
      createAccessory(config)
    })

    afterEach(() => {
      spy.restore()
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a lighbulb service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Lightbulb("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
    })
  })

  describe("with a config defining a lightbulb service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Lightbulb],
      }
      createAccessory(config)
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a lighbulb service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Lightbulb("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
    })
  })

  describe("with a config defining a fan service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Fan],
      }
      createAccessory(config)
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a fan service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Fan("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
    })
  })

  describe("with a config defining a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Speaker],
      }
      createAccessory(config)
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Speaker("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
    })
  })

  describe("with a config defining a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Speaker],
      }
      createAccessory(config)
    })

    it("should register a single service", () => {
      expect(accessory.getServices().length).toBe(1)
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()[0].UUID).toStrictEqual(
        new Service.Speaker("test", "test").UUID
      )
    })

    it("should use the name provided in the config", () => {
      expect(accessory.getServices()[0].displayName).toStrictEqual(config.name)
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
        accessory
          .getServices()[0]
          .getCharacteristic(Characteristic.Mute)
          .emit(CharacteristicEventTypes.GET, () => {
            expect(stub.calledOnce).toStrictEqual(true)
            done()
          })
      })

      it("should return `true` when the mute characteristic is requested", (done) => {
        accessory
          .getServices()[0]
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
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Lightbulb, ConfigService.Fan],
      }
      createAccessory(config)
    })

    it("should register 2 services", () => {
      expect(accessory.getServices().length).toBe(2)
    })

    it("should register a lightbulb service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Lightbulb("test", "test").UUID,
        })
      )
    })

    it("should register a fan service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Fan("test", "test").UUID,
        })
      )
    })

    it("should register all services with the name provided in the config", () => {
      accessory
        .getServices()
        .forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
    })
  })

  describe("with a config defining a lightbulb and a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Lightbulb, ConfigService.Speaker],
      }
      createAccessory(config)
    })

    it("should register 2 services", () => {
      expect(accessory.getServices().length).toBe(2)
    })

    it("should register a lightbulb service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Lightbulb("test", "test").UUID,
        })
      )
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Speaker("test", "test").UUID,
        })
      )
    })

    it("should register all services with the name provided in the config", () => {
      accessory
        .getServices()
        .forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
    })
  })

  describe("with a config defining a fan and a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [ConfigService.Fan, ConfigService.Speaker],
      }
      createAccessory(config)
    })

    it("should register 2 services", () => {
      expect(accessory.getServices().length).toBe(2)
    })

    it("should register a fan service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Fan("test", "test").UUID,
        })
      )
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Speaker("test", "test").UUID,
        })
      )
    })

    it("should register all services with the name provided in the config", () => {
      accessory
        .getServices()
        .forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
    })
  })

  describe("with a config defining a lightbulb, a fan, and a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [
          ConfigService.Lightbulb,
          ConfigService.Fan,
          ConfigService.Speaker,
        ],
      }
      createAccessory(config)
    })

    it("should register 3 services", () => {
      expect(accessory.getServices().length).toBe(3)
    })

    it("should register a lightbulb service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Lightbulb("test", "test").UUID,
        })
      )
    })

    it("should register a fan service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Fan("test", "test").UUID,
        })
      )
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Speaker("test", "test").UUID,
        })
      )
    })

    it("should register all services with the name provided in the config", () => {
      accessory
        .getServices()
        .forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
    })
  })

  describe("with a config defining a lightbulb, a fan, and a speaker service", () => {
    let config: Config

    beforeEach(() => {
      config = {
        name: "Test Computer Speakers",
        accessory: "Test Accessory",
        services: [
          ConfigService.Lightbulb,
          ConfigService.Fan,
          ConfigService.Speaker,
        ],
      }
      createAccessory(config)
    })

    it("should register 3 services", () => {
      expect(accessory.getServices().length).toBe(3)
    })

    it("should register a lightbulb service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Lightbulb("test", "test").UUID,
        })
      )
    })

    it("should register a fan service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Fan("test", "test").UUID,
        })
      )
    })

    it("should register a speaker service", () => {
      expect(accessory.getServices()).toContainEqual(
        expect.objectContaining({
          UUID: new Service.Speaker("test", "test").UUID,
        })
      )
    })

    it("should register all services with the name provided in the config", () => {
      accessory
        .getServices()
        .forEach((service) =>
          expect(service.displayName).toStrictEqual(config.name)
        )
    })
  })
})
