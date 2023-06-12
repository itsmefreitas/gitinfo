import * as log from "../../../shared/logger"
import * as database from "../../database"
import { quit } from "./quit"

jest.mock("../../database")

describe("quit", () => {
  const dbCloseConnectionSpy = jest.spyOn(database, "closeConnection")
  const loggerSpy = jest.spyOn(log, "log")

  it("closes db connection when command is called", async () => {
    await quit()

    expect(dbCloseConnectionSpy).toBeCalled()
    expect(loggerSpy).toBeCalledWith("log", "Buh-bye!")
  })
})
