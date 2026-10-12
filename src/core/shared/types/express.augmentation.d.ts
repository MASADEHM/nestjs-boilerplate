/**
 * Express Module Augmentation
 *
 * This file extends the Express Request interface to include custom properties
 * that are added by our authentication middleware. TypeScript will automatically
 * detect this module augmentation and apply it globally.
 *
 * @see https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */

import type { AuthenticatedUser } from '@core/auth/dto';

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
    // NOTE: Workflow-specific context can be added when needed
    // currentProcess?: { id: number; name: string; };
    // currentWorkflow?: { id: number; name: string; };
  }
}
