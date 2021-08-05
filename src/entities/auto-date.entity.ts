import { ApiHideProperty, ApiResponseProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class AutoDateEntity {
  @ApiHideProperty()
  @ApiResponseProperty({ example: '2021-07-27T11:39:39.150Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @ApiHideProperty()
  @ApiResponseProperty({ example: '2021-07-27T11:39:39.150Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
