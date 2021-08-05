import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class FindOneByCoordinateDto {
  @ApiProperty({
    description: '地块的X轴坐标',
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x: number;
  @ApiProperty({
    description: '地块的Y轴坐标',
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  y: number;
  @ApiProperty({
    description: '地块的Z轴坐标',
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z: number;
}
