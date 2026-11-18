"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Phone,
  Mail,
  User,
  BadgePercent,
  X,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BankAndSchemesPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addBankModalOpen, setAddBankModalOpen] = useState(false);
  const [addSchemeModalOpen, setAddSchemeModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  // Form states
  const [bankForm, setBankForm] = useState({
    name: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [schemeForm, setSchemeForm] = useState({
    name: "",
    loanType: "PERSONAL",
    minInterest: "10.5",
    maxInterest: "14.5",
    minAmount: "50000",
    maxAmount: "4000000",
    tenureMonths: "60",
    processingFee: "1.0",
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      const data = await res.json();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });

      if (res.ok) {
        setAddBankModalOpen(false);
        setBankForm({ name: "", contactPerson: "", contactPhone: "", contactEmail: "" });
        fetchBanks();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add bank");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankId: selectedBankId,
          ...schemeForm,
        }),
      });

      if (res.ok) {
        setAddSchemeModalOpen(false);
        setSchemeForm({
          name: "",
          loanType: "PERSONAL",
          minInterest: "10.5",
          maxInterest: "14.5",
          minAmount: "50000",
          maxAmount: "4000000",
          tenureMonths: "60",
          processingFee: "1.0",
        });
        fetchBanks();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add scheme");
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
            Bank & Loan Scheme Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage tie-ups with partner lending institutions and configure available loan products.
          </p>
        </div>

        <button
          onClick={() => setAddBankModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Partner Bank</span>
        </button>
      </div>

      {/* Banks List with Schemes */}
      <div className="space-y-6">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            {/* Bank Header Bar */}
            <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{bank.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {bank.contactPerson && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {bank.contactPerson}
                      </span>
                    )}
                    {bank.contactPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {bank.contactPhone}
                      </span>
                    )}
                    {bank.contactEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {bank.contactEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBankId(bank.id);
                  setAddSchemeModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-indigo-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Loan Scheme</span>
              </button>
            </div>

            {/* Schemes Grid */}
            <div className="p-5">
              {bank.schemes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No loan schemes added for this bank yet. Click "Add Loan Scheme" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {bank.schemes.map((scheme: any) => (
                    <div
                      key={scheme.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{scheme.name}</h4>
                        <span className="shrink-0 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {scheme.loanType}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Interest Rate:</span>
                          <span className="font-semibold text-emerald-600">
                            {scheme.minInterest}% - {scheme.maxInterest}% p.a.
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Loan Amount:</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(scheme.minAmount)} - {formatCurrency(scheme.maxAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Tenure:</span>
                          <span className="font-semibold text-slate-900">
                            {scheme.tenureMonths} months ({Math.round(scheme.tenureMonths / 12)} yrs)
                          </span>
                        </div>
                        {scheme.processingFee && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Processing Fee:</span>
                            <span className="font-semibold text-slate-900">
                              {scheme.processingFee}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Bank Modal */}
      {addBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Partner Lending Institution</h3>
              <button
                onClick={() => setAddBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axis Bank Ltd."
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Officer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rakesh Sharma (Relationship Manager)"
                  value={bankForm.contactPerson}
                  onChange={(e) => setBankForm({ ...bankForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={bankForm.contactPhone}
                    onChange={(e) => setBankForm({ ...bankForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="loans@bank.com"
                    value={bankForm.contactEmail}
                    onChange={(e) => setBankForm({ ...bankForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddBankModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Loan Scheme Modal */}
      {addSchemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Loan Scheme</h3>
              <button
                onClick={() => setAddSchemeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Loan Privilege"
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loan Category</label>
                <select
                  value={schemeForm.loanType}
                  onChange={(e) => setSchemeForm({ ...schemeForm, loanType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="HOME">Home Loan</option>
                  <option value="BUSINESS">Business Loan</option>
                  <option value="VEHICLE">Vehicle Loan</option>
                  <option value="EDUCATION">Education Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Interest Rate (%) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={schemeForm.minInterest}
                    onChange={(e) => setSchemeForm({ ...schemeForm, minInterest: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Interest Rate (%) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={schemeForm.maxInterest}
                    onChange={(e) => setSchemeForm({ ...schemeForm, maxInterest: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Amount (INR)</label>
                  <input
                    type="number"
                    value={schemeForm.minAmount}
                    onChange={(e) => setSchemeForm({ ...schemeForm, minAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Amount (INR)</label>
                  <input
                    type="number"
                    value={schemeForm.maxAmount}
                    onChange={(e) => setSchemeForm({ ...schemeForm, maxAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Tenure (Months)</label>
                  <input
                    type="number"
                    value={schemeForm.tenureMonths}
                    onChange={(e) => setSchemeForm({ ...schemeForm, tenureMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={schemeForm.processingFee}
                    onChange={(e) => setSchemeForm({ ...schemeForm, processingFee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddSchemeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
