import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  try {
    const employees = await prisma.user.findMany({
      where: { role: "STAFF" },
      include: {
        dailyTargets: {
          where: { date: todayStr },
        },
        _count: {
          select: {
            leads: true,
            callLogs: true,
            applications: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = employees.map((emp) => {
      const todayTarget = emp.dailyTargets[0] || {
        targetCalls: 100,
        completedCalls: 0,
        interestedCount: 0,
      };

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        assignedLeadsCount: emp._count.leads,
        totalCallsCount: emp._count.callLogs,
        applicationsCount: emp._count.applications,
        todayTarget: todayTarget.targetCalls,
        todayCompleted: todayTarget.completedCalls,
        todayInterested: todayTarget.interestedCount,
        progressPercent: Math.min(
          100,
          Math.round((todayTarget.completedCalls / (todayTarget.targetCalls || 100)) * 100)
        ),
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role: "STAFF",
        isActive: true,
      },
    });

    // Initialize today's daily target of 100 calls
    const todayStr = new Date().toISOString().split("T")[0];
    await prisma.dailyTarget.create({
      data: {
        userId: newEmployee.id,
        date: todayStr,
        targetCalls: 100,
        completedCalls: 0,
        interestedCount: 0,
      },
    });

    return NextResponse.json(
      { id: newEmployee.id, name: newEmployee.name, email: newEmployee.email },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isActive, targetCalls } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee id is required" }, { status: 400 });
    }

    if (isActive !== undefined) {
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { isActive: Boolean(isActive) },
      });
    }

    if (targetCalls !== undefined) {
      const todayStr = new Date().toISOString().split("T")[0];
      await prisma.dailyTarget.upsert({
        where: {
          userId_date: {
            userId: parseInt(id),
            date: todayStr,
          },
        },
        create: {
          userId: parseInt(id),
          date: todayStr,
          targetCalls: parseInt(targetCalls),
          completedCalls: 0,
        },
        update: {
          targetCalls: parseInt(targetCalls),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
