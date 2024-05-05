/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table('visits', (t) => {
    t.string('user_agent').nullable();
    t.string('language').nullable();
    t.string('platform').nullable();
    t.string('browser').nullable();
    t.string('device').nullable();
    t.string('os').nullable();
    t.string('ip').nullable();
    t.string('country').nullable();
    t.string('region').nullable();
    t.string('city').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table('visits', (t) => {
    t.dropColumn('user_agent');
    t.dropColumn('language');
    t.dropColumn('platform');
    t.dropColumn('browser');
    t.dropColumn('device');
    t.dropColumn('os');
    t.dropColumn('ip');
    t.dropColumn('country');
    t.dropColumn('region');
    t.dropColumn('city');
  });
};
