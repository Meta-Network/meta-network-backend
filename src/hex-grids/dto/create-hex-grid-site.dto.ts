import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateHexGridSiteDto {
  @ApiProperty({
    description: '站点名称',
    required: true,
    minLength: 3,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  site_name: string;
}
