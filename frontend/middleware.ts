import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // No server-side auth checks — handled by client-side auth store
  // Middleware can be extended for static file optimization or analytics
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Optionally match specific routes for future middleware (e.g., static file optimization)
  ],
};
