// Extract variables from the .env file

import * as dotenv from 'dotenv';

dotenv.config();

export const KNEX_DB_CONFIG = {
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
};
