import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/version")
  @ApiOperation({
    summary: "Version information",
  })
  getVersion() {
    return {
      version: this.appService.getVersion(),
    };
  }
}
