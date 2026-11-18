"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  PhoneCall,
  BadgePercent,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Upload,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusCounts = data?.statusCounts || {};
  const staffPerformance = data?.staffPerformance || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Operations Dashboard</h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            Real-time call center performance, lead assignments, and loan disbursements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Leads</span>
          </Link>
          <Link
            href="/admin/distribution"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-white border border-white/20 text-xs font-semibold rounded-lg transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Distribute Leads</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Leads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.totalLeads ?? 0}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">
              {statusCounts["NEW"] || 0}
            </span>{" "}
            uncontacted new leads
          </div>
        </div>

        {/* Today's Calls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Calls</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {kpis.totalCallsToday ?? 0}{" "}
            <span className="text-xs font-normal text-slate-400">/ {kpis.totalTargetToday ?? 0} target</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Team Completion</span>
              <span className="font-semibold text-indigo-600">
                {kpis.targetAchievementPercent ?? 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, kpis.targetAchievementPercent || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Staff</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.activeStaff ?? 0}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Daily target: 100 calls/agent</span>
          </div>
        </div>

        {/* Disbursed Amount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Disbursed</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-700">
            {formatCurrency(kpis.totalDisbursedAmount)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{kpis.disbursedApplicationsCount ?? 0} successfully closed loans</span>
          </div>
        </div>
      </div>

      {/* Conversion Pipeline Stage Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Lead Conversion Pipeline</h3>
            <p className="text-xs text-slate-500">Current status distribution across all customer leads</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all leads <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "New", count: statusCounts["NEW"] || 0, color: "border-blue-500 bg-blue-50/50 text-blue-700" },
            { label: "Contacted", count: statusCounts["CONTACTED"] || 0, color: "border-yellow-500 bg-yellow-50/50 text-yellow-700" },
            { label: "Interested", count: statusCounts["INTERESTED"] || 0, color: "border-emerald-500 bg-emerald-50/50 text-emerald-700" },
            { label: "Docs Collected", count: statusCounts["DOCS_COLLECTED"] || 0, color: "border-indigo-500 bg-indigo-50/50 text-indigo-700" },
            { label: "Applied", count: statusCounts["APPLIED"] || 0, color: "border-purple-500 bg-purple-50/50 text-purple-700" },
            { label: "Approved", count: statusCounts["APPROVED"] || 0, color: "border-green-500 bg-green-50/50 text-green-700" },
            { label: "Disbursed", count: statusCounts["DISBURSED"] || 0, color: "border-teal-500 bg-teal-50/50 text-teal-700" },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded-lg border-l-4 border shadow-2xs ${item.color}`}
            >
              <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">{item.label}</div>
              <div className="text-xl font-bold mt-1">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Call Targets Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Today's Employee Call Targets</h3>
            <p className="text-xs text-slate-500">Daily target: 100 calls per employee</p>
          </div>
          <Link
            href="/admin/calls"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage Targets <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {staffPerformance.map((emp: any) => (
            <div key={emp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center">
                  {emp.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{emp.name}</div>
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-emerald-600">{emp.interestedCount}</span> interested leads converted today
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:w-1/2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">
                      {emp.completedCalls} / {emp.targetCalls} calls
                    </span>
                    <span
                      className={`font-semibold ${
                        emp.percentage >= 100
                          ? "text-emerald-600"
                          : emp.percentage >= 70
                          ? "text-indigo-600"
                          : "text-amber-600"
                      }`}
                    >
                      {emp.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        emp.percentage >= 100
                          ? "bg-emerald-500"
                          : emp.percentage >= 70
                          ? "bg-indigo-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, emp.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      emp.percentage >= 100
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : emp.percentage >= 70
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {emp.percentage >= 100 ? "Target Achieved" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
