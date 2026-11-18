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
  const leadId = searchParams.get("leadId");
  const userId = searchParams.get("userId");
  const role = (session.user as any)?.role;
  const currentUserId = parseInt((session.user as any)?.id);

  const where: any = {};
  if (leadId) where.leadId = parseInt(leadId);
  if (role === "STAFF") {
    where.userId = currentUserId;
  } else if (userId) {
    where.userId = parseInt(userId);
  }

  try {
    const logs = await prisma.callLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, phone: true, status: true } },
      },
      orderBy: { calledAt: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
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
    const { leadId, callStatus, remarks, interested, followUpDate } = body;
    const currentUserId = parseInt((session.user as any)?.id);

    if (!leadId || !callStatus) {
      return NextResponse.json({ error: "leadId and callStatus are required" }, { status: 400 });
    }

    const leadIdInt = parseInt(leadId);
    const isInterested = Boolean(interested);

    // 1. Create Call Log
    const callLog = await prisma.callLog.create({
      data: {
        leadId: leadIdInt,
        userId: currentUserId,
        callStatus,
        remarks: remarks || "",
        interested: isInterested,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    // 2. Update Lead status accordingly
    let newLeadStatus: string | undefined = undefined;
    if (!isInterested && callStatus === "CONNECTED") {
      newLeadStatus = "NOT_INTERESTED";
    } else if (isInterested) {
      newLeadStatus = "INTERESTED";
    } else if (callStatus === "CONNECTED") {
      newLeadStatus = "CONTACTED";
    }

    if (newLeadStatus) {
      await prisma.lead.update({
        where: { id: leadIdInt },
        data: { status: newLeadStatus },
      });
    }

    // 3. Upsert today's DailyTarget for the employee
    const todayStr = new Date().toISOString().split("T")[0];
    await prisma.dailyTarget.upsert({
      where: {
        userId_date: {
          userId: currentUserId,
          date: todayStr,
        },
      },
      create: {
        userId: currentUserId,
        date: todayStr,
        targetCalls: 100,
        completedCalls: 1,
        interestedCount: isInterested ? 1 : 0,
      },
      update: {
        completedCalls: { increment: 1 },
        ...(isInterested ? { interestedCount: { increment: 1 } } : {}),
      },
    });

    return NextResponse.json(callLog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
