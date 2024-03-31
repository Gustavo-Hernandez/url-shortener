import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { RedirectionsModule } from './redirections/redirections.module';

@Module({
  imports: [RedirectionsModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
