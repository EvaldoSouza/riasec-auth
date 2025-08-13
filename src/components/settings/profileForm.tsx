"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/services/userSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";

// Define the state type, matching the server action's return type.
type FormState = { error?: string; success?: string; newName?: string; } | null;

export function ProfileForm() {
  const { data:session, update } = useSession();
  
  // 1. Use standard useState for state management.
  const [state, setState] = useState<FormState>(null);
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? '');

  // This effect syncs the form field if the session changes from an external source.
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]); // Dependency is the name from the session
  // 2. Create an explicit onSubmit handler function.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateProfile(formData);
    
      if (result.success && result.newName) {
        await update({ name: result.newName });
      }

      setState(result);
    } catch (error) {
      // Catch any unexpected errors from the action or session update
      console.error("An unexpected error occurred in handleSubmit:", error);
      setState({ error: "A critical error occurred. Please try again." });
    } finally {
      // This will run no matter what, ensuring the button is always re-enabled.
      setIsPending(false);
    }
  };

  return (
    // 6. The form now uses the onSubmit handler.
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" value={session?.user.email ?? ''} disabled className="cursor-not-allowed bg-muted" />
      </div>

      <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-500">{state.success}</p>}
    </form>
  );
}