"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  Phone,
  MapPin,
  Upload,
  X,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import Papa from "papaparse";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MobileLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    loanAmount: "",
    assignedToId: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setNewLead({ name: "", phone: "", email: "", city: "", loanAmount: "", assignedToId: "" });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvPreview(results.data);
      },
    });
  };

  const handleBulkUpload = async () => {
    if (csvPreview.length === 0) return;
    setUploading(true);

    try {
      const res = await fetch("/api/leads/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: csvPreview }),
      });

      if (res.ok) {
        setBulkModalOpen(false);
        setCsvPreview([]);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Quick Add */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Leads ({leads.length})</h1>
          <p className="text-[11px] text-slate-500">Customer leads database</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="p-2 border border-slate-300 bg-white rounded-lg text-slate-700"
            title="CSV Upload"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {["", "NEW", "CONTACTED", "INTERESTED", "DOCS_COLLECTED", "APPLIED", "APPROVED", "DISBURSED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === s
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {s ? s : "All"}
          </button>
        ))}
      </div>

      {/* Mobile Leads Card List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No leads found.</div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{lead.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    <span className="font-mono">{lead.phone}</span>
                    {lead.city && <span>• {lead.city}</span>}
                  </div>
                </div>
                <StatusBadge status={lead.status} />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400">Requirement: </span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(lead.loanAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Agent: </span>
                  <span className="font-semibold text-indigo-700">
                    {lead.assignedTo?.name || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Lead Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Add Lead</h3>
              <button onClick={() => setAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={newLead.city}
                  onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Loan Amount</label>
                <input
                  type="number"
                  value={newLead.loanAmount}
                  onChange={(e) => setNewLead({ ...newLead, loanAmount: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Assign to Agent</label>
                <select
                  value={newLead.assignedToId}
                  onChange={(e) => setNewLead({ ...newLead, assignedToId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="">Leave Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Bulk CSV Upload</h3>
              <button onClick={() => setBulkModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer bg-slate-50"
              >
                <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                <span className="font-semibold text-slate-700 block">Select CSV file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {csvPreview.length > 0 && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded font-medium text-center">
                  Ready to upload {csvPreview.length} leads
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={csvPreview.length === 0 || uploading}
                  onClick={handleBulkUpload}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {uploading ? "Importing..." : "Upload Leads"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
