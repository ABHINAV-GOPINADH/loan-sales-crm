"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  PhoneCall,
  Target,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  AlertCircle,
  ThumbsUp,
  MapPin,
  FileCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function StaffDashboardPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Call Modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [callStatus, setCallStatus] = useState("CONNECTED");
  const [remarks, setRemarks] = useState("");
  const [interested, setInterested] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, callsRes, reportsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/calls"),
        fetch("/api/reports"),
      ]);
      const leadsData = await leadsRes.json();
      const callsData = await callsRes.json();
      const reportsData = await reportsRes.json();

      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setCallLogs(Array.isArray(callsData) ? callsData : []);
      setReports(reportsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = parseInt((session?.user as any)?.id);
  const myPerformance = reports?.staffPerformance?.find((s: any) => s.id === currentUserId) || {
    targetCalls: 100,
    completedCalls: 0,
    interestedCount: 0,
    percentage: 0,
  };

  const handleOpenCallModal = (lead: any) => {
    setSelectedLead(lead);
    setCallStatus("CONNECTED");
    setRemarks("");
    setInterested(true);
    setFollowUpDate("");
    setCallModalOpen(true);
  };

  const handleSubmitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          callStatus,
          remarks,
          interested,
          followUpDate: followUpDate || null,
        }),
      });

      if (res.ok) {
        setCallModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to log call");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Scheduled follow-ups
  const scheduledFollowups = callLogs.filter(
    (log) => log.followUpDate && new Date(log.followUpDate) >= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Top Quota Progress Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Agent Calling Desk
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Welcome, {session?.user?.name || "Agent"}
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Your daily target is 100 calls. Contact assigned customers, explain loan schemes, and collect documents.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 w-full md:w-72 shrink-0">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-indigo-200">Daily Target Quota</span>
            <span className="text-amber-300 font-mono text-sm">{myPerformance.percentage}%</span>
          </div>
          <div className="text-xl font-bold mb-2">
            {myPerformance.completedCalls}{" "}
            <span className="text-xs font-normal text-indigo-300">/ {myPerformance.targetCalls} calls completed</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                myPerformance.percentage >= 100
                  ? "bg-emerald-400"
                  : myPerformance.percentage >= 70
                  ? "bg-indigo-400"
                  : "bg-amber-400"
              }`}
              style={{ width: `${Math.min(100, myPerformance.percentage)}%` }}
            />
          </div>
          <div className="text-[11px] text-indigo-200 mt-2 flex justify-between">
            <span>Remaining: {Math.max(0, myPerformance.targetCalls - myPerformance.completedCalls)} calls</span>
            <span className="text-emerald-300 font-medium">{myPerformance.interestedCount} interested</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned Leads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
          <div className="text-xs text-slate-500 mt-1">In your personal pipeline</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Interested Customers</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{myPerformance.interestedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ready for document collection</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Scheduled Follow-Ups</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{scheduledFollowups.length}</div>
          <div className="text-xs text-slate-500 mt-1">Upcoming callbacks</div>
        </div>
      </div>

      {/* Actionable Leads To Call Next */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Your Calling Queue</h3>
            <p className="text-xs text-slate-500">Click "Call Customer" to dial and log outcome</p>
          </div>
          <Link
            href="/staff/leads"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All ({leads.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Loan Requirement</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.slice(0, 8).map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <Link
                      href={`/staff/leads/${lead.id}`}
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {lead.phone}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {formatCurrency(lead.loanAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {lead.city || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenCallModal(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Log Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Call Log Modal */}
      {callModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Call Outcome</h3>
              </div>
              <button
                onClick={() => setCallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCall} className="space-y-3.5 text-xs">
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{selectedLead.name}</span>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> {selectedLead.phone}
                  </a>
                </div>
                <div className="text-slate-600 text-[11px] mt-1">
                  Loan Requirement: <strong>{formatCurrency(selectedLead.loanAmount)}</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Call Status *</label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="CONNECTED">Connected / Spoke with Customer</option>
                  <option value="NO_ANSWER">Ringing / No Answer</option>
                  <option value="BUSY">Line Busy</option>
                  <option value="CALLBACK">Customer Requested Call Back</option>
                  <option value="WRONG_NUMBER">Wrong Number / Invalid</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Interest *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterested(true)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      interested
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Interested in Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterested(false)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      !interested
                        ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Not Interested
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Schedule Follow-Up Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Call Remarks & Customer Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Discussed HDFC personal loan scheme at 10.5%. Customer requested call back tomorrow after 4 PM with salary slips."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save & Increment Daily Target (+1)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
