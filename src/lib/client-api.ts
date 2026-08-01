// ---------------------------------------------------------------------------
// Admin panelindeki client bileşenlerin kullandığı fetch sarmalayıcı.
// "use client" gerektirmez (saf fonksiyonlar); yalnızca tarayıcıda çağrılır.
// ---------------------------------------------------------------------------

function extractError(data: unknown): string | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // JSON olmayan yanıt — data null kalır
  }

  if (res.status === 401) {
    // Oturum düşmüş: giriş sayfasına yönlendir. Zaten giriş sayfasındaysak
    // yönlendirme yapılmaz ki hata mesajı (örn. "E-posta veya şifre hatalı")
    // formda gösterilebilsin.
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      window.location.href = "/admin/login";
    }
    throw new Error(extractError(data) ?? "Oturum gerekli");
  }

  if (!res.ok) {
    throw new Error(extractError(data) ?? "İşlem başarısız");
  }

  return data as T;
}

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export const api = {
  get<T = unknown>(url: string): Promise<T> {
    return request<T>(url);
  },
  post<T = unknown>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, jsonInit("POST", body));
  },
  patch<T = unknown>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, jsonInit("PATCH", body));
  },
  put<T = unknown>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, jsonInit("PUT", body));
  },
  del<T = unknown>(url: string): Promise<T> {
    return request<T>(url, { method: "DELETE" });
  },
  upload<T = unknown>(url: string, formData: FormData): Promise<T> {
    return request<T>(url, { method: "POST", body: formData });
  },
};
