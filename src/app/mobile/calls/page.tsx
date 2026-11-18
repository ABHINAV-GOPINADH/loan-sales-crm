"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, Target, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function MobileCallsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/employees"), fetch("/api/calls")])
      .then(async ([empRes, callRes]) => {
        const emps = await empRes.json();
        const calls = await callRes.json();
        setEmployees(Array.isArray(emps) ? emps : []);
        setCallLogs(Array.isArray(calls) ? calls : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Daily Call Targets</h1>
        <p className="text-[11px] text-slate-500">100 calls per agent quota tracking</p>
      </div>

      {/* Progress Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700">Team Target Status</h3>
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>{emp.name}</span>
              <span className="text-indigo-600 font-mono">
                {emp.todayCompleted} / {emp.todayTarget} ({emp.progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${emp.progressPercent >= 100 ? "bg-emerald-500" : "bg-indigo-600"}`}
                style={{ width: `${Math.min(100, emp.progressPercent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Calls Feed */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-slate-700">Recent Calls Feed</h3>
        {callLogs.slice(0, 15).map((log) => (
          <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">{log.lead?.name}</span>
              <span className="text-[10px] text-slate-400">{formatDateTime(log.calledAt)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-mono">{log.callStatus}</span>
              {log.interested ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Interested
                </span>
              ) : (
                <span className="text-slate-500">Not Interested</span>
              )}
            </div>
            {log.remarks && <p className="text-slate-600 text-[11px]">{log.remarks}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
