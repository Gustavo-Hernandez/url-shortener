import * as pactum from 'pactum';

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from './../src/app.module';
import { KnexService } from '../src/knex/knex.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let knexService: KnexService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [KnexService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    knexService = moduleRef.get<KnexService>(KnexService);
    await knexService.resetDatabase();

    await pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Redirections', () => {
    it('should not exist any redirection', async () => {
      const redirections = await knexService.getKnex().select().from('redirections');
      const visits = await knexService.getKnex().select().from('visits');
      expect(redirections).toHaveLength(0);
      expect(visits).toHaveLength(0);
    });

    it('should create a redirection', async () => {
      const res = await pactum
        .spec()
        .post('/create')
        .withBody({
          url: 'https://nestjs.com',
        })
        .expectStatus(201)
        .expectJsonSchema({
          type: 'object',
          properties: {
            slug: { type: 'string' },
          },
          required: ['slug'],
          additionalProperties: false,
        })
        .stores('slug', 'slug');

      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(1);

      return res;
    });

    it('should not create a redirection with invalid URL', async () => {
      const res = await pactum
        .spec()
        .post('/create')
        .withBody({
          url: 'nestjs.com',
        })
        .expectStatus(400)
        .expectJson({
          statusCode: 400,
          message: 'Invalid URL, must include http:// or https://',
          error: 'Bad Request',
        });

      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(1);

      return res;
    });

    it('should redirect', async () => {
      const res = await pactum
        .spec()
        .get('/{slug}')
        .withPathParams('slug', '$S{slug}')
        .expectStatus(302)
        .expectHeader('location', 'https://nestjs.com');

      const visits = await knexService.getKnex().select().from('visits');
      expect(visits).toHaveLength(1);

      return res;
    });

    it('should get redirection details', async () => {
      return pactum
        .spec()
        .get('/details/{slug}')
        .withPathParams('slug', '$S{slug}')
        .expectStatus(200)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
            expiration_date: { type: 'string' },
            slug: { type: 'string' },
            url: { type: 'string' },
            source: { type: 'string' },
            visits_count: { type: 'string' },
            last_visited_at: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  createdAt: { type: 'string' },
                  userAgent: { type: ['string', 'null'] },
                  language: { type: ['string', 'null'] },
                  platform: { type: ['string', 'null'] },
                  browser: { type: ['string', 'null'] },
                  device: { type: ['string', 'null'] },
                  os: { type: ['string', 'null'] },
                  ip: { type: ['string', 'null'] },
                  country: { type: ['string', 'null'] },
                  region: { type: ['string', 'null'] },
                  city: { type: ['string', 'null'] },
                },
                required: ['id', 'createdAt'],
              },
            },
          },
          required: [
            'id',
            'slug',
            'url',
            'source',
            'expiration_date',
            'created_at',
            'updated_at',
            'visits_count',
            'last_visited_at',
          ],
          additionalProperties: false,
        })
        .expectJson('visits_count', '1')
        .expectJson('url', 'https://nestjs.com');
    });

    it('should not get redirection details for invalid slug', async () => {
      return pactum.spec().get('/details/invalid-slug').expectStatus(404).expectJson({
        statusCode: 404,
        message: 'Redirection not found',
        error: 'Not Found',
      });
    });

    it('should update a redirection', async () => {
      const res = await pactum
        .spec()
        .put('/{slug}')
        .withPathParams('slug', '$S{slug}')
        .withBody({
          url: 'https://nestjs.io',
        })
        .expectStatus(200)
        .expectJsonSchema({
          type: 'object',
          properties: {
            slug: { type: 'string' },
          },
          required: ['slug'],
        });

      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(1);

      return res;
    });

    it('should not update a redirection with invalid URL', async () => {
      const res = await pactum
        .spec()
        .put('/{slug}')
        .withPathParams('slug', '$S{slug}')
        .withBody({
          url: 'nestjs.io',
        })
        .expectStatus(400)
        .expectJson({
          statusCode: 400,
          message: 'Invalid URL, must include http:// or https://',
          error: 'Bad Request',
        });

      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(1);

      return res;
    });

    it('should not update a redirection that does not exist', async () => {
      const res = await pactum
        .spec()
        .put('/invalid-slug')
        .withBody({
          url: 'https://nestjs.io',
        })
        .expectStatus(404)
        .expectJson({
          statusCode: 404,
          message: 'Redirection not found',
          error: 'Not Found',
        });

      return res;
    });

    it('should delete a redirection', async () => {
      const existingRedirections = await knexService.getKnex().select().from('redirections');
      expect(existingRedirections).toHaveLength(1);

      const res = await pactum.spec().delete('/{slug}').withPathParams('slug', '$S{slug}').expectStatus(200);
      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(0);

      return res;
    });

    it('should not delete a redirection that does not exist', async () => {
      return pactum.spec().delete('/invalid-slug').expectStatus(404).expectJson({
        statusCode: 404,
        message: 'Redirection not found',
        error: 'Not Found',
      });
    });

    it('should allow to create a redirection with custom slug', async () => {
      const res = await pactum
        .spec()
        .post('/create')
        .withBody({
          url: 'https://nestjs.com',
          customSlug: 'custom-slug',
        })
        .expectStatus(201)
        .expectJsonSchema({
          type: 'object',
          properties: {
            slug: { type: 'string' },
          },
          required: ['slug'],
          additionalProperties: false,
        })
        .stores('slug', 'slug');

      const redirections = await knexService.getKnex().select().from('redirections');
      expect(redirections).toHaveLength(1);

      return res;
    });
  });

  it('should not allow to create a redirection with custom slug with less than 3 characters', async () => {
    const res = await pactum
      .spec()
      .post('/create')
      .withBody({
        url: 'https://nestjs.com',
        customSlug: 'a',
      })
      .expectStatus(400)
      .expectJson({
        statusCode: 400,
        message: ['customSlug must be longer than or equal to 3 characters'],
        error: 'Bad Request',
      });

    const redirections = await knexService.getKnex().select().from('redirections');
    expect(redirections).toHaveLength(1);

    return res;
  });

  it('should not allow to create a redirection with custom slug with more than 16 characters', async () => {
    const res = await pactum
      .spec()
      .post('/create')
      .withBody({
        url: 'https://nestjs.com',
        customSlug: 'a'.repeat(17),
      })
      .expectStatus(400)
      .expectJson({
        statusCode: 400,
        message: ['customSlug must be shorter than or equal to 16 characters'],
        error: 'Bad Request',
      });

    const redirections = await knexService.getKnex().select().from('redirections');
    expect(redirections).toHaveLength(1);

    return res;
  });

  it('should not allow to create a redirection with custom slug that already exists', async () => {
    const res = await pactum
      .spec()
      .post('/create')
      .withBody({
        url: 'https://nestjs.com',
        customSlug: 'custom-slug',
      })
      .expectStatus(400)
      .expectJson({
        statusCode: 400,
        message: 'Slug already exists',
        error: 'Bad Request',
      });

    const redirections = await knexService.getKnex().select().from('redirections');
    expect(redirections).toHaveLength(1);

    return res;
  });
});
