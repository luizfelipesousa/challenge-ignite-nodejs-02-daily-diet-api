import { table } from "console";
import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('email').notNullable();
        table.datetime('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}

