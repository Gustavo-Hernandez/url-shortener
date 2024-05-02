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
    it('should create a redirection', async () => {
      return pactum
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
    });

    it('should not create a redirection with invalid URL', async () => {
      return pactum
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

    it('should redirect', async () => {
      const response = pactum
        .spec()
        .get('/{slug}')
        .withPathParams('slug', '$S{slug}')
        .expectStatus(301)
        .expectHeader('location', 'https://nestjs.com');

      const visits = await knexService.getKnex().select().from('visits');
      expect(visits).toHaveLength(1);

      return response;
    });
  });
});
