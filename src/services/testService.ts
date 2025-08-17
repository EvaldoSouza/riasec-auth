"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllTests() {
    try {
        const tests = await prisma.test.findMany({ orderBy:{createdAt: 'desc'}}) //mostrando o mais recente primeiro
        if(tests == null || tests.length === 0){
            console.log("Sem testes")
            //throw "Sem testes";
        }
        return tests
        
    } catch (error) {
        console.log(error)
        throw error;
    }
    
}

// 1. Update the schema to include an optional ID.
// We use `coerce` to ensure the string from formData is treated as a number.
const createTestSchema = z.object({
  id: z.string().optional(), // The ID is now an optional number
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres." }),
  cardIds: z.string().min(1, { message: "Você deve selecionar pelo menos um cartão." }),
});

type FormState = { error?: string; success?: boolean; } | null;

export async function createTest(previousState: FormState, formData: FormData): Promise<FormState> {
  // 2. Validate the full schema, including the optional ID.
  const validatedFields = createTestSchema.safeParse({
    id: formData.get("id"),
    description: formData.get("description"),
    cardIds: formData.get("cardIds"),
  });

  if (!validatedFields.success) { throw "Os campos estão errados"}

  const { id, description } = validatedFields.data;
  const cardIds = validatedFields.data.cardIds.split(',');

  if (cardIds.length === 0) { throw "cardIds length is 0 on testService"}
  
  try {
    await prisma.$transaction(async (tx) => {
      // 3. Conditionally build the data object for the create call.
      const testData = {
        descricao: description,
        quant_cartoes: cardIds.length,
        data_criacao: new Date(),
        // Conditionally add the id_teste field ONLY if an ID was provided.
        ...(id && { id_teste: id }), 
        teste_cartao: {
          createMany: {
            data: cardIds.map((id) => ({ id_cartao: id })),
          },
        },
      };

      await tx.test.create({ data: testData });
      
      // The performant updateMany remains the same.
      await tx.card.updateMany({
        where: { id: { in: cardIds } },
        data: { inUse: true },
      });
    });
  } catch (error) {
    console.error("Erro ao criar o teste:", error);
    return { error: "Falha ao criar o teste. Por favor, tente novamente." };
  }

  revalidatePath("/admin/tests");
  redirect("/admin/tests");
}