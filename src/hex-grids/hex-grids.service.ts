import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, Repository, SelectQueryBuilder } from 'typeorm';

import { JWTDecodedUser } from '../auth/type';
import { ConfigBizService } from '../config-biz/config-biz.service';
import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridPendingEntity } from '../entities/hex-grid-pending.entity';
import { MetaCmsService } from '../microservices/meta-cms/meta-cms.service';
import { FindByFilterDto } from './dto/find-by-filter.dto';
import { OccupyHexGridDto } from './dto/occupy-hex-grid.dto';
import { UpdateHexGridDto } from './dto/update-hex-grid.dto';
import { HexGridsEvent } from './hex-grids.constant';

@Injectable()
export class HexGridsService {
  private readonly logger = new Logger(HexGridsService.name);
  constructor(
    private readonly databaseConnection: Connection,
    @InjectRepository(HexGrid)
    private readonly hexGridsRepository: Repository<HexGrid>,

    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,

    private readonly configBizService: ConfigBizService,
    private readonly metaCmsService: MetaCmsService,
  ) {}

  async occupy(occupyHexGridDto: OccupyHexGridDto, user: JWTDecodedUser) {
    // 业务校验 - x+y+z=0
    await this.validateCoordinate(occupyHexGridDto);
    // 唯一性校验，一个用户只能有一个地块
    const userId = user.id;
    if (await this.isHexGridExisted({ userId })) {
      throw new ConflictException('You already own a grid');
    }
    const metaSpaceDomain = this.getMetaSpaceDomain();
    const siteInfo = await this.metaCmsService.fetchUserDefaultSiteInfo(userId);
    const subdomain = `${siteInfo.metaSpacePrefix}.${metaSpaceDomain}`;
    const hexGridSiteInfo = {
      subdomain,
      metaSpaceSiteId: siteInfo.configId,
      metaSpaceSiteUrl: `https://${siteInfo.domain ?? subdomain}`,
    };
    let hexGridEntity;

    await this.databaseConnection.transaction(async (manager) => {
      hexGridEntity = await manager.save(HexGrid, {
        userId,

        username: user.username,
        ...occupyHexGridDto,
        ...hexGridSiteInfo,
      });
      if (await this.isUploadToAreaveEnabled()) {
        await manager.save(HexGridPendingEntity, {
          id: hexGridEntity.id,
          properties: {
            userId,
            username: user.username,
            ...occupyHexGridDto,
            ...hexGridSiteInfo,
          },
        });
      }
    });
    // 发送地块被占领的事件
    this.eventEmitter.emit(HexGridsEvent.OCCUPIED, hexGridEntity);
    return hexGridEntity;
  }
  async isUploadToAreaveEnabled(): Promise<boolean> {
    return await this.configBizService.isUploadToArweaveEnabled();
  }

  getMetaSpaceDomain(): string {
    return this.configService.get<string>('meta.meta-space-domain');
  }

  async updateByUserId(updateHexGridDto: UpdateHexGridDto) {
    await this.databaseConnection.transaction(async (manager) => {
      const hexGrid = await manager.findOneOrFail(HexGrid, {
        userId: updateHexGridDto.userId,
      });

      await manager.update(HexGrid, hexGrid.id, updateHexGridDto);
      await this.doUpdateHexGridPending(manager, hexGrid, updateHexGridDto);
    });
  }

  async updateByMetaSpaceSiteId(updateHexGridDto: UpdateHexGridDto) {
    await this.databaseConnection.transaction(async (manager) => {
      const hexGrid = await manager.findOneOrFail(HexGrid, {
        metaSpaceSiteId: updateHexGridDto.metaSpaceSiteId,
      });

      await manager.update(HexGrid, hexGrid.id, updateHexGridDto);
      await this.doUpdateHexGridPending(manager, hexGrid, updateHexGridDto);
    });
  }

  async doUpdateHexGridPending(
    manager,
    hexGrid: HexGrid,
    updateHexGridDto: UpdateHexGridDto,
  ) {
    if (await this.isUploadToAreaveEnabled()) {
      let pending = await manager.findOne(HexGridPendingEntity, hexGrid.id);

      if (pending) {
        Object.assign(pending.properties, updateHexGridDto);
      } else {
        pending = {
          id: hexGrid.id,
          properties: updateHexGridDto,
        };
      }

      await manager.save(HexGridPendingEntity, pending);
    }
  }

