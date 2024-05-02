import * as express from 'express';
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';

import { RedirectionsService } from './redirections.service';

@Controller('/')
export class RedirectionsController {
  constructor(private readonly redirectionsService: RedirectionsService) {}

  @Get('/hello-world')
  async helloWorld() {
    return 'Hello World!';
  }

  @Get('/details/:slug')
  async getRedirectionDetailsBySlug(@Param('slug') slug: string) {
    return this.redirectionsService.getRedirectionDetailsBySlug(slug);
  }

  @Post('/create')
  async createRedirection(@Body() dto: { url: string }) {
    return this.redirectionsService.createRedirection({ ...dto, source: 'system' });
  }

  @Get('/:slug')
  async redirect(@Res() res: express.Response, @Param('slug') slug: string) {
    try {
      const { url } = await this.redirectionsService.redirect(slug);
      return res.redirect(301, url);
    } catch (error) {
      return res.status(404).send('Not found');
    }
  }
}
