// This entire file is implicitly a Server Action module.
// Or you can add "use server" at the top of the file.
"use server";

import { signOut as serverSignOut } from "@/lib/auth"; // IMPORTANT: Import from your main auth.ts file

/**
 * A Server Action to handle user sign-out.
 * This function will be executed securely on the server.
 */
export async function handleSignOut() {
  await serverSignOut();
}