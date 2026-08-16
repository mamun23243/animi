import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Email ও ৬+ character password দিন" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) {
    return NextResponse.json({ error: "এই email দিয়ে আগেই account আছে" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      password: await hash(password, 10),
    },
  });

  return NextResponse.json({ ok: true, id: user.id });
}
