# gitinfo
A Node CLI for storing and fetching GitHub user profile information.

## Dependencies
- [NodeJS](https://nodejs.org/en) v18.16.0 (latest LTS as of June 3rd 2023);
- [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm);
- [PostgreSQL](https://www.postgresql.org/download/) or [Docker](https://docs.docker.com/get-docker/).

## Getting up and running

Assuming you have verified all dependencies are installed,
we can get up and running:

1. Copy the `.example.env` to `.env` with `cp .example.env .env` and edit the variable values you may see fit;
2. Select the recommended node version for this project with `nvm use`;
3. Install dependencies by running `npm i`;

## Starting the application

1. Spin up your database with `npm run db:up`;
2. (Optinally) confirm it is running with `npm run db:logs`;
3. Start the application with `npm run start`.

## Features

- `getUser` will retrieve cached users if they are available in the DB or, alternatively and when process.env's `DRY_RUN=FALSE` (the `sessionConfig`'s `dryRun` property implicitly evaluates to false) will query the GitHub API for their data, inserting it into the DB;

- `searchUsers` supports an (optional) comma-separated list of `(Programming) Languages` and (optional) `Location` parameter and will `AND` all statements to fetch the distinct users, complete with their language + location data.

## Considerations

- Querying usernames is done in a case-insensitive fashion, as some GitHub API endpoints are also case-insensitive, e.g. querying `https://api.github.com/users/a` will yield a user where `{ "login": "A" }`;

- Despite us tacking language data along to the core user object for the response from the `GitHub` module, this is not saved in the "flat" `full_user_data_json` since they are derived fields from other API calls;

- User insertion is treated as an atomic procedure, where if something goes wrong crossing/inserting child entity data, the data layer should rollback the insertion attempt as it is done through `insert_user_data` in PSQL.

# Contribute

If you wish to expand this CLI's functionality by writing additional commands, do not hesitate to do so, by adding keys to the `Command` enum and defining a new handler module within `src/modules/cli/commands`, making sure to export it in the same folder's index file and editing `handleCommand`'s `HandlerMap` to include it.