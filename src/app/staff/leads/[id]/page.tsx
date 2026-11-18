"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  PhoneCall,
  FileCheck,
  Building2,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  BadgePercent,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Upload,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function StaffLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calls" | "docs" | "apply">("calls");

  // Call form state
  const [callStatus, setCallStatus] = useState("CONNECTED");
  const [callRemarks, setCallRemarks] = useState("");
  const [isInterested, setIsInterested] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");
  const [submittingCall, setSubmittingCall] = useState(false);

  // Document upload state
  const [docType, setDocType] = useState("AADHAAR");
  const [docFileName, setDocFileName] = useState("");
  const [submittingDoc, setSubmittingDoc] = useState(false);

  // Loan application state
  const [selectedSchemeId, setSelectedSchemeId] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchBanks();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        setApplyAmount((data.loanAmount || 500000).toString());
      } else {
        router.push("/staff/leads");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      const data = await res.json();
      setBanks(Array.isArray(data) ? data : []);
      if (data.length > 0 && data[0].schemes?.length > 0) {
        setSelectedSchemeId(data[0].schemes[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCall(true);

    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: parseInt(leadId),
          callStatus,
          remarks: callRemarks,
          interested: isInterested,
          followUpDate: followUpDate || null,
        }),
      });

      if (res.ok) {
        setCallRemarks("");
        setFollowUpDate("");
        fetchLead();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to log call");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingCall(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName) return;
    setSubmittingDoc(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: parseInt(leadId),
          docType,
          fileName: docFileName,
          fileUrl: `/sample-docs/${docFileName}`,
        }),
      });

      if (res.ok) {
        setDocFileName("");
        fetchLead();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload document");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId || !applyAmount) return;
    setSubmittingApp(true);

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: parseInt(leadId),
          schemeId: parseInt(selectedSchemeId),
          appliedAmount: parseFloat(applyAmount),
        }),
      });

      if (res.ok) {
        fetchLead();
        alert("Loan application forwarded to partner bank successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit loan application");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and Lead Header */}
      <div>
        <Link
          href="/staff/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Leads
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                <StatusBadge status={lead.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <a
                  href={`tel:${lead.phone}`}
                  className="font-mono font-bold text-indigo-600 flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> {lead.phone}
                </a>
                {lead.email && <span>{lead.email}</span>}
                {lead.city && <span>Location: {lead.city}</span>}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-right md:text-right shrink-0">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Loan Requirement
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(lead.loanAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("calls")}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "calls"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Interaction & History ({lead.callLogs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "docs"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Customer Documents ({lead.documents?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("apply")}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "apply"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Applications ({lead.applications?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Call Interaction & History */}
      {activeTab === "calls" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form to Log Call */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-600" /> Log Call with Customer
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording this call will automatically increment your daily 100-call target.
            </p>

            <form onSubmit={handleLogCall} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Call Status *</label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CONNECTED">Connected / Spoke with Customer</option>
                  <option value="NO_ANSWER">Ringing / No Answer</option>
                  <option value="BUSY">Line Busy</option>
                  <option value="CALLBACK">Customer Requested Call Back</option>
                  <option value="WRONG_NUMBER">Wrong Number / Invalid</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interest Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInterested(true)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      isInterested
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Interested in Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInterested(false)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      !isInterested
                        ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Not Interested
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Schedule Follow-Up Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Call Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Customer interested in 15 Lakh personal loan for home renovation. Ready to provide salary slips."
                  value={callRemarks}
                  onChange={(e) => setCallRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCall}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingCall ? "Saving..." : "Save Call Log (+1 Target)"}
              </button>
            </form>
          </div>

          {/* Past Call History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Call Activity History</h3>

            <div className="space-y-3">
              {lead.callLogs?.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No calls logged for this customer yet.
                </div>
              ) : (
                lead.callLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 font-mono">
                        {log.callStatus}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(log.calledAt)}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.remarks}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Agent: {log.user?.name}</span>
                      {log.interested ? (
                        <span className="text-emerald-700 font-semibold">Interested</span>
                      ) : (
                        <span className="text-slate-500">Not Interested</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Documents */}
      {activeTab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" /> Collect & Upload Customer Document
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload KYC documents received from the customer for verification.
            </p>

            <form onSubmit={handleUploadDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Type *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AADHAAR">Aadhaar Card (UIDAI Proof)</option>
                  <option value="PAN">PAN Card (Tax Identity)</option>
                  <option value="SALARY_SLIP">Salary Slips (Last 3 Months)</option>
                  <option value="BANK_STATEMENT">Bank Statement (Last 6 Months)</option>
                  <option value="FORM_16">Form 16 / ITR</option>
                  <option value="OTHER">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pan_card_sunil.pdf"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingDoc}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingDoc ? "Uploading..." : "Save Document & Mark Docs Collected"}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Verification Status</h3>

            <div className="space-y-3">
              {lead.documents?.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No documents collected yet. Upload customer KYC above.
                </div>
              ) : (
                lead.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.fileName}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          doc.status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {doc.status === "VERIFIED" && <CheckCircle className="w-3 h-3" />}
                        {doc.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {doc.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Type: <strong>{doc.docType}</strong></span>
                      <span>Uploaded: {formatDateTime(doc.uploadedAt)}</span>
                    </div>

                    {doc.remarks && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        Admin Note: {doc.remarks}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bank Applications */}
      {activeTab === "apply" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Loan Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Apply to Partner Bank
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit loan proposal to lending partner based on customer requirements.
            </p>

            <form onSubmit={handleSubmitApplication} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Partner Bank & Loan Scheme *
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {banks.map((b) => (
                    <optgroup key={b.id} label={b.name}>
                      {b.schemes?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {b.name} — {s.name} ({s.minInterest}% - {s.maxInterest}%)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Loan Amount to Apply (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingApp}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingApp ? "Submitting..." : "Submit to Bank & Mark Applied"}
              </button>
            </form>
          </div>

          {/* Applications Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Bank Application Tracking</h3>

            <div className="space-y-3">
              {lead.applications?.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No bank applications submitted yet.
                </div>
              ) : (
                lead.applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {app.scheme?.bank?.name}
                        </div>
                        <div className="text-slate-500 text-[11px]">{app.scheme?.name}</div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          app.status === "DISBURSED"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : app.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Applied Amount:</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(app.appliedAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Approved Amount:</span>
                        <span className="font-bold text-emerald-700">
                          {app.approvedAmount ? formatCurrency(app.approvedAmount) : "Pending"}
                        </span>
                      </div>
                    </div>

                    {app.bankRefNumber && (
                      <div className="text-[11px] font-mono text-slate-500">
                        Ref No: {app.bankRefNumber}
                      </div>
                    )}
                    {app.adminRemarks && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                        Bank Note: {app.adminRemarks}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
