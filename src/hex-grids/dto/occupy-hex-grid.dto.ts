import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { HEX_GRID_COORDINATE_MAX } from 'src/constants';

export class OccupyHexGridDto {
  @ApiProperty({
    description: '地块的X轴坐标',
    required: true,
    minimum: -HEX_GRID_COORDINATE_MAX,
    maximum: HEX_GRID_COORDINATE_MAX,
  })
  @IsInt()
  @Min(-HEX_GRID_COORDINATE_MAX)
  @Max(HEX_GRID_COORDINATE_MAX)
  @IsNotEmpty()
  x: number;
  @ApiProperty({
    description: '地块的Y轴坐标',
    required: true,
    minimum: -HEX_GRID_COORDINATE_MAX,
    maximum: HEX_GRID_COORDINATE_MAX,
  })
  @IsInt()
  @Min(-HEX_GRID_COORDINATE_MAX)
  @Max(HEX_GRID_COORDINATE_MAX)
  @IsNotEmpty()
  y: number;
  @ApiProperty({
    description: '地块的Z轴坐标',
    required: true,
    minimum: -HEX_GRID_COORDINATE_MAX,
    maximum: HEX_GRID_COORDINATE_MAX,
  })
  @IsInt()
  @Min(-HEX_GRID_COORDINATE_MAX)
  @Max(HEX_GRID_COORDINATE_MAX)
  @IsNotEmpty()
  z: number;
}
