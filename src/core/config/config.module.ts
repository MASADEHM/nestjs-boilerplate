import { ConfigService } from '@core/config/config.service';
import { configValidationSchema } from '@core/config/config.validation';
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global() // Make the ConfigModule available globally
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Load environment variables from .env file
      validationSchema: configValidationSchema, // Validate the environment variables
      validationOptions: {
        allowUnknown: true, // Allow unknown keys in the environment variables
        abortEarly: false, // Shows all validation errors, not just the first
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
