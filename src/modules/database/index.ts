import { IDatabase, default as loadPg } from "pg-promise"
import { getNow } from "./queries.json"
import { DBConfigMap, DBContext, envNames } from "./types/db"
import { IGetNow } from "./types/queries"

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

    return {
      host: configMap.POSTGRES_HOST,
      port: Number(configMap.POSTGRES_PORT),
      database: configMap.POSTGRES_DB,
      user: configMap.POSTGRES_USER,
      password: configMap.POSTGRES_PASSWORD,
    }
  }

  return {
    instance: (): ReturnType<DBContext["instance"]> => {
      // If we do not yet have a client, instance it
      if (!_client) {
        const config = getConfig()

        _client = pgPromiseSymbol(config)
      }

      // Return the existing or newly instanced client.
      return _client
    },
  }
})()

export const getCurrentDbTime = async (): Promise<Date> => {
  const instance = Database.instance()

  const date = await instance.one<IGetNow>(getNow)
  return date.currentTime
}
