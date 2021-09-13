import { PartialType } from '@nestjs/swagger';

import { OccupyHexGridDto } from './occupy-hex-grid.dto';

export class MigrateHexGridDto extends PartialType(OccupyHexGridDto) {}
