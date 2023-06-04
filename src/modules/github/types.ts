// Only including relevant keys for these API responses
export interface UserApiResponse {
    login: string
    name: string
    location: string | null
    [key: string]: unknown
}

export interface UserRepos {
    full_name: string
    languages_url: string
}

export type UserRepoApiResponse = Array<UserRepos>

export type ProgrammingLanguageApiResponse = Record<string, number>