import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { RedirectionsModule } from './redirections/redirections.module';

import { KnexModule } from 'nest-knexjs';
import { KNEX_DB_CONFIG } from './knex/knex.constants';

@Module({
  imports: [
    RedirectionsModule,
    KnexModule.forRoot({
      config: KNEX_DB_CONFIG,
    }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
