/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('redirections', (t) => {
    t.increments('id').unsigned().primary();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.date('expiration_date').nullable();
    t.string('slug').notNullable();
    t.string('url').notNullable();
    t.string('source').notNullable().defaultTo('system');

    t.unique('slug');

    t.index('slug');
  });

  await knex.schema.createTable('visits', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('redirection_id').unsigned().notNullable();
    t.foreign('redirection_id').references('redirections.id').onDelete('CASCADE').onUpdate('CASCADE');

    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('redirection_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('visits');
  await knex.schema.dropTable('redirections');
};
