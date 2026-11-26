import { z } from "zod";

export const searchSchema = z.object({
  search: z.string().trim().max(200, "Введіть не більше 200 символів."),
});

export type SearchData = z.infer<typeof searchSchema>;
