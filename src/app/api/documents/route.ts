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
  const status = searchParams.get("status");

  const where: any = {};
  if (leadId) where.leadId = parseInt(leadId);
  if (status) where.status = status;

  try {
    const documents = await prisma.document.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
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
    const { leadId, docType, fileName, fileUrl } = body;

    if (!leadId || !docType || !fileName) {
      return NextResponse.json(
        { error: "leadId, docType, and fileName are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.create({
      data: {
        leadId: parseInt(leadId),
        docType,
        fileName,
        fileUrl: fileUrl || `/sample-docs/${fileName}`,
        status: "PENDING",
      },
      include: {
        lead: true,
      },
    });

    // Update lead status to DOCS_COLLECTED if currently pending or earlier
    await prisma.lead.update({
      where: { id: parseInt(leadId) },
      data: { status: "DOCS_COLLECTED" },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
