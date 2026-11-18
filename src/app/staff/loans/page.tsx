"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgePercent,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  PhoneCall,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StaffLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/loans");
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
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
          Loan Application Tracking & Bank Follow-Ups
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Coordinate with partner banks on underwriting, sanction letters, and disbursements for your customers.
        </p>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading loan applications...
          </div>
        ) : loans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No loan applications submitted yet.
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-mono text-[11px] font-semibold text-indigo-700 block">
                      {loan.bankRefNumber || `#APP-${loan.id}`}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                      {loan.lead?.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      loan.status === "DISBURSED"
                        ? "bg-teal-50 text-teal-700 border-teal-200"
                        : loan.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lender:</span>
                    <span className="font-semibold text-slate-800">{loan.scheme?.bank?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheme:</span>
                    <span className="font-medium text-slate-700">{loan.scheme?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applied Amount:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(loan.appliedAmount)}
                    </span>
                  </div>
                  {loan.approvedAmount && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Approved Amount:</span>
                      <span>{formatCurrency(loan.approvedAmount)}</span>
                    </div>
                  )}
                </div>

                {loan.adminRemarks && (
                  <p className="text-[11px] text-slate-600 bg-indigo-50/50 p-2 rounded border border-indigo-100 mb-2">
                    Note: {loan.adminRemarks}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Applied: {formatDate(loan.appliedAt)}
                </span>
                <Link
                  href={`/staff/leads/${loan.leadId}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Lead File</span>
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
