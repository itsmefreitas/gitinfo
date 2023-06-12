import { Interface } from "node:readline/promises"
import { log } from "../../shared/logger"
import { date, getUser, help, quit, searchUsers } from "./commands"
import { Command, HandlerFunction, HandlerMap } from "./types"
import { AxiosError } from "axios"

const handlers: HandlerMap = {
  [Command.Quit]: quit,
  [Command.Date]: date,
  [Command.Help]: help,
  [Command.GetUser]: getUser,
  [Command.SearchUsers]: searchUsers
}

/**
 * Wraps command handler in a logger
 * so that errors are shown
 * and app does not crash
 * on account of unhandled promises
 * @param callback 
 */
const safeHandle = async (
  callback: () => ReturnType<HandlerFunction>
): Promise<void> => {
  try {
    await callback()
  } catch (e) {
    if (e instanceof AxiosError) {
      /**
       * So we do not fill up the screen with
       * ALL the req/res data.
       */
      return log("error", e.response?.data)
    }

    return log("error", <Error>e)
  }
}

/**
 * Prompts user for a command type
 * and dispatches it to the appropriate handler
 * @param command 
 * @param readStream 
 * @returns 
 */
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
