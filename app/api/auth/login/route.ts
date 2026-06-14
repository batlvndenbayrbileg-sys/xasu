import { NextResponse } from "next/server";
import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`login:${clientIp(req)}`, 8, 60_000); // 8 attempts / min
  if (!limit.ok)
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash))
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  await createSession(user.id);
  return NextResponse.json({
    data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() },
  });
}
