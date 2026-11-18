"use client";

import React, { useEffect, useState } from "react";
import {
  BadgePercent,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  User,
  Edit,
  X,
  CreditCard,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LoanTrackingAndClosurePage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const [formState, setFormState] = useState({
    status: "APPROVED",
    approvedAmount: "",
    bankRefNumber: "",
    adminRemarks: "",
  });

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/loans?status=${statusFilter}` : "/api/loans";
      const res = await fetch(url);
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (loan: any) => {
    setSelectedLoan(loan);
    setFormState({
      status: loan.status === "SUBMITTED" ? "UNDER_REVIEW" : loan.status === "UNDER_REVIEW" ? "APPROVED" : loan.status === "APPROVED" ? "DISBURSED" : loan.status,
      approvedAmount: (loan.approvedAmount || loan.appliedAmount || "").toString(),
      bankRefNumber: loan.bankRefNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      adminRemarks: loan.adminRemarks || "",
    });
    setActionModalOpen(true);
  };

  const handleUpdateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      const res = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (res.ok) {
        setActionModalOpen(false);
        fetchLoans();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update loan status");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Loan Application Tracking & Closure
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track bank underwriting stages, sanction letters, disbursements, and final loan closures.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
        >
          <option value="">All Loan Stages</option>
          <option value="SUBMITTED">Submitted to Bank</option>
          <option value="UNDER_REVIEW">Under Credit Review</option>
          <option value="APPROVED">Sanctioned / Approved</option>
          <option value="DISBURSED">Funds Disbursed</option>
          <option value="REJECTED">Declined by Bank</option>
          <option value="CLOSED">File Closed</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Bank & Scheme</th>
                <th className="py-3 px-4">Applied Amount</th>
                <th className="py-3 px-4">Approved Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading loan applications...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No loan applications found matching this status filter.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">
                      {loan.bankRefNumber || `#${loan.id}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{loan.lead?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{loan.lead?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{loan.scheme?.bank?.name}</div>
                      <div className="text-[11px] text-slate-500">{loan.scheme?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {formatCurrency(loan.appliedAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {loan.approvedAmount ? formatCurrency(loan.approvedAmount) : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          loan.status === "DISBURSED"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : loan.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : loan.status === "UNDER_REVIEW"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : loan.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {loan.handledBy?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(loan.appliedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenAction(loan)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Loan Modal */}
      {actionModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Update Loan Stage & Closure
              </h3>
              <button
                onClick={() => setActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLoan} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{selectedLoan.lead?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Scheme:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLoan.scheme?.bank?.name} — {selectedLoan.scheme?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Amount:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedLoan.appliedAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="SUBMITTED">Submitted to Bank</option>
                  <option value="UNDER_REVIEW">Under Review / Credit Checks</option>
                  <option value="APPROVED">Approved / Sanctioned</option>
                  <option value="DISBURSED">Disbursed (Loan Active)</option>
                  <option value="REJECTED">Declined / Rejected</option>
                  <option value="CLOSED">Closed / Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sanctioned / Approved Amount (INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1400000"
                  value={formState.approvedAmount}
                  onChange={(e) => setFormState({ ...formState, approvedAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Reference / File No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC-LON-99214"
                  value={formState.bankRefNumber}
                  onChange={(e) => setFormState({ ...formState, bankRefNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Closure Remarks / Underwriter Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sanction letter issued by credit team, loan disbursed into account ending 4012"
                  value={formState.adminRemarks}
                  onChange={(e) => setFormState({ ...formState, adminRemarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
