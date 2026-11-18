"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Target,
  PhoneCall,
  ThumbsUp,
  FileCheck,
  BadgePercent,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StaffPerformancePage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = parseInt((session?.user as any)?.id);
  const myPerf = reports?.staffPerformance?.find((s: any) => s.id === currentUserId) || {
    targetCalls: 100,
    completedCalls: 0,
    interestedCount: 0,
    percentage: 0,
  };

  const conversionRate = myPerf.completedCalls > 0
    ? Math.round((myPerf.interestedCount / myPerf.completedCalls) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          My Calling & Conversion Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Personal scorecards, daily quota metrics, and loan conversion analytics.
        </p>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            Today's Quota Benchmark
          </span>
          <div className="text-3xl font-bold tracking-tight mt-1">
            {myPerf.completedCalls} / {myPerf.targetCalls} Calls
          </div>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            {myPerf.percentage >= 100
              ? "Awesome job! You have exceeded your 100-call daily target."
              : `${myPerf.targetCalls - myPerf.completedCalls} more calls needed today to reach your 100-call target.`}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-4xl font-bold text-amber-300 font-mono">
            {myPerf.percentage}%
          </div>
          <div className="text-xs text-indigo-200 mt-0.5">Quota Achieved</div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Interested Conversions</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{myPerf.interestedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Customer prospects identified</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Call Conversion Rate</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{conversionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Interested / Total Calls</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Daily Target Benchmark</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">100 calls</div>
          <div className="text-xs text-slate-500 mt-1">Standard company target</div>
        </div>
      </div>

      {/* Team Leaderboard Comparison */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Team Leaderboard Today</h3>
        <p className="text-xs text-slate-500 mb-4">See how your call count stacks against teammates</p>

        <div className="space-y-3">
          {reports?.staffPerformance?.map((staff: any) => {
            const isMe = staff.id === currentUserId;
            return (
              <div
                key={staff.id}
                className={`p-3.5 rounded-lg border transition-colors ${
                  isMe
                    ? "bg-indigo-50/70 border-indigo-200"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{staff.name}</span>
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-700">
                    <strong>{staff.completedCalls}</strong> / {staff.targetCalls} calls ({staff.percentage}%)
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      staff.percentage >= 100
                        ? "bg-emerald-500"
                        : staff.percentage >= 70
                        ? "bg-indigo-600"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, staff.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
