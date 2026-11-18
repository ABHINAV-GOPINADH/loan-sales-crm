import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { mode, leadIds, employeeId } = body;

    if (mode === "manual") {
      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0 || !employeeId) {
        return NextResponse.json(
          { error: "leadIds array and employeeId are required for manual assignment" },
          { status: 400 }
        );
      }

      await prisma.lead.updateMany({
        where: { id: { in: leadIds.map((id: any) => parseInt(id)) } },
        data: {
          assignedToId: parseInt(employeeId),
          assignedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: `Assigned ${leadIds.length} leads to employee ID ${employeeId}`,
      });
    }

    if (mode === "round_robin") {
      // Fetch active staff employees
      const staffList = await prisma.user.findMany({
        where: { role: "STAFF", isActive: true },
        select: { id: true, name: true },
      });

      if (staffList.length === 0) {
        return NextResponse.json(
          { error: "No active staff employees found to distribute leads to" },
          { status: 400 }
        );
      }

      // Fetch leads to distribute (either specified leadIds or all unassigned leads)
      const targetLeads = await prisma.lead.findMany({
        where: leadIds && Array.isArray(leadIds) && leadIds.length > 0
          ? { id: { in: leadIds.map((id: any) => parseInt(id)) } }
          : { assignedToId: null },
        select: { id: true },
      });

      if (targetLeads.length === 0) {
        return NextResponse.json(
          { message: "No unassigned leads found to distribute", count: 0 }
        );
      }

      // Distribute evenly
      const updates = targetLeads.map((lead, index) => {
        const assignedStaff = staffList[index % staffList.length];
        return prisma.lead.update({
          where: { id: lead.id },
          data: {
            assignedToId: assignedStaff.id,
            assignedAt: new Date(),
          },
        });
      });

      await prisma.$transaction(updates);

      return NextResponse.json({
        message: `Successfully distributed ${targetLeads.length} leads across ${staffList.length} staff employees via Round-Robin`,
        count: targetLeads.length,
      });
    }

    return NextResponse.json({ error: "Invalid distribution mode" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
