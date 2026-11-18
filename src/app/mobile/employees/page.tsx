"use client";

import React, { useEffect, useState } from "react";
import { UserCheck, Plus, Phone, Target, X } from "lucide-react";

export default function MobileEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [newTarget, setNewTarget] = useState("100");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEmp.id,
          targetCalls: parseInt(newTarget),
        }),
      });

      if (res.ok) {
        setTargetModalOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Employees ({employees.length})</h1>
        <p className="text-[11px] text-slate-500">Call agents & daily quotas</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading...</div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                  <div className="text-[11px] text-slate-500 font-mono">{emp.phone || emp.email}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmp(emp);
                    setNewTarget(emp.todayTarget.toString());
                    setTargetModalOpen(true);
                  }}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[11px] font-semibold"
                >
                  Target: {emp.todayTarget}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Calls: {emp.todayCompleted} / {emp.todayTarget}</span>
                  <span className="font-semibold text-indigo-600">{emp.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      emp.progressPercent >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${emp.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-1 border-t text-[11px] text-slate-500">
                <span>Leads: {emp.assignedLeadsCount}</span>
                <span className="text-emerald-600 font-medium">{emp.todayInterested} interested</span>
                <span>Loans: {emp.applicationsCount}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {targetModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Edit Target for {selectedEmp.name}</h3>
              <button onClick={() => setTargetModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateTarget} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Daily Target (calls)</label>
                <input
                  type="number"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-2 border rounded-lg text-lg font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setTargetModalOpen(false)}
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
