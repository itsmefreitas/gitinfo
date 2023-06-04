import { IDatabase, default as loadPg } from "pg-promise"
import { getNow } from "./queries.json"
import { DBConfigMap, DBContext, envNames } from "./types/db"
import { IGetNow } from "./types/queries"
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
    }
  }
})()

export const getCurrentDbTime = async (): Promise<Date> => {
  const instance = Database.instance()

  const date = await instance.one<IGetNow["result"]>(getNow)
  return date.currentTime
}

export const closeConnection = async (): Promise<void> => Database.close()