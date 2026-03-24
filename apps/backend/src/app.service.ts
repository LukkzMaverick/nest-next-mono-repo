import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStatus() {
    try {
      const dbHealth = await this.prismaService.$queryRaw<
        Array<{ now: Date; connected: number }>
      >`SELECT NOW() as now, 1 as connected`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'NestJS API is running',
        service: 'NestJS + Next.js Monorepo',
        database: dbHealth[0] ?? null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        message: 'NestJS API is running, but PostgreSQL connection failed',
        service: 'NestJS + Next.js Monorepo',
        databaseError: message,
        database: null,
      };
    }
  }
}
