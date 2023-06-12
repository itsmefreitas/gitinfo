import {
  randCity,
  randCountry,
  randFullName,
  randGitBranch,
  randNumber,
  randProgrammingLanguage,
  randUrl,
  randUserName,
} from "@ngneat/falso"
import { default as axios } from "axios"
import { User } from "../database/types"
import { API_BASE_URL, fetchUserData } from "./index"
import {
  ProgrammingLanguageApiResponse,
  UserApiResponse,
  UserRepoApiResponse,
} from "./types"

jest.mock("axios")

describe("GitHub", () => {
  it("can fetch user data", async () => {
    const userName = randUserName()

    const userDataMock: UserApiResponse = {
      location: `${randCity()}, ${randCountry()}`,
      login: userName,
      name: randFullName(),
    }

    // Mocking no repos on purpose
    const getUserReposMock: UserRepoApiResponse = []

    const getSpy = jest.spyOn(axios, "get")

    getSpy.mockResolvedValueOnce({ data: userDataMock })
    getSpy.mockResolvedValueOnce({ data: getUserReposMock })

    await fetchUserData(userName)

    const profile_url = `${API_BASE_URL}/users/${userName}`

    expect(getSpy).toBeCalledWith(profile_url, {
      headers: { Authorization: undefined },
    })

    const reposUrl = `${API_BASE_URL}/users/${userName}/repos`

    expect(getSpy).toBeCalledWith(reposUrl, {
      headers: { Authorization: undefined },
    })
  })

  it("can fetch user with languages data", async () => {
    const userName = randUserName()

    const userDataMock: UserApiResponse = {
      location: `${randCity()}, ${randCountry()}`,
      login: randUserName(),
      name: randFullName(),
    }

    // Mocking no repos on purpose
    const getUserReposMock: UserRepoApiResponse = [
      {
        full_name: randGitBranch(),
        languages_url: randUrl(),
      },
    ]

    const getLanguagesForRepoMock: ProgrammingLanguageApiResponse = {
      [randProgrammingLanguage()]: randNumber(),
      [randProgrammingLanguage()]: randNumber(),
    }

    const getSpy = jest.spyOn(axios, "get")

    getSpy.mockResolvedValueOnce({ data: userDataMock })
    getSpy.mockResolvedValueOnce({ data: getUserReposMock })
    getSpy.mockResolvedValueOnce({ data: getLanguagesForRepoMock })

    await fetchUserData(userName)

    const languagesUrl = getUserReposMock[0].languages_url

    // Whatever languages url we make an axios call with it
    expect(getSpy).toBeCalledWith(languagesUrl, {
      headers: { Authorization: undefined },
    })
  })

  it("will not call user repos when fetching data fails", async () => {
    const userName = randUserName()

    const userDataMock = {
      message: "Not Found",
      documentation_url:
        "https://docs.github.com/rest/reference/users#get-a-user",
    }

    const getSpy = jest.spyOn(axios, "get")

    getSpy.mockRejectedValueOnce(new Error(JSON.stringify(userDataMock)))

    const call = async (): Promise<User> => fetchUserData(userName)
    await expect(call).rejects.toThrow()

    const profile_url = `${API_BASE_URL}/users/${userName}`

    expect(getSpy).toBeCalledWith(profile_url, {
      headers: { Authorization: undefined },
    })

    const reposUrl = `${API_BASE_URL}/users/${userName}/repos`

    // Won't call repo when stuff borks
    expect(getSpy).not.toBeCalledWith(reposUrl, {
      headers: { Authorization: undefined },
    })
  })
})
