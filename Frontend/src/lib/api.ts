const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem("accessToken");
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const mergedHeaders = { ...headers, ...(options.headers as Record<string, string>) };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.access);
        document.cookie = `accessToken=${data.access}; path=/`;

        mergedHeaders["Authorization"] = `Bearer ${data.access}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: mergedHeaders,
        });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = "/login";
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let errorMessage = `API Error: ${response.statusText}`;

    if (errorData) {
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else {
        const messages = Object.values(errorData).flat();
        if (messages.length > 0 && typeof messages[0] === "string") {
          errorMessage = messages[0];
        }
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
