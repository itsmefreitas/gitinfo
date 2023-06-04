import { IDatabase, default as loadPg } from "pg-promise"
import { default as queries } from "./queries"
import {
  GetNow,
  GetUserByUserName,
  GetUsers,
  DBConfigMap,
  DBContext,
  envNames,
  InsertUser,
} from "./types"
import { log } from "../../shared/logger"

const pgPromiseSymbol = loadPg()

const Database = ((): DBContext => {
  let _client: IDatabase<unknown> | null = null

  const getConfig = (): Parameters<typeof pgPromiseSymbol>["0"] => {
    // Get config values from process.env
    const configMap: DBConfigMap = envNames.reduce(
      (acc: DBConfigMap, paramName: string) =>
        Object.assign(acc, { [paramName]: process.env[paramName] }),
      {} as DBConfigMap
    )

    if (Object.values(configMap).some((value) => !value)) {
      throw new Error(
        `something went wrong while reading DB config: ${configMap}`
      )
    }

    log("debug", `db config is: ${JSON.stringify(configMap)}`)

    return {
      host: configMap.POSTGRES_HOST,
      port: Number(configMap.POSTGRES_PORT),
      database: configMap.POSTGRES_DATABASE,
      user: configMap.POSTGRES_USER,
      password: configMap.POSTGRES_PASSWORD,
    }
  }

  return {
    instance: (): ReturnType<DBContext["instance"]> => {
      // If we do not yet have a client, instance it
      if (!_client) {
        log("debug", "initializing db client")

        const config = getConfig()

        _client = pgPromiseSymbol(config)
      }

      // Return the existing or newly instanced client.
      return _client
    },
    close: async (): Promise<void> => {
      log("debug", "terminating db connection")

      await _client?.$pool?.end()
    },
  }
})()

/**
 * Neecessary to be made available inter-module
 * so that quit command can close it.
 */
export const closeConnection = async (): Promise<void> => Database.close()

export const getCurrentDbTime = async (): Promise<Date> => {
  const connection = Database.instance()

  const query = queries.getNow

  log("debug", `running ${query}`)

  const date = await connection.one<GetNow["result"]>(query)
  return date.currentTime
}

export const getUsers = async (
  params: GetUsers["params"]
): Promise<Array<GetUsers["result"]>> => {
  log("debug", params)

  const connection = Database.instance()

  // The core query for selecting users
  let query = queries.getUsers

  // String for where clauses
  const clauses: Array<string> = []

  //
  if (params?.languages?.length) {
    clauses.push("lang.slug_array @> slugify_array(${languages})")
  }

  if (params?.location) {
    clauses.push("loc.name ILIKE '%${location:value}%'")
  }

  if (clauses.length) {
    query += "\n WHERE "
    query += clauses.map((clause) => `(${clause})`).join(" AND ")
  }

  log("debug", `running ${query}`)

  return connection.manyOrNone<GetUsers["result"]>(query, params)
}

/**
 * Permissively gets user by username from the database
 * using LOWER() on the WHERE clause
 * this should cover edge cases
 * like https://api.github.com/users/a yielding "login": "A"
 * as the API urls are case-insensitive but the saved strings are not
 * @param params 
 * @returns 
 */
export const getUserByUserName = async (
  params: GetUserByUserName["params"]
): Promise<GetUserByUserName["result"]> => {
  const connection = Database.instance()

  const query = queries.getUserById

  log("debug", `running ${query}`)

  return connection.oneOrNone<GetUserByUserName["result"]>(query, params)
}

export const insertUser = async (
  params: InsertUser["params"]
): Promise<InsertUser["result"]> => {
  const connection = Database.instance()

  const query = queries.insertUser

  log("debug", `running ${query}`)

  return connection.oneOrNone<InsertUser["result"]>(query, params)
}
