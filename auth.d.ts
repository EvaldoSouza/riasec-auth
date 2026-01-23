import { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// 1. Extend the core "next-auth" types
declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: Role;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    role: Role;
  }
}

// 2. Extend the "next-auth/adapters" types
// THIS IS THE PART YOU WERE MISSING
declare module "next-auth/adapters" {
  /**
   * The shape of the user object returned by the database adapter.
   * This must match the User model in your schema.prisma.
   */
  interface AdapterUser {
    role: Role;
  }
}

// 3. Extend the JWT type if using session: { strategy: "jwt" }
declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
  }
}