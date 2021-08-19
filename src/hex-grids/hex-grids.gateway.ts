import { Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  OnGatewayInit,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { AnyARecord } from 'node:dns';
import { Observable, Subject, map, filter } from 'rxjs';
import loadConfig from '../config/configuration';
import { HexGrid } from '../entities/hex-grid.entity';
import { FindByFilterDto } from './dto/find-by-filter.dto';
import { HexGridsEvent } from './hex-grids.constant';
import { Server } from 'socket.io';
const { app } = loadConfig();
// @WebSocketGateway(app.port, { namespace: 'hex-grids' })
@WebSocketGateway({
  namespace: 'hex-grids',
  origin: ['*'],
  cors: true,
})
export class HexGridsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  private readonly logger = new Logger(HexGridsGateway.name);
  // constructor(private readonly hexGridsService: HexGridsService) {}
  // private readonly occupyHexGridSubject = new Subject<HexGrid>();
  private server: Server;
  afterInit(server: any) {
    // console.log(server);
    this.logger.log(server);
    this.server = server;
  }

  handleDisconnect(client: AnyARecord) {
    this.logger.debug(client);
  }
  handleConnection(client: any, ...args: any[]) {
    this.logger.debug(`Client ${client.id} is connected`);
  }
  @OnEvent(HexGridsEvent.OCCUPIED)
  async handleAppHexGridOccupiedEvent(payload: HexGrid) {
    // this.occupyHexGridSubject.next(payload);
    this.server.emit(HexGridsEvent.OCCUPIED, payload);
  }

  // @SubscribeMessage(HexGridsEvent.OCCUPIED)
  // handleWsHexGridOccupiedEvent(
  //   @MessageBody() data: FindByFilterDto,
  // ): Observable<WsResponse<HexGrid>> {
  //   //TODO 可以考虑在data里添加filter
  //   console.log(data);
  //   return this.occupyHexGridSubject
  //     .pipe(
  //       filter((item) => {
  //         return !(
  //           (data.xMin && item.x < data.xMin) ||
  //           (data.xMax && item.x > data.xMax) ||
  //           (data.yMin && item.y < data.yMin) ||
  //           (data.yMax && item.y > data.yMax) ||
  //           (data.zMin && item.z < data.zMin) ||
  //           (data.zMax && item.z > data.zMax)
  //         );
  //       }),
  //     )
  //     .pipe(map((item) => ({ event: HexGridsEvent.OCCUPIED, data: item })));
  // }
}
