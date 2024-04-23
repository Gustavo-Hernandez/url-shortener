import { Knex } from 'knex';
import * as shortUUID from 'short-uuid';
import * as moment from 'moment';

import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';

import { CreateRedirectionDto } from './dto/create-redirection.dto';

@Injectable()
export class RedirectionsService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  /**
   * Generates a unique slug for a redirection
   * @returns {Promise<string>} The generated slug
   * @private
   */
  private async generateSlug() {
    let slug = shortUUID.generate();
    while (await this.knex('redirections').where({ slug }).first()) {
      slug = shortUUID.generate();
    }
    return slug;
  }

  /**
   * Creates a redirection
   * @param {CreateRedirectionDto} dto
   * @returns
   */
  async createRedirection(dto: CreateRedirectionDto) {
    const expirationDate = moment().startOf('day').add(30, 'days').toISOString();
    const slug = await this.generateSlug();

    const [redirection] = await this.knex('redirections')
      .insert({
        ...dto,
        slug,
        expiration_date: expirationDate,
      })
      .returning('slug');

    return redirection;
  }

  /**
   * Retrieves a redirection by slug
   * @param {string} slug
   * @returns {Promise<any>}
   */
  async getRedirectionDetailsBySlug(slug: string) {
    let redirection = await this.knex('redirections').where({ slug }).first();

    if (!redirection) {
      const error = new Error('Redirection not found');
      error.name = 'RedirectionNotFound';
      throw error;
    }

    const isRedirectionExpired = moment().isAfter(redirection.expiration_date);

    if (isRedirectionExpired) {
      const error = new Error('Redirection expired');
      error.name = 'RedirectionExpired';
      throw error;
    }

    await this.knex('visits').insert({ redirection_id: redirection.id });

    redirection = await this.knex('redirections')
      .first([
        'redirections.*',
        this.knex.raw('(SELECT COUNT(*) FROM visits WHERE visits.redirection_id = redirections.id) as visits_count'),
        this.knex.raw(
          '(SELECT MAX(created_at) FROM visits WHERE visits.redirection_id = redirections.id) as last_visited_at',
        ),
      ])
      .where({ slug });

    return redirection;
  }
}
