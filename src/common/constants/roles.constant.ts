import { UserRole } from 'src/modules/users/enums/user-role.enum';

export const CONTENT_ROLES = [
  UserRole.DEVELOPER,
  UserRole.ADMIN,
  UserRole.CONTENT_MANAGER,
] as const;

export const CLIENT_ROLES = [
  UserRole.DEVELOPER,
  UserRole.ADMIN,
  UserRole.CLIENT_MANAGER,
] as const;

export const ADMIN_ROLES = [UserRole.DEVELOPER, UserRole.ADMIN] as const;

export const ALL_ADMIN_ROLES = [
  UserRole.DEVELOPER,
  UserRole.ADMIN,
  UserRole.CONTENT_MANAGER,
  UserRole.CLIENT_MANAGER,
] as const;
