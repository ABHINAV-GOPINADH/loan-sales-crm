"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  PhoneCall,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StaffLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Call Modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [callStatus, setCallStatus] = useState("CONNECTED");
  const [remarks, setRemarks] = useState("");
  const [interested, setInterested] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCall = (lead: any, e: React.MouseEvent) => {
    e.stopPropagation();
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
        fetchLeads();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          My Assigned Customer Leads
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customers assigned to you for calling, scheme presentation, and document collection.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assigned leads by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="INTERESTED">Interested</option>
          <option value="NOT_INTERESTED">Not Interested</option>
          <option value="DOCS_PENDING">Docs Pending</option>
          <option value="DOCS_COLLECTED">Docs Collected</option>
          <option value="APPLIED">Applied to Bank</option>
          <option value="APPROVED">Approved</option>
          <option value="DISBURSED">Disbursed</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Loan Requirement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Assigned On</th>
                <th className="py-3 px-4 text-right">Quick Dial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading your assigned leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link
                        href={`/staff/leads/${lead.id}`}
                        className="hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        {lead.name}
                        <ArrowRight className="w-3 h-3 text-slate-300" />
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
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleOpenCall(lead, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Call Modal */}
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
                    <ThumbsUp className="w-3.5 h-3.5" /> Interested
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
                  placeholder="Notes from customer call..."
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
                  {submitting ? "Saving..." : "Save & Update Daily Target (+1)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
