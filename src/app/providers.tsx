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
      //basePath="/riasec360"
      basePath="/riasec360/api/auth"           
    >
      {children}
    </SessionProvider>
  );
}