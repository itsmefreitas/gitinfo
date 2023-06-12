import { default as session } from "./sessionConfig"

export type LogginFnType = keyof Pick<
  Console,
  "log" | "error" | "dir" | "debug"
>;

export const log = (
  logLevel: LogginFnType,
  message: string | unknown | Error
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
