import { Test, TestingModule } from "@nestjs/testing";
import { getPackageInfo } from "@selinarnd/node-utils";
import { AppController } from "../../src/app.controller";
import { AppService } from "../../src/app.service";

describe("AppController", () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET version", () => {
    it("should return the current version of the API", () => {
      const appController = app.get(AppController);
      expect(appController.getVersion()).toEqual({
        version: getPackageInfo().version,
      });
    });
  });
});
