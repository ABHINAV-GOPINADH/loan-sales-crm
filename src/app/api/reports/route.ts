import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  try {
    // 1. Core KPIs
    const totalLeads = await prisma.lead.count();
    const activeStaff = await prisma.user.count({ where: { role: "STAFF", isActive: true } });
    
    // Today's total calls
    const todayTargets = await prisma.dailyTarget.findMany({
      where: { date: todayStr },
      include: { user: { select: { id: true, name: true } } },
    });

    const totalCallsToday = todayTargets.reduce((sum, t) => sum + t.completedCalls, 0);
    const totalTargetToday = todayTargets.reduce((sum, t) => sum + t.targetCalls, 0) || (activeStaff * 100);

    // Loan stats
    const allApplications = await prisma.loanApplication.findMany({
      include: { scheme: { include: { bank: true } } },
    });

    const approvedApplications = allApplications.filter((a) => a.status === "APPROVED" || a.status === "DISBURSED");
    const disbursedApplications = allApplications.filter((a) => a.status === "DISBURSED");

    const totalDisbursedAmount = disbursedApplications.reduce((sum, a) => sum + (a.approvedAmount || a.appliedAmount || 0), 0);
    const totalApprovedAmount = approvedApplications.reduce((sum, a) => sum + (a.approvedAmount || a.appliedAmount || 0), 0);

    // 2. Leads by Status Breakdown
    const statusCountsRaw = await prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    statusCountsRaw.forEach((sc) => {
      statusCounts[sc.status] = sc._count.id;
    });

    // 3. Conversion Funnel
    const funnel = [
      { stage: "Total Leads", count: totalLeads },
      { stage: "Contacted", count: totalLeads - (statusCounts["NEW"] || 0) },
      { stage: "Interested", count: (statusCounts["INTERESTED"] || 0) + (statusCounts["DOCS_PENDING"] || 0) + (statusCounts["DOCS_COLLECTED"] || 0) + (statusCounts["APPLIED"] || 0) + (statusCounts["APPROVED"] || 0) + (statusCounts["DISBURSED"] || 0) },
      { stage: "Docs Collected", count: (statusCounts["DOCS_COLLECTED"] || 0) + (statusCounts["APPLIED"] || 0) + (statusCounts["APPROVED"] || 0) + (statusCounts["DISBURSED"] || 0) },
      { stage: "Applied to Bank", count: (statusCounts["APPLIED"] || 0) + (statusCounts["APPROVED"] || 0) + (statusCounts["DISBURSED"] || 0) },
      { stage: "Approved", count: (statusCounts["APPROVED"] || 0) + (statusCounts["DISBURSED"] || 0) },
      { stage: "Disbursed", count: statusCounts["DISBURSED"] || 0 },
    ];

    // 4. Bank-wise stats
    const bankStatsMap: Record<string, { count: number; disbursed: number }> = {};
    for (const app of allApplications) {
      const bankName = app.scheme.bank.name;
      if (!bankStatsMap[bankName]) {
        bankStatsMap[bankName] = { count: 0, disbursed: 0 };
      }
      bankStatsMap[bankName].count += 1;
      if (app.status === "DISBURSED") {
        bankStatsMap[bankName].disbursed += app.approvedAmount || app.appliedAmount || 0;
      }
    }

    const bankStats = Object.entries(bankStatsMap).map(([bank, data]) => ({
      bank,
      applications: data.count,
      disbursedAmount: data.disbursed,
    }));

    // 5. Employee Call Leaderboard
    const staffPerformance = todayTargets.map((t) => ({
      id: t.user.id,
      name: t.user.name,
      targetCalls: t.targetCalls,
      completedCalls: t.completedCalls,
      interestedCount: t.interestedCount,
      percentage: Math.min(100, Math.round((t.completedCalls / (t.targetCalls || 1)) * 100)),
    }));

    return NextResponse.json({
      kpis: {
        totalLeads,
        activeStaff,
        totalCallsToday,
        totalTargetToday,
        targetAchievementPercent: Math.round((totalCallsToday / (totalTargetToday || 1)) * 100),
        totalApplications: allApplications.length,
        disbursedApplicationsCount: disbursedApplications.length,
        totalDisbursedAmount,
        totalApprovedAmount,
      },
      funnel,
      statusCounts,
      bankStats,
      staffPerformance,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
