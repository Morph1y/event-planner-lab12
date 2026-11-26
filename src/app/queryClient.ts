import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "../api/httpClient.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (
          error instanceof HttpError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return error.status === 408 || error.status === 429
            ? failureCount < 1
            : false;
        }
        return failureCount < 1;
      },
    },
  },
});
