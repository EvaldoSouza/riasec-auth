"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions";

// 1. A robust Zod schema to validate all the data from the creation form.
const createApplicationSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  testId: z.string().cuid({ message: "Selecione um teste válido." }),
  // `z.coerce.date()` is used to safely convert string inputs from the form into Date objects.
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date().optional(),
  // `z.coerce.number()` converts the string input to a number.
  durationInMinutes: z.coerce.number().positive().optional(),
  // We expect a comma-separated string of user IDs.
  userIds: z.string().min(1, { message: "Você deve selecionar pelo menos um usuário." }),
});


export async function createApplication(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

  // 2. Validate the form data.
  const validatedFields = createApplicationSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    // Flatten the errors and return the first one found.
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { status: "error", message: firstError ?? "Dados inválidos. Por favor, verifique os campos." };
  }
  
  const { title, testId, availableFrom, availableUntil, durationInMinutes } = validatedFields.data;
  const userIds = validatedFields.data.userIds.split(',');

  try {
    // 3. Use a database transaction for data integrity.
    await prisma.$transaction(async (tx) => {
      
      // Operation 1: Create the main Application record.
      const newApplication = await tx.application.create({
        data: {
          title,
          testId,
          availableFrom,
          availableUntil,
          durationInMinutes,
          // Note: Logic to handle assigning by a 'groupId' would be added here.
        },
      });

      // Operation 2: Create the UserApplication records to link the selected
      // users to this new application.
      await tx.userApplication.createMany({
        data: userIds.map((userId) => ({
          userId: userId,
          applicationId: newApplication.id,
          // The status will default to 'NOT_STARTED' as defined in the schema.
        })),
      });
    });
  } catch (error) {
    console.error("Erro ao criar a aplicação:", error);
    return { status: "error", message: "Falha ao criar a aplicação no banco de dados." };
  }

  // 4. On success, revalidate the cache and redirect the admin.
  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}