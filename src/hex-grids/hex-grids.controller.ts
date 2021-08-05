import {
  Controller,
  Get,
  Body,
  Post,
  Req,
  Param,
  ParseIntPipe,
  Query,
  Put,
  HttpStatus,
  Logger,
  HttpCode,
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
import { CurrentUser } from 'src/auth/jwt-user.decorator';
import { JWTDecodedUser } from 'src/auth/type';
import { HexGrid } from 'src/entities/hex-grid.entity';
import { CreateHexGridSiteDto } from './dto/create-hex-grid-site.dto';
import { OccupyHexGridDto } from './dto/occupy-hex-grid.dto';
import { HexGridsService } from './hex-grids.service';
import { FindOneByCoordinateDto } from './dto/find-one-by-coordinate.dto';
import { FindOneBySiteUrlDto } from './dto/find-one-by-site-url.dto';
import { FindOneBySubdomainDto } from './dto/find-one-by-subdomain.dto';
import { GeneralResponseDto } from 'src/dto/general-response.dto';
import { ApiGeneralResponse } from 'src/decorators/api-general-response.decorator';
import { FindByFilterDto } from './dto/find-by-filter.dto';
import { ApiGeneralArrayResponse } from 'src/decorators/api-general-array-response.decorator';

@ApiTags('hex-grids')
@ApiCookieAuth()
@ApiGeneralResponse(HexGrid, '调用成功', HttpStatus.OK)
@ApiUnauthorizedResponse({
  description: '当 Cookies 中的{accessToken}过期或无效时',
})
@ApiExtraModels(GeneralResponseDto, HexGrid)
@Controller('hex-grids')
export class HexGridsController {
  private readonly logger = new Logger(HexGridsController.name);

  constructor(
    private readonly hexGridsService: HexGridsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '根据ID获取单个地块。如果没有符合条件的地块，不返回data部分',
  })
  @Get(':id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.hexGridsService.findOne({ id });
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
  @ApiGeneralArrayResponse(HexGrid, '调用成功', HttpStatus.OK)
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
    summary: '获取当前账号占领的地块。如果还没有，不返回data部分',
  })
  @Get('mine')
  async findMyHexGrid(@CurrentUser() user: JWTDecodedUser) {
    return this.hexGridsService.findOne({ userId: user.id });
  }

  @ApiOperation({
    summary: '校验坐标是否可用',
  })
  @ApiGeneralResponse(Boolean)
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
  @Post()
  async occupyHexGrid(
    @CurrentUser() user: JWTDecodedUser,
    @Req() req: Request,
    @Body() occupyHexGridDto: OccupyHexGridDto,
  ) {
    return await this.hexGridsService.occupy(occupyHexGridDto, user);
  }

  @ApiOperation({
    summary: '在占领的地块上建站',
  })
  @Post('site')
  async createHexGridSite(
    @CurrentUser() user: JWTDecodedUser,
    @Req() req: Request,
    @Body() createHexGridSiteDto: CreateHexGridSiteDto,
  ) {
    const accessToken =
      req.cookies[this.configService.get<string>('jwt.access_token_key')];

    return await this.hexGridsService.createHexGridSite(
      createHexGridSiteDto,
      user,
      accessToken,
    );
  }
}
