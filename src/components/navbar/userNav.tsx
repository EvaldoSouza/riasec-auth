// src/components/layout/UserNav.tsx

// This directive marks the component as a Client Component.
// It's necessary because it uses client-side interactivity (e.g., dropdowns) 
// and the client-side `signOut` function.
"use client";

import Link from "next/link";
import { type Session } from "next-auth";
// The `signOut` function from next-auth/react is for use in client components.
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the component's props, expecting the session object.
interface UserNavProps {
  session: Session | null;
}

export function UserNav({ session }: UserNavProps) {
  // If there is no user session, display a "Sign In" button.
  if (!session?.user) {
    return (
      <Link href="/sign-in">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  // A small helper to create user initials for the avatar fallback.
  const userInitials = session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ?? "";

  // If a session exists, render the user dropdown menu.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* <form action={handleSignOut}>
          <button type="submit" className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground w-full">
            Sign out
          </button>
        </form> */}
        <Button onClick={() => signOut()}>Sign Out</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}