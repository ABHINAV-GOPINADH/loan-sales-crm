"use client";

import React, { useEffect, useState } from "react";
import { Download, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MobileReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Employee Name", "Daily Target", "Calls Completed", "Interested", "Completion %"],
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
    link.setAttribute("download", `crm_performance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading analytics...</div>;
  }

  const kpis = data?.kpis || {};
  const funnel = data?.funnel || [];
  const bankStats = data?.bankStats || [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-[11px] text-slate-500">Business performance metrics</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px]"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Disbursed Overview */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400">Total Disbursed Capital</span>
        <div className="text-2xl font-bold text-teal-700">{formatCurrency(kpis.totalDisbursedAmount)}</div>
        <div className="text-[11px] text-slate-500">{kpis.disbursedApplicationsCount} closed loans</div>
      </div>

      {/* Funnel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-slate-900 text-sm">Conversion Funnel</h3>
        {funnel.map((step: any) => {
          const baseCount = funnel[0]?.count || 1;
          const percentage = Math.round((step.count / baseCount) * 100);
          return (
            <div key={step.stage}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700">{step.stage}</span>
                <span className="font-mono text-slate-900">{step.count} ({percentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.max(4, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bank Disbursements */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Bank Partner Disbursements</h3>
        {bankStats.map((item: any) => (
          <div key={item.bank} className="flex justify-between items-center py-1.5 border-b last:border-0">
            <div>
              <span className="font-bold text-slate-800 block">{item.bank}</span>
              <span className="text-[10px] text-slate-400">{item.applications} applications</span>
            </div>
            <span className="font-bold text-teal-700">{formatCurrency(item.disbursedAmount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
