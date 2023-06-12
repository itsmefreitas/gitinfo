import * as database from "../../database"
import * as log from "../../../shared/logger"
import { date } from "./date"

jest.mock("../../database")

describe("date", () => {
  it("retrieves the date as a string", async () => {
    const logSpy = jest.spyOn(log, "log")
    
    const currentDate = new Date()
    const dateSpy = jest.spyOn(database, "getCurrentDbTime")

    dateSpy.mockResolvedValueOnce(currentDate)

    await date()

    expect(logSpy).toBeCalledWith("log", currentDate.toISOString())
  })
})
