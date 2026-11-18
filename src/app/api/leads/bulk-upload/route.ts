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
    const { leads } = await req.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided in payload" }, { status: 400 });
    }

    const validLeads = leads
      .filter((row: any) => row.name && row.phone)
      .map((row: any) => ({
        name: String(row.name).trim(),
        phone: String(row.phone).trim(),
        email: row.email ? String(row.email).trim() : null,
        city: row.city ? String(row.city).trim() : null,
        loanAmount: row.loanAmount ? parseFloat(row.loanAmount) : null,
        status: row.status || "NEW",
        source: "BULK_UPLOAD",
        assignedToId: row.assignedToId ? parseInt(row.assignedToId) : null,
        assignedAt: row.assignedToId ? new Date() : null,
      }));

    if (validLeads.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found. Please check columns: name, phone, email, city, loanAmount" },
        { status: 400 }
      );
    }

    const created = await prisma.lead.createMany({
      data: validLeads,
    });

    return NextResponse.json({
      message: `Successfully imported ${created.count} leads`,
      count: created.count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
