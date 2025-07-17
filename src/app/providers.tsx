"use client";

import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const authApiPath = `${basePath}/api/auth`;
  return (
    <SessionProvider
      session={session}
      // We keep the basePath just in case any other function needs it.
      basePath={authApiPath}
     
    >
      {children}
    </SessionProvider>
  );
}