import type { AuditInfo } from '@core/auth/types/auth.types';

/**
 * Generate audit fields for database operations
 */
export function createAuditFields(auditInfo: AuditInfo): {
  created_by: string;
  updated_by: string;
} {
  return {
    created_by: auditInfo.auditString,
    updated_by: auditInfo.auditString,
  };
}

/**
 * Generate audit fields for update operations (only update fields)
 */
export function updateAuditFields(auditInfo: AuditInfo): {
  updated_by: string;
} {
  return {
    updated_by: auditInfo.auditString,
  };
}
