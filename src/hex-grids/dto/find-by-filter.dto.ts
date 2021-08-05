import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class FindByFilterDto {
  @ApiProperty({
    description: '地块的X轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x_min: number;
  @ApiProperty({
    description: '地块的X轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x_max: number;
  @ApiProperty({
    description: '地块的Y轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  y_min: number;
  @ApiProperty({
    description: '地块的Y轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  y_max: number;
  @ApiProperty({
    description: '地块的Z轴坐标查询范围最小值（包括此值）',
    required: true,
    example: -20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z_min: number;
  @ApiProperty({
    description: '地块的Z轴坐标查询范围最大值（包括此值）',
    required: true,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z_max: number;
}
