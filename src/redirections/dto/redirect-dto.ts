import { IsIP, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class RedirectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(16)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.userAgent)
  userAgent?: string;

  @IsString()
  @IsIP()
  requestIp?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.language)
  language?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.platform)
  platform?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.browser)
  browser?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.device)
  device?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.os)
  os?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.country)
  country?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.region)
  region?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.city)
  city?: string;
}
