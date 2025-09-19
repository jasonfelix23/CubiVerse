import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  }

  const { sessionId, exp } = await res.json();
  const resp = NextResponse.json({ ok: true, exp });

  resp.cookies.set(`roomSession.${roomId}`, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/rooms/${roomId}`,
    maxAge: 60 * 60 * 12,
  });

  return resp;
}
