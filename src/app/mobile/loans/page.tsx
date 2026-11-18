"use client";

import React, { useEffect, useState } from "react";
import {
  BadgePercent,
  CheckCircle,
  XCircle,
  Building2,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MobileLoansPage() {
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
      status: loan.status === "APPROVED" ? "DISBURSED" : "APPROVED",
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Loan Applications</h1>
          <p className="text-[11px] text-slate-500">Track and approve bank loan files</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-1.5 border rounded-lg bg-white"
        >
          <option value="">All Stages</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="DISBURSED">Disbursed</option>
        </select>
      </div>

      {/* Loans Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No applications found.</div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{loan.lead?.name}</h3>
                  <div className="text-[11px] text-slate-500">
                    {loan.scheme?.bank?.name} • {loan.scheme?.name}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    loan.status === "DISBURSED"
                      ? "bg-teal-50 text-teal-700"
                      : loan.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {loan.status}
                </span>
              </div>

              <div className="flex justify-between text-[11px] bg-slate-50 p-2 rounded">
                <span>Applied: <strong>{formatCurrency(loan.appliedAmount)}</strong></span>
                <span className="text-emerald-700">
                  Approved: <strong>{loan.approvedAmount ? formatCurrency(loan.approvedAmount) : "-"}</strong>
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t text-[11px]">
                <span className="text-slate-400">Agent: {loan.handledBy?.name}</span>
                <button
                  onClick={() => handleOpenAction(loan)}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded text-[11px]"
                >
                  Update Stage
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Modal */}
      {actionModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Update Loan Stage</h3>
              <button onClick={() => setActionModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateLoan} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="SUBMITTED">Submitted to Bank</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved / Sanctioned</option>
                  <option value="DISBURSED">Funds Disbursed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Approved Amount</label>
                <input
                  type="number"
                  value={formState.approvedAmount}
                  onChange={(e) => setFormState({ ...formState, approvedAmount: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Bank Reference No.</label>
                <input
                  type="text"
                  value={formState.bankRefNumber}
                  onChange={(e) => setFormState({ ...formState, bankRefNumber: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={formState.adminRemarks}
                  onChange={(e) => setFormState({ ...formState, adminRemarks: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
