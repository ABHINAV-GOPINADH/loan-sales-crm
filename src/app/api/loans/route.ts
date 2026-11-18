import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const role = (session.user as any)?.role;
  const currentUserId = parseInt((session.user as any)?.id);

  const where: any = {};
  if (status) where.status = status;
  if (role === "STAFF") {
    where.handledById = currentUserId;
  }

  try {
    const loans = await prisma.loanApplication.findMany({
      where,
      include: {
        lead: true,
        scheme: {
          include: { bank: true },
        },
        handledBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { leadId, schemeId, appliedAmount, bankRefNumber } = body;
    const currentUserId = parseInt((session.user as any)?.id);

    if (!leadId || !schemeId || !appliedAmount) {
      return NextResponse.json(
        { error: "leadId, schemeId, and appliedAmount are required" },
        { status: 400 }
      );
    }

    const application = await prisma.loanApplication.create({
      data: {
        leadId: parseInt(leadId),
        schemeId: parseInt(schemeId),
        handledById: currentUserId,
        appliedAmount: parseFloat(appliedAmount),
        status: "SUBMITTED",
        bankRefNumber: bankRefNumber || `APP-${Date.now().toString().slice(-6)}`,
      },
      include: {
        scheme: { include: { bank: true } },
        lead: true,
      },
    });

    // Update lead status to APPLIED
    await prisma.lead.update({
      where: { id: parseInt(leadId) },
      data: { status: "APPLIED" },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
