import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { execPath } from 'node:process';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Validate that a path is in a known safe location for Node.js installations
const isValidNodePath = (path: string): boolean => {
  const isSystemPath =
    path.startsWith('/usr/bin/') || path.startsWith('/usr/local/bin/');
  const isHomebrewPath = path.startsWith('/opt/homebrew/bin/');
  const isNvmPath = /^\/Users\/[^/]+\/\.nvm\/versions\/node\/[^/]+\/bin\//.test(
    path
  );
  const isFnmPath = /^\/Users\/[^/]+\/\.fnm\/node-versions\/[^/]+\/bin\//.test(
    path
  );

  // Check for suspicious paths (we're rejecting these, not using them)
  const suspiciousPathPattern = /^\/(tmp|var\/tmp|var\/run)\//;
  const hasSuspiciousPath = suspiciousPathPattern.test(path);
  const hasPathTraversal = path.includes('..');

  if (hasSuspiciousPath || hasPathTraversal) {
    return false;
  }

  return isSystemPath || isHomebrewPath || isNvmPath || isFnmPath;
};

// Get npm path from Node.js installation directory to avoid PATH dependency
// npm is typically in the same directory as node executable
// This function returns a safe, validated path to npm executable
const getNpmPath = (): string => {
  const nodeDir = execPath.replace(/node$/, '');
  // On Unix systems, npm is typically alongside node
  const npmPath = `${nodeDir}npm`;

  if (!isValidNodePath(npmPath)) {
    throw new Error('Invalid npm path detected - security check failed');
  }

  return npmPath;
};

// Get a safe PATH for npm scripts (npm needs node and sh in PATH)
// Returns a minimal PATH with only: node directory, /bin, and /usr/bin
const getSafePath = (): string => {
  const nodeDir = execPath.replace(/node$/, '');
  // Remove trailing slash if present
  const cleanDir = nodeDir.endsWith('/') ? nodeDir.slice(0, -1) : nodeDir;

  if (!isValidNodePath(`${cleanDir}/npm`)) {
    throw new Error('Invalid node directory detected - security check failed');
  }

  // Include node directory, /bin (for sh), and /usr/bin (for other common tools)
  // This is safe because these are standard system directories, not user-controlled
  return `${cleanDir}:/bin:/usr/bin`;
};

@Injectable()
export class DatabaseSeedingService {
  private readonly logger = new Logger(DatabaseSeedingService.name);

  constructor(private readonly configService: ConfigService) {}

  public runDevelopmentSeeding(): { success: boolean; message: string } {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv === 'production') {
      throw new Error(
        'Development seeding is not allowed in production environment'
      );
    }

    this.logger.log('🌱 Starting development database seeding...');

    try {
      // Use minimal env with safe PATH (node directory + /bin + /usr/bin)
      // npm needs node and sh in PATH to run scripts
      const safePath = getSafePath();
      const essentialEnv: NodeJS.ProcessEnv = {
        NODE_ENV: process.env.NODE_ENV ?? 'development',
        HOME: process.env.HOME,
        DATABASE_URL: process.env.DATABASE_URL, // Required by Prisma CLI
        PATH: safePath, // Minimal safe PATH: node dir, /bin, /usr/bin
      };
      // Safe: npmPath is derived from process.execPath (system-controlled) and validated
      // Command is constructed from validated npm path + fixed string 'run db:seed:dev'
      // No user input is used in command construction
      const npmPath = getNpmPath();
      // Use spawnSync with array arguments to avoid shell injection
      const result: SpawnSyncReturns<Buffer> = spawnSync(
        npmPath,
        ['run', 'db:seed:dev'],
        {
          stdio: 'inherit',
          env: essentialEnv,
        }
      );

      if (result.error != null) {
        throw result.error;
      }
      const exitCode = result.status;
      if (exitCode != null && exitCode !== 0) {
        throw new Error(`Command failed with exit code ${exitCode}`);
      }
      this.logger.log('✅ Development database seeding completed');

      return {
        success: true,
        message: 'Development database seeding completed successfully',
      };
    } catch (error) {
      this.logger.error('❌ Development seeding failed:', error);
      throw new Error(
        `Development seeding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public runProductionSeeding(): { success: boolean; message: string } {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv !== 'production') {
      throw new Error(
        'Production seeding is only allowed in production environment'
      );
    }

    this.logger.log('🏭 Starting production database seeding...');

    try {
      // Use minimal env with safe PATH (node directory + /bin + /usr/bin)
      // npm needs node and sh in PATH to run scripts
      const safePath = getSafePath();
      const essentialEnv: NodeJS.ProcessEnv = {
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        HOME: process.env.HOME,
        DATABASE_URL: process.env.DATABASE_URL, // Required by Prisma CLI
        PATH: safePath, // Minimal safe PATH: node dir, /bin, /usr/bin
      };
      // Safe: npmPath is derived from process.execPath (system-controlled) and validated
      // Command is constructed from validated npm path + fixed string 'run db:seed:prod'
      // No user input is used in command construction
      const npmPath = getNpmPath();
      // Use spawnSync with array arguments to avoid shell injection
      const result: SpawnSyncReturns<Buffer> = spawnSync(
        npmPath,
        ['run', 'db:seed:prod'],
        {
          stdio: 'inherit',
          env: essentialEnv,
        }
      );

      if (result.error != null) {
        throw result.error;
      }
      const exitCode = result.status;
      if (exitCode != null && exitCode !== 0) {
        throw new Error(`Command failed with exit code ${exitCode}`);
      }
      this.logger.log('✅ Production database seeding completed');

      return {
        success: true,
        message: 'Production database seeding completed successfully',
      };
    } catch (error) {
      this.logger.error('❌ Production seeding failed:', error);
      throw new Error(
        `Production seeding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
