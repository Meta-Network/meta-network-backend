import { PartialType } from '@nestjs/swagger';

import { HexGrid } from '../../entities/hex-grid.entity';

export class UpdateHexGridDto extends PartialType(HexGrid) {}
