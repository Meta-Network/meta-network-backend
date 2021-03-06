import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JWTAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/jwt-user.decorator';
import { JWTDecodedUser } from '../auth/type';
import { ApiGeneralArrayResponse } from '../decorators/api-general-array-response.decorator';
import { ApiGeneralResponse } from '../decorators/api-general-response.decorator';
import { GeneralResponseDto } from '../dto/general-response.dto';
import { HexGrid } from '../entities/hex-grid.entity';
import { FindByFilterDto } from './dto/find-by-filter.dto';
import { FindOneByCoordinateDto } from './dto/find-one-by-coordinate.dto';
import { FindOneBySiteUrlDto } from './dto/find-one-by-site-url.dto';
import { OccupyHexGridDto } from './dto/occupy-hex-grid.dto';
import { HexGridsService } from './hex-grids.service';

@ApiTags('hex-grids')
@ApiGeneralResponse(HexGrid)
@ApiUnauthorizedResponse({
  description: '当 Cookies 中的{accessToken}过期或无效时返回',
})
@ApiExtraModels(GeneralResponseDto, HexGrid)
@Controller('hex-grids')
export class HexGridsController {
  private readonly logger = new Logger(HexGridsController.name);

  constructor(private readonly hexGridsService: HexGridsService) {}

  @ApiOperation({
    summary: '获取当前用户占领的地块。如果还没有，不返回data部分',
  })
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @Get('mine')
  async findMyHexGrid(@CurrentUser() user: JWTDecodedUser) {
    this.logger.debug('findMyHexGrid', user);
    return this.hexGridsService.findOneByUserId(user.id);
  }

  @ApiOperation({
    summary: '根据ID获取单个地块。如果没有符合条件的地块，不返回data部分',
  })
  @Get(':id(\\d+)')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.hexGridsService.findOne(id);
  }

  @ApiOperation({
    summary: '根据坐标定位地块。如果没有找到，不返回data部分',
  })
  @Get('location/by-coordinate')
  async findOneByCooridnate(
    @Query()
    params: FindOneByCoordinateDto,
  ) {
    this.logger.debug(`findOneByCoordinateDto`, params);
    const { x, y, z } = params;
    return await this.hexGridsService.findOneByCoordinate(x, y, z);
  }
  @ApiOperation({
    description: '根据子域名定位地块。如果没有找到，不返回data部分',
  })
  @Get('location/by-subdomain/:subdomain')
  async findOneBySubdomain(@Param('subdomain') subdomain: string) {
    return await this.hexGridsService.findOneBySubdomain(subdomain);
  }
  @ApiOperation({
    summary: '根据用户ID查询其占领地块。如果没有找到，不返回data部分',
  })
  @Get('location/by-user-id/:userId')
  async findOneByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.hexGridsService.findOneByUserId(userId);
  }
  @ApiOperation({
    summary: '根据站点ID查询其占领地块。如果没有找到，不返回data部分',
  })
  @Get('location/by-meta-sapce-site-id/:metaSpaceSiteId')
  async findOneByMetaSpaceSiteId(
    @Param('metaSpaceSiteId', ParseIntPipe) metaSpaceSiteId: number,
  ) {
    return await this.hexGridsService.findOneByMetaSpaceSiteId(metaSpaceSiteId);
  }

  @ApiOperation({
    summary: '根据MetaSpace URL定位地块。如果没有找到，不返回data部分',
  })
  @Get('location/by-site-url')
  async findOneBySiteUrl(@Query() params: FindOneBySiteUrlDto) {
    const { siteUrl } = params;
    return await this.hexGridsService.findOneByMetaSpaceSiteUrl(siteUrl);
  }
  @ApiOperation({
    summary: '根据条件查询已被占领的地块。如果没有找到，data部分为空数组',
  })
  @ApiGeneralArrayResponse(HexGrid)
  @HttpCode(HttpStatus.OK)
  @Post('by-filter')
  async findByFilter(@Body() params: FindByFilterDto) {
    this.logger.debug('findByFilter', params);
    // return [];
    return await this.hexGridsService.findByFilter(params);
  }

  @ApiOperation({
    summary: '根据条件统计已被占用的地块数量',
  })
  @ApiGeneralResponse(Number)
  @HttpCode(HttpStatus.OK)
  @Post('count/by-filter')
  async countByFilter(@Body() params: FindByFilterDto) {
    this.logger.debug('countByFilter', params);
    // return [];
    return await this.hexGridsService.countByFilter(params);
  }

  @ApiOperation({
    summary: '获取不可用区域半径',
  })
  @ApiGeneralResponse(Number)
  @Get('forbidden-zone/radius')
  async getForbiddenZoneRadius() {
    return await this.hexGridsService.getForbiddenZoneRadius();
  }

  @ApiOperation({
    summary: '校验坐标是否可用',
  })
  @ApiGeneralResponse(Boolean)
  @ApiConflictResponse({
    description: '指定地块已被占领等唯一性冲突的情况下返回',
  })
  @Put('coordinate/validation')
  async validateCoordinate(@Body() occupyHexGridDto: OccupyHexGridDto) {
    await this.hexGridsService.validateCoordinate(occupyHexGridDto);
    return true;
  }

  @ApiOperation({
    summary: '占领地块',
  })
  @ApiGeneralResponse(HexGrid, '地块占领信息', HttpStatus.CREATED)
  @ApiBadRequestResponse({
    description: '指定的坐标不符合要求的情况下返回',
  })
  @ApiConflictResponse({
    description: '已经占领过地块、指定地块已被占领等唯一性冲突的情况下返回',
  })
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @Post()
  async occupyHexGrid(
    @CurrentUser() user: JWTDecodedUser,
    @Req() req: Request,
    @Body() occupyHexGridDto: OccupyHexGridDto,
  ) {
    return await this.hexGridsService.occupy(occupyHexGridDto, user);
  }
}
