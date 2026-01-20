"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client"; // 1. Import the Prisma namespace
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

type SignUpResult = {
  success: boolean;
  error?: string;
};

export async function signUp(formData: FormData): Promise<SignUpResult> {
  const validatedFields = signUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    };
  }

  const { email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email: email.toLocaleLowerCase(),
        password: hashedPassword,
        role: Role.CLIENTE,
      },
    });

    return { success: true };

  } catch (error) {
    // 2. Check if the error is a known Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 3. Check if the error code is for a unique constraint violation
      if (error.code === 'P2002') {
        return { success: false, error: "Um usuário com esse email já existe." };
      }
    }
    
    // For any other type of error, return a generic message
    console.error("SIGN UP ERROR:", error);
    return { success: false, error: "Um erro inesperado ocorreu. Por favor, tente mais tarde." };
  }
}