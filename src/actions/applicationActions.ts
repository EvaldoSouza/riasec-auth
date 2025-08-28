"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions";
import { ApplicationStatus } from "@prisma/client";


const createApplicationSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  testId: z.string().cuid({ message: "Selecione um teste válido." }),
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date(),
  durationInMinutes: z.coerce.number().positive().optional(),
  // We expect a comma-separated string of user IDs.
  userIds: z.string().min(1, { message: "Você deve selecionar pelo menos um usuário." }),
});


const deleteApplicationSchema = z.object({
  applicationId: z.string().cuid({ message: "ID da aplicação inválido." }),
});

// Add a Zod schema for the update action
const updateApplicationSchema = z.object({
  applicationId: z.string().cuid({ message: "ID da aplicação inválido." }),
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date().optional(),
  durationInMinutes: z.coerce.number().positive().optional(),
  userIds: z.string().optional(), // Can be empty if all users are removed
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

  return { status: "success", message: "Aplicação agendada com sucesso!" };
}

/**
 * A Server Action to delete a Test Application.
 * It checks if any participant has started the test before deleting.
 */
export async function deleteApplication(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

  const validatedFields = deleteApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { status: "error", message: "ID da aplicação inválido." };
  }
  const { applicationId } = validatedFields.data;

  try {
    // 1. Safety Check: Find if any participant has a status other than NOT_STARTED.
    const activeParticipant = await prisma.userApplication.findFirst({
      where: {
        applicationId: applicationId,
        NOT: {
          status: ApplicationStatus.NOT_STARTED,
        },
      },
    });

    // If an active/completed participant is found, block the deletion.
    if (activeParticipant) {
      return { status: "error", message: "Esta aplicação não pode ser excluída pois um ou mais participantes já iniciaram o teste." };
    }

    // 2. If the safety check passes, delete the application.
    // The `onDelete: Cascade` in your schema will automatically delete all
    // associated `UserApplication` records.
    await prisma.application.delete({
      where: { id: applicationId },
    });

    // 3. Revalidate the path to update the UI.
    revalidatePath("/admin/applications");
    return { status: "success", message: "Aplicação excluída com sucesso." };

  } catch (error) {
    console.error("Erro ao excluir a aplicação:", error);
    return { status: "error", message: "Erro no banco de dados: Não foi possível excluir a aplicação." };
  }
}

export async function updateApplication(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

// 1. Perform the validation.
  const result = updateApplicationSchema.safeParse(Object.fromEntries(formData));

  // 2. Check for validation failure and return immediately.
  // This acts as a "type guard".
  if (!result.success) {
    const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
    return { status: "error", message: firstError ?? "Dados inválidos." };
  }
  
  const { applicationId, title, availableFrom, availableUntil, durationInMinutes } = result.data;
  const newUserIds = new Set(result.data.userIds?.split(',').filter(id => id) ?? []);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get the current list of participants from the database.
      const currentParticipants = await tx.userApplication.findMany({
        where: { applicationId: applicationId },
        select: { userId: true },
      });
      const currentUserIds = new Set(currentParticipants.map(p => p.userId));

      // 2. Calculate which users to add and which to remove.
      const usersToAdd = [...newUserIds].filter(id => !currentUserIds.has(id));
      const usersToRemove = [...currentUserIds].filter(id => !newUserIds.has(id));

      // 3. Update the main Application record.
      await tx.application.update({
        where: { id: applicationId },
        data: { title, availableFrom, availableUntil, durationInMinutes },
      });

      // 4. Remove participants who were deselected.
      if (usersToRemove.length > 0) {
        await tx.userApplication.deleteMany({
          where: { applicationId: applicationId, userId: { in: usersToRemove } },
        });
      }

      // 5. Add new participants who were selected.
      if (usersToAdd.length > 0) {
        await tx.userApplication.createMany({
          data: usersToAdd.map(userId => ({ applicationId, userId })),
        });
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar a aplicação:", error);
    return { status: "error", message: "Falha ao atualizar a aplicação." };
  }

  revalidatePath("/admin/applications");
  return { status: "success", message: "Aplicação atualizada com sucesso!" };
}