/* istanbul ignore file */
import "newrelic";

import { NestFactory } from "@nestjs/core";

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { ConfigService } from "@selinarnd/nest-config";
import { getPackageInfo } from "@selinarnd/node-utils";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // callse express() under the hood

  const configService = app.get(ConfigService);

  if (configService.get("NODE_ENV") !== "production") {
    app.enableCors();
    createSwaggerSite(app);
  }


  const port = normalizePort(configService.get("PORT", { defaultValue: 3000 }));
  await app.listen(port);
}

function createSwaggerSite(app) {
  const swaggerOptions = new DocumentBuilder()
    .setTitle("first-microservice")
    .setDescription("my first microservice that will act like proxy probably")
    .setVersion(getPackageInfo().version)
    .addServer("https://", "http")
    .addServer("http://", "http")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup("swagger", app, document);
}

/**
 * Normalize a port into a number, string, or false.
 *
 * Same function as the one provided by Express' application generator.
 */
function normalizePort(val: any) {
  const portNumber = parseInt(val, 10);

  if (isNaN(portNumber)) {
    // Named pipe
    return val;
  }

  if (portNumber >= 0) {
    return portNumber;
  }

  return false;
}

bootstrap();
