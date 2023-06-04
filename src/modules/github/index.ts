import { default as axios } from "axios"
import { User } from "../database/types"
import {
  ProgrammingLanguageApiResponse,
  UserApiResponse,
  UserRepoApiResponse,
} from "./types"
import { log } from "../../shared/logger"

const API_BASE_URL = "https://api.github.com"

export const fetchUserData = async (userName: string): Promise<User> => {
  log("debug", `fetching user data for ${userName} from API`)

  const endpointUrl = `${API_BASE_URL}/users/${userName}`

  const userData = (
    await axios.get<UserApiResponse>(endpointUrl, {
      headers: getAuthorizationHeader(),
    })
  )?.data

  log("debug", userData)

  return {
    userName: userData.login,
    name: userData.name,
    location: userData.location,
    fullUserData: userData,
    languages: await getUserProgrammingLanguages(userData.login),
  }
}

/**
 * Retrieves authorization header content,
 * based on .env username and password optionals
 */
const getAuthorizationHeader = (): { Authorization: undefined | string } => {
  if (process.env.GITHUB_PAT) {
    return { Authorization: `Bearer ${process.env.GITHUB_PAT}` }
  }

  if (process.env.GITHUB_USERNAME && process.env.GITHUB_PASSWORD) {
    const basicAuth = `${process.env.GITHUB_USR}:${process.env.GITHUB_PWD}`
    const base64Creds = Buffer.from(basicAuth).toString("base64")

    return { Authorization: `Basic ${base64Creds}` }
  }

  return { Authorization: undefined }
}

const getUserProgrammingLanguages = async (
  userName: string
): Promise<Array<string>> => {
  const userRepos = await getUserRepos(userName)

  const languageCalls = userRepos.map(({ languages_url }) =>
    getLanguage(languages_url)
  )
  const languageLists = await Promise.all(languageCalls)

  return [...new Set(languageLists.flat())]
}

const getLanguage = async (url: string): Promise<Array<string>> => {
  log("debug", `fetching language details for repo ${url}`)

  const languagesData = (
    await axios.get<ProgrammingLanguageApiResponse>(url, {
      headers: getAuthorizationHeader(),
    })
  )?.data
  log("debug", languagesData)

  return Object.keys(languagesData ?? {})
}

const getUserRepos = async (userName: string): Promise<UserRepoApiResponse> => {
  log("debug", `fetching user repos for ${userName} from API`)
  const endpointUrl = `${API_BASE_URL}/users/${userName}/repos`

  console.log(endpointUrl)

  const repos = (
    await axios.get<UserRepoApiResponse>(endpointUrl, {
      headers: getAuthorizationHeader(),
    })
  )?.data
  log("debug", repos)

  return repos
}
