"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/services/userSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";

// Define the state type, matching the server action's return type.
type FormState = { error?: string; success?: string; newName?: string; } | null;

export function ProfileForm({ user }: { user: User }) {
  const { update } = useSession();
  
  // 1. Use standard useState for state management.
  const [state, setState] = useState<FormState>(null);
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(user.name ?? '');

  // 2. Create an explicit onSubmit handler function.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState(null); // Reset previous state

    const formData = new FormData(event.currentTarget);
    
    // 3. Call the server action directly.
    const result = await updateProfile(formData);
    
    // 4. If the database update was successful, then update the session.
    if (result.success && result.newName) {
      // This ensures the session update only happens once, after a successful action.
      await update({ name: result.newName });
    }

    // 5. Update the UI with the final result and end the pending state.
    setState(result);
    setIsPending(false);
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
        <Input type="email" value={user.email ?? ''} disabled className="cursor-not-allowed bg-muted" />
      </div>

      <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-500">{state.success}</p>}
    </form>
  );
}