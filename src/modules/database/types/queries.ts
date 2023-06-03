interface IBaseQuery {
  params?: unknown
  result?: unknown
}

export interface IGetNow extends IBaseQuery {
  params: never
  currentTime: Date
}
