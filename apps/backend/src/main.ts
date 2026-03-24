import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { NextService } from './next/next.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS if needed
  app.enableCors();

  const apiPrefix = 'api';
  app.setGlobalPrefix(apiPrefix);

  // Swagger setup — must be before Next.js middleware
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Auto-generated API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const nextService = app.get(NextService);
  await nextService.ensureReady();
  const handle = nextService.getRequestHandler();
  const server = app.getHttpAdapter().getInstance();

  // Forward everything that is not under /api to Next.js
  server.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith(`/${apiPrefix}`)) {
      return next();
    }

    try {
      await handle(req, res);
    } catch (error) {
      next(error);
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
  console.log(`🎨 Next.js frontend served at http://localhost:${port}`);
}
bootstrap();
