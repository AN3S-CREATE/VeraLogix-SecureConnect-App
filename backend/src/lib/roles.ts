import { z } from 'zod';

export const RoleSchema = z.enum([
  'resident',
  'agent',
  'trustee',
  'vendor',
  'estate_manager',
  'admin',
]);
export type Role = z.infer<typeof RoleSchema>;

export const ALL_ROLES: Role[] = RoleSchema.options;

export const ADMIN_ROLES: Role[] = ['admin', 'estate_manager'];
export const AGENT_ROLES: Role[] = ['admin', 'estate_manager', 'agent'];
export const TRUSTEE_ROLES: Role[] = ['admin', 'estate_manager', 'trustee'];

export function hasAnyRole(userRoles: Role[], allowed: Role[]): boolean {
  return userRoles.some((r) => allowed.includes(r));
}

export function isAdmin(roles: Role[]): boolean {
  return hasAnyRole(roles, ADMIN_ROLES);
}

/** Portal path prefix for a primary role. */
export function portalForRole(role: Role): string {
  switch (role) {
    case 'resident':
      return '/ten';
    case 'trustee':
      return '/tru';
    case 'vendor':
      return '/ven';
    case 'agent':
    case 'estate_manager':
    case 'admin':
    default:
      return '/cmd';
  }
}
