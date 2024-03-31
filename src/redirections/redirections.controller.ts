import { Controller, Get } from '@nestjs/common';

@Controller('redirections')
export class RedirectionsController {
  @Get('/')
  getRedirections() {
    return 'Test successful';
  }
}
