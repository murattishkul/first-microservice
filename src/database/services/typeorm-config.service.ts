import { Injectable } from "@nestjs/common";
import { TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { ConfigService } from "@selinarnd/nest-config";
import path from "path";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const TYPEORM_ENTITIES_DIR = path.resolve(__dirname, "..", "entities", "**");

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): PostgresConnectionOptions {
    return {
      type: "postgres",
      host: this.configService.get("TYPEORM_HOST"),
      port: this.configService.get("TYPEORM_PORT"),
      database: this.configService.get("TYPEORM_DATABASE"),
      username: this.configService.get("TYPEORM_USERNAME"),
      password: this.configService.get("TYPEORM_PASSWORD"),
      entities: [TYPEORM_ENTITIES_DIR],
      logging: this.configService.get("TYPEORM_LOGGING", {
        defaultValue: false,
      }),
      synchronize: this.configService.get("TYPEORM_SYNCHRONIZE", {
        defaultValue: false,
      }),
    };
  }
}
