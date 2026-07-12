import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
export { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

export interface AdminTokenPayload {
  email: string;
  role: "admin";
}

export function signAdminToken(payload: AdminTokenPayload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}
