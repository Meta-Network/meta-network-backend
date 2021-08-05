import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneBySubdomainDto {
  @ApiProperty({
    description: '系统分配的子域名',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  subdomain: string;
}
