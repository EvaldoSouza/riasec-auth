"use server";

import {z} from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type FormState = { error?: string; success?: string; newName?: string} | null;
type ProfileFormState = {
  error?: string;
  success?: string;
  newName?: string;
};

const ProfileSchema = z.object ({name: z.string().min(2, {message:"O nome tem de ter pelo menos 2 characters"})})

const PasswordSchema = z.object({
    currentPassword:  z.string().min(1, {message: "A senha atual é necessária"}),
    newPassword: z.string().min(6, {message: "A nova senha deve conter pelo menos 6 caracteres"})
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da antiga",
    path: ["newPassword"],
})

//Update the profile in database
export async function updateProfile(formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const validatedFields = ProfileSchema.safeParse({ name: formData.get('name') });

  if (!validatedFields.success) { 
    console.log("Nome não validado com sucesso")
    return { error: validatedFields.error.flatten().fieldErrors.name?.[0] ?? "Invalid name." };
  }

  const { name } = validatedFields.data;
  
  try {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } });
    
    revalidatePath("/settings");
    return { success: "Profile updated successfully!", newName: name };
  } catch (error) {
    console.log(error)
    return { error: "Failed to update profile." };
  }
}


export async function changePassword(
  previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return { error: "User has no password set." };

  const validatedFields = PasswordSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return { error: errors.currentPassword?.[0] ?? errors.newPassword?.[0] };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) return { error: "Current password is incorrect." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return { success: "Password changed successfully!" };
  } catch (error) {
    console.log(error)
    return { error: "Failed to change password." };
  }
}