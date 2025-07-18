// import { auth } from "./lib/auth";
// import { NextResponse } from 'next/server';

// export default auth((req) => {
//   const { nextUrl } = req;
//   const isLoggedIn = !!req.auth;

//   // 1. Define all public routes in an array for easier management.
//   const publicRoutes = ["/", "/sign-in", "/sign-up"];

//   // 2. Define routes that are part of the authentication flow.
//   const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');

//   // 3. Check if the current route is one of the public routes.
//   const isPublicRoute = publicRoutes.some(path => 
//     nextUrl.pathname === path || (path !== '/' && nextUrl.pathname.startsWith(path))
//   );

//   // Allow access to auth API routes and public routes.
//   if (isApiAuthRoute || isPublicRoute) {
//     return NextResponse.next();
//   }

//   // If the user is not logged in and the route is not public, redirect.
//   if (!isLoggedIn) {
//     let callbackUrl = nextUrl.pathname;
//     if (nextUrl.search) {
//       callbackUrl += nextUrl.search;
//     }

//     const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
//     return NextResponse.redirect(new URL(
//       `/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, 
//       nextUrl
//     ));
//   }

//   // If the user is logged in, allow them to proceed.
//   return NextResponse.next();
// });

// // The matcher configuration remains the same.
// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//   ],
// };

// /middleware.ts or /src/middleware.ts

import { NextResponse } from "next/server";
//import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // Assuming your auth.ts is in a top-level auth folder

/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 */
const publicRoutes = ["/", "/sign-in", "/sign-up"];

export default auth((request) => {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  // Check if the user is authenticated
  const isAuthenticated = !!request.auth;

  // Determine if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If the route is protected and the user is not authenticated, redirect to the sign-in page
  if (!isPublicRoute && !isAuthenticated) {
    const basePath = process.env.BASE_PATH || "";
    
    // Construct the redirect URL with a callback
    const signInUrl = new URL(`${basePath}/sign-in`, nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", `${basePath}${pathname}`);
    
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
});

// This config specifies which routes the middleware should run on.
export const config = {
  // Match all routes except for static files and special Next.js paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};