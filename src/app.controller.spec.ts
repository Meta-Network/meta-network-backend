import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const appService = new AppService(null, null, null, null, null, null);
    jest
      .spyOn(appService, 'getHello')
      .mockImplementation(async () => 'Hello, World!');
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useFactory: () => appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('index', () => {
    it('should return "Welcome to Meta Network!"', () => {
      expect(appController.index()).toBe('Welcome to Meta Network!');
    });
  });
  describe('hello', () => {
    it('should return "Hello, World!"', async () => {
      const result = await appController.hello();
      expect(result).toBe('Hello, World!');
    });
  });
});
