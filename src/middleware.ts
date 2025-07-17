import { auth } from "./lib/auth";
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Define all public routes in an array for easier management.
  const publicRoutes = ["/", "/sign-in", "/sign-up"];

  // 2. Define routes that are part of the authentication flow.
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');

  // 3. Check if the current route is one of the public routes.
  const isPublicRoute = publicRoutes.some(path => 
    nextUrl.pathname === path || (path !== '/' && nextUrl.pathname.startsWith(path))
  );

  // Allow access to auth API routes and public routes.
  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // If the user is not logged in and the route is not public, redirect.
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    return NextResponse.redirect(new URL(
      `/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, 
      nextUrl
    ));
  }

  // If the user is logged in, allow them to proceed.
  return NextResponse.next();
});

// The matcher configuration remains the same.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};