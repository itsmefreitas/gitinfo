import * as log from "../../../shared/logger"
import { Command } from "../types"
import { help } from "./help"

describe("help", () => {
  const loggerSpy = jest.spyOn(log, "log")

  it("displays command help", async () => {
    help()
    expect(loggerSpy).toBeCalledWith(
      "log",
      `
        ${Command.SearchUsers}: searches the database and displays results;
        ${Command.GetUser}: fetch (and caches) information for a user;
        ${Command.Quit}: exits this CLI;
        ${Command.Help}: shows usage;
        ${Command.Date}: tests database connection and queries for current time.
        `
    )
  })
})
