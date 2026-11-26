export interface EventImage {
  url: string;
  alt: string;
  photographer: string | null;
  license: string | null;
  licenseUrl: string | null;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  coordinates: { latitude: number; longitude: number } | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  summary: string;
  startsAt: string | null;
  endsAt: string | null;
  venueId: string | null;
  venueName: string | null;
  image: EventImage | null;
  keywords: string[];
  isFree: boolean | null;
  price: string | null;
  website: string | null;
  status: "scheduled" | "cancelled" | "rescheduled" | "postponed";
}

export interface EventFilters {
  search: string;
  page: number;
  sort: "soonest" | "latest" | "title";
  price: "all" | "free" | "paid";
  venueId?: string;
}

export interface EventPage {
  items: Event[];
  count: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
