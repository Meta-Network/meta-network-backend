import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import formCors from 'form-cors';
import helmet from 'helmet';
import { TransformInterceptor } from 'nestjs-general-interceptor';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const microserviceOptions = configService.get<MicroserviceOptions>(
    'microservice.options',
  );
  //MicroserviceOptions;
  app.connectMicroservice<MicroserviceOptions>(microserviceOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(helmet());

  app.use(
    formCors({
      allowList: configService.get<string[]>('cors.origins'),
      exception: new NotAcceptableException('This request is not allowed.'),
    }),
  );

  app.use(cookieParser());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: configService.get<string[]>('cors.origins'),
    credentials: true,
  });

  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Meta Network API')
      .setDescription('Meta Network API')
      .setVersion('0.1')
      .addCookieAuth(configService.get<string>('jwt.access_token_key'))
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  await app.startAllMicroservices();
  await app.listen(configService.get<string>('app.port'));
}

bootstrap();
