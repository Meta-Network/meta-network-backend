import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProviderOptions,
  RedisOptions,
  Transport,
} from '@nestjs/microservices';
import {
  HealthCheckService,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private ms: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      async () =>
        this.ms.pingCheck(
          'microservice_ucenter',
          this.configService.get('microservice.clients.ucenter'),
        ),
      async () =>
        this.ms.pingCheck(
          'microservice_cms',
          this.configService.get('microservice.clients.cms'),
        ),
      async () => {
        const pass = this.configService.get<string>('redis.pass');
        const options = {
          url: `redis://${this.configService.get<string>(
            'redis.host',
          )}:${this.configService.get<number>('redis.port')}`,
          password: undefined,
        };
        console.log(options);
        if (pass !== undefined && pass !== null && pass.trim() !== '') {
          options.password = pass;
        }
        return this.ms.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options,
        });
      },
    ]);
  }
}
