// JWT payload shape from backend (verified from apps/auth/auth.service.ts)
export type JwtRoleType = 'SUPER_ADMIN' | 'SYSTEM' | 'VENDOR' | null;

export interface JwtPayload {
  userID: string;
  userEmail: string;
  permissions: string[];
  roleType: JwtRoleType;
  iat: number;
  exp: number;
}
