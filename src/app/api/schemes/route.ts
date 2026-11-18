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
    const {
      bankId,
      name,
      loanType,
      minInterest,
      maxInterest,
      minAmount,
      maxAmount,
      tenureMonths,
      processingFee,
    } = body;

    if (!bankId || !name || !loanType || minInterest === undefined || maxInterest === undefined) {
      return NextResponse.json(
        { error: "bankId, name, loanType, and interest rates are required" },
        { status: 400 }
      );
    }

    const scheme = await prisma.loanScheme.create({
      data: {
        bankId: parseInt(bankId),
        name,
        loanType,
        minInterest: parseFloat(minInterest),
        maxInterest: parseFloat(maxInterest),
        minAmount: minAmount ? parseFloat(minAmount) : 50000,
        maxAmount: maxAmount ? parseFloat(maxAmount) : 5000000,
        tenureMonths: tenureMonths ? parseInt(tenureMonths) : 60,
        processingFee: processingFee ? parseFloat(processingFee) : null,
      },
    });

    return NextResponse.json(scheme, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
