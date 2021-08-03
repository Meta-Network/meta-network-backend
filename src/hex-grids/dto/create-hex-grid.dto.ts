import { IsInt, Length } from 'class-validator';

export class CreateHexGridDto {
  @IsInt()
  x: number;
  @IsInt()
  y: number;
  @IsInt()
  z: number;

  @Length(3, 32)
  hex_grid_name: string;
}
