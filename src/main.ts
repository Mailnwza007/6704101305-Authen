// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ property ที่ไม่ได้ระบุใน DTO ออก
      forbidNonWhitelisted: true, // แจ้งข้อผิดพลาดถ้ามี property ที่ไม่ได้ระบุใน DTO
      transform: true,// แปลง payload ให้ตรงกับประเภทใน DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
