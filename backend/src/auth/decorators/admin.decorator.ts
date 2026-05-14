import { SetMetadata } from '@nestjs/common';

export const ADMIN_KEY = 'adminOnly';
export const AdminOnly = () => SetMetadata(ADMIN_KEY, true);
