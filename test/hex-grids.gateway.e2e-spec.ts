import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { HexGridsGateway } from '../src/hex-grids/hex-grids.gateway';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { HexGrid } from '../src/entities/hex-grid.entity';
describe('HexGridsGateway (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let gateway: HexGridsGateway;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [HexGridsGateway],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
    gateway = app.get<HexGridsGateway>(HexGridsGateway);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should connect successfully', async () => {
    await app.listen(3081);
    const socket = io('http://localhost:3081/hex-grids');

    expect(socket).toBeDefined();
    const connect = () =>
      new Promise((resolve) => {
        socket.on('connect', () => {
          console.log('Connected');
          resolve(true);
        });
      });
    const connectResult = await connect();
    expect(connectResult).toBe(true);
    const mockHexGrid = {
      id: 1,
      x: 1,
      y: 11,
      z: -12,
      userId: 2,
      username: 'bob',
      userNickname: 'Bob',
      userAvatar: 'https://image.meta.fan/bob.png',
      userBio: 'Some Description',
      siteName: '',
      subdomain: '',
      metaSpaceSiteId: 0,
      metaSpaceSiteUrl: '',
      metaSpaceSiteProofUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const hexGridOccupiedSubject = new Subject<HexGrid>();
    socket.on('hex-grid.occupied', (hexGrid) => {
      hexGridOccupiedSubject.next(hexGrid);
    });
    gateway.handleAppHexGridOccupiedEvent(mockHexGrid);

    const hexGridReceived = await firstValueFrom(hexGridOccupiedSubject);
    hexGridReceived.createdAt = new Date(hexGridReceived.createdAt);
    hexGridReceived.updatedAt = new Date(hexGridReceived.updatedAt);

    expect(hexGridReceived).toEqual(mockHexGrid);
    socket.close();
  });
});
