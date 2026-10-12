// === JWT PAYLOAD ===
export interface JwtPayload {
  sub: number; // User ID
  email: string;
}

// === AUTHENTICATED USER (attached to request) ===
export interface AuthenticatedUser {
  id: number;
  email: string;
  full_name: string;
  full_name_ar: string;
  status: string;
}

// === AUDIT INFO ===
export interface AuditInfo {
  user?: AuthenticatedUser;
  isAuthenticated: boolean;
  ip?: string;
  userAgent?: string;
  auditString: string;
}
