import { Interface } from "node:readline/promises"
import { log } from "../../shared/logger"
import { Command } from "./types"
import { getCurrentDbTime } from "../database"

const handlers:
Record<Command, (readStream: Interface) => Promise<void> | void> = {
  [Command.Quit]: (): void => {
    return log("log", "Buh-bye!")
  },
  [Command.Date]: async (): Promise<void> => {
    const currentDate = await getCurrentDbTime()
    
    log("log", currentDate.toISOString())
  },
  [Command.Help]: () => {
    return log("log", `
    ${Command.SearchUsers}: searches the database and displays results;
    ${Command.GetUser}: fetch (and caches) information for a user;
    ${Command.Quit}: exits this CLI;
    ${Command.Help}: shows usage;
    ${Command.Date}: tests database connection and queries for current time.
  `)
  },
  [Command.GetUser]: () => {
    throw new Error("Not implemented (yet)!")
  },
  [Command.SearchUsers]: () => {
    throw new Error("Not implemented (yet)!")
  }
}

const handleCommand =
 async (command: Command, readStream: Interface): Promise<void> => {
   log("debug", `Calling handler for: ${command}`)
   return handlers[command](readStream)
 }

export default handleCommand
