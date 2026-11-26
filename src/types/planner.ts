export const personalCategories = [
  "music",
  "exhibition",
  "theatre",
  "learning",
  "meeting",
  "other",
] as const;

export type PersonalCategory = (typeof personalCategories)[number];

export const personalCategoryLabels: Record<PersonalCategory, string> = {
  music: "Музика",
  exhibition: "Виставка",
  theatre: "Театр і кіно",
  learning: "Навчання",
  meeting: "Зустріч",
  other: "Інше",
};

export interface PersonalEventDraft {
  title: string;
  description: string;
  category: PersonalCategory;
  location: string;
  startsAt: string;
  endsAt: string;
  price: number;
}

export interface PersonalEvent extends PersonalEventDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerData {
  favoriteIds: string[];
  personalEvents: PersonalEvent[];
}
