import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const characterId = new URL(req.url).searchParams.get("char");
  if (!characterId) return NextResponse.json({ messages: [] });

  const chat = await prisma.chat.findUnique({
    where: { userId_characterId: { userId: session.user.id, characterId } },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
  });

  return NextResponse.json({
    messages: chat?.messages.map((m) => ({ role: m.role, content: m.content })) ?? [],
    mood: chat?.mood ?? "normal",
  });
}