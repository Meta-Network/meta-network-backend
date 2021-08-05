import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class OccupyHexGridDto {
  @ApiProperty({
    description: '地块的X轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  x: number;
  @ApiProperty({
    description: '地块的Y轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  y: number;
  @ApiProperty({
    description: '地块的Z轴坐标',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  z: number;
}
