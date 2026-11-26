import { z } from "zod";

const localizedText = z.record(z.string(), z.string().nullable()).nullish();

const placeReference = z.object({
  "@id": z.string().optional(),
  id: z.string().optional(),
  name: localizedText,
});

const imageSchema = z.object({
  url: z.string(),
  alt_text: z.string().nullish(),
  name: z.string().nullish(),
  photographer_name: z.string().nullish(),
  license: z.string().nullish(),
  license_url: z.string().nullish(),
});

export const apiEventSchema = z.object({
  id: z.string().min(1),
  name: localizedText,
  description: localizedText,
  short_description: localizedText,
  start_time: z.string().nullish(),
  end_time: z.string().nullish(),
  location: placeReference.nullish(),
  images: z.array(imageSchema).nullish(),
  keywords: z.array(placeReference).nullish(),
  offers: z
    .array(
      z.object({
        is_free: z.boolean().nullish(),
        price: localizedText,
        info_url: localizedText,
      }),
    )
    .nullish(),
  info_url: localizedText,
  event_status: z
    .enum([
      "EventScheduled",
      "EventCancelled",
      "EventRescheduled",
      "EventPostponed",
    ])
    .default("EventScheduled"),
});

export const apiVenueSchema = z.object({
  id: z.string().min(1),
  name: localizedText,
  description: localizedText,
  street_address: localizedText,
  address_locality: localizedText,
  info_url: localizedText,
  telephone: localizedText,
  email: z.string().nullish(),
  position: z
    .object({
      coordinates: z.array(z.number()).min(2),
    })
    .nullish(),
});

export const apiEventPageSchema = z.object({
  meta: z.object({
    count: z.number().int().nonnegative(),
    next: z.string().nullable(),
  }),
  data: z.array(apiEventSchema),
});

export type ApiEvent = z.infer<typeof apiEventSchema>;
export type ApiVenue = z.infer<typeof apiVenueSchema>;

export function parseApiResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new Error("Формат даних API змінився. Спробуйте пізніше.");
  return result.data;
}
