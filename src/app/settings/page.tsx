import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/settings/profileForm";
import { PasswordForm } from "@/components/settings/passwordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/sign-in");
  }

  // Fetch the full user from the DB to check for a password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm/>
        </CardContent>
      </Card>
      
      {/* Conditionally render the Change Password card */}
      {/* This card only shows if the user has a password set (i.e., not an OAuth user) */}
      {user.password && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Atualize sua senha aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}