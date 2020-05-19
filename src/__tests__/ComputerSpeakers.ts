import loudness from "loudness"
import * as sinon from "sinon"
import ComputerSpeakers from "../ComputerSpeakers"
import MockLogging from "./mocks/MockLogging"
import { Logging } from "homebridge"

describe("ComputerSpeakers", () => {
  let wrapper: ComputerSpeakers

  beforeEach(() => {
    wrapper = new ComputerSpeakers(new MockLogging() as Logging, loudness)
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
