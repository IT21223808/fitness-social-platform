const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const errorData = await response.json();

        message =
          errorData.message ||
          errorData.error ||
          errorData.messages ||
          message;
      } else {
        const errorText = await response.text();

        if (errorText) {
          message = errorText;
        }
      }
    } catch {
      // Ignore response parsing errors
    }

    throw new Error(
      typeof message === "string"
        ? message
        : "Something went wrong"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return (await response.text()) as T;
}