import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN ?? "https://digisupershop.netlify.app";
  app.enableCors({ origin: corsOrigin, credentials: true });

  const port = parseInt(process.env.PORT ?? "4000", 10);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
