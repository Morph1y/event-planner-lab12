const baseUrl =
  import.meta.env?.VITE_API_URL ?? "https://api.hel.fi/linkedevents/v1/";

export class HttpError extends Error {
  status: number;

  constructor(status: number) {
    super(
      status === 404
        ? "Запис не знайдено."
        : "Не вдалося отримати дані. Спробуйте ще раз.",
    );
    this.name = "HttpError";
    this.status = status;
  }
}

export async function getApi(
  path: string,
  params: URLSearchParams = new URLSearchParams(),
  signal?: AbortSignal,
): Promise<unknown> {
  const url = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);
  params.forEach((value, key) => url.searchParams.set(key, value));
  url.searchParams.set("format", "json");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      "Не вдалося з’єднатися з API. Перевірте інтернет і повторіть спробу.",
      { cause: error },
    );
  }

  if (!response.ok) throw new HttpError(response.status);

  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("API повернув відповідь, яку не вдалося прочитати.", {
      cause: error,
    });
  }
}
