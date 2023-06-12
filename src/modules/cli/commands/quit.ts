import { log } from "../../../shared/logger"
import { closeConnection } from "../../database"

export const quit = async (): Promise<void> => {
  await closeConnection()

  log("log", "")
  log("log", "Buh-bye!")
}
