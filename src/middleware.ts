// 1. Import the `auth` function directly from your auth.ts file
import { auth } from "./lib/auth"; // Make sure this path is correct

// 2. Export it as the default, wrapping it to add custom logic
export default auth((req) => {
  // If the user is not logged in, redirect them to the login page.
  if (!req.auth) {
    const loginUrl = new URL("/riasec360/sign-in", req.url);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page)
     */
    
  ],
};

