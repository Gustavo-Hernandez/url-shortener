import * as express from 'express';
import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';

import { RedirectionsService } from './redirections.service';
import { CreateRedirectionDto } from './dto/create-redirection.dto';

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
  async createRedirection(@Body() dto: CreateRedirectionDto) {
    return this.redirectionsService.createRedirection(dto);
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

  @Delete('/:slug')
  async deleteRedirection(@Param('slug') slug: string) {
    const deletedRedirection = await this.redirectionsService.deleteRedirectionBySlug(slug);
    return deletedRedirection;
  }

  @Put('/:slug')
  async updateRedirection(@Param('slug') slug: string, @Body() dto: { url: string }) {
    const updatedRedirection = await this.redirectionsService.updateRedirectionBySlug(slug, dto);
    return updatedRedirection;
  }
}
