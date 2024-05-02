import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { REDIRECTION_SOURCE_TYPES_LIST } from '../redirections.constants';

export class CreateRedirectionDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @IsIn(REDIRECTION_SOURCE_TYPES_LIST)
  source: string;
}
