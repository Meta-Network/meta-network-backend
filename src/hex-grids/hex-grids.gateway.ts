import { Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridsEvent } from './hex-grids.constant';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'hex-grids',
  origin: ['*'],
  cors: true,
})
export class HexGridsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  private readonly logger = new Logger(HexGridsGateway.name);

  private server: Server;
  afterInit(server: Server) {
    this.logger.log(server);
    this.server = server;
  }

  handleDisconnect(client: any) {
    this.logger.debug(client);
  }
  handleConnection(client: any, ...args: any[]) {
    this.logger.debug(`Client ${client.id} is connected`);
  }
  @OnEvent(HexGridsEvent.OCCUPIED)
  async handleAppHexGridOccupiedEvent(payload: HexGrid) {
    this.server.emit(HexGridsEvent.OCCUPIED, payload);
  }
}
