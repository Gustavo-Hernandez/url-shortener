import { Module } from '@nestjs/common';
import { RedirectionsController } from './redirections.controller';
import { RedirectionsService } from './redirections.service';

@Module({
  controllers: [RedirectionsController],
  providers: [RedirectionsService],
})
export class RedirectionsModule {}
