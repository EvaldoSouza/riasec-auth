import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { schema } from "./userSchema";
// 1. Import the Role enum from your generated Prisma Client
import { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 2. Explicitly set the session strategy to "jwt". This is crucial for middleware.
  session: { strategy: "jwt" },
  providers: [
    Github,
    Credentials({
      // The authorize function remains mostly the same
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedCredentials = schema.parse(credentials);

        const user = await prisma.user.findFirst({
          where: {
            email: validatedCredentials.email,
            password: validatedCredentials.password,
          },
        });

        if (!user) {
          throw new Error("Usuario não cadastrado");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    // 3. The jwt callback is refactored to add the user's ID and role to the token.
    async jwt({ token, user }) {
      if (user) {
        // On sign-in, user object is available.
        token.id = user.id;
        token.role = user.role; // Assuming 'user' object from authorize has the role
      }
      return token;
    },
    // 4. A new 'session' callback is added to pass the role to the session object.
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

});