export const maxDuration = 300; // Hobby-তে সর্বোচ্চ ৫ মিনিট
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt, BANNED_PATTERNS } from "@/lib/prompts";
import { CHARACTERS } from "@/lib/characters";
import { streamAI } from "@/lib/ai";

export const dynamic = "force-dynamic";

const FREE_DAILY_LIMIT = 20;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Login করুন" }, { status: 401 });

  const { chatId, characterId, content, mood } = await req.json();
  if (!characterId || !content?.trim()) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // ⛔ Illegal content filter
  const lower = content.toLowerCase();
  if (BANNED_PATTERNS.some((p) => lower.includes(p))) {
    return NextResponse.json({ error: "এই বিষয়ে কথা বলা যাবে না" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // 📊 Free plan: 20 msg/day limit
  if (!user?.premium) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await prisma.message.count({
      where: { userId: user!.id, createdAt: { gte: startOfDay } },
    });
    if (todayCount >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "দৈনিক ২০টি ফ্রি message শেষ! Premium নিয়ে unlimited chat করুন 💜" },
        { status: 429 }
      );
    }
  }

  // Character + Chat (প্রতি character প্রতি user একটাই chat — v1)
  const character = CHARACTERS.find((c) => c.id === characterId);
  if (!character) return NextResponse.json({ error: "Character পাওয়া যায়নি" }, { status: 404 });

  let chat = await prisma.chat.findUnique({
    where: { userId_characterId: { userId: user!.id, characterId } },
  });
  if (!chat) {
    chat = await prisma.chat.create({
      data: { userId: user!.id, characterId, mood: mood || "normal" },
    });
  } else if (mood && mood !== chat.mood) {
    chat = await prisma.chat.update({ where: { id: chat.id }, data: { mood } });
  }

  const safeMood = ["normal", "romantic", "adult"].includes(mood) ? mood : chat.mood;

  await prisma.message.create({
    data: { chatId: chat.id, userId: user!.id, characterId, role: "user", content },
  });

  // শেষ ২০টা message + system prompt দিয়ে AI call
  const history = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const aiMessages = [
    { role: "system", content: buildSystemPrompt(character, safeMood) },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await streamAI(aiMessages, safeMood);
  } catch {
    return NextResponse.json({ error: "AI service ব্যস্ত, একটু পরে চেষ্টা করুন" }, { status: 503 });
  }

  // SSE stream: AI response টা token-by-token client এ পাঠাই, শেষে DB তে save
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullReply = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const obj = JSON.parse(data);
              const delta = obj.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                fullReply += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
              }
            } catch {
              /* partial JSON ignore */
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        await prisma.message.create({
          data: { chatId: chat.id, userId: user!.id, characterId, role: "assistant", content: fullReply },
        });
      } catch {
        controller.error("stream failed");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
