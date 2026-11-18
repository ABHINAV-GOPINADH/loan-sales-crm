"use client";

import React, { useEffect, useState } from "react";
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Edit2,
  TrendingUp,
  X,
  Target,
} from "lucide-react";

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [newTarget, setNewTarget] = useState("100");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setFormData({ name: "", email: "", phone: "", password: "" });
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create employee");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (emp: any) => {
    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: emp.id,
          isActive: !emp.isActive,
        }),
      });

      if (res.ok) {
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Employee Management & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage call centre employees, configure daily targets (default: 100 calls), and track productivity.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
              emp.isActive ? "border-slate-200/80" : "border-slate-200 bg-slate-50/50 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                  {emp.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Call Centre Agent
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleToggleActive(emp)}
                title={emp.isActive ? "Deactivate employee" : "Activate employee"}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  emp.isActive
                    ? "bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700"
                    : "bg-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {emp.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{emp.phone || "Not configured"}</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Daily Target</span>
                <button
                  onClick={() => {
                    setSelectedEmp(emp);
                    setNewTarget(emp.todayTarget.toString());
                    setTargetModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit Target
                </button>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>{emp.todayCompleted} completed</span>
                <span>{emp.todayTarget} calls target</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    emp.progressPercent >= 100
                      ? "bg-emerald-500"
                      : emp.progressPercent >= 70
                      ? "bg-indigo-600"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${emp.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-slate-400 text-[10px] uppercase">Assigned</div>
                <div className="font-bold text-slate-800 text-sm">{emp.assignedLeadsCount}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase">Interested</div>
                <div className="font-bold text-emerald-600 text-sm">{emp.todayInterested}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase">Loans</div>
                <div className="font-bold text-indigo-600 text-sm">{emp.applicationsCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Staff Member</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="name@cloudhouse.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Target Modal */}
      {targetModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Adjust Call Target</h3>
              </div>
              <button
                onClick={() => setTargetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTarget} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Set daily call target for <strong>{selectedEmp.name}</strong>. Default company benchmark is 100 calls/day.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Calls per Day</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base font-bold font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
