import { Characteristic, CharacteristicEventTypes, Service } from "hap-nodejs"
import loudness = require("loudness")
import * as sinon from "sinon"
import ServiceWrapper from "../ServiceWrapper"
import ComputerSpeakers from "../ComputerSpeakers"
import { Service as ConfigService } from "../config"
import LogStub from "./helpers/LogStub"

describe("ComputerSpeakers", () => {
  let wrapper: ComputerSpeakers

  beforeEach(() => {
    wrapper = new ComputerSpeakers(new LogStub(), loudness)
  })

  describe("#getMuted", () => {
    describe("when the system returns an error", () => {
      let stub: sinon.SinonStub<[], Promise<boolean>>
      let expectedError: Error

      beforeEach(() => {
        expectedError = new Error("This is a test error")
        stub = sinon.stub(loudness, "getMuted").rejects(expectedError)
      })

      afterEach(() => {
        stub.restore()
      })

      it("should return the error when the mute characteristic is requested", () => {
        expect.assertions(1)
        expect(wrapper.getMuted()).rejects.toEqual(expectedError)
      })
    })

    describe("when the system does not return an error", () => {
      let stub: sinon.SinonStub<[], Promise<boolean>>
      let systemMutedStatus: boolean

      beforeEach(() => {
        systemMutedStatus = true
        stub = sinon.stub(loudness, "getMuted").resolves(systemMutedStatus)
      })

      afterEach(() => {
        stub.restore()
      })

      it("should return the system status", () => {
        expect.assertions(1)
        expect(wrapper.getMuted()).resolves.toEqual(systemMutedStatus)
      })
    })
  })
})
