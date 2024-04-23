import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { RedirectionsService } from './redirections.service';
import { CreateRedirectionDto } from './dto/create-redirection.dto';

@Controller('/')
export class RedirectionsController {
  constructor(private readonly redirectionsService: RedirectionsService) {}

  @Get('/details/:slug')
  async getRedirectionDetailsBySlug(@Param('slug') slug: string) {
    return this.redirectionsService.getRedirectionDetailsBySlug(slug);
  }

  @Post()
  async createRedirection(@Body() dto: CreateRedirectionDto) {
    return this.redirectionsService.createRedirection(dto);
  }
}
