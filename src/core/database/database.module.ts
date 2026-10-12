import { Global, Module } from '@nestjs/common';

import { DatabaseSeedingController } from './database-seeding.controller';
import { DatabaseInitializerService } from './services/database-initializer.service';
import { DatabaseSeedingService } from './services/database-seeding.service';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  controllers: [DatabaseSeedingController],
  providers: [
    PrismaService,
    DatabaseInitializerService,
    DatabaseSeedingService,
  ],
  exports: [PrismaService, DatabaseInitializerService, DatabaseSeedingService],
})
export class DatabaseModule {}
