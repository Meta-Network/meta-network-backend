import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { HEX_GRID_D } from 'src/constants';

export class FindByFilterDto {
  @ApiProperty({
    description: '地块的X轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  xMin: number;
  @ApiProperty({
    description: '地块的X轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  xMax: number;
  @ApiProperty({
    description: '地块的Y轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  yMin: number;
  @ApiProperty({
    description: '地块的Y轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  yMax: number;
  @ApiProperty({
    description: '地块的Z轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  zMin: number;
  @ApiProperty({
    description: '地块的Z轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
    minimum: -HEX_GRID_D,
    maximum: HEX_GRID_D,
  })
  @Type(() => Number)
  @IsInt()
  @Min(-HEX_GRID_D)
  @Max(HEX_GRID_D)
  @IsNotEmpty()
  zMax: number;
}
