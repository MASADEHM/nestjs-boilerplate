import { PrismaService } from '@core/database/services/prisma.service';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  public async healthCheck(@Res() res: Response): Promise<Response> {
    const healthChecks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: await this.checkDatabase(),
        redis: this.checkRedis(),
        environment: this.checkEnvironment(),
      },
    };

    const isHealthy = Object.values(healthChecks.checks).every(
      (check) => check.status === 'ok'
    );

    const statusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    if (!isHealthy) {
      healthChecks.status = 'error';
    }

    return res.status(statusCode).json(healthChecks);
  }

  private async checkDatabase(): Promise<{
    status: 'ok' | 'error';
    message: string;
    error?: string;
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      return {
        status: 'ok',
        message: 'Database connection successful',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  }

  private checkRedis(): {
    status: 'ok' | 'warning' | 'error';
    message: string;
    host?: string;
    port?: string;
    error?: string;
    responseTime: number;
  } {
    try {
      // Since we're using Bull for Redis, we can check if Redis is available
      // by checking if the REDIS_HOST environment variable is set
      const redisHost = this.configService.get<string>('REDIS_HOST');
      const redisPort = this.configService.get<string>('REDIS_PORT');

      if (redisHost == null || redisHost === '') {
        return {
          status: 'warning',
          message: 'Redis configuration not found',
          responseTime: Date.now(),
        };
      }

      return {
        status: 'ok',
        message: 'Redis configuration available',
        host: redisHost,
        port: redisPort,
        responseTime: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Redis check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now(),
      };
    }
  }

  private checkEnvironment(): {
    status: 'ok';
    nodeEnv?: string;
    port?: string;
    nodeVersion: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    responseTime: number;
  } {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const port = this.configService.get<string>('PORT');

    return {
      status: 'ok',
      nodeEnv,
      port,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      responseTime: Date.now(),
    };
  }
}
