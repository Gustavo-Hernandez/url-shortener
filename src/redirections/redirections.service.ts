import { Knex } from 'knex';
import * as shortUniqueId from 'short-unique-id';
import * as moment from 'moment';
import { InjectConnection } from 'nest-knexjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { REDIRECTION_SOURCE_TYPE_API } from './redirections.constants';

import { CreateRedirectionDto } from './dto/create-redirection.dto';
import { RedirectDto } from './dto/redirect-dto';

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
    let slug = '';

    if (dto.customSlug) {
      const existingRedirection = await this.knex('redirections').where({ slug: dto.customSlug }).first();

      if (existingRedirection) {
        const error = new BadRequestException('Slug already exists');
        error.name = 'SlugAlreadyExists';
        throw error;
      }

      slug = dto.customSlug;
    } else {
      slug = await this.generateSlug();
    }

    if (!dto.url.includes('http://') && !dto.url.includes('https://')) {
      const error = new BadRequestException('Invalid URL, must include http:// or https://');
      error.name = 'InvalidUrl';
      throw error;
    }

    const [redirection] = await this.knex('redirections')
      .insert({
        slug,
        url: dto.url,
        source: dto.source || REDIRECTION_SOURCE_TYPE_API,
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
      const error = new NotFoundException('Redirection not found');
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
  async trackRedirectionVisit(dto: RedirectDto) {
    const redirection = await this.getRedirectionBySlug(dto.slug);

    if (!redirection) {
      const error = new NotFoundException('Redirection not found');
      error.name = 'RedirectionNotFound';
      throw error;
    }

    const visitData = {
      redirection_id: redirection.id,
      user_agent: dto.userAgent,
      ip: dto.requestIp,
      language: dto.language,
      platform: dto.platform,
      browser: dto.browser,
      device: dto.device,
      os: dto.os,
      country: dto.country,
      region: dto.region,
      city: dto.city,
    };

    // Remove undefined values
    const filteredVisitData = Object.fromEntries(Object.entries(visitData).filter(([_, v]) => v !== undefined)); // eslint-disable-line @typescript-eslint/no-unused-vars
    if (!Object.keys(filteredVisitData).length) {
      console.warn(`No visit data to track for redirection ${dto.slug}`);
      return;
    }

    const [newVisit] = await this.knex('visits').insert(filteredVisitData).returning('*');
    return newVisit;
  }

  /**
   * Redirects to the URL associated with the slug
   * @param {string} slug
   * @returns {Promise<{ url: string }>}
   */
  async redirect(dto: RedirectDto) {
    const redirection = await this.getRedirectionDetailsBySlug(dto.slug);
    await this.trackRedirectionVisit(dto);
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

  /**
   * Updates a redirection by slug
   * @param {string} slug
   * @param {CreateRedirectionDto} dto
   * @returns {Promise<any>}
   */
  async updateRedirectionBySlug(slug: string, dto: { url: string }) {
    const redirection = await this.getRedirectionBySlug(slug);

    if (!redirection) {
      const error = new NotFoundException('Redirection not found');
      error.name = 'RedirectionNotFound';
      throw error;
    }

    if (!dto.url.includes('http://') && !dto.url.includes('https://')) {
      const error = new BadRequestException('Invalid URL, must include http:// or https://');
      error.name = 'InvalidUrl';
      throw error;
    }

    await this.knex('redirections').where({ slug }).update(dto);

    return { ...redirection, ...dto };
  }
}
