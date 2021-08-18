import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import cookieParser from 'cookie-parser';
import { TransformInterceptor } from 'nestjs-general-interceptor';
import { AppService } from '../src/app.service';
import { AppController } from '../src/app.controller';

class MockAppService extends AppService {
  async getHello() {
    return 'Hello, World!';
  }

  async onApplicationBootstrap() {
    // do nothing
  }
}
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeEach(async () => {
    appService = new MockAppService(null, null, null, null, null, null);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useFactory: () => appService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    app.use(cookieParser());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(
        '{"statusCode":200,"message":"ok","data":"Welcome to Meta Network!"}',
      );
  });
  it('/hello (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect('{"statusCode":200,"message":"ok","data":"Hello, World!"}');
  });
});
