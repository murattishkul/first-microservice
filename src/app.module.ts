import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@selinarnd/nest-config";
import { CoreModule } from "@selinarnd/nest-core";
import { LoggingModule } from "@selinarnd/nest-logging";
import { PromModule, RequestMetricsInterceptor } from "@selinarnd/nest-prom";
import { getPackageInfo } from "@selinarnd/node-utils";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { TypeOrmConfigService } from "./database/services/typeorm-config.service";
import { APIModule } from "./modules/api/api.module";

@Module({
  imports: [
    CoreModule,
    ConfigModule.register(),
    LoggingModule.register(),
    PromModule.forRoot({
      defaultLabels: {
        app: `v${getPackageInfo().version}`,
      },
      useHttpMetricsInterceptor: true,
    }),
        TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    APIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
  ],
})
export class AppModule {
      // @ts-ignore
    constructor(private readonly connection: Connection) {}
}
