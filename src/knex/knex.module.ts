import { Module } from '@nestjs/common';
import { KnexService } from './knex.service';

@Module({
  providers: [KnexService],
})
export class KnexModule {}
