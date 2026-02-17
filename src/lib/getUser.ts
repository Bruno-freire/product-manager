export interface LoggedUser {
  id: string;
  email: string;
  store: string;
}

export function getLoggedUser(): LoggedUser | null {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");

  if (!rawUser || rawUser === "undefined") {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}
