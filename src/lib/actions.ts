// // src/lib/actions.ts
// import bcrypt from "bcryptjs";
// import { Role } from "@prisma/client"; // Import the Role enum from Prisma
// import { executeAction } from "./executeAction";
// import { prisma } from "./prisma";
// import { schema } from "./userSchema";

// const signUp = async (formData: FormData) => {
//   // The executeAction wrapper provides a final safety net.
//   return executeAction({
//     actionFn: async () => {
//       const email = formData.get("email") as string;
//       const password = formData.get("password") as string;
      
//       // 1. Validate with the stronger schema
//       const validatedData = schema.parse({ email, password });
      
//       // 2. Check if user already exists
//       const existingUser = await prisma.user.findUnique({
//         where: { email: validatedData.email.toLocaleLowerCase() },
//       });
//       console.log("user findUnique: ",existingUser)

      
//       if (existingUser) {
//         // Throw a specific error that can be handled if needed,
//         // or just return a specific message.
//         throw new Error("A user with this email already exists.");
//       }
      
//       // 3. Hash the password
//       const hashedPassword = await bcrypt.hash(validatedData.password, 10);
//       console.log("hashed password: ",hashedPassword)

//       // 4. Create the user with all required fields
//       await prisma.user.create({
//         data: {
//           email: validatedData.email.toLocaleLowerCase(),
//           password: hashedPassword,
//           role: Role.CLIENTE, // Assign the default role
//         },
//       });

//       const newUser = await prisma.user.findUnique({
//         where: { email: validatedData.email.toLocaleLowerCase() },
//       });

//       console.log(newUser)
//     },
//     successMessage: "Account created successfully! Please sign in.",
//   });
// };

// export { signUp };

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
        return { success: false, error: "A user with this email already exists." };
      }
    }
    
    // For any other type of error, return a generic message
    console.error("SIGN UP ERROR:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}