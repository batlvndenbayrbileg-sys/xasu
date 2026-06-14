import { NextResponse } from "next/server";
import { createSession, createUser, findUserByEmail } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const limit = rateLimit(`signup:${clientIp(req)}`, 5, 60_000); // 5 / min
  if (!limit.ok)
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const { name, email, password } = await req.json();
  if (!name || !email || !password)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Please enter your name" }, { status: 422 });
  if (typeof email !== "string" || !EMAIL_RE.test(email))
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 422 });
  if (typeof password !== "string" || password.length < 6)
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 422 });
  if (await findUserByEmail(email))
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const user = await createUser(name.trim(), email, password);
  await createSession(user.id);
  return NextResponse.json({ data: user }, { status: 201 });
}
