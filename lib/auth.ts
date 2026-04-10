import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_key_12345"
);

export type AuthPayload = {
  id: string;
  username: string;
  role: string;
};

export async function signToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sp_auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function createSession(payload: AuthPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("sp_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("sp_auth_token");
}

/** Utility untuk Middleware (tidak bisa panggil \`cookies()\` disana) */
export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get("sp_auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}
