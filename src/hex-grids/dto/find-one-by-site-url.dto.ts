import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FindOneBySiteUrlDto {
  @ApiProperty({
    description: 'MetaSpace绑定的URL,包括 protocol, domain, port, path 各部分',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  siteUrl: string;
}
