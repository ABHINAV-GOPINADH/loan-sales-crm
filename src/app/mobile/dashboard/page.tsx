"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  PhoneCall,
  BadgePercent,
  CheckCircle2,
  Share2,
  Upload,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MobileDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusCounts = data?.statusCounts || {};
  const staffPerformance = data?.staffPerformance || [];

  return (
    <div className="space-y-4">
      {/* Quick Action Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/mobile/distribution"
          className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Distribute Leads</span>
        </Link>
        <Link
          href="/mobile/leads"
          className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>All Leads ({kpis.totalLeads})</span>
        </Link>
        <Link
          href="/mobile/loans"
          className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
          <span>Loans ({kpis.totalApplications})</span>
        </Link>
      </div>

      {/* Hero Card: Today's Target Progress */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-xl p-4 text-white shadow-sm">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-indigo-200 uppercase font-semibold text-[10px] tracking-wider">
            Today's Team Quota
          </span>
          <span className="font-mono text-amber-300 font-bold">{kpis.targetAchievementPercent}%</span>
        </div>
        <div className="text-xl font-bold">
          {kpis.totalCallsToday} <span className="text-xs font-normal text-indigo-200">/ {kpis.totalTargetToday} calls</span>
        </div>
        <div className="w-full bg-black/25 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-emerald-400 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, kpis.targetAchievementPercent || 0)}%` }}
          />
        </div>
        <div className="text-[11px] text-indigo-200 mt-2 flex justify-between">
          <span>{kpis.activeStaff} active call agents</span>
          <span className="text-emerald-300 font-medium">100 calls/agent</span>
        </div>
      </div>

      {/* 2x2 KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Leads</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.totalLeads}</div>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
            {statusCounts["NEW"] || 0} uncontacted
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disbursed</span>
          <div className="text-lg font-bold text-teal-700 mt-0.5">
            {formatCurrency(kpis.totalDisbursedAmount)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            {kpis.disbursedApplicationsCount} closed
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interested</span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">
            {statusCounts["INTERESTED"] || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Ready for KYC</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sanctioned</span>
          <div className="text-lg font-bold text-indigo-600 mt-0.5">
            {formatCurrency(kpis.totalApprovedAmount)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Approved</span>
        </div>
      </div>

      {/* Lead Pipeline Horizontal Scroll */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="text-xs font-bold text-slate-900 mb-2">Lead Pipeline Status</div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: "New", count: statusCounts["NEW"] || 0, bg: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Contacted", count: statusCounts["CONTACTED"] || 0, bg: "bg-yellow-50 text-yellow-700 border-yellow-200" },
            { label: "Interested", count: statusCounts["INTERESTED"] || 0, bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Docs", count: statusCounts["DOCS_COLLECTED"] || 0, bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { label: "Applied", count: statusCounts["APPLIED"] || 0, bg: "bg-purple-50 text-purple-700 border-purple-200" },
            { label: "Approved", count: statusCounts["APPROVED"] || 0, bg: "bg-green-50 text-green-700 border-green-200" },
            { label: "Disbursed", count: statusCounts["DISBURSED"] || 0, bg: "bg-teal-50 text-teal-700 border-teal-200" },
          ].map((item) => (
            <div
              key={item.label}
              className={`px-3 py-2 rounded-lg border text-center shrink-0 ${item.bg}`}
            >
              <div className="text-[10px] font-medium opacity-80 uppercase">{item.label}</div>
              <div className="text-base font-bold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Call Targets List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-xs text-slate-900">Agent Performance Today</h3>
          <Link href="/mobile/calls" className="text-[11px] font-semibold text-indigo-600">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {staffPerformance.map((staff: any) => (
            <div key={staff.id} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800">{staff.name}</span>
                <span className="font-mono text-slate-600">
                  {staff.completedCalls}/{staff.targetCalls} ({staff.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    staff.percentage >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${Math.min(100, staff.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
