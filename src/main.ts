import { NestFactory } from '@nestjs/core';
import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from 'nestjs-general-interceptor';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import formCors from 'form-cors';
import helmet from 'helmet';
import { JWTAuthGuard } from './auth/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

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
  // app.useGlobalGuards(new JWTAuthGuard());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: configService.get<string[]>('cors.origins'),
  });

  const config = new DocumentBuilder()
    .setTitle('Meta Network API')
    .setDescription('Meta Network API')
    .setVersion('0.1')
    .addCookieAuth(configService.get<string>('jwt.access_token_key'))
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('app.port'));
}

bootstrap();
