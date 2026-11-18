"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Eye,
  Search,
  Filter,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function DocumentVerificationPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [verifyStatus, setVerifyStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/documents?status=${statusFilter}` : "/api/documents";
      const res = await fetch(url);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVerify = (doc: any, action: "VERIFIED" | "REJECTED") => {
    setSelectedDoc(doc);
    setVerifyStatus(action);
    setRemarks(action === "VERIFIED" ? "Document verified and approved" : "Document rejected: illegible or expired");
    setVerifyModalOpen(true);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verifyStatus,
          remarks,
        }),
      });

      if (res.ok) {
        setVerifyModalOpen(false);
        fetchDocuments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update document status");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Document Collection & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review KYC, identity, and income documents collected from interested loan applicants.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Verification Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="VERIFIED">Verified & Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Uploaded At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Remarks</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No documents found matching this filter.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{doc.lead?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{doc.lead?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[180px]">{doc.fileName}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(doc.uploadedAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {doc.remarks || "-"}
                      {doc.verifiedBy && (
                        <span className="text-[10px] text-slate-400 block">by {doc.verifiedBy}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {doc.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenVerify(doc, "VERIFIED")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleOpenVerify(doc, "REJECTED")}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenVerify(doc, doc.status === "VERIFIED" ? "REJECTED" : "VERIFIED")}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify / Reject Modal */}
      {verifyModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {verifyStatus === "VERIFIED" ? "Approve & Verify Document" : "Reject Document"}
                </h3>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-[11px]">Customer:</div>
                <div className="font-bold text-slate-900 text-sm">{selectedDoc.lead?.name}</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Document: <strong>{selectedDoc.docType}</strong> ({selectedDoc.fileName})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyStatus("VERIFIED")}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all ${
                      verifyStatus === "VERIFIED"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Mark Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyStatus("REJECTED")}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-all ${
                      verifyStatus === "REJECTED"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Mark Rejected
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verification Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Identity verified against UIDAI database"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                    verifyStatus === "VERIFIED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? "Saving..." : "Confirm Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
