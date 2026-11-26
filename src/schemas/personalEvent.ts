import { z } from "zod";
import { personalCategories } from "../types/planner.ts";
import { isLocalDateTime } from "../utils/localDateTime.ts";

export const personalEventDraftSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(4000),
    category: z.enum(personalCategories),
    location: z.string().trim().min(2).max(200),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    price: z
      .number()
      .finite()
      .nonnegative()
      .refine(
        (value) =>
          Number.isSafeInteger(Math.round(value * 100)) &&
          Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
      ),
  })
  .refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
    path: ["endsAt"],
  });

export const personalEventSchema = personalEventDraftSchema.safeExtend({
  id: z.string().startsWith("local:").min(7),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const favoriteId = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !value.startsWith("local:"));

export const storedPlannerSchema = z.object({
  version: z.literal(1),
  data: z.object({
    favoriteIds: z
      .array(favoriteId)
      .refine((ids) => new Set(ids).size === ids.length),
    personalEvents: z
      .array(personalEventSchema)
      .refine(
        (events) =>
          new Set(events.map((event) => event.id)).size === events.length,
      ),
  }),
});

export const personalEventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Введіть щонайменше 3 символи.")
      .max(120, "Назва має містити до 120 символів."),
    description: z
      .string()
      .trim()
      .max(4000, "Опис має містити до 4000 символів."),
    category: z.enum(personalCategories),
    location: z
      .string()
      .trim()
      .min(2, "Вкажіть місце події.")
      .max(200, "Введіть до 200 символів."),
    startsAt: z
      .string()
      .refine(isLocalDateTime, "Вкажіть коректні дату й час початку."),
    endsAt: z
      .string()
      .refine(isLocalDateTime, "Вкажіть коректні дату й час завершення."),
    isFree: z.boolean(),
    price: z
      .string()
      .trim()
      .transform((value) => value.replace(",", ".")),
  })
  .superRefine((value, context) => {
    if (
      isLocalDateTime(value.startsAt) &&
      isLocalDateTime(value.endsAt) &&
      new Date(value.endsAt).getTime() <= new Date(value.startsAt).getTime()
    ) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Завершення має бути пізніше за початок.",
      });
    }
    if (
      !value.isFree &&
      (!/^\d+(\.\d{1,2})?$/.test(value.price) ||
        Number(value.price) <= 0 ||
        !Number.isSafeInteger(Math.round(Number(value.price) * 100)))
    ) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Вкажіть додатну ціну з точністю до центів.",
      });
    }
  });

export type PersonalEventFormValues = z.input<typeof personalEventFormSchema>;
export type PersonalEventFormData = z.output<typeof personalEventFormSchema>;
