import { spawnSync } from 'node:child_process';
import { execPath } from 'node:process';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from './prisma.service';

// Get npm path from Node.js installation directory to avoid PATH dependency
const getNpmPath = (): string => {
  const nodeDir = execPath.replace(/node$/, '');
  const npmPath = `${nodeDir}npm`;

  // Security check: Allow trusted installation paths
  const trustedPrefixes = [
    '/usr', // System paths
    '/opt', // System paths
    '/usr/local', // Homebrew (Intel Macs)
    '/opt/homebrew', // Homebrew (Apple Silicon)
  ];

  // Allow nvm installations in home directory (common development setup)
  const isNvmPath =
    npmPath.includes('/.nvm/') && npmPath.startsWith(process.env.HOME ?? '');

  const isTrustedPath = trustedPrefixes.some((prefix) =>
    npmPath.startsWith(prefix)
  );

  if (!isTrustedPath && !isNvmPath) {
    throw new Error(
      `Invalid npm path detected - security check failed. Path: ${npmPath}`
    );
  }

  return npmPath;
};

@Injectable()
export class DatabaseInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.logger.log('🗄️ Starting database initialization...');

      // Step 1: Wait for database connection
      await this.waitForDatabase();

      // Step 2: Run migrations
      this.runMigrations();

      this.logger.log('✅ Database initialization completed successfully');
    } catch (error) {
      this.logger.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async waitForDatabase(
    maxRetries = 30,
    retryDelay = 2000
  ): Promise<void> {
    this.logger.log('⏳ Waiting for database connection...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        this.logger.log('✅ Database connection established');
        return;
      } catch {
        this.logger.warn(
          `⏳ Database connection attempt ${attempt}/${maxRetries} failed, retrying...`
        );

        if (attempt === maxRetries) {
          throw new Error(
            `Database connection failed after ${maxRetries} attempts`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  private runMigrations(): void {
    this.logger.log('🔄 Running database migrations...');

    try {
      // Get node directory from execPath to construct minimal secure PATH
      const nodeDir = execPath.replace(/node$/, '');
      const npmPath = getNpmPath();

      // Use minimal env with essential system directories in PATH
      // npm scripts need: node (from nodeDir), sh (from /bin), and other system utilities
      // We only include trusted system directories to prevent PATH injection
      const essentialEnv: NodeJS.ProcessEnv = {
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        HOME: process.env.HOME,
        PATH: `${nodeDir}:/bin:/usr/bin`, // Node dir + system bins (sh, etc.) - secure
        DATABASE_URL: process.env.DATABASE_URL, // Required by Prisma CLI
      };

      // Use spawnSync with array arguments to avoid shell injection
      const result = spawnSync(npmPath, ['run', 'prisma:migrate:deploy'], {
        stdio: 'inherit',
        env: essentialEnv,
        cwd: process.cwd(), // Ensure we're in the project directory
      });

      if (result.error != null) {
        throw result.error;
      }
      if (result.status !== 0) {
        throw new Error(
          `Command failed with exit code ${result.status ?? 'unknown'}`
        );
      }

      this.logger.log('✅ Database migrations completed successfully');
    } catch (error) {
      this.logger.error('❌ Database migrations failed:', error);
      throw error;
    }
  }

  // Health check method
  public async checkDatabaseStatus(): Promise<boolean> {
    try {
      // Check if database is accessible
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database status check failed:', error);
      return false;
    }
  }
}
