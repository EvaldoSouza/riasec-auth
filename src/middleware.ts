import { auth } from "./lib/auth";
import {  NextResponse } from 'next/server';

// The auth function from Auth.js is already a middleware.
// We can use its callback to add custom authorization logic.
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/sign-in');

  if (isApiAuthRoute || isPublicRoute) {
    // Allow all API routes and public routes to be accessed.
    return NextResponse.next();
  }

  // If the user is not logged in and is trying to access any other route,
  // redirect them to the sign-in page.
  if (!isLoggedIn) {
    // Construct a callbackUrl to redirect the user back after login.
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
    const loginUrl = new URL('/api/auth/signin', nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    
    // Note: We need to use the full public path for the redirect,
    // which our `basePath` from next.config.js handles automatically
    // when using NextResponse.redirect.
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in, allow them to proceed.
  return NextResponse.next();
});

// The matcher prevents the middleware from running on static assets
// and other paths that don't require authentication.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};