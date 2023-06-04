import { Interface } from "node:readline/promises"
import { log } from "../../shared/logger"
import { closeConnection, getCurrentDbTime } from "../database"
import { Command, HandlerFunction, HandlerMap } from "./types"

const handlers: HandlerMap = {
  [Command.Quit]: async (): Promise<void> => {
    await closeConnection()

    return log("log", "Buh-bye!")
  },
  [Command.Date]: async (): Promise<void> => {
    const currentDate = await getCurrentDbTime()

    log("log", currentDate.toISOString())
  },
  [Command.Help]: () => {
    return log(
      "log",
      `
    ${Command.SearchUsers}: searches the database and displays results;
    ${Command.GetUser}: fetch (and caches) information for a user;
    ${Command.Quit}: exits this CLI;
    ${Command.Help}: shows usage;
    ${Command.Date}: tests database connection and queries for current time.
  `
    )
  },
  [Command.GetUser]: () => {
    throw new Error("Not implemented (yet)!")
  },
  [Command.SearchUsers]: () => {
    throw new Error("Not implemented (yet)!")
  },
}

const safeHandle = async (
  callback: () => ReturnType<HandlerFunction>
): Promise<void> => {
  try {
    await callback()
  } catch (e) {
    log("error", <Error>e)
  }
}

const handleCommand = async (
  command: Command,
  readStream: Interface
): Promise<void> => {
  log("debug", `Calling handler for: ${command}`)

  const callback = (): ReturnType<HandlerFunction> =>
    handlers[command](readStream)

  return safeHandle(callback)
}

export default handleCommand
