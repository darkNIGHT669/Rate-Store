import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Seed default admin on first boot
  const authService = app.get(AuthService);
  await authService.seedAdmin();

  await app.listen(process.env.PORT || 4000);
  console.log(`\n🚀 API running at http://localhost:${process.env.PORT || 4000}/api`);
  console.log(`👤 Admin: admin@platform.com / Admin@123\n`);
}
bootstrap();
