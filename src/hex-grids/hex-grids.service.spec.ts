import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Connection,
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';

import { JWTDecodedUser } from '../auth/type';
import { ConfigBizService } from '../config-biz/config-biz.service';
import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridTransactionReferenceEntity } from '../entities/hex-grid-tx-ref.entity';
import { MetaCmsService } from '../microservices/meta-cms/meta-cms.service';
import { HexGridsService } from './hex-grids.service';
import { listeners } from 'process';

describe('HexGridsService', () => {
  let repo: Repository<HexGrid>;
  let service: HexGridsService;
  let configBizService;
  let metaCmsService: MetaCmsService;
  let eventEmitter;
  const testConnectionName = 'testConn';
  const currentUser = {
    id: 1,
    purpose: 'access_token',
    username: 'alice',
    nickname: '',
    avatar: '',
    bio: '',
    created_at: new Date(),
    updated_at: new Date(),
    aud: ['ucenter', 'network'],
    jti: 'abcdefgh',
    iss: 'https://meta-network.test',
    account: {
      id: 1,
      user_id: 1,
      account_id: 'alice@ww.io',
      platform: 'email',
      created_at: new Date(),
      updated_at: new Date(),
    },
  } as JWTDecodedUser;
  const anotherUser = {
    id: 9,
    purpose: 'access_token',
    username: 'bob',
    nickname: '',
    avatar: '',
    bio: '',
    created_at: new Date(),
    updated_at: new Date(),
    aud: ['ucenter', 'network'],
    jti: 'abcdefgh',
    iss: 'https://meta-network.test',
    account: {
      id: 1,
      user_id: 1,
      account_id: 'bob@ww.io',
      platform: 'email',
      created_at: new Date(),
      updated_at: new Date(),
    },
  } as JWTDecodedUser;
  beforeEach(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [HexGrid, HexGridTransactionReferenceEntity],
      synchronize: true,
      logging: false,
      name: testConnectionName,
    });
    repo = getRepository(HexGrid, testConnectionName);
    configBizService = new ConfigBizService(undefined);
    metaCmsService = new MetaCmsService(undefined, configBizService);
    eventEmitter = new EventEmitter2();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        HexGridsService,
        {
          provide: Connection,
          useFactory: () => connection,
        },
        {
          provide: getRepositoryToken(HexGrid),
          useFactory: () => repo,
        },
        {
          provide: ConfigBizService,
          useFactory: () => configBizService,
        },
        {
          provide: EventEmitter2,
          useFactory: () => eventEmitter,
        },
        {
          provide: MetaCmsService,
          useFactory: () => metaCmsService,
        },
      ],
    }).compile();

    service = module.get<HexGridsService>(HexGridsService);
    return connection;
  });

  afterEach(async () => {
    await getConnection(testConnectionName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isHexGridExisted', () => {
    it('should return false if no hex grid exists', async () => {
      const result = await service.isHexGridExisted({});
      expect(result).toBe(false);
    });
  });

  describe('occupy', () => {
    it('should return the hex grid occupied', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 9,
        username: 'bob',
      });
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 10);
      jest
        .spyOn(service, 'getMetaSpaceDomain')
        .mockImplementation(() => 'metaspaces.life');
      jest
        .spyOn(service, 'isUploadToAreaveEnabled')
        .mockImplementation(async () => false);
      jest
        .spyOn(metaCmsService, 'fetchUserDefaultSiteInfo')
        .mockImplementation(async (userId) => ({
          configId: 114,
          userId: 14,
          title: 'alice meta space',
          subtitle: 'ww',
          description: 'ww desc',
          domain: 'alice.metaspaces.life',
          metaSpacePrefix: 'alice',
        }));
      const hexGridEntity = await service.occupy(
        { x: 1, y: 11, z: -12 },
        currentUser,
      );
      expect(hexGridEntity.userId).toBe(1);
      expect(hexGridEntity.username).toBe('alice');
      expect(hexGridEntity.x).toBe(1);
      expect(hexGridEntity.y).toBe(11);
      expect(hexGridEntity.z).toBe(-12);
      expect(hexGridEntity.metaSpaceSiteId).toBe(114);
      expect(hexGridEntity.metaSpaceSiteUrl).toBe(
        'https://alice.metaspaces.life',
      );
      expect(hexGridEntity.subdomain).toBe('alice.metaspaces.life');
    });

    it('should throw BadRequestException if the sum of the coordinates is not zero', async () => {
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 10);
      const t = () => service.occupy({ x: 1, y: 2, z: 3 }, currentUser);
      expect(t).rejects.toThrow(BadRequestException);
      expect(t).rejects.toThrow(
        'Invalid coordinate: The sum of the coordinates must be zero',
      );
    });
    it('should throw BadRequestException if the hex grid is in forbidden zone', async () => {
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 10);
      const t = () => service.occupy({ x: 10, y: -10, z: 0 }, currentUser);
      expect(t).rejects.toThrow(BadRequestException);
      expect(t).rejects.toThrow('Invalid coordinate: Forbidden Zone');
    });
    it('should throw BadRequestException if the hex grid is  not adjacent to an occupied grid', async () => {
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 9);
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      const t = () => service.occupy({ x: 10, y: -10, z: 0 }, anotherUser);
      expect(t).rejects.toThrow(BadRequestException);
      expect(t).rejects.toThrow(
        'Invalid coordinate: Must be adjacent to an occupied grid',
      );
    });

    it('should throw ConflictException if the hex grid is already occupied', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 9,
        username: 'bob',
      });
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 10);
      const t = () => service.occupy({ x: 0, y: 11, z: -11 }, currentUser);
      expect(t).rejects.toThrow(ConflictException);
      expect(t).rejects.toThrow(
        'Invalid coordinate: This grid is already occupied',
      );
    });

    it('should throw ConflictException if current user already owns a grid', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      await repo.save({
        x: -11,
        y: 11,
        z: 0,
        userId: 9,
        username: 'bob',
      });
      jest
        .spyOn(service, 'getForbiddenZoneRadius')
        .mockImplementation(async () => 10);
      const t = () => service.occupy({ x: -12, y: 11, z: 1 }, currentUser);
      expect(t).rejects.toThrow(ConflictException);
      expect(t).rejects.toThrow('You already own a grid');
    });
  });

  describe('updateByUserId', () => {
    it('should update entity if user has a hexGrid', async () => {
      jest
        .spyOn(service, 'isUploadToAreaveEnabled')
        .mockImplementation(async () => false);
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      let entity = await repo.findOne(1);
      expect(entity.userNickname).toBe('');
      expect(entity.userAvatar).toBe('');
      expect(entity.userBio).toBe('');
      expect(entity.username).toBe('alice');

      const updateHexGridDto = {
        userId: 1,
        userNickname: 'BenBen42',
        userAvatar: 'https://meta.fan/images/logo.png',
        userBio: 'Web 3 / Metaverse',
      };
      await service.updateByUserId(updateHexGridDto);
      entity = await repo.findOne(1);
      expect(entity.username).toBe('alice');
      expect(entity.userNickname).toBe(updateHexGridDto.userNickname);
      expect(entity.userAvatar).toBe(updateHexGridDto.userAvatar);
      expect(entity.userBio).toBe(updateHexGridDto.userBio);
    });

    it('should ignore quietly if user has no hexGrid', async () => {
      jest
        .spyOn(service, 'isUploadToAreaveEnabled')
        .mockImplementation(async () => false);
      let entity = await repo.findOne(1);
      expect(entity).toBeUndefined();
      const updateHexGridDto = {
        userId: 1,
        userNickname: 'BenBen42',
        userAvatar: 'https://meta.fan/images/logo.png',
        userBio: 'Web 3 / Metaverse',
      };
      await service.updateByUserId(updateHexGridDto);
      entity = await repo.findOne(1);
      expect(entity).toBeUndefined();
    });
  });
  describe('updateByMetaSpaceSiteId', () => {
    it('should update entity if a matching hex grid exists', async () => {
      jest
        .spyOn(service, 'isUploadToAreaveEnabled')
        .mockImplementation(async () => false);
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
        metaSpaceSiteId: 12,
      });
      let entity = await repo.findOne(1);
      expect(entity.metaSpaceSiteUrl).toBe('');
      expect(entity.metaSpaceSiteProofUrl).toBe('');
      expect(entity.siteName).toBe('');
      expect(entity.subdomain).toBe('');

      expect(entity.username).toBe('alice');

      const updateHexGridDto = {
        metaSpaceSiteId: 12,
        siteName: 'Meta Fan',
        subdomain: 'alice-1',
        metaSpaceSiteUrl: 'http://meta.fan',
      };
      await service.updateByMetaSpaceSiteId(updateHexGridDto);
      entity = await repo.findOne({
        metaSpaceSiteId: 12,
      });
      expect(entity.metaSpaceSiteUrl).toBe(updateHexGridDto.metaSpaceSiteUrl);
      expect(entity.siteName).toBe(updateHexGridDto.siteName);
      expect(entity.subdomain).toBe(updateHexGridDto.subdomain);
      expect(entity.metaSpaceSiteProofUrl).toBe('');
    });

    it('should ignore quietly if no matching hex grid exists', async () => {
      jest
        .spyOn(service, 'isUploadToAreaveEnabled')
        .mockImplementation(async () => false);

      let entity = await repo.findOne(1);
      expect(entity).toBeUndefined();

      const updateHexGridDto = {
        metaSpaceSiteId: 12,
        siteName: 'Meta Fan',
        subdomain: 'alice-1',
        metaSpaceSiteUrl: 'http://meta.fan',
      };
      await service.updateByMetaSpaceSiteId(updateHexGridDto);
      entity = await repo.findOne({
        metaSpaceSiteId: 12,
      });
      expect(entity).toBeUndefined();
    });
  });
  describe('getForbiddenZoneRadius', () => {
    it('should return configBizService.getHexGridForbiddenZoneRadius()', async () => {
      jest
        .spyOn(configBizService, 'getHexGridForbiddenZoneRadius')
        .mockImplementation(async () => 20);
      const result = await service.getForbiddenZoneRadius();
      expect(result).toBe(20);
    });
  });
  describe('findOne', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      const result = await service.findOne(1);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOne({ x: 0, y: 0, z: 0 });
      expect(result).toBeUndefined();
    });
  });

  describe('findOneByCoordinate', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      const result = await service.findOneByCoordinate(0, 11, -11);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOneByCoordinate(0, 11, -11);
      expect(result).toBeUndefined();
    });
  });
  describe('findOneBySubdomain', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
        metaSpaceSiteId: 1,
        subdomain: 'alice0123',
        metaSpaceSiteUrl: 'https://alice0123.meta.fan',
      });
      const result = await service.findOneBySubdomain('alice0123');
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
      expect(result.metaSpaceSiteId).toBe(1);
      expect(result.subdomain).toBe('alice0123');
      expect(result.metaSpaceSiteUrl).toBe('https://alice0123.meta.fan');
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOneBySubdomain('alice0123');
      expect(result).toBeUndefined();
    });
  });

  describe('findOneByUserId', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      const result = await service.findOneByUserId(1);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOneByUserId(1);
      expect(result).toBeUndefined();
    });
  });

  describe('findOneByMetaSpaceSiteId', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
        metaSpaceSiteId: 1,
        subdomain: 'alice0123',
        metaSpaceSiteUrl: 'https://alice0123.meta.fan',
      });
      const result = await service.findOneByMetaSpaceSiteId(1);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
      expect(result.metaSpaceSiteId).toBe(1);
      expect(result.subdomain).toBe('alice0123');
      expect(result.metaSpaceSiteUrl).toBe('https://alice0123.meta.fan');
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOneBySubdomain('alice0123');
      expect(result).toBeUndefined();
    });
  });

  describe('findOneByMetaSpaceSiteUrl', () => {
    it('should return entity when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
        metaSpaceSiteId: 1,
        subdomain: 'alice0123',
        metaSpaceSiteUrl: 'https://alice0123.meta.fan',
      });
      const result = await service.findOneByMetaSpaceSiteUrl(
        'https://alice0123.meta.fan',
      );
      expect(result.userId).toBe(1);
      expect(result.username).toBe('alice');
      expect(result.x).toBe(0);
      expect(result.y).toBe(11);
      expect(result.z).toBe(-11);
      expect(result.metaSpaceSiteId).toBe(1);
      expect(result.subdomain).toBe('alice0123');
      expect(result.metaSpaceSiteUrl).toBe('https://alice0123.meta.fan');
    });
    it('should return undefined when not found', async () => {
      const result = await service.findOneByMetaSpaceSiteUrl(
        'https://alice0123.meta.fan',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findByFilter', () => {
    jest.setTimeout(60000);
    it('should return entities when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      await repo.save({
        x: 1,
        y: 11,
        z: -12,
        userId: 2,
        username: 'bob',
      });
      const result1 = await service.findByFilter({
        xMin: -1,
        xMax: 1,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result1.length).toBe(2);
      expect(result1[0].userId).toBe(1);
      expect(result1[0].username).toBe('alice');
      expect(result1[0].x).toBe(0);
      expect(result1[0].y).toBe(11);
      expect(result1[0].z).toBe(-11);
      expect(result1[1].userId).toBe(2);
      expect(result1[1].username).toBe('bob');
      expect(result1[1].x).toBe(1);
      expect(result1[1].y).toBe(11);
      expect(result1[1].z).toBe(-12);

      const result2 = await service.findByFilter({
        xMin: 1,
        xMax: 3,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result2.length).toBe(1);
      expect(result2[0].userId).toBe(2);
      expect(result2[0].username).toBe('bob');
      expect(result2[0].x).toBe(1);
      expect(result2[0].y).toBe(11);
      expect(result2[0].z).toBe(-12);
    });

    it('should return 5000 entities when more than 5000 entities was found', async () => {
      const entities = [];
      for (let i = 0; i < 6000; i++) {
        entities.push({
          x: 1 + i,
          y: 11,
          z: -12 - i,
          userId: i + 1,
          username: `bob${i + 1}`,
        });
      }
      await repo.save(entities);
      // console.log('entity count:' + (await repo.count()));
      const result1 = await service.findByFilter({
        xMin: -10000,
        xMax: 10000,
        yMin: -10000,
        yMax: 10000,
        zMin: -10000,
        zMax: 10000,
      });
      expect(result1).toBeDefined();
      expect(result1.length).toBe(5000);

      const result2 = await service.findByFilter({
        xMin: 1,
        xMax: 4999,
        yMin: -10000,
        yMax: 10000,
        zMin: -10000,
        zMax: 10000,
      });
      expect(result2).toBeDefined();
      expect(result2.length).toBe(4999);
    });
    it('should return empty array when not found', async () => {
      const result = await service.findByFilter({
        xMin: -1,
        xMax: 1,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('countByFilter', () => {
    jest.setTimeout(60000);
    it('should return count when found', async () => {
      await repo.save({
        x: 0,
        y: 11,
        z: -11,
        userId: 1,
        username: 'alice',
      });
      await repo.save({
        x: 1,
        y: 11,
        z: -12,
        userId: 2,
        username: 'bob',
      });
      const result1 = await service.countByFilter({
        xMin: -1,
        xMax: 1,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result1).toBe(2);

      const result2 = await service.countByFilter({
        xMin: 1,
        xMax: 3,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result2).toBe(1);
    });

    it('should be the exact count when more than 5000 entities was found', async () => {
      const entities = [];
      for (let i = 0; i < 6000; i++) {
        entities.push({
          x: 1 + i,
          y: 11,
          z: -12 - i,
          userId: i + 1,
          username: `bob${i + 1}`,
        });
      }
      await repo.save(entities);
      // console.log('entity count:' + (await repo.count()));
      const result1 = await service.countByFilter({
        xMin: -10000,
        xMax: 10000,
        yMin: -10000,
        yMax: 10000,
        zMin: -10000,
        zMax: 10000,
      });
      expect(result1).toBeDefined();
      expect(result1).toBe(6000);

      const result2 = await service.countByFilter({
        xMin: 1,
        xMax: 4999,
        yMin: -10000,
        yMax: 10000,
        zMin: -10000,
        zMax: 10000,
      });
      expect(result2).toBeDefined();
      expect(result2).toBe(4999);
    });
    it('should be 0  when not entites was found', async () => {
      const result = await service.countByFilter({
        xMin: -1,
        xMax: 1,
        yMin: 10,
        yMax: 12,
        zMin: -12,
        zMax: -10,
      });
      expect(result).toBeDefined();
      expect(result).toBe(0);
    });
  });
});
