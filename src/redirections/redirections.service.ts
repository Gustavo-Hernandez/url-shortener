import { Knex } from 'knex';
import * as shortUniqueId from 'short-unique-id';
import * as moment from 'moment';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const uidGen = new shortUniqueId({ length: 6 });
    let slug = uidGen.rnd();

    while (await this.knex('redirections').where({ slug }).first()) {
      slug = uidGen.rnd();
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

    if (!dto.url.includes('http://') && !dto.url.includes('https://')) {
      const error = new BadRequestException('Invalid URL, must include http:// or https://');
      error.name = 'InvalidUrl';
      throw error;
    }

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

  /**
   * Retrieves a redirection by slug
   * @param {string} slug
   * @returns {Promise<any>}
   */
  async getRedirectionBySlug(slug: string) {
    if (!slug) {
      const error = new BadRequestException('Slug is required');
      error.name = 'MissingSlug';
      throw error;
    }
    const redirection = await this.knex('redirections').where({ slug }).first();
    return redirection;
  }

  /**
   * Tracks a redirection visit
   * @param {string} slug
   * @returns {Promise<void>}
   */
  async trackRedirectionVisit(slug: string) {
    const redirection = await this.getRedirectionBySlug(slug);

    if (!redirection) {
      const error = new NotFoundException('Redirection not found');
      error.name = 'RedirectionNotFound';
      throw error;
    }

    const newVisit = await this.knex('visits').insert({ redirection_id: redirection.id });
    return newVisit;
  }

  /**
   * Redirects to the URL associated with the slug
   * @param {string} slug
   * @returns {Promise<{ url: string }>}
   */
  async redirect(slug: string) {
    const redirection = await this.getRedirectionDetailsBySlug(slug);
    await this.trackRedirectionVisit(slug);
    return { url: redirection.url };
  }

  /**
   * Deletes a redirection by slug
   * @param {string} slug
   * @returns {Promise<any>}
   */
  async deleteRedirectionBySlug(slug: string) {
    const redirection = await this.getRedirectionBySlug(slug);

    if (!redirection) {
      const error = new NotFoundException('Redirection not found');
      error.name = 'RedirectionNotFound';
      throw error;
    }

    await this.knex('redirections').where({ slug }).delete();

    return redirection;
  }
}
