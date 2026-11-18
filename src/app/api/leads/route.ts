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
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const assignedTo = searchParams.get("assignedTo");
  const unassigned = searchParams.get("unassigned") === "true";
  const role = (session.user as any)?.role;
  const userId = parseInt((session.user as any)?.id);

  const where: any = {};

  // If Staff, restrict to their assigned leads only
  if (role === "STAFF") {
    where.assignedToId = userId;
  } else if (unassigned) {
    where.assignedToId = null;
  } else if (assignedTo) {
    where.assignedToId = parseInt(assignedTo);
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
    ];
  }

  try {
    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { callLogs: true, documents: true, applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
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
    const { name, phone, email, city, loanAmount, status, assignedToId } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        city: city || null,
        loanAmount: loanAmount ? parseFloat(loanAmount) : null,
        status: status || "NEW",
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        assignedAt: assignedToId ? new Date() : null,
        source: "MANUAL",
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
