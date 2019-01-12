import "hap-nodejs"
import * as hap from "hap-nodejs"
import loudness = require("loudness")
import * as sinon from "sinon"
import ServiceWrapper from "../ServiceWrapper"
import { Service as ConfigService } from "./../config"
import LogStub from "./helpers/LogStub"

describe("ServiceWrapper", () => {
  describe("#bindCharacteristicToMuted", () => {
    let wrapper: ServiceWrapper

    beforeEach(() => {
      wrapper = new ServiceWrapper(
        new hap.Service.Speaker(name, ConfigService.Speaker),
        loudness,
        new LogStub()
      )
    })

    describe("when the system returns an error", () => {
      let stub: sinon.SinonStub<[], Promise<boolean>>
      let expectedError: Error

      beforeEach(() => {
        wrapper.bindCharacteristicToMuted(hap.Characteristic.Mute, false)
        expectedError = new Error("This is a test error")
        stub = sinon.stub(loudness, "getMuted").rejects(expectedError)
      })

      afterEach(() => {
        stub.restore()
      })

      it("should return the error when the mute characteristic is requested", done => {
        wrapper.service
          .getCharacteristic(hap.Characteristic.Mute)
          .emit("get", (error?: Error, muted?: boolean) => {
            expect(muted).toBeNull()
            expect(error).toStrictEqual(expectedError)
            done()
          })
      })
    })

    describe("when the system does not return an error", () => {
      let stub: sinon.SinonStub<[], Promise<boolean>>

      beforeEach(() => {
        stub = sinon.stub(loudness, "getMuted").resolves(true)
      })

      afterEach(() => {
        stub.restore()
      })

      describe("passing `false` for `flipValue`", () => {
        beforeEach(() => {
          wrapper.bindCharacteristicToMuted(hap.Characteristic.Mute, false)
        })

        describe("then requesting the value from the characteristic", () => {
          it("should request the muted status from node-loudness", done => {
            wrapper.service
              .getCharacteristic(hap.Characteristic.Mute)
              .emit("get", () => {
                expect(stub.calledOnce).toStrictEqual(true)
                done()
              })
          })

          describe("when the system is muted", () => {
            it("should return `true` when the mute characteristic is requested", done => {
              wrapper.service
                .getCharacteristic(hap.Characteristic.Mute)
                .emit("get", (error?: Error, muted?: boolean) => {
                  expect(muted).toStrictEqual(true)
                  expect(error).toBeNull()
                  done()
                })
            })
          })

          describe("when the system is unmuted", () => {
            it("should return `true` when the mute characteristic is requested", done => {
              wrapper.service
                .getCharacteristic(hap.Characteristic.Mute)
                .emit("get", (error?: Error, muted?: boolean) => {
                  expect(muted).toStrictEqual(true)
                  expect(error).toBeNull()
                  done()
                })
            })
          })
        })
      })

      describe("passing `true` for `flipValue`", () => {
        beforeEach(() => {
          wrapper.bindCharacteristicToMuted(hap.Characteristic.Mute, true)
        })

        describe("then requesting the value from the characteristic", () => {
          it("should request the muted status from node-loudness", done => {
            wrapper.service
              .getCharacteristic(hap.Characteristic.Mute)
              .emit("get", () => {
                expect(stub.calledOnce).toStrictEqual(true)
                done()
              })
          })

          describe("when the system is muted", () => {
            it("should return `false` when the mute characteristic is requested", done => {
              wrapper.service
                .getCharacteristic(hap.Characteristic.Mute)
                .emit("get", (error?: Error, muted?: boolean) => {
                  expect(muted).toStrictEqual(false)
                  expect(error).toBeNull()
                  done()
                })
            })
          })

          describe("when the system is unmuted", () => {
            it("should return `false` when the mute characteristic is requested", done => {
              wrapper.service
                .getCharacteristic(hap.Characteristic.Mute)
                .emit("get", (error?: Error, muted?: boolean) => {
                  expect(muted).toStrictEqual(false)
                  expect(error).toBeNull()
                  done()
                })
            })
          })
        })
      })
    })
  })
})
