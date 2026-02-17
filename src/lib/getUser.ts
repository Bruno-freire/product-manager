export interface LoggedUser {
  id: string;
  store: string;
  name: string;
}

// Apenas leitura localStorage no cliente
export function getLoggedUser(): LoggedUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
