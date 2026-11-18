import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const id = parseInt(params.id);

  try {
    const body = await req.json();
    const { status, approvedAmount, bankRefNumber, adminRemarks } = body;

    const data: any = {};
    if (status) data.status = status;
    if (approvedAmount !== undefined) data.approvedAmount = parseFloat(approvedAmount);
    if (bankRefNumber !== undefined) data.bankRefNumber = bankRefNumber;
    if (adminRemarks !== undefined) data.adminRemarks = adminRemarks;

    if (status === "APPROVED") {
      data.approvedAt = new Date();
    } else if (status === "DISBURSED") {
      data.disbursedAt = new Date();
    }

    const updated = await prisma.loanApplication.update({
      where: { id },
      data,
      include: {
        lead: true,
        scheme: { include: { bank: true } },
      },
    });

    // Sync status to the parent lead
    if (["APPROVED", "DISBURSED", "REJECTED"].includes(status)) {
      await prisma.lead.update({
        where: { id: updated.leadId },
        data: { status },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
