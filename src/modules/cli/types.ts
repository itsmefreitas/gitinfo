import { Interface } from "node:readline/promises"

export enum Command {
  GetUser = "get-user",
  SearchUsers = "search-users",
  Help = "help",
  Date = "date",
  Quit = "quit",
}

export type HandlerFunction = (readStream: Interface) => Promise<void> | void

export type HandlerMap = Record<Command, HandlerFunction>
