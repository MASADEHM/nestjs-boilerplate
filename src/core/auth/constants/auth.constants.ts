// Auth Common Constants
export const AUTH_DEFAULTS = {
  PASSWORD_HASH_ROUNDS: 12,
  TOKEN_LENGTH: 32,
} as const;

// JWT Strategy Name
export const JWT_STRATEGY_NAME = 'jwt';

// Auth Provider Types
export const PROVIDER_TYPES = {
  LOCAL: 'local',
  LDAP: 'ldap',
} as const;

// Default provider type
export const DEFAULT_PROVIDER = PROVIDER_TYPES.LOCAL;
