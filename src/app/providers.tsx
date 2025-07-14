"use client";

import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider
      session={session}
      // We keep the basePath just in case any other function needs it.
      basePath="http://localhost:3000/riasec360/api/auth"
     
    >
      {children}
    </SessionProvider>
  );
}