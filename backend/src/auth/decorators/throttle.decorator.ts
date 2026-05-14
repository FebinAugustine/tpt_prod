import { SetMetadata } from '@nestjs/common';

export const THROTTLE_LIMIT = 'throttleLimit';
export const THROTTLE_TTL = 'throttleTtl';

export const ThrottleAuth = (limit: number = 5, ttl: number = 60000) => {
  return SetMetadata(THROTTLE_LIMIT, limit);
};

export const ThrottleStrict = (limit: number = 3, ttl: number = 60000) => {
  return SetMetadata(THROTTLE_TTL, ttl);
};