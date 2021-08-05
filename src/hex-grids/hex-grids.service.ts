import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTDecodedUser } from 'src/auth/type';
import { Between, Repository } from 'typeorm';
import { HexGrid } from '../entities/hex-grid.entity';
import { CreateHexGridSiteDto } from './dto/create-hex-grid-site.dto';
import { FindByFilterDto } from './dto/find-by-filter.dto';
import { OccupyHexGridDto } from './dto/occupy-hex-grid.dto';

@Injectable()
export class HexGridsService {
  private readonly logger = new Logger(HexGridsService.name);
  constructor(
    @InjectRepository(HexGrid)
    private hexGridsRepository: Repository<HexGrid>,
    private readonly configService: ConfigService,
  ) {}

  async occupy(occupyHexGridDto: OccupyHexGridDto, user: JWTDecodedUser) {
    // 业务校验 - x+y+z=0
    await this.validateCoordinate(occupyHexGridDto);

    return await this.hexGridsRepository.save({
      user_id: user.id,
      username: user.username,
      ...occupyHexGridDto,
    });
  }

  async createHexGridSite(
    createHexGridSiteDto: CreateHexGridSiteDto,
    user: JWTDecodedUser,
    accessToken: string,
  ) {
    // 远程调用创建站点
    const siteInfo = await this.createSite(
      {
        title: createHexGridSiteDto.site_name,
      },
      user,
      accessToken,
    );
    const user_id = user.id;
    await this.hexGridsRepository.update(
      {
        user_id,
      },
      {
        meta_space_site_id: siteInfo.id,
        meta_space_site_url: siteInfo.url,
      },
    );
    return await this.findOne({ user_id });
  }
  async validateCoordinate(createHexGridDto: OccupyHexGridDto) {
    await this.validateCoordinateSum(createHexGridDto);
    const { x, y, z } = createHexGridDto;
    // 业务校验 - 该坐标或子域名没有被占用 (关系到子域名相关的业务逻辑在哪里完成)
    if (await this.isHexGridExisted({ x, y, z })) {
      throw new BadRequestException(
        'Invalid coordinate: This coordinate is already occupied',
      );
    }
    //     if(this.isHexGridExisted({subdomain})){
    //   throw new BadRequestException("Invalid subdomain: This subdomain is already occupied");
    // }
    // 业务校验 - 必须和现有的格子相邻
    if (
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

  async validateCoordinateSum({ x, y, z }) {
    this.logger.debug(`x+y+z`, x + y + z);
    if (x + y + z !== 0) {
      throw new BadRequestException(
        'Invalid coordinate: The sum of the coordinates must be zero',
      );
    }
  }

  async createSite(
    createSiteRequest: { title: string },
    user: JWTDecodedUser,
    accessToken: string,
  ) {
    // 分配子域名
    const subdomain = user.username || `user-${user.id}`;
    return {
      id: 0,
      url: 'https://subdomain.metaspace.xyz',
    };
  }

  async findOne(condition): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(condition);
  }

  async isHexGridExisted(condition): Promise<boolean> {
    return (await this.hexGridsRepository.count(condition)) > 0;
  }

  async findOneByCoordinate(x: number, y: number, z: number): Promise<HexGrid> {
    await this.validateCoordinateSum({ x, y, z });
    return await this.hexGridsRepository.findOne({ x, y, z });
  }

  async findOneBySubdomain(subdomain: string): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ subdomain });
  }

  async findOneByMetaSpaceSiteId(meta_space_site_id: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ meta_space_site_id });
  }

  async findOneByMetaSpaceSiteUrl(
    meta_space_site_url: string,
  ): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ meta_space_site_url });
  }

  async findByFilter(params: FindByFilterDto) {
    return this.hexGridsRepository
      .createQueryBuilder()
      .where({
        x: Between(params.x_min, params.x_max),
        y: Between(params.y_min, params.y_max),
        z: Between(params.z_min, params.z_max),
      })
      .orderBy({ id: 'ASC' })
      .limit(5000)
      .getMany();

    // return await this.hexGridsRepository.find({
    //   x: Between(params.x_min, params.x_max),
    //   y: Between(params.y_min, params.y_max),
    //   z: Between(params.z_min, params.z_max),
    // });
  }

  async countByFilter(params: FindByFilterDto) {
    return this.hexGridsRepository
      .createQueryBuilder()
      .where({
        x: Between(params.x_min, params.x_max),
        y: Between(params.y_min, params.y_max),
        z: Between(params.z_min, params.z_max),
      })
      .limit(5000)
      .getCount();
  }
}
