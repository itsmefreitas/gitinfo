import { log } from "../../../shared/logger"
import { Command } from "../types"

export const help = (): void => {
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
}
