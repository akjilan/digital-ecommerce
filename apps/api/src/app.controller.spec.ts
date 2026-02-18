import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return { message: "API is running" }', () => {
      expect(appController.getRoot()).toEqual({ message: "API is running" });
    });
  });

  describe("health", () => {
    it("should return { ok: true, service: 'api' }", () => {
      expect(appController.getHealth()).toEqual({ ok: true, service: "api" });
    });
  });
});
