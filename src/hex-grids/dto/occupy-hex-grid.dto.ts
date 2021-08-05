import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class OccupyHexGridDto {
  @ApiProperty({
    description: '格子的X轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  x: number;
  @ApiProperty({
    description: '格子的Y轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  y: number;
  @ApiProperty({
    description: '格子的Z轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  z: number;
}
