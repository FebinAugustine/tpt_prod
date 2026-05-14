import { SetMetadata } from '@nestjs/common';

export const WRAP_RESPONSE_KEY = 'wrap_response';
export const WrapResponse = () => SetMetadata(WRAP_RESPONSE_KEY, true);
