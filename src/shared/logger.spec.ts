import { randAnimal, randUrl } from "@ngneat/falso"
import { LogginFnType, log } from "./logger"
import { default as session } from "./sessionConfig"

describe("Logger", () => {
  it("should be defined", () => {
    expect(log).toBeDefined()
  })

  it("calls the correct log function based on passed-in argument", () => {
    const randomMessage = randUrl()
    
    const logLevels = ["log", "error", "dir"]

    const randomIndex = Math.floor(Math.random() * logLevels.length)
    const loggingFnName = logLevels[randomIndex]

    const loggingFn = jest.spyOn(console, loggingFnName as LogginFnType)

    log(loggingFnName as LogginFnType, randomMessage)

    expect(loggingFn).toBeCalledWith(randomMessage)
  })

  it("calls the debug function when session.debug=true", () => {
    const randomMessage = randAnimal()

    const previousSession = session

    // Make session.debug be true
    session.debug = true
    const loggingFn = jest.spyOn(console, "debug")

    log("debug", randomMessage)

    expect(loggingFn).toBeCalledWith("*** DEBUG:", randomMessage)

    session.debug = previousSession.debug
  })
})