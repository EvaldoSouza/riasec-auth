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
      basePath="/riasec360/api/auth"
      // This disables refetching the session on a set interval.
      refetchInterval={0}
      // This disables refetching the session when the browser window is focused.
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}