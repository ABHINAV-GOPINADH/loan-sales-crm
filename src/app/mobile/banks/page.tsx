"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MobileBanksPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBankModalOpen, setAddBankModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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
        body: JSON.stringify({ name, contactPerson, contactPhone }),
      });

      if (res.ok) {
        setAddBankModalOpen(false);
        setName("");
        setContactPerson("");
        setContactPhone("");
        fetchBanks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Partner Banks & Schemes</h1>
          <p className="text-[11px] text-slate-500">Lending institutions</p>
        </div>
        <button
          onClick={() => setAddBankModalOpen(true)}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bank</span>
        </button>
      </div>

      <div className="space-y-3">
        {banks.map((bank) => (
          <div key={bank.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{bank.name}</h3>
                <div className="text-[11px] text-slate-500">{bank.contactPerson || "Lending partner"}</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t">
              <span className="text-[10px] uppercase font-bold text-slate-400">Available Schemes:</span>
              {bank.schemes.map((s: any) => (
                <div key={s.id} className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">{s.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {formatCurrency(s.minAmount)} - {formatCurrency(s.maxAmount)}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold text-xs">{s.minInterest}% - {s.maxInterest}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {addBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Add Partner Bank</h3>
              <button onClick={() => setAddBankModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateBank} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAddBankModalOpen(false)}
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
