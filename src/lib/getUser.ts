import { cookies } from "next/headers";

export interface LoggedUser {
  id: string;
  store: string;
  name: string;
}

export async function getLoggedUser(): Promise<LoggedUser | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    return JSON.parse(token);
  } catch {
    return null;
  }
}
