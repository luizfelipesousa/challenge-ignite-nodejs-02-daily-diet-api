import { table } from "console";
import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('diet', (table) => {
        table.uuid('id').primary();
        table.text('userId').references('users.id').notNullable();
        table.text('name').notNullable();
        table.text('description').notNullable();
        table.boolean('isPartOfDiet').notNullable().defaultTo(false);
        table.date('date').notNullable();
        table.time('time').notNullable();
        table.datetime('created_at').defaultTo(knex.fn.now());
        table.datetime('updated_at');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('diet');
}

