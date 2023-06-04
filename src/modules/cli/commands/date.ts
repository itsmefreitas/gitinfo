import { log } from "../../../shared/logger"
import { getCurrentDbTime } from "../../database"

export const date = async (): Promise<void> => {
  const currentDate = await getCurrentDbTime()

  log("log", currentDate.toISOString())
}
