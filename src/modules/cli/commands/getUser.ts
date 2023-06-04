import { Interface } from "node:readline/promises"
import { getUserByUserName, insertUser } from "../../database"
import { log } from "../../../shared/logger"
import { default as session } from "../../../shared/sessionConfig"
import { fetchUserData } from "../../github"

export const getUser = async (readStream: Interface): Promise<void> => {
  const nameInput: string = (await readStream.question("UserName: ")).trim()

  let user = await getUserByUserName({ userName: nameInput })

  if (!session.dryRun && !user) {
    const userData = await fetchUserData(nameInput)

    // ADD INSERT USER HERE
    await insertUser({ userData })

    user = await getUserByUserName({
      userName: userData.userName ?? nameInput,
    })
  }

  log("log", "")
  log("log", "************ User ****************")
  log("dir", user)
  log("log", "***********************************")
}
