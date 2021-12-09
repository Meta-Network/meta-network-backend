import { metaNetworkGridsServerSign } from '@metaio/meta-signature-util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { when } from 'jest-when';
import TestWeaveJWK from 'testweave-sdk/dist/assets/arweave-keyfile-MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y.json';

import { HexGridPendingEntity } from '../../entities/hex-grid-pending.entity';
import { IHexGridStorage } from './hex-grid-storage.interface';
import { HexGridStorageService } from './hex-grid-storage.service';
import { HexGridStorageArweaveProvider } from './hex-grid-storage-arweave.provider';
import * as InjectToken from './inject-token';

const nowMock = jest.fn();
Date.now = nowMock;

jest.mock('crypto', () => {
  const crypto = jest.requireActual('crypto');

  return {
    ...crypto,
    randomBytes: jest.fn(),
  };
});

const randomBytesMock = crypto.randomBytes as jest.Mock<any, any>;

jest.mock('@metaio/meta-signature-util', () => {
  const { metaNetworkGridsServerSign } = jest.requireActual(
    '@metaio/meta-signature-util',
  );

  return {
    metaNetworkGridsServerSign: {
      generate: jest.fn(metaNetworkGridsServerSign.generate),
    },
  };
});

describe('HexGridStorageService', () => {
  const serverKeys = {
    private:
      '0x486744a0ec28643791bb0e41cb3e1130e8ec06624437247011ab1242eb01dc73',
    public:
      '0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
  };
  const serverDomain = 'localhost';

  let storageService: HexGridStorageService;
  let storage: jest.Mocked<IHexGridStorage>;
  let arweaveProvider: jest.Mocked<HexGridStorageArweaveProvider>;

  beforeAll(() => {
    storage = {
      getPendings: jest.fn(),
      clearPendings: jest.fn(),
      getReferencedTx: jest.fn(),
      getPreviousBatchTx: jest.fn(),
      updateHexGridsTransactionReference: jest.fn(),
    };
    arweaveProvider = {
      createTransaction: jest.fn(),
      postProcess: jest.fn(),
    } as any;
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
                case 'metaSignature.serverKeys':
                  return serverKeys;

                case 'metaSignature.serverDomain':
                  return serverDomain;

                default:
                  return null;
              }
            },
          },
        },
        HexGridStorageService,
        {
          provide: HexGridStorageArweaveProvider,
          useValue: arweaveProvider,
        },
        {
          provide: InjectToken.WalletKey,
          useValue: TestWeaveJWK,
        },
      ],
    }).compile();

    storageService = module.get<HexGridStorageService>(HexGridStorageService);
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(storageService).toBeDefined();
  });

  it('should do nothing when no pendings', async () => {
    storage.getPendings.mockResolvedValue([]);

    await expect(storageService.uploadPendings(storage)).resolves.not.toThrow();

    expect(metaNetworkGridsServerSign.generate).not.toHaveBeenCalled();
  });

  it('should generate first transaction if no previous batch tx', async () => {
    storage.getPendings.mockResolvedValue([
      {
        id: 1,
        properties: {
          x: 1,
          y: 2,
          z: 3,
          userId: 1,
          username: 'first',
        },
      },
      {
        id: 2,
        properties: {
          x: 2,
          y: 2,
          z: 3,
          userId: 2,
          username: 'second',
        },
      },
    ] as Array<HexGridPendingEntity>);
    arweaveProvider.createTransaction.mockResolvedValue({
      id: 'Td8u50aW0LV0ABD78SH0NpBzbzV-LR7lIgAidm_imP8',
    } as any);

    randomBytesMock.mockReturnValue(
      new Uint8Array(Buffer.from('4d29f9718e95a397ad1cbabc', 'hex')),
    );
    nowMock.mockReturnValue(1638777180044);

    const metadata = JSON.stringify({
      '@context': 'https://metanetwork.online/ns/grid',
      '@type': 'meta-network-grids-server-sign',
      '@version': '1.0.0',
      signatureAlgorithm: 'curve25519',
      publicKey:
        '0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      items: [
        {
          x: 1,
          y: 2,
          z: 3,
          userId: 1,
          username: 'first',
          id: 1,
        },
        {
          x: 2,
          y: 2,
          z: 3,
          userId: 2,
          username: 'second',
          id: 2,
        },
      ],
      nonce: '0x4d29f9718e95a397ad1cbabc',
      claim:
        'I, localhost maintain grids for users, using the key: 0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      digest:
        '0x60f892a3df7c3a5c8b6ae8555d33d48e02fde184373136a2aa5f679705206a64',
      signature:
        '0x2d3a5dd6a23c16fc2642470bfe038f1a6e92f5acb32587349116a9771274fa5ab5824cb34bfca00583836b36549f13277f85779ee38ecb577500f95b82400407',
      ts: 1638777180044,
    });

    await expect(storageService.uploadPendings(storage)).resolves.not.toThrow();

    expect(arweaveProvider.createTransaction).toHaveBeenCalledWith(metadata);

    expect(storage.updateHexGridsTransactionReference).toHaveBeenCalledWith(
      'Td8u50aW0LV0ABD78SH0NpBzbzV-LR7lIgAidm_imP8',
      [1, 2],
    );
    expect(storage.clearPendings).toHaveBeenCalled();
  });

  it('should generate metadata with new item and previousBatchTx', async () => {
    storage.getPendings.mockResolvedValue([
      {
        id: 3,
        properties: {
          x: 3,
          y: 2,
          z: 3,
          userId: 3,
          username: 'third',
        },
      },
    ] as Array<HexGridPendingEntity>);
    storage.getPreviousBatchTx.mockResolvedValue(
      'lmvEkjy59400Btib1juQoeoKAAwj_g0Hxq6GVHwEeeQ',
    );
    arweaveProvider.createTransaction.mockResolvedValue({
      id: 'bNlsqehpYgjE1R7opo3Lh0KBk61wE5dzkK9pmSj5QI4',
    } as any);

    randomBytesMock.mockReturnValue(
      new Uint8Array(Buffer.from('906b4bfc22d9295409a85555', 'hex')),
    );
    nowMock.mockReturnValue(1638777360034);

    const metadata = JSON.stringify({
      '@context': 'https://metanetwork.online/ns/grid',
      '@type': 'meta-network-grids-server-sign',
      '@version': '1.0.0',
      signatureAlgorithm: 'curve25519',
      publicKey:
        '0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      items: [
        {
          x: 3,
          y: 2,
          z: 3,
          userId: 3,
          username: 'third',
          id: 3,
        },
      ],
      nonce: '0x906b4bfc22d9295409a85555',
      claim:
        'I, localhost maintain grids for users, using the key: 0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      digest:
        '0xb28c94b2195c8ed259f0b415aaee3f39b0b2920a4537611499fa044956917a21',
      signature:
        '0x5ba160f186c0ad11bdaedacfb4fb4b492ef0126c23fbcb85947a4fa83437b3e81dd7880f8e0787577200130e17fb1d4c6011fd02ffb7913336ee2f2813987100',
      ts: 1638777360034,
      previousBatchTx: 'lmvEkjy59400Btib1juQoeoKAAwj_g0Hxq6GVHwEeeQ',
    });

    await expect(storageService.uploadPendings(storage)).resolves.not.toThrow();

    expect(arweaveProvider.createTransaction).toHaveBeenCalledWith(metadata);

    expect(storage.updateHexGridsTransactionReference).toHaveBeenCalledWith(
      'bNlsqehpYgjE1R7opo3Lh0KBk61wE5dzkK9pmSj5QI4',
      [3],
    );
    expect(storage.clearPendings).toHaveBeenCalled();
  });

  it('should generate metadata with tx item updates', async () => {
    storage.getPendings.mockResolvedValue([
      {
        id: 1,
        properties: {
          user_nickname: 'FirstFirst',
        } as any,
      },
      {
        id: 2,
        properties: {
          user_nickname: 'SecondSecond',
        } as any,
      },
    ] as Array<HexGridPendingEntity>);
    storage.getPreviousBatchTx.mockResolvedValue(
      'HvJ3BVp0XNUCVcQvN1LQsmgklHYaPMzNrl9C004fIlw',
    );

    when(storage.getReferencedTx)
      .calledWith(1)
      .mockResolvedValue('lmvEkjy59400Btib1juQoeoKAAwj_g0Hxq6GVHwEeeQ');
    when(storage.getReferencedTx)
      .calledWith(2)
      .mockResolvedValue('HvJ3BVp0XNUCVcQvN1LQsmgklHYaPMzNrl9C004fIlw');

    arweaveProvider.createTransaction.mockResolvedValue({
      id: 'oquKzYOdze-j-QxdHQzToh5jrtUrLfpEgeZ_FUwZpok',
    } as any);

    randomBytesMock.mockReturnValue(
      new Uint8Array(Buffer.from('b385322b3d60a863a0ce63cd', 'hex')),
    );
    nowMock.mockReturnValue(1638778080092);

    const metadata = JSON.stringify({
      '@context': 'https://metanetwork.online/ns/grid',
      '@type': 'meta-network-grids-server-sign',
      '@version': '1.0.0',
      signatureAlgorithm: 'curve25519',
      publicKey:
        '0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      items: [
        {
          user_nickname: 'FirstFirst',
          id: 1,
          previousTx: 'lmvEkjy59400Btib1juQoeoKAAwj_g0Hxq6GVHwEeeQ',
        },
        {
          user_nickname: 'SecondSecond',
          id: 2,
          previousTx: 'HvJ3BVp0XNUCVcQvN1LQsmgklHYaPMzNrl9C004fIlw',
        },
      ],
      nonce: '0xb385322b3d60a863a0ce63cd',
      claim:
        'I, localhost maintain grids for users, using the key: 0xa2003dcb15002cf314c26b52ce5316eb6d0319d7fc51526979c3530130aa316b',
      digest:
        '0x60f892a3df7c3a5c8b6ae8555d33d48e02fde184373136a2aa5f679705206a64',
      signature:
        '0xaa95d0c2cb483498a2e76560d8885c0d06ea667da8c99aba73f1f2c7355bbbc5bcafc250852b6ae3c1db90e1839246d42650cc943e5a6a12e00678fca609ea07',
      ts: 1638778080092,
      previousBatchTx: 'HvJ3BVp0XNUCVcQvN1LQsmgklHYaPMzNrl9C004fIlw',
    });

    await expect(storageService.uploadPendings(storage)).resolves.not.toThrow();

    expect(arweaveProvider.createTransaction).toHaveBeenCalledWith(metadata);

    expect(storage.updateHexGridsTransactionReference).toHaveBeenCalledWith(
      'oquKzYOdze-j-QxdHQzToh5jrtUrLfpEgeZ_FUwZpok',
      [1, 2],
    );
    expect(storage.clearPendings).toHaveBeenCalled();
  });
});
