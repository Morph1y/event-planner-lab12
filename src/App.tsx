import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { VenueDetailsPage } from "./pages/VenueDetailsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MyEventsPage } from "./pages/MyEventsPage";
import { PersonalEventDetailsPage } from "./pages/PersonalEventDetailsPage";

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
