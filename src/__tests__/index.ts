import * as sinon from "sinon"
import { HomebridgeAPI } from "homebridge/lib/api"

describe("public interface", () => {
  let homebridge: HomebridgeAPI
  let registerAccessorySpy: sinon.SinonSpy

  beforeEach(async () => {
    const defaultExport = (await import("../index")).default
    homebridge = new HomebridgeAPI()
    registerAccessorySpy = sinon.spy(homebridge, "registerAccessory")
    defaultExport(homebridge)
  })

  it("should call registerAccessory once", () => {
    expect(registerAccessorySpy.callCount).toStrictEqual(1)
  })
})
