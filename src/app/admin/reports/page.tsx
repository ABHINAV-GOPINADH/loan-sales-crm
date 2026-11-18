"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  Users,
  BadgePercent,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsAndAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Employee Name", "Daily Target", "Calls Completed Today", "Interested Converted", "Completion %"],
      ...data.staffPerformance.map((s: any) => [
        s.name,
        s.targetCalls,
        s.completedCalls,
        s.interestedCount,
        `${s.percentage}%`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_performance_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const funnel = data?.funnel || [];
  const bankStats = data?.bankStats || [];
  const staffPerformance = data?.staffPerformance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reports & Business Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conversion funnels, lending institution volume, and call productivity analytics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Performance CSV</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Lead Pool</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalLeads ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed across team</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Disbursed Capital</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">
            {formatCurrency(kpis.totalDisbursedAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.disbursedApplicationsCount ?? 0} loans closed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Sanctioned Volume</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">
            {formatCurrency(kpis.totalApprovedAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Approved across banks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Daily Target Hit Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {kpis.targetAchievementPercent ?? 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{kpis.totalCallsToday} calls logged today</div>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-sm">End-to-End Conversion Funnel</h3>
          <p className="text-xs text-slate-500">From initial lead contact to final bank loan disbursement</p>
        </div>

        <div className="space-y-3">
          {funnel.map((step: any, idx: number) => {
            const baseCount = funnel[0]?.count || 1;
            const percentage = Math.round((step.count / baseCount) * 100);
            return (
              <div key={step.stage}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{step.count} leads</span>
                    <span className="text-slate-400 font-mono text-[11px]">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all"
                    style={{ width: `${Math.max(4, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Bank Volume & Staff Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank-Wise Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Bank Partner Disbursements</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {bankStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No bank loan data yet.</div>
            ) : (
              bankStats.map((item: any) => (
                <div key={item.bank} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.bank}</div>
                    <div className="text-[11px] text-slate-400">{item.applications} applications</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-700 font-mono text-sm">
                      {formatCurrency(item.disbursedAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">Disbursed</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Staff Target Achievement */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Staff Daily Target Leaderboard</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {staffPerformance.map((staff: any) => (
              <div key={staff.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{staff.name}</div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {staff.interestedCount} interested leads converted
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-indigo-600">
                    {staff.completedCalls} / {staff.targetCalls} calls
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      staff.percentage >= 100 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {staff.percentage}% Achieved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
