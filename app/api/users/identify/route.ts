import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();

    if (!name?.trim() || !phone?.trim()) {
      return Response.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const normalizedPhone = formatPhone(phone);

    const user = await prisma.user.upsert({
      where: { phone: normalizedPhone },
      update: { name: name.trim() },
      create: {
        name: name.trim(),
        phone: normalizedPhone,
      },
    });

    return Response.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("identify error:", error);
    return Response.json({ error: "Failed to identify user" }, { status: 500 });
  }
}
