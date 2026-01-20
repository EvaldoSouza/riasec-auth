import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { schema } from "./userSchema";
import bcrypt from "bcryptjs";
// 1. Import the Role enum from your generated Prisma Client
import { Role } from "@prisma/client";

const basePath = process.env.BASE_PATH ?? ''

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: `${basePath}/api/auth`,
  adapter: PrismaAdapter(prisma),
  // 2. Explicitly set the session strategy to "jwt". This is crucial for middleware.
  session: { strategy: "jwt", maxAge: 5*60*60 }, //5 horas de vida para o token
  providers: [
    Github,
    Credentials({
      async authorize(credentials) {
        // 2. Use the imported schema for validation.
        const validatedFields = schema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await prisma.user.findUnique({
            where: { email: email.toLocaleLowerCase() },
          });

          if (!user || !user.password) {
            // If the user doesn't exist or signed up with an OAuth provider, fail login.
            return null;
          }

          if (!user.isActive) {
            throw new Error("Sua conta está desativada. Entre em contato com o suporte.");
          }

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    // 3. The jwt callback is refactored to add the user's ID and role to the token.
    async jwt({ token, user, trigger, session }) {
      
      if (user) {
        // On sign-in, user object is available.
        token.id = user.id;
        token.role = user.role; // Assuming 'user' object from authorize has the role
        
        
      }
      if(trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token;
    },
    // 4. A new 'session' callback is added to pass the role to the session object.
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages:{signIn:'/sign-in'},

});