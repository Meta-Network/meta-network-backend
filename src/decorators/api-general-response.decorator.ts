import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { GeneralResponseDto } from '../dto/general-response.dto';

export const ApiGeneralResponse = <TModel extends Type<any>>(
  model: TModel,
  description = '调用成功',
  status = 200,
) => {
  const data = {} as Record<string, any>;
  if (
    model.name === 'Boolean' ||
    model.name === 'String' ||
    model.name === 'Number'
  ) {
    data.type = model.name.toLowerCase();
  } else {
    data.allOf = [{ $ref: getSchemaPath(model) }];
  }
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GeneralResponseDto) },
          {
            properties: {
              statusCode: {
                example: status | HttpStatus.OK,
              },

              data,
            },
          },
        ],
      },
    }),
  );
};
