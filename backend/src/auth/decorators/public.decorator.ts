import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as public (bypasses authentication)
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 * ```
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
