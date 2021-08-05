import { PartialType } from '@nestjs/swagger';
import { OccupyHexGridDto } from './occupy-hex-grid.dto';

export class UpdateHexGridDto extends PartialType(OccupyHexGridDto) {}
