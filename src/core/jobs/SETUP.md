# Job Queue System

## Overview

Background job processing with **BullMQ** + **Redis** and **Cron Jobs** with **@nestjs/schedule**.
Jobs include email sending, payment expiry checks, booking notifications, and scheduled maintenance
tasks.

## Dashboard Access

- **URL**: `http://localhost:3000/admin/jobs/board` (excluded from `/api` prefix)
- **Username**: `admin`
- **Password**: `12345`
- **Authentication**: Basic Auth (browser will prompt)

**Note**: Bull Board route is excluded from the global `/api` prefix to prevent path-to-regexp warnings from its internal wildcard routing.

## How to Use Jobs

### 1. Import Service and Constants

```typescript
import { JobQueueService } from '@jobs/services/job-queue.service';
import { QUEUE_NAMES, JobType, JobPriority } from '@jobs/types/job.types';
```

### 2. Inject Service

```typescript
constructor(private readonly jobQueue: JobQueueService) {}
```

### 3. Add Jobs

#### Send Email Job

```typescript
await this.jobQueue.addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome to Marsa',
  template: 'welcome',
  data: {
    userName: 'John Doe',
    loginUrl: 'https://app.Marsa.com/login',
  },
});
```

#### Schedule Payment Expiry Check

```typescript
await this.jobQueue.addPaymentExpiryJob({
  bookingRequestId: 123,
  expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
});
```

#### Add Custom Job

```typescript
await this.jobQueue.addJob(
  QUEUE_NAMES.BOOKING,
  JobType.BOOKING_REMINDER,
  { bookingId: 456, reminderType: 'checkin' },
  {
    priority: JobPriority.HIGH,
    delay: 60000, // 1 minute delay
  }
);
```

## Available Constants

### Queue Names

```typescript
QUEUE_NAMES.DEFAULT; // 'default'
QUEUE_NAMES.EMAIL; // 'email'
QUEUE_NAMES.BOOKING; // 'booking'
```

### Job Types

```typescript
JobType.EMAIL_SEND; // 'email:send'
JobType.PAYMENT_EXPIRY_CHECK; // 'payment:expiry-check'
JobType.BOOKING_REMINDER; // 'booking:reminder'
JobType.BOOKING_CONFIRMATION; // 'booking:confirmation'
```

### Job Priorities

```typescript
JobPriority.CRITICAL; // 1 (highest)
JobPriority.HIGH; // 2
JobPriority.MEDIUM; // 3
JobPriority.LOW; // 4
JobPriority.BACKGROUND; // 5 (lowest)
```

## Adding New Jobs/Queues

### 1. Add New Queue Name

Edit `src/jobs/types/job.types.ts`:

```typescript
export const QUEUE_NAMES = {
  DEFAULT: 'default',
  EMAIL: 'email',
  BOOKING: 'booking',
  PAYMENT: 'payment', // 👈 Add new queue
} as const;
```

### 2. Add New Job Type

```typescript
export const JobType = {
  EMAIL_SEND: 'email:send',
  PAYMENT_EXPIRY_CHECK: 'payment:expiry-check',
  BOOKING_REMINDER: 'booking:reminder',
  BOOKING_CONFIRMATION: 'booking:confirmation',
  PAYMENT_PROCESS: 'payment:process', // 👈 Add new job type
} as const;
```

### 3. Add Method to JobQueueService

Edit `src/jobs/services/job-queue.service.ts`:

```typescript
async addPaymentProcessJob(
  data: { bookingId: number; amount: number; gateway: string },
  options?: JobOptions
): Promise<Job> {
  return this.addJob(
    QUEUE_NAMES.PAYMENT,
    JobType.PAYMENT_PROCESS,
    data,
    {
      priority: JobPriority.HIGH,
      attempts: JOB_CONFIG.CRITICAL_ATTEMPTS,
      ...options,
    }
  );
}
```

### 4. Create Job Processor

Create `src/jobs/processors/payment.processor.ts`:

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { JobType } from '@jobs/types/job.types';

@Processor('payment')
export class PaymentProcessor {
  @Process(JobType.PAYMENT_PROCESS)
  async processPayment(job: Job) {
    const { bookingId, amount, gateway } = job.data;

    // Your payment processing logic here
    console.log(`Processing payment for booking ${bookingId}`);

    // Return result or throw error for retry
    return { success: true, transactionId: 'txn_123' };
  }
}
```

### 5. Register Processor in JobsModule

Edit `src/jobs/jobs.module.ts`:

```typescript
import { PaymentProcessor } from './processors/payment.processor';

@Module({
  // ... existing config
  providers: [
    JobQueueService,
    EmailProcessor,
    PaymentProcessor, // 👈 Add new processor
  ],
})
export class JobsModule {}
```

## Best Practices

### ✅ DO

```typescript
// Use constants, not strings
await this.jobQueue.addJob(QUEUE_NAMES.EMAIL, JobType.EMAIL_SEND, data);

// Set appropriate priorities
await this.jobQueue.addEmailJob(data, { priority: JobPriority.HIGH });

// Handle errors
try {
  await this.jobQueue.addEmailJob(emailData);
} catch (error) {
  this.logger.error('Failed to queue email job', error);
}
```

### ❌ DON'T

```typescript
// Don't use magic strings
await this.jobQueue.addJob('email', 'send-email', data); // ❌

// Don't ignore errors
await this.jobQueue.addEmailJob(data); // ❌
```

## Example Integration

```typescript
@Injectable()
export class BookingsService {
  constructor(private readonly jobQueue: JobQueueService) {}

  async createBookingRequest(bookingData: any) {
    const booking = await this.createBooking(bookingData);

    // Send confirmation email (high priority)
    await this.jobQueue.addEmailJob(
      {
        to: booking.userEmail,
        subject: 'Booking Request Submitted',
        template: 'booking-confirmation',
        data: { booking },
      },
      { priority: JobPriority.HIGH }
    );

    // Schedule payment expiry check (medium priority)
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.jobQueue.addPaymentExpiryJob(
      {
        bookingRequestId: booking.id,
        expiryDate,
      },
      { priority: JobPriority.MEDIUM }
    );

    return booking;
  }
}
```

## Cron Jobs

### Available Cron Jobs

#### Payment Stuck Transaction Checker

- **Schedule**: Every 5 minutes
- **Purpose**: Checks for payment transactions older than 30 minutes that are stuck in pending
  states
- **Action**: Calls Rosoom gateway to verify actual payment status

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async checkStuckTransactions(): Promise<void>
```

### Manual Cron Operations

```typescript
// Inject the service
constructor(private readonly paymentCronService: PaymentCronService) {}

// Check specific transaction manually
await this.paymentCronService.checkSpecificTransaction('TXN_123456');

// Force run stuck transaction check
await this.paymentCronService.checkStuckTransactions();
```

## Configuration

All job configurations are in `src/jobs/types/job.types.ts`:

```typescript
export const JOB_CONFIG = {
  DEFAULT_ATTEMPTS: 3,
  DEFAULT_BACKOFF_DELAY: 2000,
  EMAIL_ATTEMPTS: 5,
  CRITICAL_ATTEMPTS: 10,
  // ... customize as needed
} as const;

export const CRON_CONFIG = {
  STUCK_TRANSACTION_CHECK_MINUTES: 30, // Check transactions older than 30 minutes
} as const;
```
