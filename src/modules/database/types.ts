import { IDatabase } from "pg-promise"

export type DBContext<T = unknown> = {
  instance(): IDatabase<T>;
  close(): Promise<void>;
};

type EnvKeyLiterals =
  | "POSTGRES_HOST"
  | "POSTGRES_PORT"
  | "POSTGRES_DATABASE"
  | "POSTGRES_USER"
  | "POSTGRES_PASSWORD";

// Make this readonly
export const envNames = [
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_DATABASE",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
] as const

export type DBConfigMap = {
  [Key in EnvKeyLiterals]: string | undefined;
};

interface IBaseQuery {
  params: unknown;
  result: unknown;
}

export interface GetNow extends IBaseQuery {
  params: never;
  result: {
    currentTime: Date;
  };
}

export interface GetUsers extends IBaseQuery {
  params: Partial<Pick<User, "location" | "languages">>;
  result: User;
}

export interface GetUserByUserName extends IBaseQuery {
  params: Partial<Pick<User, "userName">>;
  result: User | null;
}

export interface InsertUser extends IBaseQuery {
    params: { userData: User };
    result: string | null;
  }

export interface User {
  userName: string;
  name: string | null;
  location: string | null;
  languages: Array<string>;
  fullUserData: Record<string, unknown>;
}
