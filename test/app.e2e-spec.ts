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
    const createRedirectionDto = {
      url: 'https://nestjs.com',
      source: 'system',
    };

    it('should create a redirection', async () => {
      return pactum
        .spec()
        .post('/')
        .withBody(createRedirectionDto)
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

    it('should get redirection details', async () => {
      return pactum
        .spec()
        .get('/details/{slug}')
        .withPathParams('slug', '$S{slug}')
        .expectStatus(200)
        .inspect()
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
  });
});
