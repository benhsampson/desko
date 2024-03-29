import { Role } from './entities/role.entity';

export const DEFAULT_PORT = '4000';
export const DEFAULT_DB_PORT = '3306';

export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '15d';

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh';
export const REFRESH_TOKEN_REDIS_PREFIX = 're-token';

export const FORGOT_PASSWORD_REDIS_PREFIX = 'fgt-pwd';
export const FORGOT_PASSWORD_TOKEN_EXPIRES_IN = '15m';

export const EMAIL_FROM = 'no-reply@desko.io';

export const ROLES: Role[] = [
  { id: 1, value: 'MANAGER', users: [] },
  { id: 2, value: 'USER', users: [] },
];
