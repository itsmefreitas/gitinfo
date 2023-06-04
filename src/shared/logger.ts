import { default as session } from "./sessionConfig"

export const log = (
  logLevel: keyof Pick<Console, "log" | "error" | "debug">,
  message: string | Record<string, unknown> | Error
): void => {
  // For all other logs then just log
  if (logLevel !== "debug") {
    return console[logLevel](message)
  }

  // If logLevel is debug and session is set to debug, then log
  if (session.debug) {
    return console[logLevel]("*** DEBUG:", message)
  }
}
