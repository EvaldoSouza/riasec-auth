import { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Extend the built-in session.user type
  interface Session {
    user: {
      role: Role;
    } & DefaultSession["user"];
  }

  // Extend the built-in User type
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  // Extend the token type
  interface JWT {
    role: Role;
  }
}