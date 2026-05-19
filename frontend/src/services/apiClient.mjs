function resolveApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    return "";
  }

  return (process.env.SMALLC_API_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");
}

export async function apiRequest(path, options = {}) {
  const baseUrl = resolveApiBaseUrl();
  const url = `${baseUrl}${path}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Could not reach the server. Make sure the API is running.");
  }

  let payload = null;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    payload = await response.json();
  }

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Something went wrong. Please try again.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}
