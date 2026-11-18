"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  PhoneCall,
  Clock,
  ArrowRight,
  User,
  ThumbsUp,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function StaffFollowUpsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const res = await fetch("/api/calls");
      const data = await res.json();
      const followUps = Array.isArray(data)
        ? data.filter((c: any) => c.followUpDate)
        : [];
      setCalls(followUps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Scheduled Follow-Up Calls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Reminders for callbacks scheduled during previous phone conversations with customers.
        </p>
      </div>

      {/* Follow-ups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading scheduled follow-ups...
          </div>
        ) : calls.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No scheduled follow-up calls pending. Log calls with a follow-up date to see them here.
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(call.followUpDate)}
                  </span>
                  {call.interested && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700">
                      Interested
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{call.lead?.name}</h3>
                <a
                  href={`tel:${call.lead?.phone}`}
                  className="font-mono text-xs font-semibold text-indigo-600 flex items-center gap-1 mb-2"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> {call.lead?.phone}
                </a>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {call.remarks || "Callback requested by customer"}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Status: {call.lead?.status}</span>
                <Link
                  href={`/staff/leads/${call.leadId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Open Lead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
