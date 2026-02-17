// src/lib/getUser.ts
export interface LoggedUser {
  id: string;
  store: string;
  name: string;
}

export function getLoggedUser(): LoggedUser | null {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function setLoggedUser(user: LoggedUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function removeLoggedUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
}
