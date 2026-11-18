"use client";

import React, { useEffect, useState } from "react";
import {
  Share2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MobileDistributionPage() {
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

  const handleToggleSelect = (id: number) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleManualAssign = async () => {
    if (selectedLeadIds.length === 0 || !targetEmployeeId) return;
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
        setMessage(data.message || "Assigned leads!");
        setSelectedLeadIds([]);
        setTargetEmployeeId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDistributing(false);
    }
  };

  const handleRoundRobin = async () => {
    if (unassignedLeads.length === 0) return;
    setDistributing(true);

    try {
      const res = await fetch("/api/leads/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "round_robin" }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Distributed leads!");
        setSelectedLeadIds([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900">Lead Distribution</h1>
        <p className="text-[11px] text-slate-500">
          Assign unassigned leads to employees for target calling.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Auto Distribute Banner */}
      <button
        onClick={handleRoundRobin}
        disabled={unassignedLeads.length === 0 || distributing}
        className="w-full p-3.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>One-Tap Round-Robin Distribute All ({unassignedLeads.length})</span>
      </button>

      {/* Manual Selection Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs space-y-2 text-xs">
          <div className="font-semibold text-indigo-700">
            {selectedLeadIds.length} leads selected
          </div>
          <div className="flex gap-2">
            <select
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              className="flex-1 p-2 border rounded-lg bg-white text-xs"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.assignedLeadsCount} leads)
                </option>
              ))}
            </select>
            <button
              onClick={handleManualAssign}
              disabled={!targetEmployeeId || distributing}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Unassigned Leads Card List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 flex justify-between items-center">
          <span>Unassigned Pool ({unassignedLeads.length})</span>
          <button
            onClick={() => {
              if (selectedLeadIds.length === unassignedLeads.length) {
                setSelectedLeadIds([]);
              } else {
                setSelectedLeadIds(unassignedLeads.map((l) => l.id));
              }
            }}
            className="text-[11px] text-indigo-600 font-semibold"
          >
            {selectedLeadIds.length === unassignedLeads.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading...</div>
        ) : unassignedLeads.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-bold text-slate-700">All leads are assigned!</p>
          </div>
        ) : (
          unassignedLeads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => handleToggleSelect(lead.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center gap-3 ${
                  isSelected ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(lead.id)}
                  className="rounded text-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{lead.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{lead.phone} • {lead.city || "India"}</div>
                </div>
                <div className="font-bold text-slate-800 text-[11px]">
                  {formatCurrency(lead.loanAmount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
