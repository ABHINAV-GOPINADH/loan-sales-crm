import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const id = parseInt(params.id);

  try {
    const { status, remarks } = await req.json();

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either VERIFIED or REJECTED" },
        { status: 400 }
      );
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status,
        remarks: remarks || null,
        verifiedBy: session.user?.name || "Admin",
        verifiedAt: new Date(),
      },
      include: {
        lead: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
