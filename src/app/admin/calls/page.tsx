"use client";

import React, { useEffect, useState } from "react";
import {
  PhoneCall,
  Target,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  User,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function DailyCallTargetsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, callsRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/calls"),
      ]);
      const emps = await empRes.json();
      const calls = await callsRes.json();
      setEmployees(Array.isArray(emps) ? emps : []);
      setCallLogs(Array.isArray(calls) ? calls : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalTarget = employees.reduce((sum, e) => sum + e.todayTarget, 0);
  const totalCompleted = employees.reduce((sum, e) => sum + e.todayCompleted, 0);
  const totalInterested = employees.reduce((sum, e) => sum + e.todayInterested, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Call Targets & Performance Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard quota: 100 customer calls per employee per day.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Team Quota</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTarget} calls</div>
          <div className="text-[11px] text-slate-400 mt-1">{employees.length} active agents</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Calls Completed Today</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{totalCompleted}</div>
          <div className="text-[11px] text-slate-400 mt-1">{overallPercentage}% overall achievement</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Interested Customers</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalInterested}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for document collection</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase">Conversion Rate</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">
            {totalCompleted > 0 ? Math.round((totalInterested / totalCompleted) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Interested / Calls logged</div>
        </div>
      </div>

      {/* Employee Target Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-sm text-slate-900">Agent Performance Board</h3>
          </div>
          <span className="text-xs text-slate-500">Today: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Daily Target</th>
                <th className="py-3 px-4">Calls Made</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Interested Converted</th>
                <th className="py-3 px-4">Conversion %</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const convRate = emp.todayCompleted > 0 ? Math.round((emp.todayInterested / emp.todayCompleted) * 100) : 0;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {emp.todayTarget} calls
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {emp.todayCompleted} calls
                    </td>
                    <td className="py-3.5 px-4 w-48">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">{emp.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            emp.progressPercent >= 100
                              ? "bg-emerald-500"
                              : emp.progressPercent >= 70
                              ? "bg-indigo-600"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${emp.progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {emp.todayInterested} leads
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {convRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          emp.progressPercent >= 100
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : emp.progressPercent >= 70
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {emp.progressPercent >= 100 ? "Achieved" : "On Track"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Call Logs Feed */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-sm text-slate-900">Recent Call Logs Feed</h3>
          </div>
          <span className="text-xs text-slate-400">Showing last 100 logged calls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Calling Agent</th>
                <th className="py-3 px-4">Call Status</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No calls logged yet today.
                  </td>
                </tr>
              ) : (
                callLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.calledAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.lead?.name}
                      <div className="text-[11px] font-mono text-slate-400 font-normal">
                        {log.lead?.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {log.user?.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.callStatus}
                    </td>
                    <td className="py-3 px-4">
                      {log.interested ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ThumbsUp className="w-3 h-3" /> Interested
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                          <ThumbsDown className="w-3 h-3" /> Not Interested
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
