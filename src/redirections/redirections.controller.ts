import * as express from 'express';
import * as uaParser from 'ua-parser-js';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';

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
  async redirect(@Res() res: express.Response, @Req() req: express.Request, @Param('slug') slug: string) {
    const userAgent = req.headers['user-agent'];
    let requestIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const language = req.headers['accept-language'];

    // Parse user agent
    const uaResult = uaParser(userAgent);
    const os = uaResult?.os?.version;
    const platform = uaResult?.os?.name;
    const browser = uaResult?.browser?.name;
    const device = uaResult?.device?.type;

    // If X-Forwarded-For header contains multiple IPs, extract the first one
    if (requestIp && Array.isArray(requestIp)) {
      requestIp = requestIp[0].trim();
    }

    // Get location details
    let ipInfo = {};
    if (requestIp && requestIp !== '::1') {
      try {
        const ipInfoResponse = await fetch(`https://ipinfo.io/${requestIp}/json`);
        const ipInfoData = await ipInfoResponse.json();
        const { country, region, city } = ipInfoData;

        ipInfo = { country, region, city };
      } catch (error) {
        console.warn(`Error fetching IP:${requestIp} info`, error);
      }
    }

    try {
      const { url } = await this.redirectionsService.redirect({
        slug,
        userAgent,
        requestIp,
        language,
        platform,
        browser,
        device,
        os,
        ...ipInfo,
      });
      return res.redirect(302, url);
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
