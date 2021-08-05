import { ApiProperty } from '@nestjs/swagger';
import { Response as GeneralResponse } from 'nestjs-general-interceptor';

export class GeneralResponseDto<T> implements GeneralResponse<T> {
  @ApiProperty({
    description: '状态码',
  })
  statusCode: number;
  @ApiProperty({
    description: '消息',
    example: 'ok',
  })
  message: string;
  @ApiProperty({
    description: '数据体',
  })
  data: T;
}
