"use client";

import React, { useEffect, useState } from "react";
import {
  Share2,
  Users,
  CheckCircle2,
  RefreshCw,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LeadDistributionPage() {
  const [unassignedLeads, setUnassignedLeads] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, empRes] = await Promise.all([
        fetch("/api/leads?unassigned=true"),
        fetch("/api/employees"),
      ]);
      const leads = await leadsRes.json();
      const emps = await empRes.json();
      setUnassignedLeads(Array.isArray(leads) ? leads : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(unassignedLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleManualAssign = async () => {
    if (selectedLeadIds.length === 0 || !targetEmployeeId) {
      alert("Please select at least one lead and choose an employee.");
      return;
    }

    setDistributing(true);
    setMessage("");

    try {
      const res = await fetch("/api/leads/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "manual",
          leadIds: selectedLeadIds,
          employeeId: targetEmployeeId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Assigned leads successfully!");
        setSelectedLeadIds([]);
        setTargetEmployeeId("");
        fetchData();
      } else {
        alert(data.error || "Failed to assign leads");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDistributing(false);
    }
  };

  const handleRoundRobinDistribute = async () => {
    if (unassignedLeads.length === 0) {
      alert("No unassigned leads available to distribute.");
      return;
    }

    if (!confirm(`Distribute all ${unassignedLeads.length} unassigned leads equally across all active staff employees?`)) {
      return;
    }

    setDistributing(true);
    setMessage("");

    try {
      const res = await fetch("/api/leads/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "round_robin",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Distributed leads successfully via round-robin!");
        setSelectedLeadIds([]);
        fetchData();
      } else {
        alert(data.error || "Failed to distribute leads");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lead Distribution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assign incoming leads to call centre employees for daily target calling.
          </p>
        </div>

        <button
          onClick={handleRoundRobinDistribute}
          disabled={unassignedLeads.length === 0 || distributing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Auto Round-Robin Distribute All</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-600 hover:text-emerald-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Staff Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-900">{emp.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-indigo-50 text-indigo-700 font-semibold">
                  Staff
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {emp.phone || "No phone"}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Active Leads:</span>
                <span className="font-semibold text-slate-900">{emp.assignedLeadsCount}</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Today's Target:</span>
                  <span className="font-semibold text-indigo-600">
                    {emp.todayCompleted} / {emp.todayTarget} calls
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${emp.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Assignment Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-mono">
            {selectedLeadIds.length}
          </span>
          <span>Leads Selected for Assignment</span>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={targetEmployeeId}
            onChange={(e) => setTargetEmployeeId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Target Employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.assignedLeadsCount} leads currently)
              </option>
            ))}
          </select>

          <button
            onClick={handleManualAssign}
            disabled={selectedLeadIds.length === 0 || !targetEmployeeId || distributing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Assign Selected</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Unassigned Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900">Unassigned Pool</h3>
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
              {unassignedLeads.length} leads waiting
            </span>
          </div>
          <button
            onClick={fetchData}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      unassignedLeads.length > 0 &&
                      selectedLeadIds.length === unassignedLeads.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Loan Requirement</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Uploaded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading unassigned leads...
                  </td>
                </tr>
              ) : unassignedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">All leads are currently assigned!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload new CSV leads to distribute among employees.
                    </p>
                  </td>
                </tr>
              ) : (
                unassignedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleToggleSelect(lead.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{lead.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{lead.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{lead.city || "-"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatCurrency(lead.loanAmount)}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                        {lead.source}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
