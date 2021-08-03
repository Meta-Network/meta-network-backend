import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HexGrid } from '../entities/hex-grid.entity';

@Injectable()
export class HexGridsService {
  constructor(
    @InjectRepository(HexGrid)
    private hexGridsRepository: Repository<HexGrid>,
  ) {}

  async findOne(id: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne(id);
  }

  async findByCoordinate(x: number, y: number, z: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ x, y, z });
  }

  async findBySubdomain(subdomain: string): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ subdomain });
  }

  async findByMetaSpaceSiteId(meta_space_site_id: number): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ meta_space_site_id });
  }

  async findByMetaSpaceSiteUrl(meta_space_site_url: string): Promise<HexGrid> {
    return await this.hexGridsRepository.findOne({ meta_space_site_url });
  }
}