  async validateCoordinate(createHexGridDto: OccupyHexGridDto) {
    await this.validateCoordinateSum(createHexGridDto);
    const { x, y, z } = createHexGridDto;
    // 业务校验 - 该坐标没有被占用
    if (await this.isHexGridExisted({ x, y, z })) {
      throw new ConflictException(
        'Invalid coordinate: This grid is already occupied',
      );
    }
    //     if(this.isHexGridExisted({subdomain})){
    //   throw new BadRequestException("Invalid subdomain: This subdomain is already occupied");
    // }
    // 业务校验 - 不能在禁止占用区内占地
    const forbiddenZoneRadius = await this.getForbiddenZoneRadius();
    this.logger.debug('forbiddenZoneRadius', forbiddenZoneRadius);
    if (
      Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) <= forbiddenZoneRadius
    ) {
      throw new BadRequestException('Invalid coordinate: Forbidden Zone');
    }

    // 业务校验 - 除非是第一个占领的，否则必须和现有的地块相邻
    if (
      (await this.isHexGridExisted({})) &&
      !(await this.isHexGridExisted({
        x: Between(x - 1, x + 1),
        y: Between(y - 1, y + 1),
        z: Between(z - 1, z + 1),
      }))
    ) {
      throw new BadRequestException(
        'Invalid coordinate: Must be adjacent to an occupied grid',
      );
    }
  }

  async getForbiddenZoneRadius() {
    return this.configBizService.getHexGridForbiddenZoneRadius();
  }

  async validateCoordinateSum({ x, y, z }) {
    this.logger.debug(`x+y+z`, x + y + z);
    if (x + y + z !== 0) {
      throw new BadRequestException(
        'Invalid coordinate: The sum of the coordinates must be zero',
      );
    }
  }

  async findOne(condition): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(condition, {
      relations: ['reference'],
    });
  }

  async isHexGridExisted(condition): Promise<boolean> {
    return (await this.hexGridsRepository.count(condition)) > 0;
  }

  async findOneByCoordinate(x: number, y: number, z: number): Promise<HexGrid> {
    await this.validateCoordinateSum({ x, y, z });
    return await this.hexGridsRepository.findOne(
      { x, y, z },
      {
        relations: ['reference'],
      },
    );
  }

  async findOneBySubdomain(subdomain: string): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(
      { subdomain },
      {
        relations: ['reference'],
      },
    );
  }

  async findOneByUserId(userId: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(
      { userId },
      {
        relations: ['reference'],
      },
    );
  }

  async findOneByMetaSpaceSiteId(metaSpaceSiteId: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(
      { metaSpaceSiteId },
      {
        relations: ['reference'],
      },
    );
  }

  async findOneByMetaSpaceSiteUrl(metaSpaceSiteUrl: string): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(
      { metaSpaceSiteUrl },
      {
        relations: ['reference'],
      },
    );
  }

  async findByFilter(params: FindByFilterDto) {
    return this.createFilter(
      this.hexGridsRepository.createQueryBuilder(),
      params,
    )
      .leftJoinAndSelect(
        'HexGrid.reference',
        'reference',
        'reference.id = HexGrid.id',
      )
      .orderBy({ 'HexGrid.id': 'ASC' })
      .limit(5000)
      .getMany();
  }

  async countByFilter(params: FindByFilterDto) {
    return this.createFilter(
      this.hexGridsRepository.createQueryBuilder(),
      params,
    ).getCount();
  }

  protected createFilter(
    selectQueryBuilder: SelectQueryBuilder<HexGrid>,
    params: FindByFilterDto,
  ) {
    const { simpleQuery } = params;
    selectQueryBuilder = selectQueryBuilder.where({
      x: Between(params.xMin, params.xMax),
      y: Between(params.yMin, params.yMax),
      z: Between(params.zMin, params.zMax),
    });
    if (
      simpleQuery !== undefined &&
      simpleQuery !== null &&
      simpleQuery.trim() !== ''
    ) {
      selectQueryBuilder = selectQueryBuilder.andWhere(
        '(HexGrid.username LIKE :username OR HexGrid.userNickname LIKE :userNickname OR HexGrid.metaSpaceSiteUrl LIKE :metaSpaceSiteUrl)',
        {
          username: `${simpleQuery}%`,
          userNickname: `%${simpleQuery}%`,
          metaSpaceSiteUrl: `%${simpleQuery}%`,
        },
      );
    }
    return selectQueryBuilder;
  }
}
