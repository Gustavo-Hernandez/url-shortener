import { Knex } from 'knex';

import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';

@Injectable()
export class KnexService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  /**
   * Resets the database by deleting all tables
   * @returns {Promise<void>}
   * @private
   */
  async resetDatabase() {
    await this.knex.raw('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await this.knex.migrate.latest();
  }
}
