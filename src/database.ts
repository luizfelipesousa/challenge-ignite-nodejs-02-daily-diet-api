import { knex, Knex } from "knex";
import { env } from "./env";

export const databaseConfig: Knex.Config = {
    client: env.DATABASE_CLIENT,
    useNullAsDefault: true,
    connection: {
        filename: env.DATABASE_URL
    },
    migrations: {
        directory: './db/migrations',
        extension: 'ts'
    }
}

export const database = knex(databaseConfig);