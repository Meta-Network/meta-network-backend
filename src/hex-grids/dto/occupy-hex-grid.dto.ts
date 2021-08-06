import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { HEX_GRID_D } from 'src/constants';

export class OccupyHexGridDto {
  @ApiProperty({
    description: '地块的X轴坐标',
    required: true,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
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
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  z: number;
}
