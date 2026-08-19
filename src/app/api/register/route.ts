import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generatePartnerCode } from "@/lib/partner";

interface RegisterSupplement {
  name: string;
  dose: string;
  time: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  birthYear: number | null;
  avatar: string;
  weightKg: number | null;
  heightCm: number | null;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  isPregnant: boolean;
  supplements: RegisterSupplement[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<RegisterBody>;

  if (!body.email || !body.email.includes("@") || !body.password || body.password.length < 6) {
    return NextResponse.json({ error: "Ungültige E-Mail oder Passwort zu kurz." }, { status: 400 });
  }
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const partnerCode = generatePartnerCode(body.name);
  const supplements = body.supplements ?? [];

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.user.create({
      data: { email: body.email!, passwordHash },
    });

    await tx.profile.create({
      data: {
        id: created.id,
        name: body.name!,
        email: body.email!,
        birthYear: body.birthYear ?? null,
        avatar: body.avatar || "🌸",
        takesSupplements: supplements.length > 0,
        partnerCode,
      },
    });

    await tx.userCycle.create({
      data: {
        userId: created.id,
        lastPeriodStart: new Date(
          body.lastPeriodStart || new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0]
        ),
        cycleLength: body.cycleLength ?? 28,
        periodLength: body.periodLength ?? 5,
      },
    });

    if (body.weightKg) {
      await tx.userBodyMetrics.create({
        data: {
          userId: created.id,
          weightKg: body.weightKg,
          heightCm: body.heightCm ?? null,
        },
      });
    }

    if (body.isPregnant) {
      await tx.pregnancy.create({
        data: { userId: created.id, isPregnant: true },
      });
    }

    for (const supp of supplements) {
      const inserted = await tx.userSupplement.create({
        data: {
          userId: created.id,
          name: supp.name,
          dose: supp.dose,
          time: supp.time,
        },
      });

      if (supp.time) {
        await tx.userSupplementReminder.create({
          data: {
            userId: created.id,
            supplementName: supp.name,
            time: supp.time,
            enabled: true,
          },
        });
      }
      void inserted;
    }

    return created;
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
