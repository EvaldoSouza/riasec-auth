import { z } from 'zod';

// This is the hardcoded version of the scores schema.
// It uses the explicit Portuguese, PascalCase keys to match our data model.
export const scoresSchema = z.object({
  Realista: z.number(),
  Investigativo: z.number(),
  Artistico: z.number(),
  Social: z.number(),
  Empreendedor: z.number(),
  Convencional: z.number(),
});