import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { HEX_GRID_D } from 'src/constants';

export class FindOneByCoordinateDto {
  @ApiProperty({
    description: '地块的X轴坐标',
    required: true,

    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  x: number;
  @ApiProperty({
    description: '地块的Y轴坐标',
    required: true,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  y: number;
  @ApiProperty({
    description: '地块的Z轴坐标',
    required: true,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  z: number;
}
