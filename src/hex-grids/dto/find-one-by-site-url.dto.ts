import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FindOneBySiteUrlDto {
  @ApiProperty({
    description: 'MetaSpace绑定的域名',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  site_url: string;
}
