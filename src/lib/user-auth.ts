import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "";
export const USER_COOKIE_NAME = "nfl_user_session";

export interface UserTokenPayload {
  userId: string;
  username: string;
  role: "user";
}

export function signUserToken(payload: Omit<UserTokenPayload, "role">) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ ...payload, role: "user" }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}
