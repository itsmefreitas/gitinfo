import {
  randFullName,
  randLocale,
  randProgrammingLanguage,
  randUserName,
  randUuid,
} from "@ngneat/falso"
import * as database from "../../database"
import * as github from "../../github"
import * as log from "../../../shared/logger"
import { GetUserByUserName, User } from "../../database/types"
import { getUser } from "./getUser"
import { Interface } from "node:readline/promises"

jest.mock("../../database")
jest.mock("../../github")

describe("getUser", () => {
  const getDatabaseUserSpy = jest.spyOn(database, "getUserByUserName")
  const insertUserIntoDatabaseSpy = jest.spyOn(database, "insertUser")
  const getApiUserSpy = jest.spyOn(github, "fetchUserData")
  const loggerSpy = jest.spyOn(log, "log")
  it("retrieves the user from the database", async () => {
    const userName = randUserName()

    const dbUserMock: GetUserByUserName["result"] = {
      userName,
      languages: [randProgrammingLanguage(), randProgrammingLanguage()],
      name: randFullName(),
      location: randLocale(),
      // Omitting this for the sake of brevity
      coreUserData: {},
    }

    getDatabaseUserSpy.mockResolvedValueOnce(dbUserMock)

    const getApiUserSpy = jest.spyOn(github, "fetchUserData")

    await getUser({
      question: jest.fn().mockResolvedValueOnce(userName),
    } as unknown as Interface)

    expect(getDatabaseUserSpy).toBeCalledTimes(1)
    expect(getDatabaseUserSpy).toBeCalledWith({ userName })

    expect(getApiUserSpy).not.toBeCalled()
  })

  it("hits the github API when the user is not found on the db", async () => {
    const userName = randUserName()

    const gitUserMock: User = {
      userName: userName,
      languages: [randProgrammingLanguage(), randProgrammingLanguage()],
      name: randFullName(),
      location: randLocale(),
      // Omitting this for the sake of brevity
      coreUserData: {},
    }

    getDatabaseUserSpy.mockResolvedValueOnce(null)
    // Mock second database fetch
    getDatabaseUserSpy.mockResolvedValueOnce(gitUserMock)
    insertUserIntoDatabaseSpy.mockResolvedValueOnce(randUuid())
    getApiUserSpy.mockResolvedValueOnce(gitUserMock)

    await getUser({
      question: jest.fn().mockResolvedValueOnce(userName),
    } as unknown as Interface)

    expect(getDatabaseUserSpy).toBeCalledTimes(2)
    expect(getDatabaseUserSpy).toBeCalledWith({ userName })

    expect(getApiUserSpy).toBeCalledWith(userName)

    expect(insertUserIntoDatabaseSpy).toBeCalledTimes(1)
    expect(insertUserIntoDatabaseSpy).toBeCalledWith(gitUserMock)

    expect(loggerSpy).toBeCalledWith("dir", gitUserMock)
  })
})
