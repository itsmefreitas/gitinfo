import { config as readEnvs } from "dotenv"
import { default as interpretCommands } from "./modules/cli"
import { log } from "./shared/logger"
import { default as session } from "./shared/sessionConfig"

const main = async (): Promise<void> => {

  // read vars from .env, adding to process.env
  readEnvs()

  // Set session variables
  session.debug = process.env.DEBUG === "TRUE"
  session.dryRun = process.env.DRY_RUN === "TRUE"

  log("debug", `Session configuration: ${JSON.stringify(session)}`)

  return interpretCommands()
}

main()
