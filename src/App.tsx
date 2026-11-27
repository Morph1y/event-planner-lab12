import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";

const EventsPage = lazy(() =>
  import("./pages/EventsPage").then((module) => ({
    default: module.EventsPage,
  })),
);
const EventDetailsPage = lazy(() =>
  import("./pages/EventDetailsPage").then((module) => ({
    default: module.EventDetailsPage,
  })),
);
const VenueDetailsPage = lazy(() =>
  import("./pages/VenueDetailsPage").then((module) => ({
    default: module.VenueDetailsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then((module) => ({
    default: module.FavoritesPage,
  })),
);
const MyEventsPage = lazy(() =>
  import("./pages/MyEventsPage").then((module) => ({
    default: module.MyEventsPage,
  })),
);
const PersonalEventDetailsPage = lazy(() =>
  import("./pages/PersonalEventDetailsPage").then((module) => ({
    default: module.PersonalEventDetailsPage,
  })),
);

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/events" replace />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailsPage />} />
        <Route path="venues/:venueId" element={<VenueDetailsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="my-events" element={<MyEventsPage />} />
        <Route
          path="my-events/:personalId"
          element={<PersonalEventDetailsPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
