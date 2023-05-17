import { Knex } from 'knex'

declare module "knex/types/tables" {
    export interface Table {
        user: {
            id: string,
            name: string,
            email: string,
            created_at: string
        }
        diet: {
            id: string,
            name: string,
            description: string,
            userId: string,
            isPartOfDiet: boolean,
            created_at: string,
            date: string,
            time: string,
        }
    }
}