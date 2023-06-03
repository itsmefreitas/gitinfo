import { IDatabase } from "pg-promise"

export type DBContext<T = unknown> = {
  instance(): IDatabase<T>
}

type EnvKeyLiterals =
  | "POSTGRES_HOST"
  | "POSTGRES_PORT"
  | "POSTGRES_DB"
  | "POSTGRES_USER"
  | "POSTGRES_PASSWORD"

// Make this readonly
export const envNames = [
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
] as const

export type DBConfigMap = {
  [Key in EnvKeyLiterals]: string | undefined
}
