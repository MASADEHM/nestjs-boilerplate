# Files Cron Services

This directory contains cron services for automated file management tasks.

## Services

### FilesCronService
- **Purpose**: Main cron orchestrator for file-related scheduled tasks
- **Schedule**: Runs every hour (`CronExpression.EVERY_HOUR`)
- **Timezone**: Asia/Dubai
- **Features**:
  - Automatic cleanup of temporary files older than 2 hours
  - Storage space monitoring and reporting
  - Error handling and logging
  - Manual trigger capability for testing

### TempFileCleanupService
- **Purpose**: Handles the actual cleanup logic for temporary files
- **Features**:
  - Identifies temporary files older than 2 hours (`is_temp = true` and `created_at < 2 hours ago`)
  - Deletes files from both physical storage and database
  - Provides statistics about temporary files
  - Handles both public and private file storage
  - Graceful error handling for missing files

## How It Works

1. **Hourly Trigger**: The cron job runs every hour at minute 0
2. **File Discovery**: Finds all files where `is_temp = true` and `created_at < (now - 2 hours)`
3. **Physical Deletion**: Removes files from storage (local or Azure Blob)
4. **Database Cleanup**: Deletes file records from the database
5. **Logging**: Reports success/failure and storage space saved

## Configuration

The cron job uses:
- **Frequency**: Every hour (`0 * * * *`)
- **Timezone**: Asia/Dubai
- **Cleanup Threshold**: 2 hours
- **Storage Providers**: Supports both local and Azure Blob storage

## Usage

### Automatic (Production)
The cron job runs automatically when the application starts.

### Manual Trigger (Testing/Development)
```typescript
// Inject the service
constructor(private readonly filesCronService: FilesCronService) {}

// Trigger manual cleanup
await this.filesCronService.triggerManualCleanup();

// Get statistics
const stats = await this.filesCronService.getTempFileStatistics();
```

## Monitoring

The service provides detailed logging:
- ✅ Successful operations
- ⚠️ Warnings for missing files
- ❌ Errors with detailed messages
- 📊 Statistics about cleaned files and saved space

## Example Log Output

```
🧹 Starting hourly temporary file cleanup cron job at 2024-01-15T10:00:00.000Z
📊 Before cleanup: 15 total temp files, 8 expired, 12.45 MB total size
🧹 Starting temporary file cleanup process
📁 Found 8 temporary files to cleanup
🗑️ Deleted temporary file: temp-upload-123.pdf (ID: 456)
✅ Hourly temp file cleanup completed successfully: 8 files deleted from 8 processed
💾 Freed up 8.23 MB of storage space
```

## Error Handling

- **Missing Physical Files**: Logs warning but continues with database cleanup
- **Storage Errors**: Logs error but attempts to clean database record
- **Database Errors**: Logs error and continues with next file
- **Complete Failures**: Logs error and returns failure status with details
