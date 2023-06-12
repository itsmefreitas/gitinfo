import { randProgrammingLanguage } from "@ngneat/falso"
import { Interface } from "node:readline/promises"
import { log } from "../../../shared/logger"
import { getUsers } from "../../database"

export const searchUsers = async (readStream: Interface): Promise<void> => {
  const locationInput: string = (
    await readStream.question("Location?: ")
  ).trim()

  const exampleLanguages = [
    randProgrammingLanguage(),
    randProgrammingLanguage(),
  ].join(", ")

  const languagesInput: Array<string> = (
    await readStream.question(`Languages (e.g.: ${exampleLanguages})?: `)
  )
    .split(",")
    .map((lang) => lang.trim().toLowerCase())
    .filter((lang) => !!lang)

  const users = await getUsers({
    ...(!!locationInput && { location: locationInput }),
    ...(languagesInput?.length && { languages: languagesInput }),
  })

  log("log", "")
  log("log", "************ Users ****************")
  log("dir", users)
  log("log", "***********************************")
}
