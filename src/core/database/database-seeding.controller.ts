import { DbSeederBasicAuthGuard } from '@core/database/guards/db-seeder-basic-auth.guard';
import { DatabaseSeedingService } from '@core/database/services';
import { Controller, Post, UseGuards } from '@nestjs/common';

@Controller('admin/database/seed')
@UseGuards(DbSeederBasicAuthGuard)
export class DatabaseSeedingController {
  constructor(private readonly seedingService: DatabaseSeedingService) {}

  @Post('development')
  public runDevelopmentSeeding(): { success: boolean; message: string } {
    return this.seedingService.runDevelopmentSeeding();
  }

  @Post('production')
  public runProductionSeeding(): { success: boolean; message: string } {
    return this.seedingService.runProductionSeeding();
  }
}
